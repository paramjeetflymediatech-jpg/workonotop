import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const providers = await execute(
      'SELECT email_verified FROM service_providers WHERE email = ?',
      [email]
    );

    if (providers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: providers[0].email_verified === 1 || providers[0].email_verified === true
    });

  } catch (error) {
    console.error('Check verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
