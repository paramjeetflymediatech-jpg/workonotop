// app/api/provider/verify-otp/route.js
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function POST(request) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json({
                success: false,
                message: 'Email and verification code required'
            }, { status: 400 })
        }

        console.log('🔍 OTP verification attempt for:', email)

        // Check if provider exists with valid token
        const providers = await execute(
            `SELECT id FROM service_providers 
       WHERE email = ? 
       AND reset_token = ? 
       AND reset_token_expiry > NOW()`,
            [email, otp]
        )

        console.log('📊 Verification result:', providers.length > 0 ? 'Success' : 'Failed')

        if (providers.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Invalid or expired verification code'
            }, { status: 400 })
        }

        // ✅ Mark email as verified and clear reset token
        await execute(
            `UPDATE service_providers SET email_verified = 1, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
            [providers[0].id]
        )

        return NextResponse.json({
            success: true,
            message: 'Verification successful'
        })

    } catch (error) {
        console.error('🔥 Verify OTP error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to process request'
        }, { status: 500 })
    }
}
