import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Email service configuration (we'll use Resend)
const RESEND_API_KEY = process.env.RESEND_API_KEY
const SUPPORT_EMAIL = 'support@thaitune.com'

// Generate unique ticket ID
function generateTicketId(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TT-${timestamp}-${random}`
}

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

// Email templates
function getConfirmationEmailTemplate(ticketId: string, name: string, issueTitle: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4A1D2C, #6A2D3C); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4A1D2C; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #4A1D2C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎵 ThaiTune Support</h1>
                <p>Your issue has been received</p>
            </div>
            <div class="content">
                <h2>Hello ${name},</h2>
                <p>Thank you for reporting an issue with ThaiTune. We have received your report and created a support ticket for you.</p>
                
                <div class="ticket-info">
                    <h3>Ticket Details</h3>
                    <p><strong>Ticket ID:</strong> ${ticketId}</p>
                    <p><strong>Issue:</strong> ${issueTitle}</p>
                    <p><strong>Status:</strong> Open</p>
                </div>

                <p>Our support team will review your report and respond within 24-48 hours. You can reply directly to this email to add more information to your ticket.</p>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Our team will investigate the issue</li>
                    <li>You'll receive updates via email</li>
                    <li>Reply to this email to add more details</li>
                </ul>
                
                <div class="footer">
                    <p>Best regards,<br>ThaiTune Support Team</p>
                    <p>This is an automated message. Please do not reply to this email address directly.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}

function getNotificationEmailTemplate(ticketId: string, formData: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4A1D2C, #6A2D3C); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; }
            .field strong { color: #4A1D2C; }
            .priority-high { border-left: 4px solid #dc2626; }
            .priority-medium { border-left: 4px solid #f59e0b; }
            .priority-low { border-left: 4px solid #10b981; }
            .priority-critical { border-left: 4px solid #7c2d12; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎫 New Support Ticket</h1>
                <p>Ticket ID: ${ticketId}</p>
            </div>
            <div class="content">
                <div class="field priority-${formData.priority}">
                    <strong>Priority:</strong> ${formData.priority.toUpperCase()}
                </div>
                <div class="field">
                    <strong>Issue Type:</strong> ${formData.issueType}
                </div>
                <div class="field">
                    <strong>Reporter:</strong> ${formData.name} (${formData.email})
                </div>
                <div class="field">
                    <strong>Title:</strong> ${formData.title}
                </div>
                <div class="field">
                    <strong>Description:</strong><br>
                    ${formData.description.replace(/\n/g, '<br>')}
                </div>
                ${formData.steps ? `
                <div class="field">
                    <strong>Steps to Reproduce:</strong><br>
                    ${formData.steps.replace(/\n/g, '<br>')}
                </div>
                ` : ''}
                
                <p><strong>Reply to this email to respond to the user at ${formData.email}</strong></p>
            </div>
        </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.title || !formData.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate ticket ID
    const ticketId = generateTicketId()

    // Prepare ticket data
    const ticketData = {
      ticketId,
      ...formData,
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Store ticket in Firebase
    try {
      const docRef = await addDoc(collection(db, 'support_tickets'), ticketData)
      
      // Create initial conversation message
      const initialMessage = {
        message: `${formData.description}${formData.steps ? `\n\nSteps to reproduce:\n${formData.steps}` : ''}`,
        isAdmin: false,
        senderName: formData.name,
        senderEmail: formData.email,
        createdAt: serverTimestamp()
      }
      
      // Add initial message to conversation
      await addDoc(collection(db, 'support_tickets', docRef.id, 'messages'), initialMessage)
      
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save ticket' },
        { status: 500 }
      )
    }

    // Send confirmation email to user
    const confirmationResult = await sendEmail(
      formData.email,
      `[${ticketId}] Your ThaiTune support ticket has been created`,
      getConfirmationEmailTemplate(ticketId, formData.name, formData.title),
      SUPPORT_EMAIL
    )

    // Send notification email to support
    const notificationResult = await sendEmail(
      SUPPORT_EMAIL,
      `[${ticketId}] New support ticket - ${formData.title}`,
      getNotificationEmailTemplate(ticketId, formData),
      formData.email // Reply-to user's email
    )

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Ticket created successfully',
      emailStatus: {
        confirmation: confirmationResult.success,
        notification: notificationResult.success
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 