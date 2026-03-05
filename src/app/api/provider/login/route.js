// // import { NextResponse } from 'next/server';
// // import bcrypt from 'bcryptjs';
// // import { execute } from '@/lib/db';
// // import { generateToken } from '@/lib/jwt';

// // export async function POST(request) {
// //   try {
// //     const { email, password } = await request.json();

// //     if (!email || !password) {
// //       return NextResponse.json(
// //         { success: false, message: 'Email and password required' },
// //         { status: 400 }
// //       );
// //     }

// //     // Get provider
// //     const providers = await execute(
// //       `SELECT id, name, email, password, status, email_verified, 
// //               onboarding_step, onboarding_completed, documents_verified,
// //               stripe_onboarding_complete, approved_at
// //        FROM service_providers 
// //        WHERE email = ?`,
// //       [email]
// //     );

// //     if (providers.length === 0) {
// //       return NextResponse.json(
// //         { success: false, message: 'Invalid credentials' },
// //         { status: 401 }
// //       );
// //     }

// //     const provider = providers[0];

// //     // Check password
// //     const isMatch = await bcrypt.compare(password, provider.password);
// //     if (!isMatch) {
// //       return NextResponse.json(
// //         { success: false, message: 'Invalid credentials' },
// //         { status: 401 }
// //       );
// //     }

// //     // Check email verification
// //     if (!provider.email_verified) {
// //       return NextResponse.json({
// //         success: false,
// //         message: 'Please verify your email first',
// //         requiresVerification: true,
// //         email: provider.email
// //       });
// //     }

// //     // Generate JWT
// //     const token = generateToken({
// //       providerId: provider.id,
// //       email: provider.email,
// //       name: provider.name,
// //       type: 'provider'
// //     });

// //     console.log('Generated token for provider:', provider.id); // Debug log

// //     // Create response
// //     const response = NextResponse.json({
// //       success: true,
// //       message: 'Login successful',
// //       provider: {
// //         id: provider.id,
// //         name: provider.name,
// //         email: provider.email,
// //         onboarding_step: provider.onboarding_step,
// //         onboarding_completed: provider.onboarding_completed,
// //         documents_verified: provider.documents_verified,
// //         stripe_onboarding_complete: provider.stripe_onboarding_complete,
// //         status: provider.status
// //       }
// //     });

// //     // Set cookie with proper options
// //     response.cookies.set({
// //       name: 'provider_token',
// //       value: token,
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === 'production',
// //       sameSite: 'lax',
// //       path: '/',
// //       maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
// //     });

// //     console.log('Cookie set for provider:', provider.id); // Debug log

// //     return response;

// //   } catch (error) {
// //     console.error('Login error:', error);
// //     return NextResponse.json(
// //       { success: false, message: 'Server error: ' + error.message },
// //       { status: 500 }
// //     );
// //   }
// // }













// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import { execute } from '@/lib/db';
// import { generateToken } from '@/lib/jwt';

// export async function POST(request) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { success: false, message: 'Email and password required' },
//         { status: 400 }
//       );
//     }

//     // Get provider with ALL necessary fields
//     const providers = await execute(
//       `SELECT id, name, email, password, status, email_verified, 
//               onboarding_step, onboarding_completed, documents_uploaded,
//               documents_verified, stripe_onboarding_complete, approved_at
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

//     // Create response with provider data
//     const response = NextResponse.json({
//       success: true,
//       message: 'Login successful',
//       provider: {
//         id: provider.id,
//         name: provider.name,
//         email: provider.email,
//         status: provider.status,
//         onboarding_step: provider.onboarding_step,
//         onboarding_completed: provider.onboarding_completed,
//         documents_uploaded: provider.documents_uploaded,
//         documents_verified: provider.documents_verified,
//         stripe_onboarding_complete: provider.stripe_onboarding_complete
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
//     console.error('Login error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Server error: ' + error.message },
//       { status: 500 }
//     );
//   }
// }
















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
//       console.log('❌ Missing email or password');
//       return NextResponse.json(
//         { success: false, message: 'Email and password required' },
//         { status: 400 }
//       );
//     }

//     // Get provider
//     console.log('🔍 Querying database for provider with email:', email);
//     const providers = await execute(
//       `SELECT id, name, email, password, status, email_verified, 
//               onboarding_step, onboarding_completed, documents_uploaded,
//               documents_verified, stripe_onboarding_complete, approved_at
//        FROM service_providers 
//        WHERE email = ?`,
//       [email]
//     );

//     console.log(`📊 Database returned ${providers.length} results`);

//     if (providers.length === 0) {
//       console.log('❌ No provider found with email:', email);
//       return NextResponse.json(
//         { success: false, message: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     const provider = providers[0];
//     console.log('✅ Provider found:', { 
//       id: provider.id, 
//       name: provider.name, 
//       email: provider.email,
//       status: provider.status,
//       email_verified: provider.email_verified,
//       onboarding_step: provider.onboarding_step,
//       onboarding_completed: provider.onboarding_completed,
//       stripe_complete: provider.stripe_onboarding_complete
//     });

//     // Check password
//     console.log('🔐 Verifying password...');
//     const isMatch = await bcrypt.compare(password, provider.password);
//     console.log('Password match:', isMatch);

//     if (!isMatch) {
//       console.log('❌ Password incorrect');
//       return NextResponse.json(
//         { success: false, message: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Check email verification
//     if (!provider.email_verified) {
//       console.log('⚠️ Email not verified for provider:', provider.id);
//       return NextResponse.json({
//         success: false,
//         message: 'Please verify your email first',
//         requiresVerification: true,
//         email: provider.email
//       });
//     }

//     // Generate JWT
//     console.log('🔑 Generating JWT token for provider:', provider.id);
//     const token = generateToken({
//       providerId: provider.id,
//       email: provider.email,
//       name: provider.name,
//       type: 'provider'
//     });

//     console.log('✅ Token generated successfully');

//     // Create response
//     const response = NextResponse.json({
//       success: true,
//       message: 'Login successful',
//       provider: {
//         id: provider.id,
//         name: provider.name,
//         email: provider.email,
//         status: provider.status,
//         onboarding_step: provider.onboarding_step,
//         onboarding_completed: provider.onboarding_completed,
//         documents_uploaded: provider.documents_uploaded,
//         documents_verified: provider.documents_verified,
//         stripe_onboarding_complete: provider.stripe_onboarding_complete
//       }
//     });

//     // Set cookie
//     console.log('🍪 Setting cookie for provider:', provider.id);
//     response.cookies.set({
//       name: 'provider_token',
//       value: token,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 7 * 24 * 60 * 60
//     });

//     console.log('✅ Login successful for provider:', provider.id);
//     console.log('='.repeat(80));
//     return response;

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     console.log('='.repeat(80));
//     return NextResponse.json(
//       { success: false, message: 'Server error: ' + error.message },
//       { status: 500 }
//     );
//   }
// }














// app/api/provider/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { execute } from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export async function POST(request) {
  console.log('='.repeat(80));
  console.log('🚀 LOGIN API CALLED at:', new Date().toISOString());
  console.log('='.repeat(80));

  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('📝 Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    // Get provider
    const providers = await execute(
      `SELECT id, name, email, password, status, email_verified, 
              onboarding_step, onboarding_completed, documents_uploaded,
              documents_verified, stripe_onboarding_complete, rejection_reason
       FROM service_providers 
       WHERE email = ?`,
      [email]
    );

    if (providers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const provider = providers[0];

    // 🔴 CHECK IF REJECTED
    if (provider.status === 'rejected') {
      console.log('⚠️ Provider is rejected:', provider.id);
      return NextResponse.json({
        success: false,
        message: 'Your application has been rejected',
        isRejected: true,
        rejection_reason: provider.rejection_reason
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check email verification
    if (!provider.email_verified) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email first',
        requiresVerification: true,
        email: provider.email
      });
    }

    // Generate JWT
    const token = generateToken({
      providerId: provider.id,
      email: provider.email,
      name: provider.name,
      type: 'provider'
    });

    // Create response
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

    // Set cookie
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
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}