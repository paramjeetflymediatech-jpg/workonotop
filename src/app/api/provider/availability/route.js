import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

// GET — return is_available status
export async function GET(request) {
    try {
        let token = request.cookies.get('provider_token')?.value;
        if (!token) {
            const auth = request.headers.get('Authorization');
            if (auth?.startsWith('Bearer ')) token = auth.split(' ')[1];
        }
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        const userType = decoded?.type || decoded?.role;
        if (!decoded || userType !== 'provider') {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const providerId = decoded.providerId || decoded.id;
        const rows = await execute(
            'SELECT is_available FROM service_providers WHERE id = ?',
            [providerId]
        );

        return NextResponse.json({
            success: true,
            is_available: rows[0]?.is_available === 1 || rows[0]?.is_available === true,
        });
    } catch (error) {
        console.error('Availability GET error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// POST/PUT — toggle is_available
export async function POST(request) {
    return await handleToggle(request);
}

export async function PUT(request) {
    return await handleToggle(request);
}

async function handleToggle(request) {
    try {
        let token = request.cookies.get('provider_token')?.value;
        if (!token) {
            const auth = request.headers.get('Authorization');
            if (auth?.startsWith('Bearer ')) token = auth.split(' ')[1];
        }
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        const userType = decoded?.type || decoded?.role;
        if (!decoded || userType !== 'provider') {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const providerId = decoded.providerId || decoded.id;
        const { is_available } = await request.json();

        // Try to update; if column doesn't exist, add it first
        try {
            await execute(
                'UPDATE service_providers SET is_available = ?, updated_at = NOW() WHERE id = ?',
                [is_available ? 1 : 0, providerId]
            );
        } catch (colErr) {
            console.log('Column is_available might be missing, attempting to add...');
            try {
                // MySQL 8.0.19+ supports IF NOT EXISTS, but for older versions we just try and ignore error if it exists
                await execute(
                    'ALTER TABLE service_providers ADD COLUMN is_available TINYINT(1) DEFAULT 1 AFTER status'
                );
            } catch (alterError) {
                // If it already exists, this might error, which is fine
                console.log('ALTER TABLE note:', alterError.message);
            }
            
            await execute(
                'UPDATE service_providers SET is_available = ?, updated_at = NOW() WHERE id = ?',
                [is_available ? 1 : 0, providerId]
            );
        }

        return NextResponse.json({ 
            success: true, 
            is_available: !!is_available,
            message: `You are now ${is_available ? 'Online' : 'Offline'}`
        });
    } catch (error) {
        console.error('Availability update error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
