// app/api/provider/available-jobs/route.js - COMPLETE FIXED VERSION

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get provider's city
    const providers = await query(
      'SELECT city FROM service_providers WHERE id = ?',
      [decoded.id]
    )
    const providerCity = providers[0]?.city || ''

    const locationFilter = city || providerCity

    // Main query - NO customer contact info
    let sql = `
      SELECT
        b.id,
        b.booking_number,
        b.service_name,
        b.job_date,
        b.job_time_slot,
        b.address_line1,
        b.city,
        b.postal_code,
        b.job_description,
        b.parking_access,
        b.elevator_access,
        b.has_pets,
        b.status,
        b.created_at,
        b.provider_amount,
        b.commission_percent,
        b.service_price,
        b.additional_price as overtime_rate,
        s.image_url as service_image,
        s.duration_minutes as service_duration,
        c.name as category_name,
        c.icon as category_icon
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE b.provider_id IS NULL
        AND b.status IN ('pending', 'matching')
        AND b.commission_percent IS NOT NULL
        AND b.provider_amount IS NOT NULL
    `
    const params = []

    if (locationFilter) {
      sql += ` AND (
        LOWER(b.city) LIKE LOWER(?) OR
        LOWER(b.address_line1) LIKE LOWER(?) OR
        LOWER(b.postal_code) LIKE LOWER(?)
      )`
      const loc = `%${locationFilter}%`
      params.push(loc, loc, loc)
    }

    sql += ` ORDER BY b.created_at DESC LIMIT ${limit}`

    const jobs = await execute_query(sql, params)

    for (const job of jobs) {
      if (job.job_time_slot) {
        job.job_time_slot = job.job_time_slot.split(',')
      }

      // Parse numeric values
      const basePrice = parseFloat(job.service_price || 0)
      const commissionPct = parseFloat(job.commission_percent || 0)
      const overtimeRate = parseFloat(job.overtime_rate || 0)
      const providerAmount = parseFloat(job.provider_amount || 0)
      const duration = job.service_duration || 60

      // Calculate commission on base price
      const commissionAmount = basePrice * (commissionPct / 100)
      const providerBaseEarnings = basePrice - commissionAmount

      job.pricing = {
        base_price: basePrice,
        commission_percent: commissionPct,
        commission_amount: commissionAmount,
        provider_base_earnings: providerBaseEarnings,
        has_overtime: overtimeRate > 0,
        overtime_rate: overtimeRate,
        total_provider_amount: providerAmount,
        duration_minutes: duration
      }

      if (overtimeRate > 0) {
        // Calculate net overtime rate after commission
        const grossOvertimeRate = overtimeRate
        const netOvertimeRate = grossOvertimeRate * (1 - commissionPct / 100)
        
        // Calculate total with overtime (including commission on overtime)
        const oneHourOvertime = providerBaseEarnings + netOvertimeRate
        const twoHourOvertime = providerBaseEarnings + (netOvertimeRate * 2)
        
        job.overtime_info = {
          rate_per_hour: grossOvertimeRate,
          net_rate_per_hour: netOvertimeRate,
          example_1hr: oneHourOvertime,
          example_2hr: twoHourOvertime,
          message: `💰 Overtime available: +$${grossOvertimeRate.toFixed(2)}/hour ($${netOvertimeRate.toFixed(2)} after ${commissionPct}% commission)`,
          examples: `Earn $${oneHourOvertime.toFixed(2)} with 1hr OT, $${twoHourOvertime.toFixed(2)} with 2hr OT`
        }
      }

      job.display_amount = `$${providerAmount.toFixed(2)}`
      job.duration_display = `${duration} minutes`
    }

    return NextResponse.json({
      success: true,
      data: jobs,
      provider_city: providerCity,
      applied_filter: locationFilter,
      total: jobs.length
    })

  } catch (error) {
    console.error('Error fetching available jobs:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch jobs' 
    }, { status: 500 })
  }
}

// ─── POST: Provider accepts a job ────────────────────────────────────────────
export async function POST(request) {
  let connection
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { booking_id } = await request.json()
    if (!booking_id) {
      return NextResponse.json({ success: false, message: 'booking_id is required' }, { status: 400 })
    }

    const { getConnection } = await import('@/lib/db')
    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      const [[job]] = await connection.execute(
        `SELECT b.id, b.provider_id, b.status, b.provider_amount, b.service_name, 
                b.commission_percent, b.service_price, b.additional_price as overtime_rate,
                s.duration_minutes as service_duration
         FROM bookings b
         LEFT JOIN services s ON b.service_id = s.id
         WHERE b.id = ?
         FOR UPDATE`,
        [booking_id]
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
          { success: false, message: `Job is not available (status: ${job.status})` },
          { status: 409 }
        )
      }

      await connection.execute(
        `UPDATE bookings
         SET provider_id = ?, status = 'confirmed', accepted_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [decoded.id, booking_id]
      )

      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes)
         VALUES (?, 'confirmed', ?)`,
        [booking_id, `Accepted by provider #${decoded.id}`]
      )

      await connection.query('COMMIT')

      const basePrice = parseFloat(job.service_price || 0)
      const commissionPct = parseFloat(job.commission_percent || 0)
      const overtimeRate = parseFloat(job.overtime_rate || 0)
      const commissionAmount = basePrice * (commissionPct / 100)
      const providerBaseEarnings = basePrice - commissionAmount
      const duration = job.service_duration || 60

      // Calculate net overtime rate after commission
      const netOvertimeRate = overtimeRate * (1 - commissionPct / 100)

      const response = {
        success: true,
        message: `You accepted the job: ${job.service_name}`,
        provider_amount: job.provider_amount,
        breakdown: {
          base_price: basePrice,
          commission_percent: commissionPct,
          commission_amount: commissionAmount,
          provider_base_earnings: providerBaseEarnings,
          overtime_rate: overtimeRate,
          net_overtime_rate: netOvertimeRate,
          total: job.provider_amount,
          duration_minutes: duration
        }
      }

      if (overtimeRate > 0) {
        const oneHourTotal = providerBaseEarnings + netOvertimeRate
        const twoHourTotal = providerBaseEarnings + (netOvertimeRate * 2)
        
        response.overtime_info = {
          rate_per_hour: overtimeRate,
          net_rate_per_hour: netOvertimeRate,
          example_1hr: oneHourTotal,
          example_2hr: twoHourTotal,
          message: `This job offers overtime at $${overtimeRate.toFixed(2)}/hour ($${netOvertimeRate.toFixed(2)} after ${commissionPct}% commission). Standard duration: ${duration} minutes.`
        }
      }

      return NextResponse.json(response)

    } catch (err) {
      await connection.query('ROLLBACK')
      throw err
    } finally {
      if (connection) connection.release()
    }

  } catch (error) {
    console.error('Error accepting job:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to accept job: ' + error.message 
    }, { status: 500 })
  }
}

async function execute_query(sql, params) {
  try {
    const { query } = await import('@/lib/db')
    return await query(sql, params)
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}


