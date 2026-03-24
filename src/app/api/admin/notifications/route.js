import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            // Check for cookie as well (for web compatibility)
            const cookieToken = request.cookies.get('adminAuth')?.value;
            if (!cookieToken) {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
            }
            // If cookie exists, we could verify it, but mobile usually uses Bearer
            // For now, let's stick to standard mobile auth
        }

        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : request.cookies.get('adminAuth')?.value;
        const decoded = verifyToken(token);

        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await execute(
            `SELECT * FROM notifications 
             WHERE user_id = ? AND user_type = 'admin'
             ORDER BY created_at DESC 
             LIMIT 50`,
            [decoded.id]
        );

        return NextResponse.json({ success: true, data: notifications });

    } catch (error) {
        console.error('Admin notifications error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : request.cookies.get('adminAuth')?.value;
        const decoded = verifyToken(token);

        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id, all } = await request.json();

        if (all) {
            await execute(
                `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_type = 'admin'`,
                [decoded.id]
            );
        } else if (id) {
            await execute(
                `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND user_type = 'admin'`,
                [id, decoded.id]
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Admin notifications update error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
