import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const email = searchParams.get('email')

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, message: 'User ID or email is required' },
        { status: 400 }
      )
    }

    let sql = `
      SELECT 
        i.*,
        s.name as service_name
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE i.invoice_type = 'customer'
    `
    const params = []

    if (userId && userId !== 'null' && userId !== 'undefined') {
      sql += ' AND (i.user_id = ? OR b.customer_email = ?)'
      params.push(userId, email || '')
    } else if (email) {
      sql += ' AND b.customer_email = ?'
      params.push(email)
    }

    sql += ' ORDER BY i.created_at DESC'

    // Fetch invoices for this user with service details
    const invoices = await execute(sql, params)

    return NextResponse.json({ 
      success: true, 
      data: invoices 
    })

  } catch (error) {
    console.error('Error fetching customer invoices:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch invoices' 
    }, { status: 500 })
  }
}
