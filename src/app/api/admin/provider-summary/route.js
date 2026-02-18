import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'workontap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json({
        success: false,
        message: 'Provider ID is required'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Get provider details with aggregated stats
      const [providerStats] = await connection.execute(`
        SELECT 
          sp.*,
          COUNT(DISTINCT b.id) as total_jobs,
          SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
          SUM(CASE WHEN b.status IN ('pending', 'matching') THEN 1 ELSE 0 END) as pending_jobs,
          SUM(CASE WHEN b.status IN ('confirmed', 'in_progress', 'assigned') THEN 1 ELSE 0 END) as active_jobs,
          SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_jobs,
          COALESCE(SUM(b.final_provider_amount), 0) as total_earnings,
          COALESCE(AVG(CASE WHEN b.status = 'completed' THEN TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time) END), 0) as avg_job_duration,
          MAX(b.end_time) as last_job_date,
          MIN(b.created_at) as first_job_date
        FROM service_providers sp
        LEFT JOIN bookings b ON sp.id = b.provider_id
        WHERE sp.id = ?
        GROUP BY sp.id
      `, [providerId]);

      if (!providerStats || providerStats.length === 0) {
        connection.release();
        return NextResponse.json({
          success: false,
          message: 'Provider not found'
        }, { status: 404 });
      }

      // Get recent jobs (last 5)
      const [recentJobs] = await connection.execute(`
        SELECT 
          b.id,
          b.booking_number,
          b.service_name,
          b.status,
          b.job_date,
          b.final_provider_amount as amount,
          CONCAT(cu.first_name, ' ', cu.last_name) as customer_name
        FROM bookings b
        LEFT JOIN customers cu ON b.user_id = cu.id
        WHERE b.provider_id = ?
        ORDER BY b.created_at DESC
        LIMIT 5
      `, [providerId]);

      connection.release();

      const stats = providerStats[0];
      
      // Calculate completion rate
      const completionRate = stats.total_jobs > 0 
        ? Math.round((stats.completed_jobs / stats.total_jobs) * 100) 
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          ...stats,
          completion_rate: completionRate,
          avg_job_duration: Math.round(stats.avg_job_duration),
          recent_jobs: recentJobs
        },
        message: 'Provider summary fetched successfully'
      });

    } catch (error) {
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Error fetching provider summary:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch provider summary',
      error: error.message
    }, { status: 500 });
  }
}