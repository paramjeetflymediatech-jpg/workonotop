import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/mobile/push-token
 *
 * Saves or updates the Expo push token for a mobile user or provider.
 *
 * Body:
 *   userId    - ID of the user (customer) or provider
 *   userType  - 'customer' | 'provider'
 *   pushToken - Expo push token string
 *   platform  - 'ios' | 'android' | 'web'
 *   deviceId  - optional device identifier
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            userId,
            userType,
            pushToken,
            platform,
            deviceId = null,
        } = body;

        // Validate required fields
        if (!userId || !userType || !pushToken) {
            return NextResponse.json(
                { success: false, message: 'userId, userType, and pushToken are required' },
                { status: 400 }
            );
        }

        if (!['customer', 'provider'].includes(userType)) {
            return NextResponse.json(
                { success: false, message: 'userType must be customer or provider' },
                { status: 400 }
            );
        }

        const allowedPlatforms = ['ios', 'android', 'web'];
        const safePlatform = allowedPlatforms.includes(platform) ? platform : null;

        // Build the user_id / provider_id assignment
        const userIdField = userType === 'customer' ? userId : null;
        const providerIdField = userType === 'provider' ? userId : null;

        if (deviceId) {
            // Upsert by userId/providerId + device_id
            const uniqueField = userType === 'customer' ? 'user_id' : 'provider_id';

            await query(
                `INSERT INTO mobile_auth_users 
                    (user_id, provider_id, user_type, push_token, push_token_platform, push_token_updated_at, device_id, device_platform, is_active, last_login)
                 VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, 1, NOW())
                 ON DUPLICATE KEY UPDATE
                    push_token = VALUES(push_token),
                    push_token_platform = VALUES(push_token_platform),
                    push_token_updated_at = NOW(),
                    device_platform = VALUES(device_platform),
                    is_active = 1,
                    last_login = NOW(),
                    updated_at = NOW()`,
                [userIdField, providerIdField, userType, pushToken, safePlatform, deviceId, safePlatform]
            );
        } else {
            // Upsert by userId/providerId alone (no device_id specified)
            const existingField = userType === 'customer' ? 'user_id' : 'provider_id';
            const existing = await query(
                `SELECT id FROM mobile_auth_users WHERE ${existingField} = ? AND user_type = ? LIMIT 1`,
                [userId, userType]
            );

            if (existing.length > 0) {
                await query(
                    `UPDATE mobile_auth_users
                     SET push_token = ?, push_token_platform = ?, push_token_updated_at = NOW(), 
                         device_platform = ?, is_active = 1, last_login = NOW(), updated_at = NOW()
                     WHERE id = ?`,
                    [pushToken, safePlatform, safePlatform, existing[0].id]
                );
            } else {
                await query(
                    `INSERT INTO mobile_auth_users 
                        (user_id, provider_id, user_type, push_token, push_token_platform, push_token_updated_at, device_platform, is_active, last_login)
                     VALUES (?, ?, ?, ?, ?, NOW(), ?, 1, NOW())`,
                    [userIdField, providerIdField, userType, pushToken, safePlatform, safePlatform]
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Push token saved successfully',
        });

    } catch (error) {
        console.error('[/api/mobile/push-token] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error. Please try again.' },
            { status: 500 }
        );
    }
}
