






// import { NextResponse } from 'next/server'
// import { execute, getConnection } from '@/lib/db'

// // GET all bookings
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const email = searchParams.get('email')
//     const status = searchParams.get('status')
//     const limit = parseInt(searchParams.get('limit') || '20')

//     let sql = `
//       SELECT 
//         b.*,
//         s.name as service_name,
//         s.slug as service_slug,
//         s.image_url as service_image,
//         c.name as category_name,
//         sp.name as provider_name
//       FROM bookings b
//       LEFT JOIN services s ON b.service_id = s.id
//       LEFT JOIN service_categories c ON s.category_id = c.id
//       LEFT JOIN service_providers sp ON b.provider_id = sp.id
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

//     sql += ` ORDER BY b.created_at DESC LIMIT ${limit}`

//     const bookings = await execute(sql, params)

//     for (let booking of bookings) {
//       const photos = await execute(
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

// // POST create booking
// export async function POST(request) {
//   let connection;
  
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
//       photos = [],
//       user_id
//     } = body

//     if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
//       return NextResponse.json(
//         { success: false, message: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000)

//     connection = await getConnection();
//     await connection.query('START TRANSACTION');

//     try {
//       const [result] = await connection.execute(
//         `INSERT INTO bookings 
//          (booking_number, user_id, service_id, service_name, service_price, additional_price,
//           customer_first_name, customer_last_name, customer_email, customer_phone,
//           job_date, job_time_slot, timing_constraints, job_description, instructions,
//           parking_access, elevator_access, has_pets,
//           address_line1, address_line2, city, postal_code, status)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
//         [
//           bookingNumber,
//           user_id || null,
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

//       if (photos && photos.length > 0) {
//         for (let photo of photos) {
//           await connection.execute(
//             'INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)',
//             [bookingId, photo]
//           )
//         }
//       }

//       await connection.execute(
//         `INSERT INTO booking_status_history (booking_id, status, notes)
//          VALUES (?, 'pending', 'Booking created')`,
//         [bookingId]
//       )

//       await connection.query('COMMIT');

//       return NextResponse.json({ 
//         success: true, 
//         message: 'Booking created successfully',
//         booking_id: bookingId,
//         booking_number: bookingNumber
//       })

//     } catch (error) {
//       if (connection) await connection.query('ROLLBACK');
//       throw error;
//     } finally {
//       if (connection) connection.release();
//     }

//   } catch (error) {
//     console.error('Error creating booking:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to create booking: ' + error.message },
//       { status: 500 }
//     );
//   }
// }

// // PUT update booking
// export async function PUT(request) {
//   let connection;
  
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     const body = await request.json()
//     const { status, provider_id, notes } = body

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'Booking ID is required' },
//         { status: 400 }
//       )
//     }

//     connection = await getConnection();
//     await connection.query('START TRANSACTION');

//     try {
//       let updateFields = []
//       let updateParams = []

//       if (status) {
//         updateFields.push('status = ?')
//         updateParams.push(status)
//       }

//       if (provider_id) {
//         updateFields.push('provider_id = ?')
//         updateParams.push(provider_id)
        
//         if (!status) {
//           updateFields.push('status = ?')
//           updateParams.push('matching')
//         }
//       }

//       if (updateFields.length === 0) {
//         await connection.query('ROLLBACK');
//         return NextResponse.json(
//           { success: false, message: 'No fields to update' },
//           { status: 400 }
//         )
//       }

//       updateParams.push(id)

//       await connection.execute(
//         `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`,
//         updateParams
//       )

//       if (status) {
//         await connection.execute(
//           `INSERT INTO booking_status_history (booking_id, status, notes)
//            VALUES (?, ?, ?)`,
//           [id, status, notes || `Status updated to ${status}`]
//         )
//       }

//       if (provider_id) {
//         await connection.execute(
//           `INSERT INTO booking_status_history (booking_id, status, notes)
//            VALUES (?, ?, ?)`,
//           [id, status || 'matching', `Provider assigned`]
//         )
//       }

//       await connection.query('COMMIT');

//       return NextResponse.json({ 
//         success: true, 
//         message: 'Booking updated successfully' 
//       })

//     } catch (error) {
//       if (connection) await connection.query('ROLLBACK');
//       throw error;
//     } finally {
//       if (connection) connection.release();
//     }

//   } catch (error) {
//     console.error('Error updating booking:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to update booking: ' + error.message },
//       { status: 500 }
//     )
//   }
// }

// // DELETE booking
// export async function DELETE(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'ID is required' },
//         { status: 400 }
//       )
//     }

//     await execute('DELETE FROM bookings WHERE id = ?', [id])
//     return NextResponse.json({ success: true, message: 'Booking deleted' })

//   } catch (error) {
//     console.error('Error deleting booking:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to delete booking' },
//       { status: 500 }
//     )
//   }
// }



import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'

// GET all bookings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let sql = `
      SELECT 
        b.*,
        s.name as service_name,
        s.slug as service_slug,
        s.image_url as service_image,
        c.name as category_name,
        sp.name as provider_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
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

    sql += ` ORDER BY b.created_at DESC LIMIT ${limit}`

    const bookings = await execute(sql, params)

    for (let booking of bookings) {
      // Convert comma-separated string back to array
      if (booking.job_time_slot) {
        booking.job_time_slot = booking.job_time_slot.split(',')
      }

      // Get photos
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

// POST create booking
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
      photos = [],
      user_id
    } = body

    // Validate required fields
    if (!service_id || !job_date || !job_time_slot || !address_line1 || !email || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert array to comma-separated string for SET type
    const timeSlots = Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]
    const timeSlotString = timeSlots.join(',')

    const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000)

    connection = await getConnection();
    await connection.query('START TRANSACTION');

    try {
      const [result] = await connection.execute(
        `INSERT INTO bookings 
         (booking_number, user_id, service_id, service_name, service_price, additional_price,
          customer_first_name, customer_last_name, customer_email, customer_phone,
          job_date, job_time_slot, timing_constraints, job_description, instructions,
          parking_access, elevator_access, has_pets,
          address_line1, address_line2, city, postal_code, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          bookingNumber,
          user_id || null,
          service_id,
          service_name || null,
          service_price,
          additional_price || 0,
          first_name,
          last_name,
          email,
          phone,
          job_date,
          timeSlotString, // Store as comma-separated string
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

      // Handle photos
      if (photos && photos.length > 0) {
        for (let photo of photos) {
          await connection.execute(
            'INSERT INTO booking_photos (booking_id, photo_url) VALUES (?, ?)',
            [bookingId, photo]
          )
        }
      }

      // Add status history
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes)
         VALUES (?, 'pending', 'Booking created')`,
        [bookingId]
      )

      await connection.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'Booking created successfully',
        booking_id: bookingId,
        booking_number: bookingNumber
      })

    } catch (error) {
      if (connection) await connection.query('ROLLBACK');
      throw error;
    } finally {
      if (connection) connection.release();
    }

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create booking: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT update booking
export async function PUT(request) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { status, provider_id, notes, job_time_slot } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    connection = await getConnection();
    await connection.query('START TRANSACTION');

    try {
      let updateFields = []
      let updateParams = []

      if (status) {
        updateFields.push('status = ?')
        updateParams.push(status)
      }

      if (provider_id) {
        updateFields.push('provider_id = ?')
        updateParams.push(provider_id)
        
        if (!status) {
          updateFields.push('status = ?')
          updateParams.push('matching')
        }
      }

      if (job_time_slot) {
        const timeSlots = Array.isArray(job_time_slot) ? job_time_slot : [job_time_slot]
        updateFields.push('job_time_slot = ?')
        updateParams.push(timeSlots.join(','))
      }

      if (updateFields.length === 0) {
        await connection.query('ROLLBACK');
        return NextResponse.json(
          { success: false, message: 'No fields to update' },
          { status: 400 }
        )
      }

      updateParams.push(id)

      await connection.execute(
        `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      )

      if (status) {
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes)
           VALUES (?, ?, ?)`,
          [id, status, notes || `Status updated to ${status}`]
        )
      }

      if (provider_id) {
        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes)
           VALUES (?, ?, ?)`,
          [id, status || 'matching', `Provider assigned`]
        )
      }

      await connection.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'Booking updated successfully' 
      })

    } catch (error) {
      if (connection) await connection.query('ROLLBACK');
      throw error;
    } finally {
      if (connection) connection.release();
    }

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update booking: ' + error.message },
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