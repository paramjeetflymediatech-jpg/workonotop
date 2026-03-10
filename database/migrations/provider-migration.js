import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });
const DB_NAME = process.env.DB_NAME || 'workontap_db';

async function runProviderMigration() {
  let conn = null;
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Contractor/Provider Migration');
  console.log('='.repeat(60) + '\n');

  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: DB_NAME
    });

    console.log('📁 Connected to database\n');

    // 1. ALTER service_providers table - Add new columns
    console.log('📝 Updating service_providers table...');
    
    const alterQueries = [
      `ALTER TABLE service_providers 
       ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
       ADD COLUMN IF NOT EXISTS email_verification_expires DATETIME,
       ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 1,
       ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS documents_uploaded BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255),
       ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS approved_by INT,
       ADD COLUMN IF NOT EXISTS approved_at DATETIME,
       ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
       ADD COLUMN IF NOT EXISTS service_areas JSON,
       ADD COLUMN IF NOT EXISTS skills JSON,
       ADD COLUMN IF NOT EXISTS device_token VARCHAR(255),
       ADD COLUMN IF NOT EXISTS last_active DATETIME,
       ADD COLUMN IF NOT EXISTS auth_provider ENUM('email', 'google', 'apple') DEFAULT 'email',
       ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
       ADD COLUMN IF NOT EXISTS reset_password_expires DATETIME,
       ADD INDEX IF NOT EXISTS idx_providers_email_verified (email_verified),
       ADD INDEX IF NOT EXISTS idx_providers_approval (status, onboarding_completed)`,
      
      `ALTER TABLE service_providers 
       MODIFY COLUMN email VARCHAR(255) NOT NULL,
       MODIFY COLUMN phone VARCHAR(20) NOT NULL,
       MODIFY COLUMN name VARCHAR(200) NOT NULL`,
    ];

    for (const query of alterQueries) {
      try {
        await conn.execute(query);
        console.log(`   ✓ Executed alter table`);
      } catch (err) {
        if (!err.message.includes('Duplicate column')) {
          console.log(`   ⚠ Warning: ${err.message}`);
        }
      }
    }

    // 2. Create provider_documents table
    console.log('\n📁 Creating provider_documents table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS provider_documents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        provider_id INT NOT NULL,
        document_type ENUM('id_proof', 'trade_license', 'insurance', 'certification', 'profile_photo', 'other') NOT NULL,
        document_url VARCHAR(500) NOT NULL,
        document_number VARCHAR(100),
        issue_date DATE,
        expiry_date DATE,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by INT,
        verified_at DATETIME,
        rejection_reason TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
        INDEX idx_provider_docs (provider_id),
        INDEX idx_doc_verification (is_verified)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✓ Created provider_documents table');

    // 3. Create provider_bank_accounts table
    console.log('\n📁 Creating provider_bank_accounts table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS provider_bank_accounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        provider_id INT NOT NULL,
        stripe_account_id VARCHAR(255) NOT NULL,
        stripe_onboarding_url VARCHAR(500),
        onboarding_completed BOOLEAN DEFAULT FALSE,
        account_status ENUM('pending', 'verified', 'rejected', 'incomplete') DEFAULT 'pending',
        bank_name VARCHAR(255),
        last4 VARCHAR(4),
        payout_method ENUM('stripe', 'bank_transfer') DEFAULT 'stripe',
        payout_schedule ENUM('instant', 'daily', 'weekly', 'monthly') DEFAULT 'weekly',
        default_payout BOOLEAN DEFAULT TRUE,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_provider_stripe (provider_id, stripe_account_id),
        INDEX idx_stripe_account (stripe_account_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✓ Created provider_bank_accounts table');

    // 4. Create provider_availability table
    console.log('\n📁 Creating provider_availability table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS provider_availability (
        id INT PRIMARY KEY AUTO_INCREMENT,
        provider_id INT NOT NULL,
        day_of_week TINYINT NOT NULL COMMENT '0=Monday, 6=Sunday',
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        timezone VARCHAR(50) DEFAULT 'America/Edmonton',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_provider_day (provider_id, day_of_week)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✓ Created provider_availability table');

    // 5. Create provider_notifications table
    console.log('\n📁 Creating provider_notifications table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS provider_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        provider_id INT NOT NULL,
        type ENUM('booking_request', 'booking_confirmed', 'payment_received', 'review_received', 'document_verified', 'account_approved', 'system') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSON,
        is_read BOOLEAN DEFAULT FALSE,
        read_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
        INDEX idx_provider_notifications (provider_id, is_read, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✓ Created provider_notifications table');

    // 6. Create admin_activity_log table
    console.log('\n📁 Creating admin_activity_log table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type ENUM('provider', 'user', 'booking', 'document') NOT NULL,
        target_id INT NOT NULL,
        old_value JSON,
        new_value JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_admin_activity (admin_id, created_at),
        INDEX idx_target (target_type, target_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✓ Created admin_activity_log table');

    // 7. Create indexes for performance
    console.log('\n📊 Creating indexes...');
    const newIndexes = [
      `CREATE INDEX IF NOT EXISTS idx_providers_onboarding ON service_providers(onboarding_step, onboarding_completed)`,
      `CREATE INDEX IF NOT EXISTS idx_providers_stripe ON service_providers(stripe_account_id)`,
      `CREATE INDEX IF NOT EXISTS idx_providers_approval_status ON service_providers(status, onboarding_completed, documents_verified)`,
    ];

    for (const sql of newIndexes) {
      try {
        await conn.execute(sql);
        console.log(`   ✓ Index created`);
      } catch (err) {
        console.log(`   ⚠ ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Provider migration completed successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

runProviderMigration();