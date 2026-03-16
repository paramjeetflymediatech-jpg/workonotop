import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch invoices for this user with service details
    const invoices = await execute(
      `SELECT 
        i.*,
        s.name as service_name
       FROM invoices i
       JOIN bookings b ON i.booking_id = b.id
       JOIN services s ON b.service_id = s.id
       WHERE i.user_id = ? 
       AND i.invoice_type = 'customer'
       ORDER BY i.created_at DESC`,
      [userId]
    )

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
