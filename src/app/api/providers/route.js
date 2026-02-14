import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET all service providers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let sql = `
      SELECT 
        id, name, email, phone, specialty, experience_years, rating, total_jobs,
        bio, avatar_url, location, status, created_at
      FROM service_providers
      WHERE 1=1
    `
    const params = []

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    sql += ' ORDER BY rating DESC, total_jobs DESC'

    const providers = await query(sql, params)

    return NextResponse.json({ 
      success: true, 
      data: providers 
    })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}

// POST create new service provider
export async function POST(request) {
  try {
    const { 
      name,
      email,
      phone,
      specialty,
      experience_years,
      bio,
      location
    } = await request.json()

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM service_providers WHERE email = ?', [email])
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO service_providers 
       (name, email, phone, specialty, experience_years, bio, location, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        name,
        email,
        phone,
        specialty || null,
        experience_years || 0,
        bio || null,
        location || null
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Service provider created',
      id: result.insertId 
    })
  } catch (error) {
    console.error('Error creating provider:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create provider' },
      { status: 500 }
    )
  }
}

// PUT update service provider
export async function PUT(request) {
  try {
    const { 
      id,
      name,
      phone,
      specialty,
      experience_years,
      bio,
      location,
      status,
      rating
    } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE service_providers 
       SET name = ?, phone = ?, specialty = ?, experience_years = ?, bio = ?, location = ?, status = ?, rating = ?
       WHERE id = ?`,
      [name, phone, specialty, experience_years, bio, location, status, rating || 0, id]
    )

    return NextResponse.json({ success: true, message: 'Provider updated' })
  } catch (error) {
    console.error('Error updating provider:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update provider' },
      { status: 500 }
    )
  }
}

// DELETE service provider
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }

    await query('DELETE FROM service_providers WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Provider deleted' })
  } catch (error) {
    console.error('Error deleting provider:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete provider' },
      { status: 500 }
    )
  }
}