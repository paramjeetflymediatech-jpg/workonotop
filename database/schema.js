// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Load environment variables
// dotenv.config({ path: resolve(__dirname, "../.env") });
// const DB_NAME = process.env.DB_NAME || 'workontap_db';

// // Create database connection
// const connect = async (withDb = false) => {
//   return await mysql.createConnection({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || 'root123',
//     port: parseInt(process.env.DB_PORT || '3306'),
//     ...(withDb && { database: DB_NAME })
//   });
// };

// console.log("DB USER:", process.env.DB_USER);
// console.log("DB HOST:", process.env.DB_HOST);

// // =====================================================
// // Table creation SQL - All 13 tables (NO SAMPLE DATA)
// // =====================================================
// const tables = [
//   // Table 1: users
//   `CREATE TABLE IF NOT EXISTS users (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password_hash VARCHAR(255) NOT NULL,
//     first_name VARCHAR(100) NOT NULL,
//     last_name VARCHAR(100) NOT NULL,
//     phone VARCHAR(50),
//     hear_about VARCHAR(255),
//     receive_offers TINYINT(1) DEFAULT 0,
//     role ENUM('user', 'admin') DEFAULT 'user',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     INDEX idx_role (role)
//   )`,

//   // Table 2: service_categories
//   `CREATE TABLE IF NOT EXISTS service_categories (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     name VARCHAR(100) NOT NULL,
//     slug VARCHAR(100) UNIQUE NOT NULL,
//     icon VARCHAR(255),
//     description TEXT,
//     is_active TINYINT(1) DEFAULT 1,
//     display_order INT DEFAULT 0,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//   )`,

//   // Table 3: service_providers (UPDATED with all fields)
//   `CREATE TABLE IF NOT EXISTS service_providers (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     name VARCHAR(200) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     phone VARCHAR(20) UNIQUE NOT NULL,
//     specialty VARCHAR(200),
//     experience_years INT,
//     rating DECIMAL(3, 2) DEFAULT 0.00,
//     total_jobs INT DEFAULT 0,
//     total_reviews INT DEFAULT 0,
//     avg_rating DECIMAL(3, 2) DEFAULT 0.00,
//     bio TEXT,
//     avatar_url VARCHAR(255),
//     location VARCHAR(200),
//     city VARCHAR(100),
//     status ENUM('active', 'inactive', 'pending', 'rejected') DEFAULT 'pending',
//     remember_token VARCHAR(100),
//     last_login DATETIME,
//     email_verified TINYINT(1) DEFAULT 0,
//     email_verification_token VARCHAR(255),
//     email_verification_expires DATETIME,
//     onboarding_step INT DEFAULT 1,
//     onboarding_completed TINYINT(1) DEFAULT 0,
//     documents_uploaded TINYINT(1) DEFAULT 0,
//     documents_verified TINYINT(1) DEFAULT 0,
//     stripe_account_id VARCHAR(255),
//     stripe_onboarding_complete TINYINT(1) DEFAULT 0,
//     approved_by INT,
//     approved_at DATETIME,
//     rejection_reason TEXT,
//     service_areas JSON,
//     skills JSON,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     INDEX idx_city (city),
//     INDEX idx_status (status),
//     INDEX idx_onboarding_step (onboarding_step),
//     INDEX idx_stripe_account (stripe_account_id),
//     INDEX idx_email_verified (email_verified)
//   )`,

//   // Table 4: services
//   `CREATE TABLE IF NOT EXISTS services (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     category_id INT NOT NULL,
//     name VARCHAR(200) NOT NULL,
//     slug VARCHAR(200) UNIQUE NOT NULL,
//     description TEXT,
//     short_description VARCHAR(500),
//     base_price DECIMAL(10, 2) NOT NULL,
//     additional_price DECIMAL(10, 2),
//     duration_minutes INT,
//     image_url VARCHAR(255),
//     use_cases TEXT,
//     is_homepage TINYINT(1) DEFAULT 0,
//     is_trending TINYINT(1) DEFAULT 0,
//     is_popular TINYINT(1) DEFAULT 0,
//     is_active TINYINT(1) DEFAULT 1,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
//     INDEX idx_is_active (is_active)
//   )`,

//   // Table 5: provider_documents
//   `CREATE TABLE IF NOT EXISTS provider_documents (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     provider_id INT NOT NULL,
//     document_type ENUM('id_proof', 'trade_license', 'insurance', 'certification', 'profile_photo', 'other') NOT NULL,
//     document_url VARCHAR(500) NOT NULL,
//     document_number VARCHAR(100),
//     issue_date DATE,
//     expiry_date DATE,
//     is_verified TINYINT(1) DEFAULT 0,
//     status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
//     verified_by INT,
//     reviewed_by INT,
//     verified_at DATETIME,
//     reviewed_at DATETIME,
//     rejection_reason TEXT,
//     admin_notes TEXT,
//     metadata JSON,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
//     INDEX idx_provider (provider_id),
//     INDEX idx_status (status),
//     INDEX idx_is_verified (is_verified)
//   )`,

//   // Table 6: provider_bank_accounts
//   `CREATE TABLE IF NOT EXISTS provider_bank_accounts (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     provider_id INT NOT NULL,
//     stripe_account_id VARCHAR(255) NOT NULL,
//     stripe_onboarding_url VARCHAR(500),
//     onboarding_completed TINYINT(1) DEFAULT 0,
//     account_status ENUM('pending', 'verified', 'rejected', 'incomplete') DEFAULT 'pending',
//     bank_name VARCHAR(255),
//     last4 VARCHAR(4),
//     payout_method ENUM('stripe', 'bank_transfer') DEFAULT 'stripe',
//     payout_schedule ENUM('instant', 'daily', 'weekly', 'monthly') DEFAULT 'weekly',
//     default_payout TINYINT(1) DEFAULT 1,
//     metadata JSON,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
//     INDEX idx_provider (provider_id),
//     INDEX idx_stripe_account (stripe_account_id),
//     INDEX idx_account_status (account_status)
//   )`,

//   // Table 7: bookings
//   `CREATE TABLE IF NOT EXISTS bookings (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     user_id INT,
//     booking_number VARCHAR(50) UNIQUE NOT NULL,
//     service_id INT NOT NULL,
//     provider_id INT,
//     service_name VARCHAR(200),
//     service_price DECIMAL(10, 2) NOT NULL,
//     additional_price DECIMAL(10, 2) DEFAULT 0.00,
//     customer_first_name VARCHAR(100) NOT NULL,
//     customer_last_name VARCHAR(100) NOT NULL,
//     customer_email VARCHAR(255) NOT NULL,
//     customer_phone VARCHAR(50) NOT NULL,
//     job_date DATE NOT NULL,
//     job_time_slot SET('morning', 'afternoon', 'evening') NOT NULL,
//     timing_constraints TEXT,
//     job_description TEXT NOT NULL,
//     instructions TEXT,
//     parking_access TINYINT(1) DEFAULT 0,
//     elevator_access TINYINT(1) DEFAULT 0,
//     has_pets TINYINT(1) DEFAULT 0,
//     address_line1 VARCHAR(255) NOT NULL,
//     address_line2 VARCHAR(255),
//     city VARCHAR(100) DEFAULT 'Calgary',
//     postal_code VARCHAR(20),
//     status ENUM('pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
//     commission_percent DECIMAL(5, 2),
//     provider_amount DECIMAL(10, 2),
//     accepted_at DATETIME,
//     start_time DATETIME,
//     end_time DATETIME,
//     actual_duration_minutes INT,
//     overtime_minutes INT DEFAULT 0,
//     overtime_earnings DECIMAL(10, 2) DEFAULT 0.00,
//     final_provider_amount DECIMAL(10, 2),
//     job_timer_status ENUM('not_started', 'running', 'paused', 'completed') DEFAULT 'not_started',
//     before_photos_uploaded TINYINT(1) DEFAULT 0,
//     after_photos_uploaded TINYINT(1) DEFAULT 0,
//     photo_upload_deadline TIMESTAMP NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
//     FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL,
//     INDEX idx_user (user_id),
//     INDEX idx_provider (provider_id),
//     INDEX idx_status (status),
//     INDEX idx_job_date (job_date),
//     INDEX idx_job_timer_status (job_timer_status),
//     INDEX idx_customer_email (customer_email)
//   )`,

//   // Table 8: booking_photos
//   `CREATE TABLE IF NOT EXISTS booking_photos (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     booking_id INT NOT NULL,
//     photo_url VARCHAR(500) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
//     INDEX idx_booking (booking_id)
//   )`,

//   // Table 9: booking_status_history
//   `CREATE TABLE IF NOT EXISTS booking_status_history (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     booking_id INT NOT NULL,
//     status VARCHAR(50) NOT NULL,
//     notes TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
//     INDEX idx_booking (booking_id),
//     INDEX idx_created_at (created_at)
//   )`,

//   // Table 10: booking_time_logs
//   `CREATE TABLE IF NOT EXISTS booking_time_logs (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     booking_id INT NOT NULL,
//     action ENUM('start', 'pause', 'resume', 'stop', 'auto_pause') NOT NULL,
//     timestamp DATETIME NOT NULL,
//     notes TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
//     INDEX idx_booking (booking_id),
//     INDEX idx_timestamp (timestamp)
//   )`,

//   // Table 11: job_photos
//   `CREATE TABLE IF NOT EXISTS job_photos (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     booking_id INT NOT NULL,
//     photo_url VARCHAR(500) NOT NULL,
//     photo_type ENUM('before', 'after') NOT NULL,
//     uploaded_by INT NOT NULL,
//     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
//     FOREIGN KEY (uploaded_by) REFERENCES service_providers(id) ON DELETE CASCADE,
//     INDEX idx_booking (booking_id),
//     INDEX idx_photo_type (photo_type),
//     INDEX idx_uploaded_by (uploaded_by)
//   )`,

//   // Table 12: provider_reviews
//   `CREATE TABLE IF NOT EXISTS provider_reviews (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     booking_id INT NOT NULL UNIQUE,
//     provider_id INT NOT NULL,
//     customer_id INT NOT NULL,
//     rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
//     review TEXT,
//     is_anonymous TINYINT(1) DEFAULT 0,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
//     FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
//     FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
//     INDEX idx_provider (provider_id),
//     INDEX idx_customer (customer_id)
//   )`,

//   // Table 13: invoices
//   `CREATE TABLE IF NOT EXISTS invoices (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     invoice_number VARCHAR(50) UNIQUE NOT NULL,
//     booking_id INT NOT NULL,
//     user_id INT NOT NULL,
//     provider_id INT NOT NULL,
//     invoice_type ENUM('customer', 'provider') NOT NULL,
//     base_amount DECIMAL(10,2) NOT NULL,
//     commission_percent DECIMAL(5,2),
//     commission_amount DECIMAL(10,2),
//     overtime_minutes INT DEFAULT 0,
//     overtime_rate DECIMAL(10,2),
//     overtime_amount DECIMAL(10,2),
//     total_amount DECIMAL(10,2) NOT NULL,
//     provider_earnings DECIMAL(10,2),
//     service_name VARCHAR(255) NOT NULL,
//     service_duration INT,
//     actual_duration INT,
//     job_date DATE NOT NULL,
//     completion_date DATETIME NOT NULL,
//     status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
//     payment_method VARCHAR(50),
//     payment_date DATETIME,
//     pdf_path VARCHAR(500),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//     FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
//     INDEX idx_booking (booking_id),
//     INDEX idx_user (user_id),
//     INDEX idx_provider (provider_id),
//     INDEX idx_status (status)
//   )`
// ];

// // =====================================================
// // Indexes for performance
// // =====================================================
// const indexes = [
//   // Users table indexes
//   `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
//   `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,

//   // Service providers table indexes
//   `CREATE INDEX IF NOT EXISTS idx_providers_email ON service_providers(email)`,
//   `CREATE INDEX IF NOT EXISTS idx_providers_status ON service_providers(status)`,
//   `CREATE INDEX IF NOT EXISTS idx_providers_city ON service_providers(city)`,
//   `CREATE INDEX IF NOT EXISTS idx_providers_onboarding ON service_providers(onboarding_step)`,
//   `CREATE INDEX IF NOT EXISTS idx_providers_stripe ON service_providers(stripe_account_id)`,

//   // Provider documents indexes
//   `CREATE INDEX IF NOT EXISTS idx_documents_provider ON provider_documents(provider_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_documents_status ON provider_documents(status)`,
//   `CREATE INDEX IF NOT EXISTS idx_documents_verified ON provider_documents(is_verified)`,

//   // Provider bank accounts indexes
//   `CREATE INDEX IF NOT EXISTS idx_bank_provider ON provider_bank_accounts(provider_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_bank_stripe ON provider_bank_accounts(stripe_account_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_bank_status ON provider_bank_accounts(account_status)`,

//   // Services table indexes
//   `CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active)`,
//   `CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug)`,

//   // Bookings table indexes
//   `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`,
//   `CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email)`,
//   `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(job_date)`,
//   `CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_bookings_timer ON bookings(job_timer_status)`,
//   `CREATE INDEX IF NOT EXISTS idx_bookings_provider_status ON bookings(provider_id, status)`,

//   // Booking photos indexes
//   `CREATE INDEX IF NOT EXISTS idx_booking_photos_booking ON booking_photos(booking_id)`,

//   // Booking status history indexes
//   `CREATE INDEX IF NOT EXISTS idx_status_history_booking ON booking_status_history(booking_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_status_history_created ON booking_status_history(created_at)`,

//   // Booking time logs indexes
//   `CREATE INDEX IF NOT EXISTS idx_time_logs_booking ON booking_time_logs(booking_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_time_logs_timestamp ON booking_time_logs(timestamp)`,

//   // Job photos indexes
//   `CREATE INDEX IF NOT EXISTS idx_job_photos_booking ON job_photos(booking_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_job_photos_type ON job_photos(photo_type)`,

//   // Provider reviews indexes
//   `CREATE INDEX IF NOT EXISTS idx_reviews_provider ON provider_reviews(provider_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_reviews_booking ON provider_reviews(booking_id)`,

//   // Invoices indexes
//   `CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_invoices_provider ON invoices(provider_id)`,
//   `CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number)`,
//   `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`
// ];

// // =====================================================
// // Main migration function
// // =====================================================
// async function runMigration() {
//   let conn = null;

//   console.log('\n' + '='.repeat(60));
//   console.log('🚀 WorkOnTap Database Migration (13 Tables)');
//   console.log('='.repeat(60) + '\n');

//   try {
//     // Step 1: Create database
//     console.log('📁 Step 1: Creating database...');
//     conn = await connect(false);
//     await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
//     console.log(`   ✓ Database '${DB_NAME}' is ready`);
//     await conn.end();

//     // Step 2: Connect to database
//     conn = await connect(true);
//     console.log(`   ✓ Connected to database\n`);

//     // Step 3: Create tables
//     console.log('🏗️  Step 2: Creating tables...');
//     let createdCount = 0;
//     const tableNames = [];

//     for (const sql of tables) {
//       try {
//         await conn.execute(sql);
        
//         // Extract table name for logging
//         const match = sql.match(/CREATE TABLE.*?(\w+)/);
//         if (match) {
//           const tableName = match[1];
//           tableNames.push(tableName);
//           console.log(`   ✓ Created: ${tableName}`);
//           createdCount++;
//         }
//       } catch (err) {
//         if (err.code === 'ER_TABLE_EXISTS_ERROR') {
//           console.log(`   ⊘ Table already exists (skipped)`);
//         } else {
//           throw err;
//         }
//       }
//     }
//     console.log(`   📊 Total tables created/verified: ${createdCount}/13\n`);

//     // Step 4: Create indexes
//     console.log('📊 Step 3: Creating indexes...');
//     let indexCount = 0;
//     for (const sql of indexes) {
//       try {
//         await conn.execute(sql);
//         indexCount++;
//       } catch (err) {
//         // Ignore duplicate index errors
//         if (!err.message.includes('Duplicate key name')) {
//           console.log(`   ⚠ Warning: ${err.message.substring(0, 100)}`);
//         }
//       }
//     }
//     console.log(`   ✓ Created ${indexCount} indexes\n`);

//     // Step 5: Verify all tables
//     console.log('🔍 Step 4: Verifying tables...');
//     const [rows] = await conn.query('SHOW TABLES');
//     const actualTables = rows.map(row => Object.values(row)[0]);
    
//     console.log(`   Found ${actualTables.length} tables in database:`);
//     actualTables.sort().forEach((name, i) => {
//       console.log(`   ${(i+1).toString().padStart(2)}. ${name}`);
//     });

//     // Step 6: Show table structures count
//     console.log('\n📋 Step 5: Table column counts:');
//     const tableQueries = [
//       'users', 'service_categories', 'service_providers', 'services',
//       'provider_documents', 'provider_bank_accounts', 'bookings', 
//       'booking_photos', 'booking_status_history', 'booking_time_logs',
//       'job_photos', 'provider_reviews', 'invoices'
//     ];

//     for (const table of tableQueries) {
//       try {
//         const [columns] = await conn.query(`DESCRIBE ${table}`);
//         console.log(`   • ${table.padEnd(22)}: ${columns.length} columns`);
//       } catch (err) {
//         console.log(`   • ${table.padEnd(22)}: not found`);
//       }
//     }

//     // Summary
//     console.log('\n' + '='.repeat(60));
//     console.log('✅ Migration completed successfully!');
//     console.log('='.repeat(60));
//     console.log(`   Database: ${DB_NAME}`);
//     console.log(`   Tables:   ${actualTables.length}/13`);
//     console.log(`   Indexes:  ${indexCount}`);
//     console.log('='.repeat(60) + '\n');

//   } catch (err) {
//     console.error('\n❌ Error:', err.message);
//     if (err.code === 'ER_ACCESS_DENIED_ERROR') {
//       console.error('   🔑 Check database credentials in .env file');
//       console.error('   DB_HOST, DB_USER, DB_PASSWORD, DB_PORT');
//     } else if (err.code === 'ECONNREFUSED') {
//       console.error('   🔌 Make sure MySQL server is running');
//     } else if (err.code === 'ER_BAD_DB_ERROR') {
//       console.error('   📁 Database does not exist, but should be created automatically');
//     }
//     process.exit(1);
//   } finally {
//     if (conn) {
//       await conn.end();
//       console.log('   🔒 Database connection closed');
//     }
//   }
// }

// // Run the migration
// runMigration();





















































import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env") });
const DB_NAME = process.env.DB_NAME || 'workontap_db';

// Create database connection
const connect = async (withDb = false) => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    port: parseInt(process.env.DB_PORT || '3306'),
    ...(withDb && { database: DB_NAME })
  });
};

console.log("DB USER:", process.env.DB_USER);
console.log("DB HOST:", process.env.DB_HOST);

// =====================================================
// Table creation SQL - All 13 tables with all fields
// =====================================================
const tables = [
  // Table 1: users
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    hear_about VARCHAR(255),
    receive_offers TINYINT(1) DEFAULT 0,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role)
  )`,

  // Table 2: service_categories
  `CREATE TABLE IF NOT EXISTS service_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(255),
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Table 3: service_providers (UPDATED with reset_token fields)
  `CREATE TABLE IF NOT EXISTS service_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    specialty VARCHAR(200),
    experience_years INT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    total_reviews INT DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    bio TEXT,
    avatar_url VARCHAR(255),
    location VARCHAR(200),
    city VARCHAR(100),
    status ENUM('active', 'inactive', 'pending', 'rejected') DEFAULT 'pending',
    remember_token VARCHAR(100),
    last_login DATETIME,
    email_verified TINYINT(1) DEFAULT 0,
    email_verification_token VARCHAR(255),
    email_verification_expires DATETIME,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    onboarding_step INT DEFAULT 1,
    onboarding_completed TINYINT(1) DEFAULT 0,
    documents_uploaded TINYINT(1) DEFAULT 0,
    documents_verified TINYINT(1) DEFAULT 0,
    stripe_account_id VARCHAR(255),
    stripe_onboarding_complete TINYINT(1) DEFAULT 0,
    approved_by INT,
    approved_at DATETIME,
    rejection_reason TEXT,
    service_areas JSON,
    skills JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_status (status),
    INDEX idx_onboarding_step (onboarding_step),
    INDEX idx_stripe_account (stripe_account_id),
    INDEX idx_email_verified (email_verified)
  )`,

  // Table 4: services
  `CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    base_price DECIMAL(10, 2) NOT NULL,
    additional_price DECIMAL(10, 2),
    duration_minutes INT,
    image_url VARCHAR(255),
    use_cases TEXT,
    is_homepage TINYINT(1) DEFAULT 0,
    is_trending TINYINT(1) DEFAULT 0,
    is_popular TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
    INDEX idx_is_active (is_active)
  )`,

  // Table 5: provider_documents
  `CREATE TABLE IF NOT EXISTS provider_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    document_type ENUM('id_proof', 'trade_license', 'insurance', 'certification', 'profile_photo', 'other') NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    is_verified TINYINT(1) DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_by INT,
    reviewed_by INT,
    verified_at DATETIME,
    reviewed_at DATETIME,
    rejection_reason TEXT,
    admin_notes TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_is_verified (is_verified)
  )`,

  // Table 6: provider_bank_accounts
  `CREATE TABLE IF NOT EXISTS provider_bank_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    stripe_account_id VARCHAR(255) NOT NULL,
    stripe_onboarding_url VARCHAR(500),
    onboarding_completed TINYINT(1) DEFAULT 0,
    account_status ENUM('pending', 'verified', 'rejected', 'incomplete') DEFAULT 'pending',
    bank_name VARCHAR(255),
    last4 VARCHAR(4),
    payout_method ENUM('stripe', 'bank_transfer') DEFAULT 'stripe',
    payout_schedule ENUM('instant', 'daily', 'weekly', 'monthly') DEFAULT 'weekly',
    default_payout TINYINT(1) DEFAULT 1,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    INDEX idx_provider (provider_id),
    INDEX idx_stripe_account (stripe_account_id),
    INDEX idx_account_status (account_status)
  )`,

  // Table 7: bookings (UPDATED with Stripe payment fields)
  `CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    service_id INT NOT NULL,
    provider_id INT,
    service_name VARCHAR(200),
    service_price DECIMAL(10, 2) NOT NULL,
    additional_price DECIMAL(10, 2) DEFAULT 0.00,
    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    job_date DATE NOT NULL,
    job_time_slot SET('morning', 'afternoon', 'evening') NOT NULL,
    timing_constraints TEXT,
    job_description TEXT NOT NULL,
    instructions TEXT,
    parking_access TINYINT(1) DEFAULT 0,
    elevator_access TINYINT(1) DEFAULT 0,
    has_pets TINYINT(1) DEFAULT 0,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Calgary',
    postal_code VARCHAR(20),
    status ENUM('pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    commission_percent DECIMAL(5, 2),
    provider_amount DECIMAL(10, 2),
    accepted_at DATETIME,
    start_time DATETIME,
    end_time DATETIME,
    actual_duration_minutes INT,
    overtime_minutes INT DEFAULT 0,
    overtime_earnings DECIMAL(10, 2) DEFAULT 0.00,
    final_provider_amount DECIMAL(10, 2),
    job_timer_status ENUM('not_started', 'running', 'paused', 'completed') DEFAULT 'not_started',
    before_photos_uploaded TINYINT(1) DEFAULT 0,
    after_photos_uploaded TINYINT(1) DEFAULT 0,
    photo_upload_deadline TIMESTAMP NULL,
    payment_intent_id VARCHAR(255) NULL,
    payment_status ENUM('pending', 'authorized', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50) NULL,
    stripe_customer_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_job_date (job_date),
    INDEX idx_job_timer_status (job_timer_status),
    INDEX idx_customer_email (customer_email),
    INDEX idx_payment_intent (payment_intent_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_stripe_customer (stripe_customer_id)
  )`,

  // Table 8: booking_photos
  `CREATE TABLE IF NOT EXISTS booking_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id)
  )`,

  // Table 9: booking_status_history
  `CREATE TABLE IF NOT EXISTS booking_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_created_at (created_at)
  )`,

  // Table 10: booking_time_logs
  `CREATE TABLE IF NOT EXISTS booking_time_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    action ENUM('start', 'pause', 'resume', 'stop', 'auto_pause') NOT NULL,
    timestamp DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_timestamp (timestamp)
  )`,

  // Table 11: job_photos
  `CREATE TABLE IF NOT EXISTS job_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    photo_type ENUM('before', 'after') NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES service_providers(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_photo_type (photo_type),
    INDEX idx_uploaded_by (uploaded_by)
  )`,

  // Table 12: provider_reviews
  `CREATE TABLE IF NOT EXISTS provider_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL UNIQUE,
    provider_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    is_anonymous TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_provider (provider_id),
    INDEX idx_customer (customer_id)
  )`,

  // Table 13: invoices
  `CREATE TABLE IF NOT EXISTS invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    invoice_type ENUM('customer', 'provider') NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    commission_percent DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    overtime_minutes INT DEFAULT 0,
    overtime_rate DECIMAL(10,2),
    overtime_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    provider_earnings DECIMAL(10,2),
    service_name VARCHAR(255) NOT NULL,
    service_duration INT,
    actual_duration INT,
    job_date DATE NOT NULL,
    completion_date DATETIME NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    payment_method VARCHAR(50),
    payment_date DATETIME,
    pdf_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_user (user_id),
    INDEX idx_provider (provider_id),
    INDEX idx_status (status)
  )`
];

// =====================================================
// Indexes for performance
// =====================================================
const indexes = [
  // Users table indexes
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,

  // Service providers table indexes
  `CREATE INDEX IF NOT EXISTS idx_providers_email ON service_providers(email)`,
  `CREATE INDEX IF NOT EXISTS idx_providers_status ON service_providers(status)`,
  `CREATE INDEX IF NOT EXISTS idx_providers_city ON service_providers(city)`,
  `CREATE INDEX IF NOT EXISTS idx_providers_onboarding ON service_providers(onboarding_step)`,
  `CREATE INDEX IF NOT EXISTS idx_providers_stripe ON service_providers(stripe_account_id)`,

  // Provider documents indexes
  `CREATE INDEX IF NOT EXISTS idx_documents_provider ON provider_documents(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_status ON provider_documents(status)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_verified ON provider_documents(is_verified)`,

  // Provider bank accounts indexes
  `CREATE INDEX IF NOT EXISTS idx_bank_provider ON provider_bank_accounts(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bank_stripe ON provider_bank_accounts(stripe_account_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bank_status ON provider_bank_accounts(account_status)`,

  // Services table indexes
  `CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug)`,

  // Bookings table indexes
  `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(job_date)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_timer ON bookings(job_timer_status)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_provider_status ON bookings(provider_id, status)`,

  // Booking photos indexes
  `CREATE INDEX IF NOT EXISTS idx_booking_photos_booking ON booking_photos(booking_id)`,

  // Booking status history indexes
  `CREATE INDEX IF NOT EXISTS idx_status_history_booking ON booking_status_history(booking_id)`,
  `CREATE INDEX IF NOT EXISTS idx_status_history_created ON booking_status_history(created_at)`,

  // Booking time logs indexes
  `CREATE INDEX IF NOT EXISTS idx_time_logs_booking ON booking_time_logs(booking_id)`,
  `CREATE INDEX IF NOT EXISTS idx_time_logs_timestamp ON booking_time_logs(timestamp)`,

  // Job photos indexes
  `CREATE INDEX IF NOT EXISTS idx_job_photos_booking ON job_photos(booking_id)`,
  `CREATE INDEX IF NOT EXISTS idx_job_photos_type ON job_photos(photo_type)`,

  // Provider reviews indexes
  `CREATE INDEX IF NOT EXISTS idx_reviews_provider ON provider_reviews(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_booking ON provider_reviews(booking_id)`,

  // Invoices indexes
  `CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_provider ON invoices(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`
];

// =====================================================
// Main migration function
// =====================================================
async function runMigration() {
  let conn = null;

  console.log('\n' + '='.repeat(60));
  console.log('🚀 WorkOnTap Database Migration (13 Tables with all fields)');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Create database
    console.log('📁 Step 1: Creating database...');
    conn = await connect(false);
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    console.log(`   ✓ Database '${DB_NAME}' is ready`);
    await conn.end();

    // Step 2: Connect to database
    conn = await connect(true);
    console.log(`   ✓ Connected to database\n`);

    // Step 3: Create tables
    console.log('🏗️  Step 2: Creating tables...');
    let createdCount = 0;
    const tableNames = [];

    for (const sql of tables) {
      try {
        await conn.execute(sql);
        
        // Extract table name for logging
        const match = sql.match(/CREATE TABLE.*?(\w+)/);
        if (match) {
          const tableName = match[1];
          tableNames.push(tableName);
          console.log(`   ✓ Created: ${tableName}`);
          createdCount++;
        }
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`   ⊘ Table already exists (skipped)`);
        } else {
          throw err;
        }
      }
    }
    console.log(`   📊 Total tables created/verified: ${createdCount}/13\n`);

    // Step 4: Create indexes
    console.log('📊 Step 3: Creating indexes...');
    let indexCount = 0;
    for (const sql of indexes) {
      try {
        await conn.execute(sql);
        indexCount++;
      } catch (err) {
        // Ignore duplicate index errors
        if (!err.message.includes('Duplicate key name')) {
          console.log(`   ⚠ Warning: ${err.message.substring(0, 100)}`);
        }
      }
    }
    console.log(`   ✓ Created ${indexCount} indexes\n`);

    // Step 5: Verify all tables
    console.log('🔍 Step 4: Verifying tables...');
    const [rows] = await conn.query('SHOW TABLES');
    const actualTables = rows.map(row => Object.values(row)[0]);
    
    console.log(`   Found ${actualTables.length} tables in database:`);
    actualTables.sort().forEach((name, i) => {
      console.log(`   ${(i+1).toString().padStart(2)}. ${name}`);
    });

    // Step 6: Show table structures count
    console.log('\n📋 Step 5: Table column counts:');
    const tableQueries = [
      'users', 'service_categories', 'service_providers', 'services',
      'provider_documents', 'provider_bank_accounts', 'bookings', 
      'booking_photos', 'booking_status_history', 'booking_time_logs',
      'job_photos', 'provider_reviews', 'invoices'
    ];

    for (const table of tableQueries) {
      try {
        const [columns] = await conn.query(`DESCRIBE ${table}`);
        console.log(`   • ${table.padEnd(22)}: ${columns.length} columns`);
      } catch (err) {
        console.log(`   • ${table.padEnd(22)}: not found`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   Tables:   ${actualTables.length}/13`);
    console.log(`   Indexes:  ${indexCount}`);
    console.log('   Fields included:');
    console.log('   • service_providers: reset_token, reset_token_expiry');
    console.log('   • bookings: payment_intent_id, payment_status, payment_method, stripe_customer_id');
    console.log('='.repeat(60) + '\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   🔑 Check database credentials in .env file');
      console.error('   DB_HOST, DB_USER, DB_PASSWORD, DB_PORT');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   🔌 Make sure MySQL server is running');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('   📁 Database does not exist, but should be created automatically');
    }
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
      console.log('   🔒 Database connection closed');
    }
  }
}

// Run the migration
runMigration();