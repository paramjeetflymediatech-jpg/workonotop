// app/api/customers/[id]/route.js - FIXED
import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';  // ✅ CHANGE: query → execute

export async function GET(request, { params }) {
  try {
    const id = params.id;

    // ✅ SINGLE QUERY - sab kuch ek saath
    const results = await execute(`
      SELECT 
        -- Customer info
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.phone, 
        u.hear_about,
        u.receive_offers,
        u.created_at,
        u.updated_at,
        
        -- Customer stats (from subqueries)
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as total_bookings,
        (SELECT COALESCE(SUM(service_price), 0) FROM bookings WHERE user_id = u.id) as total_spent,
        (SELECT COALESCE(AVG(service_price), 0) FROM bookings WHERE user_id = u.id) as avg_booking_value,
        (SELECT MIN(created_at) FROM bookings WHERE user_id = u.id) as first_booking,
        (SELECT MAX(created_at) FROM bookings WHERE user_id = u.id) as last_booking,
        
        -- Recent bookings as JSON
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', b.id,
              'booking_number', b.booking_number,
              'service_name', b.service_name,
              'service_price', b.service_price,
              'status', b.status,
              'job_date', b.job_date,
              'job_time_slot', b.job_time_slot,
              'created_at', b.created_at,
              'address_line1', b.address_line1,
              'city', b.city,
              'photo_count', (SELECT COUNT(*) FROM booking_photos WHERE booking_id = b.id)
            )
          )
          FROM bookings b
          WHERE b.user_id = u.id
          ORDER BY b.created_at DESC
        ) as recent_bookings_json
        
      FROM users u
      WHERE u.id = ? AND (u.is_pro = FALSE OR u.is_pro IS NULL)
    `, [id]);

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    const row = results[0];

    // Parse JSON fields
    const customer = {
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      hear_about: row.hear_about,
      receive_offers: row.receive_offers,
      created_at: row.created_at,
      updated_at: row.updated_at,
      total_bookings: row.total_bookings || 0,
      total_spent: row.total_spent || 0,
      stats: {
        total_bookings: row.total_bookings || 0,
        total_spent: row.total_spent || 0,
        avg_booking_value: row.avg_booking_value || 0,
        first_booking: row.first_booking,
        last_booking: row.last_booking
      }
    };

    // Parse recent bookings
    try {
      customer.recent_bookings = JSON.parse(row.recent_bookings_json) || [];
    } catch {
      customer.recent_bookings = [];
    }

    return NextResponse.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customer: ' + error.message },
      { status: 500 }
    );
  }
  // ✅ Connection automatically released by execute()
}