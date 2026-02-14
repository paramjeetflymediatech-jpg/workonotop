// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// // Create a connection without specifying database first (for creating DB)
// const initialConnection = async () => {
//   return await mysql.createConnection({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || '',
//     port: process.env.DB_PORT || 3306
//   });
// };

// // Create connection pool for database queries
// const createPool = () => {
//   return mysql.createPool({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || '',
//     database: process.env.DB_NAME || 'workontap_db',
//     port: process.env.DB_PORT || 3306,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
//   });
// };

// // SQL queries for schema creation
// const schemaSql = [
//   // Create database
//   `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'workontap_db'}`,

//   // Service Categories Table
//   `CREATE TABLE IF NOT EXISTS service_categories (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     name VARCHAR(100) NOT NULL,
//     slug VARCHAR(100) UNIQUE NOT NULL,
//     icon VARCHAR(255),
//     description TEXT,
//     is_active BOOLEAN DEFAULT TRUE,
//     display_order INT DEFAULT 0,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//   )`,

//   // Services Table
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
//     use_cases TEXT DEFAULT NULL COMMENT 'Comma separated list of use cases',
//     is_homepage BOOLEAN DEFAULT FALSE COMMENT 'Show on homepage',
//     is_trending BOOLEAN DEFAULT FALSE COMMENT 'Trending service',
//     is_popular BOOLEAN DEFAULT FALSE COMMENT 'Popular service',
//     is_active BOOLEAN DEFAULT TRUE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
//   )`,

//   // Customers Table
//   `CREATE TABLE IF NOT EXISTS customers (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     first_name VARCHAR(100) NOT NULL,
//     last_name VARCHAR(100) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     phone VARCHAR(20) NOT NULL,
//     password_hash VARCHAR(255) NOT NULL,
//     address TEXT,
//     city VARCHAR(100),
//     postal_code VARCHAR(20),
//     is_verified BOOLEAN DEFAULT FALSE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//   )`,

//   // Service Providers (Tradespeople) Table
//   `CREATE TABLE IF NOT EXISTS service_providers (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     name VARCHAR(200) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     phone VARCHAR(20) NOT NULL,
//     specialty VARCHAR(200),
//     experience_years INT,
//     rating DECIMAL(3, 2) DEFAULT 0,
//     total_jobs INT DEFAULT 0,
//     bio TEXT,
//     avatar_url VARCHAR(255),
//     location VARCHAR(200),
//     status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//   )`,

//   // Bookings Table
//   `CREATE TABLE IF NOT EXISTS bookings (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     booking_number VARCHAR(50) UNIQUE NOT NULL,
//     service_id INT NOT NULL,
//     service_name VARCHAR(200),
//     service_price DECIMAL(10,2) NOT NULL,
//     additional_price DECIMAL(10,2) DEFAULT 0.00,
//     customer_first_name VARCHAR(100) NOT NULL,
//     customer_last_name VARCHAR(100) NOT NULL,
//     customer_email VARCHAR(255) NOT NULL,
//     customer_phone VARCHAR(50) NOT NULL,
//     job_date DATE NOT NULL,
//     job_time_slot ENUM('morning', 'afternoon', 'evening') NOT NULL,
//     timing_constraints TEXT,
//     job_description TEXT NOT NULL,
//     instructions TEXT,
//     parking_access BOOLEAN DEFAULT FALSE,
//     elevator_access BOOLEAN DEFAULT FALSE,
//     has_pets BOOLEAN DEFAULT FALSE,
//     address_line2 VARCHAR(255),
//     city VARCHAR(100) DEFAULT 'Calgary',
//     postal_code VARCHAR(20),
//     total_price DECIMAL(10,2) DEFAULT 0.00,
//     payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
//     status ENUM('pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
//     INDEX idx_status (status),
//     INDEX idx_email (customer_email),
//     INDEX idx_date (job_date)
//   )`,

//   // Booking Photos Table
//   `CREATE TABLE IF NOT EXISTS booking_photos (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     booking_id INT NOT NULL,
//     photo_url VARCHAR(500) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
//   )`,

//   // Booking Status History Table
//   `CREATE TABLE IF NOT EXISTS booking_status_history (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     booking_id INT NOT NULL,
//     status VARCHAR(50) NOT NULL,
//     notes TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
//   )`,

//   // Admin Users Table
//   `CREATE TABLE IF NOT EXISTS admin_users (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     username VARCHAR(100) UNIQUE NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password_hash VARCHAR(255) NOT NULL,
//     role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
//     is_active BOOLEAN DEFAULT TRUE,
//     last_login TIMESTAMP NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//   )`,

//   // Activity Logs Table
//   `CREATE TABLE IF NOT EXISTS activity_logs (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     user_id INT,
//     user_type ENUM('admin', 'customer', 'provider'),
//     action VARCHAR(255) NOT NULL,
//     description TEXT,
//     ip_address VARCHAR(45),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )`,

//   // Create indexes for performance
//   `CREATE INDEX idx_bookings_status ON bookings(status)`,
//   `CREATE INDEX idx_bookings_email ON bookings(customer_email)`,
//   `CREATE INDEX idx_services_category ON services(category_id)`,
// ];

// // Sample data to insert
// const sampleDataSql = [
//   // Service Categories
//   `INSERT INTO service_categories (name, slug, icon, description, display_order) VALUES
//   ('Cleaning', 'cleaning', '🧹', 'Professional cleaning services for your home', 1),
//   ('Indoors', 'indoors', '🏠', 'Interior maintenance and repairs', 2),
//   ('Install', 'install', '🔧', 'Installation services for appliances and fixtures', 3),
//   ('Repair', 'repair', '🛠️', 'Expert repair services', 4),
//   ('Outdoors', 'outdoors', '🌳', 'Outdoor maintenance and landscaping', 5),
//   ('Seasonal', 'seasonal', '❄️', 'Seasonal services and maintenance', 6)
//   ON DUPLICATE KEY UPDATE name=name`,

//   // Services - Install
//   `INSERT INTO services (category_id, name, slug, description, short_description, base_price, additional_price, duration_minutes) VALUES
//   (3, 'Appliance Install', 'appliance-install', 'Professional appliance installation including dishwashers, washers, dryers, fridges, and more', 'Install dishwashers, washers, dryers, and more', 180.00, 90.00, 120),
//   (3, 'Dishwasher Install', 'dishwasher-install', 'Expert dishwasher installation with proper plumbing connections', 'Professional dishwasher installation', 180.00, 0, 90),
//   (3, 'Washer/Dryer Install', 'washer-dryer-install', 'Complete washer and dryer installation service', 'Washer and dryer setup', 200.00, 100.00, 120),
//   (3, 'Range/Oven Install', 'range-oven-install', 'Safe installation of ranges and ovens', 'Range and oven installation', 220.00, 0, 120),
//   (4, 'Appliance Repair', 'appliance-repair', 'Expert repair services for all household appliances', 'Fix broken appliances', 150.00, 50.00, 90),
//   (4, 'Plumbing Repair', 'plumbing-repair', 'Professional plumbing repairs and fixes', 'Fix leaks, clogs, and more', 120.00, 60.00, 60),
//   (1, 'Deep Cleaning', 'deep-cleaning', 'Thorough deep cleaning of your entire home', 'Complete home deep clean', 200.00, 0, 240),
//   (1, 'Carpet Cleaning', 'carpet-cleaning', 'Professional carpet and upholstery cleaning', 'Steam clean carpets', 150.00, 50.00, 120),
//   (2, 'Bathtub & Shower Caulking', 'bathtub-shower-caulking', 'Professional caulking services for bathrooms', 'Seal and waterproof your bathroom', 100.00, 0, 60),
//   (2, 'Furniture Assembly', 'furniture-assembly', 'Expert furniture assembly service', 'Assemble any furniture', 80.00, 40.00, 90),
//   (5, 'Decks & Fences', 'decks-fences', 'Deck and fence installation and repair', 'Build or repair decks and fences', 500.00, 200.00, 480),
//   (5, 'Lawn Mowing', 'lawn-mowing', 'Professional lawn care and mowing', 'Keep your lawn pristine', 60.00, 20.00, 60)
//   ON DUPLICATE KEY UPDATE name=name`,

//   // Admin User (admin / admin123)
//   `INSERT INTO admin_users (username, email, password_hash, role) VALUES
//   ('admin', 'admin@workontap.com', '$2b$10$K8LO1yEEZbp43FzalB39ouwzSDkjWMr2q/bKTGPiwLgeJCl/2sbmC', 'super_admin')
//   ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)`,

//   // Service Providers
//   `INSERT INTO service_providers (name, email, phone, specialty, experience_years, rating, total_jobs, location, status) VALUES
//   ('John Smith', 'john@workontap.com', '555-0101', 'Appliance Installation', 8, 4.8, 156, 'Downtown', 'active'),
//   ('Sarah Johnson', 'sarah@workontap.com', '555-0102', 'Plumbing & Repairs', 12, 4.9, 203, 'North Side', 'active'),
//   ('Mike Williams', 'mike@workontap.com', '555-0103', 'General Handyman', 5, 4.6, 89, 'West End', 'active'),
//   ('Emily Brown', 'emily@workontap.com', '555-0104', 'Cleaning Services', 6, 4.7, 142, 'East Side', 'active')
//   ON DUPLICATE KEY UPDATE name=name`,
// ];

// // Main function to create schema
// async function initializeSchema() {
//   let connection = null;
//   let pool = null;

//   try {
//     console.log('Starting database schema initialization...\n');

//     // Step 1: Connect without database to create it
//     console.log('Step 1: Creating database...');
//     connection = await initialConnection();
//     const dbName = process.env.DB_NAME || 'workontap_db';
//     await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
//     await connection.query(`USE ${dbName}`);
//     await connection.end();
//     console.log(`✓ Database ${dbName} created/verified\n`);

//     // Step 2: Create tables
//     console.log('Step 2: Creating tables...');
//     pool = createPool();

//     for (const sql of schemaSql) {
//       try {
//         await pool.execute(sql);
//         console.log(`✓ ${sql.substring(0, 50)}...`);
//       } catch (error) {
//         // Skip if table or index already exists
//         if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
//           console.log(`⊘ Already exists: ${sql.substring(0, 50)}...`);
//         } else {
//           throw error;
//         }
//       }
//     }
//     console.log('');

//     // Step 3: Insert sample data
//     console.log('Step 3: Inserting sample data...');
//     for (const sql of sampleDataSql) {
//       try {
//         await pool.execute(sql);
//         console.log(`✓ Inserted: ${sql.substring(0, 50)}...`);
//       } catch (error) {
//         console.error(`✗ Error inserting data: ${error.message}`);
//       }
//     }

//     console.log('\n✓ Database schema initialization completed successfully!');
//     console.log(`Database: ${dbName}`);
//     console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
//     console.log(`Port: ${process.env.DB_PORT || 3306}`);

//   } catch (error) {
//     console.error('✗ Error initializing database schema:', error.message);
//     process.exit(1);
//   } finally {
//     if (pool) {
//       await pool.end();
//     }
//   }
// }

// // Run the initialization
// initializeSchema();



















import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: resolve(__dirname, '../.env') });

// Create a connection without specifying database first (for creating DB)
const initialConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306')
  });
};

// Create connection pool for database queries
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

// SQL queries for schema creation - Clean version with NO sample data
const schemaSql = [
  // Create database
  `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'workontap_db'}`,

  // Use database
  `USE ${process.env.DB_NAME || 'workontap_db'}`,

  // 1. Service Categories Table
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

  // 2. Services Table
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

  // 3. Users Table (Main users/customers)
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    hear_about VARCHAR(255),
    receive_offers BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
  )`,

  // 4. Service Providers Table
  `CREATE TABLE IF NOT EXISTS service_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialty VARCHAR(200),
    experience_years INT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    bio TEXT,
    avatar_url VARCHAR(255),
    location VARCHAR(200),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // 5. Admin Users Table
  `CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // 6. Bookings Table
  `CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    service_id INT NOT NULL,
    service_name VARCHAR(200),
    service_price DECIMAL(10,2) NOT NULL,
    additional_price DECIMAL(10,2) DEFAULT 0.00,
    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    job_date DATE NOT NULL,
    job_time_slot ENUM('morning', 'afternoon', 'evening') NOT NULL,
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
    INDEX idx_status (status),
    INDEX idx_email (customer_email),
    INDEX idx_date (job_date)
  )`,

  // 7. Booking Photos Table
  `CREATE TABLE IF NOT EXISTS booking_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,

  // 8. Booking Status History Table
  `CREATE TABLE IF NOT EXISTS booking_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,

  // 9. Additional Indexes for Performance
  `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(job_date)`,
  `CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id)`,
];

// Main function to create schema
async function initializeSchema() {
  let connection = null;
  let pool = null;

  try {
    console.log('🚀 Starting database schema initialization...\n');

    // Step 1: Connect without database to create it
    console.log('📁 Step 1: Creating database...');
    connection = await initialConnection();
    const dbName = process.env.DB_NAME || 'workontap_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database ${dbName} created/verified`);
    
    // Use the database
    await connection.query(`USE ${dbName}`);
    await connection.end();
    console.log('');

    // Step 2: Create connection pool
    pool = createPool();

    // Step 3: Create tables
    console.log('🏗️  Step 2: Creating tables...');
    let tableCount = 0;
    
    for (const sql of schemaSql) {
      try {
        // Skip USE statement for execution
        if (sql.startsWith('USE')) continue;
        
        await pool.execute(sql);
        
        // Extract table name for better logging
        if (sql.includes('CREATE TABLE')) {
          const tableName = sql.match(/CREATE TABLE.*?(\w+)/)?.[1] || 'table';
          console.log(`  ✓ Created: ${tableName}`);
          tableCount++;
        } else if (sql.includes('CREATE INDEX')) {
          console.log(`  ✓ Created index`);
        }
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ⊘ Table already exists`);
        } else if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`  ⊘ Index already exists`);
        } else {
          console.log(`  ⚠ Warning: ${error.message.substring(0, 100)}...`);
        }
      }
    }
    console.log(`  Total tables created: ${tableCount}\n`);

    // Step 4: Verify tables
    console.log('🔍 Step 3: Verifying tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('  Tables created:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  ✓ ${tableName}`);
    });

    // Final success message
    console.log('\n✅ Database schema initialization completed successfully!');
    console.log(`📊 Database: ${dbName}`);
    console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.log(`📈 Total tables: ${tables.length}`);
    console.log('\n✨ All tables are empty and ready for use!');

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
