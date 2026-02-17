




// // app/api/provider/available-jobs/route.js - COMPLETE UPDATED VERSION

// import { NextResponse } from 'next/server'
// import { query } from '@/lib/db'
// import jwt from 'jsonwebtoken'

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// export async function GET(request) {
//   try {
//     // ── Auth ──────────────────────────────────────────────────────────────────
//     const token = request.headers.get('Authorization')?.split(' ')[1]
//     if (!token) {
//       return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
//     }

//     let decoded
//     try {
//       decoded = jwt.verify(token, JWT_SECRET)
//     } catch {
//       return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
//     }

//     // ── Query params ──────────────────────────────────────────────────────────
//     const { searchParams } = new URL(request.url)
//     const city = searchParams.get('city')
//     const limit = parseInt(searchParams.get('limit') || '20')

//     // Get provider's city for default filtering
//     const providers = await query(
//       'SELECT city FROM service_providers WHERE id = ?',
//       [decoded.id]
//     )
//     const providerCity = providers[0]?.city || ''

//     // Use query param city first, fallback to provider's saved city
//     const locationFilter = city || providerCity

//     // ── Main query ────────────────────────────────────────────────────────────
//     // Show jobs where:
//     //  1. No provider assigned yet
//     //  2. Status is pending or matching
//     //  3. Commission has been set by admin (commission_percent IS NOT NULL)
//     //  4. Provider amount has been calculated (provider_amount IS NOT NULL)
//     let sql = `
//       SELECT
//         b.id,
//         b.booking_number,
//         b.service_name,
//         b.job_date,
//         b.job_time_slot,
//         b.address_line1,
//         b.city,
//         b.postal_code,
//         b.job_description,
//         b.parking_access,
//         b.elevator_access,
//         b.has_pets,
//         b.status,
//         b.created_at,
//         b.provider_amount,
//         b.commission_percent,
//         b.service_price,
//         b.additional_price as overtime_rate,
//         s.image_url as service_image,
//         c.name as category_name,
//         c.icon as category_icon
//       FROM bookings b
//       LEFT JOIN services s ON b.service_id = s.id
//       LEFT JOIN service_categories c ON s.category_id = c.id
//       WHERE b.provider_id IS NULL
//         AND b.status IN ('pending', 'matching')
//         AND b.commission_percent IS NOT NULL
//         AND b.provider_amount IS NOT NULL
//     `
//     const params = []

//     // Location filter — match city or address
//     if (locationFilter) {
//       sql += ` AND (
//         LOWER(b.city) LIKE LOWER(?) OR
//         LOWER(b.address_line1) LIKE LOWER(?) OR
//         LOWER(b.postal_code) LIKE LOWER(?)
//       )`
//       const loc = `%${locationFilter}%`
//       params.push(loc, loc, loc)
//     }

//     sql += ` ORDER BY b.created_at DESC LIMIT ${limit}`

//     const jobs = await execute_query(sql, params)

//     // Parse time slots and add enhanced info for each job
//     for (const job of jobs) {
//       if (job.job_time_slot) {
//         job.job_time_slot = job.job_time_slot.split(',')
//       }

//       // Parse numeric values
//       const basePrice = parseFloat(job.service_price || 0)
//       const commissionPct = parseFloat(job.commission_percent || 0)
//       const overtimeRate = parseFloat(job.overtime_rate || 0)
//       const providerAmount = parseFloat(job.provider_amount || 0)

//       // Calculate commission amount (on base price only)
//       const commissionAmount = basePrice * (commissionPct / 100)
      
//       // Provider base earnings (after commission, before overtime)
//       const providerBaseEarnings = basePrice - commissionAmount

//       // Add breakdown information
//       job.pricing = {
//         base_price: basePrice,
//         commission_percent: commissionPct,
//         commission_amount: commissionAmount,
//         provider_base_earnings: providerBaseEarnings,
//         has_overtime: overtimeRate > 0,
//         overtime_rate: overtimeRate,
//         total_provider_amount: providerAmount
//       }

//       // Display messages
//       if (overtimeRate > 0) {
//         // Calculate examples with overtime
//         const oneHourOvertime = providerAmount + overtimeRate
//         const twoHourOvertime = providerAmount + (overtimeRate * 2)
        
//         job.overtime_info = {
//           rate_per_hour: overtimeRate,
//           example_1hr: oneHourOvertime,
//           example_2hr: twoHourOvertime,
//           message: `💰 Overtime available: +$${overtimeRate.toFixed(2)}/hour`,
//           examples: `Earn $${oneHourOvertime.toFixed(2)} with 1hr OT, $${twoHourOvertime.toFixed(2)} with 2hr OT`
//         }
//       }

//       // Format display amount
//       job.display_amount = `$${providerAmount.toFixed(2)}`
//     }

//     return NextResponse.json({
//       success: true,
//       data: jobs,
//       provider_city: providerCity,
//       applied_filter: locationFilter,
//       total: jobs.length,
//       message: jobs.length > 0 ? `Found ${jobs.length} job(s) near you` : 'No jobs available in your area'
//     })

//   } catch (error) {
//     console.error('Error fetching available jobs:', error)
//     return NextResponse.json({ 
//       success: false, 
//       message: 'Failed to fetch jobs. Please try again.' 
//     }, { status: 500 })
//   }
// }

// // ─── POST: Provider accepts a job ────────────────────────────────────────────
// export async function POST(request) {
//   let connection
//   try {
//     const token = request.headers.get('Authorization')?.split(' ')[1]
//     if (!token) {
//       return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
//     }

//     let decoded
//     try {
//       decoded = jwt.verify(token, JWT_SECRET)
//     } catch {
//       return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
//     }

//     const { booking_id } = await request.json()
//     if (!booking_id) {
//       return NextResponse.json({ success: false, message: 'booking_id is required' }, { status: 400 })
//     }

//     const { getConnection } = await import('@/lib/db')
//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     try {
//       // Lock the row so two providers can't accept simultaneously
//       const [[job]] = await connection.execute(
//         `SELECT id, provider_id, status, provider_amount, service_name, 
//                 commission_percent, service_price, additional_price as overtime_rate
//          FROM bookings
//          WHERE id = ?
//          FOR UPDATE`,
//         [booking_id]
//       )

//       if (!job) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 })
//       }

//       // Check if commission is set
//       if (job.commission_percent === null) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json(
//           { success: false, message: 'This job is not yet approved by admin' },
//           { status: 409 }
//         )
//       }

//       // Already taken?
//       if (job.provider_id !== null) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json(
//           { success: false, message: 'This job was already accepted by another provider' },
//           { status: 409 }
//         )
//       }

//       // Wrong status?
//       if (!['pending', 'matching'].includes(job.status)) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json(
//           { success: false, message: `Job is not available (status: ${job.status})` },
//           { status: 409 }
//         )
//       }

//       // ── Assign provider ────────────────────────────────────────────────────
//       await connection.execute(
//         `UPDATE bookings
//          SET provider_id = ?, status = 'confirmed', accepted_at = NOW(), updated_at = NOW()
//          WHERE id = ?`,
//         [decoded.id, booking_id]
//       )

//       await connection.execute(
//         `INSERT INTO booking_status_history (booking_id, status, notes)
//          VALUES (?, 'confirmed', ?)`,
//         [booking_id, `Accepted by provider #${decoded.id}`]
//       )

//       await connection.query('COMMIT')

//       // Prepare response with overtime info
//       const basePrice = parseFloat(job.service_price || 0)
//       const commissionPct = parseFloat(job.commission_percent || 0)
//       const overtimeRate = parseFloat(job.overtime_rate || 0)
//       const commissionAmount = basePrice * (commissionPct / 100)
//       const providerBaseEarnings = basePrice - commissionAmount

//       const response = {
//         success: true,
//         message: `You accepted the job: ${job.service_name}`,
//         provider_amount: job.provider_amount,
//         breakdown: {
//           base_price: basePrice,
//           commission_percent: commissionPct,
//           commission_amount: commissionAmount,
//           provider_base_earnings: providerBaseEarnings,
//           overtime_rate: overtimeRate,
//           total: job.provider_amount
//         }
//       }

//       // Add overtime info if available
//       if (overtimeRate > 0) {
//         response.overtime_info = {
//           rate_per_hour: overtimeRate,
//           message: `This job offers overtime at $${overtimeRate.toFixed(2)}/hour. You'll earn extra for any time beyond the standard duration.`
//         }
//       }

//       return NextResponse.json(response)

//     } catch (err) {
//       await connection.query('ROLLBACK')
//       throw err
//     } finally {
//       if (connection) connection.release()
//     }

//   } catch (error) {
//     console.error('Error accepting job:', error)
//     return NextResponse.json({ 
//       success: false, 
//       message: 'Failed to accept job: ' + error.message 
//     }, { status: 500 })
//   }
// }

// // Helper for executing queries
// async function execute_query(sql, params) {
//   const { query } = await import('@/lib/db')
//   return query(sql, params)
// }






// app/api/provider/available-jobs/route.js - UPDATED with service duration

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

    // Main query - include service duration
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

      // Calculate commission amount
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
        const oneHourOvertime = providerAmount + overtimeRate
        const twoHourOvertime = providerAmount + (overtimeRate * 2)
        
        job.overtime_info = {
          rate_per_hour: overtimeRate,
          example_1hr: oneHourOvertime,
          example_2hr: twoHourOvertime,
          message: `💰 Overtime available: +$${overtimeRate.toFixed(2)}/hour`,
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
          total: job.provider_amount,
          duration_minutes: duration
        }
      }

      if (overtimeRate > 0) {
        response.overtime_info = {
          rate_per_hour: overtimeRate,
          message: `This job offers overtime at $${overtimeRate.toFixed(2)}/hour. Standard duration: ${duration} minutes.`
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
  const { query } = await import('@/lib/db')
  return query(sql, params)
}