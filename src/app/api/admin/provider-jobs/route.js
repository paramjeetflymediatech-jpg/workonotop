import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'workontap_db',
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
        message: 'Provider ID is required',
        data: null,
        error: 'Missing providerId parameter'
      }, { status: 400 });
    }

    // Get connection from pool
    const connection = await pool.getConnection();

    try {
      // First, check if the provider exists
      const [providerCheck] = await connection.execute(
        'SELECT * FROM service_providers WHERE id = ?',
        [providerId]
      );

      if (!providerCheck || providerCheck.length === 0) {
        connection.release();
        return NextResponse.json({
          success: false,
          message: 'Provider not found',
          data: null,
          error: 'Invalid provider ID'
        }, { status: 404 });
      }

      // Get all jobs for this provider - WITHOUT the photo join to avoid GROUP BY issues
      const [jobs] = await connection.execute(`
        SELECT 
          b.*,
          s.name as service_name,
          s.slug as service_slug,
          s.duration_minutes as service_duration,
          sc.name as category_name,
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
          u.first_name as customer_first_name,
          u.last_name as customer_last_name,
          u.email as customer_email,
          u.phone as customer_phone,
          sp.name as provider_name,
          sp.email as provider_email,
          sp.phone as provider_phone,
          sp.rating as provider_rating
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN service_categories sc ON s.category_id = sc.id
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN service_providers sp ON b.provider_id = sp.id
        WHERE b.provider_id = ?
        ORDER BY b.created_at DESC
      `, [providerId]);

      // Get photos separately for each job
      const jobsWithPhotos = await Promise.all(
        jobs.map(async (job) => {
          const [photos] = await connection.execute(
            `SELECT photo_url, photo_type FROM job_photos WHERE booking_id = ?`,
            [job.id]
          );
          return {
            ...job,
            photos: photos || []
          };
        })
      );

      // Get provider details
      const providerDetails = providerCheck[0];

      // Calculate comprehensive statistics
      const stats = calculateProviderStats(jobsWithPhotos, providerDetails);

      // Get recent jobs for quick view
      const recentJobs = jobsWithPhotos.slice(0, 5);

      connection.release();

      return NextResponse.json({
        success: true,
        data: jobsWithPhotos,
        recentJobs: recentJobs,
        provider: providerDetails,
        stats: stats,
        message: 'Provider jobs fetched successfully',
        error: null
      });

    } catch (error) {
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Error in provider-jobs API:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch provider jobs',
      data: null,
      error: error.message
    }, { status: 500 });
  }
}

function calculateProviderStats(jobs, provider) {
  // Filter jobs by status
  const completed = jobs.filter(j => j.status === 'completed');
  const pending = jobs.filter(j => ['pending', 'matching'].includes(j.status));
  const inProgress = jobs.filter(j => ['confirmed', 'in_progress'].includes(j.status));
  const cancelled = jobs.filter(j => j.status === 'cancelled');
  
  // Calculate total earnings from completed jobs
  const totalEarnings = completed.reduce((sum, job) => {
    return sum + (parseFloat(job.final_provider_amount) || parseFloat(job.provider_amount) || 0);
  }, 0);
  
  // Calculate total hours worked (convert minutes to hours)
  const totalMinutes = completed.reduce((sum, job) => {
    return sum + (parseInt(job.actual_duration_minutes) || 0);
  }, 0);
  
  // Get unique customers count
  const uniqueCustomers = new Set(jobs.map(j => j.user_id).filter(id => id)).size;
  
  // Calculate average job value
  const avgJobValue = completed.length > 0 
    ? totalEarnings / completed.length 
    : 0;
  
  // Calculate average rating from provider record
  const avgRating = parseFloat(provider?.rating) || 0;
  
  // Get top services by frequency
  const serviceCount = {};
  jobs.forEach(job => {
    if (job.service_name) {
      serviceCount[job.service_name] = (serviceCount[job.service_name] || 0) + 1;
    }
  });
  
  const topServices = Object.entries(serviceCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Calculate earnings by service
  const earningsByService = {};
  completed.forEach(job => {
    if (job.service_name) {
      earningsByService[job.service_name] = (earningsByService[job.service_name] || 0) + 
        (parseFloat(job.final_provider_amount) || parseFloat(job.provider_amount) || 0);
    }
  });
  
  const topEarningServices = Object.entries(earningsByService)
    .map(([name, amount]) => ({ name, amount: parseFloat(amount).toFixed(2) }))
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 5);
  
  // Calculate monthly earnings (last 6 months)
  const monthlyEarnings = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const monthEarnings = completed
      .filter(job => {
        const jobDate = new Date(job.end_time || job.created_at);
        return jobDate.getMonth() === monthIndex && jobDate.getFullYear() === year;
      })
      .reduce((sum, job) => sum + (parseFloat(job.final_provider_amount) || parseFloat(job.provider_amount) || 0), 0);
    
    monthlyEarnings.push({
      month: monthName,
      earnings: monthEarnings
    });
  }
  
  // Calculate job status breakdown
  const statusBreakdown = {
    completed: completed.length,
    pending: pending.length,
    in_progress: inProgress.length,
    cancelled: cancelled.length
  };
  
  return {
    totalJobs: jobs.length,
    completedJobs: completed.length,
    pendingJobs: pending.length,
    inProgressJobs: inProgress.length,
    cancelledJobs: cancelled.length,
    statusBreakdown,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    avgJobValue: parseFloat(avgJobValue.toFixed(2)),
    avgRating: avgRating,
    uniqueCustomers,
    totalHoursWorked: parseFloat((totalMinutes / 60).toFixed(1)),
    completionRate: jobs.length ? Math.round((completed.length / jobs.length) * 100) : 0,
    topServices,
    topEarningServices,
    monthlyEarnings
  };
}