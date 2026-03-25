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

    const isMobile = !!(await getMobileSession(request));
    
    // Mark onboarding as complete
    await execute(
      `UPDATE service_providers 
       SET onboarding_completed = 1,
           onboarding_step = 5,
           status = CASE WHEN ? = 1 AND status = 'active' THEN 'active' ELSE 'pending' END,
           updated_at = NOW()
       WHERE id = ?`,
      [isMobile ? 1 : 0, providerId]
    );

    // Get updated status for response
    const provider = await execute(
      `SELECT status FROM service_providers WHERE id = ?`,
      [providerId]
    );
    const newStatus = provider[0]?.status || 'pending';

    return NextResponse.json({
      success: true,
      message: newStatus === 'active' ? 'Payment method connected successfully.' : 'Onboarding completed. Your application is under review.',
      status: newStatus
    });

  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}