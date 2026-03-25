import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(request) {
  try {
    const { email, reason } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email exists and get roles
    const [user] = await execute('SELECT id, role FROM users WHERE email = ? LIMIT 1', [email]);
    const [provider] = await execute('SELECT id FROM service_providers WHERE email = ? LIMIT 1', [email]);

    if (!user && !provider) {
      return NextResponse.json(
        { success: false, message: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    // Role-based administrative account protection
    if (user && user.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Administrative accounts cannot be deleted through this form.' },
        { status: 403 }
      );
    }

    // Word count validation for reason (max 500 words)
    if (reason) {
      const wordCount = reason.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 500) {
        return NextResponse.json(
          { success: false, message: 'Reason for deletion cannot exceed 500 words.' },
          { status: 400 }
        );
      }
    }

    // Check if a pending request already exists
    const [pendingRequest] = await execute(
      'SELECT id FROM deletion_requests WHERE email = ? AND status = "pending" LIMIT 1',
      [email]
    );

    if (pendingRequest) {
      return NextResponse.json(
        { success: false, message: 'A deletion request is already pending for this email address.' },
        { status: 400 }
      );
    }

    // Insert the request into the database
    const sql = `
      INSERT INTO deletion_requests (email, reason, status)
      VALUES (?, ?, 'pending')
    `;
    await execute(sql, [email, reason || '']);

    // Send confirmation email
    try {
      const { sendEmail, getDeletionRequestReceivedEmailHtml } = await import('@/lib/email');
      await sendEmail({
        to: email,
        subject: 'Data Deletion Request Received - WorkOnTap',
        html: getDeletionRequestReceivedEmailHtml(email)
      });
    } catch (emailError) {
      console.error('Failed to send deletion request confirmation email:', emailError);
      // We don't fail the request if email fails, but we log it
    }

    return NextResponse.json({
      success: true,
      message: 'Your deletion request has been submitted successfully. A confirmation email has been sent.'
    });

  } catch (error) {
    console.error('Data Deletion Request Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit request. Please try again later.' },
      { status: 500 }
    );
  }
}
