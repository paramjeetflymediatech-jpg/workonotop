-- WorkOnTap Database Schema - Clean Version
-- Only includes existing tables from your database

-- Drop tables in correct order (respect foreign keys)
DROP TABLE IF EXISTS booking_photos;
DROP TABLE IF EXISTS booking_status_history;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS service_providers;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS users;

-- =====================
-- Core Tables
-- =====================

-- 1. Service Categories
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

-- 2. Services
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
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id)
);

-- 3. Service Providers
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
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  remember_token VARCHAR(100),
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- 4. Users (Main users/customers table)
CREATE TABLE users (
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
);

-- 5. Bookings
CREATE TABLE bookings (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_email (customer_email),
  INDEX idx_date (job_date)
);

-- 6. Booking Photos
CREATE TABLE booking_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id)
);

-- 7. Booking Status History
CREATE TABLE booking_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id)
);

-- =====================
-- Indexes for Performance
-- =====================
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_date ON bookings(job_date);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_providers_email ON service_providers(email);
CREATE INDEX idx_providers_status ON service_providers(status);