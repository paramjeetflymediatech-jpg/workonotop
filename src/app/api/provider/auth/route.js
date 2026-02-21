


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

  // Name validation
  if (firstName.length < 2 || lastName.length < 2) {
    return NextResponse.json(
      { success: false, message: 'First and last name must be at least 2 characters' },
      { status: 400 }
    )
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid email address' },
      { status: 400 }
    )
  }

  // Phone validation - Clean and validate
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid 10-digit phone number' },
      { status: 400 }
    )
  }

  // Password validation
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

  // Password strength validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!passwordRegex.test(password)) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      },
      { status: 400 }
    )
  }

  // Check if email already exists
  const existingByEmail = await query(
    'SELECT id FROM service_providers WHERE email = ?',
    [email.toLowerCase()]
  )

  if (existingByEmail.length > 0) {
    return NextResponse.json(
      { success: false, message: 'Email already registered' },
      { status: 400 }
    )
  }

  // Check if phone already exists (unique constraint)
  const existingByPhone = await query(
    'SELECT id FROM service_providers WHERE phone = ?',
    [cleanPhone]
  )

  if (existingByPhone.length > 0) {
    return NextResponse.json(
      { success: false, message: 'Phone number already registered' },
      { status: 400 }
    )
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create provider
  const result = await query(
    `INSERT INTO service_providers 
     (name, email, password, phone, status, created_at, updated_at) 
     VALUES (?, ?, ?, ?, 'active', NOW(), NOW())`,
    [`${firstName.trim()} ${lastName.trim()}`, email.toLowerCase(), hashedPassword, cleanPhone]
  )

  const providerId = result.insertId

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: providerId, 
      email: email.toLowerCase(), 
      name: `${firstName.trim()} ${lastName.trim()}`,
      type: 'provider' 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  // Get created provider
  const provider = await query(
    `SELECT id, name, email, phone, specialty, experience_years, 
            rating, total_jobs, bio, avatar_url, location, city, status,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
     FROM service_providers WHERE id = ?`,
    [providerId]
  )

  // Format phone for response (optional)
  const formattedProvider = provider[0]
  if (formattedProvider) {
    // Format phone: (XXX) XXX-XXXX
    const p = formattedProvider.phone
    if (p && p.length === 10) {
      formattedProvider.phone_formatted = `(${p.slice(0,3)}) ${p.slice(3,6)}-${p.slice(6)}`
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Account created successfully',
    token,
    provider: formattedProvider
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

  // Get provider - allow login with email or phone
  const cleanIdentifier = email.includes('@') ? email : email.replace(/\D/g, '')
  
  let providers
  if (email.includes('@')) {
    // Login with email
    providers = await query(
      `SELECT id, name, email, password, phone, specialty, experience_years,
              rating, total_jobs, bio, avatar_url, location, city, status,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
              DATE_FORMAT(last_login, '%Y-%m-%d %H:%i:%s') as last_login
       FROM service_providers 
       WHERE email = ?`,
      [email.toLowerCase()]
    )
  } else {
    // Login with phone number
    providers = await query(
      `SELECT id, name, email, password, phone, specialty, experience_years,
              rating, total_jobs, bio, avatar_url, location, city, status,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
              DATE_FORMAT(last_login, '%Y-%m-%d %H:%i:%s') as last_login
       FROM service_providers 
       WHERE phone = ?`,
      [cleanIdentifier]
    )
  }

  if (providers.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Invalid email/phone or password' },
      { status: 401 }
    )
  }

  const provider = providers[0]

  // Check if account is active
  if (provider.status !== 'active') {
    let statusMessage = 'Your account is not active'
    if (provider.status === 'suspended') {
      statusMessage = 'Your account has been suspended. Please contact support.'
    } else if (provider.status === 'inactive') {
      statusMessage = 'Your account is inactive. Please contact support.'
    }
    return NextResponse.json(
      { success: false, message: statusMessage },
      { status: 403 }
    )
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, provider.password)
  if (!isValidPassword) {
    return NextResponse.json(
      { success: false, message: 'Invalid email/phone or password' },
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

  // Format phone for response
  if (provider.phone && provider.phone.length === 10) {
    provider.phone_formatted = `(${provider.phone.slice(0,3)}) ${provider.phone.slice(3,6)}-${provider.phone.slice(6)}`
  }

  return NextResponse.json({
    success: true,
    message: 'Login successful',
    token,
    provider
  })
}

// Optional: GET endpoint to check if email/phone exists
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')

    if (email) {
      const providers = await query(
        'SELECT id FROM service_providers WHERE email = ?',
        [email.toLowerCase()]
      )
      return NextResponse.json({
        success: true,
        exists: providers.length > 0
      })
    }

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      const providers = await query(
        'SELECT id FROM service_providers WHERE phone = ?',
        [cleanPhone]
      )
      return NextResponse.json({
        success: true,
        exists: providers.length > 0
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Email or phone parameter required'
    }, { status: 400 })

  } catch (error) {
    console.error('Check existence error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to check existence'
    }, { status: 500 })
  }
}