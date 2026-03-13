import { NextResponse } from 'next/server';
import { execute as query } from '@/lib/db';
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

    const results = await query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [decoded.id]
    );

    return NextResponse.json({ success: true, data: results });

  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
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
    const { name, address_line1, address_line2, city, postal_code, is_default } = body;

    if (!name || !address_line1 || !city) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // If setting as default, unset others first
    if (is_default) {
      await query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [decoded.id]);
    }

    const result = await query(
      `INSERT INTO user_addresses (user_id, name, address_line1, address_line2, city, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [decoded.id, name, address_line1, address_line2 || null, city, postal_code || null, is_default ? 1 : 0]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Address added successfully', 
      data: { id: result.insertId } 
    });

  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
