// app/api/customers/route.js - FIXED
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      const bookings = await execute(
        `SELECT b.*, c.name as category_name
         FROM bookings b
         LEFT JOIN service_categories c ON b.category_id = c.id
         WHERE b.customer_email = ?
         ORDER BY b.created_at DESC`,
        [email]
      )
      return NextResponse.json({ success: true, data: bookings })
    }

    const users = await execute(
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

    await execute(
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

    // ✅ FIXED: Backticks use karo
    await execute(`DELETE FROM users WHERE id = ? AND role = 'user'`, [id])

    return NextResponse.json({ success: true, message: 'Customer deleted' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete customer' }, { status: 500 })
  }
}