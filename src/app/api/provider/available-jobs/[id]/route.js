// app/api/provider/available-jobs/[id]/route.js - FIXED
import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'  // ✅ CHANGE: query → execute
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

function verifyToken(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) return null
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

export async function GET(request, { params }) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // ✅ SINGLE QUERY - Booking + Photos ek saath using JSON
    const results = await execute(
      `SELECT
        b.id, b.booking_number, b.service_name, b.job_date, b.job_time_slot,
        b.address_line1, b.address_line2, b.city, b.postal_code,
        b.job_description, b.instructions, b.timing_constraints,
        b.parking_access, b.elevator_access, b.has_pets,
        b.status, b.provider_id, b.created_at,
        b.provider_amount, b.commission_percent,
        b.service_price as base_price,
        b.additional_price as overtime_rate,
        s.name AS service_full_name,
        s.description AS service_description,
        s.image_url AS service_image,
        s.duration_minutes AS service_duration,
        c.name AS category_name,
        c.icon AS category_icon,
        -- Photos as JSON array
        (
          SELECT JSON_ARRAYAGG(photo_url)
          FROM booking_photos 
          WHERE booking_id = b.id
        ) as photos_json
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE b.id = ?`,
      [id]
    )

    if (results.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 })
    }

    const booking = results[0]

    // Parse time slots
    if (booking.job_time_slot) {
      booking.job_time_slot = booking.job_time_slot.split(',')
    }

    // Parse photos from JSON
    try {
      booking.photos = JSON.parse(booking.photos_json) || []
    } catch {
      booking.photos = []
    }
    delete booking.photos_json

    // Parse numeric values
    booking.base_price = parseFloat(booking.base_price || 0)
    booking.overtime_rate = parseFloat(booking.overtime_rate || 0)
    booking.provider_amount = parseFloat(booking.provider_amount || 0)
    booking.commission_percent = booking.commission_percent ? parseFloat(booking.commission_percent) : null
    booking.service_duration = booking.service_duration || 60

    // Calculate breakdown with overtime commission
    const commissionAmount = booking.base_price * (booking.commission_percent / 100)
    const providerBaseAmount = booking.base_price - commissionAmount
    const netOvertimeRate = booking.overtime_rate * (1 - (booking.commission_percent / 100))

    booking.breakdown = {
      base_price: booking.base_price,
      commission_percent: booking.commission_percent,
      commission_amount: commissionAmount,
      provider_base: providerBaseAmount,
      overtime_rate: booking.overtime_rate,
      net_overtime_rate: netOvertimeRate,
      total_provider_amount: booking.provider_amount,
      duration_minutes: booking.service_duration,
      one_hour_overtime_total: providerBaseAmount + netOvertimeRate,
      two_hour_overtime_total: providerBaseAmount + (netOvertimeRate * 2)
    }

    const isAvailable = booking.provider_id === null && 
                       ['pending', 'matching'].includes(booking.status) &&
                       booking.commission_percent !== null
    const isMyJob = booking.provider_id === decoded.id

    return NextResponse.json({
      success: true,
      data: booking,
      is_available: isAvailable,
      is_my_job: isMyJob
    })

  } catch (error) {
    console.error('Error fetching job details:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch job' }, { status: 500 })
  }
  // ✅ Connection automatically released by execute()
}

// ✅ POST method is PERFECT - only change import from query to execute
export async function POST(request, { params }) {
  let connection
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      const [[job]] = await connection.execute(
        `SELECT b.id, b.provider_id, b.status, b.provider_amount, b.service_name, 
                b.commission_percent, b.service_price, b.additional_price as overtime_rate,
                s.duration_minutes as service_duration
         FROM bookings b
         LEFT JOIN services s ON b.service_id = s.id
         WHERE b.id = ? FOR UPDATE`,
        [id]
      )

      if (!job) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 })
      }

      if (job.commission_percent === null) {
        await connection.query('ROLLBACK')
        return NextResponse.json(
          { success: false, message: 'This job is not yet approved by admin' },
          { status: 409 }
        )
      }

      if (job.provider_id !== null) {
        await connection.query('ROLLBACK')
        return NextResponse.json(
          { success: false, message: 'This job was already accepted by another provider' },
          { status: 409 }
        )
      }

      if (!['pending', 'matching'].includes(job.status)) {
        await connection.query('ROLLBACK')
        return NextResponse.json(
          { success: false, message: `Job is no longer available (status: ${job.status})` },
          { status: 409 }
        )
      }

      await connection.execute(
        `UPDATE bookings
         SET provider_id = ?, status = 'confirmed', accepted_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [decoded.id, id]
      )

      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'confirmed', ?)`,
        [id, `Job accepted by provider #${decoded.id}`]
      )

      await connection.query('COMMIT')

      const basePrice = parseFloat(job.service_price || 0)
      const commissionPct = parseFloat(job.commission_percent || 0)
      const overtimeRate = parseFloat(job.overtime_rate || 0)
      const duration = job.service_duration || 60
      
      const netOvertimeRate = overtimeRate * (1 - commissionPct / 100)
      const providerBaseEarnings = basePrice * (1 - commissionPct / 100)

      return NextResponse.json({
        success: true,
        message: `Job accepted: ${job.service_name}`,
        provider_amount: job.provider_amount,
        overtime_rate: overtimeRate,
        net_overtime_rate: netOvertimeRate,
        duration_minutes: duration,
        potential_with_overtime: {
          one_hour: providerBaseEarnings + netOvertimeRate,
          two_hour: providerBaseEarnings + (netOvertimeRate * 2)
        }
      })

    } catch (err) {
      await connection.query('ROLLBACK')
      throw err
    } finally {
      connection.release()  // ✅ CRITICAL
    }

  } catch (error) {
    console.error('Error accepting job:', error)
    return NextResponse.json({ success: false, message: 'Failed to accept job: ' + error.message }, { status: 500 })
  }
}