import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { execute } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : request.cookies.get('provider_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const providerId = decoded.providerId || decoded.id;

    const providers = await execute(
      `SELECT id, name, email, phone, status, email_verified,
              onboarding_step, onboarding_completed, documents_verified,
              stripe_onboarding_complete, specialty, bio, experience_years,
              city, location, service_areas, skills, avatar_url,
              documents_uploaded, approved_at, created_at
       FROM service_providers 
       WHERE id = ?`,
      [providerId]
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