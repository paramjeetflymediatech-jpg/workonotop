import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, userType, pushToken, platform, deviceId } = body;

    if (!userId || !pushToken) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Auth check (optional but recommended for mobile endpoints)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Even if token is missing, we might still want to allow saving push token if userId is provided 
    // and matches (but better to verify)
    if (token) {
        const decoded = verifyToken(token);
        if (!decoded || decoded.id != userId) {
            // Log but don't necessarily fail for push tokens during development
            console.warn('[PushToken] Auth mismatch or invalid token');
        }
    }

    // Upsert into mobile_auth_users
    // Note: uq_user_device uniqueness is on (user_id, device_id) or (provider_id, device_id)
    const userIdCol = userType === 'provider' ? 'provider_id' : 'user_id';
    
    // Check if record exists for this user and device
    const existing = await execute(
        `SELECT id FROM mobile_auth_users WHERE ${userIdCol} = ? AND (device_id = ? OR device_id IS NULL) LIMIT 1`,
        [userId, deviceId || 'mobile_default']
    );

    if (existing.length > 0) {
        await execute(
            `UPDATE mobile_auth_users SET 
                push_token = ?, 
                push_token_platform = ?, 
                push_token_updated_at = NOW(),
                device_id = ?,
                device_platform = ?,
                updated_at = NOW()
             WHERE id = ?`,
            [pushToken, platform, deviceId || 'mobile_default', platform, existing[0].id]
        );
    } else {
        await execute(
            `INSERT INTO mobile_auth_users 
                (${userIdCol}, user_type, push_token, push_token_platform, push_token_updated_at, device_id, device_platform)
             VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
            [userId, userType, pushToken, platform, deviceId || 'mobile_default', platform]
        );
    }

    return NextResponse.json({ success: true, message: 'Push token saved successfully' });

  } catch (error) {
    console.error('Error saving push token:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
