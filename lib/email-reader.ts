import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: {
    rejectUnauthorized: boolean;
  };
  // Add timeout configurations
  connTimeout?: number;
  authTimeout?: number;
  keepalive?: boolean;
}

// Email configuration - add these to your .env.local
const emailConfig: EmailConfig = {
  user: process.env.SUPPORT_EMAIL || 'support@thaitune.com',
  password: process.env.SUPPORT_EMAIL_PASSWORD || '',
  host: process.env.EMAIL_HOST || 'imap.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '993'),
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false
  },
  // Add timeout configurations
  connTimeout: 60000, // 60 seconds
  authTimeout: 60000, // 60 seconds
  keepalive: true
};

export const processEmailReplies = async () => {
  console.log('Email config:', {
    user: emailConfig.user,
    host: emailConfig.host,
    port: emailConfig.port,
    hasPassword: !!emailConfig.password,
    tls: emailConfig.tls
  });
  
  if (!emailConfig.password) {
    console.warn('Email password not configured');
    return [];
  }

  if (!emailConfig.user) {
    console.warn('Email user not configured');
    return [];
  }

  const imap = new Imap(emailConfig);

  return new Promise((resolve, reject) => {
    let connected = false;
    
    // Set a timeout for the entire operation
    const timeout = setTimeout(() => {
      if (!connected) {
        console.error('IMAP connection timeout - operation took too long');
        imap.destroy();
        reject(new Error('IMAP connection timeout'));
      }
    }, 120000); // 2 minutes total timeout

    imap.once('error', (err: any) => {
      console.error('IMAP connection error:', err);
      clearTimeout(timeout);
      
      // Provide more specific error messages
      if (err.source === 'timeout-auth') {
        console.error('Authentication timeout - check your email password and Gmail App Password settings');
      } else if (err.source === 'authentication') {
        console.error('Authentication failed - verify your email and password/App Password');
      } else if (err.source === 'timeout') {
        console.error('Connection timeout - check your network and firewall settings');
      }
      
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
      clearTimeout(timeout);
    });

    imap.once('ready', () => {
      connected = true;
      clearTimeout(timeout);
      console.log('IMAP connection ready');
      imap.openBox('INBOX', false, (err: any, box: any) => {
        if (err) {
          console.error('Error opening INBOX:', err);
          reject(err);
          return;
        }

        console.log('INBOX opened successfully, total messages:', box.messages.total);
        console.log('INBOX permissions:', { readOnly: box.readOnly, permFlags: box.permFlags });

        // Search for unread emails
        imap.search(['UNSEEN'], (err: any, results: any) => {
          if (err) {
            console.error('Error searching for unread emails:', err);
            reject(err);
            return;
          }

          console.log('Found', results.length, 'unread emails');
          console.log('Unread email UIDs:', results);
          if (results.length === 0) {
            console.log('No new emails found');
            imap.end();
            resolve([]);
            return;
          }

          const fetch = imap.fetch(results, { bodies: '', struct: true });
          let processedCount = 0;
          const totalEmails = results.length;
          const processedEmails = new Map(); // Track processed emails by UID
          
          // Safety timeout to prevent hanging
          const processTimeout = setTimeout(() => {
            console.warn('Email processing timeout - some emails may not have been marked as read');
            imap.end();
            resolve(results);
          }, 300000); // 5 minutes timeout
          
          fetch.on('message', (msg: any, seqno: any) => {
            let body = '';
            let uid: any = null;
            
            msg.on('body', (stream: any, info: any) => {
              stream.on('data', (chunk: any) => {
                body += chunk.toString('utf8');
              });
            });

            msg.once('attributes', (attrs: any) => {
              uid = attrs.uid;
              console.log(`Email ${seqno} has UID: ${uid}`);
            });

            msg.once('end', async () => {
              try {
                console.log(`Processing email ${seqno} (UID: ${uid})...`);
                const parsed = await simpleParser(body);
                await handleEmailReply(parsed);
                console.log(`Successfully processed email ${seqno} (UID: ${uid})`);
                
                // Mark as read using UID instead of sequence number
                if (uid) {
                  // Try setFlags first (more reliable), then addFlags as fallback
                  imap.setFlags(uid, ['\\Seen'], (err: any) => {
                    if (err) {
                      console.warn(`setFlags failed for UID ${uid}, trying addFlags:`, err);
                      // Fallback to addFlags
                      imap.addFlags(uid, ['\\Seen'], (err2: any) => {
                        if (err2) {
                          console.error(`Both setFlags and addFlags failed for UID ${uid}:`, err2);
                        } else {
                          console.log(`Successfully marked email UID ${uid} as read using addFlags`);
                        }
                      });
                    } else {
                      console.log(`Successfully marked email UID ${uid} as read using setFlags`);
                    }
                    
                    // Increment processed count
                    processedCount++;
                    processedEmails.set(uid, true);
                    console.log(`Processed ${processedCount}/${totalEmails} emails`);
                    
                    // Close connection only after all emails are processed
                    if (processedCount === totalEmails) {
                      console.log('All emails processed, closing IMAP connection');
                      clearTimeout(processTimeout);
                      imap.end();
                      resolve(results);
                    }
                  });
                } else {
                  console.warn(`No UID found for email ${seqno}, skipping mark as read`);
                  processedCount++;
                  if (processedCount === totalEmails) {
                    console.log('All emails processed, closing IMAP connection');
                    clearTimeout(processTimeout);
                    imap.end();
                    resolve(results);
                  }
                }
              } catch (error) {
                console.error(`Error processing email ${seqno} (UID: ${uid}):`, error);
                
                // Mark as read even if processing failed to avoid reprocessing
                if (uid) {
                  // Try setFlags first, then addFlags as fallback
                  imap.setFlags(uid, ['\\Seen'], (err: any) => {
                    if (err) {
                      console.warn(`setFlags failed for failed email UID ${uid}, trying addFlags:`, err);
                      // Fallback to addFlags
                      imap.addFlags(uid, ['\\Seen'], (err2: any) => {
                        if (err2) {
                          console.error(`Both setFlags and addFlags failed for failed email UID ${uid}:`, err2);
                        } else {
                          console.log(`Marked failed email UID ${uid} as read using addFlags`);
                        }
                      });
                    } else {
                      console.log(`Marked failed email UID ${uid} as read using setFlags`);
                    }
                    
                    // Still increment count even if processing failed
                    processedCount++;
                    processedEmails.set(uid, true);
                    console.log(`Processed ${processedCount}/${totalEmails} emails (with error)`);
                    
                    if (processedCount === totalEmails) {
                      console.log('All emails processed, closing IMAP connection');
                      clearTimeout(processTimeout);
                      imap.end();
                      resolve(results);
                    }
                  });
                } else {
                  console.warn(`No UID found for failed email ${seqno}, skipping mark as read`);
                  processedCount++;
                  if (processedCount === totalEmails) {
                    console.log('All emails processed, closing IMAP connection');
                    clearTimeout(processTimeout);
                    imap.end();
                    resolve(results);
                  }
                }
              }
            });
          });

          fetch.once('end', () => {
            console.log('Fetch completed, waiting for email processing to finish...');
            // Don't close connection here - wait for all emails to be processed
          });
        });
      });
    });

    console.log('Attempting to connect to IMAP...');
    imap.connect();
  });
};

// Function to extract only the user's reply from the email, excluding quoted content
const extractUserReply = (emailText: string): string => {
  if (!emailText) return '';
  
  const lines = emailText.split('\n');
  const replyLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Stop if we hit quoted content indicators
    if (
      trimmedLine.startsWith('>') ||
      trimmedLine.startsWith('On ') && trimmedLine.includes(' wrote:') ||
      trimmedLine.startsWith('-----Original Message-----') ||
      trimmedLine.startsWith('From:') ||
      trimmedLine.startsWith('Sent:') ||
      trimmedLine.startsWith('Subject:') ||
      trimmedLine.startsWith('To:') ||
      trimmedLine.includes('ThaiTune Support') ||
      trimmedLine.includes('Response to your support ticket')
    ) {
      break;
    }
    
    replyLines.push(line);
  }
  
  return replyLines.join('\n').trim();
};

const handleEmailReply = async (email: any) => {
  const from = email.from?.text || '';
  const subject = email.subject || '';
  const text = email.text || '';
  const html = email.html || '';
  const messageId = email.messageId || email.headers?.['message-id'] || '';

  console.log('Processing email:', { from, subject, messageId });

  // Extract ticket ID from subject line
  const ticketMatch = subject.match(/\[([A-Z]{2}-\d{6}-[A-Z0-9]{6})\]/);
  
  if (!ticketMatch) {
    console.log('No ticket ID found in subject:', subject);
    return;
  }

  const ticketId = ticketMatch[1];
  console.log('Processing reply for ticket:', ticketId);

  // Check if this email has already been processed
  if (messageId) {
    const messagesRef = collection(db, 'support_tickets');
    const existingQuery = query(messagesRef, where('ticketId', '==', ticketId));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      const ticketDocId = existingSnapshot.docs[0].id;
      const conversationRef = collection(db, 'support_tickets', ticketDocId, 'messages');
      const messageQuery = query(conversationRef, where('messageId', '==', messageId));
      const messageSnapshot = await getDocs(messageQuery);
      
      if (!messageSnapshot.empty) {
        console.log('Email already processed (messageId exists):', messageId);
        return;
      }
    }
  }

  try {
    // Find the ticket
    const ticketsRef = collection(db, 'support_tickets');
    const q = query(ticketsRef, where('ticketId', '==', ticketId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('Ticket not found:', ticketId);
      return;
    }

    const ticketDoc = querySnapshot.docs[0];

    // Add the reply to the conversation
    const conversationRef = collection(db, 'support_tickets', ticketDoc.id, 'messages');
    
    // Parse sender name and email more safely
    const emailMatch = from.match(/<(.+?)>/);
    const senderEmail = emailMatch ? emailMatch[1] : from;
    const senderName = emailMatch ? from.split('<')[0].trim().replace(/"/g, '') : from;
    
    // Extract only the user's reply, excluding quoted content
    const userReply = extractUserReply(text || html || '');
    
    await addDoc(conversationRef, {
      message: userReply || 'No message content',
      senderName: senderName || 'Unknown',
      senderEmail: senderEmail || 'unknown@unknown.com',
      isAdmin: false,
      messageId: messageId || `fallback-${Date.now()}`,
      createdAt: serverTimestamp()
    });

    // Update ticket status
    await updateDoc(doc(db, 'support_tickets', ticketDoc.id), {
      status: 'awaiting_response',
      lastReply: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Successfully processed email reply for ticket:', ticketId);
  } catch (error) {
    console.error('Error processing email reply:', error);
  }
};

// Function to send emails (simple SMTP)
export const sendEmail = async (to: string, subject: string, html: string) => {
  // You can use nodemailer or any SMTP service here
  console.log('Send email to:', to, 'Subject:', subject);
  // Implementation depends on your email provider
}; 