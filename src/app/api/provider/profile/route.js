import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// GET provider profile
export async function GET(request) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
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

    const providerId = decoded.id

    // Get provider profile
    const providers = await query(
      `SELECT 
        id, name, email, phone, specialty, experience_years, 
        rating, total_jobs, bio, avatar_url, location, status,
        created_at
      FROM service_providers 
      WHERE id = ?`,
      [providerId]
    )

    if (providers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: providers[0]
    })

  } catch (error) {
    console.error('Error fetching provider profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT update provider profile
export async function PUT(request) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
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

    const providerId = decoded.id
    const body = await request.json()
    const {
      name,
      phone,
      specialty,
      experience_years,
      bio,
      location,
      avatar_url
    } = body

    // Build update query
    let updateFields = []
    let updateParams = []

    if (name) {
      updateFields.push('name = ?')
      updateParams.push(name)
    }
    if (phone) {
      updateFields.push('phone = ?')
      updateParams.push(phone)
    }
    if (specialty !== undefined) {
      updateFields.push('specialty = ?')
      updateParams.push(specialty)
    }
    if (experience_years !== undefined) {
      updateFields.push('experience_years = ?')
      updateParams.push(experience_years)
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?')
      updateParams.push(bio)
    }
    if (location !== undefined) {
      updateFields.push('location = ?')
      updateParams.push(location)
    }
    if (avatar_url !== undefined) {
      updateFields.push('avatar_url = ?')
      updateParams.push(avatar_url)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      )
    }

    updateParams.push(providerId)

    await query(
      `UPDATE service_providers SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateParams
    )

    // Get updated profile
    const providers = await query(
      `SELECT 
        id, name, email, phone, specialty, experience_years, 
        rating, total_jobs, bio, avatar_url, location, status
      FROM service_providers 
      WHERE id = ?`,
      [providerId]
    )

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: providers[0]
    })

  } catch (error) {
    console.error('Error updating provider profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}