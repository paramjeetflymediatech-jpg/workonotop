import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

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
    database: process.env.DB_NAME || 'workontap_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// Clean schema SQL with ONLY your existing tables and fields
const schemaSql = [
  // Create database
  `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'workontap_db'}`,

  // Use database
  `USE ${process.env.DB_NAME || 'workontap_db'}`,

  // 1. Users Table
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    hear_about VARCHAR(255),
    receive_offers BOOLEAN DEFAULT FALSE,
    role ENUM('user','admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
  )`,

  // 2. Service Categories Table
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

  // 3. Services Table
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
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id)
  )`,

  // 4. Service Providers Table
  `CREATE TABLE IF NOT EXISTS service_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialty VARCHAR(200),
    experience_years INT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    bio TEXT,
    avatar_url VARCHAR(255),
    location VARCHAR(200),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    remember_token VARCHAR(100),
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
  )`,

  // 5. Bookings Table
  `CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    service_id INT NOT NULL,
    provider_id INT,
    service_name VARCHAR(200),
    service_price DECIMAL(10,2) NOT NULL,
    additional_price DECIMAL(10,2) DEFAULT 0.00,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_email (customer_email),
    INDEX idx_date (job_date)
  )`,

  // 6. Booking Photos Table
  `CREATE TABLE IF NOT EXISTS booking_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id)
  )`,

  // 7. Booking Status History Table
  `CREATE TABLE IF NOT EXISTS booking_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id)
  )`
];

// Main function
async function initializeSchema() {
  let connection = null;
  let pool = null;

  try {
    console.log('🚀 Starting database schema initialization...\n');

    // Step 1: Create database
    console.log('📁 Step 1: Creating database...');
    connection = await initialConnection();
    const dbName = process.env.DB_NAME || 'workontap_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database ${dbName} created/verified`);
    await connection.end();
    console.log('');

    // Step 2: Create connection pool
    pool = createPool();

    // Step 3: Create tables
    console.log('🏗️  Step 2: Creating tables...');
    let tableCount = 0;

    for (const sql of schemaSql) {
      try {
        if (sql.startsWith('USE')) continue;
        
        await pool.execute(sql);
        
        if (sql.includes('CREATE TABLE')) {
          const tableName = sql.match(/CREATE TABLE.*?(\w+)/)?.[1] || 'table';
          console.log(`  ✓ Created: ${tableName}`);
          tableCount++;
        }
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ⊘ Table already exists`);
        } else {
          console.log(`  ⚠ Warning: ${error.message.substring(0, 100)}...`);
        }
      }
    }
    console.log(`  Total tables: ${tableCount}\n`);

    // Step 4: Verify tables
    console.log('🔍 Step 3: Verifying tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('  Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  ✓ ${tableName}`);
    });

    console.log('\n✅ Database schema initialization completed successfully!');
    console.log(`📊 Database: ${dbName}`);
    console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.log(`📈 Total tables: ${tables.length}`);

  } catch (error) {
    console.error('\n❌ Error initializing database schema:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure MySQL server is running');
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the initialization
initializeSchema();