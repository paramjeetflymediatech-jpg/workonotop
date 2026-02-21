// // app/api/provider/route.js

// import { NextResponse } from 'next/server'
// import { query } from '@/lib/db'
// import jwt from 'jsonwebtoken'

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// // GET — no auth required for listing (admin panel use)
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     const status = searchParams.get('status')

//     // Single provider by ID
//     if (id) {
//       const rows = await query(
//         `SELECT id, name, email, phone, specialty, experience_years,
//                 rating, total_jobs, bio, avatar_url, location, city, status, created_at
//          FROM service_providers WHERE id = ?`,
//         [id]
//       )
//       if (rows.length === 0) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 })
//       return NextResponse.json({ success: true, data: rows[0] })
//     }

//     // All providers — optional status filter
//     let sql = `
//       SELECT id, name, email, phone, specialty, experience_years,
//              rating, total_jobs, bio, avatar_url, location, city, status, created_at
//       FROM service_providers
//     `
//     const params = []
//     if (status) {
//       sql += ` WHERE status = ?`
//       params.push(status)
//     }
//     sql += ` ORDER BY name ASC`

//     const providers = await query(sql, params)
//     return NextResponse.json({ success: true, data: providers, total: providers.length })

//   } catch (error) {
//     console.error('Error fetching providers:', error)
//     return NextResponse.json({ success: false, message: 'Failed to fetch providers' }, { status: 500 })
//   }
// }

// // PUT — two modes:
// //   1. Admin status update: ?id=X with { status }   — no auth needed
// //   2. Provider own profile update: Bearer token     — auth required
// export async function PUT(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     const body = await request.json()

//     // Admin: status update only
//     if (id) {
//       const { status } = body
//       const allowed = ['active', 'inactive', 'suspended']
//       if (!status || !allowed.includes(status)) {
//         return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 })
//       }
//       await query(`UPDATE service_providers SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id])
//       return NextResponse.json({ success: true, message: 'Status updated' })
//     }

//     // Provider: own profile update (requires JWT)
//     const token = request.headers.get('Authorization')?.split(' ')[1]
//     if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

//     let decoded
//     try { decoded = jwt.verify(token, JWT_SECRET) } catch {
//       return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
//     }

//     const { name, email, phone, specialty, experience_years, bio, location, city, avatar_url } = body

//     if (!name || !email || !phone) {
//       return NextResponse.json({ success: false, message: 'Name, email and phone are required' }, { status: 400 })
//     }

//     const existing = await query(
//       'SELECT id FROM service_providers WHERE email = ? AND id != ?',
//       [email, decoded.id]
//     )
//     if (existing.length > 0) {
//       return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 })
//     }

//     await query(
//       `UPDATE service_providers SET
//         name = ?, email = ?, phone = ?, specialty = ?,
//         experience_years = ?, bio = ?, location = ?, city = ?,
//         avatar_url = COALESCE(?, avatar_url), updated_at = NOW()
//        WHERE id = ?`,
//       [name, email, phone, specialty || null,
//        experience_years ? parseInt(experience_years) : null,
//        bio || null, location || null, city || null,
//        avatar_url || null, decoded.id]
//     )

//     const updated = await query(
//       `SELECT id, name, email, phone, specialty, experience_years,
//               rating, total_jobs, bio, avatar_url, location, city, status
//        FROM service_providers WHERE id = ?`,
//       [decoded.id]
//     )

//     return NextResponse.json({ success: true, message: 'Profile updated successfully', data: updated[0] })

//   } catch (error) {
//     console.error('Error updating provider:', error)
//     return NextResponse.json({ success: false, message: 'Failed to update provider' }, { status: 500 })
//   }
// }

// // DELETE — admin only, no auth (internal panel)
// export async function DELETE(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })

//     await query('DELETE FROM service_providers WHERE id = ?', [id])
//     return NextResponse.json({ success: true, message: 'Provider deleted' })

//   } catch (error) {
//     console.error('Error deleting provider:', error)
//     return NextResponse.json({ success: false, message: 'Failed to delete provider' }, { status: 500 })
//   }
// }



// app/api/provider/route.js - OPTIONAL IMPROVEMENT
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'  // ✅ CHANGE: query → execute
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// GET
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')

    if (id) {
      // ✅ Using execute()
      const rows = await execute(
        `SELECT id, name, email, phone, specialty, experience_years,
                rating, total_jobs, bio, avatar_url, location, city, status, created_at
         FROM service_providers WHERE id = ?`,
        [id]
      )
      if (rows.length === 0) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: rows[0] })
    }

    let sql = `
      SELECT id, name, email, phone, specialty, experience_years,
             rating, total_jobs, bio, avatar_url, location, city, status, created_at
      FROM service_providers
    `
    const params = []
    if (status) {
      sql += ` WHERE status = ?`
      params.push(status)
    }
    sql += ` ORDER BY name ASC`

    // ✅ Using execute()
    const providers = await execute(sql, params)
    return NextResponse.json({ success: true, data: providers, total: providers.length })

  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch providers' }, { status: 500 })
  }
}

// PUT
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    // Admin: status update only
    if (id) {
      const { status } = body
      const allowed = ['active', 'inactive', 'suspended']
      if (!status || !allowed.includes(status)) {
        return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 })
      }
      // ✅ Using execute()
      await execute(`UPDATE service_providers SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id])
      return NextResponse.json({ success: true, message: 'Status updated' })
    }

    // Provider: own profile update
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    let decoded
    try { decoded = jwt.verify(token, JWT_SECRET) } catch {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { name, email, phone, specialty, experience_years, bio, location, city, avatar_url } = body

    if (!name || !email || !phone) {
      return NextResponse.json({ success: false, message: 'Name, email and phone are required' }, { status: 400 })
    }

    // ✅ Using execute()
    const existing = await execute(
      'SELECT id FROM service_providers WHERE email = ? AND id != ?',
      [email, decoded.id]
    )
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 })
    }

    // ✅ Using execute()
    await execute(
      `UPDATE service_providers SET
        name = ?, email = ?, phone = ?, specialty = ?,
        experience_years = ?, bio = ?, location = ?, city = ?,
        avatar_url = COALESCE(?, avatar_url), updated_at = NOW()
       WHERE id = ?`,
      [name, email, phone, specialty || null,
       experience_years ? parseInt(experience_years) : null,
       bio || null, location || null, city || null,
       avatar_url || null, decoded.id]
    )

    // ✅ Using execute()
    const updated = await execute(
      `SELECT id, name, email, phone, specialty, experience_years,
              rating, total_jobs, bio, avatar_url, location, city, status
       FROM service_providers WHERE id = ?`,
      [decoded.id]
    )

    return NextResponse.json({ success: true, message: 'Profile updated successfully', data: updated[0] })

  } catch (error) {
    console.error('Error updating provider:', error)
    return NextResponse.json({ success: false, message: 'Failed to update provider' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })

    // ✅ Using execute()
    await execute('DELETE FROM service_providers WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Provider deleted' })

  } catch (error) {
    console.error('Error deleting provider:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete provider' }, { status: 500 })
  }
}