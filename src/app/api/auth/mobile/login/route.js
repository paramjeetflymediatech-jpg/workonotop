import { NextResponse } from 'next/server'
import { execute as query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { email, password, device_id = 'mobile_default' } = body;
        console.log('Mobile login attempt:', { email, role_check: true })

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            )
        }

        let user = null;
        let role = null;

        // 1. Check users table (Customer or Admin)
        const users = await query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        )

        if (users.length > 0) {
            user = users[0];
            role = user.role;
        } else {
            // 2. Check service_providers table
            const providers = await query(
                `SELECT * FROM service_providers WHERE email = ?`,
                [email]
            )
            if (providers.length > 0) {
                user = providers[0];
                role = 'provider';
                // Map 'password' to 'password_hash' for the bcrypt check below
                user.password_hash = user.password;
            }
        }

        if (!user) {
            console.log('No user found with email:', email)
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash)
        if (!isMatch) {
            console.log('Password mismatch for user:', email)
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                providerId: role === 'provider' ? user.id : undefined,
                email: user.email,
                first_name: user.first_name || user.name,
                last_name: user.last_name || '',
                role: role,
                type: role // Added for compatibility with provider middleware/routes
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        // Remove password fields from response
        const { password_hash, password: p, ...userData } = user
        userData.role = role;

        // Create response
        const response = NextResponse.json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`,
            token,
            user: userData
        })

        // 🔥 Save session to mobile_auth_users table for mobile API verification
        try {
            // Map roles to database enum ('customer', 'provider', 'admin')
            let dbType = 'customer';
            if (role === 'provider') dbType = 'provider';
            else if (role === 'admin') dbType = 'admin';

            const userIdCol = (dbType === 'provider') ? 'provider_id' : 'user_id';
            
            // Note: device_id is part of unique index.
            const finalDeviceId = device_id || 'mobile_default';

            await query(
                `INSERT INTO mobile_auth_users 
                 (${userIdCol}, user_type, refresh_token, refresh_token_expires, is_active, last_login, device_id)
                 VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 1, NOW(), ?)
                 ON DUPLICATE KEY UPDATE 
                 refresh_token = VALUES(refresh_token),
                 refresh_token_expires = VALUES(refresh_token_expires),
                 is_active = 1,
                 last_login = NOW()`,
                [user.id, dbType, token, finalDeviceId]
            );
            console.log(`✅ Mobile session persisted for ${dbType} ID: ${user.id}`);
        } catch (dbError) {
            console.error('❌ Failed to persist mobile session:', dbError.message);
        }

        // Set HTTP-only cookie based on role (for web support)
        const cookieOptions = {
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        };

        if (role === 'admin') {
            response.cookies.set({ name: 'adminAuth', ...cookieOptions })
        } else if (role === 'provider') {
            response.cookies.set({ name: 'provider_token', ...cookieOptions })
        } else {
            response.cookies.set({ name: 'customer_token', ...cookieOptions })
        }

        return response

    } catch (error) {
        console.error('Mobile login error:', error)
        return NextResponse.json(
            { success: false, message: 'Server error. Please try again.' },
            { status: 500 }
        )
    }
}
