// app/api/provider/jobs/[id]/route.js - OPTIONAL IMPROVEMENT
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'  // ✅ CHANGE: query → execute
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

function verifyToken(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) return null
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

export async function GET(request, { params }) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // ✅ Using execute() instead of query()
    const jobs = await execute(
      `SELECT 
        b.*,
        s.name as service_full_name,
        s.duration_minutes,
        c.name as category_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE b.id = ? AND b.provider_id = ?`,
      [id, decoded.id]
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
  // ✅ Connection auto-released by execute()
}