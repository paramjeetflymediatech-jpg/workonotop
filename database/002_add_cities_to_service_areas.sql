-- Migration to add 'cities' column to the 'service_areas' table
-- Run this on your live database to fix the "Unknown column 'cities'" error in the Admin panel.

ALTER TABLE service_areas 
ADD COLUMN cities JSON AFTER is_active;
