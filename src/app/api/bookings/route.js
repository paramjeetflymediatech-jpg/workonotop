// // app/api/bookings/route.js
// import { NextResponse } from 'next/server'
// import { query } from '@/lib/db'

// // GET all bookings
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const email = searchParams.get('email')
//     const status = searchParams.get('status')
//     const limit = searchParams.get('limit') || 20

//     let sql = `
//       SELECT 
//         b.*,
//         s.name as service_name,
//         s.slug as service_slug,
//         s.image_url as service_image,
//         c.name as category_name
//       FROM bookings b
//       LEFT JOIN services s ON b.service_id = s.id
//       LEFT JOIN service_categories c ON s.category_id = c.id
//       WHERE 1=1
//     `
//     const params = []

//     if (email) {
//       sql += ' AND b.customer_email = ?'
//       params.push(email)
//     }

//     if (status) {
//       sql += ' AND b.status = ?'
//       params.push(status)
//     }

//     sql += ' ORDER BY b.created_at DESC LIMIT ?'
//     params.push(parseInt(limit))

//     const bookings = await query(sql, params)

//     // Get photos for each booking
//     for (let booking of bookings) {
//       const photos = await query(
//         'SELECT photo_url FROM booking_photos WHERE booking_id = ?',
//         [booking.id]
//       )
//       booking.photos = photos.map(p => p.photo_url)
//     }

//     return NextResponse.json({ success: true, data: bookings })
//   } catch (error) {
//     console.error('Error fetching bookings:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch bookings' },
//       { status: 500 }
//     )
//   }
// }

// // // POST create new booking
// // export async function POST(request) {
// //   try {
// //     const body = await request.json()
    
// //     const {
// //       service_id,
// //       service_name,
// //       service_price,
// //       additional_price,
// //       first_name,
// //       last_name,
// //       email,
// //       phone,
// //       job_date,
// //       job_time_slot,
// //       timing_constraints,
// //       job_description,
// //       instructions,
// //       parking_access,
// //       elevator_access,
// //       has_pets,
// //       address_line1,
// //       address_line2,
// //       city = 'Calgary',
// //       postal_code,
// //       photos = []
// //     } = body

// //     // Validation
// //     if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
// //       return NextResponse.json(
// //         { success: false, message: 'Missing required fields' },
// //         { status: 400 }
// //       )
// //     }

// //     // Generate booking number
// //     const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000)

// //     // Start transaction
// //     await query('START TRANSACTION')

// //     try {
// //       // Insert booking
// //       const result = await query(
// //         `INSERT INTO bookings 
// //          (booking_number, service_id, service_name, service_price, additional_price,
// //           customer_first_name, customer_last_name, customer_email, customer_phone,
// //           job_date, job_time_slot, timing_constraints, job_description, instructions,
// //           parking_access, elevator_access, has_pets,
// //           address_line1, address_line2, city, postal_code, status)
// //          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
// //         [
// //           bookingNumber,
// //           service_id,
// //           service_name || null,
// //           service_price,
// //           additional_price || 0,
// //           first_name,
// //           last_name,
// //           email,
// //           phone,
// //           job_date,
// //           job_time_slot,
// //           timing_constraints || null,
// //           job_description || null,
// //           instructions || null,
// //           parking_access ? 1 : 0,
// //           elevator_access ? 1 : 0,
// //           has_pets ? 1 : 0,
// //           address_line1,
// //           address_line2 || null,
// //           city,
// //           postal_code || null
// //         ]
// //       )

// //       const bookingId = result.insertId

// //       // Insert photos
// //       if (photos && photos.length > 0) {
// //         for (let photo of photos) {
// //           await query(
// //             'INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)',
// //             [bookingId, photo]
// //           )
// //         }
// //       }

// //       // Insert status history
// //       await query(
// //         `INSERT INTO booking_status_history (booking_id, status, notes)
// //          VALUES (?, 'pending', 'Booking created')`,
// //         [bookingId]
// //       )

// //       await query('COMMIT')

// //       return NextResponse.json({ 
// //         success: true, 
// //         message: 'Booking created successfully',
// //         booking_id: bookingId,
// //         booking_number: bookingNumber
// //       })

// //     } catch (error) {
// //       await query('ROLLBACK')
// //       throw error
// //     }

// //   } catch (error) {
// //     console.error('Error creating booking:', error)
// //     return NextResponse.json(
// //       { success: false, message: 'Failed to create booking' },
// //       { status: 500 }
// //     )
// //   }
// // }

// // // PUT update booking status
// // export async function PUT(request) {
// //   try {
// //     const { searchParams } = new URL(request.url)
// //     const id = searchParams.get('id')
// //     const { status, notes } = await request.json()

// //     if (!id || !status) {
// //       return NextResponse.json(
// //         { success: false, message: 'Booking ID and status are required' },
// //         { status: 400 }
// //       )
// //     }

// //     await query('START TRANSACTION')

// //     try {
// //       await query('UPDATE bookings SET status = ? WHERE id = ?', [status, id])

// //       await query(
// //         `INSERT INTO booking_status_history (booking_id, status, notes)
// //          VALUES (?, ?, ?)`,
// //         [id, status, notes || null]
// //       )

// //       await query('COMMIT')

// //       return NextResponse.json({ 
// //         success: true, 
// //         message: 'Booking updated successfully' 
// //       })

// //     } catch (error) {
// //       await query('ROLLBACK')
// //       throw error
// //     }

// //   } catch (error) {
// //     console.error('Error updating booking:', error)
// //     return NextResponse.json(
// //       { success: false, message: 'Failed to update booking' },
// //       { status: 500 }
// //     )
// //   }
// // }

// // // DELETE booking
// // export async function DELETE(request) {
// //   try {
// //     const { searchParams } = new URL(request.url)
// //     const id = searchParams.get('id')

// //     if (!id) {
// //       return NextResponse.json(
// //         { success: false, message: 'ID is required' },
// //         { status: 400 }
// //       )
// //     }

// //     await query('DELETE FROM bookings WHERE id = ?', [id])
// //     return NextResponse.json({ success: true, message: 'Booking deleted' })

// //   } catch (error) {
// //     console.error('Error deleting booking:', error)
// //     return NextResponse.json(
// //       { success: false, message: 'Failed to delete booking' },
// //       { status: 500 }
// //     )
// //   }
// // }





// // app/api/bookings/route.js - POST mein photos handle karo

// // POST create new booking
// export async function POST(request) {
//   try {
//     const body = await request.json()
    
//     const {
//       service_id,
//       service_name,
//       service_price,
//       additional_price,
//       first_name,
//       last_name,
//       email,
//       phone,
//       job_date,
//       job_time_slot,
//       timing_constraints,
//       job_description,
//       instructions,
//       parking_access,
//       elevator_access,
//       has_pets,
//       address_line1,
//       address_line2,
//       city = 'Calgary',
//       postal_code,
//       photos = []  // 👈 YEH PHOTOS URLs AAYENGE
//     } = body

//     // Validation
//     if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
//       return NextResponse.json(
//         { success: false, message: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     // Generate booking number
//     const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000)

//     // Start transaction
//     await query('START TRANSACTION')

//     try {
//       // Insert booking
//       const result = await query(
//         `INSERT INTO bookings 
//          (booking_number, service_id, service_name, service_price, additional_price,
//           customer_first_name, customer_last_name, customer_email, customer_phone,
//           job_date, job_time_slot, timing_constraints, job_description, instructions,
//           parking_access, elevator_access, has_pets,
//           address_line1, address_line2, city, postal_code, status)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
//         [
//           bookingNumber,
//           service_id,
//           service_name || null,
//           service_price,
//           additional_price || 0,
//           first_name,
//           last_name,
//           email,
//           phone,
//           job_date,
//           job_time_slot,
//           timing_constraints || null,
//           job_description || null,
//           instructions || null,
//           parking_access ? 1 : 0,
//           elevator_access ? 1 : 0,
//           has_pets ? 1 : 0,
//           address_line1,
//           address_line2 || null,
//           city,
//           postal_code || null
//         ]
//       )

//       const bookingId = result.insertId

//       // Insert photos - YE PHOTOS SAVE HONGI
//       if (photos && photos.length > 0) {
//         for (let photo of photos) {
//           await query(
//             'INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)',
//             [bookingId, photo]
//           )
//         }
//       }

//       // Insert status history
//       await query(
//         `INSERT INTO booking_status_history (booking_id, status, notes)
//          VALUES (?, 'pending', 'Booking created')`,
//         [bookingId]
//       )

//       await query('COMMIT')

//       return NextResponse.json({ 
//         success: true, 
//         message: 'Booking created successfully',
//         booking_id: bookingId,
//         booking_number: bookingNumber
//       })

//     } catch (error) {
//       await query('ROLLBACK')
//       throw error
//     }

//   } catch (error) {
//     console.error('Error creating booking:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to create booking' },
//       { status: 500 }
//     )
//   }
// }




// app/api/bookings/route.js
import { NextResponse } from 'next/server'
import { execute, query, getConnection } from '@/lib/db'

// GET all bookings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') || 20

    let sql = `
      SELECT 
        b.*,
        s.name as service_name,
        s.slug as service_slug,
        s.image_url as service_image,
        c.name as category_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE 1=1
    `
    const params = []

    if (email) {
      sql += ' AND b.customer_email = ?'
      params.push(email)
    }

    if (status) {
      sql += ' AND b.status = ?'
      params.push(status)
    }

    sql += ' ORDER BY b.created_at DESC LIMIT ?'
    params.push(parseInt(limit))

    const bookings = await execute(sql, params)

    // Get photos for each booking
    for (let booking of bookings) {
      const photos = await execute(
        'SELECT photo_url FROM booking_photos WHERE booking_id = ?',
        [booking.id]
      )
      booking.photos = photos.map(p => p.photo_url)
    }

    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST create new booking
export async function POST(request) {
  let connection;
  
  try {
    const body = await request.json()
    
    const {
      service_id,
      service_name,
      service_price,
      additional_price,
      first_name,
      last_name,
      email,
      phone,
      job_date,
      job_time_slot,
      timing_constraints,
      job_description,
      instructions,
      parking_access,
      elevator_access,
      has_pets,
      address_line1,
      address_line2,
      city = 'Calgary',
      postal_code,
      photos = []
    } = body

    // Validation
    if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate booking number
    const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000)

    // Get connection for transaction
    connection = await getConnection();
    
    // Start transaction - using query() instead of execute()
    await connection.query('START TRANSACTION');

    try {
      // Insert booking - using execute() is fine here
      const [result] = await connection.execute(
        `INSERT INTO bookings 
         (booking_number, service_id, service_name, service_price, additional_price,
          customer_first_name, customer_last_name, customer_email, customer_phone,
          job_date, job_time_slot, timing_constraints, job_description, instructions,
          parking_access, elevator_access, has_pets,
          address_line1, address_line2, city, postal_code, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          bookingNumber,
          service_id,
          service_name || null,
          service_price,
          additional_price || 0,
          first_name,
          last_name,
          email,
          phone,
          job_date,
          job_time_slot,
          timing_constraints || null,
          job_description || null,
          instructions || null,
          parking_access ? 1 : 0,
          elevator_access ? 1 : 0,
          has_pets ? 1 : 0,
          address_line1,
          address_line2 || null,
          city,
          postal_code || null
        ]
      )

      const bookingId = result.insertId

      // Insert photos
      if (photos && photos.length > 0) {
        for (let photo of photos) {
          await connection.execute(
            'INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)',
            [bookingId, photo]
          )
        }
      }

      // Insert status history
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes)
         VALUES (?, 'pending', 'Booking created')`,
        [bookingId]
      )

      // Commit transaction - using query()
      await connection.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'Booking created successfully',
        booking_id: bookingId,
        booking_number: bookingNumber
      })

    } catch (error) {
      // Rollback on error - using query()
      if (connection) {
        await connection.query('ROLLBACK');
      }
      throw error;
    } finally {
      // Release connection
      if (connection) {
        connection.release();
      }
    }

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create booking: ' + error.message },
      { status: 500 }
    )
  }
}

// PUT update booking status
export async function PUT(request) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { status, notes } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and status are required' },
        { status: 400 }
      )
    }

    connection = await getConnection();
    await connection.query('START TRANSACTION');

    try {
      await connection.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id])

      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes)
         VALUES (?, ?, ?)`,
        [id, status, notes || null]
      )

      await connection.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'Booking updated successfully' 
      })

    } catch (error) {
      if (connection) {
        await connection.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE booking
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }

    await execute('DELETE FROM bookings WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Booking deleted' })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}