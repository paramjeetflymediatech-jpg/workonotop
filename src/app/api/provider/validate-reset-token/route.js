// app/api/provider/validate-reset-token/route.js
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 400 })
    }

    // Check if token exists and is not expired
    const providers = await execute(
      `SELECT id FROM service_providers 
       WHERE reset_token = ? 
       AND reset_token_expiry > NOW() 
       AND status = 'active'`,
      [token]
    )

    return NextResponse.json({ 
      success: providers.length > 0
    })

  } catch (error) {
    console.error('Validate token error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}