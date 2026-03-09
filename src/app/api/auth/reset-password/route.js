import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request) {
    try {
        const { token, email, otp, newPassword } = await request.json()

        if (!newPassword) {
            return NextResponse.json({ success: false, message: 'New password is required' }, { status: 400 })
        }

        if (!token && (!email || !otp)) {
            return NextResponse.json({ success: false, message: 'Valid token or Email/OTP required' }, { status: 400 })
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 })
        }

        // Find user with matching valid token/OTP
        let users;
        if (token) {
            // Website flow (Token)
            users = await query(
                `SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND role = 'user'`,
                [token]
            )
        } else {
            // Mobile flow (Email + OTP)
            users = await query(
                `SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW() AND role = 'user'`,
                [email, otp]
            )
        }

        if (!users || users.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid or expired reset credentials' }, { status: 400 })
        }

        const user = users[0]

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        // Update password and clear reset token
        await query(
            `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
            [hashedPassword, user.id]
        )

        return NextResponse.json({ success: true, message: 'Password reset successfully' })

    } catch (error) {
        console.error('Customer reset-password error:', error)
        return NextResponse.json({ success: false, message: 'Failed to reset password' }, { status: 500 })
    }
}
