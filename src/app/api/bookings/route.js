import { NextResponse } from 'next/server'
import { execute, getConnection, withConnection } from '@/lib/db'
import Stripe from 'stripe'
import { notifyUser } from '@/lib/push'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

function calcProviderAmount(servicePrice, commissionPct) {
  const price = parseFloat(servicePrice || 0)
  if (commissionPct == null || commissionPct === '') return price
  const pct = parseFloat(commissionPct)
  if (isNaN(pct)) return price
  const commissionAmount = price * (pct / 100)
  const result = price - commissionAmount
  return isNaN(result) ? price : parseFloat(result.toFixed(2))
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    return await withConnection(async (connection) => {
      let sql = `
        SELECT b.*, s.name as service_name, s.slug as service_slug,
          s.image_url as service_image, s.duration_minutes as service_duration,
          c.name as category_name, sp.name as provider_name
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN service_categories c ON s.category_id = c.id
        LEFT JOIN service_providers sp ON b.provider_id = sp.id
        WHERE 1=1
      `
      const params = []
      if (email) { sql += ' AND b.customer_email = ?'; params.push(email) }
      if (status) { sql += ' AND b.status = ?'; params.push(status) }
      sql += ` ORDER BY b.created_at DESC LIMIT ${limit}`

      const [bookings] = await connection.execute(sql, params)

      let photosByBooking = {}
      if (bookings.length > 0) {
        const bookingIds = bookings.map(b => b.id)
        const placeholders = bookingIds.map(() => '?').join(',')
        const [allPhotos] = await connection.execute(
          `SELECT booking_id, photo_url FROM booking_photos WHERE booking_id IN (${placeholders})`,
          bookingIds
        )
        allPhotos.forEach(p => {
          if (!photosByBooking[p.booking_id]) photosByBooking[p.booking_id] = []
          photosByBooking[p.booking_id].push(p.photo_url)
        })
      }

      for (const booking of bookings) {
        if (booking.job_time_slot) booking.job_time_slot = booking.job_time_slot.split(',')
        booking.photos = photosByBooking[booking.id] || []
        booking.service_price = parseFloat(booking.service_price || 0)
        booking.additional_price = parseFloat(booking.additional_price || 0)
        booking.provider_amount = parseFloat(booking.provider_amount || 0)
        booking.overtime_earnings = parseFloat(booking.overtime_earnings || 0)
        booking.final_provider_amount = booking.final_provider_amount ? parseFloat(booking.final_provider_amount) : null
        booking.commission_percent = booking.commission_percent ? parseFloat(booking.commission_percent) : null
        booking.duration_minutes = booking.service_duration || 60
      }

      return NextResponse.json({ success: true, data: bookings })
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch bookings' }, { status: 500 })
  }
}

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
      photos = [], user_id,
      payment_intent_id,
    } = body

    if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    if (!payment_intent_id) {
      return NextResponse.json(
        { success: false, message: 'Payment must be authorized before booking can be created.' },
        { status: 400 }
      )
    }

    const timeSlotString = (Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]).join(',')
    const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000)

    const [serviceInfo] = await execute('SELECT duration_minutes FROM services WHERE id = ?', [service_id])
    const standardDuration = serviceInfo?.duration_minutes || 60

    const basePrice = parseFloat(service_price || 0)
    const overtimeRate = parseFloat(additional_price || 0)
    const maxOvertimeCost = overtimeRate * 2
    const totalAuthorizedAmount = basePrice + maxOvertimeCost

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
          commission_percent, provider_amount, status, job_timer_status, payment_status,
          standard_duration_minutes, payment_intent_id, authorized_amount)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,'pending','not_started','authorized',?,?,?)`,
        [
          bookingNumber, user_id || null, service_id || null, service_name || null,
          service_price || 0, additional_price || 0,
          first_name || null, last_name || null, email || null, phone || null,
          job_date || null, timeSlotString || null, timing_constraints || null,
          job_description || null, instructions || null,
          parking_access ? 1 : 0, elevator_access ? 1 : 0, has_pets ? 1 : 0,
          address_line1 || null, address_line2 || null, city || 'Calgary', postal_code || null,
          basePrice || 0, standardDuration || 60,
          payment_intent_id || null, totalAuthorizedAmount || 0,
        ]
      )

      const bookingId = result.insertId

      if (photos.length > 0) {
        for (const photo of photos) {
          await connection.execute('INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)', [bookingId, photo])
        }
      }

      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'pending', 'Booking created after payment authorization')`,
        [bookingId]
      )

      await connection.query('COMMIT')

      if (user_id) {
        notifyUser(user_id, 'Booking Confirmed!', `Your booking #${bookingNumber} for ${service_name} has been created.`, { bookingId, bookingNumber, type: 'booking_created' }, execute, 'customer')
          .catch(err => console.error('[Push] Notification Error:', err));
      }

      return NextResponse.json({
        success: true,
        booking_id: bookingId,
        booking_number: bookingNumber,
        overtime_rate: additional_price,
        standard_duration: standardDuration,
        authorized_amount: totalAuthorizedAmount,
        message: `✅ Booking confirmed. Card authorized for $${totalAuthorizedAmount}`
      })
    } catch (err) {
      await connection.query('ROLLBACK')
      throw err
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ success: false, message: 'Failed to create booking: ' + error.message }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

export async function PUT(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    console.log(`[API PUT /api/bookings] ID: ${id}, Body:`, body);
    
    const { status, provider_id, notes, job_time_slot, commission_percent, payment_status } = body;

    if (!id) return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 });

    connection = await getConnection();
    await connection.query('START TRANSACTION');

    try {
      const [[current]] = await connection.execute(
        'SELECT status, service_price, additional_price, commission_percent, provider_amount, provider_id as current_provider FROM bookings WHERE id = ?',
        [id]
      );

      if (!current) {
        console.error(`[API PUT] Booking NOT FOUND for ID: ${id}`);
        await connection.query('ROLLBACK');
        return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
      }

      const updateFields = [];
      const updateParams = [];

      if (commission_percent !== undefined) {
        const providerAmt = calcProviderAmount(current.service_price, commission_percent);
        console.log(`[API PUT] Updating commission: ${commission_percent}%, Provider Amount: ${providerAmt}`);
        updateFields.push('commission_percent = ?', 'provider_amount = ?');
        updateParams.push(commission_percent, providerAmt);
      }

      if (status) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }

      if ('provider_id' in body) {
        if (body.provider_id === null) {
          updateFields.push(
            'provider_id = NULL',
            'previous_provider_id = ?',
            'accepted_at = NULL',
            'start_time = NULL',
            'end_time = NULL',
            'job_timer_status = ?',
            'before_photos_uploaded = 0',
            'after_photos_uploaded = 0',
            'actual_duration_minutes = NULL',
            'overtime_minutes = 0',
            'overtime_earnings = 0',
            'final_provider_amount = NULL'
          );
          updateParams.push(current.current_provider || null, 'not_started');
          await connection.execute(`DELETE FROM job_photos WHERE booking_id = ?`, [id]);
          await connection.execute(`DELETE FROM booking_time_logs WHERE booking_id = ?`, [id]);
        } else {
          updateFields.push('provider_id = ?');
          updateParams.push(body.provider_id);
          if (!status) {
            updateFields.push('status = ?');
            updateParams.push('matching');
          }
        }
      }

      if (job_time_slot) {
        const slots = Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot];
        updateFields.push('job_time_slot = ?');
        updateParams.push(slots.join(','));
      }

      if (payment_status) {
        updateFields.push('payment_status = ?');
        updateParams.push(payment_status);
      }

      if (updateFields.length > 0) {
        updateParams.push(id);
        const [updateRes] = await connection.execute(
          `UPDATE bookings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
          updateParams
        );
      }

      // History tracking
      // Use current.status if status is not provided, fallback to 'pending'
      const finalStatusForHistory = status || current.status || 'pending';

      if (status || 'provider_id' in body) {
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
          [id, status || (body.provider_id === null ? 'pending' : 'matching'), notes || `Status updated`]
        );
      }

      if (commission_percent !== undefined) {
        const providerAmt = calcProviderAmount(current.service_price, commission_percent);
        const commissionAmount = parseFloat(current.service_price || 0) * (parseFloat(commission_percent) / 100);
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
          [id, finalStatusForHistory,
            `Commission set to ${commission_percent}% (Admin: $${commissionAmount.toFixed(2)}, Provider: $${providerAmt.toFixed(2)})`]
        );
      }

      await connection.query('COMMIT');

      // Notifications (non-blocking)
      try {
        const [[bookingData]] = await connection.execute('SELECT user_id, booking_number, service_name FROM bookings WHERE id = ?', [id]);
        if (bookingData) {
          if (status && bookingData.user_id) {
            let title = 'Booking Update';
            let bodyMsg = `Your booking #${bookingData.booking_number} is now ${status.replace('_', ' ')}`;
            if (status === 'matching') { title = 'Provider Assigned'; bodyMsg = `A provider has been assigned to #${bookingData.booking_number}`; }
            else if (status === 'completed') { title = 'Service Completed'; bodyMsg = `Service #${bookingData.booking_number} has been completed.`; }
            notifyUser(bookingData.user_id, title, bodyMsg, { bookingId: id, status, type: 'status_update' }, execute, 'customer').catch(() => {});
          }
          if (provider_id && provider_id !== current.current_provider) {
            notifyUser(provider_id, 'New Job Assigned', `You have been assigned to #${bookingData.booking_number}`, { bookingId: id, type: 'new_job' }, execute, 'provider').catch(() => {});
          }
        }
      } catch (notifyErr) {
        console.error('[Push Error]', notifyErr);
      }

      return NextResponse.json({ success: true, message: 'Booking updated successfully' });
    } catch (err) {
      console.error('[API PUT Inner Error]', err);
      await connection.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('[API PUT Outer Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to update booking: ' + error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
    await execute('DELETE FROM bookings WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Booking deleted' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete booking' }, { status: 500 })
  }
}
