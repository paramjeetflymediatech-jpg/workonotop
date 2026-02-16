// app/api/customers/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const id = params.id;

    const customers = await query(
      `SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        phone, 
        hear_about,
        receive_offers,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as total_bookings,
        (SELECT COALESCE(SUM(service_price), 0) FROM bookings WHERE user_id = users.id) as total_spent
      FROM users 
      WHERE id = ? AND (is_pro = FALSE OR is_pro IS NULL)`,
      [id]
    );

    if (customers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customers[0];

    // Get customer's bookings with details
    const bookings = await query(
      `SELECT 
        b.id, 
        b.booking_number, 
        b.service_name, 
        b.service_price,
        b.status,
        b.job_date,
        b.job_time_slot,
        b.created_at,
        b.address_line1,
        b.city,
        (SELECT COUNT(*) FROM booking_photos WHERE booking_id = b.id) as photo_count
      FROM bookings b
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`,
      [id]
    );

    customer.recent_bookings = bookings;

    // Get customer stats
    const stats = await query(
      `SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(service_price), 0) as total_spent,
        AVG(service_price) as avg_booking_value,
        MIN(created_at) as first_booking,
        MAX(created_at) as last_booking
      FROM bookings 
      WHERE user_id = ?`,
      [id]
    );

    customer.stats = stats[0];

    return NextResponse.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}