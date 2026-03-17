import { execute } from './db.js';
import { decodeToken, verifyToken } from './jwt.js';

/**
 * Verifies a mobile session by checking the token against the mobile_auth_users table.
 * This provides a robust alternative to cookie-only or JWT-only verification for mobile clients.
 * 
 * @param {Request} request - The Next.js request object
 * @returns {Promise<Object|null>} - The session data if valid, otherwise null
 */
export async function getMobileSession(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        if (!token) return null;

        // 1. Query the database for this specific token string
        // This bypasses secret mismatch issues as we compare the exact string issued
        const rows = await execute(
            `SELECT * FROM mobile_auth_users 
             WHERE refresh_token = ? AND is_active = 1 
             AND (refresh_token_expires IS NULL OR refresh_token_expires > NOW())`,
            [token]
        );

        if (rows.length === 0) {
            console.log('⚠️ No active mobile session found in DB, trying JWT verification...');
            try {
                const decoded = verifyToken(token);
                if (decoded) {
                    console.log('✅ JWT verified successfully');
                    // Standardize the response to match what onboarding routes expect
                    return {
                        ...decoded,
                        providerId: decoded.providerId || (decoded.role === 'provider' ? decoded.id : null),
                        userId: decoded.userId || (decoded.role !== 'provider' ? decoded.id : null),
                        type: decoded.role || decoded.type,
                        mobileSession: true
                    };
                }
            } catch (jwtErr) {
                console.log('❌ JWT verification also failed:', jwtErr.message);
            }
            return null;
        }

        const session = rows[0];

        // 2. Decode the token to get payload data (without re-verifying signature 
        // since we already validated the string match in our secure DB)
        const decoded = decodeToken(token);
        
        if (!decoded) {
            console.warn('📱 [Mobile Auth] Token valid in DB but could not be decoded');
            return null;
        }

        // Standardize the response to match what onboarding routes expect
        return {
            ...decoded,
            providerId: session.provider_id || decoded.id,
            userId: session.user_id || decoded.id,
            type: session.user_type,
            mobileSession: true
        };

    } catch (error) {
        console.error('📱 [Mobile Auth] Critical error:', error);
        return null;
    }
}
