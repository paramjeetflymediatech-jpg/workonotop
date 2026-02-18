import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

// Send email
const sendEmail = async (email, code) => {
  const mailOptions = {
    from: `"WorkOnTap" <${process.env.SMTP_FROM || 'noreply@workontap.com'}>`,
    to: email,
    subject: 'Password Reset Code - WorkOnTap',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #059669;">Password Reset Code</h2>
        <p>Your password reset code is:</p>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
          ${code}
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">WorkOnTap - Your Service Platform</p>
      </div>
    `,
  }
  await transporter.sendMail(mailOptions)
}

export async function POST(request) {
  try {
    const { action, email, token, newPassword } = await request.json()

    // REQUEST RESET CODE
    if (action === 'request') {
      if (!email) {
        return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
      }

      // Check if provider exists
      const providers = await query(
        'SELECT id, name FROM service_providers WHERE email = ?',
        [email.toLowerCase()]
      )

      // Always return success for security (don't reveal if email exists)
      if (providers.length === 0) {
        return NextResponse.json({ 
          success: true, 
          message: 'If your email is registered, you will receive a reset code' 
        })
      }

      const provider = providers[0]
      const resetCode = generateCode()
      const hashedToken = crypto.createHash('sha256').update(resetCode).digest('hex')
      
      // Expires in 1 hour
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      // Delete old tokens
      await query('DELETE FROM password_reset_tokens WHERE email = ?', [email.toLowerCase()])

      // Save new token
      await query(
        'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
        [email.toLowerCase(), hashedToken, expiresAt]
      )

      // Send email
      await sendEmail(email, resetCode)

      return NextResponse.json({ 
        success: true, 
        message: 'Reset code sent to your email' 
      })
    }

    // RESET PASSWORD
    else if (action === 'reset') {
      if (!email || !token || !newPassword) {
        return NextResponse.json({ 
          success: false, 
          message: 'Email, code, and new password are required' 
        }, { status: 400 })
      }

      // Validate password
      if (newPassword.length < 8) {
        return NextResponse.json({ 
          success: false, 
          message: 'Password must be at least 8 characters' 
        }, { status: 400 })
      }

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

      // Find valid token
      const tokens = await query(
        `SELECT * FROM password_reset_tokens 
         WHERE email = ? AND token = ? AND expires_at > NOW() AND used = FALSE`,
        [email.toLowerCase(), hashedToken]
      )

      if (tokens.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid or expired reset code' 
        }, { status: 400 })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update password
      await query(
        'UPDATE service_providers SET password = ? WHERE email = ?',
        [hashedPassword, email.toLowerCase()]
      )

      // Mark token as used
      await query('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?', [tokens[0].id])

      return NextResponse.json({ 
        success: true, 
        message: 'Password reset successful' 
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process request' 
    }, { status: 500 })
  }
}