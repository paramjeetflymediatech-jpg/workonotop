import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// Sign Up
export async function POST(request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'signup') {
      return await handleSignup(data)
    } else if (action === 'login') {
      return await handleLogin(data)
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Handle Signup
async function handleSignup(data) {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword
  } = data

  // Validation
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    return NextResponse.json(
      { success: false, message: 'All fields are required' },
      { status: 400 }
    )
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { success: false, message: 'Passwords do not match' },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { success: false, message: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  // Check if email already exists
  const existingProvider = await query(
    'SELECT id FROM service_providers WHERE email = ?',
    [email]
  )

  if (existingProvider.length > 0) {
    return NextResponse.json(
      { success: false, message: 'Email already registered' },
      { status: 400 }
    )
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create provider
  const result = await query(
    `INSERT INTO service_providers 
     (name, email, password, phone, status, created_at) 
     VALUES (?, ?, ?, ?, 'active', NOW())`,
    [`${firstName} ${lastName}`, email, hashedPassword, phone]
  )

  const providerId = result.insertId

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: providerId, 
      email, 
      name: `${firstName} ${lastName}`,
      type: 'provider' 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  // Get created provider
  const provider = await query(
    `SELECT id, name, email, phone, specialty, experience_years, 
            rating, total_jobs, bio, avatar_url, location, status 
     FROM service_providers WHERE id = ?`,
    [providerId]
  )

  return NextResponse.json({
    success: true,
    message: 'Account created successfully',
    token,
    provider: provider[0]
  })
}

// Handle Login
async function handleLogin(data) {
  const { email, password, rememberMe } = data

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: 'Email and password are required' },
      { status: 400 }
    )
  }

  // Get provider
  const providers = await query(
    `SELECT id, name, email, password, phone, specialty, experience_years,
            rating, total_jobs, bio, avatar_url, location, status 
     FROM service_providers WHERE email = ?`,
    [email]
  )

  if (providers.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    )
  }

  const provider = providers[0]

  // Check if account is active
  if (provider.status !== 'active') {
    return NextResponse.json(
      { success: false, message: 'Your account is not active' },
      { status: 403 }
    )
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, provider.password)
  if (!isValidPassword) {
    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    )
  }

  // Update last login
  await query(
    'UPDATE service_providers SET last_login = NOW() WHERE id = ?',
    [provider.id]
  )

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: provider.id, 
      email: provider.email, 
      name: provider.name,
      type: 'provider' 
    },
    JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '7d' }
  )

  // Remove password from response
  delete provider.password

  return NextResponse.json({
    success: true,
    message: 'Login successful',
    token,
    provider
  })
}