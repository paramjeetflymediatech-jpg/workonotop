import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export async function POST(request) {
  try {
    // Verify token
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Please upload only image files' },
        { status: 400 }
      )
    }

    // Check file size (5MB limit for profile pictures)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 5MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/providers')
    await mkdir(uploadDir, { recursive: true })
    
    // Generate unique filename
    const timestamp = Date.now()
    const ext = path.extname(file.name)
    const filename = `provider-${decoded.id}-${timestamp}${ext}`
    const filepath = path.join(uploadDir, filename)
    
    // Save file
    await writeFile(filepath, buffer)
    
    // Return the public URL
    const imageUrl = `/uploads/providers/${filename}`
    
    // Update database with new avatar URL
    await query(
      'UPDATE service_providers SET avatar_url = ?, updated_at = NOW() WHERE id = ?',
      [imageUrl, decoded.id]
    )
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: 'Profile picture uploaded successfully'
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    )
  }
}