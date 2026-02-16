import { NextResponse } from 'next/server'
import { query, getConnection } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// GET provider's assigned jobs
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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let sql = `
      SELECT 
        b.*,
        s.name as service_name,
        s.slug as service_slug,
        s.image_url as service_image,
        c.name as category_name,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.provider_id = ?
    `
    const params = [providerId]

    if (status) {
      sql += ' AND b.status = ?'
      params.push(status)
    }

    sql += ` ORDER BY b.job_date ASC, b.created_at DESC LIMIT ${limit}`

    const jobs = await query(sql, params)

    // Get photos for each job
    for (let job of jobs) {
      if (job.job_time_slot) {
        job.job_time_slot = job.job_time_slot.split(',')
      }

      const photos = await query(
        'SELECT photo_url FROM booking_photos WHERE booking_id = ?',
        [job.id]
      )
      job.photos = photos.map(p => p.photo_url)
    }

    return NextResponse.json({ success: true, data: jobs })

  } catch (error) {
    console.error('Error fetching provider jobs:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// PUT update job status (provider can update their assigned jobs)
export async function PUT(request) {
  let connection
  
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
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('id')
    const body = await request.json()
    const { status, notes } = body

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: 'Job ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      )
    }

    // Verify that this job is assigned to this provider
    const job = await query(
      'SELECT provider_id FROM bookings WHERE id = ?',
      [jobId]
    )

    if (job.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      )
    }

    if (job[0].provider_id !== providerId) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to update this job' },
        { status: 403 }
      )
    }

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      // Update job status
      await connection.execute(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, jobId]
      )

      // Add to status history
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes)
         VALUES (?, ?, ?)`,
        [jobId, status, notes || `Status updated to ${status}`]
      )

      await connection.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Job status updated successfully'
      })

    } catch (error) {
      if (connection) await connection.query('ROLLBACK')
      throw error
    } finally {
      if (connection) connection.release()
    }

  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update job' },
      { status: 500 }
    )
  }
}