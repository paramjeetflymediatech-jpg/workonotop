import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const rows = await pool.query(
      'SELECT id, cluster_key, name, cluster_group FROM service_areas WHERE is_active = 1 ORDER BY cluster_group, name'
    );

    // Group the rows by cluster_group
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.cluster_group]) {
        grouped[row.cluster_group] = [];
      }
      grouped[row.cluster_group].push({
        id: row.id,
        cluster_key: row.cluster_key,
        name: row.name
      });
    }

    return NextResponse.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Error fetching service areas:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service areas' },
      { status: 500 }
    );
  }
}
