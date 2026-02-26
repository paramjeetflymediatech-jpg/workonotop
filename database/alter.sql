ALTER TABLE service_providers 
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expiry DATETIME NULL;






-- Add Stripe payment fields to bookings table
ALTER TABLE bookings 
ADD COLUMN payment_intent_id VARCHAR(255) NULL AFTER after_photos_uploaded,
ADD COLUMN payment_status ENUM('pending', 'authorized', 'paid', 'failed', 'refunded') DEFAULT 'pending' AFTER payment_intent_id,
ADD COLUMN payment_method VARCHAR(50) NULL AFTER payment_status,
ADD COLUMN stripe_customer_id VARCHAR(255) NULL AFTER payment_method;