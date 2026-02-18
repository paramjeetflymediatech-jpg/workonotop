import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'workontap_db',
        port: parseInt(process.env.DB_PORT || '3306')
    });

    try {
        console.log('🚀 Starting migration to add city and location to service_providers...');

        const dbName = process.env.DB_NAME || 'workontap_db';

        // Check for 'city' column
        const [cityRows] = await connection.execute(
            `SELECT count(*) as count 
             FROM information_schema.columns 
             WHERE table_schema = ? 
             AND table_name = 'service_providers' 
             AND column_name = 'city'`,
            [dbName]
        );

        if (cityRows[0].count === 0) {
            console.log('📝 Adding city column to service_providers table...');
            await connection.execute(
                `ALTER TABLE service_providers 
                 ADD COLUMN city VARCHAR(100) AFTER location`
            );
            console.log('✅ Column city added successfully');
        } else {
            console.log('ℹ️  Column city already exists');
        }

        // Check for 'location' column (in case it's also missing)
        const [locRows] = await connection.execute(
            `SELECT count(*) as count 
             FROM information_schema.columns 
             WHERE table_schema = ? 
             AND table_name = 'service_providers' 
             AND column_name = 'location'`,
            [dbName]
        );

        if (locRows[0].count === 0) {
            console.log('📝 Adding location column to service_providers table...');
            await connection.execute(
                `ALTER TABLE service_providers 
                 ADD COLUMN location VARCHAR(200) AFTER avatar_url`
            );
            console.log('✅ Column location added successfully');
        } else {
            console.log('ℹ️  Column location already exists');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
