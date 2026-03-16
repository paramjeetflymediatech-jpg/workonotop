





// import { NextResponse } from 'next/server'
// import { execute, getConnection } from '@/lib/db'
// import { verifyToken } from '@/lib/jwt'

// // ── GET: List available jobs ──────────────────────────────────────────────────
// export async function GET(request) {
//   try {
//     const token = request.cookies.get('provider_token')?.value
//     if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
//     const decoded = verifyToken(token)
//     if (!decoded || decoded.type !== 'provider') return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

//     const { searchParams } = new URL(request.url)
//     const city = searchParams.get('city')
//     const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
//     const countOnly = searchParams.get('count') === 'true'
//     const previewLimit = parseInt(searchParams.get('preview') || '3')

//     const providers = await execute('SELECT city FROM service_providers WHERE id = ?', [decoded.providerId])
//     const providerCity = providers[0]?.city || ''
//     const locationFilter = city || providerCity

//     let sql = `
//       SELECT
//         b.id, b.booking_number, b.service_name, b.job_date, b.job_time_slot,
//         b.address_line1, b.city, b.postal_code,
//         b.job_description, b.parking_access, b.elevator_access, b.has_pets,
//         b.status, b.created_at, b.provider_id,
//         b.provider_amount, b.commission_percent,
//         b.service_price, b.additional_price as overtime_rate,
//         s.image_url as service_image,
//         s.duration_minutes as service_duration,
//         c.name as category_name, c.icon as category_icon,
//         CASE WHEN b.provider_id = ? THEN 1 ELSE 0 END as admin_assigned
//       FROM bookings b
//       LEFT JOIN services s ON b.service_id = s.id
//       LEFT JOIN service_categories c ON s.category_id = c.id
//       WHERE (
//         -- Open jobs: no provider assigned, any status pending/matching (commission not required)
//         (b.provider_id IS NULL AND b.status IN ('pending', 'matching'))
//         OR
//         -- Admin pre-assigned to THIS provider: show regardless of commission
//         (b.provider_id = ? AND b.status = 'matching')
//       )
//     `
//     const params = [decoded.providerId, decoded.providerId]

//     if (locationFilter) {
//       sql += ` AND (LOWER(b.city) LIKE LOWER(?) OR LOWER(b.address_line1) LIKE LOWER(?) OR LOWER(b.postal_code) LIKE LOWER(?))`
//       const loc = `%${locationFilter}%`
//       params.push(loc, loc, loc)
//     }

//     sql += ` ORDER BY admin_assigned DESC, b.created_at DESC`

//     const jobs = await execute(sql, params)

//     if (countOnly) {
//       const recentJobs = jobs.slice(0, previewLimit).map(job => ({
//         id: job.id,
//         service_name: job.service_name,
//         display_amount: `$${parseFloat(job.provider_amount || job.service_price || 0).toFixed(2)}`,
//         job_date: job.job_date,
//         city: job.city
//       }))
//       return NextResponse.json({ success: true, count: jobs.length, recentJobs, provider_city: providerCity })
//     }

//     for (const job of jobs) {
//       if (job.job_time_slot) job.job_time_slot = job.job_time_slot.split(',')

//       const basePrice = parseFloat(job.service_price || 0)
//       const commPct = parseFloat(job.commission_percent || 0)
//       const otRate = parseFloat(job.overtime_rate || 0)
//       const providerAmount = parseFloat(job.provider_amount || 0)
//       const duration = job.service_duration || 60
//       const commAmt = basePrice * (commPct / 100)
//       const baseEarnings = commPct > 0 ? basePrice - commAmt : basePrice
//       const netOT = otRate * (1 - commPct / 100)

//       job.pricing = {
//         base_price: basePrice,
//         commission_percent: commPct,
//         commission_amount: commAmt,
//         provider_base_earnings: baseEarnings,
//         has_overtime: otRate > 0,
//         overtime_rate: otRate,
//         net_overtime_rate: netOT,
//         total_provider_amount: providerAmount || basePrice,
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

//       // If no commission set, show base price as earnings
//       if (job.commission_percent === null) {
//         job.display_amount = `$${basePrice.toFixed(2)}`
//       } else {
//         job.display_amount = `$${(providerAmount || baseEarnings).toFixed(2)}`
//       }

//       job.is_admin_assigned = job.admin_assigned === 1
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

//       if (!job) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 })
//       }

//       // Allow if: no provider assigned yet, OR this provider was pre-assigned by admin
//       if (job.provider_id !== null && job.provider_id !== decoded.providerId) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'Job already accepted by another provider' }, { status: 409 })
//       }

//       if (!['pending', 'matching'].includes(job.status)) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: `Job not available (status: ${job.status})` }, { status: 409 })
//       }

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
//       const baseEarnings = commPct > 0 ? basePrice * (1 - commPct / 100) : basePrice
//       const netOT = otRate * (1 - commPct / 100)

//       const response = {
//         success: true,
//         message: `You accepted: ${job.service_name}`,
//         provider_amount: job.provider_amount || basePrice,
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









// import { NextResponse } from 'next/server'
// import { execute, getConnection } from '@/lib/db'
// import { verifyToken } from '@/lib/jwt'

// // ── GET: List available jobs ──────────────────────────────────────────────────
// export async function GET(request) {
//   try {
//     const token = request.cookies.get('provider_token')?.value
//     if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
//     const decoded = verifyToken(token)
//     if (!decoded || decoded.type !== 'provider') return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

//     const { searchParams } = new URL(request.url)
//     const city = searchParams.get('city')
//     const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
//     const countOnly = searchParams.get('count') === 'true'
//     const previewLimit = parseInt(searchParams.get('preview') || '3')

//     const providers = await execute('SELECT city FROM service_providers WHERE id = ?', [decoded.providerId])
//     const providerCity = providers[0]?.city || ''
//     const locationFilter = city || providerCity

//     let sql = `
//       SELECT
//         b.id, b.booking_number, b.service_name, b.job_date, b.job_time_slot,
//         b.address_line1, b.city, b.postal_code,
//         b.job_description, b.parking_access, b.elevator_access, b.has_pets,
//         b.status, b.created_at, b.provider_id,
//         b.provider_amount, b.commission_percent,
//         b.service_price, b.additional_price as overtime_rate,
//         s.image_url as service_image,
//         s.duration_minutes as service_duration,
//         c.name as category_name, c.icon as category_icon,
//         CASE WHEN b.provider_id = ? THEN 1 ELSE 0 END as admin_assigned
//       FROM bookings b
//       LEFT JOIN services s ON b.service_id = s.id
//       LEFT JOIN service_categories c ON s.category_id = c.id
//       WHERE (
//         -- ✅ FIXED: Sirf wohi jobs jahan commission set hai
//         b.commission_percent IS NOT NULL
//         AND
//         (
//           -- Open jobs: no provider assigned, any status pending/matching
//           (b.provider_id IS NULL AND b.status IN ('pending', 'matching'))
//           OR
//           -- Admin pre-assigned to THIS provider: show regardless of commission
//           (b.provider_id = ? AND b.status = 'matching')
//         )
//       )
//     `
//     const params = [decoded.providerId, decoded.providerId]

//     if (locationFilter) {
//       sql += ` AND (LOWER(b.city) LIKE LOWER(?) OR LOWER(b.address_line1) LIKE LOWER(?) OR LOWER(b.postal_code) LIKE LOWER(?))`
//       const loc = `%${locationFilter}%`
//       params.push(loc, loc, loc)
//     }

//     sql += ` ORDER BY admin_assigned DESC, b.created_at DESC`

//     const jobs = await execute(sql, params)

//     if (countOnly) {
//       const recentJobs = jobs.slice(0, previewLimit).map(job => ({
//         id: job.id,
//         service_name: job.service_name,
//         display_amount: `$${parseFloat(job.provider_amount || job.service_price || 0).toFixed(2)}`,
//         job_date: job.job_date,
//         city: job.city
//       }))
//       return NextResponse.json({ success: true, count: jobs.length, recentJobs, provider_city: providerCity })
//     }

//     for (const job of jobs) {
//       if (job.job_time_slot) job.job_time_slot = job.job_time_slot.split(',')

//       const basePrice = parseFloat(job.service_price || 0)
//       const commPct = parseFloat(job.commission_percent || 0)
//       const otRate = parseFloat(job.overtime_rate || 0)
//       const providerAmount = parseFloat(job.provider_amount || 0)
//       const duration = job.service_duration || 60
//       const commAmt = basePrice * (commPct / 100)
//       const baseEarnings = commPct > 0 ? basePrice - commAmt : basePrice
//       const netOT = otRate * (1 - commPct / 100)

//       job.pricing = {
//         base_price: basePrice,
//         commission_percent: commPct,
//         commission_amount: commAmt,
//         provider_base_earnings: baseEarnings,
//         has_overtime: otRate > 0,
//         overtime_rate: otRate,
//         net_overtime_rate: netOT,
//         total_provider_amount: providerAmount || basePrice,
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

//       job.display_amount = `$${(providerAmount || baseEarnings).toFixed(2)}`
//       job.is_admin_assigned = job.admin_assigned === 1
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

//       if (!job) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 })
//       }

//       // ✅ Check if commission is set
//       if (job.commission_percent === null) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ 
//           success: false, 
//           message: 'Commission not set yet. Job will be available once admin sets commission.' 
//         }, { status: 400 })
//       }

//       // Allow if: no provider assigned yet, OR this provider was pre-assigned by admin
//       if (job.provider_id !== null && job.provider_id !== decoded.providerId) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'Job already accepted by another provider' }, { status: 409 })
//       }

//       if (!['pending', 'matching'].includes(job.status)) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: `Job not available (status: ${job.status})` }, { status: 409 })
//       }

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
//       const baseEarnings = commPct > 0 ? basePrice * (1 - commPct / 100) : basePrice
//       const netOT = otRate * (1 - commPct / 100)

//       const response = {
//         success: true,
//         message: `You accepted: ${job.service_name}`,
//         provider_amount: job.provider_amount || basePrice,
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
import { verifyToken } from '@/lib/jwt'

// ── GET: List available jobs ──────────────────────────────────────────────────
export async function GET(request) {
  try {
    let token = request.cookies.get('provider_token')?.value
    
    if (!token) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    
    const decoded = verifyToken(token)
    const userType = decoded?.type || decoded?.role;

    if (!decoded || userType !== 'provider') {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const providerId = decoded.providerId || decoded.id;

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const countOnly = searchParams.get('count') === 'true'
    const previewLimit = parseInt(searchParams.get('preview') || '3')

    const providers = await execute('SELECT city FROM service_providers WHERE id = ?', [providerId])
    const providerCity = providers[0]?.city || ''
    const locationFilter = city || providerCity

    // ✅ Match provider city with booking city OR address_line1
    let locationCondition = ''
    const locationParams = []
    if (locationFilter) {
      locationCondition = `AND (LOWER(b.city) LIKE LOWER(?) OR LOWER(b.address_line1) LIKE LOWER(?))`
      const locMatch = `%${locationFilter}%`
      locationParams.push(locMatch, locMatch)
    }

    const sql = `
      SELECT
        b.id, b.booking_number, b.service_name, b.job_date, b.job_time_slot,
        b.address_line1, b.city, b.postal_code,
        b.job_description, b.parking_access, b.elevator_access, b.has_pets,
        b.status, b.created_at, b.provider_id,
        b.provider_amount, b.commission_percent,
        b.service_price, b.additional_price as overtime_rate,
        s.image_url as service_image,
        s.duration_minutes as service_duration,
        c.name as category_name, c.icon as category_icon,
        CASE WHEN b.provider_id = ? THEN 1 ELSE 0 END as admin_assigned
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE (
        -- ✅ Admin pre-assigned to THIS provider → no city filter, always show
        (
          b.provider_id = ?
          AND b.status = 'matching'
          AND b.commission_percent IS NOT NULL
        )
        OR
        -- ✅ Open jobs → match provider city with booking address_line1 only
        (
          b.provider_id IS NULL
          AND b.status IN ('pending', 'matching')
          AND b.commission_percent IS NOT NULL
          ${locationCondition}
        )
      )
      ORDER BY admin_assigned DESC, b.created_at DESC
    `

    const params = [
      providerId, // CASE WHEN
      providerId, // admin-assigned block
      ...locationParams,  // address_line1 match
    ]

    const jobs = await execute(sql, params)

    if (countOnly) {
      const recentJobs = jobs.slice(0, previewLimit).map(job => ({
        id: job.id,
        service_name: job.service_name,
        display_amount: `$${parseFloat(job.provider_amount || job.service_price || 0).toFixed(2)}`,
        job_date: job.job_date,
        city: job.city
      }))
      return NextResponse.json({ success: true, count: jobs.length, recentJobs, provider_city: providerCity })
    }

    for (const job of jobs) {
      if (job.job_time_slot) job.job_time_slot = job.job_time_slot.split(',')

      const basePrice      = parseFloat(job.service_price || 0)
      const commPct        = parseFloat(job.commission_percent || 0)
      const otRate         = parseFloat(job.overtime_rate || 0)
      const providerAmount = parseFloat(job.provider_amount || 0)
      const duration       = job.service_duration || 60
      const commAmt        = basePrice * (commPct / 100)
      const baseEarnings   = commPct > 0 ? basePrice - commAmt : basePrice
      const netOT          = otRate * (1 - commPct / 100)

      job.pricing = {
        base_price:             basePrice,
        commission_percent:     commPct,
        commission_amount:      commAmt,
        provider_base_earnings: baseEarnings,
        has_overtime:           otRate > 0,
        overtime_rate:          otRate,
        net_overtime_rate:      netOT,
        total_provider_amount:  providerAmount || basePrice,
        duration_minutes:       duration,
      }

      if (otRate > 0) {
        job.overtime_info = {
          rate_per_hour:     otRate,
          net_rate_per_hour: netOT,
          example_1hr:       baseEarnings + netOT,
          example_2hr:       baseEarnings + netOT * 2,
          message: `💰 Overtime: +$${otRate.toFixed(2)}/hr ($${netOT.toFixed(2)} after ${commPct}% commission)`,
        }
      }

      job.display_amount    = `$${(providerAmount || baseEarnings).toFixed(2)}`
      job.is_admin_assigned = job.admin_assigned === 1
    }

    return NextResponse.json({ success: true, data: jobs, provider_city: providerCity, total: jobs.length })

  } catch (error) {
    console.error('Error fetching available jobs:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch jobs' }, { status: 500 })
  }
}

// ── POST: Accept a job ────────────────────────────────────────────────────────
export async function POST(request) {
  let connection
  try {
    let token = request.cookies.get('provider_token')?.value

    if (!token) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    
    const decoded = verifyToken(token)
    const userType = decoded?.type || decoded?.role;

    if (!decoded || userType !== 'provider') {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const providerId = decoded.providerId || decoded.id;

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

      if (!job) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 })
      }

      if (job.commission_percent === null) {
        await connection.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          message: 'Commission not set yet. Job will be available once admin sets commission.'
        }, { status: 400 })
      }

      if (job.provider_id !== null && job.provider_id !== decoded.providerId) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'Job already accepted by another provider' }, { status: 409 })
      }

      if (!['pending', 'matching'].includes(job.status)) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: `Job not available (status: ${job.status})` }, { status: 409 })
      }

      await connection.execute(
        `UPDATE bookings SET provider_id = ?, status = 'confirmed', accepted_at = NOW(), updated_at = NOW() WHERE id = ?`,
        [providerId, booking_id]
      )
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'confirmed', ?)`,
        [booking_id, `Accepted by provider #${providerId}`]
      )

      await connection.query('COMMIT')

      const basePrice    = parseFloat(job.service_price || 0)
      const commPct      = parseFloat(job.commission_percent || 0)
      const otRate       = parseFloat(job.overtime_rate || 0)
      const baseEarnings = commPct > 0 ? basePrice * (1 - commPct / 100) : basePrice
      const netOT        = otRate * (1 - commPct / 100)

      const response = {
        success: true,
        message: `You accepted: ${job.service_name}`,
        provider_amount: job.provider_amount || basePrice,
      }

      if (otRate > 0) {
        response.overtime_info = {
          rate_per_hour:     otRate,
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