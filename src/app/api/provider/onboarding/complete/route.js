import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    console.log('='.repeat(60));
    console.log('🚀 ONBOARDING COMPLETE API CALLED');
    console.log('='.repeat(60));

    const token = request.cookies.get('provider_token')?.value;
    
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'provider') {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const providerId = decoded.providerId;
    console.log('✅ Provider ID:', providerId);

    // First, check if documents are uploaded
    const docs = await execute(
      `SELECT COUNT(*) as count FROM provider_documents WHERE provider_id = ?`,
      [providerId]
    );
    
    console.log('📊 Documents count:', docs[0]?.count || 0);

    // Update provider
    await execute(
      `UPDATE service_providers 
       SET 
           onboarding_completed = 1,
           onboarding_step = 5,
           status = 'inactive',
           updated_at = NOW()
       WHERE id = ?`,
      [providerId]
    );

    console.log('✅ Onboarding completed for provider:', providerId);
    console.log('='.repeat(60));

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed. Your application is under review.'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}