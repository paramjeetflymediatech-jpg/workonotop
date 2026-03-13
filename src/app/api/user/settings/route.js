import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const results = await execute(
      'SELECT push_notifications_enabled, booking_reminders_enabled, dark_mode_enabled, receive_offers FROM users WHERE id = ?',
      [decoded.id]
    );

    if (results.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        data: {
            push_notifications_enabled: !!results[0].push_notifications_enabled,
            booking_reminders_enabled: !!results[0].booking_reminders_enabled,
            dark_mode_enabled: !!results[0].dark_mode_enabled,
            receive_offers: !!results[0].receive_offers
        }
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { push_notifications_enabled, booking_reminders_enabled, dark_mode_enabled, receive_offers } = body;

    const queryParams = [];
    const fields = [];

    if (push_notifications_enabled !== undefined) {
      fields.push('push_notifications_enabled = ?');
      queryParams.push(push_notifications_enabled ? 1 : 0);
    }
    if (booking_reminders_enabled !== undefined) {
      fields.push('booking_reminders_enabled = ?');
      queryParams.push(booking_reminders_enabled ? 1 : 0);
    }
    if (dark_mode_enabled !== undefined) {
      fields.push('dark_mode_enabled = ?');
      queryParams.push(dark_mode_enabled ? 1 : 0);
    }
    if (receive_offers !== undefined) {
      fields.push('receive_offers = ?');
      queryParams.push(receive_offers ? 1 : 0);
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }

    queryParams.push(decoded.id);
    await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, queryParams);

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
