-- =====================================================
-- WORKONTAP DATABASE - COMPLETE SCHEMA
-- Tables: 13
-- =====================================================

-- -----------------------------------------------------
-- Table: users (Customer accounts)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    hear_about VARCHAR(255),
    receive_offers TINYINT(1) DEFAULT 0,
    role ENUM('user', 'admin') DEFAULT 'user',
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_reset_token (reset_token)
);

-- -----------------------------------------------------
-- Table: service_categories
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS service_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(255),
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: services
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
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
);

-- -----------------------------------------------------
-- Table: service_providers
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS service_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    specialty VARCHAR(200),
    experience_years INT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    total_reviews INT DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    bio TEXT,
    avatar_url VARCHAR(255),
    location VARCHAR(200),
    city VARCHAR(100),
    status ENUM('active', 'inactive', 'pending', 'rejected') DEFAULT 'pending',
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
    INDEX idx_city (city),
    INDEX idx_status (status),
    INDEX idx_onboarding (onboarding_step, onboarding_completed),
    INDEX idx_stripe_account (stripe_account_id),
    INDEX idx_email_verified (email_verified)
);

-- -----------------------------------------------------
-- Table: provider_documents
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_documents (
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
);

-- -----------------------------------------------------
-- Table: provider_bank_accounts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_bank_accounts (
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
);

-- -----------------------------------------------------
-- Table: bookings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    booking_number VARCHAR(50) NOT NULL UNIQUE,
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
    parking_access TINYINT(1) DEFAULT 0,
    elevator_access TINYINT(1) DEFAULT 0,
    has_pets TINYINT(1) DEFAULT 0,
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
    before_photos_uploaded TINYINT(1) DEFAULT 0,
    after_photos_uploaded TINYINT(1) DEFAULT 0,
    photo_upload_deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_job_date (job_date),
    INDEX idx_job_timer_status (job_timer_status),
    INDEX idx_customer_email (customer_email)
);

-- -----------------------------------------------------
-- Table: booking_status_history
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_created_at (created_at)
);

-- -----------------------------------------------------
-- Table: booking_time_logs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_time_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    action ENUM('start', 'pause', 'resume', 'stop', 'auto_pause') NOT NULL,
    timestamp DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_timestamp (timestamp)
);

-- -----------------------------------------------------
-- Table: booking_photos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id)
);

-- -----------------------------------------------------
-- Table: job_photos (Before/After photos)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS job_photos (
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
);

-- -----------------------------------------------------
-- Table: provider_reviews
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL UNIQUE,
    provider_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT NOT NULL,
    review TEXT,
    is_anonymous TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_provider (provider_id),
    INDEX idx_customer (customer_id)
);

-- -----------------------------------------------------
-- Table: invoices
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
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
);

-- -----------------------------------------------------
-- Table: mobile_auth_users (Mobile app auth & push tokens)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mobile_auth_users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- Link to either a customer or a provider (one will be set)
    user_id INT DEFAULT NULL,
    provider_id INT DEFAULT NULL,

    -- Discriminator
    user_type ENUM('customer', 'provider') NOT NULL,

    -- JWT / session refresh token
    refresh_token VARCHAR(512) DEFAULT NULL,
    refresh_token_expires DATETIME DEFAULT NULL,

    -- Expo push notification token
    push_token TEXT DEFAULT NULL,
    push_token_platform ENUM('ios', 'android', 'web') DEFAULT NULL,
    push_token_updated_at DATETIME DEFAULT NULL,

    -- Device info
    device_id VARCHAR(255) DEFAULT NULL,
    device_name VARCHAR(255) DEFAULT NULL,
    device_platform ENUM('ios', 'android', 'web') DEFAULT NULL,
    os_version VARCHAR(50) DEFAULT NULL,
    app_version VARCHAR(50) DEFAULT NULL,

    -- Status & session tracking
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

    -- One record per user/provider per device
    UNIQUE KEY uq_user_device (user_id, device_id),
    UNIQUE KEY uq_provider_device (provider_id, device_id)
);

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample service categories
INSERT INTO service_categories (name, slug, icon, description, display_order) VALUES
('Plumbing', 'plumbing', '🔧', 'Expert plumbing services for your home', 1),
('Electrical', 'electrical', '⚡', 'Licensed electricians for all your needs', 2),
('Carpentry', 'carpentry', '🔨', 'Professional carpentry and woodworking', 3),
('Cleaning', 'cleaning', '🧹', 'Deep cleaning and maintenance services', 4),
('Painting', 'painting', '🎨', 'Interior and exterior painting', 5),
('Moving', 'moving', '📦', 'Professional moving and packing services', 6);

-- Insert sample services
INSERT INTO services (category_id, name, slug, description, base_price, duration_minutes, is_homepage, is_trending) VALUES
(1, 'Leaky Faucet Repair', 'leaky-faucet-repair', 'Fix that annoying dripping faucet', 89.99, 60, 1, 1),
(1, 'Toilet Installation', 'toilet-installation', 'Professional toilet installation', 199.99, 120, 0, 1),
(2, 'Light Fixture Installation', 'light-fixture-installation', 'Install new light fixtures', 79.99, 60, 1, 1),
(2, 'Outlet Repair', 'outlet-repair', 'Fix faulty electrical outlets', 69.99, 45, 0, 0),
(3, 'Cabinet Repair', 'cabinet-repair', 'Fix broken cabinet doors and drawers', 99.99, 90, 0, 1),
(4, 'Deep Clean', 'deep-clean', 'Comprehensive home cleaning', 149.99, 180, 1, 1);

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get pending providers with document counts
SELECT 
    sp.id, sp.name, sp.email, sp.status,
    COUNT(pd.id) as total_docs,
    SUM(CASE WHEN pd.status = 'pending' THEN 1 ELSE 0 END) as pending_docs,
    SUM(CASE WHEN pd.status = 'approved' THEN 1 ELSE 0 END) as approved_docs,
    SUM(CASE WHEN pd.status = 'rejected' THEN 1 ELSE 0 END) as rejected_docs
FROM service_providers sp
LEFT JOIN provider_documents pd ON sp.id = pd.provider_id
WHERE sp.status = 'pending'
GROUP BY sp.id;

-- Get provider details with latest document per type
SELECT 
    pd1.*
FROM provider_documents pd1
INNER JOIN (
    SELECT provider_id, document_type, MAX(created_at) as max_created
    FROM provider_documents
    GROUP BY provider_id, document_type
) pd2 ON pd1.provider_id = pd2.provider_id 
    AND pd1.document_type = pd2.document_type 
    AND pd1.created_at = pd2.max_created
WHERE pd1.provider_id = ?;

-- Get booking details with provider and customer info
SELECT 
    b.*,
    sp.name as provider_name,
    sp.phone as provider_phone,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
    u.email as customer_email
FROM bookings b
LEFT JOIN service_providers sp ON b.provider_id = sp.id
LEFT JOIN users u ON b.user_id = u.id
WHERE b.id = ?;

-- Get provider earnings summary
SELECT 
    sp.id,
    sp.name,
    COUNT(b.id) as total_jobs,
    SUM(b.final_provider_amount) as total_earnings,
    AVG(pr.rating) as avg_rating
FROM service_providers sp
LEFT JOIN bookings b ON sp.id = b.provider_id AND b.status = 'completed'
LEFT JOIN provider_reviews pr ON sp.id = pr.provider_id
GROUP BY sp.id;

-- =====================================================
-- INDEX SUMMARY
-- =====================================================
-- users: idx_role
-- services: idx_is_active
-- service_providers: idx_city, idx_status, idx_onboarding_step, idx_stripe_account, idx_email_verified
-- provider_documents: idx_provider, idx_status, idx_is_verified
-- provider_bank_accounts: idx_provider, idx_stripe_account, idx_account_status
-- bookings: idx_user, idx_provider, idx_status, idx_job_date, idx_job_timer_status, idx_customer_email
-- booking_status_history: idx_booking, idx_created_at
-- booking_time_logs: idx_booking, idx_timestamp
-- booking_photos: idx_booking
-- job_photos: idx_booking, idx_photo_type, idx_uploaded_by
-- provider_reviews: idx_provider, idx_customer
-- invoices: idx_booking, idx_user, idx_provider, idx_status

-- =====================================================
-- LIVE ENVIRONMENT FIXES (Apply manually to production)
-- =====================================================

-- Fix for "Unknown column 'email_verification_token'"
-- ALTER TABLE service_providers 
-- ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
-- ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS email_verification_expires DATETIME,
-- ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 1,
-- ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
-- ADD COLUMN IF NOT EXISTS documents_uploaded BOOLEAN DEFAULT FALSE,
-- ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT FALSE,
-- ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
-- ADD COLUMN IF NOT EXISTS approved_by INT,
-- ADD COLUMN IF NOT EXISTS approved_at DATETIME,
-- ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
-- ADD COLUMN IF NOT EXISTS service_areas JSON,
-- ADD COLUMN IF NOT EXISTS skills JSON;
