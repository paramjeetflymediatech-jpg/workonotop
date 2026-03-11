// import { NextResponse } from 'next/server'
// import { verifyToken } from '@/lib/jwt'

// export async function GET(request) {
//   try {
//     const token = request.cookies.get('adminAuth')?.value
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // You can verify token here if you're using JWT
//     // const decoded = verifyToken(token)
    
//     return NextResponse.json({
//       success: true,
//       message: 'Authorized'
//     })

//   } catch (error) {
//     console.error('Admin me error:', error)
//     return NextResponse.json(
//       { success: false, message: 'Unauthorized' },
//       { status: 401 }
//     )
//   }
// }












// app/api/admin/me/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { execute } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET

export async function GET(request) {
  try {
    const token = request.cookies.get('adminAuth')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ✅ Step 1: JWT verify karo
    let payload
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // ✅ Step 2: Database se user check karo
    const users = await execute(
      "SELECT id, email, role FROM users WHERE id = ? AND role = 'admin'",
      [payload.id]
    )

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: users[0]
    })

  } catch (error) {
    console.error('Admin me error:', error)
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }
}