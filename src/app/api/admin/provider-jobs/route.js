import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';  // ← Bas yahi chahiye

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json({ success: false, message: 'Provider ID is required' }, { status: 400 });
    }

    const providerCheck = await execute('SELECT * FROM service_providers WHERE id = ?', [providerId]);

    if (providerCheck.length === 0) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    const jobs = await execute(`
      SELECT b.*, s.name as service_name, ...
      FROM bookings b
      WHERE b.provider_id = ?
      ORDER BY b.created_at DESC
    `, [providerId]);

    // Photos - single query
    let jobsWithPhotos = jobs.map(job => ({ ...job, photos: [] }));

    if (jobs.length > 0) {
      const jobIds = jobs.map(j => j.id);
      const placeholders = jobIds.map(() => '?').join(',');
      const allPhotos = await execute(
        `SELECT photo_url, photo_type, booking_id FROM job_photos WHERE booking_id IN (${placeholders})`,
        jobIds
      );

      const photosByJob = {};
      allPhotos.forEach(p => {
        if (!photosByJob[p.booking_id]) photosByJob[p.booking_id] = [];
        photosByJob[p.booking_id].push(p);
      });

      jobsWithPhotos = jobs.map(job => ({ ...job, photos: photosByJob[job.id] || [] }));
    }

    const stats = calculateProviderStats(jobsWithPhotos, providerCheck[0]);

    return NextResponse.json({
      success: true,
      data: jobsWithPhotos,
      recentJobs: jobsWithPhotos.slice(0, 5),
      provider: providerCheck[0],
      stats,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 });
  }
  // ← finally/release ki zarurat nahi! execute() pool automatically handle karta hai
}