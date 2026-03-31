import { NextResponse } from 'next/server';
import { execute as query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  try {
    const { token, role } = await request.json(); // role: 'user' or 'provider'

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Google token is required' },
        { status: 400 }
      );
    }

    // Verify Google Token
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const googleData = await googleRes.json();

    if (googleData.error_description) {
      return NextResponse.json(
        { success: false, message: 'Invalid Google token' },
        { status: 401 }
      );
    }

    const { email, given_name, family_name, name, picture, sub: google_id, aud } = googleData;
    
    // Verify audience (must match our client id)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (aud !== clientId) {
      console.error('Google Auth Security Warning: Audience mismatch', { aud, expected: clientId });
      return NextResponse.json(
        { success: false, message: 'Security verification failed: User intended for different application.' },
        { status: 403 }
      );
    }

    if (role === 'provider') {
      // Check if provider exists
      const providers = await query(
        'SELECT * FROM service_providers WHERE email = ?',
        [email]
      );

      let provider;
      if (providers.length === 0) {
        // Create new provider (Notice: phone is required in schema, we'll use a placeholder or handle it in onboarding)
        // For now, we'll check if email exists in users table to prevent conflict
        const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
          return NextResponse.json(
            { success: false, message: 'This email is already registered as a customer.' },
            { status: 400 }
          );
        }

        // Insert new provider
        // Note: phone is NOT NULL in schema, so we must provide something or placeholder
        const tempPhonePlaceholder = 'gAuth' + Date.now().toString().slice(-10) + Math.floor(Math.random() * 1000);
        const result = await query(
          `INSERT INTO service_providers (name, email, password, phone, status, email_verified, avatar_url, onboarding_step)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [name || `${given_name} ${family_name}`, email, 'google-auth-placeholder', tempPhonePlaceholder.substring(0, 19), 'pending', 1, picture, 1]
        );
        
        const newProvider = await query('SELECT * FROM service_providers WHERE id = ?', [result.insertId]);
        provider = newProvider[0];
      } else {
        provider = providers[0];
      }

      // Generate JWT for provider
      const jwtToken = jwt.sign(
        {
          providerId: provider.id,
          email: provider.email,
          name: provider.name,
          type: 'provider'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token: jwtToken,
        provider: {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          status: provider.status,
          onboarding_step: provider.onboarding_step,
          onboarding_completed: provider.onboarding_completed
        }
      });

      response.cookies.set({
        name: 'provider_token',
        value: jwtToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return response;

    } else {
      // role: 'user' (customer)
      const users = await query(
        "SELECT * FROM users WHERE email = ? AND role = 'user'",
        [email]
      );

      let user;
      if (users.length === 0) {
        // Check if email exists in providers table
        const existingProvider = await query('SELECT id FROM service_providers WHERE email = ?', [email]);
        if (existingProvider.length > 0) {
          return NextResponse.json(
            { success: false, message: 'This email is already registered as a service provider.' },
            { status: 400 }
          );
        }

        // Insert new user
        const result = await query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, image_url)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [email, 'google-auth-placeholder', given_name || '', family_name || '', 'user', picture]
        );
        
        const newUser = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = newUser[0];
      } else {
        user = users[0];
      }

      const jwtToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: 'user'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password_hash, ...userData } = user;

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token: jwtToken,
        user: userData
      });

      response.cookies.set({
        name: 'customer_token',
        value: jwtToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return response;
    }

  } catch (error) {
    console.error('Google Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
