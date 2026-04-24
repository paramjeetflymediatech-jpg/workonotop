-- Migration: Create System Settings Table
-- Description: Creates a key-value store for global application settings (e.g., default commission).

CREATE TABLE IF NOT EXISTS `system_settings` (
    `key` VARCHAR(191) PRIMARY KEY,
    `value` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default commission (initial fallback)
INSERT INTO `system_settings` (`key`, `value`) 
VALUES ('default_commission', '5')
ON DUPLICATE KEY UPDATE `value` = `value`;
