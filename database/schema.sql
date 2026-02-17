-- =====================================================
-- WorkOnTap Database - Clean Table Structure
-- =====================================================
-- This script creates all 8 tables with correct fields
-- NO data is inserted - just the table structures
-- =====================================================

-- =====================================================
-- Table 1: users
-- Purpose: Store customer and admin user accounts
-- =====================================================
CREATE TABLE users (
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
);

-- =====================================================
-- Table 2: service_categories
-- Purpose: Store service categories
-- =====================================================
CREATE TABLE service_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Table 3: service_providers
-- Purpose: Store tradespeople/provider accounts
-- =====================================================
CREATE TABLE service_providers (
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
);

-- =====================================================
-- Table 4: services
-- Purpose: Store individual services offered
-- =====================================================
CREATE TABLE services (
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
);

-- =====================================================
-- Table 5: bookings
-- Purpose: Store all job bookings
-- =====================================================
CREATE TABLE bookings (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL
);

-- =====================================================
-- Table 6: booking_photos
-- Purpose: Store photos uploaded with bookings
-- =====================================================
CREATE TABLE booking_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- =====================================================
-- Table 7: booking_status_history
-- Purpose: Track all status changes for audit trail
-- =====================================================
CREATE TABLE booking_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- =====================================================
-- Table 8: booking_time_logs
-- Purpose: Detailed time tracking logs for audit
-- =====================================================
CREATE TABLE booking_time_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  action ENUM('start', 'pause', 'resume', 'stop', 'auto_pause') NOT NULL,
  timestamp DATETIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Service providers table indexes
CREATE INDEX idx_providers_email ON service_providers(email);
CREATE INDEX idx_providers_status ON service_providers(status);
CREATE INDEX idx_providers_city ON service_providers(city);

-- Services table indexes
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_slug ON services(slug);

-- Bookings table indexes
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_date ON bookings(job_date);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_timer ON bookings(job_timer_status);
CREATE INDEX idx_bookings_provider_status ON bookings(provider_id, status);

-- Booking photos indexes
CREATE INDEX idx_booking_photos_booking ON booking_photos(booking_id);

-- Booking status history indexes
CREATE INDEX idx_status_history_booking ON booking_status_history(booking_id);
CREATE INDEX idx_status_history_created ON booking_status_history(created_at);

-- Booking time logs indexes
CREATE INDEX idx_time_logs_booking ON booking_time_logs(booking_id);
CREATE INDEX idx_time_logs_timestamp ON booking_time_logs(timestamp);

-- =====================================================
-- All tables created successfully
-- Total: 8 tables
-- =====================================================