// app/api/provider/profile/route.js
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'  // ✅ same as your /api/provider/me

// GET - Fetch full profile
export async function GET(request) {
  try {
    const token = request.cookies.get('provider_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const providers = await execute(
      `SELECT 
        id, name, email, phone,
        specialty, experience_years,
        rating, avg_rating, total_jobs, total_reviews,
        bio, avatar_url, location, city,
        status, service_areas, skills,
        stripe_onboarding_complete,
        onboarding_completed, onboarding_step,
        DATE_FORMAT(created_at, '%Y-%m-%d') as join_date
       FROM service_providers WHERE id = ?`,
      [decoded.providerId]
    )

    if (!providers || providers.length === 0) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 })
    }

    const provider = { ...providers[0] }

    // Safely parse JSON fields
    provider.service_areas = (() => {
      if (!provider.service_areas) return []
      try { return typeof provider.service_areas === 'string' ? JSON.parse(provider.service_areas) : provider.service_areas }
      catch { return [] }
    })()

    provider.skills = (() => {
      if (!provider.skills) return []
      try { return typeof provider.skills === 'string' ? JSON.parse(provider.skills) : provider.skills }
      catch { return [] }
    })()

    return NextResponse.json({ success: true, data: provider })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT - Update profile
export async function PUT(request) {
  try {
    const token = request.cookies.get('provider_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const providerId = decoded.providerId

    const body = await request.json()
    const { name, email, phone, specialty, experience_years, bio, location, city, service_areas, skills } = body

    if (!name?.trim()) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 })
    if (!email?.trim()) return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    if (!phone?.trim()) return NextResponse.json({ success: false, message: 'Phone is required' }, { status: 400 })

    // Uniqueness checks
    const existing = await execute('SELECT id FROM service_providers WHERE email = ? AND id != ?', [email.trim(), providerId])
    if (existing.length > 0) return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 })

    const existingPhone = await execute('SELECT id FROM service_providers WHERE phone = ? AND id != ?', [phone.trim(), providerId])
    if (existingPhone.length > 0) return NextResponse.json({ success: false, message: 'Phone already in use' }, { status: 400 })

    // All params explicitly null-safe — never undefined
    await execute(
      `UPDATE service_providers SET
        name=?, email=?, phone=?, specialty=?, experience_years=?,
        bio=?, location=?, city=?, service_areas=?, skills=?, updated_at=NOW()
       WHERE id=?`,
      [
        name.trim(),
        email.trim(),
        phone.trim(),
        specialty?.trim() || null,
        (experience_years !== undefined && experience_years !== '' && experience_years !== null) ? parseInt(experience_years) : null,
        bio?.trim() || null,
        location?.trim() || null,
        city?.trim() || null,
        Array.isArray(service_areas) ? JSON.stringify(service_areas) : null,
        Array.isArray(skills) ? JSON.stringify(skills) : null,
        providerId
      ]
    )

    // Return updated data
    const updated = await execute(
      `SELECT id, name, email, phone, specialty, experience_years,
              rating, avg_rating, total_jobs, total_reviews,
              bio, avatar_url, location, city, status, service_areas, skills,
              DATE_FORMAT(created_at, '%Y-%m-%d') as join_date
       FROM service_providers WHERE id = ?`,
      [providerId]
    )

    const provider = { ...updated[0] }
    provider.service_areas = (() => { try { return typeof provider.service_areas === 'string' ? JSON.parse(provider.service_areas) : (provider.service_areas || []) } catch { return [] } })()
    provider.skills = (() => { try { return typeof provider.skills === 'string' ? JSON.parse(provider.skills) : (provider.skills || []) } catch { return [] } })()

    return NextResponse.json({ success: true, message: 'Profile updated successfully', data: provider })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 })
  }
}