-- Migration: User and Provider Settings Columns
-- Adds missing settings columns to users and service_providers tables.

-- 1. Update users table
ALTER TABLE users 
ADD COLUMN push_notifications_enabled TINYINT(1) DEFAULT 1 AFTER receive_offers,
ADD COLUMN booking_reminders_enabled TINYINT(1) DEFAULT 1 AFTER push_notifications_enabled,
ADD COLUMN dark_mode_enabled TINYINT(1) DEFAULT 0 AFTER booking_reminders_enabled;

-- 2. Update service_providers table
ALTER TABLE service_providers 
ADD COLUMN push_notifications_enabled TINYINT(1) DEFAULT 1 AFTER status,
ADD COLUMN booking_reminders_enabled TINYINT(1) DEFAULT 1 AFTER push_notifications_enabled,
ADD COLUMN dark_mode_enabled TINYINT(1) DEFAULT 0 AFTER booking_reminders_enabled,
ADD COLUMN receive_offers TINYINT(1) DEFAULT 0 AFTER dark_mode_enabled;
