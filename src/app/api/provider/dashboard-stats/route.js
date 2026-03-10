import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const token = request.cookies.get('provider_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const providerId = decoded.providerId;

    // Get job stats
    const jobStats = await execute(
      `SELECT 
        COUNT(*) as totalJobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedJobs,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressJobs,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmedJobs,
        SUM(provider_amount) as totalEarnings
       FROM bookings 
       WHERE provider_id = ?`,
      [providerId]
    );

    // Get average rating
    const ratingStats = await execute(
      `SELECT AVG(rating) as avgRating 
       FROM provider_reviews 
       WHERE provider_id = ?`,
      [providerId]
    );

    // Get recent jobs
    const recentJobs = await execute(
      `SELECT id, service_name, job_date, status, provider_amount
       FROM bookings 
       WHERE provider_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [providerId]
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalJobs: parseInt(jobStats[0]?.totalJobs || 0),
        completedJobs: parseInt(jobStats[0]?.completedJobs || 0),
        inProgressJobs: parseInt(jobStats[0]?.inProgressJobs || 0),
        confirmedJobs: parseInt(jobStats[0]?.confirmedJobs || 0),
        totalEarnings: parseFloat(jobStats[0]?.totalEarnings || 0),
        averageRating: parseFloat(ratingStats[0]?.avgRating || 0),
        recentJobs: recentJobs || []
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}