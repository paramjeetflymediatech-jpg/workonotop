// app/api/provider/available-jobs/[id]/route.js
import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getAuth(request) {
  const token = request.cookies.get('provider_token')?.value
  if (!token) return null
  const decoded = verifyToken(token)
  if (!decoded || decoded.type !== 'provider') return null
  return decoded
}

// Helper to get system settings
async function getSystemSetting(key, defaultValue = null) {
  try {
    const results = await execute('SELECT `value` FROM system_settings WHERE `key` = ?', [key])
    return results && results.length > 0 ? results[0].value : defaultValue
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return defaultValue
  }
}

// ── GET: Job detail ───────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const decoded = getAuth(request)
    if (!decoded) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

    const { id } = await params

    const defaultCommRaw = await getSystemSetting('default_commission', '20')
    const defaultComm = parseFloat(defaultCommRaw)

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
        s.duration_minutes AS service_duration,
        c.name AS category_name, c.icon AS category_icon
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE b.id = ?`,
      [id]
    )

    if (!results.length) return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 })

    const booking = { ...results[0] }

    const photos = await execute(
      'SELECT photo_url FROM booking_photos WHERE booking_id = ? ORDER BY created_at ASC',
      [id]
    )
    booking.photos = photos.map(p => p.photo_url)

    if (booking.job_time_slot) booking.job_time_slot = booking.job_time_slot.split(',')

    booking.base_price = parseFloat(booking.base_price || 0)
    booking.overtime_rate = parseFloat(booking.overtime_rate || 0)
    booking.provider_amount = parseFloat(booking.provider_amount || 0)
    booking.commission_percent = booking.commission_percent !== null ? parseFloat(booking.commission_percent) : defaultComm
    booking.service_duration = booking.service_duration || 60

    const commAmt = booking.base_price * (booking.commission_percent / 100)
    const baseEarnings = booking.base_price - commAmt
    const netOT = booking.overtime_rate * (1 - booking.commission_percent / 100)

    booking.breakdown = {
      base_price: booking.base_price,
      commission_percent: booking.commission_percent,
      commission_amount: commAmt,
      provider_base: baseEarnings,
      overtime_rate: booking.overtime_rate,
      net_overtime_rate: netOT,
      total_provider_amount: booking.provider_amount || baseEarnings,
      duration_minutes: booking.service_duration,
      one_hour_overtime_total: baseEarnings + netOT,
      two_hour_overtime_total: baseEarnings + netOT * 2,
    }

    let availability_reason = null
    const isAvailable = booking.provider_id === null && ['pending', 'matching'].includes(booking.status)

    if (!isAvailable) {
      if (booking.provider_id !== null) availability_reason = 'already_accepted'
      else availability_reason = 'not_available'
    }

    const isMyJob = booking.provider_id === decoded.providerId

    return NextResponse.json({
      success: true,
      data: booking,
      is_available: isAvailable,
      is_my_job: isMyJob,
      availability_reason
    })

  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch job' }, { status: 500 })
  }
}

// ── POST: Accept job ──────────────────────────────────────────────────────────
export async function POST(request, { params }) {
  let connection
  try {
    const decoded = getAuth(request)
    if (!decoded) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

    const { id } = await params

    const defaultCommRaw = await getSystemSetting('default_commission', '20')
    const defaultComm = parseFloat(defaultCommRaw)

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

      if (!job) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 }) }

      const commPct = job.commission_percent !== null ? parseFloat(job.commission_percent) : defaultComm

      if (job.provider_id !== null) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: 'Already accepted by another provider' }, { status: 409 }) }
      if (!['pending', 'matching'].includes(job.status)) { await connection.query('ROLLBACK'); return NextResponse.json({ success: false, message: `Not available (status: ${job.status})` }, { status: 409 }) }

      // Update commission if null
      if (job.commission_percent === null) {
        await connection.execute('UPDATE bookings SET commission_percent = ? WHERE id = ?', [commPct, id])
      }

      await connection.execute(
        `UPDATE bookings SET provider_id=?, status='confirmed', accepted_at=NOW(), updated_at=NOW() WHERE id=?`,
        [decoded.providerId, id]
      )
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'confirmed', ?)`,
        [id, `Accepted by provider #${decoded.providerId}`]
      )

      await connection.query('COMMIT')

      const otRate = parseFloat(job.overtime_rate || 0)
      const netOT = otRate * (1 - commPct / 100)
      const baseEarnings = parseFloat(job.service_price || 0) * (1 - commPct / 100)

      const response = {
        success: true,
        message: `Job accepted: ${job.service_name}`,
        provider_amount: job.provider_amount || baseEarnings,
      }

      if (otRate > 0) {
        response.overtime_info = {
          rate_per_hour: otRate,
          net_rate_per_hour: netOT,
          message: `Overtime available at $${otRate.toFixed(2)}/hr.`,
          potential: { one_hour: baseEarnings + netOT, two_hour: baseEarnings + netOT * 2 }
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