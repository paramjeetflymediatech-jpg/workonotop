




// import { NextResponse } from 'next/server'
// import { execute, getConnection, withConnection } from '@/lib/db'
// import Stripe from 'stripe'

// const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

// function calcProviderAmount(servicePrice, commissionPct) {
//   if (commissionPct == null || commissionPct === '') return parseFloat(servicePrice)
//   const pct = parseFloat(commissionPct)
//   if (isNaN(pct)) return parseFloat(servicePrice)
//   const commissionAmount = parseFloat(servicePrice) * (pct / 100)
//   return parseFloat((parseFloat(servicePrice) - commissionAmount).toFixed(2))
// }

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const email = searchParams.get('email')
//     const status = searchParams.get('status')
//     const limit = parseInt(searchParams.get('limit') || '50')

//     return await withConnection(async (connection) => {
//       let sql = `
//         SELECT b.*, s.name as service_name, s.slug as service_slug,
//           s.image_url as service_image, s.duration_minutes as service_duration,
//           c.name as category_name, sp.name as provider_name
//         FROM bookings b
//         LEFT JOIN services s ON b.service_id = s.id
//         LEFT JOIN service_categories c ON s.category_id = c.id
//         LEFT JOIN service_providers sp ON b.provider_id = sp.id
//         WHERE 1=1
//       `
//       const params = []
//       if (email) { sql += ' AND b.customer_email = ?'; params.push(email) }
//       if (status) { sql += ' AND b.status = ?'; params.push(status) }
//       sql += ` ORDER BY b.created_at DESC LIMIT ${limit}`

//       const [bookings] = await connection.execute(sql, params)

//       let photosByBooking = {}
//       if (bookings.length > 0) {
//         const bookingIds = bookings.map(b => b.id)
//         const placeholders = bookingIds.map(() => '?').join(',')
//         const [allPhotos] = await connection.execute(
//           `SELECT booking_id, photo_url FROM booking_photos WHERE booking_id IN (${placeholders})`,
//           bookingIds
//         )
//         allPhotos.forEach(p => {
//           if (!photosByBooking[p.booking_id]) photosByBooking[p.booking_id] = []
//           photosByBooking[p.booking_id].push(p.photo_url)
//         })
//       }

//       for (const booking of bookings) {
//         if (booking.job_time_slot) booking.job_time_slot = booking.job_time_slot.split(',')
//         booking.photos = photosByBooking[booking.id] || []
//         booking.service_price = parseFloat(booking.service_price || 0)
//         booking.additional_price = parseFloat(booking.additional_price || 0)
//         booking.provider_amount = parseFloat(booking.provider_amount || 0)
//         booking.overtime_earnings = parseFloat(booking.overtime_earnings || 0)
//         booking.final_provider_amount = booking.final_provider_amount ? parseFloat(booking.final_provider_amount) : null
//         booking.commission_percent = booking.commission_percent ? parseFloat(booking.commission_percent) : null
//         booking.duration_minutes = booking.service_duration || 60
//       }

//       return NextResponse.json({ success: true, data: bookings })
//     })
//   } catch (error) {
//     console.error('Error fetching bookings:', error)
//     return NextResponse.json({ success: false, message: 'Failed to fetch bookings' }, { status: 500 })
//   }
// }
// export async function POST(request) {
//   let connection
//   try {
//     const body = await request.json()
//     const {
//       service_id, service_name, service_price, additional_price,
//       first_name, last_name, email, phone,
//       job_date, job_time_slot, timing_constraints, job_description, instructions,
//       parking_access, elevator_access, has_pets,
//       address_line1, address_line2, city = 'Calgary', postal_code,
//       photos = [], user_id
//     } = body

//     if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
//       return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
//     }

//     const timeSlotString = (Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]).join(',')
//     const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000)
    
//     // Get service duration from database
//     const [serviceInfo] = await execute('SELECT duration_minutes FROM services WHERE id = ?', [service_id])
//     const standardDuration = serviceInfo?.duration_minutes || 60
    
//     // Calculate amounts
//     const basePrice = parseFloat(service_price)
//     const overtimeRate = parseFloat(additional_price || 0)
//     const maxOvertimeHours = 2 // Max 2 hours overtime
//     const maxOvertimeCost = overtimeRate * maxOvertimeHours
//     const totalAuthorizedAmount = basePrice + maxOvertimeCost

//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     try {
//       // Insert booking with payment_status = 'pending'
//       const [result] = await connection.execute(
//         `INSERT INTO bookings
//          (booking_number, user_id, service_id, service_name, service_price, additional_price,
//           customer_first_name, customer_last_name, customer_email, customer_phone,
//           job_date, job_time_slot, timing_constraints, job_description, instructions,
//           parking_access, elevator_access, has_pets,
//           address_line1, address_line2, city, postal_code,
//           commission_percent, provider_amount, status, job_timer_status, payment_status, standard_duration_minutes)
//          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,'pending','not_started', 'pending', ?)`,
//         [
//           bookingNumber, user_id || null, service_id, service_name || null,
//           service_price, additional_price || 0,
//           first_name, last_name, email, phone,
//           job_date, timeSlotString, timing_constraints || null,
//           job_description || null, instructions || null,
//           parking_access ? 1 : 0, elevator_access ? 1 : 0, has_pets ? 1 : 0,
//           address_line1, address_line2 || null, city, postal_code || null,
//           basePrice,
//           standardDuration
//         ]
//       )

//       const bookingId = result.insertId

//       // Save photos
//       if (photos.length > 0) {
//         for (const photo of photos) {
//           await connection.execute(
//             'INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)',
//             [bookingId, photo]
//           )
//         }
//       }

//       // Create Stripe Payment Intent - HOLD base + max overtime
//       let clientSecret = null
//       let paymentIntentId = null

//       if (totalAuthorizedAmount > 0 && stripe) {
//         try {
//           const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(totalAuthorizedAmount * 100), // Hold base + max overtime
//             currency: 'gbp',
//             metadata: {
//               booking_id: bookingId,
//               booking_number: bookingNumber,
//               customer_email: email,
//               customer_name: `${first_name} ${last_name}`,
//               base_price: basePrice.toString(),
//               overtime_rate: overtimeRate.toString(),
//               max_overtime_hours: maxOvertimeHours.toString(),
//               standard_duration: standardDuration.toString()
//             },
//             description: `WorkOnTap: ${service_name || 'Service'} - #${bookingNumber}`,
//             capture_method: 'manual',
//             automatic_payment_methods: {
//               enabled: true,
//             },
//           })

//           clientSecret = paymentIntent.client_secret
//           paymentIntentId = paymentIntent.id

//           // Store authorized amount in database
//           await connection.execute(
//             `UPDATE bookings SET 
//                payment_intent_id = ?,
//                authorized_amount = ?
//              WHERE id = ?`,
//             [paymentIntentId, totalAuthorizedAmount, bookingId]
//           )
//         } catch (stripeError) {
//           console.error('Stripe error:', stripeError)
//         }
//       }

//       await connection.execute(
//         `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'pending', 'Booking created')`,
//         [bookingId]
//       )

//       await connection.query('COMMIT')

//       return NextResponse.json({
//         success: true,
//         booking_id: bookingId,
//         booking_number: bookingNumber,
//         client_secret: clientSecret,
//         overtime_rate: additional_price,
//         standard_duration: standardDuration,
//         authorized_amount: totalAuthorizedAmount,
//         message: `✅ Your card is authorized for $${totalAuthorizedAmount} (includes up to ${maxOvertimeHours}hr overtime)`
//       })
//     } catch (err) {
//       await connection.query('ROLLBACK')
//       throw err
//     }
//   } catch (error) {
//     console.error('Error creating booking:', error)
//     return NextResponse.json({ success: false, message: 'Failed to create booking: ' + error.message }, { status: 500 })
//   } finally {
//     if (connection) connection.release()
//   }
// }

// // export async function PUT(request) {
// //   let connection
// //   try {
// //     const { searchParams } = new URL(request.url)
// //     const id = searchParams.get('id')
// //     const body = await request.json()
// //     const { status, provider_id, notes, job_time_slot, commission_percent, payment_status } = body

// //     if (!id) return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 })

// //     connection = await getConnection()
// //     await connection.query('START TRANSACTION')

// //     try {
// //       const [[current]] = await connection.execute(
// //         'SELECT service_price, additional_price, commission_percent, provider_amount FROM bookings WHERE id = ?',
// //         [id]
// //       )

// //       if (!current) {
// //         await connection.query('ROLLBACK')
// //         return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
// //       }

// //       const updateFields = []
// //       const updateParams = []

// //       if (commission_percent !== undefined) {
// //         const providerAmt = calcProviderAmount(current.service_price, commission_percent)
// //         updateFields.push('commission_percent = ?', 'provider_amount = ?')
// //         updateParams.push(commission_percent, providerAmt)
// //       }
// //       if (status) { updateFields.push('status = ?'); updateParams.push(status) }
// //       if (provider_id) {
// //         updateFields.push('provider_id = ?')
// //         updateParams.push(provider_id)
// //         if (!status) { updateFields.push('status = ?'); updateParams.push('matching') }
// //       }
// //       if (job_time_slot) {
// //         const slots = Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]
// //         updateFields.push('job_time_slot = ?')
// //         updateParams.push(slots.join(','))
// //       }
// //       if (payment_status) {
// //         updateFields.push('payment_status = ?')
// //         updateParams.push(payment_status)
// //       }

// //       if (updateFields.length === 0) {
// //         await connection.query('ROLLBACK')
// //         return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 })
// //       }

// //       updateParams.push(id)
// //       await connection.execute(
// //         `UPDATE bookings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
// //         updateParams
// //       )

// //       if (status) {
// //         await connection.execute(
// //           `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
// //           [id, status, notes || `Status updated to ${status}`]
// //         )
// //       }
// //       if (provider_id && !status) {
// //         await connection.execute(
// //           `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'matching', 'Provider assigned')`,
// //           [id]
// //         )
// //       }
// //       if (commission_percent !== undefined) {
// //         const providerAmt = calcProviderAmount(current.service_price, commission_percent)
// //         const commissionAmount = parseFloat(current.service_price) * (parseFloat(commission_percent) / 100)
// //         await connection.execute(
// //           `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
// //           [id, status || 'pending',
// //             `Commission set to ${commission_percent}% (Admin: $${commissionAmount.toFixed(2)}, Provider: $${providerAmt.toFixed(2)})`]
// //         )
// //       }

// //       await connection.query('COMMIT')
// //       return NextResponse.json({ success: true, message: 'Booking updated successfully' })
// //     } catch (err) {
// //       await connection.query('ROLLBACK')
// //       throw err
// //     }
// //   } catch (error) {
// //     console.error('Error updating booking:', error)
// //     return NextResponse.json({ success: false, message: 'Failed to update booking: ' + error.message }, { status: 500 })
// //   } finally {
// //     if (connection) connection.release()
// //   }
// // }






// // In your PUT handler in /app/api/bookings/route.js
// // ONLY the PUT function changes — replace it with this:



// export async function PUT(request) {
//   let connection
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     const body = await request.json()
//     const { status, provider_id, notes, job_time_slot, commission_percent, payment_status } = body

//     if (!id) return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 })

//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     try {
//       const [[current]] = await connection.execute(
//         'SELECT service_price, additional_price, commission_percent, provider_amount, provider_id as current_provider FROM bookings WHERE id = ?',
//         [id]
//       )

//       if (!current) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
//       }

//       const updateFields = []
//       const updateParams = []

//       if (commission_percent !== undefined) {
//         const providerAmt = calcProviderAmount(current.service_price, commission_percent)
//         updateFields.push('commission_percent = ?', 'provider_amount = ?')
//         updateParams.push(commission_percent, providerAmt)
//       }

//       if (status) {
//         updateFields.push('status = ?')
//         updateParams.push(status)
//       }

//       // ── provider_id: supports null (restart) and a real id (assign/reassign) ──
//       if ('provider_id' in body) {
//         if (body.provider_id === null) {
//           // RESTART: clear provider, reset job fields, reset photos & timer
//           updateFields.push(
//             'provider_id = NULL',
//             'previous_provider_id = ?',
//             'accepted_at = NULL',
//             'start_time = NULL',
//             'end_time = NULL',
//             'job_timer_status = ?',
//             'before_photos_uploaded = 0',
//             'after_photos_uploaded = 0',
//             'actual_duration_minutes = NULL',
//             'overtime_minutes = 0',
//             'overtime_earnings = 0',
//             'final_provider_amount = NULL'
//           )
//           updateParams.push(current.current_provider || null, 'not_started')

//           // Delete old photos and time logs so provider starts fresh
//           await connection.execute(`DELETE FROM job_photos WHERE booking_id = ?`, [id])
//           await connection.execute(`DELETE FROM booking_time_logs WHERE booking_id = ?`, [id])

//         } else {
//           // ASSIGN / REASSIGN: set new provider
//           updateFields.push('provider_id = ?')
//           updateParams.push(body.provider_id)
//           // If no explicit status passed, set to matching
//           if (!status) {
//             updateFields.push('status = ?')
//             updateParams.push('matching')
//           }
//         }
//       }

//       if (job_time_slot) {
//         const slots = Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]
//         updateFields.push('job_time_slot = ?')
//         updateParams.push(slots.join(','))
//       }

//       if (payment_status) {
//         updateFields.push('payment_status = ?')
//         updateParams.push(payment_status)
//       }

//       if (updateFields.length === 0) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 })
//       }

//       updateParams.push(id)
//       await connection.execute(
//         `UPDATE bookings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
//         updateParams
//       )

//       // ── Status history ──────────────────────────────────────────────────────
//       const finalStatus = status || ('provider_id' in body && body.provider_id === null ? 'pending' : 'matching')

//       if (status || 'provider_id' in body) {
//         await connection.execute(
//           `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
//           [id, finalStatus, notes || `Status updated to ${finalStatus}`]
//         )
//       }

//       if (commission_percent !== undefined) {
//         const providerAmt = calcProviderAmount(current.service_price, commission_percent)
//         const commissionAmount = parseFloat(current.service_price) * (parseFloat(commission_percent) / 100)
//         await connection.execute(
//           `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
//           [id, finalStatus,
//             `Commission set to ${commission_percent}% (Admin: $${commissionAmount.toFixed(2)}, Provider: $${providerAmt.toFixed(2)})`]
//         )
//       }

//       await connection.query('COMMIT')
//       return NextResponse.json({ success: true, message: 'Booking updated successfully' })
//     } catch (err) {
//       await connection.query('ROLLBACK')
//       throw err
//     }
//   } catch (error) {
//     console.error('Error updating booking:', error)
//     return NextResponse.json({ success: false, message: 'Failed to update booking: ' + error.message }, { status: 500 })
//   } finally {
//     if (connection) connection.release()
//   }
// }












// export async function DELETE(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
//     await execute('DELETE FROM bookings WHERE id = ?', [id])
//     return NextResponse.json({ success: true, message: 'Booking deleted' })
//   } catch (error) {
//     console.error('Error deleting booking:', error)
//     return NextResponse.json({ success: false, message: 'Failed to delete booking' }, { status: 500 })
//   }
// }





















import { NextResponse } from 'next/server'
import { execute, getConnection, withConnection } from '@/lib/db'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

function calcProviderAmount(servicePrice, commissionPct) {
  if (commissionPct == null || commissionPct === '') return parseFloat(servicePrice)
  const pct = parseFloat(commissionPct)
  if (isNaN(pct)) return parseFloat(servicePrice)
  const commissionAmount = parseFloat(servicePrice) * (pct / 100)
  return parseFloat((parseFloat(servicePrice) - commissionAmount).toFixed(2))
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

// ✅ POST: Booking sirf tab create hoti hai jab payment_intent_id aaye (payment ho chuki ho)
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
      payment_intent_id, // ✅ Payment page se aata hai — required
    } = body

    if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    // ✅ Booking sirf tab banegi jab payment_intent_id ho
    if (!payment_intent_id) {
      return NextResponse.json(
        { success: false, message: 'Payment must be authorized before booking can be created.' },
        { status: 400 }
      )
    }

    const timeSlotString = (Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]).join(',')
    const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000)

    // Get service duration
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
          bookingNumber, 
          user_id || null, 
          service_id || null, 
          service_name || null,
          service_price || 0, 
          additional_price || 0,
          first_name || null, 
          last_name || null, 
          email || null, 
          phone || null,
          job_date || null, 
          timeSlotString || null, 
          timing_constraints || null,
          job_description || null, 
          instructions || null,
          parking_access ? 1 : 0, 
          elevator_access ? 1 : 0, 
          has_pets ? 1 : 0,
          address_line1 || null, 
          address_line2 || null, 
          city || 'Calgary', 
          postal_code || null,
          basePrice || 0,
          standardDuration || 60,
          payment_intent_id || null,
          totalAuthorizedAmount || 0,
        ]
      )

      const bookingId = result.insertId

      // Save photos
      if (photos.length > 0) {
        for (const photo of photos) {
          await connection.execute(
            'INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)',
            [bookingId, photo]
          )
        }
      }

      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'pending', 'Booking created after payment authorization')`,
        [bookingId]
      )

      await connection.query('COMMIT')

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
  let connection
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { status, provider_id, notes, job_time_slot, commission_percent, payment_status } = body

    if (!id) return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 })

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      const [[current]] = await connection.execute(
        'SELECT service_price, additional_price, commission_percent, provider_amount, provider_id as current_provider FROM bookings WHERE id = ?',
        [id]
      )

      if (!current) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
      }

      const updateFields = []
      const updateParams = []

      if (commission_percent !== undefined) {
        const providerAmt = calcProviderAmount(current.service_price, commission_percent)
        updateFields.push('commission_percent = ?', 'provider_amount = ?')
        updateParams.push(commission_percent, providerAmt)
      }

      if (status) {
        updateFields.push('status = ?')
        updateParams.push(status)
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
          )
          updateParams.push(current.current_provider || null, 'not_started')
          await connection.execute(`DELETE FROM job_photos WHERE booking_id = ?`, [id])
          await connection.execute(`DELETE FROM booking_time_logs WHERE booking_id = ?`, [id])
        } else {
          updateFields.push('provider_id = ?')
          updateParams.push(body.provider_id)
          if (!status) {
            updateFields.push('status = ?')
            updateParams.push('matching')
          }
        }
      }

      if (job_time_slot) {
        const slots = Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]
        updateFields.push('job_time_slot = ?')
        updateParams.push(slots.join(','))
      }

      if (payment_status) {
        updateFields.push('payment_status = ?')
        updateParams.push(payment_status)
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

      const finalStatus = status || ('provider_id' in body && body.provider_id === null ? 'pending' : 'matching')

      if (status || 'provider_id' in body) {
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
          [id, finalStatus, notes || `Status updated to ${finalStatus}`]
        )
      }

      if (commission_percent !== undefined) {
        const providerAmt = calcProviderAmount(current.service_price, commission_percent)
        const commissionAmount = parseFloat(current.service_price) * (parseFloat(commission_percent) / 100)
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, ?, ?)`,
          [id, finalStatus,
            `Commission set to ${commission_percent}% (Admin: $${commissionAmount.toFixed(2)}, Provider: $${providerAmt.toFixed(2)})`]
        )
      }

      await connection.query('COMMIT')
      return NextResponse.json({ success: true, message: 'Booking updated successfully' })
    } catch (err) {
      await connection.query('ROLLBACK')
      throw err
    }
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ success: false, message: 'Failed to update booking: ' + error.message }, { status: 500 })
  } finally {
    if (connection) connection.release()
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










