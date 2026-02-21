


// app/api/bookings/[id]/route.js - FIXED
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'  // ✅ CHANGE: query → execute

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // ✅ SINGLE QUERY - sab kuch ek saath
    const results = await execute(`
      SELECT 
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
        sp.rating as provider_rating,
        -- Photos as JSON array
        (
          SELECT JSON_ARRAYAGG(photo_url)
          FROM booking_photos 
          WHERE booking_id = b.id
        ) as photos_json,
        -- Status history as JSON array
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', h.id,
              'status', h.status,
              'notes', h.notes,
              'created_at', h.created_at
            )
          )
          FROM booking_status_history h
          WHERE h.booking_id = b.id
          ORDER BY h.created_at DESC
        ) as history_json
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      WHERE b.id = ? OR b.booking_number = ?
    `, [id, id])

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    const booking = results[0]

    // ✅ Parse JSON fields
    if (booking.job_time_slot) {
      booking.job_time_slot = booking.job_time_slot.split(',')
    }

    // Parse photos from JSON
    try {
      booking.photos = JSON.parse(booking.photos_json) || []
    } catch {
      booking.photos = []
    }
    delete booking.photos_json

    // Parse history from JSON
    try {
      booking.status_history = JSON.parse(booking.history_json) || []
    } catch {
      booking.status_history = []
    }
    delete booking.history_json

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
  // ✅ Connection automatically released by execute()
}