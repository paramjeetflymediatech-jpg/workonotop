import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPasswordHash =
      process.env.ADMIN_PASSWORD_HASH ||
      "$2b$10$mpfMPuCBTTR2Y5JcxakM1eXJOe56vkp071ripzzGosjs7c8r2SRIC";

    if (username !== adminUsername) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, adminPasswordHash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    // ✅ SIMPLE FIX: Cookie set karo
    response.cookies.set("adminAuth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}





















//user login


// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import bcrypt from 'bcryptjs';

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { email, password } = body;

//     if (!email || !password) {
//       return NextResponse.json(
//         { success: false, message: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     // Find user
//     const users = await query(
//       'SELECT * FROM users WHERE email = ?',
//       [email]
//     );

//     if (users.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     const user = users[0];

//     // Check password
//     const isValid = await bcrypt.compare(password, user.password);
//     if (!isValid) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     // Remove password from response
//     delete user.password;

//     return NextResponse.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user,
//         token: 'jwt_token_will_be_here' // Add JWT token logic
//       }
//     });

//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: 'Failed to login' },
//       { status: 500 }
//     );
//   }
// }