import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// GET provider profile
export async function GET(request) {
  try {
    // Get token from header
    const token = request.headers.get('Authorization')?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get provider profile
    const providers = await query(
      `SELECT id, name, email, phone, specialty, experience_years,
              rating, total_jobs, bio, avatar_url, location, status,
              DATE_FORMAT(created_at, '%Y-%m-%d') as join_date
       FROM service_providers WHERE id = ?`,
      [decoded.id]
    )

    if (providers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      )
    }

    const provider = providers[0]

    // Parse skills if stored as JSON
    let skills = []
    if (provider.skills) {
      try {
        skills = JSON.parse(provider.skills)
      } catch {
        skills = []
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...provider,
        skills
      }
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// UPDATE provider profile
export async function PUT(request) {
  try {
    // Get token from header
    const token = request.headers.get('Authorization')?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      specialty,
      experience_years,
      bio,
      location,
      skills,
      avatar_url
    } = body

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email and phone are required' },
        { status: 400 }
      )
    }

    // Check if email exists for another provider
    if (email) {
      const existing = await query(
        'SELECT id FROM service_providers WHERE email = ? AND id != ?',
        [email, decoded.id]
      )
      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Update provider profile
    await query(
      `UPDATE service_providers SET
        name = ?,
        email = ?,
        phone = ?,
        specialty = ?,
        experience_years = ?,
        bio = ?,
        location = ?,
        skills = ?,
        avatar_url = COALESCE(?, avatar_url),
        updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        email,
        phone,
        specialty || null,
        experience_years ? parseInt(experience_years) : null,
        bio || null,
        location || null,
        skills ? JSON.stringify(skills) : null,
        avatar_url || null,
        decoded.id
      ]
    )

    // Get updated profile
    const providers = await query(
      `SELECT id, name, email, phone, specialty, experience_years,
              rating, total_jobs, bio, avatar_url, location, status
       FROM service_providers WHERE id = ?`,
      [decoded.id]
    )

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: providers[0]
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}