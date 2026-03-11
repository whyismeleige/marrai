import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAuditEmail(
  email: string,
  name: string,
  auditId: string,
  score: number
) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const auditUrl = `${baseUrl}/results/${auditId}`
  
  const gradeEmoji = score >= 80 ? '🌟' : score >= 60 ? '✅' : score >= 40 ? '⚠️' : '❌'
  
  try {
    await resend.emails.send({
      from: 'Marrai <onboarding@resend.dev>', // Change later with your domain
      to: email,
      subject: `Your Marrai Analysis: ${score}/100 ${gradeEmoji}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .score { font-size: 48px; font-weight: bold; margin: 10px 0; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Marrai Analysis is Ready!</h1>
              <div class="score">${score}/100 ${gradeEmoji}</div>
            </div>
            
            <div class="content">
              <p>Hi ${name || 'there'},</p>
              
              <p>Great news! We've completed your AI marketing analysis with Marrai.</p>
              
              <p><strong>Your score: ${score}/100</strong></p>
              
              <p>We've identified specific insights and created a prioritized action plan to help grow your business using AI-powered marketing.</p>
              
              <a href="${auditUrl}" class="button">View Full Report →</a>
              
              <p>Your report includes:</p>
              <ul>
                <li>✓ AI visibility score</li>
                <li>✓ Marketing insights</li>
                <li>✓ Growth recommendations</li>
                <li>✓ Actionable next steps</li>
              </ul>
              
              <p>Questions? Just reply to this email.</p>
              
              <p>Best,<br>The Marrai Team</p>
            </div>
            
            <div class="footer">
              <p>Marrai - The Future of Marketing</p>
              <p><small>If you didn't request this analysis, you can safely ignore this email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    
    console.log('Email sent successfully to:', email)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}