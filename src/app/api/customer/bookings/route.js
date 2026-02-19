// app/api/customer/bookings/route.js - FINAL
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

// GET customer's bookings
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
        b.*,
        s.name as service_name,
        s.slug as service_slug,
        s.image_url as service_image,
        s.duration_minutes,
        c.name as category_name,
        c.slug as category_slug,
        sp.name as provider_name,
        sp.rating as provider_rating
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      WHERE 1=1
    `
    const params = []

    if (userId) {
      sql += ' AND b.user_id = ?'
      params.push(userId)
    } else if (email) {
      sql += ' AND b.customer_email = ?'
      params.push(email)
    }

    sql += ' ORDER BY b.created_at DESC'

    const bookings = await execute(sql, params)

    // Get photos and calculate proper amounts
    for (let booking of bookings) {
      const photos = await execute(
        'SELECT photo_url FROM booking_photos WHERE booking_id = ?',
        [booking.id]
      )
      booking.photos = photos.map(p => p.photo_url)

      // Get status history
      const statusHistory = await execute(
        `SELECT * FROM booking_status_history 
         WHERE booking_id = ? 
         ORDER BY created_at DESC`,
        [booking.id]
      )
      booking.status_history = statusHistory

      // Calculate amounts properly
      const basePrice = parseFloat(booking.service_price || 0)
      const additionalPrice = parseFloat(booking.additional_price || 0)
      const overtimeEarnings = parseFloat(booking.overtime_earnings || 0)
      const finalAmount = parseFloat(booking.final_provider_amount || booking.provider_amount || 0)

      booking.display = {
        base_price: basePrice,
        additional_price: additionalPrice,
        overtime_earnings: overtimeEarnings,
        customer_total: basePrice + overtimeEarnings,
        provider_gets: finalAmount,
        has_overtime: overtimeEarnings > 0,
        overtime_minutes: booking.overtime_minutes || 0,
        overtime_rate: additionalPrice
      }
    }

    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    console.error('Error fetching customer bookings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// GET single booking details
export async function POST(request) {
  try {
    const body = await request.json()
    const { booking_id, user_id, email } = body

    if (!booking_id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    let sql = `
      SELECT 
        b.*,
        s.name as service_name,
        s.slug as service_slug,
        s.image_url as service_image,
        s.description as service_description,
        s.duration_minutes,
        c.name as category_name,
        c.slug as category_slug,
        sp.name as provider_name,
        sp.rating as provider_rating,
        sp.phone as provider_phone,
        sp.email as provider_email
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      WHERE b.id = ?
    `
    const params = [booking_id]

    if (user_id) {
      sql += ' AND b.user_id = ?'
      params.push(user_id)
    } else if (email) {
      sql += ' AND b.customer_email = ?'
      params.push(email)
    } else {
      return NextResponse.json(
        { success: false, message: 'User ID or email required for verification' },
        { status: 400 }
      )
    }

    const bookings = await execute(sql, params)

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Booking not found or unauthorized' },
        { status: 404 }
      )
    }

    const booking = bookings[0]

    const photos = await execute(
      'SELECT photo_url FROM booking_photos WHERE booking_id = ?',
      [booking_id]
    )
    booking.photos = photos.map(p => p.photo_url)

    const statusHistory = await execute(
      `SELECT * FROM booking_status_history 
       WHERE booking_id = ? 
       ORDER BY created_at DESC`,
      [booking_id]
    )
    booking.status_history = statusHistory

    const basePrice = parseFloat(booking.service_price || 0)
    const additionalPrice = parseFloat(booking.additional_price || 0)
    const overtimeEarnings = parseFloat(booking.overtime_earnings || 0)
    const finalAmount = parseFloat(booking.final_provider_amount || booking.provider_amount || 0)

    booking.display = {
      base_price: basePrice,
      additional_price: additionalPrice,
      overtime_earnings: overtimeEarnings,
      customer_total: basePrice + overtimeEarnings,
      provider_gets: finalAmount,
      has_overtime: overtimeEarnings > 0,
      overtime_minutes: booking.overtime_minutes || 0,
      overtime_rate: additionalPrice,
      standard_duration: booking.duration_minutes || 60,
      actual_duration: booking.actual_duration_minutes || 0
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
}