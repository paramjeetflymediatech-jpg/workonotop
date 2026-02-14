-- WorkOnTap Admin Panel Database Schema
-- Run these queries in your MySQL database

-- Create Database
CREATE DATABASE IF NOT EXISTS workontap_db;
USE workontap_db;



-- WorkOnTap Database Schema
-- Run these queries in your MySQL database

-- -- Create Database
-- CREATE DATABASE IF NOT EXISTS workontap_db;
-- USE workontap_db;

-- =====================
-- Core Tables
-- =====================

-- 1. Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
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

-- 2. Services Table
CREATE TABLE IF NOT EXISTS services (
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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
);



ALTER TABLE services 
ADD COLUMN use_cases TEXT DEFAULT NULL COMMENT 'Comma separated list of use cases';

ALTER TABLE services 
ADD COLUMN is_homepage BOOLEAN DEFAULT FALSE COMMENT 'Show on homepage',
ADD COLUMN is_trending BOOLEAN DEFAULT FALSE COMMENT 'Trending service',
ADD COLUMN is_popular BOOLEAN DEFAULT FALSE COMMENT 'Popular service';




-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
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



-- 4. Service Providers (Tradespeople) Table
CREATE TABLE IF NOT EXISTS service_providers (
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











-- database/schema.sql mein yeh daalo

-- Purani tables drop karo
DROP TABLE IF EXISTS booking_photos;
DROP TABLE IF EXISTS booking_status_history;
DROP TABLE IF EXISTS bookings;

-- Naya bookings table - frontend ke hisaab se
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Service info (schedule page se)
  service_id INT NOT NULL,
  service_name VARCHAR(200),
  service_price DECIMAL(10,2) NOT NULL,
  additional_price DECIMAL(10,2) DEFAULT 0.00,
  
  -- Customer info (confirm page se)
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  
  -- Schedule info (schedule page se)
  job_date DATE NOT NULL,
  job_time_slot ENUM('morning', 'afternoon', 'evening') NOT NULL,
  timing_constraints TEXT,
  
  -- Job details (details page se)
  job_description TEXT NOT NULL,
  instructions TEXT,
  parking_access BOOLEAN DEFAULT FALSE,
  elevator_access BOOLEAN DEFAULT FALSE,
  has_pets BOOLEAN DEFAULT FALSE,
  
  -- Location (address modal se)
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) DEFAULT 'Calgary',
  postal_code VARCHAR(20),
  
  -- Status
  status ENUM('pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_email (customer_email),
  INDEX idx_date (job_date)
);

-- Booking photos table
CREATE TABLE IF NOT EXISTS booking_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Booking timeline
CREATE TABLE IF NOT EXISTS booking_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
































-- -- 5. Provider Services (What services each provider offers)
-- CREATE TABLE IF NOT EXISTS provider_services (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   provider_id INT NOT NULL,
--   service_id INT NOT NULL,
--   custom_price DECIMAL(10, 2),
--   is_available BOOLEAN DEFAULT TRUE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
--   FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
--   UNIQUE KEY unique_provider_service (provider_id, service_id)
-- );

-- -- 6. Bookings Table (Main booking records)
-- CREATE TABLE IF NOT EXISTS bookings (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   customer_id INT NOT NULL,
--   service_id INT NOT NULL,
--   provider_id INT,
--   booking_date DATE NOT NULL,
--   booking_time VARCHAR(50),
--   time_preference ENUM('morning', 'afternoon', 'evening', 'anytime') DEFAULT 'anytime',
--   status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
--   address TEXT NOT NULL,
--   city VARCHAR(100),
--   postal_code VARCHAR(20),
--   description TEXT,
--   special_instructions TEXT,
--   total_price DECIMAL(10, 2),
--   payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
--   payment_method VARCHAR(50),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
--   FOREIGN KEY (service_id) REFERENCES services(id),
--   FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL
-- );

-- -- 7. Booking Photos (Customer uploaded photos)
-- CREATE TABLE IF NOT EXISTS booking_photos (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   booking_id INT NOT NULL,
--   photo_url VARCHAR(255) NOT NULL,
--   uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
-- );

-- -- 8. Reviews Table
-- CREATE TABLE IF NOT EXISTS reviews (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   booking_id INT NOT NULL,
--   customer_id INT NOT NULL,
--   provider_id INT NOT NULL,
--   rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
--   comment TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
--   FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
--   FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE
-- );

-- -- 9. Admin Users Table
-- CREATE TABLE IF NOT EXISTS admin_users (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   username VARCHAR(100) UNIQUE NOT NULL,
--   email VARCHAR(255) UNIQUE NOT NULL,
--   password_hash VARCHAR(255) NOT NULL,
--   role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
--   is_active BOOLEAN DEFAULT TRUE,
--   last_login TIMESTAMP NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- 10. Activity Logs Table
-- CREATE TABLE IF NOT EXISTS activity_logs (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   user_id INT,
--   user_type ENUM('admin', 'customer', 'provider'),
--   action VARCHAR(255) NOT NULL,
--   description TEXT,
--   ip_address VARCHAR(45),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- =====================
-- Insert Sample Data
-- =====================

-- Service Categories
INSERT INTO service_categories (name, slug, icon, description, display_order) VALUES
('Cleaning', 'cleaning', '🧹', 'Professional cleaning services for your home', 1),
('Indoors', 'indoors', '🏠', 'Interior maintenance and repairs', 2),
('Install', 'install', '🔧', 'Installation services for appliances and fixtures', 3),
('Repair', 'repair', '🛠️', 'Expert repair services', 4),
('Outdoors', 'outdoors', '🌳', 'Outdoor maintenance and landscaping', 5),
('Seasonal', 'seasonal', '❄️', 'Seasonal services and maintenance', 6);

-- Services
INSERT INTO services (category_id, name, slug, description, short_description, base_price, additional_price, duration_minutes) VALUES
-- Install Services
(3, 'Appliance Install', 'appliance-install', 'Professional appliance installation including dishwashers, washers, dryers, fridges, and more', 'Install dishwashers, washers, dryers, and more', 180.00, 90.00, 120),
(3, 'Dishwasher Install', 'dishwasher-install', 'Expert dishwasher installation with proper plumbing connections', 'Professional dishwasher installation', 180.00, 0, 90),
(3, 'Washer/Dryer Install', 'washer-dryer-install', 'Complete washer and dryer installation service', 'Washer and dryer setup', 200.00, 100.00, 120),
(3, 'Range/Oven Install', 'range-oven-install', 'Safe installation of ranges and ovens', 'Range and oven installation', 220.00, 0, 120),

-- Repair Services  
(4, 'Appliance Repair', 'appliance-repair', 'Expert repair services for all household appliances', 'Fix broken appliances', 150.00, 50.00, 90),
(4, 'Plumbing Repair', 'plumbing-repair', 'Professional plumbing repairs and fixes', 'Fix leaks, clogs, and more', 120.00, 60.00, 60),

-- Cleaning Services
(1, 'Deep Cleaning', 'deep-cleaning', 'Thorough deep cleaning of your entire home', 'Complete home deep clean', 200.00, 0, 240),
(1, 'Carpet Cleaning', 'carpet-cleaning', 'Professional carpet and upholstery cleaning', 'Steam clean carpets', 150.00, 50.00, 120),

-- Indoor Services
(2, 'Bathtub & Shower Caulking', 'bathtub-shower-caulking', 'Professional caulking services for bathrooms', 'Seal and waterproof your bathroom', 100.00, 0, 60),
(2, 'Furniture Assembly', 'furniture-assembly', 'Expert furniture assembly service', 'Assemble any furniture', 80.00, 40.00, 90),

-- Outdoor Services
(5, 'Decks & Fences', 'decks-fences', 'Deck and fence installation and repair', 'Build or repair decks and fences', 500.00, 200.00, 480),
(5, 'Lawn Mowing', 'lawn-mowing', 'Professional lawn care and mowing', 'Keep your lawn pristine', 60.00, 20.00, 60);

-- Admin User (password: admin123)
-- Hash: $2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC
INSERT INTO admin_users (username, email, password_hash, role) VALUES
('admin', 'admin@workontap.com', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', 'super_admin');

-- Sample Service Providers
INSERT INTO service_providers (name, email, phone, specialty, experience_years, rating, total_jobs, location, status) VALUES
('John Smith', 'john@workontap.com', '555-0101', 'Appliance Installation', 8, 4.8, 156, 'Downtown', 'active'),
('Sarah Johnson', 'sarah@workontap.com', '555-0102', 'Plumbing & Repairs', 12, 4.9, 203, 'North Side', 'active'),
('Mike Williams', 'mike@workontap.com', '555-0103', 'General Handyman', 5, 4.6, 89, 'West End', 'active'),
('Emily Brown', 'emily@workontap.com', '555-0104', 'Cleaning Services', 6, 4.7, 142, 'East Side', 'active');

-- =====================
-- Indexes for Performance
-- =====================

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

















-- ///////////////////DUMMY DATA FOR TESTING 


















-- -- INSERT CUSTOMERS
-- -- =====================
-- INSERT INTO customers (first_name, last_name, email, phone, password_hash, address, city, postal_code, is_verified) VALUES
-- ('John', 'Doe', 'john.doe@example.com', '555-0101', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', '123 Main St', 'New York', '10001', TRUE),
-- ('Jane', 'Smith', 'jane.smith@example.com', '555-0102', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', '456 Oak Ave', 'Los Angeles', '90001', TRUE),
-- ('Robert', 'Johnson', 'robert.j@example.com', '555-0103', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', '789 Pine St', 'Chicago', '60601', FALSE),
-- ('Emily', 'Williams', 'emily.w@example.com', '555-0104', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', '321 Elm St', 'Miami', '33101', TRUE),
-- ('Michael', 'Brown', 'michael.b@example.com', '555-0105', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', '555 Cedar Rd', 'Houston', '77001', FALSE),
-- ('Sarah', 'Davis', 'sarah.d@example.com', '555-0106', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', '777 Maple Ave', 'Seattle', '98101', TRUE),
-- ('David', 'Miller', 'david.m@example.com', '555-0107', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', '888 Birch Ln', 'Denver', '80201', FALSE),
-- ('Lisa', 'Wilson', 'lisa.w@example.com', '555-0108', '$2b$10$mpHPuCBTtR2Y5JcXakM1eXJOe56vkp071r1pzzG6sGj$7c8r25RIC', '999 Spruce St', 'Boston', '02101', TRUE);

-- -- =====================
-- -- INSERT BOOKINGS
-- -- =====================
-- INSERT INTO bookings (customer_id, service_id, provider_id, booking_date, booking_time, time_preference, status, address, city, postal_code, description, total_price, payment_status) VALUES
-- -- Pending Bookings
-- (1, 1, NULL, '2024-02-20', '10:00 AM', 'morning', 'pending', '123 Main St', 'New York', '10001', 'Install new dishwasher', 180.00, 'pending'),
-- (2, 5, NULL, '2024-02-22', '11:30 AM', 'morning', 'pending', '456 Oak Ave', 'Los Angeles', '90001', 'Refrigerator repair', 150.00, 'pending'),
-- (4, 9, NULL, '2024-02-24', '09:00 AM', 'morning', 'pending', '321 Elm St', 'Miami', '33101', 'Bathtub caulking', 100.00, 'pending'),
-- (6, 2, NULL, '2024-02-25', '02:00 PM', 'afternoon', 'pending', '777 Maple Ave', 'Seattle', '98101', 'Dishwasher installation', 180.00, 'pending'),

-- -- Confirmed Bookings
-- (2, 7, 4, '2024-02-21', '02:00 PM', 'afternoon', 'confirmed', '456 Oak Ave', 'Los Angeles', '90001', 'Deep cleaning', 200.00, 'pending'),
-- (5, 8, 4, '2024-02-23', '03:00 PM', 'afternoon', 'confirmed', '555 Cedar Rd', 'Houston', '77001', 'Carpet cleaning', 150.00, 'pending'),
-- (7, 11, 3, '2024-02-26', '08:00 AM', 'morning', 'confirmed', '888 Birch Ln', 'Denver', '80201', 'Fence repair', 500.00, 'pending'),
-- (8, 4, 1, '2024-02-27', '10:30 AM', 'morning', 'confirmed', '999 Spruce St', 'Boston', '02101', 'Oven installation', 220.00, 'pending'),

-- -- In Progress Bookings
-- (3, 6, 2, '2024-02-19', '09:00 AM', 'morning', 'in_progress', '789 Pine St', 'Chicago', '60601', 'Sink leak repair', 120.00, 'pending'),
-- (1, 10, 3, '2024-02-19', '01:00 PM', 'afternoon', 'in_progress', '123 Main St', 'New York', '10001', 'Furniture assembly', 80.00, 'pending'),
-- (4, 12, 4, '2024-02-20', '08:00 AM', 'morning', 'in_progress', '321 Elm St', 'Miami', '33101', 'Lawn mowing', 60.00, 'pending'),

-- -- Completed Bookings
-- (1, 10, 3, '2024-02-18', '01:00 PM', 'afternoon', 'completed', '123 Main St', 'New York', '10001', 'Wardrobe assembly', 160.00, 'paid'),
-- (3, 3, 1, '2024-02-16', '10:30 AM', 'morning', 'completed', '789 Pine St', 'Chicago', '60601', 'Washer/dryer install', 200.00, 'paid'),
-- (5, 1, 1, '2024-02-15', '11:00 AM', 'morning', 'completed', '555 Cedar Rd', 'Houston', '77001', 'Appliance install', 180.00, 'paid'),
-- (6, 7, 4, '2024-02-14', '02:30 PM', 'afternoon', 'completed', '777 Maple Ave', 'Seattle', '98101', 'Deep cleaning', 200.00, 'paid'),
-- (8, 5, 2, '2024-02-13', '09:30 AM', 'morning', 'completed', '999 Spruce St', 'Boston', '02101', 'Appliance repair', 150.00, 'paid'),

-- -- Cancelled Bookings
-- (4, 12, NULL, '2024-02-17', '08:00 AM', 'morning', 'cancelled', '321 Elm St', 'Miami', '33101', 'Lawn service', 60.00, 'refunded'),
-- (2, 6, NULL, '2024-02-12', '03:00 PM', 'afternoon', 'cancelled', '456 Oak Ave', 'Los Angeles', '90001', 'Plumbing repair', 120.00, 'refunded');

-- -- =====================
-- -- INSERT REVIEWS
-- -- =====================
-- INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment) VALUES
-- (12, 1, 3, 5, 'Mike did an amazing job! Very professional and efficient.'),
-- (13, 3, 1, 5, 'John installed our washer and dryer perfectly. Great service!'),
-- (14, 5, 1, 4, 'Good work, appliance works perfectly now.'),
-- (15, 6, 4, 5, 'Emily cleaned our entire house, spotless!'),
-- (16, 8, 2, 4, 'Sarah fixed our oven, works great now.'),
-- (2, 2, 4, 4, 'Good cleaning service, will book again.'),
-- (3, 3, 2, 5, 'Excellent plumbing service, very knowledgeable.'),
-- (4, 1, 3, 4, 'Good work, but arrived a bit late.'),
-- (13, 3, 1, 5, 'Very happy with the installation service!');