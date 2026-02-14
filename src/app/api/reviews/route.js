import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET all reviews
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('provider_id')
    const rating = searchParams.get('rating')

    let sql = `
      SELECT 
        r.*,
        c.first_name, c.last_name, c.email as customer_email,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        p.name as provider_name,
        s.name as service_name,
        b.booking_date
      FROM reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN service_providers p ON r.provider_id = p.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `
    const params = []

    if (providerId) {
      sql += ' AND r.provider_id = ?'
      params.push(providerId)
    }

    if (rating) {
      sql += ' AND r.rating = ?'
      params.push(rating)
    }

    sql += ' ORDER BY r.created_at DESC'

    const reviews = await query(sql, params)

    return NextResponse.json({ 
      success: true, 
      data: reviews 
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// DELETE review
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

    await query('DELETE FROM reviews WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete review' },
      { status: 500 }
    )
  }
}