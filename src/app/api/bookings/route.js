


// app/api/bookings/route.js - UPDATED with service duration

import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Calculate the amount the provider receives after admin commission.
 * Commission applies ONLY to base service price
 * @param {number} servicePrice - Base service price
 * @param {number} commissionPct - e.g. 30 means 30%
 */
function calcProviderAmount(servicePrice, commissionPct) {
  if (commissionPct == null || commissionPct === '') return parseFloat(servicePrice)
  
  const pct = parseFloat(commissionPct)
  if (isNaN(pct)) return parseFloat(servicePrice)
  
  // Commission only on base price
  const commissionAmount = parseFloat(servicePrice) * (pct / 100)
  return parseFloat((parseFloat(servicePrice) - commissionAmount).toFixed(2))
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email   = searchParams.get('email')
    const status  = searchParams.get('status')
    const limit   = parseInt(searchParams.get('limit') || '50')

    let sql = `
      SELECT 
        b.*,
        s.name      as service_name,
        s.slug      as service_slug,
        s.image_url as service_image,
        s.duration_minutes as service_duration,  /* Get duration from services table */
        c.name      as category_name,
        sp.name     as provider_name
      FROM bookings b
      LEFT JOIN services s          ON b.service_id  = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      WHERE 1=1
    `
    const params = []

    if (email)  { sql += ' AND b.customer_email = ?'; params.push(email)  }
    if (status) { sql += ' AND b.status = ?';         params.push(status) }

    sql += ` ORDER BY b.created_at DESC LIMIT ${limit}`

    const bookings = await execute(sql, params)

    for (const booking of bookings) {
      // Parse time slots
      if (booking.job_time_slot) {
        booking.job_time_slot = booking.job_time_slot.split(',')
      }
      
      // Get photos
      const photos = await execute(
        'SELECT photo_url FROM booking_photos WHERE booking_id = ?',
        [booking.id]
      )
      booking.photos = photos.map(p => p.photo_url)
      
      // Ensure numeric values are proper numbers
      booking.service_price = parseFloat(booking.service_price || 0)
      booking.additional_price = parseFloat(booking.additional_price || 0)
      booking.provider_amount = parseFloat(booking.provider_amount || 0)
      booking.overtime_earnings = parseFloat(booking.overtime_earnings || 0)
      booking.final_provider_amount = booking.final_provider_amount ? parseFloat(booking.final_provider_amount) : null
      
      // Convert commission_percent to number if exists
      booking.commission_percent = booking.commission_percent ? parseFloat(booking.commission_percent) : null
      
      // Add service duration to booking object
      booking.duration_minutes = booking.service_duration || 60 // Default to 60 if not set
    }

    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch bookings' }, { status: 500 })
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request) {
  let connection
  try {
    const body = await request.json()
    const {
      service_id, service_name, service_price, additional_price,
      first_name, last_name, email, phone,
      job_date, job_time_slot, timing_constraints, job_description, instructions,
      parking_access, elevator_access, has_pets,
      address_line1, address_line2, city = 'Calgary', postal_code,
      photos = [], user_id
    } = body

    if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const timeSlotString = (Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]).join(',')
    const bookingNumber  = 'BK' + Date.now() + Math.floor(Math.random() * 1000)
    
    // Initial total is just base price
    const initialTotal = parseFloat(service_price)

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      const [result] = await connection.execute(
        `INSERT INTO bookings
         (booking_number, user_id, service_id, service_name, service_price, additional_price,
          customer_first_name, customer_last_name, customer_email, customer_phone,
          job_date, job_time_slot, timing_constraints, job_description, instructions,
          parking_access, elevator_access, has_pets,
          address_line1, address_line2, city, postal_code,
          commission_percent, provider_amount, status, job_timer_status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?, 'pending', 'not_started')`,
        [
          bookingNumber, user_id || null, service_id, service_name || null,
          service_price, additional_price || 0,
          first_name, last_name, email, phone,
          job_date, timeSlotString, timing_constraints || null,
          job_description || null, instructions || null,
          parking_access ? 1 : 0, elevator_access ? 1 : 0, has_pets ? 1 : 0,
          address_line1, address_line2 || null, city, postal_code || null,
          initialTotal   // provider_amount = base price until commission set
        ]
      )

      const bookingId = result.insertId

      if (photos.length > 0) {
        for (const photo of photos) {
          await connection.execute(
            'INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)',
            [bookingId, photo]
          )
        }
      }

      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'pending', 'Booking created')`,
        [bookingId]
      )

      await connection.query('COMMIT')
      return NextResponse.json({ success: true, booking_id: bookingId, booking_number: bookingNumber })
    } catch (err) {
      await connection.query('ROLLBACK')
      throw err
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ success: false, message: 'Failed to create booking: ' + error.message }, { status: 500 })
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────

export async function PUT(request) {
  let connection
  try {
    const { searchParams } = new URL(request.url)
    const id   = searchParams.get('id')
    const body = await request.json()
    const { status, provider_id, notes, job_time_slot, commission_percent } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 })
    }

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      // Fetch current booking
      const [[current]] = await connection.execute(
        'SELECT service_price, additional_price, commission_percent, provider_amount FROM bookings WHERE id = ?',
        [id]
      )

      if (!current) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
      }

      const updateFields = []
      const updateParams = []

      // ── Commission update ──────────────────────────────────────────────────
      if (commission_percent !== undefined) {
        const providerAmt = calcProviderAmount(current.service_price, commission_percent)
        
        updateFields.push('commission_percent = ?', 'provider_amount = ?')
        updateParams.push(commission_percent, providerAmt)
      }

      // ── Status update ──────────────────────────────────────────────────────
      if (status) {
        updateFields.push('status = ?')
        updateParams.push(status)
      }

      // ── Provider assignment ────────────────────────────────────────────────
      if (provider_id) {
        updateFields.push('provider_id = ?')
        updateParams.push(provider_id)
        if (!status) {
          updateFields.push('status = ?')
          updateParams.push('matching')
        }
      }

      // ── Time slot ─────────────────────────────────────────────────────────
      if (job_time_slot) {
        const slots = Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]
        updateFields.push('job_time_slot = ?')
        updateParams.push(slots.join(','))
      }

      if (updateFields.length === 0) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 })
      }

      updateParams.push(id)
      await connection.execute(
        `UPDATE bookings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        updateParams
      )

      // Status history entry
      if (status) {
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
          [id, status, notes || `Status updated to ${status}`]
        )
      }
      
      if (provider_id && !status) {
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'matching', 'Provider assigned by admin')`,
          [id]
        )
      }
      
      if (commission_percent !== undefined) {
        const providerAmt = calcProviderAmount(current.service_price, commission_percent)
        const commissionAmount = parseFloat(current.service_price) * (parseFloat(commission_percent) / 100)
        
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
          [id, status || 'pending', 
           `Commission set to ${commission_percent}% on base price ($${parseFloat(current.service_price).toFixed(2)}). ` +
           `Admin keeps: $${commissionAmount.toFixed(2)}, Provider gets base: $${providerAmt.toFixed(2)}`]
        )
      }

      await connection.query('COMMIT')
      return NextResponse.json({ success: true, message: 'Booking updated successfully' })
    } catch (err) {
      await connection.query('ROLLBACK')
      throw err
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ success: false, message: 'Failed to update booking: ' + error.message }, { status: 500 })
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
    await execute('DELETE FROM bookings WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Booking deleted' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete booking' }, { status: 500 })
  }
}