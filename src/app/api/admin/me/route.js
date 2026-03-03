import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function GET(request) {
  try {
    const token = request.cookies.get('adminAuth')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // You can verify token here if you're using JWT
    // const decoded = verifyToken(token)
    
    return NextResponse.json({
      success: true,
      message: 'Authorized'
    })

  } catch (error) {
    console.error('Admin me error:', error)
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }
}