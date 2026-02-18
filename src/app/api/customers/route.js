// // app/api/users/route.js
// import { NextResponse } from 'next/server'
// import { execute, getConnection } from '@/lib/db'
// import bcrypt from 'bcryptjs'

// // GET all users or specific user
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     const email = searchParams.get('email')
//     const limit = parseInt(searchParams.get('limit') || '50')

//     if (id) {
//       // Get specific user by ID
//       const users = await execute(
//         'SELECT id, email, first_name, last_name, phone, hear_about, receive_offers, created_at, updated_at FROM users WHERE id = ?',
//         [id]
//       )
      
//       if (users.length === 0) {
//         return NextResponse.json(
//           { success: false, message: 'User not found' },
//           { status: 404 }
//         )
//       }

//       // Get user's bookings count
//       const bookings = await execute(
//         'SELECT COUNT(*) as booking_count FROM bookings WHERE user_id = ?',
//         [id]
//       )

//       return NextResponse.json({ 
//         success: true, 
//         data: {
//           ...users[0],
//           booking_count: bookings[0].booking_count
//         }
//       })
//     }

//     if (email) {
//       // Get specific user by email
//       const users = await execute(
//         'SELECT id, email, first_name, last_name, phone, hear_about, receive_offers, created_at, updated_at FROM users WHERE email = ?',
//         [email]
//       )
      
//       if (users.length === 0) {
//         return NextResponse.json(
//           { success: false, message: 'User not found' },
//           { status: 404 }
//         )
//       }

//       return NextResponse.json({ 
//         success: true, 
//         data: users[0]
//       })
//     }

//     // Get all users with booking counts
//     const sql = `
//       SELECT 
//         u.id,
//         u.email,
//         u.first_name,
//         u.last_name,
//         u.phone,
//         u.hear_about,
//         u.receive_offers,
//         u.created_at,
//         u.updated_at,
//         COUNT(b.id) as booking_count
//       FROM users u
//       LEFT JOIN bookings b ON u.id = b.user_id
//       GROUP BY u.id
//       ORDER BY u.created_at DESC
//       LIMIT ${limit}
//     `

//     const users = await execute(sql)

//     return NextResponse.json({ 
//       success: true, 
//       data: users,
//       total: users.length
//     })

//   } catch (error) {
//     console.error('Error fetching users:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch users' },
//       { status: 500 }
//     )
//   }
// }

// // POST - Create new user
// export async function POST(request) {
//   let connection;
  
//   try {
//     const body = await request.json()
    
//     const {
//       email,
//       password,
//       first_name,
//       last_name,
//       phone,
//       hear_about,
//       receive_offers = false
//     } = body

//     // Validation
//     if (!email || !password || !first_name || !last_name) {
//       return NextResponse.json(
//         { success: false, message: 'Email, password, first name, and last name are required' },
//         { status: 400 }
//       )
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email format' },
//         { status: 400 }
//       )
//     }

//     // Check if user already exists
//     const existingUsers = await execute(
//       'SELECT id FROM users WHERE email = ?',
//       [email]
//     )

//     if (existingUsers.length > 0) {
//       return NextResponse.json(
//         { success: false, message: 'User with this email already exists' },
//         { status: 409 }
//       )
//     }

//     // Hash password
//     const password_hash = await bcrypt.hash(password, 10)

//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     try {
//       // Insert user
//       const [result] = await connection.execute(
//         `INSERT INTO users 
//          (email, password_hash, first_name, last_name, phone, hear_about, receive_offers)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           email,
//           password_hash,
//           first_name,
//           last_name,
//           phone || null,
//           hear_about || null,
//           receive_offers ? 1 : 0
//         ]
//       )

//       await connection.query('COMMIT')

//       return NextResponse.json({ 
//         success: true, 
//         message: 'User created successfully',
//         user_id: result.insertId
//       }, { status: 201 })

//     } catch (error) {
//       if (connection) await connection.query('ROLLBACK')
//       throw error
//     } finally {
//       if (connection) connection.release()
//     }

//   } catch (error) {
//     console.error('Error creating user:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to create user: ' + error.message },
//       { status: 500 }
//     )
//   }
// }

// // PUT - Update user
// export async function PUT(request) {
//   let connection;
  
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     const body = await request.json()

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'User ID is required' },
//         { status: 400 }
//       )
//     }

//     const {
//       email,
//       password,
//       first_name,
//       last_name,
//       phone,
//       hear_about,
//       receive_offers
//     } = body

//     // Check if user exists
//     const existingUsers = await execute(
//       'SELECT id FROM users WHERE id = ?',
//       [id]
//     )

//     if (existingUsers.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'User not found' },
//         { status: 404 }
//       )
//     }

//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     try {
//       const updates = []
//       const params = []

//       if (email !== undefined) {
//         // Check if new email already exists for another user
//         const emailCheck = await connection.execute(
//           'SELECT id FROM users WHERE email = ? AND id != ?',
//           [email, id]
//         )
//         if (emailCheck[0].length > 0) {
//           await connection.query('ROLLBACK')
//           connection.release()
//           return NextResponse.json(
//             { success: false, message: 'Email already in use by another user' },
//             { status: 409 }
//           )
//         }
//         updates.push('email = ?')
//         params.push(email)
//       }

//       if (password !== undefined && password !== '') {
//         const password_hash = await bcrypt.hash(password, 10)
//         updates.push('password_hash = ?')
//         params.push(password_hash)
//       }

//       if (first_name !== undefined) {
//         updates.push('first_name = ?')
//         params.push(first_name)
//       }

//       if (last_name !== undefined) {
//         updates.push('last_name = ?')
//         params.push(last_name)
//       }

//       if (phone !== undefined) {
//         updates.push('phone = ?')
//         params.push(phone || null)
//       }

//       if (hear_about !== undefined) {
//         updates.push('hear_about = ?')
//         params.push(hear_about || null)
//       }

//       if (receive_offers !== undefined) {
//         updates.push('receive_offers = ?')
//         params.push(receive_offers ? 1 : 0)
//       }

//       if (updates.length === 0) {
//         await connection.query('ROLLBACK')
//         connection.release()
//         return NextResponse.json(
//           { success: false, message: 'No fields to update' },
//           { status: 400 }
//         )
//       }

//       params.push(id)

//       await connection.execute(
//         `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
//         params
//       )

//       await connection.query('COMMIT')

//       return NextResponse.json({ 
//         success: true, 
//         message: 'User updated successfully' 
//       })

//     } catch (error) {
//       if (connection) await connection.query('ROLLBACK')
//       throw error
//     } finally {
//       if (connection) connection.release()
//     }

//   } catch (error) {
//     console.error('Error updating user:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to update user: ' + error.message },
//       { status: 500 }
//     )
//   }
// }

// // DELETE - Delete user
// export async function DELETE(request) {
//   let connection;
  
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'User ID is required' },
//         { status: 400 }
//       )
//     }

//     // Check if user exists
//     const existingUsers = await execute(
//       'SELECT id FROM users WHERE id = ?',
//       [id]
//     )

//     if (existingUsers.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'User not found' },
//         { status: 404 }
//       )
//     }

//     // Check if user has bookings
//     const bookings = await execute(
//       'SELECT COUNT(*) as count FROM bookings WHERE user_id = ?',
//       [id]
//     )

//     if (bookings[0].count > 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: `Cannot delete user. They have ${bookings[0].count} booking(s). Consider deactivating instead.` 
//         },
//         { status: 409 }
//       )
//     }

//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     try {
//       await connection.execute('DELETE FROM users WHERE id = ?', [id])
//       await connection.query('COMMIT')

//       return NextResponse.json({ 
//         success: true, 
//         message: 'User deleted successfully' 
//       })

//     } catch (error) {
//       if (connection) await connection.query('ROLLBACK')
//       throw error
//     } finally {
//       if (connection) connection.release()
//     }

//   } catch (error) {
//     console.error('Error deleting user:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to delete user: ' + error.message },
//       { status: 500 }
//     )
//   }
// }























// app/api/customers/route.js
// Table: users (with role column: 'admin' | 'user')

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    // Bookings for a specific user (modal detail view)
    if (email) {
      const bookings = await query(
        `SELECT b.*, c.name as category_name
         FROM bookings b
         LEFT JOIN service_categories c ON b.category_id = c.id
         WHERE b.customer_email = ?
         ORDER BY b.created_at DESC`,
        [email]
      )
      return NextResponse.json({ success: true, data: bookings })
    }

    // Return ALL users with role included — frontend splits admin vs user
    const users = await query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.hear_about,
        u.receive_offers,
        u.role,
        u.created_at,
        COUNT(b.id) as booking_count
       FROM users u
       LEFT JOIN bookings b ON b.customer_email = u.email
       GROUP BY u.id
       ORDER BY u.role ASC, u.created_at DESC`
    )

    return NextResponse.json({ success: true, data: users, total: users.length })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })

    const { first_name, last_name, phone, receive_offers } = await request.json()

    await query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, receive_offers = ?, updated_at = NOW() WHERE id = ? AND role = 'user'`,
      [first_name, last_name, phone || null, receive_offers ? 1 : 0, id]
    )

    return NextResponse.json({ success: true, message: 'Customer updated' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ success: false, message: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })

    // Only allow deleting role = 'user', never admin
    await query(`DELETE FROM users WHERE id = ? AND role = 'user'`, [id])

    return NextResponse.json({ success: true, message: 'Customer deleted' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete customer' }, { status: 500 })
  }
}