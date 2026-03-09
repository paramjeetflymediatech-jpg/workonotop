import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 })
        }

        // Check if OTP matches and is not expired
        const users = await query(
            `SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW() AND role = 'user'`,
            [email, otp]
        )

        if (users.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid or expired verification code' }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: 'Verification successful' })

    } catch (error) {
        console.error('Customer verify-otp error:', error)
        return NextResponse.json({ success: false, message: 'Failed to verify OTP' }, { status: 500 })
    }
}
