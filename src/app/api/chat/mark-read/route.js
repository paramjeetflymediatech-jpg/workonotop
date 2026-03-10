import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { bookingId, userType } = await request.json();

    if (!bookingId || !userType) {
      return NextResponse.json(
        { success: false, message: 'Missing parameters' },
        { status: 400 }
      );
    }

    // Verify authentication
    const token = request.cookies.get(`${userType}_token`)?.value;
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

    // Mark messages as read where sender is not the current user
    await execute(
      `UPDATE chat_messages 
       SET is_read = 1 
       WHERE booking_id = ? 
         AND sender_type != ? 
         AND is_read = 0`,
      [bookingId, userType]
    );

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}