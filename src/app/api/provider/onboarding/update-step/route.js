import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { getMobileSession } from '@/lib/mobile-auth';

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
    const { step } = body;

    if (!step) {
      return NextResponse.json(
        { success: false, message: 'Step is required' },
        { status: 400 }
      );
    }

    // Update the provider's current onboarding step
    await execute(
      `UPDATE service_providers 
       SET 
           onboarding_step = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [step, providerId]
    );

    return NextResponse.json({
      success: true,
      message: 'Onboarding step updated successfully',
      step: step
    });

  } catch (error) {
    console.error('Error updating onboarding step:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}
