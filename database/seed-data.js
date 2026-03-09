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

// =====================================================
// Table creation SQL - All 17 tables with exact fields
// =====================================================
const tables = [
  // Table 1: users - UPDATED with UNIQUE constraint on phone
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) UNIQUE,
    hear_about VARCHAR(255),
    receive_offers TINYINT(1) DEFAULT 0,
    role ENUM('user', 'admin') DEFAULT 'user',
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
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

  // Table 3: service_providers
  `CREATE TABLE IF NOT EXISTS service_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    specialty VARCHAR(200),
    experience_years INT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    total_reviews INT DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    available_balance DECIMAL(10,2) DEFAULT 0.00,
    pending_balance DECIMAL(10,2) DEFAULT 0.00,
    lifetime_balance DECIMAL(10,2) DEFAULT 0.00,
    bio TEXT,
    avatar_url VARCHAR(255),
    location VARCHAR(200),
    city VARCHAR(100),
    status ENUM('active', 'inactive', 'pending', 'rejected', 'suspended') DEFAULT 'pending',
    remember_token VARCHAR(100),
    last_login DATETIME,
    email_verified TINYINT(1) DEFAULT 0,
    email_verification_token VARCHAR(255),
    email_verification_expires DATETIME,
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
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
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
    base_price DECIMAL(10,2) NOT NULL,
    additional_price DECIMAL(10,2),
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

  // Table 7: bookings - UPDATED with all your columns
  `CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    service_id INT NOT NULL,
    provider_id INT,
    previous_provider_id INT,
    service_name VARCHAR(200),
    service_price DECIMAL(10,2) NOT NULL,
    additional_price DECIMAL(10,2) DEFAULT 0.00,
    standard_duration_minutes INT DEFAULT 60,
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
    status ENUM('pending', 'matching', 'confirmed', 'in_progress', 'awaiting_approval', 'completed', 'cancelled', 'disputed') DEFAULT 'pending',
    commission_percent DECIMAL(5,2),
    provider_amount DECIMAL(10,2),
    accepted_at DATETIME,
    start_time DATETIME,
    end_time DATETIME,
    actual_duration_minutes INT,
    overtime_minutes INT DEFAULT 0,
    overtime_earnings DECIMAL(10,2) DEFAULT 0.00,
    final_provider_amount DECIMAL(10,2),
    job_timer_status ENUM('not_started', 'running', 'paused', 'completed') DEFAULT 'not_started',
    before_photos_uploaded TINYINT(1) DEFAULT 0,
    after_photos_uploaded TINYINT(1) DEFAULT 0,
    work_summary TEXT,
    recommendations TEXT,
    payment_intent_id VARCHAR(255),
    authorized_amount DECIMAL(10,2),
    payment_status ENUM('pending', 'authorized', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    photo_upload_deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_provider (provider_id),
    INDEX idx_previous_provider (previous_provider_id),
    INDEX idx_status (status),
    INDEX idx_job_date (job_date),
    INDEX idx_customer_email (customer_email),
    INDEX idx_payment_intent (payment_intent_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_stripe_customer (stripe_customer_id),
    INDEX idx_job_timer_status (job_timer_status)
  )`,

  // Table 8: chat_messages
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('customer', 'provider') NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_sender (sender_id, sender_type),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
  )`,

  // Table 9: booking_photos
  `CREATE TABLE IF NOT EXISTS booking_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id)
  )`,

  // Table 10: booking_status_history
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

  // Table 11: booking_time_logs
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

  // Table 12: job_photos
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

  // Table 13: provider_reviews
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

  // Table 14: invoices
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
  )`,

  // Table 15: provider_payouts
  `CREATE TABLE IF NOT EXISTS provider_payouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'paid', 'failed') DEFAULT 'pending',
    stripe_payout_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    booking_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_booking (booking_id)
  )`,

  // Table 16: disputes
  `CREATE TABLE IF NOT EXISTS disputes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    raised_by_user_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('open', 'reviewing', 'resolved', 'closed') DEFAULT 'open',
    admin_notes TEXT,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_raised_by (raised_by_user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
  )`,

  // Table 17: mobile_auth_users
  `CREATE TABLE IF NOT EXISTS mobile_auth_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    provider_id INT DEFAULT NULL,
    user_type ENUM('customer', 'provider') NOT NULL,
    refresh_token VARCHAR(512) DEFAULT NULL,
    refresh_token_expires DATETIME DEFAULT NULL,
    push_token TEXT DEFAULT NULL,
    push_token_platform ENUM('ios', 'android', 'web') DEFAULT NULL,
    push_token_updated_at DATETIME DEFAULT NULL,
    device_id VARCHAR(255) DEFAULT NULL,
    device_name VARCHAR(255) DEFAULT NULL,
    device_platform ENUM('ios', 'android', 'web') DEFAULT NULL,
    os_version VARCHAR(50) DEFAULT NULL,
    app_version VARCHAR(50) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME DEFAULT NULL,
    logged_out_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_provider_id (provider_id),
    INDEX idx_user_type (user_type),
    INDEX idx_push_token (push_token(255)),
    INDEX idx_device_id (device_id),
    INDEX idx_is_active (is_active),
    UNIQUE KEY uq_user_device (user_id, device_id),
    UNIQUE KEY uq_provider_device (provider_id, device_id)
  )`
];

// =====================================================
// Column alterations for existing databases
// =====================================================
const alterations = [
  // Add UNIQUE constraint to users.phone if it doesn't exist
  { 
    table: 'users', 
    column: 'phone_unique', 
    sql: 'ALTER TABLE users ADD UNIQUE INDEX phone_unique (phone)',
    type: 'unique'
  },
  
  // service_providers table additions
  { table: 'service_providers', column: 'email_verified', sql: 'ALTER TABLE service_providers ADD COLUMN email_verified TINYINT(1) DEFAULT 0 AFTER last_login' },
  { table: 'service_providers', column: 'email_verification_token', sql: 'ALTER TABLE service_providers ADD COLUMN email_verification_token VARCHAR(255) AFTER email_verified' },
  { table: 'service_providers', column: 'email_verification_expires', sql: 'ALTER TABLE service_providers ADD COLUMN email_verification_expires DATETIME AFTER email_verification_token' },
  { table: 'service_providers', column: 'onboarding_step', sql: 'ALTER TABLE service_providers ADD COLUMN onboarding_step INT DEFAULT 1 AFTER email_verification_expires' },
  { table: 'service_providers', column: 'onboarding_completed', sql: 'ALTER TABLE service_providers ADD COLUMN onboarding_completed TINYINT(1) DEFAULT 0 AFTER onboarding_step' },
  { table: 'service_providers', column: 'documents_uploaded', sql: 'ALTER TABLE service_providers ADD COLUMN documents_uploaded TINYINT(1) DEFAULT 0 AFTER onboarding_completed' },
  { table: 'service_providers', column: 'documents_verified', sql: 'ALTER TABLE service_providers ADD COLUMN documents_verified TINYINT(1) DEFAULT 0 AFTER documents_uploaded' },
  { table: 'service_providers', column: 'stripe_account_id', sql: 'ALTER TABLE service_providers ADD COLUMN stripe_account_id VARCHAR(255) AFTER documents_verified' },
  { table: 'service_providers', column: 'stripe_onboarding_complete', sql: 'ALTER TABLE service_providers ADD COLUMN stripe_onboarding_complete TINYINT(1) DEFAULT 0 AFTER stripe_account_id' },
  { table: 'service_providers', column: 'rejection_reason', sql: 'ALTER TABLE service_providers ADD COLUMN rejection_reason TEXT AFTER approved_at' },
  { table: 'service_providers', column: 'service_areas', sql: 'ALTER TABLE service_providers ADD COLUMN service_areas JSON AFTER rejection_reason' },
  { table: 'service_providers', column: 'skills', sql: 'ALTER TABLE service_providers ADD COLUMN skills JSON AFTER service_areas' },
  { table: 'service_providers', column: 'reset_token', sql: 'ALTER TABLE service_providers ADD COLUMN reset_token VARCHAR(255) AFTER updated_at' },
  { table: 'service_providers', column: 'reset_token_expiry', sql: 'ALTER TABLE service_providers ADD COLUMN reset_token_expiry DATETIME AFTER reset_token' },

  // Bookings table - previous_provider_id
  { table: 'bookings', column: 'previous_provider_id', sql: 'ALTER TABLE bookings ADD COLUMN previous_provider_id INT AFTER provider_id' },

  // Index for previous_provider_id
  { table: 'bookings', column: 'idx_previous_provider', sql: 'CREATE INDEX idx_previous_provider ON bookings(previous_provider_id)' },

  // Additional missing columns for bookings table
  { table: 'bookings', column: 'job_timer_status', sql: "ALTER TABLE bookings ADD COLUMN job_timer_status ENUM('not_started', 'running', 'paused', 'completed') DEFAULT 'not_started'" },
  { table: 'bookings', column: 'before_photos_uploaded', sql: 'ALTER TABLE bookings ADD COLUMN before_photos_uploaded TINYINT(1) DEFAULT 0' },
  { table: 'bookings', column: 'after_photos_uploaded', sql: 'ALTER TABLE bookings ADD COLUMN after_photos_uploaded TINYINT(1) DEFAULT 0' },
  { table: 'bookings', column: 'work_summary', sql: 'ALTER TABLE bookings ADD COLUMN work_summary TEXT' },
  { table: 'bookings', column: 'recommendations', sql: 'ALTER TABLE bookings ADD COLUMN recommendations TEXT' }
];

// =====================================================
// Main migration function
// =====================================================
async function runMigration() {
  let conn = null;

  console.log('\n' + '='.repeat(60));
  console.log('🚀 WorkOnTap Database Migration');
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
    console.log('🏗️  Step 2: Creating 17 tables...');
    let createdCount = 0;

    for (const sql of tables) {
      try {
        await conn.execute(sql);
        const match = sql.match(/CREATE TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
        if (match) {
          console.log(`   ✓ Created: ${match[1]}`);
          createdCount++;
        }
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          const match = sql.match(/CREATE TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          console.log(`   ⊘ Table already exists: ${match[1]}`);
          createdCount++;
        } else {
          throw err;
        }
      }
    }
    console.log(`   📊 Total tables created/verified: ${createdCount}/17\n`);

    // Step 4: Run alterations (add missing columns and constraints)
    console.log('🔧 Step 3: Applying column alterations and constraints...');
    for (const alt of alterations) {
      try {
        // Check if it's an INDEX, UNIQUE, or COLUMN
        if (alt.sql.startsWith('CREATE INDEX')) {
          // Handle index creation
          const [indexExists] = await conn.query(
            `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
            [DB_NAME, alt.table, alt.column]
          );
          if (indexExists.length === 0) {
            await conn.execute(alt.sql);
            console.log(`   ✓ Added index: ${alt.table}.${alt.column}`);
          } else {
            console.log(`   ⊘ Index already exists: ${alt.table}.${alt.column}`);
          }
        } else if (alt.type === 'unique') {
          // Handle UNIQUE constraint
          try {
            await conn.execute(alt.sql);
            console.log(`   ✓ Added UNIQUE constraint: ${alt.table}.${alt.column}`);
          } catch (err) {
            if (err.code === 'ER_DUP_INDEX' || err.message.includes('Duplicate key name')) {
              console.log(`   ⊘ UNIQUE constraint already exists: ${alt.table}.${alt.column}`);
            } else {
              throw err;
            }
          }
        } else {
          // Handle column addition
          const [cols] = await conn.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [DB_NAME, alt.table, alt.column]
          );
          if (cols.length === 0) {
            await conn.execute(alt.sql);
            console.log(`   ✓ Added column: ${alt.table}.${alt.column}`);
          } else {
            console.log(`   ⊘ Column already exists: ${alt.table}.${alt.column}`);
          }
        }
      } catch (err) {
        console.log(`   ⚠ Warning: ${err.message.substring(0, 120)}`);
      }
    }

    // Step 5: Verify bookings table structure
    console.log('\n🔍 Step 4: Verifying bookings table structure...');
    try {
      const [columns] = await conn.query(`DESCRIBE bookings`);
      console.log(`   📋 Bookings table has ${columns.length} columns`);

      // Check for specific columns
      const columnNames = columns.map(c => c.Field);
      const requiredColumns = [
        'previous_provider_id', 'work_summary', 'recommendations', 
        'job_timer_status', 'before_photos_uploaded', 'after_photos_uploaded'
      ];

      requiredColumns.forEach(col => {
        if (columnNames.includes(col)) {
          console.log(`   ✓ Found column: ${col}`);
        } else {
          console.log(`   ❌ Missing column: ${col}`);
        }
      });
    } catch (err) {
      console.log(`   ⚠ Could not verify bookings table: ${err.message}`);
    }

    // Step 6: Verify users table structure and UNIQUE constraint
    console.log('\n🔍 Step 5: Verifying users table structure...');
    try {
      const [columns] = await conn.query(`DESCRIBE users`);
      console.log(`   📋 Users table has ${columns.length} columns`);
      
      // Check for UNIQUE constraint on phone
      const [constraints] = await conn.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone' AND CONSTRAINT_NAME != 'PRIMARY'`,
        [DB_NAME]
      );
      
      if (constraints.length > 0) {
        console.log(`   ✓ UNIQUE constraint exists on phone column`);
      } else {
        console.log(`   ❌ UNIQUE constraint missing on phone column - trying to add it...`);
        try {
          await conn.execute('ALTER TABLE users ADD UNIQUE INDEX phone_unique (phone)');
          console.log(`   ✓ Added UNIQUE constraint on phone column`);
        } catch (err) {
          console.log(`   ⚠ Could not add UNIQUE constraint: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`   ⚠ Could not verify users table: ${err.message}`);
    }

    // Step 7: Show all table structures
    console.log('\n📋 Step 6: All table column counts:');
    const tableQueries = [
      'users', 'service_categories', 'service_providers', 'services',
      'provider_documents', 'provider_bank_accounts', 'bookings',
      'chat_messages', 'booking_photos', 'booking_status_history',
      'booking_time_logs', 'job_photos', 'provider_reviews', 'invoices',
      'provider_payouts', 'disputes', 'mobile_auth_users'
    ];

    let totalColumns = 0;
    for (const table of tableQueries) {
      try {
        const [columns] = await conn.query(`DESCRIBE ${table}`);
        console.log(`   • ${table.padEnd(22)}: ${columns.length} columns`);
        totalColumns += columns.length;

        // Special verification for bookings table
        if (table === 'bookings') {
          const columnNames = columns.map(c => c.Field);
          const requiredColumns = [
            'previous_provider_id', 'job_timer_status', 'before_photos_uploaded',
            'after_photos_uploaded', 'work_summary', 'recommendations'
          ];

          const missing = requiredColumns.filter(col => !columnNames.includes(col));
          if (missing.length === 0) {
            console.log('     ✓ All required columns present');
          } else {
            console.log('     ❌ Missing columns:', missing.join(', '));
          }
        }
      } catch (err) {
        console.log(`   • ${table.padEnd(22)}: not found`);
      }
    }
    console.log(`   📊 Total columns across all tables: ${totalColumns}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   Tables:   ${tableQueries.length}/17`);
    console.log(`   Total Columns: ${totalColumns}`);
    console.log('   ✓ UNIQUE constraint added to users.phone column');
    console.log('='.repeat(60) + '\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   🔑 Please update database credentials in .env file:');
      console.error(`      DB_HOST=${process.env.DB_HOST || 'localhost'}`);
      console.error(`      DB_USER=${process.env.DB_USER || 'root'}`);
      console.error(`      DB_PASSWORD=${process.env.DB_PASSWORD ? '****' : 'not set'}`);
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   🔌 MySQL server is not running. Please start MySQL first.');
    } else if (err.code === 'ER_DUP_ENTRY') {
      console.error('   ⚠ Duplicate entries found in users.phone column. Please clean up duplicates first:');
      console.error('      Run: SELECT phone, COUNT(*) FROM users GROUP BY phone HAVING COUNT(*) > 1;');
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