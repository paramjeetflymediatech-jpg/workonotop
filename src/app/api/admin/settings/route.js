import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

async function getAdmin(request) {
    const token = request.cookies.get('adminAuth')?.value
    if (!token) {
        console.log('Admin Auth: No token found')
        return null
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if (!decoded) {
            console.log('Admin Auth: Token verification failed')
            return null
        }
        
        console.log('Admin Auth: Decoded token:', decoded)
        
        // Database se verify karo (like admin/me does)
        const users = await execute(
            "SELECT id FROM users WHERE id = ? AND role = 'admin'",
            [decoded.id]
        )
        
        if (!users || users.length === 0) {
            console.log('Admin Auth: User not found or not admin. ID:', decoded.id)
            return null
        }
        
        return decoded
    } catch (err) {
        console.error('Admin Auth: Error during verification:', err.message)
        return null
    }
}

export async function GET(request) {
    const admin = await getAdmin(request)
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    try {
        const results = await execute('SELECT `key`, `value` FROM system_settings')
        const settings = {}
        results.forEach(r => {
            settings[r.key] = r.value
        })
        return NextResponse.json({ success: true, settings })
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(request) {
    const admin = await getAdmin(request)
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        const { key, value } = body
        console.log('Admin Settings POST:', { key, value })
        
        if (!key) return NextResponse.json({ success: false, message: 'Key is required' }, { status: 400 })

        await execute(
            'INSERT INTO system_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
            [key, value, value]
        )

        return NextResponse.json({ success: true, message: 'Setting updated' })
    } catch (error) {
        console.error('Error updating setting:', error)
        return NextResponse.json({ success: false, message: 'Failed to update setting' }, { status: 500 })
    }
}
