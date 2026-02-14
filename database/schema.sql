-- WorkOnTap Database Schema - Clean Version
CREATE DATABASE IF NOT EXISTS workontap_db;
USE workontap_db;

-- =====================
-- Drop Tables (Ordered by dependencies)
-- =====================
DROP TABLE IF EXISTS booking_photos;
DROP TABLE IF EXISTS booking_status_history;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS provider_services;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS service_providers;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS activity_logs;

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
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
);

-- 3. Customers
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Service Providers
CREATE TABLE service_providers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  specialty VARCHAR(200),
  experience_years INT,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_jobs INT DEFAULT 0,
  bio TEXT,
  avatar_url VARCHAR(255),
  location VARCHAR(200),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Admin Users
CREATE TABLE admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Bookings
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  total_price DECIMAL(10,2) DEFAULT 0.00,
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  status ENUM('pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 7. Booking Photos
CREATE TABLE booking_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 8. Booking Status History
CREATE TABLE booking_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 9. Reviews
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  customer_id INT,
  provider_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 10. Provider Services
CREATE TABLE provider_services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider_id INT NOT NULL,
  service_id INT NOT NULL,
  custom_price DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE KEY unique_provider_service (provider_id, service_id)
);

-- 11. Activity Logs
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  user_type ENUM('admin', 'customer', 'provider'),
  action VARCHAR(255) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- Insert Sample Data
-- =====================

-- Categories
INSERT INTO service_categories (name, slug, icon, description, display_order) VALUES
('Cleaning', 'cleaning', '🧹', 'Professional cleaning services for your home', 1),
('Indoors', 'indoors', '🏠', 'Interior maintenance and repairs', 2),
('Install', 'install', '🔧', 'Installation services for appliances and fixtures', 3),
('Repair', 'repair', '🛠️', 'Expert repair services', 4),
('Outdoors', 'outdoors', '🌳', 'Outdoor maintenance and landscaping', 5),
('Seasonal', 'seasonal', '❄️', 'Seasonal services and maintenance', 6);

-- Services
INSERT INTO services (category_id, name, slug, description, short_description, base_price, additional_price, duration_minutes) VALUES
(3, 'Appliance Install', 'appliance-install', 'Professional appliance installation', 'Install appliances', 180.00, 90.00, 120),
(3, 'Dishwasher Install', 'dishwasher-install', 'Expert dishwasher installation', 'Install dishwasher', 180.00, 0, 90),
(3, 'Washer/Dryer Install', 'washer-dryer-install', 'Complete washer and dryer installation', 'Washer/dryer setup', 200.00, 100.00, 120),
(4, 'Appliance Repair', 'appliance-repair', 'Expert repair services', 'Fix broken appliances', 150.00, 50.00, 90),
(4, 'Plumbing Repair', 'plumbing-repair', 'Professional plumbing repairs', 'Fix leaks, clogs', 120.00, 60.00, 60),
(1, 'Deep Cleaning', 'deep-cleaning', 'Thorough deep cleaning', 'Complete home clean', 200.00, 0, 240),
(2, 'Furniture Assembly', 'furniture-assembly', 'Expert furniture assembly', 'Assemble any furniture', 80.00, 40.00, 90);

-- Admin User (admin / admin123)
-- Hash: $2b$10$K8LO1yEEZbp43FzalB39ouwzSDkjWMr2q/bKTGPiwLgeJCl/2sbmC
INSERT INTO admin_users (username, email, password_hash, role) VALUES
('admin', 'admin@workontap.com', '$2b$10$K8LO1yEEZbp43FzalB39ouwzSDkjWMr2q/bKTGPiwLgeJCl/2sbmC', 'super_admin');

-- Service Providers
INSERT INTO service_providers (name, email, phone, specialty, experience_years, rating, location) VALUES
('John Smith', 'john@workontap.com', '555-0101', 'Appliance Installation', 8, 4.8, 'Downtown'),
('Sarah Johnson', 'sarah@workontap.com', '555-0102', 'Plumbing & Repairs', 12, 4.9, 'North Side');

-- =====================
-- Indexes
-- =====================
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_date ON bookings(job_date);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);