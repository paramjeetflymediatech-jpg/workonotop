import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request, { params }) {
    try {
        const { id } = params;

        // Verify mobile Bearer token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // Find the booking and verify ownership
        const bookings = await execute(
            `SELECT id, status, user_id FROM bookings WHERE id = ?`,
            [id]
        );

        if (bookings.length === 0) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        const booking = bookings[0];

        // Verify this booking belongs to the requesting customer
        const customerId = decoded.id || decoded.userId;
        if (String(booking.user_id) !== String(customerId)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        // Only pending bookings can be cancelled
        if (booking.status !== 'pending') {
            return NextResponse.json({
                success: false,
                message: `Booking cannot be cancelled. Current status: ${booking.status}`
            }, { status: 400 });
        }

        // Cancel the booking
        await execute(
            `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
            [id]
        );

        // Log status history
        await execute(
            `INSERT INTO booking_status_history (booking_id, status, notes, created_at)
             VALUES (?, 'cancelled', 'Cancelled by customer', NOW())`,
            [id]
        ).catch(() => { /* status history table may not exist - safe to ignore */ });

        return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });

    } catch (error) {
        console.error('Cancel booking error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
