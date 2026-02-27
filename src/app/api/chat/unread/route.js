import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const userType = searchParams.get('userType');

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

    // Get user ID based on type
    const userId = userType === 'customer' ? decoded.id : decoded.providerId;

    // Count unread messages where sender is NOT the current user
    const result = await execute(
      `SELECT COUNT(*) as count 
       FROM chat_messages 
       WHERE booking_id = ? 
         AND sender_type != ? 
         AND sender_id != ? 
         AND is_read = 0`,
      [bookingId, userType, userId]
    );

    return NextResponse.json({
      success: true,
      unreadCount: result[0]?.count || 0
    });

  } catch (error) {
    console.error('Unread count error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}