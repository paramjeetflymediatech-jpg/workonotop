import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const token = request.cookies.get('provider_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const providers = await execute(
      `SELECT id, name, email, phone, status, email_verified,
              onboarding_step, onboarding_completed, documents_verified,
              stripe_onboarding_complete, specialty, bio, experience_years,
              city, location, service_areas, skills, avatar_url,
              approved_at, created_at
       FROM service_providers 
       WHERE id = ?`,
      [decoded.providerId]
    );

    if (providers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    console.log('Provider data:', providers[0]); // Debug log

    return NextResponse.json({
      success: true,
      provider: providers[0]
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}