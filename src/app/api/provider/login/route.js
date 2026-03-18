










// // app/api/provider/login/route.js
// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import { execute } from '@/lib/db';
// import { generateToken } from '@/lib/jwt';

// export async function POST(request) {
//   console.log('='.repeat(80));
//   console.log('🚀 LOGIN API CALLED at:', new Date().toISOString());
//   console.log('='.repeat(80));

//   try {
//     const body = await request.json();
//     const { email, password } = body;

//     console.log('📝 Login attempt for email:', email);

//     if (!email || !password) {
//       return NextResponse.json(
//         { success: false, message: 'Email and password required' },
//         { status: 400 }
//       );
//     }

//     // Get provider
//     const providers = await execute(
//       `SELECT id, name, email, password, status, email_verified, 
//               onboarding_step, onboarding_completed, documents_uploaded,
//               documents_verified, stripe_onboarding_complete, rejection_reason
//        FROM service_providers 
//        WHERE email = ?`,
//       [email]
//     );

//     if (providers.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     const provider = providers[0];

//     // 🔴 CHECK IF REJECTED
//     if (provider.status === 'rejected') {
//       console.log('⚠️ Provider is rejected:', provider.id);
//       return NextResponse.json({
//         success: false,
//         message: 'Your application has been rejected',
//         isRejected: true,
//         rejection_reason: provider.rejection_reason
//       });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, provider.password);
//     if (!isMatch) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Check email verification
//     if (!provider.email_verified) {
//       return NextResponse.json({
//         success: false,
//         message: 'Please verify your email first',
//         requiresVerification: true,
//         email: provider.email
//       });
//     }

//     // Generate JWT
//     const token = generateToken({
//       providerId: provider.id,
//       email: provider.email,
//       name: provider.name,
//       type: 'provider'
//     });

//     // Create response
//     const response = NextResponse.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       provider: {
//         id: provider.id,
//         name: provider.name,
//         email: provider.email,
//         status: provider.status,
//         onboarding_step: provider.onboarding_step,
//         onboarding_completed: provider.onboarding_completed
//       }
//     });

//     // Set cookie
//     response.cookies.set({
//       name: 'provider_token',
//       value: token,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 7 * 24 * 60 * 60
//     });

//     return response;

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Server error: ' + error.message },
//       { status: 500 }
//     );
//   }
// }










import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { execute } from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export async function POST(request) {
  console.log('🚀 PROVIDER LOGIN API CALLED at:', new Date().toISOString());

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    const providers = await execute(
      `SELECT id, name, email, password, status, email_verified, 
              onboarding_step, onboarding_completed, documents_uploaded,
              documents_verified, stripe_onboarding_complete, rejection_reason
       FROM service_providers 
       WHERE email = ?`,
      [email]
    );

    if (providers.length === 0) {
      // ✅ Check if this email belongs to a customer — give helpful message
      const isCustomer = await execute(
        "SELECT id FROM users WHERE email = ? AND role = 'user'", 
        [email]
      );
      if (isCustomer.length > 0) {
        return NextResponse.json(
          { success: false, message: 'This email is registered as a customer. Please use the customer login.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const provider = providers[0];

    if (provider.status === 'rejected') {
      return NextResponse.json({
        success: false,
        message: 'Your application has been rejected',
        isRejected: true,
        rejection_reason: provider.rejection_reason
      });
    }

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check email verification (Active providers bypass this)
    if (!provider.email_verified && provider.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email first',
        requiresVerification: true,
        email: provider.email
      });
    }

    const token = generateToken({
      providerId: provider.id,
      email: provider.email,
      name: provider.name,
      type: 'provider'
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      provider: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        status: provider.status,
        onboarding_step: provider.onboarding_step,
        onboarding_completed: provider.onboarding_completed
      }
    });

    response.cookies.set({
      name: 'provider_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('❌ Provider Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}