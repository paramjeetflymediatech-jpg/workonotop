import { NextResponse } from 'next/server'
import { execute as query } from '@/lib/db'

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: 'Refresh token is required' },
                { status: 400 }
            );
        }

        // Invalidate the session by clearing the refresh token
        await query(
            `UPDATE mobile_auth_users 
             SET refresh_token = NULL, 
                 refresh_token_expires = NULL,
                 is_active = 0,
                 logged_out_at = NOW()
             WHERE refresh_token = ?`,
            [refreshToken]
        );

        console.log('🚪 Mobile session invalidated successfully');

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error during logout' },
            { status: 500 }
        );
    }
}
