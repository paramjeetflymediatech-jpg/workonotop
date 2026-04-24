import 'dotenv/config';
import { execute } from './src/lib/db.js';

async function checkPhotos(bookingId) {
    try {
        const results = await execute('SELECT * FROM booking_photos WHERE booking_id = ?', [bookingId]);
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

const bookingId = process.argv[2] || 11;
checkPhotos(bookingId);
process.exit(0);
