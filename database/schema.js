import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });
 
const DB_NAME = process.env.DB_NAME || 'workontap_db';
 
// Create database connection
const connect = async (withDb = false) => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'aman',
    password: process.env.DB_PASSWORD || 'aman1234',
    port: parseInt(process.env.DB_PORT || '3306'),
    ...(withDb && { database: DB_NAME })
  });
};
 
// Table creation SQL
const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    hear_about VARCHAR(255),
    receive_offers BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
 
  `CREATE TABLE IF NOT EXISTS service_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
 
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
    bio TEXT,
    avatar_url VARCHAR(255),
    location VARCHAR(200),
    city VARCHAR(100),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    remember_token VARCHAR(100),
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
 
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
    is_homepage BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
  )`,
 
  `CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    service_id INT NOT NULL,
    provider_id INT NULL,
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
    parking_access BOOLEAN DEFAULT FALSE,
    elevator_access BOOLEAN DEFAULT FALSE,
    has_pets BOOLEAN DEFAULT FALSE,
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
    before_photos_uploaded BOOLEAN DEFAULT FALSE,
    after_photos_uploaded BOOLEAN DEFAULT FALSE,
    photo_upload_deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL
  )`,
 
  `CREATE TABLE IF NOT EXISTS booking_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,
 
  `CREATE TABLE IF NOT EXISTS booking_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,
 
  `CREATE TABLE IF NOT EXISTS booking_time_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    action ENUM('start', 'pause', 'resume', 'stop', 'auto_pause') NOT NULL,
    timestamp DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,
 
  `CREATE TABLE IF NOT EXISTS job_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    photo_type ENUM('before', 'after') NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES service_providers(id)
  )`,
 
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
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES service_providers(id)
  )`,
 
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_token (token)
  )`
];
 
// Indexes for performance
const indexes = [
  `CREATE INDEX idx_users_email ON users(email)`,
  `CREATE INDEX idx_users_role ON users(role)`,
  `CREATE INDEX idx_providers_email ON service_providers(email)`,
  `CREATE INDEX idx_providers_status ON service_providers(status)`,
  `CREATE INDEX idx_providers_city ON service_providers(city)`,
  `CREATE INDEX idx_services_category ON services(category_id)`,
  `CREATE INDEX idx_services_active ON services(is_active)`,
  `CREATE INDEX idx_services_slug ON services(slug)`,
  `CREATE INDEX idx_bookings_status ON bookings(status)`,
  `CREATE INDEX idx_bookings_email ON bookings(customer_email)`,
  `CREATE INDEX idx_bookings_date ON bookings(job_date)`,
  `CREATE INDEX idx_bookings_provider ON bookings(provider_id)`,
  `CREATE INDEX idx_bookings_timer ON bookings(job_timer_status)`,
  `CREATE INDEX idx_bookings_provider_status ON bookings(provider_id, status)`,
  `CREATE INDEX idx_booking_photos_booking ON booking_photos(booking_id)`,
  `CREATE INDEX idx_status_history_booking ON booking_status_history(booking_id)`,
  `CREATE INDEX idx_status_history_created ON booking_status_history(created_at)`,
  `CREATE INDEX idx_time_logs_booking ON booking_time_logs(booking_id)`,
  `CREATE INDEX idx_time_logs_timestamp ON booking_time_logs(timestamp)`,
  `CREATE INDEX idx_job_photos_booking ON job_photos(booking_id)`,
  `CREATE INDEX idx_job_photos_type ON job_photos(photo_type)`,
  `CREATE INDEX idx_invoices_booking ON invoices(booking_id)`,
  `CREATE INDEX idx_invoices_user ON invoices(user_id)`,
  `CREATE INDEX idx_invoices_provider ON invoices(provider_id)`,
  `CREATE INDEX idx_invoices_number ON invoices(invoice_number)`,
  `CREATE INDEX idx_invoices_status ON invoices(status)`,
  `CREATE INDEX idx_reset_email ON password_reset_tokens(email)`,
  `CREATE INDEX idx_reset_token ON password_reset_tokens(token)`
];
 
// Main migration function
async function runMigration() {
  let conn = null;
 
  console.log('\n' + '='.repeat(50));
  console.log('🚀 WorkOnTap Database Migration');
  console.log('='.repeat(50) + '\n');
 
  try {
    // Step 1: Create database
    console.log('📁 Creating database...');
    conn = await connect(false);
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    console.log(`  ✓ Database ${DB_NAME} ready`);
    await conn.end();
 
    // Step 2: Connect to database
    conn = await connect(true);
 
    // Step 3: Create tables
    console.log('\n🏗️  Creating tables...');
    for (const sql of tables) {
      await conn.execute(sql);
    }
    console.log(`  ✓ Created 11 tables`);
 
    // Step 4: Create indexes
    console.log('\n📊 Creating indexes...');
    for (const sql of indexes) {
      try {
        await conn.execute(sql);
      } catch (err) {
        // Ignore duplicate index errors
      }
    }
    console.log(`  ✓ Created indexes`);
 
    // Step 5: Verify
    const [rows] = await conn.query('SHOW TABLES');
    console.log('\n✅ Migration complete!');
    console.log(`   ${rows.length} tables created`);
    console.log('\n📋 Tables:');
    rows.forEach(row => {
      const name = Object.values(row)[0];
      console.log(`   • ${name}`);
    });
 
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}
 
// Run it
runMigration();