import { NextResponse } from 'next/server'
import { execute, query, getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'
import { notifyUser } from '@/lib/push'

// ── GET: List available jobs ──────────────────────────────────────────────────
export async function GET(request) {
  let providerId = null;
  let locationFilter = '';
  let countOnly = false;

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

    providerId = decoded.providerId || decoded.id;
    if (!providerId) {
        return NextResponse.json({ success: false, message: 'Provider ID missing from token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cityParam = searchParams.get('city')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    countOnly = searchParams.get('count') === 'true'
    const previewLimit = parseInt(searchParams.get('preview') || '3')

    const providers = await execute('SELECT city FROM service_providers WHERE id = ?', [providerId])
    const providerCity = providers && providers.length > 0 ? (providers[0].city || '') : ''
    
    // Trim and handle case-insensitive city matching
    // ✅ NEW: If cityParam is explicitly provided, we filter strictly.
    // If not, we use providerCity for sorting/context but show everything.
    const activeCityFilter = cityParam ? cityParam.trim() : ''
    locationFilter = (activeCityFilter || providerCity || '').trim()

    let locationCondition = ''
    const locationParams = []
    if (activeCityFilter) {
      locationCondition = `AND (LOWER(b.city) LIKE LOWER(?) OR LOWER(b.address_line1) LIKE LOWER(?) OR LOWER(b.postal_code) LIKE LOWER(?))`
      const locMatch = `%${activeCityFilter}%`
      locationParams.push(locMatch, locMatch, locMatch)
    }

    // ✅ Optimized: If only count is needed, run a lighter query
    if (countOnly) {
      const countSql = `
        SELECT COUNT(*) as count
        FROM bookings b
        WHERE (
          (b.provider_id = ? AND b.status = 'matching')
          OR
          (b.provider_id IS NULL AND b.status IN ('pending', 'matching') ${locationCondition})
        )
      `
      const countResult = await query(countSql, [providerId, ...locationParams])
      
      const previewSql = `
        SELECT id, service_name, job_date, city, provider_amount, service_price, commission_percent
        FROM bookings b
        WHERE (
          (b.provider_id = ? AND b.status = 'matching')
          OR
          (b.provider_id IS NULL AND b.status IN ('pending', 'matching') ${locationCondition})
        )
        ORDER BY created_at DESC
        LIMIT ?
      `
      const previewJobs = await query(previewSql, [providerId, ...locationParams, previewLimit])
      
      const recentJobs = (previewJobs || []).map(job => ({
        id: job.id,
        service_name: job.service_name,
        display_amount: job.commission_percent === null ? 'Awaiting Approval' : `$${parseFloat(job.provider_amount || job.service_price || 0).toFixed(2)}`,
        job_date: job.job_date,
        city: job.city
      }))

      return NextResponse.json({ 
        success: true, 
        count: (countResult && countResult[0]) ? (countResult[0].count || 0) : 0, 
        recentJobs, 
        provider_city: providerCity 
      })
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
        (SELECT GROUP_CONCAT(photo_url) FROM booking_photos WHERE booking_id = b.id) as photos_csv,
        CASE WHEN b.provider_id = ? THEN 1 ELSE 0 END as admin_assigned,
        CASE WHEN LOWER(b.city) LIKE LOWER(?) THEN 1 ELSE 0 END as city_match
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE (
        -- ✅ Admin pre-assigned to THIS provider
        (
          b.provider_id = ?
          AND b.status = 'matching'
        )
        OR
        -- ✅ Open jobs
        (
          b.provider_id IS NULL
          AND b.status IN ('pending', 'matching')
          ${locationCondition}
        )
      )
      ORDER BY admin_assigned DESC, city_match DESC, b.created_at DESC
    `

    const params = [
      providerId, // CASE WHEN admin_assigned
      `%${providerCity}%`, // CASE WHEN city_match
      providerId, // admin-assigned block
      ...locationParams,  // location match
    ]

    const jobs = await execute(sql, params)

    const processedJobs = (jobs || []).map(job => {
      const j = { ...job }
      if (j.job_time_slot) j.job_time_slot = j.job_time_slot.split(',')
      
      j.photos = j.photos_csv ? j.photos_csv.split(',') : []
      delete j.photos_csv

      const isApproved = j.commission_percent !== null
      const basePrice      = parseFloat(j.service_price || 0)
      const commPct        = parseFloat(j.commission_percent || 0)
      const otRate         = parseFloat(j.overtime_rate || 0)
      const providerAmount = parseFloat(j.provider_amount || 0)
      const duration       = j.service_duration || 60
      const commAmt        = basePrice * (commPct / 100)
      const baseEarnings   = isApproved ? (basePrice - commAmt) : 0
      const netOT          = otRate * (1 - commPct / 100)

      j.pricing = {
        is_approved:            isApproved,
        base_price:             basePrice,
        commission_percent:     commPct,
        commission_amount:      commAmt,
        provider_base_earnings: baseEarnings,
        has_overtime:           otRate > 0,
        overtime_rate:          otRate,
        net_overtime_rate:      netOT,
        total_provider_amount:  providerAmount || baseEarnings || basePrice,
        duration_minutes:       duration,
      }

      if (otRate > 0 && isApproved) {
        j.overtime_info = {
          rate_per_hour:     otRate,
          net_rate_per_hour: netOT,
          example_1hr:       baseEarnings + netOT,
          example_2hr:       baseEarnings + netOT * 2,
          message: `💰 Overtime: +$${otRate.toFixed(2)}/hr ($${netOT.toFixed(2)} after ${commPct}% commission)`,
        }
      }

      j.display_amount    = isApproved ? `$${(providerAmount || baseEarnings).toFixed(2)}` : 'Awaiting Approval'
      j.is_admin_assigned = j.admin_assigned === 1
      return j
    })

    return NextResponse.json({ success: true, data: processedJobs, provider_city: providerCity, total: processedJobs.length })

  } catch (error) {
    console.error('Error fetching available jobs:', {
      message: error.message,
      stack: error.stack,
      providerId,
      locationFilter,
      countOnly
    })
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch jobs: ' + error.message,
      debug: {
        providerId: typeof providerId !== 'undefined' ? providerId : null,
        countOnly: typeof countOnly !== 'undefined' ? countOnly : null
      }
    }, { status: 500 })
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
        return NextResponse.json({ success: false, message: 'Job is awaiting admin approval' }, { status: 400 })
      }

      if (job.provider_id !== null && job.provider_id !== providerId) {
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

      // 🔔 Notify customer that their booking was accepted (non-blocking)
      try {
        const bookingRows = await execute(
          'SELECT user_id, booking_number FROM bookings WHERE id = ?',
          [booking_id]
        );
        const booking = bookingRows[0];
        if (booking?.user_id) {
          notifyUser(
            booking.user_id,
            '✅ Provider Confirmed!',
            `A provider has accepted your booking #${booking.booking_number || booking_id} for ${job.service_name}.`,
            { bookingId: booking_id, type: 'booking_confirmed' },
            execute,
            'customer'
          ).catch(e => console.warn('[Push] notify customer error:', e.message));
        }
      } catch (_) { }

      const basePrice = parseFloat(job.service_price || 0)
      const commPct = parseFloat(job.commission_percent || 0)
      const otRate = parseFloat(job.overtime_rate || 0)
      const baseEarnings = commPct > 0 ? basePrice * (1 - commPct / 100) : basePrice
      const netOT = otRate * (1 - commPct / 100)

      const response = {
        success: true,
        message: `You accepted: ${job.service_name}`,
        provider_amount: job.provider_amount || basePrice,
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
      if (connection) await connection.query('ROLLBACK')
      throw err
    } finally {
      if (connection) connection.release()
    }

  } catch (error) {
    console.error('Error accepting job:', error)
    return NextResponse.json({ success: false, message: 'Failed to accept job: ' + error.message }, { status: 500 })
  }
}
