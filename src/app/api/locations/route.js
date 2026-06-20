import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get('type') || 'states').trim();
    const parentId = searchParams.get('parentId');

    if (type === 'states') {
      const rows = await pool.query('SELECT id, name FROM states WHERE is_active = 1 ORDER BY name ASC');
      return NextResponse.json({ success: true, data: rows });
    } 
    if (type === 'districts') {
      if (!parentId) return NextResponse.json({ success: false, message: 'Missing parentId' }, { status: 400 });
      const rows = await pool.query(`
        SELECT d.id, d.name, d.state_id 
        FROM districts d 
        JOIN states s ON d.state_id = s.id 
        WHERE d.is_active = 1 AND s.is_active = 1 AND d.state_id = ? 
        ORDER BY d.name ASC
      `, [parentId]);
      return NextResponse.json({ success: true, data: rows });
    }

    if (type === 'cities') {
      if (!parentId) return NextResponse.json({ success: false, message: 'Missing parentId' }, { status: 400 });
      const rows = await pool.query(`
        SELECT c.id, c.name, c.district_id 
        FROM cities c 
        JOIN districts d ON c.district_id = d.id 
        JOIN states s ON d.state_id = s.id 
        WHERE c.is_active = 1 AND d.is_active = 1 AND s.is_active = 1 AND c.district_id = ? 
        ORDER BY c.name ASC
      `, [parentId]);
      return NextResponse.json({ success: true, data: rows });
    }

    return NextResponse.json({ success: false, message: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch locations' }, { status: 500 });
  }
}
