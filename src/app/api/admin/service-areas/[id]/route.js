import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

async function verifyAdmin(request) {
  const token = request.cookies.get('adminAuth')?.value;
  if (!token) return false;
  return !!verifyToken(token);
}

export async function PUT(request, { params }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, cluster_group, is_active } = body;

    if (!name || !cluster_group) {
      return NextResponse.json({ success: false, message: 'Name and Cluster Group are required' }, { status: 400 });
    }

    await pool.execute(
      'UPDATE service_areas SET name = ?, cluster_group = ?, is_active = ? WHERE id = ?',
      [name, cluster_group, is_active ? 1 : 0, id]
    );

    return NextResponse.json({ success: true, message: 'Service area updated successfully' });
  } catch (error) {
    console.error('Error updating service area:', error);
    return NextResponse.json({ success: false, message: 'Failed to update service area' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    await pool.execute('DELETE FROM service_areas WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Service area deleted successfully' });
  } catch (error) {
    console.error('Error deleting service area:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete service area' }, { status: 500 });
  }
}
