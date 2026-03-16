import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    let token = request.cookies.get('provider_token')?.value;
    
    if (!token) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userType = decoded?.type || decoded?.role;

    if (!decoded || userType !== 'provider') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const providerId = decoded.providerId || decoded.id;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let query = `
      SELECT 
        b.id, 
        b.job_date, 
        b.status,
        u.first_name, 
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        s.name as service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      WHERE b.provider_id = ?
    `;

    const params = [providerId];

    if (statusFilter) {
      const statuses = statusFilter.split(',');
      query += ` AND b.status IN (${statuses.map(() => '?').join(',')})`;
      params.push(...statuses);
    }

    query += ` ORDER BY b.created_at DESC`;

    const bookings = await execute(query, params);
    return NextResponse.json({ success: true, bookings });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}