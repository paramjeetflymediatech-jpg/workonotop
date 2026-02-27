import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID required' },
        { status: 400 }
      );
    }

    // Verify customer authentication
    const token = request.cookies.get('customer_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get booking details with all related information
    const bookings = await execute(
      `SELECT 
        b.*,
        s.name as service_name,
        s.description as service_description,
        s.category_id,
        c.name as category_name,
        sp.name as provider_name,
        sp.phone as provider_phone,
        sp.email as provider_email,
        sp.rating as provider_rating,
        sp.avatar_url as provider_avatar,
        sp.specialty as provider_specialty,
        sp.experience_years as provider_experience,
        sp.bio as provider_bio,
        (
          SELECT COUNT(*) 
          FROM chat_messages 
          WHERE booking_id = b.id
        ) as message_count,
        (
          SELECT photo_url 
          FROM booking_photos 
          WHERE booking_id = b.id 
          LIMIT 1
        ) as service_photo
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       LEFT JOIN service_categories c ON s.category_id = c.id
       LEFT JOIN service_providers sp ON b.provider_id = sp.id
       WHERE b.id = ? AND b.user_id = ?`,
      [bookingId, decoded.id]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    // Get booking status history
    const statusHistory = await execute(
      `SELECT status, notes, created_at 
       FROM booking_status_history 
       WHERE booking_id = ? 
       ORDER BY created_at DESC`,
      [bookingId]
    );

    // Get booking photos
    const photos = await execute(
      `SELECT photo_url, created_at 
       FROM booking_photos 
       WHERE booking_id = ? 
       ORDER BY created_at DESC`,
      [bookingId]
    );

    // Get job photos (before/after)
    const jobPhotos = await execute(
      `SELECT photo_url, photo_type, uploaded_at 
       FROM job_photos 
       WHERE booking_id = ? 
       ORDER BY photo_type, uploaded_at DESC`,
      [bookingId]
    );

    // Get invoice if exists
    const invoices = await execute(
      `SELECT invoice_number, total_amount, status, payment_date 
       FROM invoices 
       WHERE booking_id = ? AND invoice_type = 'customer'`,
      [bookingId]
    );

    const invoice = invoices[0];

    // Format the response
    const formattedBooking = {
      id: booking.id,
      booking_number: booking.booking_number,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      
      // Service details
      service: {
        id: booking.service_id,
        name: booking.service_name,
        description: booking.service_description,
        category: booking.category_name,
        price: parseFloat(booking.service_price),
        photo: booking.service_photo
      },

      // Provider details (if assigned)
      provider: booking.provider_id ? {
        id: booking.provider_id,
        name: booking.provider_name,
        phone: booking.provider_phone,
        email: booking.provider_email,
        rating: parseFloat(booking.provider_rating || 0),
        avatar: booking.provider_avatar,
        specialty: booking.provider_specialty,
        experience: booking.provider_experience,
        bio: booking.provider_bio
      } : null,

      // Customer details
      customer: {
        first_name: booking.customer_first_name,
        last_name: booking.customer_last_name,
        email: booking.customer_email,
        phone: booking.customer_phone
      },

      // Job details
      job: {
        date: booking.job_date,
        time_slot: booking.job_time_slot,
        description: booking.job_description,
        timing_constraints: booking.timing_constraints,
        instructions: booking.instructions,
        parking_access: booking.parking_access === 1,
        elevator_access: booking.elevator_access === 1,
        has_pets: booking.has_pets === 1
      },

      // Location
      location: {
        address_line1: booking.address_line1,
        address_line2: booking.address_line2,
        city: booking.city,
        postal_code: booking.postal_code
      },

      // Pricing
      pricing: {
        base_price: parseFloat(booking.service_price || 0),
        additional_price: parseFloat(booking.additional_price || 0),
        commission_percent: booking.commission_percent,
        provider_amount: parseFloat(booking.provider_amount || 0),
        overtime_minutes: booking.overtime_minutes || 0,
        overtime_earnings: parseFloat(booking.overtime_earnings || 0),
        final_provider_amount: parseFloat(booking.final_provider_amount || 0),
        total: parseFloat(booking.final_provider_amount || booking.service_price || 0)
      },

      // Payment
      payment: {
        status: booking.payment_status,
        method: booking.payment_method,
        intent_id: booking.payment_intent_id,
        invoice: invoice ? {
          number: invoice.invoice_number,
          amount: parseFloat(invoice.total_amount),
          status: invoice.status,
          payment_date: invoice.payment_date
        } : null
      },

      // Timeline
      timeline: {
        accepted_at: booking.accepted_at,
        start_time: booking.start_time,
        end_time: booking.end_time,
        actual_duration_minutes: booking.actual_duration_minutes,
        job_timer_status: booking.job_timer_status
      },

      // Photos
      photos: {
        booking_photos: photos,
        job_photos: jobPhotos,
        before_photos_uploaded: booking.before_photos_uploaded === 1,
        after_photos_uploaded: booking.after_photos_uploaded === 1
      },

      // Additional data
      status_history: statusHistory,
      message_count: booking.message_count || 0
    };

    return NextResponse.json({
      success: true,
      booking: formattedBooking
    });

  } catch (error) {
    console.error('Booking details error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}