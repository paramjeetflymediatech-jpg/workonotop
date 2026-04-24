
import dotenv from 'dotenv';
dotenv.config();
import { execute } from '../src/lib/db.js';

async function test() {
    try {
        console.log('Checking bookings status...');
        const results = await execute(`
            SELECT id, booking_number, status, provider_id, commission_percent, city 
            FROM bookings 
            WHERE status IN ('pending', 'matching')
        `);
        console.log('Open Bookings:', JSON.stringify(results, null, 2));
        
        const providers = await execute('SELECT id, city FROM service_providers WHERE id = 3');
        console.log('Provider 3 Info:', providers);

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        process.exit(0);
    }
}

test();
