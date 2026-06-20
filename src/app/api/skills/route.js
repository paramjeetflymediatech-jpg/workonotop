import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const rows = await pool.query('SELECT id, name FROM skills WHERE is_active = 1 ORDER BY name ASC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch skills' }, { status: 500 });
  }
}
