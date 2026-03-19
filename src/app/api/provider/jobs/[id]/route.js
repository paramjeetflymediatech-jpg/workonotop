// app/api/provider/jobs/[id]/route.js - FIXED with cookie auth
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'  // Import from jwt utility

export async function GET(request, { params }) {
  try {
    // ✅ Cookie-based auth
    const token = request.cookies.get('provider_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    // Get job with photo status
    const jobs = await execute(
      `SELECT 
        b.*,
        s.name as service_full_name,
        s.duration_minutes,
        c.name as category_name,
        d.reason as dispute_reason,
        (SELECT COUNT(*) FROM job_photos WHERE booking_id = b.id AND photo_type = 'before') > 0 as has_before_photos,
        (SELECT COUNT(*) FROM job_photos WHERE booking_id = b.id AND photo_type = 'after') > 0 as has_after_photos
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN disputes d ON b.id = d.booking_id
      WHERE b.id = ? AND b.provider_id = ?`,
      [id, decoded.providerId]  // Note: using providerId
    )

    if (jobs.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Job not found' 
      }, { status: 404 })
    }

    const job = jobs[0]

    // Parse time slots
    if (job.job_time_slot) {
      job.job_time_slot = job.job_time_slot.split(',')
    }

    // Ensure numeric values
    job.service_price = parseFloat(job.service_price || 0)
    job.additional_price = parseFloat(job.additional_price || 0)
    job.provider_amount = parseFloat(job.provider_amount || 0)
    job.overtime_earnings = parseFloat(job.overtime_earnings || 0)
    job.final_provider_amount = job.final_provider_amount ? parseFloat(job.final_provider_amount) : null
    job.commission_percent = job.commission_percent ? parseFloat(job.commission_percent) : null
    job.duration_minutes = job.duration_minutes || 60

    return NextResponse.json({
      success: true,
      data: job
    })

  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch job' 
    }, { status: 500 })
  }
}