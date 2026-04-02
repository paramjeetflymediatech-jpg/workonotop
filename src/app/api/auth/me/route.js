import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';
import { getMobileSession } from '@/lib/mobile-auth';

/**
 * Unified current user endpoint.
 * Supports:
 * 1. Mobile (Authorization Bearer Header)
 * 2. Web (Cookies: customer_token, provider_token, adminAuth)
 */
export async function GET(request) {
  try {
    // 1. Try Mobile Session
    let decoded = await getMobileSession(request);
    
    // 2. Try Web Sessions
    if (!decoded) {
      let token = request.cookies.get('user_token')?.value || 
                  request.cookies.get('provider_token')?.value ||
                  request.cookies.get('adminAuth')?.value;
      
      // Support Bearer token for mobile
      if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }

      if (token) {
        decoded = verifyToken(token);
      }
    }

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Identify user and role from token
    const userId = decoded.id || decoded.providerId;
    const role = decoded.role || decoded.type;

    let userData = null;

    if (role === 'provider') {
      // Lookup in service_providers table
      const providers = await query(
        `SELECT id, name, email, phone, status, specialty, bio, 
                experience_years, city, location, service_areas, skills,
                onboarding_step, onboarding_completed, avatar_url,
                stripe_onboarding_complete, stripe_account_id
         FROM service_providers WHERE id = ?`,
        [userId]
      );
      if (providers.length > 0) {
        userData = providers[0];
        userData.id = Number(userData.id); // Ensure ID is a Number
        userData.role = 'provider';
      }
    } else {
      // Lookup in users table (Customers and Admins)
      const users = await query(
        'SELECT id, email, first_name, last_name, phone, role, image_url FROM users WHERE id = ?',
        [userId]
      );
      if (users.length > 0) {
        userData = users[0];
        userData.id = Number(userData.id); // Ensure ID is a Number
        // Add fallbacks for fields missing in users table but expected by mobile app
        userData.status = userData.status || 'active';
        userData.onboarding_step = 1;
        userData.onboarding_completed = 1;
        userData.documents_uploaded = 0;
        
        // Ensure consistent role naming for frontend
        if (userData.role === 'user') userData.role = 'customer';
      }
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Unified Auth Me Error:', error);
    return NextResponse.json(
      { success: false, message: 'Session expired or invalid token' },
      { status: 401 }
    );
  }
}