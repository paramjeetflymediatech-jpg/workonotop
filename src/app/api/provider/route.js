import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET all providers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const specialty = searchParams.get('specialty')
    const limit = parseInt(searchParams.get('limit') || '100')

    let sql = `
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        specialty, 
        experience_years, 
        rating, 
        total_jobs, 
        bio, 
        avatar_url, 
        location, 
        status,
        created_at
      FROM service_providers
      WHERE 1=1
    `
    const params = []

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    if (specialty) {
      sql += ' AND specialty LIKE ?'
      params.push(`%${specialty}%`)
    }

    sql += ` ORDER BY rating DESC, total_jobs DESC LIMIT ${limit}`

    const providers = await query(sql, params)
    
    return NextResponse.json({ 
      success: true, 
      data: providers,
      count: providers.length 
    })

  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}

// GET single provider by ID
export async function GET_by_id(request, { params }) {
  try {
    const { id } = params

    const providers = await query(
      `SELECT 
        id, name, email, phone, specialty, experience_years, 
        rating, total_jobs, bio, avatar_url, location, status,
        created_at, updated_at
      FROM service_providers 
      WHERE id = ?`,
      [id]
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
    console.error('Error fetching provider:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch provider' },
      { status: 500 }
    )
  }
}

// POST create new provider
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      specialty,
      experience_years,
      bio,
      location
    } = body

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email and phone are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await query(
      'SELECT id FROM service_providers WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Insert new provider
    const result = await query(
      `INSERT INTO service_providers 
       (name, email, phone, specialty, experience_years, bio, location, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [name, email, phone, specialty || null, experience_years || 0, bio || null, location || null]
    )

    const providerId = result.insertId

    // Get created provider
    const provider = await query(
      'SELECT id, name, email, phone, specialty, experience_years, rating, total_jobs, bio, location, status FROM service_providers WHERE id = ?',
      [providerId]
    )

    return NextResponse.json({
      success: true,
      message: 'Provider created successfully',
      data: provider[0]
    })

  } catch (error) {
    console.error('Error creating provider:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create provider' },
      { status: 500 }
    )
  }
}

// PUT update provider
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      )
    }

    const {
      name,
      phone,
      specialty,
      experience_years,
      bio,
      location,
      status
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
    if (status) {
      updateFields.push('status = ?')
      updateParams.push(status)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      )
    }

    updateParams.push(id)

    await query(
      `UPDATE service_providers SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateParams
    )

    // Get updated provider
    const provider = await query(
      'SELECT id, name, email, phone, specialty, experience_years, rating, total_jobs, bio, location, status FROM service_providers WHERE id = ?',
      [id]
    )

    return NextResponse.json({
      success: true,
      message: 'Provider updated successfully',
      data: provider[0]
    })

  } catch (error) {
    console.error('Error updating provider:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update provider' },
      { status: 500 }
    )
  }
}

// DELETE provider
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      )
    }

    // Check if provider has any assigned jobs
    const jobs = await query(
      'SELECT id FROM bookings WHERE provider_id = ? AND status NOT IN ("completed", "cancelled")',
      [id]
    )

    if (jobs.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete provider with active jobs' },
        { status: 400 }
      )
    }

    // Soft delete - set status to inactive instead of actual delete
    await query(
      'UPDATE service_providers SET status = "inactive" WHERE id = ?',
      [id]
    )

    return NextResponse.json({
      success: true,
      message: 'Provider deactivated successfully'
    })

  } catch (error) {
    console.error('Error deleting provider:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete provider' },
      { status: 500 }
    )
  }
}