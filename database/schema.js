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

// Complete schema SQL with exactly the tables and fields from your DESCRIBE output
const schemaSql = [
  // Create database
  `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'workontap_db'}`,

  // Use database
  `USE ${process.env.DB_NAME || 'workontap_db'}`,

  // 1. users table - exactly as shown in DESCRIBE
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

  // 2. service_categories table - exactly as shown in DESCRIBE
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

  // 3. service_providers table - exactly as shown in DESCRIBE
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
    city VARCHAR(100),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    remember_token VARCHAR(100),
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // 4. services table - exactly as shown in DESCRIBE
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

  // 5. bookings table - exactly as shown in DESCRIBE (with all 37 fields)
  `CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    service_id INT NOT NULL,
    provider_id INT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL
  )`,

  // 6. booking_photos table - exactly as shown in DESCRIBE
  `CREATE TABLE IF NOT EXISTS booking_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,

  // 7. booking_status_history table - exactly as shown in DESCRIBE
  `CREATE TABLE IF NOT EXISTS booking_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,

  // 8. booking_time_logs table - exactly as shown in DESCRIBE
  `CREATE TABLE IF NOT EXISTS booking_time_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    action ENUM('start', 'pause', 'resume', 'stop', 'auto_pause') NOT NULL,
    timestamp DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`
];

// Indexes for performance (based on your DESCRIBE output)
const indexStatements = [
  `CREATE INDEX idx_users_email ON users(email)`,
  `CREATE INDEX idx_service_providers_email ON service_providers(email)`,
  `CREATE INDEX idx_service_providers_status ON service_providers(status)`,
  `CREATE INDEX idx_services_category ON services(category_id)`,
  `CREATE INDEX idx_bookings_status ON bookings(status)`,
  `CREATE INDEX idx_bookings_email ON bookings(customer_email)`,
  `CREATE INDEX idx_bookings_date ON bookings(job_date)`,
  `CREATE INDEX idx_bookings_provider ON bookings(provider_id)`,
  `CREATE INDEX idx_booking_photos_booking ON booking_photos(booking_id)`,
  `CREATE INDEX idx_booking_status_history_booking ON booking_status_history(booking_id)`,
  `CREATE INDEX idx_booking_time_logs_booking ON booking_time_logs(booking_id)`,
  `CREATE INDEX idx_booking_time_logs_timestamp ON booking_time_logs(timestamp)`
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
            tableCount++;
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
    console.log(`  Total tables: ${tableCount}\n`);

    // Step 4: Create indexes
    console.log('📊 Step 3: Creating indexes...');
    for (const indexSql of indexStatements) {
      try {
        await pool.execute(indexSql);
        console.log(`  ✓ Created: ${indexSql.substring(0, 60)}...`);
      } catch (error) {
        if (!error.message.includes('Duplicate key')) {
          console.log(`  ⚠ ${error.message.substring(0, 100)}...`);
        }
      }
    }
    console.log('');

    // Step 5: Verify tables
    console.log('🔍 Step 4: Verifying tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('  Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  ✓ ${tableName}`);
    });

    // Show table structures count
    console.log('\n📋 Step 5: Table structures:');
    
    const [userColumns] = await pool.query('DESCRIBE users');
    console.log(`  users: ${userColumns.length} columns`);
    
    const [catColumns] = await pool.query('DESCRIBE service_categories');
    console.log(`  service_categories: ${catColumns.length} columns`);
    
    const [providerColumns] = await pool.query('DESCRIBE service_providers');
    console.log(`  service_providers: ${providerColumns.length} columns`);
    
    const [serviceColumns] = await pool.query('DESCRIBE services');
    console.log(`  services: ${serviceColumns.length} columns`);
    
    const [bookingColumns] = await pool.query('DESCRIBE bookings');
    console.log(`  bookings: ${bookingColumns.length} columns`);
    
    const [photoColumns] = await pool.query('DESCRIBE booking_photos');
    console.log(`  booking_photos: ${photoColumns.length} columns`);
    
    const [historyColumns] = await pool.query('DESCRIBE booking_status_history');
    console.log(`  booking_status_history: ${historyColumns.length} columns`);
    
    const [logColumns] = await pool.query('DESCRIBE booking_time_logs');
    console.log(`  booking_time_logs: ${logColumns.length} columns`);

    console.log('\n✅ Database schema initialized successfully!');
    console.log(`📊 Database: ${dbName}`);
    console.log(`📈 Total tables: ${tables.length}`);
    console.log(`\n📝 Tables created:`);
    createdTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });

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