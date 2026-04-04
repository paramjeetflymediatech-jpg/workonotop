import { NextResponse } from 'next/server'
import { execute as query } from '@/lib/db'
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

    // Check users table (customers only)
    const users = await query(
      `SELECT * FROM users WHERE email = ? AND role = 'user'`,
      [email]
    )

    if (users.length === 0) {
      // ✅ Check if this email belongs to a provider — give helpful message
      const isProvider = await query(
        'SELECT id FROM service_providers WHERE email = ?',
        [email]
      )
      if (isProvider.length > 0) {
        return NextResponse.json(
          { success: false, message: 'This email is registered as a service provider. Please use the provider login.' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = users[0]

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: 'user',
        status: user.status || 'active'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password_hash, ...userData } = user

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    })

    response.cookies.set({
      name: 'customer_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}


