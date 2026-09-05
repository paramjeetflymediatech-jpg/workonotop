import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('adminAuth')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id: booking_id } = await params
    const { worker_count, actual_duration_minutes, reason } = await request.json()

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ success: false, message: 'A reason must be provided for the audit log' }, { status: 400 })
    }

    const connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      // Get current booking details
      const [[booking]] = await connection.execute(
        `SELECT worker_count, actual_duration_minutes FROM bookings WHERE id = ?`,
        [booking_id]
      )

      if (!booking) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
      }

      // Update the booking
      await connection.execute(
        `UPDATE bookings SET worker_count = ?, actual_duration_minutes = ? WHERE id = ?`,
        [worker_count, actual_duration_minutes, booking_id]
      )

      // Insert audit log
      await connection.execute(
        `INSERT INTO booking_audit_logs 
        (booking_id, admin_id, old_worker_count, new_worker_count, old_actual_duration, new_actual_duration, reason) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          booking_id, 
          decoded.adminId || decoded.id || 1, // Fallback if admin ID isn't in token
          booking.worker_count || 1, 
          worker_count, 
          booking.actual_duration_minutes || 0, 
          actual_duration_minutes, 
          reason
        ]
      )

      await connection.query('COMMIT')
      
      return NextResponse.json({ success: true, message: 'Job details updated successfully' })
    } catch (dbError) {
      await connection.query('ROLLBACK')
      throw dbError
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error updating job override:', error)
    return NextResponse.json({ success: false, message: 'Failed to update job details' }, { status: 500 })
  }
}
