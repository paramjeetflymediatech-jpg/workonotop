import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

async function verifyAdmin(request) {
  const token = request.cookies.get('adminAuth')?.value;
  if (!token) return false;
  return !!verifyToken(token);
}

export async function GET(request, { params }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const rows = await pool.execute(`
      SELECT c.*, d.name as district_name, d.state_id, s.name as state_name 
      FROM cities c
      LEFT JOIN districts d ON c.district_id = d.id
      LEFT JOIN states s ON d.state_id = s.id
      WHERE c.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'City not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch city' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, district_id, is_active } = body;

    if (!name || !district_id) {
      return NextResponse.json({ success: false, message: 'Name and District ID are required' }, { status: 400 });
    }

    await pool.execute(
      'UPDATE cities SET name = ?, district_id = ?, is_active = ? WHERE id = ?',
      [name, district_id, is_active ? 1 : 0, id]
    );

    return NextResponse.json({ success: true, message: 'City updated successfully' });
  } catch (error) {
    console.error('Error updating city:', error);
    return NextResponse.json({ success: false, message: 'Failed to update city' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    await pool.execute('DELETE FROM cities WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete city' }, { status: 500 });
  }
}
