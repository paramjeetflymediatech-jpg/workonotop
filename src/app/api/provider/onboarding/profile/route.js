import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { getMobileSession } from '@/lib/mobile-auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Check Mobile Session (via Authorization Header + DB)
    let decoded = await getMobileSession(request);
    let providerId = decoded?.providerId;

    // 2. Fallback to Web Session (via Cookies)
    if (!decoded) {
      const token = request.cookies.get('provider_token')?.value;
      if (token) {
        decoded = verifyToken(token);
        if (decoded && decoded.type === 'provider') {
          providerId = decoded.providerId;
        }
      }
    }

    if (!decoded || !providerId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated or session expired' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bio, specialty, experience_years, city, location, service_areas, skills } = body;

    // server-side validation
    if (!bio || typeof bio !== 'string' || !bio.trim()) {
      return NextResponse.json({ success: false, message: 'Bio is required' }, { status: 400 });
    }
    const trimmed = bio.trim();
    if (trimmed.length < 10) {
      return NextResponse.json({ success: false, message: 'Bio must be at least 10 characters' }, { status: 400 });
    }
    if (trimmed.length > 500) {
      return NextResponse.json({ success: false, message: 'Bio cannot exceed 500 characters' }, { status: 400 });
    }

    await execute(
      `UPDATE service_providers 
       SET bio = ?, specialty = ?, experience_years = ?,
           city = ?, location = ?, service_areas = ?,
           skills = ?, onboarding_step = 2
       WHERE id = ?`,
      [
        bio,
        specialty,
        experience_years,
        city,
        location,
        JSON.stringify(service_areas || []),
        JSON.stringify(skills || []),
        decoded.providerId
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}