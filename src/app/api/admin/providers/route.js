import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // CASE 1: Get single provider with reviews
    if (id) {
      // Get provider details
      const providers = await execute(
        `SELECT 
          id, name, email, phone, specialty, experience_years,
          rating, total_jobs, bio, avatar_url, location, city, status,
          total_reviews, avg_rating, created_at
        FROM service_providers 
        WHERE id = ?`,
        [id]
      )

      if (providers.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'Provider not found' 
        }, { status: 404 })
      }

      // Get provider's reviews
      const reviews = await execute(
        `SELECT 
          pr.*,
          u.first_name, u.last_name,
          b.service_name
        FROM provider_reviews pr
        LEFT JOIN users u ON pr.customer_id = u.id
        LEFT JOIN bookings b ON pr.booking_id = b.id
        WHERE pr.provider_id = ?
        ORDER BY pr.created_at DESC`,
        [id]
      )

      return NextResponse.json({
        success: true,
        data: {
          ...providers[0],
          reviews: reviews
        }
      })
    }

    // CASE 2: Get all providers with stats
    // Get all providers
    const providers = await execute(
      `SELECT 
        id, name, email, phone, specialty, experience_years,
        rating, total_jobs, city, status, total_reviews, avg_rating
      FROM service_providers 
      ORDER BY name ASC`
    )

    // Get stats
    const statsResult = await execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        AVG(avg_rating) as avg_rating_all,
        SUM(total_reviews) as total_reviews
      FROM service_providers`
    )

    const stats = statsResult[0] || {}

    return NextResponse.json({
      success: true,
      data: {
        providers: providers,
        stats: {
          total: stats.total || 0,
          active: stats.active || 0,
          avg_rating: Number(stats.avg_rating_all || 0).toFixed(1),
          total_reviews: stats.total_reviews || 0
        }
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch providers',
      error: error.message 
    }, { status: 500 })
  }
}