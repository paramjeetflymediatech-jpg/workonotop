import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        console.log('🚀 Starting migration: mobile_auth_users...');

        // Check if table already exists
        const [tables] = await connection.execute(
            `SELECT COUNT(*) as count 
             FROM information_schema.tables 
             WHERE table_schema = ? 
             AND table_name = 'mobile_auth_users'`,
            [process.env.DB_NAME || 'workontap_db']
        );

        if (tables[0].count === 0) {
            console.log('📝 Creating mobile_auth_users table...');
            await connection.execute(`
                CREATE TABLE mobile_auth_users (
                    id INT PRIMARY KEY AUTO_INCREMENT,

                    -- Who this belongs to (one of the two will be set)
                    user_id INT DEFAULT NULL,
                    provider_id INT DEFAULT NULL,

                    -- User type to distinguish customers vs providers
                    user_type ENUM('customer', 'provider') NOT NULL,

                    -- Auth tokens
                    refresh_token VARCHAR(512) DEFAULT NULL,
                    refresh_token_expires DATETIME DEFAULT NULL,

                    -- Push notification token (Expo push token)
                    push_token VARCHAR(512) DEFAULT NULL,
                    push_token_platform ENUM('ios', 'android', 'web') DEFAULT NULL,
                    push_token_updated_at DATETIME DEFAULT NULL,

                    -- Device info
                    device_id VARCHAR(255) DEFAULT NULL,
                    device_name VARCHAR(255) DEFAULT NULL,

                    -- Status
                    is_active TINYINT(1) DEFAULT 1,
                    last_login DATETIME DEFAULT NULL,

                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                    -- Foreign keys
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,

                    -- Indexes
                    INDEX idx_user_id (user_id),
                    INDEX idx_provider_id (provider_id),
                    INDEX idx_user_type (user_type),
                    INDEX idx_push_token (push_token(255)),
                    INDEX idx_device_id (device_id),
                    INDEX idx_is_active (is_active),

                    -- Ensure a user/provider has only one record per device
                    UNIQUE KEY uq_user_device (user_id, device_id),
                    UNIQUE KEY uq_provider_device (provider_id, device_id)
                )
            `);
            console.log('✅ mobile_auth_users table created successfully!');
        } else {
            console.log('ℹ️  mobile_auth_users table already exists. Checking for missing columns...');

            // Add push_token_platform if missing
            const [cols] = await connection.execute(
                `SELECT column_name FROM information_schema.columns
                 WHERE table_schema = ? AND table_name = 'mobile_auth_users'`,
                [process.env.DB_NAME || 'workontap_db']
            );
            const existing = cols.map(c => c.column_name);

            const toAdd = [
                { name: 'push_token', sql: `ADD COLUMN push_token VARCHAR(512) DEFAULT NULL AFTER refresh_token_expires` },
                { name: 'push_token_platform', sql: `ADD COLUMN push_token_platform ENUM('ios','android','web') DEFAULT NULL AFTER push_token` },
                { name: 'push_token_updated_at', sql: `ADD COLUMN push_token_updated_at DATETIME DEFAULT NULL AFTER push_token_platform` },
                { name: 'device_id', sql: `ADD COLUMN device_id VARCHAR(255) DEFAULT NULL AFTER push_token_updated_at` },
                { name: 'device_name', sql: `ADD COLUMN device_name VARCHAR(255) DEFAULT NULL AFTER device_id` },
            ];

            for (const col of toAdd) {
                if (!existing.includes(col.name)) {
                    await connection.execute(`ALTER TABLE mobile_auth_users ${col.sql}`);
                    console.log(`✅ Added column: ${col.name}`);
                } else {
                    console.log(`ℹ️  Column already exists: ${col.name}`);
                }
            }
        }

        console.log('\n✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

migrate();
