import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { getMobileSession } from '@/lib/mobile-auth';
import { sendEmail, getAdminProviderApplicationSubmittedEmailHtml } from '@/lib/email';

export async function POST(request) {
  try {
    console.log('='.repeat(60));
    console.log('🚀 ONBOARDING COMPLETE API CALLED');
    console.log('='.repeat(60));

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
      console.log('❌ Not authenticated');
      return NextResponse.json(
        { success: false, message: 'Not authenticated or session expired' },
        { status: 401 }
      );
    }

    console.log('✅ Provider ID:', providerId);

    // First, check if documents are uploaded and stripe is complete
    const providerData = await execute(
      `SELECT 
        (SELECT COUNT(*) FROM provider_documents WHERE provider_id = ?) as docs_count,
        stripe_onboarding_complete
       FROM service_providers WHERE id = ?`,
      [providerId, providerId]
    );

    const docsCount = providerData[0]?.docs_count || 0;
    const stripeComplete = providerData[0]?.stripe_onboarding_complete === 1;

    console.log('📊 Stats:', { docsCount, stripeComplete });


    // Update provider
    await execute(
      `UPDATE service_providers 
       SET 
           onboarding_completed = 1,
           onboarding_step = 5,
           status = IF(status = 'active', 'active', 'pending'),
           updated_at = NOW()
       WHERE id = ?`,
      [providerId]
    );

    // Get updated status for response
    const provider = await execute(
      `SELECT status FROM service_providers WHERE id = ?`,
      [providerId]
    );
    const newStatus = provider[0]?.status || 'pending';

    console.log('✅ Onboarding completed for provider:', providerId);
    console.log('='.repeat(60));

    // 🔔 Notify Admin about application ready for review
    try {
      const providerInfo = await execute(
        `SELECT name, email, specialty FROM service_providers WHERE id = ?`,
        [providerId]
      );
      if (providerInfo.length > 0) {
        const { name: fullName, email, specialty } = providerInfo[0];
        const adminEmail = process.env.ADMIN_EMAIL || 'amandeepkumar.flymediatech@gmail.com';
        
        await sendEmail({
          to: adminEmail,
          subject: `Review Required: ${fullName}`,
          html: getAdminProviderApplicationSubmittedEmailHtml({ name: fullName, email, specialty }),
          text: `Professional application submitted: ${fullName} (${email}, Specialty: ${specialty || 'None'})`
        });
        console.log('✅ Admin notification sent (Application Review) to:', adminEmail);
      }
    } catch (adminEmailError) {
      console.error('❌ Admin notification error:', adminEmailError.message);
    }

    return NextResponse.json({
      success: true,
      message: newStatus === 'active' ? 'Profile updated successfully.' : 'Onboarding completed. Your application is under review.',
      status: newStatus
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}