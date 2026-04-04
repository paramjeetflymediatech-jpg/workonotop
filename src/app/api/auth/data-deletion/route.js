import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, reason } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1. Fetch user/provider data with password hash and current status
    const [user] = await execute(
      'SELECT id, role, password_hash as password, status FROM users WHERE email = ? LIMIT 1', 
      [email]
    );
    const [provider] = await execute(
      'SELECT id, password, status FROM service_providers WHERE email = ? LIMIT 1', 
      [email]
    );

    const targetAccount = user || provider;
    const accountType = user ? 'user' : (provider ? 'provider' : null);

    if (!targetAccount) {
      return NextResponse.json(
        { success: false, message: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    // 2. Role-based administrative account protection
    if (user && user.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Administrative accounts cannot be deleted through this form.' },
        { status: 403 }
      );
    }

    // 3. Prevent multiple requests if already pending
    if (targetAccount.status === 'pending_deletion') {
      return NextResponse.json(
        { success: false, message: 'This account is already pending deletion. It will be anonymized within 48 hours.' },
        { status: 400 }
      );
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(password, targetAccount.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid password. Verification failed.' },
        { status: 401 }
      );
    }

    // 5. Word count validation for reason (max 500 words)
    if (reason) {
      const wordCount = reason.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 500) {
        return NextResponse.json(
          { success: false, message: 'Reason for deletion cannot exceed 500 words.' },
          { status: 400 }
        );
      }
    }

    // 6. Update account status to 'pending_deletion' and set timestamp
    const updateTable = accountType === 'user' ? 'users' : 'service_providers';
    await execute(
      `UPDATE ${updateTable} SET status = 'pending_deletion', deletion_requested_at = NOW() WHERE email = ?`,
      [email]
    );

    // 7. Insert/Update the request log
    await execute(
      `INSERT INTO deletion_requests (email, reason, status)
       VALUES (?, ?, 'pending')
       ON DUPLICATE KEY UPDATE reason = VALUES(reason), status = 'pending', updated_at = NOW()`,
      [email, reason || '']
    );

    // 8. Send confirmation email
    try {
      const { sendEmail, getDeletionRequestReceivedEmailHtml } = await import('@/lib/email');
      await sendEmail({
        to: email,
        subject: 'Account Deletion Request Received - WorkOnTap',
        html: getDeletionRequestReceivedEmailHtml(email)
      });
    } catch (emailError) {
      console.error('Failed to send deletion request confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Your request has been verified. Your account is now pending deletion and will be anonymized within 48 hours. You can still log in to cancel this request if needed.'
    });

  } catch (error) {
    console.error('Data Deletion Request Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }
}
