import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyEmailVerificationToken } from '@/lib/jwt';

export async function GET(request) {
  console.log('='.repeat(60));
  console.log('🚀 VERIFY EMAIL API CALLED');
  console.log('='.repeat(60));

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('📝 Token received:', token ? token.substring(0, 30) + '...' : 'NONE');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No verification token provided' },
        { status: 400 }
      );
    }

    // ── Method 1: Verify via JWT ──────────────────────────────────────────
    const decoded = verifyEmailVerificationToken(token);
    console.log('🔍 JWT decode result:', decoded);

    if (decoded) {
      // Token is valid JWT — find provider by email or id from token
      const providers = await execute(
        `SELECT id, email, email_verified, email_verification_token
         FROM service_providers
         WHERE email = ? OR id = ?`,
        [decoded.email, decoded.providerId || 0]
      );

      if (providers.length > 0) {
        const provider = providers[0];

        if (provider.email_verified) {
          console.log('⚠️ Email already verified for provider:', provider.id);
          return NextResponse.json({
            success: true,
            message: 'Email already verified. You can login.',
            alreadyVerified: true,
          });
        }

        // Mark as verified
        await execute(
          `UPDATE service_providers
           SET email_verified = 1,
               email_verification_token = NULL,
               email_verification_expires = NULL,
               updated_at = NOW()
           WHERE id = ?`,
          [provider.id]
        );

        console.log('✅ Email verified via JWT for provider:', provider.id);
        return NextResponse.json({
          success: true,
          message: 'Email verified successfully! Redirecting to login...',
        });
      }
    }

    // ── Method 2: Fallback — lookup token directly in DB ─────────────────
    // This handles cases where JWT secret changed but token is stored in DB
    console.log('⚠️ JWT verify failed, trying DB token lookup...');

    const providers = await execute(
      `SELECT id, email, email_verified, email_verification_expires
       FROM service_providers
       WHERE email_verification_token = ?`,
      [token]
    );

    console.log('🔍 DB token lookup found:', providers.length, 'providers');

    if (providers.length === 0) {
      console.log('❌ Token not found in DB either');
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token. Please sign up again.' },
        { status: 400 }
      );
    }

    const provider = providers[0];

    // Check if already verified
    if (provider.email_verified) {
      console.log('⚠️ Email already verified for provider:', provider.id);
      return NextResponse.json({
        success: true,
        message: 'Email already verified. You can login.',
        alreadyVerified: true,
      });
    }

    // Check token expiry
    if (provider.email_verification_expires) {
      const expiry = new Date(provider.email_verification_expires);
      if (expiry < new Date()) {
        console.log('❌ Token expired for provider:', provider.id);
        return NextResponse.json(
          { success: false, message: 'Verification link has expired. Please sign up again.' },
          { status: 400 }
        );
      }
    }

    // Mark as verified
    await execute(
      `UPDATE service_providers
       SET email_verified = 1,
           email_verification_token = NULL,
           email_verification_expires = NULL,
           updated_at = NOW()
       WHERE id = ?`,
      [provider.id]
    );

    console.log('✅ Email verified via DB token for provider:', provider.id);
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Redirecting to login...',
    });

  } catch (error) {
    console.error('❌ Verify email error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}