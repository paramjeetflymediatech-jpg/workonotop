






// app/api/provider/jobs/time-tracking/route.js
import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  let connection
  try {
    const token = request.cookies.get('provider_token')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'provider') return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

    const { booking_id, action, notes, work_summary, recommendations } = await request.json()
    if (!booking_id || !action) return NextResponse.json({ success: false, message: 'booking_id and action required' }, { status: 400 })

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      const [[booking]] = await connection.execute(
        `SELECT b.*, s.duration_minutes as standard_duration,
                TIMESTAMPDIFF(MINUTE, b.start_time, NOW()) as current_duration
         FROM bookings b
         LEFT JOIN services s ON b.service_id = s.id
         WHERE b.id = ? AND b.provider_id = ?
         FOR UPDATE`,
        [booking_id, decoded.providerId]
      )

      if (!booking) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'Booking not found or not assigned to you' }, { status: 404 })
      }

      const now = new Date()
      const standardDuration = booking.standard_duration || 60
      const overtimeRate = parseFloat(booking.additional_price || 0)

      switch (action) {
        case 'start':
          if (booking.status !== 'confirmed') {
            await connection.query('ROLLBACK')
            return NextResponse.json({ success: false, message: 'Job must be confirmed to start' }, { status: 400 })
          }
          await connection.execute(
            `UPDATE bookings SET status = 'in_progress', start_time = ?, job_timer_status = 'running', updated_at = NOW() WHERE id = ?`,
            [now, booking_id]
          )
          await connection.execute(
            `INSERT INTO booking_time_logs (booking_id, action, timestamp, notes) VALUES (?, 'start', ?, ?)`,
            [booking_id, now, notes || 'Job started']
          )
          await connection.execute(
            `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'in_progress', 'Provider started the job')`,
            [booking_id]
          )
          break

        case 'pause':
          if (booking.status !== 'in_progress' || booking.job_timer_status !== 'running') {
            await connection.query('ROLLBACK')
            return NextResponse.json({ success: false, message: 'Timer is not running' }, { status: 400 })
          }
          await connection.execute(
            `UPDATE bookings SET job_timer_status = 'paused', updated_at = NOW() WHERE id = ?`,
            [booking_id]
          )
          await connection.execute(
            `INSERT INTO booking_time_logs (booking_id, action, timestamp, notes) VALUES (?, 'pause', ?, ?)`,
            [booking_id, now, notes || 'Job paused']
          )
          break

        case 'resume':
          if (booking.status !== 'in_progress' || booking.job_timer_status !== 'paused') {
            await connection.query('ROLLBACK')
            return NextResponse.json({ success: false, message: 'Timer is not paused' }, { status: 400 })
          }
          await connection.execute(
            `UPDATE bookings SET job_timer_status = 'running', updated_at = NOW() WHERE id = ?`,
            [booking_id]
          )
          await connection.execute(
            `INSERT INTO booking_time_logs (booking_id, action, timestamp, notes) VALUES (?, 'resume', ?, ?)`,
            [booking_id, now, notes || 'Job resumed']
          )
          break

        case 'stop': {
          if (booking.status !== 'in_progress') {
            await connection.query('ROLLBACK')
            return NextResponse.json({ success: false, message: 'Job must be in progress to complete' }, { status: 400 })
          }

          // Calculate total duration from logs
          const [logs] = await connection.execute(
            `SELECT * FROM booking_time_logs WHERE booking_id = ? AND action IN ('start', 'pause', 'resume', 'stop') ORDER BY timestamp ASC`,
            [booking_id]
          )

          let totalMinutes = 0
          let lastStart = null
          logs.forEach(log => {
            const logTime = new Date(log.timestamp)
            if (log.action === 'start' || log.action === 'resume') {
              lastStart = logTime
            } else if ((log.action === 'pause' || log.action === 'stop') && lastStart) {
              totalMinutes += Math.round((logTime - lastStart) / 60000)
              lastStart = null
            }
          })
          if (lastStart) {
            totalMinutes += Math.round((now - lastStart) / 60000)
          }

          const overtimeMinutes = Math.max(0, totalMinutes - standardDuration)
          const commPct = parseFloat(booking.commission_percent || 20)
          const overtimeEarnings = (overtimeMinutes / 60) * overtimeRate * (1 - commPct / 100)
          const finalAmount = parseFloat(booking.provider_amount || 0) + overtimeEarnings

          await connection.execute(
            `UPDATE bookings SET 
              status = 'awaiting_approval',
              end_time = ?,
              actual_duration_minutes = ?,
              overtime_minutes = ?,
              overtime_earnings = ?,
              final_provider_amount = ?,
              job_timer_status = 'completed',
              updated_at = NOW()
             WHERE id = ?`,
            [now, totalMinutes, overtimeMinutes, overtimeEarnings, finalAmount, booking_id]
          )

          await connection.execute(
            `INSERT INTO booking_time_logs (booking_id, action, timestamp, notes) VALUES (?, 'stop', ?, ?)`,
            [booking_id, now, notes || `Job finished. Duration: ${totalMinutes} mins`]
          )

          await connection.execute(
            `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'awaiting_approval', ?)`,
            [booking_id, `Summary: ${work_summary || 'Job done'}. Recommendations: ${recommendations || 'None'}`]
          )

          await connection.query('COMMIT')

          // Send email to customer AFTER commit
          try {
            const [provider] = await execute(
              `SELECT name FROM service_providers WHERE id = ?`,
              [decoded.providerId]
            )

            const providerName = provider?.name || 'Your Provider'
            const customerName = booking.customer_first_name || 'Customer'

            const formatDuration = (mins) => {
              if (!mins) return 'N/A'
              const h = Math.floor(mins / 60)
              const m = mins % 60
              if (h > 0 && m > 0) return `${h}h ${m}m`
              if (h > 0) return `${h}h`
              return `${m} min`
            }

            const formatDateTime = (dt) => {
              if (!dt) return 'N/A'
              return new Date(dt).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })
            }

            const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:20px;">
          <span style="font-size:22px;font-weight:700;color:#0f766e;letter-spacing:-0.5px;">Work<span style="color:#0891b2;">On</span>Tap</span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:linear-gradient(135deg,#15803d 0%,#0891b2 100%);padding:40px 32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">✅</div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Job Completed!</h1>
            </td></tr>
          </table>

          <!-- Body -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:36px 40px 32px;">

              <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${customerName} 👋</p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
                Your <strong>${booking.service_name}</strong> service has been completed by <strong>${providerName}</strong>.
                Here's a full summary of the work done.
              </p>

              <!-- Job Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
                <tr><td style="padding:20px 24px;">
                  <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Job Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:5px 0;font-size:14px;color:#64748b;width:140px;">Booking #</td>
                      <td style="padding:5px 0;font-size:14px;font-weight:600;color:#0f172a;">${booking.booking_number}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:14px;color:#64748b;">Service</td>
                      <td style="padding:5px 0;font-size:14px;font-weight:600;color:#0f172a;">${booking.service_name}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:14px;color:#64748b;">Provider</td>
                      <td style="padding:5px 0;font-size:14px;font-weight:600;color:#0f172a;">${providerName}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:14px;color:#64748b;">Started</td>
                      <td style="padding:5px 0;font-size:14px;font-weight:600;color:#0f172a;">${formatDateTime(booking.start_time)}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:14px;color:#64748b;">Completed</td>
                      <td style="padding:5px 0;font-size:14px;font-weight:600;color:#0f172a;">${formatDateTime(now)}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:14px;color:#64748b;">Duration</td>
                      <td style="padding:5px 0;font-size:14px;font-weight:700;color:#16a34a;">${formatDuration(totalMinutes)}</td>
                    </tr>
                    ${overtimeMinutes > 0 ? `
                    <tr>
                      <td style="padding:5px 0;font-size:14px;color:#64748b;">Overtime</td>
                      <td style="padding:5px 0;font-size:14px;font-weight:600;color:#15843E;">${formatDuration(overtimeMinutes)}</td>
                    </tr>
                    ` : ''}
                  </table>
                </td></tr>
              </table>

              <!-- Work Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #86efac;border-left:4px solid #16a34a;border-radius:8px;margin-bottom:24px;">
                <tr><td style="padding:18px 20px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;">✅ Work Summary</p>
                  <p style="margin:0;font-size:14px;color:#166534;line-height:1.7;">${work_summary || 'Job completed successfully.'}</p>
                </td></tr>
              </table>

              ${recommendations ? `
              <!-- Recommendations -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-left:4px solid #f97316;border-radius:8px;margin-bottom:24px;">
                <tr><td style="padding:18px 20px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:0.5px;">🔧 Recommendations</p>
                  <p style="margin:0;font-size:14px;color:#7c2d12;line-height:1.7;">${recommendations}</p>
                </td></tr>
              </table>
              ` : ''}

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />

              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">
                Questions? Contact us at <a href="mailto:support@workontap.com" style="color:#0891b2;text-decoration:none;">support@workontap.com</a>
              </p>

            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;text-align:center;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} WorkOnTap · Calgary, Alberta, Canada</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

            await sendEmail({
              to: booking.customer_email,
              subject: `✅ Job Completed - ${booking.service_name} | Booking #${booking.booking_number}`,
              html: emailHtml,
              text: `Hi ${customerName}, your ${booking.service_name} job has been completed by ${providerName}. Work Summary: ${work_summary || 'Job done'}.${recommendations ? ` Recommendations: ${recommendations}` : ''}`
            })
          } catch (emailErr) {
            console.error('Email send failed:', emailErr)
          }

          return NextResponse.json({
            success: true,
            message: 'Job submitted for customer approval',
            data: {
              total_minutes: totalMinutes,
              standard_minutes: standardDuration,
              overtime_minutes: overtimeMinutes,
              overtime_rate: overtimeRate,
              overtime_earnings: overtimeEarnings,
              base_earnings: parseFloat(booking.provider_amount),
              total_earnings: finalAmount
            }
          })
        }

        default:
          await connection.query('ROLLBACK')
          return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
      }

      await connection.query('COMMIT')

      const [[updated]] = await connection.execute(
        `SELECT status, job_timer_status, start_time FROM bookings WHERE id = ?`,
        [booking_id]
      )

      return NextResponse.json({
        success: true,
        message: `Timer ${action}ed successfully`,
        data: updated
      })

    } catch (err) {
      await connection.query('ROLLBACK')
      throw err
    } finally {
      if (connection) connection.release()
    }

  } catch (error) {
    console.error('Error in time tracking:', error)
    return NextResponse.json({ success: false, message: 'Failed to process request: ' + error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const token = request.cookies.get('provider_token')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'provider') return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const booking_id = searchParams.get('booking_id')
    if (!booking_id) return NextResponse.json({ success: false, message: 'booking_id required' }, { status: 400 })

    const bookings = await execute(
      `SELECT 
        b.id, b.status, b.job_timer_status, b.start_time, b.end_time,
        b.actual_duration_minutes, b.overtime_minutes, b.overtime_earnings,
        b.provider_amount, b.final_provider_amount, b.service_price,
        b.additional_price as overtime_rate,
        s.duration_minutes as standard_duration,
        TIMESTAMPDIFF(MINUTE, b.start_time, NOW()) as current_duration,
        (SELECT COUNT(*) FROM job_photos WHERE booking_id = b.id AND photo_type = 'before') > 0 as has_before_photos,
        (SELECT COUNT(*) FROM job_photos WHERE booking_id = b.id AND photo_type = 'after') > 0 as has_after_photos
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.id = ? AND b.provider_id = ?`,
      [booking_id, decoded.providerId]
    )

    if (bookings.length === 0) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })

    const logs = await execute(
      `SELECT * FROM booking_time_logs WHERE booking_id = ? ORDER BY timestamp DESC`,
      [booking_id]
    )

    return NextResponse.json({ success: true, data: bookings[0], logs })

  } catch (error) {
    console.error('Error fetching timer status:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch timer status' }, { status: 500 })
  }
}