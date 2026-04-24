
import dotenv from 'dotenv';
dotenv.config();
import { execute } from '../src/lib/db.js';

async function check() {
    try {
        const results = await execute('SELECT id, name, city FROM service_providers');
        console.log(results);
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
check();
