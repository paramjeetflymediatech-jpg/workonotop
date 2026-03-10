



// import { NextResponse } from 'next/server'
// import { query } from '@/lib/db'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// export async function POST(request) {
//   try {
//     const { 
//       first_name, 
//       last_name, 
//       email,   
//       phone, 
//       password,
//       hear_about,
//       receive_offers 
//     } = await request.json()

//     // Validation
//     if (!first_name || !last_name || !email || !password) {
//       return NextResponse.json(
//         { success: false, message: 'All required fields must be filled' },
//         { status: 400 }
//       )
//     }

//     // Check if email already exists
//     const existing = await query('SELECT id FROM users WHERE email = ?', [email])
//     if (existing.length > 0) {
//       return NextResponse.json(
//         { success: false, message: 'Email already registered' },
//         { status: 400 }
//       )
//     }

//     // Check if phone already exists
//     if (phone) {
//       const existingPhone = await query('SELECT id FROM users WHERE phone = ?', [phone])
//       if (existingPhone.length > 0) {
//         return NextResponse.json(
//           { success: false, message: 'Phone number already registered' },
//           { status: 400 }
//         )
//       }
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10)

//     // Create new customer
//     const result = await query(
//       `INSERT INTO users 
//        (first_name, last_name, email, phone, password_hash, hear_about, receive_offers, role) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, 'user')`,
//       [
//         first_name, 
//         last_name, 
//         email, 
//         phone || null, 
//         hashedPassword, 
//         hear_about || null, 
//         receive_offers ? 1 : 0
//       ]
//     )

//     // Get the created user
//     const newUser = await query(
//       'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?',
//       [result.insertId]
//     )

//     // Generate JWT token
//     const token = jwt.sign(
//       { 
//         id: newUser[0].id, 
//         email: newUser[0].email,
//         first_name: newUser[0].first_name,
//         last_name: newUser[0].last_name,
//         role: 'user' 
//       },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     )

//     // Create response with cookie
//     const response = NextResponse.json({
//       success: true,
//       message: 'Account created successfully',
//       user: newUser[0]
//     })

//     // Set HTTP-only cookie
//     response.cookies.set({
//       name: 'customer_token',
//       value: token,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 7 * 24 * 60 * 60 // 7 days
//     })

//     return response

//   } catch (error) {
//     console.error('Signup error:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to create account. Please try again.' },
//       { status: 500 }
//     )
//   }
// }


















import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
  try {
    const { 
      first_name, 
      last_name, 
      email,   
      phone, 
      password,
      hear_about,
      receive_offers 
    } = await request.json()

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Check if email exists in users table
    const existing = await query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      )
    }

    // ✅ Check if email exists in service_providers table
    const existingProvider = await query(
      'SELECT id FROM service_providers WHERE email = ?', 
      [email]
    )
    if (existingProvider.length > 0) {
      return NextResponse.json(
        { success: false, message: 'This email is already registered . Please use a different email.' },
        { status: 400 }
      )
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await query('SELECT id FROM users WHERE phone = ?', [phone])
      if (existingPhone.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Phone number already registered' },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await query(
      `INSERT INTO users 
       (first_name, last_name, email, phone, password_hash, hear_about, receive_offers, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user')`,
      [
        first_name, 
        last_name, 
        email.toLowerCase().trim(), 
        phone || null, 
        hashedPassword, 
        hear_about || null, 
        receive_offers ? 1 : 0
      ]
    )

    const newUser = await query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    )

    const token = jwt.sign(
      { 
        id: newUser[0].id, 
        email: newUser[0].email,
        first_name: newUser[0].first_name,
        last_name: newUser[0].last_name,
        role: 'user' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: newUser[0]
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
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}