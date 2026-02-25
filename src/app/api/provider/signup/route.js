import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { execute, getConnection } from '@/lib/db';
import { generateEmailVerificationToken } from '@/lib/jwt';
import { sendEmail, getVerificationEmailHtml } from '@/lib/email';

export async function POST(request) {
  console.log('='.repeat(80));
  console.log('🚀 SIGNUP API CALLED at:', new Date().toISOString());
  console.log('='.repeat(80));

  const connection = await getConnection();

  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    console.log('📝 Signup attempt:', { email, firstName, lastName, phone });

    // Validation
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check duplicate
    const existingProvider = await execute(
      'SELECT id FROM service_providers WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingProvider.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email or phone already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate token and store it directly in DB
    // We store the raw JWT token in the DB column so DB-fallback lookup always works
    // even if JWT_SECRET changes between deploys
    const verificationToken = generateEmailVerificationToken(0, email);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔑 Verification token generated (first 30 chars):', verificationToken.substring(0, 30));

    await connection.beginTransaction();

    const fullName = `${firstName} ${lastName}`.trim();

    const [result] = await connection.execute(
      `INSERT INTO service_providers 
       (name, email, password, phone, email_verification_token, email_verification_expires, 
        status, onboarding_step, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'inactive', 1, NOW(), NOW())`,
      [
        fullName,
        email.toLowerCase().trim(),
        hashedPassword,
        phone.trim(),
        verificationToken,   // ✅ Store the full JWT token string in DB
        tokenExpiry,
      ]
    );

    const providerId = result.insertId;
    console.log('✅ Provider created with ID:', providerId);

    // Update the token to include the real providerId
    const finalToken = generateEmailVerificationToken(providerId, email);
    await connection.execute(
      `UPDATE service_providers SET email_verification_token = ? WHERE id = ?`,
      [finalToken, providerId]
    );

    await connection.commit();
    console.log('✅ Transaction committed');

    // Send verification email
    console.log('📧 Sending verification email to:', email);
    try {
      const emailResult = await sendEmail({
        to: email,
        subject: 'Verify Your Email - WorkOnTap',
        html: getVerificationEmailHtml(firstName, finalToken),
        text: `Welcome to WorkOnTap! Verify your email: ${process.env.NEXT_PUBLIC_APP_URL}/provider/verify-email?token=${finalToken}`,
      });

      if (emailResult.success) {
        console.log('✅ Verification email sent to:', email);
      } else {
        console.error('❌ Email send error:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email send error:', emailError.message);
      // Don't fail signup if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      providerId,
      requiresVerification: true,
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Signup error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: 'Email or phone already registered' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}