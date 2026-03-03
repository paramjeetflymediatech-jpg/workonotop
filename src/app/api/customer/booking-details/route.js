import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('customer_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get booking ID from URL
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    // Get booking details with all related data - Using correct table names
    const [bookings] = await connection.execute(
      `SELECT 
        b.*,
        s.name as service_name,
        s.duration_minutes as service_duration,
        s.slug as service_slug,
        s.image_url as service_image,
        s.base_price as service_base_price,
        sc.name as category_name,
        sp.name as provider_name,
        sp.phone as provider_phone,
        sp.email as provider_email,
        sp.rating as provider_rating,
        sp.avatar_url as provider_avatar,
        GROUP_CONCAT(DISTINCT bp.photo_url) as photos
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN booking_photos bp ON b.id = bp.booking_id
      WHERE b.id = ? AND b.user_id = ?
      GROUP BY b.id`,
      [bookingId, decoded.id]
    );

    connection.release();

    if (!bookings || bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    // Parse photos
    let photos = [];
    if (booking.photos) {
      photos = booking.photos.split(',');
    }
    delete booking.photos;

    // Parse job_time_slot if it's a string
    if (booking.job_time_slot && typeof booking.job_time_slot === 'string') {
      try {
        booking.job_time_slot = JSON.parse(booking.job_time_slot);
      } catch {
        booking.job_time_slot = booking.job_time_slot.split(',').map(s => s.trim());
      }
    }

    // Calculate final amounts
    const basePrice = parseFloat(booking.service_price) || 0;
    const overtimeEarnings = parseFloat(booking.overtime_earnings) || 0;
    const finalAmount = basePrice + overtimeEarnings;

    // Return in the format your frontend expects
    return NextResponse.json({
      success: true,
      data: [{
        ...booking,
        photos: photos,
        display: {
          base_price: basePrice,
          overtime_earnings: overtimeEarnings,
          customer_total: finalAmount,
          provider_gets: parseFloat(booking.final_provider_amount || booking.provider_amount || 0),
          has_overtime: overtimeEarnings > 0,
          overtime_minutes: booking.overtime_minutes || 0,
          overtime_rate: parseFloat(booking.additional_price || 0),
          standard_duration: booking.service_duration || booking.standard_duration_minutes || 60,
          actual_duration: booking.actual_duration_minutes || 0
        }
      }]
    });

  } catch (error) {
    console.error('Booking details error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load booking details' },
      { status: 500 }
    );
  }
}

