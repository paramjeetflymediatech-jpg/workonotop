// app/api/admin/providers/approve/route.js
import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

// Update the PUT method in your existing admin/providers/route.js

export async function PUT(request) {
  const connection = await getConnection();
  
  try {
    const { providerId, action, rejectionReason } = await request.json();

    await connection.beginTransaction();

    if (action === 'approve') {
      // Update provider status to active
      await connection.execute(
        `UPDATE service_providers 
         SET status = 'active', 
             approved_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [providerId]
      );

      console.log('✅ Provider approved:', providerId);

      // Get provider details for email
      const providers = await connection.execute(
        'SELECT name, email FROM service_providers WHERE id = ?',
        [providerId]
      );
      
      if (providers.length > 0) {
        const provider = providers[0];
        
        // Create notification in database
        await connection.execute(
          `INSERT INTO provider_notifications 
           (provider_id, type, title, message, data) 
           VALUES (?, 'account_approved', 'Account Approved!', 
                   'Congratulations! Your account has been approved. You can now start accepting jobs.', ?)`,
          [providerId, JSON.stringify({ approved: true })]
        );

        // Try to send email (don't fail if it doesn't work)
        try {
          await sendEmail({
            to: provider.email,
            subject: 'Welcome to WorkOnTap - Account Approved!',
            html: getWelcomeEmailHtml(provider.name)
          });
        } catch (emailError) {
          console.error('Welcome email failed:', emailError);
        }
      }

    } else if (action === 'reject') {
      await connection.execute(
        `UPDATE service_providers 
         SET status = 'suspended',
             rejection_reason = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [rejectionReason, providerId]
      );
      
      console.log('❌ Provider rejected:', providerId);
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `Provider ${action}ed successfully`
    });

  } catch (error) {
    await connection.rollback();
    console.error('Provider update error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}