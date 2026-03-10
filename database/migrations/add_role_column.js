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
        console.log('🚀 Starting migration...');

        // Check if column exists
        const [rows] = await connection.execute(
            `SELECT count(*) as count 
       FROM information_schema.columns 
       WHERE table_schema = ? 
       AND table_name = 'users' 
       AND column_name = 'role'`,
            [process.env.DB_NAME || 'workontap_db']
        );

        if (rows[0].count === 0) {
            console.log('📝 Adding role column to users table...');
            await connection.execute(
                `ALTER TABLE users 
         ADD COLUMN role ENUM('user','admin') DEFAULT 'user' 
         AFTER receive_offers`
            );
            console.log('✅ Column added successfully');
        } else {
            console.log('ℹ️  Column role already exists');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
