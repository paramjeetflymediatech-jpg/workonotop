import { NextResponse } from 'next/server'
import { execute as query } from '@/lib/db' // Using execute instead of query
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    console.log('Login attempt:', { email, role_check: true })

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    let user = null;
    let role = null;

    // 1. Check users table (Customer or Admin)
    const users = await query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    )

    if (users.length > 0) {
      user = users[0];
      role = user.role;
    } else {
      // 2. Check service_providers table
      const providers = await query(
        `SELECT * FROM service_providers WHERE email = ?`,
        [email]
      )
      if (providers.length > 0) {
        user = providers[0];
        role = 'provider';
        // Map 'password' to 'password_hash' for the bcrypt check below
        user.password_hash = user.password;
      }
    }

    if (!user) {
      console.log('No user found with email:', email)
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      console.log('Password mismatch for user:', email)
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name || user.name,
        last_name: user.last_name || '',
        role: role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remove password fields from response
    const { password_hash, password: p, ...userData } = user
    userData.role = role;

    // Create response
    const response = NextResponse.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`,
      token,
      user: userData
    })

    // Set HTTP-only cookie based on role
    const cookieOptions = {
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    };

    if (role === 'admin') {
      response.cookies.set({ name: 'adminAuth', ...cookieOptions })
    } else if (role === 'provider') {
      response.cookies.set({ name: 'provider_token', ...cookieOptions })
    } else {
      response.cookies.set({ name: 'customer_token', ...cookieOptions })
    }

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}