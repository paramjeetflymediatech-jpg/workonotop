import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request) {
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

    const body = await request.json();
    const { bio, specialty, experience_years, city, location, service_areas, skills } = body;

    // server-side validation
    if (!bio || typeof bio !== 'string' || !bio.trim()) {
      return NextResponse.json({ success: false, message: 'Bio is required' }, { status: 400 });
    }
    const trimmed = bio.trim();
    if (trimmed.length < 50) {
      return NextResponse.json({ success: false, message: 'Bio must be at least 50 characters' }, { status: 400 });
    }
    if (trimmed.length > 500) {
      return NextResponse.json({ success: false, message: 'Bio cannot exceed 500 characters' }, { status: 400 });
    }

    await execute(
      `UPDATE service_providers 
       SET bio = ?, specialty = ?, experience_years = ?,
           city = ?, location = ?, service_areas = ?,
           skills = ?, onboarding_step = 3
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