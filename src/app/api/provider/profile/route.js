// app/api/provider/profile/route.js - OPTIONAL IMPROVEMENT
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'  // ✅ CHANGE: query → execute
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

function verifyToken(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// GET
export async function GET(request) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Using execute()
    const providers = await execute(
      `SELECT id, name, email, phone, specialty, experience_years,
              rating, total_jobs, bio, avatar_url, location, city, status,
              DATE_FORMAT(created_at, '%Y-%m-%d') as join_date
       FROM service_providers WHERE id = ?`,
      [decoded.id]
    )

    if (providers.length === 0) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: providers[0] })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT
export async function PUT(request) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, specialty, experience_years, bio, location, city, avatar_url } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email and phone are required' },
        { status: 400 }
      )
    }

    // Check email uniqueness - using execute()
    const existing = await execute(
      'SELECT id FROM service_providers WHERE email = ? AND id != ?',
      [email, decoded.id]
    )
    
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 })
    }

    // Update profile - using execute()
    await execute(
      `UPDATE service_providers SET
        name             = ?,
        email            = ?,
        phone            = ?,
        specialty        = ?,
        experience_years = ?,
        bio              = ?,
        location         = ?,
        city             = ?,
        avatar_url       = COALESCE(?, avatar_url),
        updated_at       = NOW()
       WHERE id = ?`,
      [
        name,
        email,
        phone,
        specialty        || null,
        experience_years ? parseInt(experience_years) : null,
        bio              || null,
        location         || null,
        city             || null,
        avatar_url       || null,
        decoded.id
      ]
    )

    // Fetch updated profile - using execute()
    const providers = await execute(
      `SELECT id, name, email, phone, specialty, experience_years,
              rating, total_jobs, bio, avatar_url, location, city, status
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
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 })
  }
}