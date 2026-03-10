import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

async function patch() {
    const db = process.env.DB_NAME || 'workontap_db';
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: db,
        port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log('🚀 Patching mobile_auth_users table...\n');

    try {
        // 1. Modify push_token from VARCHAR(512) → TEXT
        console.log('📝 Modifying push_token to TEXT...');
        await conn.execute(`ALTER TABLE mobile_auth_users MODIFY COLUMN push_token TEXT DEFAULT NULL`);
        console.log('✅ push_token → TEXT');

        const newCols = [
            {
                name: 'device_platform',
                after: 'device_name',
                sql: `ALTER TABLE mobile_auth_users ADD COLUMN device_platform ENUM('ios','android','web') DEFAULT NULL AFTER device_name`
            },
            {
                name: 'os_version',
                after: 'device_platform',
                sql: `ALTER TABLE mobile_auth_users ADD COLUMN os_version VARCHAR(50) DEFAULT NULL AFTER device_platform`
            },
            {
                name: 'app_version',
                after: 'os_version',
                sql: `ALTER TABLE mobile_auth_users ADD COLUMN app_version VARCHAR(50) DEFAULT NULL AFTER os_version`
            },
            {
                name: 'logged_out_at',
                after: 'last_login',
                sql: `ALTER TABLE mobile_auth_users ADD COLUMN logged_out_at DATETIME DEFAULT NULL AFTER last_login`
            },
        ];

        for (const col of newCols) {
            const [rows] = await conn.execute(
                `SELECT COUNT(*) as c FROM information_schema.columns 
                 WHERE table_schema = ? AND table_name = 'mobile_auth_users' AND column_name = ?`,
                [db, col.name]
            );
            if (rows[0].c === 0) {
                await conn.execute(col.sql);
                console.log(`✅ Added: ${col.name} (after ${col.after})`);
            } else {
                console.log(`ℹ️  Already exists: ${col.name}`);
            }
        }

        // Final verification
        console.log('\n📋 Final table structure:');
        const [cols] = await conn.execute(`DESCRIBE mobile_auth_users`);
        cols.forEach(c => console.log(`   ${c.Field.padEnd(25)}: ${c.Type}`));
        console.log(`\n✅ Done! mobile_auth_users now has ${cols.length} columns.`);

    } catch (err) {
        console.error('❌ Patch failed:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

patch();
