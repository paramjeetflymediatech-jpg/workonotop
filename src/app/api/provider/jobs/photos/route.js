// app/api/provider/jobs/photos/route.js

import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

function verifyToken(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) return null
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

// POST: Upload photo record
export async function POST(request) {
  let connection
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { booking_id, photo_url, photo_type } = await request.json()

    if (!booking_id || !photo_url || !photo_type) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 })
    }

    if (!['before', 'after'].includes(photo_type)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid photo type' 
      }, { status: 400 })
    }

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      // Verify booking belongs to provider
      const [[booking]] = await connection.execute(
        `SELECT id FROM bookings WHERE id = ? AND provider_id = ?`,
        [booking_id, decoded.id]
      )

      if (!booking) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: 'Booking not found or not assigned to you' 
        }, { status: 404 })
      }

      // Insert photo
      await connection.execute(
        `INSERT INTO job_photos (booking_id, photo_url, photo_type, uploaded_by)
         VALUES (?, ?, ?, ?)`,
        [booking_id, photo_url, photo_type, decoded.id]
      )

      // Update booking photo status
      if (photo_type === 'before') {
        await connection.execute(
          `UPDATE bookings SET before_photos_uploaded = TRUE WHERE id = ?`,
          [booking_id]
        )
      } else {
        await connection.execute(
          `UPDATE bookings SET after_photos_uploaded = TRUE WHERE id = ?`,
          [booking_id]
        )
      }

      await connection.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Photo uploaded successfully'
      })

    } catch (err) {
      await connection.query('ROLLBACK')
      throw err
    } finally {
      if (connection) connection.release()
    }

  } catch (error) {
    console.error('Error saving photo:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to save photo' 
    }, { status: 500 })
  }
}

// GET: Get photos for a booking
export async function GET(request) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const booking_id = searchParams.get('booking_id')

    if (!booking_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'booking_id required' 
      }, { status: 400 })
    }

    const { query } = await import('@/lib/db')
    
    const photos = await query(
      `SELECT * FROM job_photos 
       WHERE booking_id = ? 
       ORDER BY photo_type, uploaded_at`,
      [booking_id]
    )

    const grouped = {
      before: photos.filter(p => p.photo_type === 'before'),
      after: photos.filter(p => p.photo_type === 'after')
    }

    return NextResponse.json({
      success: true,
      data: grouped
    })

  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch photos' 
    }, { status: 500 })
  }
}