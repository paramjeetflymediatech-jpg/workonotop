import { NextResponse } from 'next/server'
import { execute as query } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
    try {
        const { email } = await request.json()
        console.log('🔍 [Mobile Unified Forgot Password] Request for:', email)

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
        }

        let targetUser = null;
        let table = null;

        // 1. Check users table (Customer)
        const users = await query(
            `SELECT id, first_name, last_name, email, 'customer' as type FROM users WHERE email = ? AND role = 'user'`,
            [email]
        )

        if (users.length > 0) {
            targetUser = users[0];
            table = 'users';
        } else {
            // 2. Check service_providers table
            const providers = await query(
                `SELECT id, name, email, 'pro' as type FROM service_providers WHERE email = ?`,
                [email]
            )
            if (providers.length > 0) {
                targetUser = providers[0];
                table = 'service_providers';
            }
        }

        // Always return success (security)
        if (!targetUser) {
            console.log('ℹ️ No user or provider found with email:', email)
            return NextResponse.json({ success: true, message: 'If an account exists, you will receive a verification code' })
        }

        console.log(`✅ ${targetUser.type === 'pro' ? 'Provider' : 'Customer'} found:`, targetUser.id)

        // Generate 6-digit OTP (15 minutes expiry)
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + 15)

        // Store OTP
        await query(
            `UPDATE ${table} SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`,
            [otp, expiry, targetUser.id]
        )

        const name = targetUser.type === 'pro' ? (targetUser.name || 'Provider') : (`${targetUser.first_name || ''} ${targetUser.last_name || ''}`.trim() || 'Customer')

        // Send Email
        console.log(`🔢 Sending OTP (${otp}) to ${targetUser.email}...`);
        const emailResult = await sendEmail({
            to: targetUser.email,
            subject: 'Your WorkOnTap Verification Code',
            html: getOtpEmailHtml(name, otp, targetUser.type),
            text: `Your WorkOnTap verification code is: ${otp}`
        })

        console.log(`📨 Email result:`, emailResult.success ? 'SUCCESS' : `FAILURE (${emailResult.error})`);

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your email',
            type: targetUser.type // Return type so app knows which verify endpoint to use if needed
        })

    } catch (error) {
        console.error('🔥 Mobile unified forgot-password error:', error)
        return NextResponse.json({ success: false, message: 'Failed to process request' }, { status: 500 })
    }
}

function getOtpEmailHtml(name, otp, type) {
    const isPro = type === 'pro';
    const primaryColor = isPro ? '#0f766e' : '#166534';
    const secondaryColor = isPro ? '#0891b2' : '#15803d';

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${primaryColor},${secondaryColor});padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🔐</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Verification Code</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name} 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
              We received a request to reset your WorkOnTap ${isPro ? 'provider ' : ''}account password. Use the verification code below to proceed:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr><td align="center">
                <div style="display:inline-block;padding:16px 40px;background:#f1f5f9;color:${primaryColor};border-radius:12px;font-size:32px;font-weight:800;letter-spacing:8px;border:2px dashed ${primaryColor};">
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
