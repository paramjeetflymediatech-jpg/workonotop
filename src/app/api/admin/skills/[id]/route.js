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

    const id = params.id;
    const rows = await pool.query('SELECT * FROM skills WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch skill' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const id = params.id;
    const body = await request.json();
    const { name, is_active } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }

    // Check if another skill with the same name exists
    const existing = await pool.query('SELECT id FROM skills WHERE name = ? AND id != ?', [name, id]);
    if (existing.length > 0) {
        return NextResponse.json({ success: false, message: 'Skill with this name already exists' }, { status: 400 });
    }

    await pool.execute(
      'UPDATE skills SET name = ?, is_active = ? WHERE id = ?',
      [name, is_active ? 1 : 0, id]
    );

    return NextResponse.json({ success: true, message: 'Skill updated successfully' });
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json({ success: false, message: 'Failed to update skill' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const id = params.id;

    await pool.execute('DELETE FROM skills WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete skill' }, { status: 500 });
  }
}
