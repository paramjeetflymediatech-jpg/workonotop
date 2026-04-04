-- Migration: Advanced Account Deletion Status (Standard Syntax)
-- Adds status and deletion tracking to users and service_providers tables.

-- 1. Update users table with status and deletion_requested_at
ALTER TABLE users 
ADD COLUMN status ENUM('active', 'pending_deletion', 'deleted') DEFAULT 'active' AFTER role,
ADD COLUMN deletion_requested_at TIMESTAMP NULL DEFAULT NULL AFTER status;

-- 2. Update service_providers table with pending_deletion status and deletion_requested_at
ALTER TABLE service_providers 
MODIFY COLUMN status ENUM('active', 'inactive', 'pending', 'rejected', 'suspended', 'pending_deletion', 'deleted') DEFAULT 'pending',
ADD COLUMN deletion_requested_at TIMESTAMP NULL DEFAULT NULL AFTER status;

-- 3. Add index for deletion cleanup script
CREATE INDEX idx_user_deletion ON users(status, deletion_requested_at);
CREATE INDEX idx_provider_deletion ON service_providers(status, deletion_requested_at);
