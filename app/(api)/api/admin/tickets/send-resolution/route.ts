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

function getResolutionEmailTemplate(ticketId: string, userName: string, issueTitle: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4A1D2C, #6A2D3C); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .resolution-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .success-icon { background: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎵 ThaiTune Support</h1>
                <p>Your issue has been resolved</p>
            </div>
            <div class="content">
                <div class="success-icon">✓</div>
                <h2>Hello ${userName},</h2>
                <p>We're pleased to inform you that your support ticket has been resolved!</p>
                
                <div class="resolution-box">
                    <h3>✅ Issue Resolved</h3>
                    <p><strong>Ticket ID:</strong> ${ticketId}</p>
                    <p><strong>Issue:</strong> ${issueTitle}</p>
                    <p><strong>Status:</strong> Resolved</p>
                    <p><strong>Resolution Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <p>Our team has addressed your concern and the issue should now be resolved. If you continue to experience any problems or have additional questions, please don't hesitate to reach out to us.</p>
                
                <p><strong>What's next?</strong></p>
                <ul>
                    <li>The issue should be resolved on your end</li>
                    <li>You can contact us if you need further assistance</li>
                    <li>We appreciate your patience and feedback</li>
                </ul>

                <p>Thank you for using ThaiTune and for helping us improve our service!</p>
                
                <div class="footer">
                    <p>Best regards,<br>ThaiTune Support Team</p>
                    <p>If you need further assistance, please reply to this email or create a new support ticket.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json()
    
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Missing ticket ID' },
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
    
    // Send resolution email to user
    const emailResult = await sendEmail(
      ticketData.email,
      `[${ticketData.ticketId}] Issue Resolved - ${ticketData.title}`,
      getResolutionEmailTemplate(ticketData.ticketId, ticketData.name, ticketData.title),
      SUPPORT_EMAIL
    )
    
    // Update ticket with resolution timestamp
    await updateDoc(ticketRef, {
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Resolution email sent successfully',
      emailStatus: emailResult.success
    })
  } catch (error) {
    console.error('Error sending resolution email:', error)
    return NextResponse.json(
      { error: 'Failed to send resolution email' },
      { status: 500 }
    )
  }
} 