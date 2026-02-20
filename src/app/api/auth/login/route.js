// // app/api/auth/login/route.js
// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import bcrypt from 'bcryptjs';

// export async function POST(request) {
//   try {
//     const { email, password } = await request.json();

//     const users = await query(
//       'SELECT id, email, first_name, last_name, phone, password_hash FROM users WHERE email = ?',
//       [email]
//     );

//     if (users.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     const user = users[0];
//     const isValid = await bcrypt.compare(password, user.password_hash);

//     if (!isValid) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     // Remove password from response
//     delete user.password_hash;

//     return NextResponse.json({
//       success: true,
//       user
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Login failed' },
//       { status: 500 }
//     );
//   }
// }
























import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user (only customers, not admin)
    const users = await query(
      `SELECT * FROM users WHERE email = ? AND role = 'user'`,
      [email]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        first_name: user.first_name,
        last_name: user.last_name,
        role: 'user' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password_hash, ...userData } = user

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}