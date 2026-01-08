import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Email service configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FEEDBACK_EMAIL = 'feedback@thaitune.com'

// Generate unique feedback ID
function generateFeedbackId(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `FB-${timestamp}-${random}`
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
        from: FEEDBACK_EMAIL,
        to: [to],
        subject: subject,
        html: html,
        reply_to: replyTo || FEEDBACK_EMAIL
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
function getConfirmationEmailTemplate(feedbackId: string, name: string, title: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4A1D2C, #6A2D3C); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .feedback-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4A1D2C; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎵 ThaiTune Feedback</h1>
                <p>Thank you for your feedback!</p>
            </div>
            <div class="content">
                <h2>Hello ${name},</h2>
                <p>Thank you for taking the time to share your feedback with us. Your input is valuable and helps us improve ThaiTune.</p>
                
                <div class="feedback-info">
                    <h3>Feedback Details</h3>
                    <p><strong>Feedback ID:</strong> ${feedbackId}</p>
                    <p><strong>Subject:</strong> ${title}</p>
                    <p><strong>Status:</strong> Received</p>
                </div>

                <p>We review all feedback carefully and use it to enhance our platform. If your feedback requires a response, we'll get back to you soon.</p>
                
                <div class="footer">
                    <p>Best regards,<br>ThaiTune Team</p>
                    <p>This is an automated message. Please do not reply to this email address directly.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}

function getNotificationEmailTemplate(feedbackId: string, formData: any) {
  const starRating = '⭐'.repeat(formData.rating)
  
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
            .rating { font-size: 18px; }
            .type-general { border-left: 4px solid #10b981; }
            .type-feature { border-left: 4px solid #3b82f6; }
            .type-bug { border-left: 4px solid #ef4444; }
            .type-improvement { border-left: 4px solid #f59e0b; }
            .type-compliment { border-left: 4px solid #ec4899; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💬 New Feedback Received</h1>
                <p>Feedback ID: ${feedbackId}</p>
            </div>
            <div class="content">
                <div class="field type-${formData.feedbackType}">
                    <strong>Type:</strong> ${formData.feedbackType.charAt(0).toUpperCase() + formData.feedbackType.slice(1)}
                </div>
                <div class="field">
                    <strong>From:</strong> ${formData.name} (${formData.email})
                </div>
                <div class="field">
                    <strong>Rating:</strong> <span class="rating">${starRating} (${formData.rating}/5)</span>
                </div>
                <div class="field">
                    <strong>Title:</strong> ${formData.title}
                </div>
                <div class="field">
                    <strong>Message:</strong><br>
                    ${formData.message.replace(/\n/g, '<br>')}
                </div>
                
                <p><strong>Reply to this email to respond to ${formData.name} at ${formData.email}</strong></p>
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
    if (!formData.name || !formData.email || !formData.title || !formData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate feedback ID
    const feedbackId = generateFeedbackId()

    // Prepare feedback data
    const feedbackData = {
      feedbackId,
      ...formData,
      status: 'received',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Store feedback in Firebase
    try {
      await addDoc(collection(db, 'feedback'), feedbackData)
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    // Send confirmation email to user
    const confirmationResult = await sendEmail(
      formData.email,
      `[${feedbackId}] Thank you for your feedback - ThaiTune`,
      getConfirmationEmailTemplate(feedbackId, formData.name, formData.title),
      FEEDBACK_EMAIL
    )

    // Send notification email to feedback team
    const notificationResult = await sendEmail(
      FEEDBACK_EMAIL,
      `[${feedbackId}] New feedback - ${formData.title}`,
      getNotificationEmailTemplate(feedbackId, formData),
      formData.email // Reply-to user's email
    )

    return NextResponse.json({
      success: true,
      feedbackId,
      message: 'Feedback submitted successfully',
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