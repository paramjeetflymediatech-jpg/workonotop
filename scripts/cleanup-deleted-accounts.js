/**
 * Account Deletion Cleanup Script
 * 
 * This script processes accounts that have been in 'pending_deletion' status 
 * for more than 48 hours. It anonymizes Personally Identifiable Information (PII)
 * to comply with data protection laws while maintaining financial and booking 
 * records for audit purposes.
 * 
 * Usage: node scripts/cleanup-deleted-accounts.js
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root@123',
    database: process.env.DB_NAME || 'workontap_db',
    port: parseInt(process.env.DB_PORT || '3306')
};

async function cleanupAccounts() {
    let connection;
    console.log('\n--- 🧹 ACCOUNT DELETION CLEANUP STARTED ---');
    console.log(`Time: ${new Date().toISOString()}`);

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Base connection established.');

        // 1. Process CUSTOMERS (users table)
        console.log('\n🔍 Checking for customers pending deletion...');
        const [users] = await connection.execute(
            `SELECT id, email FROM users 
             WHERE status = 'pending_deletion' 
             AND deletion_requested_at <= DATE_SUB(NOW(), INTERVAL 48 HOUR)`
        );

        console.log(`   Found ${users.length} customer(s) to anonymize.`);

        for (const user of users) {
            console.log(`   Processing customer ID ${user.id} (${user.email})...`);
            
            // Anonymize user details
            const deletedEmail = `deleted_u_${user.id}_${Date.now()}@workontap.ca`;
            await connection.execute(
                `UPDATE users SET 
                    email = ?, 
                    first_name = 'Deleted', 
                    last_name = 'Account', 
                    phone = NULL, 
                    image_url = NULL,
                    status = 'deleted',
                    updated_at = NOW()
                 WHERE id = ?`,
                [deletedEmail, user.id]
            );

            // Mark deletion request as processed
            await connection.execute(
                "UPDATE deletion_requests SET status = 'processed', updated_at = NOW() WHERE email = ?",
                [user.email]
            );
            
            console.log(`   ✅ Customer ${user.id} anonymized.`);
        }

        // 2. Process PROVIDERS (service_providers table)
        console.log('\n🔍 Checking for providers pending deletion...');
        const [providers] = await connection.execute(
            `SELECT id, email FROM service_providers 
             WHERE status = 'pending_deletion' 
             AND deletion_requested_at <= DATE_SUB(NOW(), INTERVAL 48 HOUR)`
        );

        console.log(`   Found ${providers.length} provider(s) to anonymize.`);

        for (const provider of providers) {
            console.log(`   Processing provider ID ${provider.id} (${provider.email})...`);
            
            // Anonymize provider details
            const deletedEmail = `deleted_p_${provider.id}_${Date.now()}@workontap.ca`;
            await connection.execute(
                `UPDATE service_providers SET 
                    email = ?, 
                    name = 'Deleted Professional', 
                    phone = NULL, 
                    bio = NULL,
                    avatar_url = NULL,
                    status = 'deleted',
                    updated_at = NOW()
                 WHERE id = ?`,
                [deletedEmail, provider.id]
            );

            // Mark deletion request as processed
            await connection.execute(
                "UPDATE deletion_requests SET status = 'processed', updated_at = NOW() WHERE email = ?",
                [provider.email]
            );

            console.log(`   ✅ Provider ${provider.id} anonymized.`);
        }

        console.log('\n--- ✨ CLEANUP COMPLETED SUCCESSFULLY ---');

    } catch (error) {
        console.error('\n❌ CLEANUP FAILED:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔒 DB Connection closed.');
        }
    }
}

// Execute the cleanup
cleanupAccounts();
