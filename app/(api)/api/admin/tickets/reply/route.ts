import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

// Email service configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY
const SUPPORT_EMAIL = 'support@thaitune.com'

// Send email using Resend
async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!RESEND_API_KEY) {
    console.log('Email would be sent:', { to, subject, html })
    return { success: true, message: 'Email simulation (no API key)' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: SUPPORT_EMAIL,
        to: [to],
        subject: subject,
        html: html,
        reply_to: replyTo || SUPPORT_EMAIL
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API error: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function getReplyEmailTemplate(ticketId: string, originalTitle: string, replyMessage: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4A1D2C, #6A2D3C); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .reply-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4A1D2C; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎵 ThaiTune Support</h1>
                <p>Response to your support ticket</p>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p>We have received your support ticket and one of our team members has responded to your issue.</p>
                
                <div class="reply-box">
                    <h3>Support Team Response:</h3>
                    <p style="white-space: pre-wrap;">${replyMessage}</p>
                </div>

                <p><strong>Ticket Details:</strong></p>
                <ul>
                    <li><strong>Ticket ID:</strong> ${ticketId}</li>
                    <li><strong>Subject:</strong> ${originalTitle}</li>
                </ul>
                
                <p>If you need further assistance, please reply to this email and we'll be happy to help.</p>
                
                <div class="footer">
                    <p>Best regards,<br>ThaiTune Support Team</p>
                    <p>You can reply directly to this email for further assistance.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const { ticketId, message } = await request.json()
    
    if (!ticketId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get the ticket details
    const ticketRef = doc(db, 'support_tickets', ticketId)
    const ticketDoc = await getDoc(ticketRef)
    
    if (!ticketDoc.exists()) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }
    
    const ticketData = ticketDoc.data()
    
    // Send reply email to user
    const emailResult = await sendEmail(
      ticketData.email,
      `Re: [${ticketData.ticketId}] ${ticketData.title}`,
      getReplyEmailTemplate(ticketData.ticketId, ticketData.title, message, ticketData.name),
      SUPPORT_EMAIL
    )
    
    // Update ticket with reply (you could also store replies in a separate collection)
    await updateDoc(ticketRef, {
      lastReply: message,
      lastReplyAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      emailStatus: emailResult.success
    })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
} 