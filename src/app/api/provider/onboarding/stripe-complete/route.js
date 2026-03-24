import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { getMobileSession } from '@/lib/mobile-auth';

export async function POST(request) {
  try {
    // 1. Check Mobile Session
    let decoded = await getMobileSession(request);
    let providerId = decoded?.providerId;

    // 2. Fallback to Web Session
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
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Mark onboarding as complete
    await execute(
      `UPDATE service_providers 
       SET onboarding_completed = 1,
           onboarding_step = 5,
           status = 'pending',
           updated_at = NOW()
       WHERE id = ?`,
      [providerId]
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