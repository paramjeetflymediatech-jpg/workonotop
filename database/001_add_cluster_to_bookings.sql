-- Migration to add 'cluster' column to the 'bookings' table
-- Run this on your live database to fix the "Unknown column 'b.cluster'" error.

ALTER TABLE bookings 
ADD COLUMN cluster VARCHAR(100) AFTER longitude;
