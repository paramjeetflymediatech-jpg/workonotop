import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { randomBytes } from 'crypto'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const { email, source } = await request.json()
    const isMobile = source === 'mobile'

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }

    // Check if customer exists
    const users = await query(
      `SELECT id, first_name, last_name, email FROM users WHERE email = ? AND role = 'user'`,
      [email]
    )

    // Always return success (security: don't reveal if email exists)
    if (users.length === 0) {
      return NextResponse.json({ success: true, message: 'If an account exists, you will receive a reset email' })
    }

    const user = users[0]

    // Generate token/OTP based on source
    let resetToken;
    let tokenExpiry = new Date();

    if (isMobile) {
      // 6-digit OTP for mobile (15 minutes expiry)
      resetToken = Math.floor(100000 + Math.random() * 900000).toString()
      tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 15)
    } else {
      // Hex token for website (1 hour expiry)
      resetToken = randomBytes(32).toString('hex')
      tokenExpiry.setHours(tokenExpiry.getHours() + 1)
    }

    // Store token
    await query(
      `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`,
      [resetToken, tokenExpiry, user.id]
    )

    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer'

    if (isMobile) {
      // Send OTP email
      await sendEmail({
        to: user.email,
        subject: 'Your WorkOnTap Verification Code',
        html: getOtpEmailHtml(name, resetToken),
        text: `Your WorkOnTap verification code is: ${resetToken}`
      })
    } else {
      // Send Reset Link email
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

      await sendEmail({
        to: user.email,
        subject: 'Reset Your WorkOnTap Password',
        html: getResetLinkEmailHtml(name, resetUrl),
        text: `Reset your WorkOnTap password: ${resetUrl}`
      })
    }

    return NextResponse.json({ success: true, message: 'If an account exists, you will receive a reset email' })

  } catch (error) {
    console.error('Customer forgot-password error:', error)
    return NextResponse.json({ success: false, message: 'Failed to process request' }, { status: 500 })
  }
}

function getOtpEmailHtml(name, otp) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#166534,#15803d);padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🔐</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Verification Code</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name} 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
              We received a request to reset your WorkOnTap account password. Use the verification code below to proceed:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr><td align="center">
                <div style="display:inline-block;padding:16px 40px;background:#f1f5f9;color:#166534;border-radius:12px;font-size:32px;font-weight:800;letter-spacing:8px;border:2px dashed #166534;">
                  ${otp}
                </div>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#64748b;">⏰ Code expires in 15 minutes</p>
                <p style="margin:4px 0;font-size:14px;color:#475569;">If you didn't request this, you can safely ignore this email.</p>
              </td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />
            <p style="margin:0;font-size:13px;color:#94a3b8;">Please do not share this code with anyone.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} WorkOnTap · Calgary, Alberta, Canada</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function getResetLinkEmailHtml(name, resetUrl) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#166534,#15803d);padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🔐</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Reset Your Password</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name} 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
              We received a request to reset your WorkOnTap account password. Click the button below to set a new password:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr><td align="center">
                <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#166534,#15803d);color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                  🔑 Reset Password
                </a>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#64748b;">⏰ Link expires in 1 hour</p>
                <p style="margin:4px 0;font-size:14px;color:#475569;">If you didn't request this, you can safely ignore this email.</p>
              </td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />
            <p style="margin:0;font-size:13px;color:#94a3b8;">Or copy this link: <span style="word-break:break-all;">${resetUrl}</span></p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} WorkOnTap · Calgary, Alberta, Canada</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
