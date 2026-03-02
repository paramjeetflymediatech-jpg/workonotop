import { NextResponse } from 'next/server';
import { execute, withConnection } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

// GET messages
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

    // use a single connection for all queries involved in this request
    return await withConnection(async (connection) => {
      const [messages] = await connection.execute(
        `SELECT * FROM chat_messages 
           WHERE booking_id = ? 
           ORDER BY created_at ASC`,
        [bookingId]
      );

      // Get sender names
      const messagesWithNames = [];
      for (const msg of messages) {
        let sender_name = '';
        if (msg.sender_type === 'customer') {
          const [users] = await connection.execute(
            'SELECT first_name FROM users WHERE id = ?',
            [msg.sender_id]
          );
          sender_name = users[0]?.first_name || 'Customer';
        } else {
          const [providers] = await connection.execute(
            'SELECT name FROM service_providers WHERE id = ?',
            [msg.sender_id]
          );
          sender_name = providers[0]?.name || 'Provider';
        }
        messagesWithNames.push({ ...msg, sender_name });
      }

      return NextResponse.json({
        success: true,
        messages: messagesWithNames
      });
    });
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST new message
export async function POST(request) {
  try {
    const { bookingId, message } = await request.json();

    if (!bookingId || !message) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and message required' },
        { status: 400 }
      );
    }

    // Check authentication
    const customerToken = request.cookies.get('customer_token')?.value;
    const providerToken = request.cookies.get('provider_token')?.value;
    const token = customerToken || providerToken;
    
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

    const senderType = customerToken ? 'customer' : 'provider';
    const senderId = senderType === 'customer' ? decoded.id : decoded.providerId;

    // perform all database work on a single connection for the whole
    // request.  this prevents the pool from handing out multiple sockets
    // when we could have just reused one.
    return await withConnection(async (connection) => {
      // Check booking exists
      const [bookings] = await connection.execute(
        `SELECT id, status FROM bookings WHERE id = ?`,
        [bookingId]
      );

      if (bookings.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Booking not found' },
          { status: 404 }
        );
      }

      // Insert message
      const [result] = await connection.execute(
        `INSERT INTO chat_messages (booking_id, sender_id, sender_type, message) 
         VALUES (?, ?, ?, ?)`,
        [bookingId, senderId, senderType, message]
      );

      // Get inserted message
      const [newMessages] = await connection.execute(
        `SELECT * FROM chat_messages WHERE id = ?`,
        [result.insertId]
      );

      const newMessage = newMessages[0];
      
      // Add sender name
      let sender_name = '';
      if (newMessage.sender_type === 'customer') {
        const [users] = await connection.execute(
          'SELECT first_name FROM users WHERE id = ?',
          [newMessage.sender_id]
        );
        sender_name = users[0]?.first_name || 'Customer';
      } else {
        const [providers] = await connection.execute(
          'SELECT name FROM service_providers WHERE id = ?',
          [newMessage.sender_id]
        );
        sender_name = providers[0]?.name || 'Provider';
      }
      newMessage.sender_name = sender_name;

      return NextResponse.json({
        success: true,
        message: newMessage
      });
    });

  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}