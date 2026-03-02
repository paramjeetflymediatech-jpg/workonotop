// // app/api/provider/jobs/time-tracking/route.js - FIXED with cookie auth
// import { NextResponse } from 'next/server'
// import { execute, getConnection } from '@/lib/db'
// import { verifyToken } from '@/lib/jwt'  // Import from your jwt utility

// // POST: Start/Stop/Pause timer
// export async function POST(request) {
//   let connection
//   try {
//     // ✅ Cookie-based auth
//     const token = request.cookies.get('provider_token')?.value
//     if (!token) {
//       return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
//     }
    
//     const decoded = verifyToken(token)
//     if (!decoded || decoded.type !== 'provider') {
//       return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
//     }

//     const { booking_id, action, notes } = await request.json()
    
//     if (!booking_id || !action) {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'booking_id and action required' 
//       }, { status: 400 })
//     }

//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     try {
//       // Get current booking with lock - using decoded.providerId
//       const [[booking]] = await connection.execute(
//         `SELECT b.*, s.duration_minutes as standard_duration,
//                 TIMESTAMPDIFF(MINUTE, b.start_time, NOW()) as current_duration
//          FROM bookings b
//          LEFT JOIN services s ON b.service_id = s.id
//          WHERE b.id = ? AND b.provider_id = ?
//          FOR UPDATE`,
//         [booking_id, decoded.providerId]  // Note: using providerId, not id
//       )

//       if (!booking) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ 
//           success: false, 
//           message: 'Booking not found or not assigned to you' 
//         }, { status: 404 })
//       }

//       const now = new Date()
//       const standardDuration = booking.standard_duration || 60
//       const overtimeRate = parseFloat(booking.additional_price || 0)

//       // Handle different actions
//       switch(action) {
//         case 'start':
//           if (booking.status !== 'confirmed') {
//             await connection.query('ROLLBACK')
//             return NextResponse.json({ 
//               success: false, 
//               message: 'Job must be confirmed to start' 
//             }, { status: 400 })
//           }

//           await connection.execute(
//             `UPDATE bookings 
//              SET status = 'in_progress', 
//                  start_time = ?, 
//                  job_timer_status = 'running',
//                  updated_at = NOW() 
//              WHERE id = ?`,
//             [now, booking_id]
//           )
          
//           await connection.execute(
//             `INSERT INTO booking_time_logs (booking_id, action, timestamp, notes) 
//              VALUES (?, 'start', ?, ?)`,
//             [booking_id, now, notes || 'Job started']
//           )
          
//           break

//         case 'pause':
//           if (booking.status !== 'in_progress' || booking.job_timer_status !== 'running') {
//             await connection.query('ROLLBACK')
//             return NextResponse.json({ 
//               success: false, 
//               message: 'Timer is not running' 
//             }, { status: 400 })
//           }

//           await connection.execute(
//             `UPDATE bookings 
//              SET job_timer_status = 'paused',
//                  updated_at = NOW() 
//              WHERE id = ?`,
//             [booking_id]
//           )
          
//           await connection.execute(
//             `INSERT INTO booking_time_logs (booking_id, action, timestamp, notes) 
//              VALUES (?, 'pause', ?, ?)`,
//             [booking_id, now, notes || 'Job paused']
//           )
          
//           break

//         case 'resume':
//           if (booking.status !== 'in_progress' || booking.job_timer_status !== 'paused') {
//             await connection.query('ROLLBACK')
//             return NextResponse.json({ 
//               success: false, 
//               message: 'Timer is not paused' 
//             }, { status: 400 })
//           }

//           await connection.execute(
//             `UPDATE bookings 
//              SET job_timer_status = 'running',
//                  updated_at = NOW() 
//              WHERE id = ?`,
//             [booking_id]
//           )
          
//           await connection.execute(
//             `INSERT INTO booking_time_logs (booking_id, action, timestamp, notes) 
//              VALUES (?, 'resume', ?, ?)`,
//             [booking_id, now, notes || 'Job resumed']
//           )
          
//           break

//         case 'stop':
//           if (booking.status !== 'in_progress') {
//             await connection.query('ROLLBACK')
//             return NextResponse.json({ 
//               success: false, 
//               message: 'Job must be in progress to complete' 
//             }, { status: 400 })
//           }

//           // Calculate total duration from logs
//           const [logs] = await connection.execute(
//             `SELECT * FROM booking_time_logs 
//              WHERE booking_id = ? AND action IN ('start', 'pause', 'resume', 'stop')
//              ORDER BY timestamp ASC`,
//             [booking_id]
//           )

//           let totalMinutes = 0
//           let lastStart = null

//           logs.forEach(log => {
//             const logTime = new Date(log.timestamp)
//             if (log.action === 'start' || log.action === 'resume') {
//               lastStart = logTime
//             } else if (log.action === 'pause' || log.action === 'stop') {
//               if (lastStart) {
//                 const diffMinutes = Math.round((logTime - lastStart) / 60000)
//                 totalMinutes += diffMinutes
//                 lastStart = null
//               }
//             }
//           })

//           // Add time from last start to now if timer was running
//           if (lastStart) {
//             const diffMinutes = Math.round((now - lastStart) / 60000)
//             totalMinutes += diffMinutes
//           }

//           // Calculate overtime
//           const overtimeMinutes = Math.max(0, totalMinutes - standardDuration)
//           const overtimeEarnings = (overtimeMinutes / 60) * overtimeRate
//           const finalAmount = parseFloat(booking.provider_amount || 0) + overtimeEarnings

//           await connection.execute(
//             `UPDATE bookings 
//              SET status = 'completed',
//                  end_time = ?,
//                  actual_duration_minutes = ?,
//                  overtime_minutes = ?,
//                  overtime_earnings = ?,
//                  final_provider_amount = ?,
//                  job_timer_status = 'completed',
//                  updated_at = NOW()
//              WHERE id = ?`,
//             [now, totalMinutes, overtimeMinutes, overtimeEarnings, finalAmount, booking_id]
//           )

//           await connection.execute(
//             `INSERT INTO booking_time_logs (booking_id, action, timestamp, notes) 
//              VALUES (?, 'stop', ?, ?)`,
//             [booking_id, now, notes || `Job completed. Duration: ${totalMinutes} mins`]
//           )

//           await connection.query('COMMIT')

//           return NextResponse.json({
//             success: true,
//             message: 'Job completed successfully',
//             data: {
//               total_minutes: totalMinutes,
//               standard_minutes: standardDuration,
//               overtime_minutes: overtimeMinutes,
//               overtime_rate: overtimeRate,
//               overtime_earnings: overtimeEarnings,
//               base_earnings: parseFloat(booking.provider_amount),
//               total_earnings: finalAmount
//             }
//           })

//         default:
//           await connection.query('ROLLBACK')
//           return NextResponse.json({ 
//             success: false, 
//             message: 'Invalid action' 
//           }, { status: 400 })
//       }

//       await connection.query('COMMIT')

//       // Get updated booking data
//       const [[updated]] = await connection.execute(
//         `SELECT status, job_timer_status, start_time 
//          FROM bookings WHERE id = ?`,
//         [booking_id]
//       )

//       return NextResponse.json({
//         success: true,
//         message: `Timer ${action}ed successfully`,
//         data: updated
//       })

//     } catch (err) {
//       await connection.query('ROLLBACK')
//       throw err
//     } finally {
//       if (connection) connection.release()
//     }

//   } catch (error) {
//     console.error('Error in time tracking:', error)
//     return NextResponse.json({ 
//       success: false, 
//       message: 'Failed to process request: ' + error.message 
//     }, { status: 500 })
//   }
// }

// // GET: Get timer status for a job
// export async function GET(request) {
//   try {
//     // ✅ Cookie-based auth
//     const token = request.cookies.get('provider_token')?.value
//     if (!token) {
//       return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
//     }
    
//     const decoded = verifyToken(token)
//     if (!decoded || decoded.type !== 'provider') {
//       return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const booking_id = searchParams.get('booking_id')

//     if (!booking_id) {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'booking_id required' 
//       }, { status: 400 })
//     }

//     // Use decoded.providerId
//     const bookings = await execute(
//       `SELECT 
//         b.id, 
//         b.status, 
//         b.job_timer_status,
//         b.start_time,
//         b.end_time,
//         b.actual_duration_minutes,
//         b.overtime_minutes,
//         b.overtime_earnings,
//         b.provider_amount,
//         b.final_provider_amount,
//         b.service_price,
//         b.additional_price as overtime_rate,
//         s.duration_minutes as standard_duration,
//         TIMESTAMPDIFF(MINUTE, b.start_time, NOW()) as current_duration,
//         (SELECT COUNT(*) FROM job_photos WHERE booking_id = b.id AND photo_type = 'before') > 0 as has_before_photos,
//         (SELECT COUNT(*) FROM job_photos WHERE booking_id = b.id AND photo_type = 'after') > 0 as has_after_photos,
//         (SELECT action FROM booking_time_logs 
//          WHERE booking_id = b.id 
//          ORDER BY timestamp DESC LIMIT 1) as last_action,
//         (SELECT timestamp FROM booking_time_logs 
//          WHERE booking_id = b.id 
//          ORDER BY timestamp DESC LIMIT 1) as last_action_time
//       FROM bookings b
//       LEFT JOIN services s ON b.service_id = s.id
//       WHERE b.id = ? AND b.provider_id = ?`,
//       [booking_id, decoded.providerId]  // Note: using providerId
//     )

//     if (bookings.length === 0) {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'Booking not found' 
//       }, { status: 404 })
//     }

//     const booking = bookings[0]

//     // Get all logs
//     const logs = await execute(
//       `SELECT * FROM booking_time_logs 
//        WHERE booking_id = ? 
//        ORDER BY timestamp DESC`,
//       [booking_id]
//     )

//     return NextResponse.json({
//       success: true,
//       data: booking,
//       logs: logs
//     })

//   } catch (error) {
//     console.error('Error fetching timer status:', error)
//     return NextResponse.json({ 
//       success: false, 
//       message: 'Failed to fetch timer status' 
//     }, { status: 500 })
//   }
// }




























// app/api/provider/jobs/time-tracking/route.js
import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

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
          // ✅ KEY CHANGE: status = 'awaiting_approval' NOT 'completed'
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
          // Add remaining time from last start
          if (lastStart) {
            totalMinutes += Math.round((now - lastStart) / 60000)
          }

          const overtimeMinutes = Math.max(0, totalMinutes - standardDuration)
          const overtimeEarnings = (overtimeMinutes / 60) * overtimeRate
          const finalAmount = parseFloat(booking.provider_amount || 0) + overtimeEarnings

          // ✅ CHANGED: status = 'awaiting_approval' so customer can review
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

          // Save work summary and recommendations in status history
          await connection.execute(
            `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'awaiting_approval', ?)`,
            [booking_id, `Work completed. Summary: ${work_summary || 'Job done'}. Recommendations: ${recommendations || 'None'}`]
          )

          await connection.query('COMMIT')

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