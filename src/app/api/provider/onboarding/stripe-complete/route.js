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

    // Mark onboarding as complete
    await execute(
      `UPDATE service_providers 
       SET onboarding_completed = 1,
           onboarding_step = 5,
           status = 'inactive',
           updated_at = NOW()
       WHERE id = ?`,
      [decoded.providerId]
    );

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed. Your application is under review.'
    });

  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}