// // app/api/provider/available-jobs/route.js
// import { NextResponse } from 'next/server'
// import { execute, getConnection } from '@/lib/db'
// import { verifyToken } from '@/lib/jwt'  // ✅ same as /api/provider/me

// // ── GET: List available jobs ──────────────────────────────────────────────────
// export async function GET(request) {
//   try {
//     // ✅ Cookie-based auth
//     const token = request.cookies.get('provider_token')?.value
//     if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
//     const decoded = verifyToken(token)
//     if (!decoded || decoded.type !== 'provider') return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

//     const { searchParams } = new URL(request.url)
//     const city = searchParams.get('city')
//     const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

//     const providers = await execute('SELECT city FROM service_providers WHERE id = ?', [decoded.providerId])
//     const providerCity = providers[0]?.city || ''
//     const locationFilter = city || providerCity

//     let sql = `
//       SELECT
//         b.id, b.booking_number, b.service_name, b.job_date, b.job_time_slot,
//         b.address_line1, b.city, b.postal_code,
//         b.job_description, b.parking_access, b.elevator_access, b.has_pets,
//         b.status, b.created_at,
//         b.provider_amount, b.commission_percent,
//         b.service_price, b.additional_price as overtime_rate,
//         s.image_url as service_image,
//         s.duration_minutes as service_duration,
//         c.name as category_name, c.icon as category_icon
//       FROM bookings b
//       LEFT JOIN services s ON b.service_id = s.id
//       LEFT JOIN service_categories c ON s.category_id = c.id
//       WHERE b.provider_id IS NULL
//         AND b.status IN ('pending', 'matching')
//         AND b.commission_percent IS NOT NULL
//         AND b.provider_amount IS NOT NULL
//     `
//     const params = []

//     if (locationFilter) {
//       sql += ` AND (LOWER(b.city) LIKE LOWER(?) OR LOWER(b.address_line1) LIKE LOWER(?) OR LOWER(b.postal_code) LIKE LOWER(?))`
//       const loc = `%${locationFilter}%`
//       params.push(loc, loc, loc)
//     }

//     sql += ` ORDER BY b.created_at DESC LIMIT ${limit}`

//     const jobs = await execute(sql, params)

//     for (const job of jobs) {
//       if (job.job_time_slot) job.job_time_slot = job.job_time_slot.split(',')

//       const basePrice = parseFloat(job.service_price || 0)
//       const commPct = parseFloat(job.commission_percent || 0)
//       const otRate = parseFloat(job.overtime_rate || 0)
//       const providerAmount = parseFloat(job.provider_amount || 0)
//       const duration = job.service_duration || 60
//       const commAmt = basePrice * (commPct / 100)
//       const baseEarnings = basePrice - commAmt
//       const netOT = otRate * (1 - commPct / 100)

//       job.pricing = {
//         base_price: basePrice,
//         commission_percent: commPct,
//         commission_amount: commAmt,
//         provider_base_earnings: baseEarnings,
//         has_overtime: otRate > 0,
//         overtime_rate: otRate,
//         net_overtime_rate: netOT,
//         total_provider_amount: providerAmount,
//         duration_minutes: duration,
//       }

//       if (otRate > 0) {
//         job.overtime_info = {
//           rate_per_hour: otRate,
//           net_rate_per_hour: netOT,
//           example_1hr: baseEarnings + netOT,
//           example_2hr: baseEarnings + netOT * 2,
//           message: `💰 Overtime: +$${otRate.toFixed(2)}/hr ($${netOT.toFixed(2)} after ${commPct}% commission)`,
//         }
//       }

//       job.display_amount = `$${providerAmount.toFixed(2)}`
//     }

//     return NextResponse.json({ success: true, data: jobs, provider_city: providerCity, total: jobs.length })

//   } catch (error) {
//     console.error('Error fetching available jobs:', error)
//     return NextResponse.json({ success: false, message: 'Failed to fetch jobs' }, { status: 500 })
//   }
// }

// // ── POST: Accept a job ────────────────────────────────────────────────────────
// export async function POST(request) {
//   let connection
//   try {
//     // ✅ Cookie-based auth
//     const token = request.cookies.get('provider_token')?.value
//     if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
//     const decoded = verifyToken(token)
//     if (!decoded || decoded.type !== 'provider') return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

//     const { booking_id } = await request.json()
//     if (!booking_id) return NextResponse.json({ success: false, message: 'booking_id is required' }, { status: 400 })

//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     try {
//       const [[job]] = await connection.execute(
//         `SELECT b.id, b.provider_id, b.status, b.provider_amount, b.service_name,
//                 b.commission_percent, b.service_price, b.additional_price as overtime_rate,
//                 s.duration_minutes as service_duration
//          FROM bookings b
//          LEFT JOIN services s ON b.service_id = s.id
//          WHERE b.id = ? FOR UPDATE`,
//         [booking_id]
//       )

//       if (!job) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 }) }
//       if (job.commission_percent === null) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: 'Job not yet approved by admin' }, { status: 409 }) }
//       if (job.provider_id !== null) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: 'Job already accepted by another provider' }, { status: 409 }) }
//       if (!['pending', 'matching'].includes(job.status)) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: `Job not available (status: ${job.status})` }, { status: 409 }) }

//       await connection.execute(
//         `UPDATE bookings SET provider_id = ?, status = 'confirmed', accepted_at = NOW(), updated_at = NOW() WHERE id = ?`,
//         [decoded.providerId, booking_id]
//       )
//       await connection.execute(
//         `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'confirmed', ?)`,
//         [booking_id, `Accepted by provider #${decoded.providerId}`]
//       )

//       await connection.query('COMMIT')

//       const basePrice = parseFloat(job.service_price || 0)
//       const commPct = parseFloat(job.commission_percent || 0)
//       const otRate = parseFloat(job.overtime_rate || 0)
//       const baseEarnings = basePrice * (1 - commPct / 100)
//       const netOT = otRate * (1 - commPct / 100)

//       const response = {
//         success: true,
//         message: `You accepted: ${job.service_name}`,
//         provider_amount: job.provider_amount,
//       }

//       if (otRate > 0) {
//         response.overtime_info = {
//           rate_per_hour: otRate,
//           net_rate_per_hour: netOT,
//           message: `Overtime available at $${otRate.toFixed(2)}/hr ($${netOT.toFixed(2)} after ${commPct}% commission).`
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
//     return NextResponse.json({ success: false, message: 'Failed to accept job: ' + error.message }, { status: 500 })
//   }
// }














import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'  // ✅ same as /api/provider/me

// ── GET: List available jobs ──────────────────────────────────────────────────
export async function GET(request) {
  try {
    // ✅ Cookie-based auth
    const token = request.cookies.get('provider_token')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'provider') return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    
    // ✅ NEW: Check if we only need count
    const countOnly = searchParams.get('count') === 'true'
    const previewLimit = parseInt(searchParams.get('preview') || '3')

    const providers = await execute('SELECT city FROM service_providers WHERE id = ?', [decoded.providerId])
    const providerCity = providers[0]?.city || ''
    const locationFilter = city || providerCity

    let sql = `
      SELECT
        b.id, b.booking_number, b.service_name, b.job_date, b.job_time_slot,
        b.address_line1, b.city, b.postal_code,
        b.job_description, b.parking_access, b.elevator_access, b.has_pets,
        b.status, b.created_at,
        b.provider_amount, b.commission_percent,
        b.service_price, b.additional_price as overtime_rate,
        s.image_url as service_image,
        s.duration_minutes as service_duration,
        c.name as category_name, c.icon as category_icon
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
      sql += ` AND (LOWER(b.city) LIKE LOWER(?) OR LOWER(b.address_line1) LIKE LOWER(?) OR LOWER(b.postal_code) LIKE LOWER(?))`
      const loc = `%${locationFilter}%`
      params.push(loc, loc, loc)
    }

    sql += ` ORDER BY b.created_at DESC`
    
    // Execute query
    const jobs = await execute(sql, params)

    // ✅ NEW: If countOnly is true, return just the count and preview
    if (countOnly) {
      // Get recent jobs for preview (first few)
      const recentJobs = jobs.slice(0, previewLimit).map(job => {
        // Format basic info for preview
        const providerAmount = parseFloat(job.provider_amount || 0)
        return {
          id: job.id,
          service_name: job.service_name,
          display_amount: `$${providerAmount.toFixed(2)}`,
          job_date: job.job_date,
          city: job.city
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        count: jobs.length,
        recentJobs: recentJobs,
        provider_city: providerCity
      })
    }

    // ✅ Original flow: Full job details
    for (const job of jobs) {
      if (job.job_time_slot) job.job_time_slot = job.job_time_slot.split(',')

      const basePrice = parseFloat(job.service_price || 0)
      const commPct = parseFloat(job.commission_percent || 0)
      const otRate = parseFloat(job.overtime_rate || 0)
      const providerAmount = parseFloat(job.provider_amount || 0)
      const duration = job.service_duration || 60
      const commAmt = basePrice * (commPct / 100)
      const baseEarnings = basePrice - commAmt
      const netOT = otRate * (1 - commPct / 100)

      job.pricing = {
        base_price: basePrice,
        commission_percent: commPct,
        commission_amount: commAmt,
        provider_base_earnings: baseEarnings,
        has_overtime: otRate > 0,
        overtime_rate: otRate,
        net_overtime_rate: netOT,
        total_provider_amount: providerAmount,
        duration_minutes: duration,
      }

      if (otRate > 0) {
        job.overtime_info = {
          rate_per_hour: otRate,
          net_rate_per_hour: netOT,
          example_1hr: baseEarnings + netOT,
          example_2hr: baseEarnings + netOT * 2,
          message: `💰 Overtime: +$${otRate.toFixed(2)}/hr ($${netOT.toFixed(2)} after ${commPct}% commission)`,
        }
      }

      job.display_amount = `$${providerAmount.toFixed(2)}`
    }

    return NextResponse.json({ 
      success: true, 
      data: jobs, 
      provider_city: providerCity, 
      total: jobs.length 
    })

  } catch (error) {
    console.error('Error fetching available jobs:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch jobs' }, { status: 500 })
  }
}

// ── POST: Accept a job ────────────────────────────────────────────────────────
export async function POST(request) {
  let connection
  try {
    // ✅ Cookie-based auth
    const token = request.cookies.get('provider_token')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'provider') return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

    const { booking_id } = await request.json()
    if (!booking_id) return NextResponse.json({ success: false, message: 'booking_id is required' }, { status: 400 })

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
        [booking_id]
      )

      if (!job) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 }) }
      if (job.commission_percent === null) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: 'Job not yet approved by admin' }, { status: 409 }) }
      if (job.provider_id !== null) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: 'Job already accepted by another provider' }, { status: 409 }) }
      if (!['pending', 'matching'].includes(job.status)) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: `Job not available (status: ${job.status})` }, { status: 409 }) }

      await connection.execute(
        `UPDATE bookings SET provider_id = ?, status = 'confirmed', accepted_at = NOW(), updated_at = NOW() WHERE id = ?`,
        [decoded.providerId, booking_id]
      )
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'confirmed', ?)`,
        [booking_id, `Accepted by provider #${decoded.providerId}`]
      )

      await connection.query('COMMIT')

      const basePrice = parseFloat(job.service_price || 0)
      const commPct = parseFloat(job.commission_percent || 0)
      const otRate = parseFloat(job.overtime_rate || 0)
      const baseEarnings = basePrice * (1 - commPct / 100)
      const netOT = otRate * (1 - commPct / 100)

      const response = {
        success: true,
        message: `You accepted: ${job.service_name}`,
        provider_amount: job.provider_amount,
      }

      if (otRate > 0) {
        response.overtime_info = {
          rate_per_hour: otRate,
          net_rate_per_hour: netOT,
          message: `Overtime available at $${otRate.toFixed(2)}/hr ($${netOT.toFixed(2)} after ${commPct}% commission).`
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
    return NextResponse.json({ success: false, message: 'Failed to accept job: ' + error.message }, { status: 500 })
  }
}