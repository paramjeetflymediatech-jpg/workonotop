import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let sql = `
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        specialty, 
        experience_years, 
        rating, 
        total_jobs,
        bio, 
        avatar_url, 
        location, 
        status, 
        created_at
      FROM service_providers
      WHERE 1=1
    `
    const params = []

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    sql += ' ORDER BY rating DESC, total_jobs DESC'

    const providers = await execute(sql, params)

    return NextResponse.json({ 
      success: true, 
      data: providers 
    })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}