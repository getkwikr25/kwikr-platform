-- Fix Search & Discovery Database Schema Issues
-- Add missing columns to support the new search system

-- 1. Add parent_category_id to job_categories for hierarchical browsing
ALTER TABLE job_categories ADD COLUMN parent_category_id INTEGER REFERENCES job_categories(id);

-- 2. Add subscription tier columns to users table for featured workers
ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN featured_until DATETIME;

-- 3. Add search-related columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN avg_rating REAL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN review_count INTEGER DEFAULT 0;

-- 4. Insert some sample hierarchical categories
INSERT OR IGNORE INTO job_categories (name, description, parent_category_id, icon_class, is_active) VALUES
-- Main categories (parent_category_id = NULL)
('Home Services', 'General home maintenance and repair services', NULL, 'fas fa-home', 1),
('Professional Services', 'Business and professional service providers', NULL, 'fas fa-briefcase', 1),
('Cleaning & Maintenance', 'Cleaning and maintenance services', NULL, 'fas fa-broom', 1),

-- Sub-categories under Home Services
('Plumbing', 'Professional plumbing services', 1, 'fas fa-wrench', 1),
('Electrical', 'Licensed electrical services', 1, 'fas fa-bolt', 1),
('HVAC', 'Heating, ventilation, and air conditioning', 1, 'fas fa-fan', 1),
('Carpentry', 'Custom carpentry and woodworking', 1, 'fas fa-hammer', 1),

-- Sub-categories under Cleaning & Maintenance  
('House Cleaning', 'Residential cleaning services', 3, 'fas fa-home', 1),
('Commercial Cleaning', 'Office and commercial cleaning', 3, 'fas fa-building', 1),
('Deep Cleaning', 'Intensive deep cleaning services', 3, 'fas fa-sparkles', 1);

-- 5. Update existing categories to have proper hierarchy
UPDATE job_categories SET parent_category_id = 3 WHERE name IN ('Cleaning Services', 'Cleaning');
UPDATE job_categories SET parent_category_id = 1 WHERE name IN ('Plumbers', 'Electricians', 'HVAC Services', 'General Contractor', 'Flooring', 'Roofing');
UPDATE job_categories SET parent_category_id = 2 WHERE name IN ('Landscaping', 'Painters', 'Handyman');

-- 6. Create some sample users with different subscription tiers
INSERT OR IGNORE INTO users (first_name, last_name, email, phone, role, city, province, is_verified, subscription_tier, is_featured) VALUES
('Sarah', 'Johnson', 'sarah@cleanpro.ca', '416-555-0101', 'worker', 'Toronto', 'ON', 1, 'professional', 1),
('Mike', 'Thompson', 'mike@mikeplumbing.ca', '416-555-0102', 'worker', 'Toronto', 'ON', 1, 'premium', 1),
('Lisa', 'Chen', 'lisa@sparkclean.ca', '416-555-0103', 'worker', 'Toronto', 'ON', 1, 'free', 0),
('David', 'Rodriguez', 'david@electricpro.ca', '416-555-0104', 'worker', 'Toronto', 'ON', 1, 'professional', 1),
('Jennifer', 'Wilson', 'jen@hvacexperts.ca', '416-555-0105', 'worker', 'Toronto', 'ON', 0, 'free', 0);

-- 7. Create worker services for the sample users
INSERT OR IGNORE INTO worker_services (user_id, service_category, service_name, description, hourly_rate, years_experience, is_available) VALUES
(1, 'House Cleaning', 'Residential House Cleaning', 'Complete home cleaning including all rooms, bathrooms, and kitchens', 45, 8, 1),
(1, 'Deep Cleaning', 'Move-in/Move-out Cleaning', 'Thorough cleaning for moving situations', 55, 8, 1),
(2, 'Plumbing', 'General Plumbing Services', 'Repairs, installations, and maintenance', 85, 12, 1),
(2, 'Plumbing', 'Emergency Plumbing', '24/7 emergency plumbing services', 120, 12, 1),
(3, 'House Cleaning', 'Basic House Cleaning', 'Standard house cleaning service', 35, 3, 1),
(4, 'Electrical', 'Residential Electrical Services', 'Wiring, outlets, and electrical repairs', 75, 6, 1),
(5, 'HVAC', 'HVAC Maintenance', 'Heating and cooling system maintenance', 65, 4, 1);

-- 8. Update user profiles with ratings and reviews
INSERT OR IGNORE INTO user_profiles (user_id, bio, avg_rating, review_count) VALUES
(1, 'Professional cleaning service with 8 years experience. Fully insured and bonded.', 4.8, 127),
(2, 'Licensed master plumber serving Toronto area. Available 24/7 for emergencies.', 4.9, 89),
(3, 'Reliable and affordable cleaning services for busy families.', 4.3, 45),
(4, 'Licensed electrician specializing in residential electrical work.', 4.7, 62),
(5, 'HVAC technician providing maintenance and repair services.', 4.2, 23);

-- 9. Update existing profiles if they exist
UPDATE user_profiles SET avg_rating = 4.8, review_count = 127 WHERE user_id = 1;
UPDATE user_profiles SET avg_rating = 4.9, review_count = 89 WHERE user_id = 2;
UPDATE user_profiles SET avg_rating = 4.3, review_count = 45 WHERE user_id = 3;
UPDATE user_profiles SET avg_rating = 4.7, review_count = 62 WHERE user_id = 4;
UPDATE user_profiles SET avg_rating = 4.2, review_count = 23 WHERE user_id = 5;