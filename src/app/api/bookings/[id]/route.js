





// app/api/bookings/[id]/route.js - UPDATED with service duration

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // Get booking details with joins - include service duration
    const bookings = await query(
      `SELECT 
        b.*,
        s.name as service_name,
        s.slug as service_slug,
        s.image_url as service_image,
        s.description as service_description,
        s.duration_minutes as service_duration,
        c.name as category_name,
        c.icon as category_icon,
        sp.name as provider_name,
        sp.phone as provider_phone,
        sp.email as provider_email,
        sp.rating as provider_rating
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      WHERE b.id = ? OR b.booking_number = ?`,
      [id, id]
    )

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    const booking = bookings[0]

    // Handle time slots
    if (booking.job_time_slot) {
      booking.job_time_slot = booking.job_time_slot.split(',')
    }

    // Get photos
    const photos = await query(
      'SELECT photo_url FROM booking_photos WHERE booking_id = ?',
      [booking.id]
    )
    booking.photos = photos.map(p => p.photo_url)

    // Get status history
    const history = await query(
      `SELECT * FROM booking_status_history 
       WHERE booking_id = ? 
       ORDER BY created_at DESC`,
      [booking.id]
    )
    booking.status_history = history

    // Ensure numeric values are proper numbers
    booking.service_price = parseFloat(booking.service_price || 0)
    booking.additional_price = parseFloat(booking.additional_price || 0)
    booking.provider_amount = parseFloat(booking.provider_amount || 0)
    booking.overtime_earnings = parseFloat(booking.overtime_earnings || 0)
    booking.final_provider_amount = booking.final_provider_amount ? parseFloat(booking.final_provider_amount) : null
    booking.commission_percent = booking.commission_percent ? parseFloat(booking.commission_percent) : null
    
    // Add duration from service
    booking.duration_minutes = booking.service_duration || 60

    return NextResponse.json({ success: true, data: booking })

  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking: ' + error.message },
      { status: 500 }
    )
  }
}