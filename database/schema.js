import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Configuration
const DB_NAME = process.env.DB_NAME || 'workontap_db';

// Create connection without specifying database
const initialConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306')
  });
};

// Create connection pool
const createPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// Complete schema SQL
const schemaSql = [
  // Create database
  `CREATE DATABASE IF NOT EXISTS ${DB_NAME}`,

  // Use database
  `USE ${DB_NAME}`,

  // Table 1: users
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

  // Table 2: service_categories
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

  // Table 3: service_providers
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
    is_homepage BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
  )`,

  // Table 5: bookings
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

  // Table 6: booking_photos
  `CREATE TABLE IF NOT EXISTS booking_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,

  // Table 7: booking_status_history
  `CREATE TABLE IF NOT EXISTS booking_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,

  // Table 8: booking_time_logs
  `CREATE TABLE IF NOT EXISTS booking_time_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    action ENUM('start', 'pause', 'resume', 'stop', 'auto_pause') NOT NULL,
    timestamp DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,

  // Table 9: job_photos
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

  // Table 10: invoices
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

  // Table 11: password_reset_tokens
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
const indexStatements = [
  // Users table indexes
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,

  // Service providers table indexes
  `CREATE INDEX IF NOT EXISTS idx_providers_email ON service_providers(email)`,
  `CREATE INDEX IF NOT EXISTS idx_providers_status ON service_providers(status)`,
  `CREATE INDEX IF NOT EXISTS idx_providers_city ON service_providers(city)`,

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

  // Invoices indexes
  `CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_provider ON invoices(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`,

  // Password reset tokens indexes
  `CREATE INDEX IF NOT EXISTS idx_reset_email ON password_reset_tokens(email)`,
  `CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(token)`
];

// Main migration function
async function runMigration() {
  let connection = null;
  let pool = null;

  console.log('\n' + '='.repeat(60));
  console.log('🚀 WorkOnTap Database Migration');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Create database
    console.log('📁 Step 1: Creating database...');
    connection = await initialConnection();
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    console.log(`  ✓ Database ${DB_NAME} created/verified`);
    await connection.end();
    
    // Step 2: Create connection pool
    pool = createPool();

    // Step 3: Create tables
    console.log('\n🏗️  Step 2: Creating tables...');
    const createdTables = [];

    for (const sql of schemaSql) {
      try {
        if (sql.startsWith('USE')) continue;
        
        await pool.execute(sql);
        
        if (sql.includes('CREATE TABLE')) {
          const match = sql.match(/CREATE TABLE.*?(\w+)/);
          if (match) {
            const tableName = match[1];
            createdTables.push(tableName);
            console.log(`  ✓ Created: ${tableName}`);
          }
        }
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ⊘ Table already exists: ${error.message.match(/'.*?'/)?.[0] || 'table'}`);
        } else {
          console.log(`  ⚠ Warning: ${error.message.substring(0, 100)}...`);
        }
      }
    }
    console.log(`  Total tables: ${createdTables.length}`);

    // Step 4: Create indexes
    console.log('\n📊 Step 3: Creating indexes...');
    let indexCount = 0;
    for (const indexSql of indexStatements) {
      try {
        await pool.execute(indexSql);
        indexCount++;
      } catch (error) {
        if (!error.message.includes('Duplicate key')) {
          console.log(`  ⚠ ${error.message.substring(0, 100)}...`);
        }
      }
    }
    console.log(`  ✓ Created ${indexCount} indexes`);

    // Step 5: Verify tables
    console.log('\n🔍 Step 4: Verifying tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('  Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  ✓ ${tableName}`);
    });

    // Step 6: Show table structures count
    console.log('\n📋 Step 5: Table structures:');
    
    const tableQueries = [
      'users', 'service_categories', 'service_providers', 'services', 
      'bookings', 'booking_photos', 'booking_status_history', 
      'booking_time_logs', 'job_photos', 'invoices', 'password_reset_tokens'
    ];

    for (const table of tableQueries) {
      try {
        const [columns] = await pool.query(`DESCRIBE ${table}`);
        console.log(`  ${table}: ${columns.length} columns`);
      } catch (error) {
        console.log(`  ${table}: not found`);
      }
    }

    // Step 7: Save migration record
    console.log('\n💾 Step 6: Saving migration record...');
    const migrationRecord = {
      timestamp: new Date().toISOString(),
      database: DB_NAME,
      tables: createdTables,
      indexes: indexCount,
      status: 'success'
    };

    const migrationDir = path.join(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }

    const fileName = `migration_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(
      path.join(migrationDir, fileName),
      JSON.stringify(migrationRecord, null, 2)
    );
    console.log(`  ✓ Migration record saved: ${fileName}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log(`📊 Database: ${DB_NAME}`);
    console.log(`📈 Total tables: ${tables.length}`);
    console.log(`📇 Total indexes: ${indexCount}`);
    console.log(`\n📝 Tables created:`);
    createdTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    console.log('\n' + '='.repeat(60));
    console.log('\n⚠️  All tables are empty. Please add data through your application.\n');

  } catch (error) {
    console.error('\n❌ Error running migration:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure MySQL server is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   Database does not exist and could not be created');
    }
    
    // Save error record
    try {
      const errorDir = path.join(process.cwd(), 'migrations/errors');
      if (!fs.existsSync(errorDir)) {
        fs.mkdirSync(errorDir, { recursive: true });
      }
      
      const errorFile = `error_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      fs.writeFileSync(
        path.join(errorDir, errorFile),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          error: error.message,
          code: error.code,
          sqlState: error.sqlState
        }, null, 2)
      );
    } catch (e) {
      // Ignore
    }
    
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run migration
runMigration();

// Export for programmatic usage
export { runMigration };