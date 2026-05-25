import 'dotenv/config';
import db from './src/lib/db.js';

async function alterTable() {
    try {
        console.log('Connecting to db...');
        await db.query('ALTER TABLE bookings MODIFY job_time_slot TEXT');
        console.log('Successfully altered job_time_slot to TEXT');
        
        process.exit(0);
    } catch (e) {
        console.error('Error altering table:', e);
        process.exit(1);
    }
}

alterTable();
