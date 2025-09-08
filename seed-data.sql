-- Kwikr Platform Seed Data
-- Sample data for production database

-- Insert job categories
INSERT OR REPLACE INTO job_categories (id, name, description, icon_class, is_active) VALUES
(1, 'Construction', 'General construction and building work', 'fas fa-hard-hat', 1),
(2, 'Plumbing', 'Plumbing installation and repair', 'fas fa-wrench', 1),
(3, 'Electrical', 'Electrical installation and maintenance', 'fas fa-bolt', 1),
(4, 'HVAC', 'Heating, ventilation, and air conditioning', 'fas fa-fan', 1),
(5, 'Landscaping', 'Lawn care and landscaping services', 'fas fa-seedling', 1),
(6, 'Cleaning', 'Residential and commercial cleaning', 'fas fa-broom', 1),
(7, 'Moving', 'Moving and relocation services', 'fas fa-truck', 1),
(8, 'Handyman', 'General maintenance and repairs', 'fas fa-tools', 1),
(9, 'Painting', 'Interior and exterior painting', 'fas fa-paint-roller', 1),
(10, 'Roofing', 'Roof installation and repair', 'fas fa-home', 1),
(11, 'Flooring', 'Flooring installation and refinishing', 'fas fa-layer-group', 1),
(12, 'Carpentry', 'Custom carpentry and woodwork', 'fas fa-hammer', 1);

-- Insert sample users (workers and clients)
INSERT OR REPLACE INTO users (id, email, first_name, last_name, phone, role, province, city, is_verified, is_active) VALUES
(1, 'admin@kwikr.ca', 'Admin', 'User', '+1-416-555-0001', 'admin', 'ON', 'Toronto', 1, 1),
(2, 'john.client@example.com', 'John', 'Anderson', '+1-416-555-0100', 'client', 'ON', 'Toronto', 1, 1),
(3, 'sarah.client@example.com', 'Sarah', 'Thompson', '+1-604-555-0101', 'client', 'BC', 'Vancouver', 1, 1),
(4, 'mike.client@example.com', 'Mike', 'Roberts', '+1-403-555-0102', 'client', 'AB', 'Calgary', 1, 1),
(5, 'john.smith@example.com', 'John', 'Smith', '+1-416-555-0201', 'worker', 'ON', 'Toronto', 1, 1),
(6, 'maria.gonzalez@example.com', 'Maria', 'Gonzalez', '+1-604-555-0202', 'worker', 'BC', 'Vancouver', 1, 1),
(7, 'david.brown@example.com', 'David', 'Brown', '+1-403-555-0203', 'worker', 'AB', 'Calgary', 1, 1),
(8, 'lisa.wilson@example.com', 'Lisa', 'Wilson', '+1-416-555-0204', 'worker', 'ON', 'Ottawa', 1, 1),
(9, 'carlos.martinez@example.com', 'Carlos', 'Martinez', '+1-514-555-0205', 'worker', 'QC', 'Montreal', 1, 1),
(10, 'jennifer.davis@example.com', 'Jennifer', 'Davis', '+1-902-555-0206', 'worker', 'NS', 'Halifax', 1, 1);

-- Insert user profiles
INSERT OR REPLACE INTO user_profiles (user_id, bio, company_name, company_description, website_url, years_in_business) VALUES
(5, 'Licensed plumber with 10+ years of experience in residential and commercial projects.', 'Smith Plumbing Services', 'Professional plumbing services for Toronto and GTA', 'https://smithplumbing.ca', 10),
(6, 'Professional cleaning service specializing in post-construction cleanup.', 'Sparkle Clean Vancouver', 'Eco-friendly cleaning services for homes and offices', 'https://sparklevan.ca', 8),
(7, 'Certified electrician with expertise in smart home installations.', 'Brown Electric Solutions', 'Modern electrical solutions for residential and commercial', 'https://brownelectric.ca', 12),
(8, 'Experienced handyman providing general maintenance and repair services.', 'Wilson Home Services', 'Complete home maintenance and repair solutions', NULL, 15),
(9, 'Expert landscaper specializing in sustainable garden design.', 'Verde Landscaping', 'Sustainable landscaping and garden design services', 'https://verdelandscape.ca', 7),
(10, 'Professional painter with expertise in both interior and exterior projects.', 'Maritime Painting Co.', 'Quality painting services for Atlantic Canada', NULL, 9);

-- Insert worker services
INSERT OR REPLACE INTO worker_services (user_id, service_category, service_name, description, hourly_rate, is_available, years_experience) VALUES
-- John Smith (Plumbing)
(5, 'Plumbing', 'Residential Plumbing', 'Complete residential plumbing services including installation and repairs', 75.00, 1, 10),
(5, 'Plumbing', 'Emergency Repairs', '24/7 emergency plumbing repair services', 120.00, 1, 10),
-- Maria Gonzalez (Cleaning)
(6, 'Cleaning', 'Commercial Cleaning', 'Professional commercial and office cleaning services', 45.00, 1, 8),
(6, 'Cleaning', 'Post-Construction Cleanup', 'Specialized post-construction and renovation cleanup', 55.00, 1, 8),
-- David Brown (Electrical)
(7, 'Electrical', 'Residential Electrical', 'Electrical installations and maintenance for homes', 85.00, 1, 12),
(7, 'Electrical', 'Smart Home Setup', 'Smart home automation and device installation', 95.00, 1, 5),
-- Lisa Wilson (Handyman)
(8, 'Handyman', 'General Repairs', 'General home maintenance and repair services', 65.00, 1, 15),
(8, 'Handyman', 'Furniture Assembly', 'Professional furniture assembly and installation', 50.00, 1, 15),
-- Carlos Martinez (Landscaping)
(9, 'Landscaping', 'Landscaping Services', 'Complete landscaping design and installation', 60.00, 1, 7),
(9, 'Landscaping', 'Garden Design', 'Custom sustainable garden design and planning', 70.00, 1, 7),
(9, 'Landscaping', 'Lawn Care', 'Regular lawn maintenance and seasonal care', 40.00, 1, 7),
-- Jennifer Davis (Painting)
(10, 'Painting', 'Interior Painting', 'Professional interior painting for homes and offices', 55.00, 1, 9),
(10, 'Painting', 'Exterior Painting', 'Exterior house painting and staining services', 65.00, 1, 9);

-- Insert worker service areas
INSERT OR REPLACE INTO worker_service_areas (user_id, area_name, is_active) VALUES
(5, 'Toronto', 1),
(5, 'Mississauga', 1),
(5, 'Brampton', 1),
(5, 'Markham', 1),
(6, 'Vancouver', 1),
(6, 'Burnaby', 1),
(6, 'Richmond', 1),
(6, 'Surrey', 1),
(7, 'Calgary', 1),
(7, 'Airdrie', 1),
(7, 'Cochrane', 1),
(8, 'Ottawa', 1),
(8, 'Gatineau', 1),
(8, 'Kanata', 1),
(9, 'Montreal', 1),
(9, 'Laval', 1),
(9, 'Longueuil', 1),
(10, 'Halifax', 1),
(10, 'Dartmouth', 1),
(10, 'Bedford', 1);

-- Insert worker hours (Monday to Friday, 9 AM to 5 PM for most workers)
INSERT OR REPLACE INTO worker_hours (user_id, day_of_week, is_open, open_time, close_time) VALUES
-- John Smith (Plumbing) - Available 7 days with emergency hours
(5, 1, 1, '07:00', '18:00'), -- Monday
(5, 2, 1, '07:00', '18:00'), -- Tuesday
(5, 3, 1, '07:00', '18:00'), -- Wednesday
(5, 4, 1, '07:00', '18:00'), -- Thursday
(5, 5, 1, '07:00', '18:00'), -- Friday
(5, 6, 1, '08:00', '16:00'), -- Saturday
(5, 0, 1, '09:00', '15:00'), -- Sunday (emergency only)
-- Maria Gonzalez (Cleaning) - Regular business hours
(6, 1, 1, '08:00', '17:00'), -- Monday
(6, 2, 1, '08:00', '17:00'), -- Tuesday
(6, 3, 1, '08:00', '17:00'), -- Wednesday
(6, 4, 1, '08:00', '17:00'), -- Thursday
(6, 5, 1, '08:00', '17:00'), -- Friday
(6, 6, 1, '09:00', '14:00'), -- Saturday
(6, 0, 0, NULL, NULL), -- Sunday (closed)
-- David Brown (Electrical) - Standard contractor hours
(7, 1, 1, '07:30', '17:30'), -- Monday
(7, 2, 1, '07:30', '17:30'), -- Tuesday
(7, 3, 1, '07:30', '17:30'), -- Wednesday
(7, 4, 1, '07:30', '17:30'), -- Thursday
(7, 5, 1, '07:30', '17:30'), -- Friday
(7, 6, 1, '08:00', '15:00'), -- Saturday
(7, 0, 0, NULL, NULL), -- Sunday (closed)
-- Lisa Wilson (Handyman) - Flexible hours
(8, 1, 1, '08:00', '18:00'), -- Monday
(8, 2, 1, '08:00', '18:00'), -- Tuesday
(8, 3, 1, '08:00', '18:00'), -- Wednesday
(8, 4, 1, '08:00', '18:00'), -- Thursday
(8, 5, 1, '08:00', '18:00'), -- Friday
(8, 6, 1, '09:00', '17:00'), -- Saturday
(8, 0, 1, '10:00', '15:00'), -- Sunday
-- Carlos Martinez (Landscaping) - Seasonal hours
(9, 1, 1, '07:00', '17:00'), -- Monday
(9, 2, 1, '07:00', '17:00'), -- Tuesday
(9, 3, 1, '07:00', '17:00'), -- Wednesday
(9, 4, 1, '07:00', '17:00'), -- Thursday
(9, 5, 1, '07:00', '17:00'), -- Friday
(9, 6, 1, '07:00', '15:00'), -- Saturday
(9, 0, 0, NULL, NULL), -- Sunday (closed)
-- Jennifer Davis (Painting) - Standard hours
(10, 1, 1, '08:00', '16:00'), -- Monday
(10, 2, 1, '08:00', '16:00'), -- Tuesday
(10, 3, 1, '08:00', '16:00'), -- Wednesday
(10, 4, 1, '08:00', '16:00'), -- Thursday
(10, 5, 1, '08:00', '16:00'), -- Friday
(10, 6, 1, '09:00', '14:00'), -- Saturday
(10, 0, 0, NULL, NULL); -- Sunday (closed)

-- Insert feature flags
INSERT OR REPLACE INTO feature_flags (feature_name, is_enabled, description) VALUES
('chatbot_enabled', 1, 'Enable/disable the chatbot feature'),
('new_user_registration', 1, 'Allow new user registrations'),
('job_posting', 1, 'Allow clients to post new jobs'),
('worker_applications', 1, 'Allow workers to apply for jobs'),
('review_system', 1, 'Enable review and rating system'),
('payment_processing', 0, 'Enable payment processing features'),
('mobile_app_api', 1, 'Enable mobile app API endpoints'),
('email_notifications', 1, 'Send email notifications'),
('sms_notifications', 0, 'Send SMS notifications'),
('advanced_search', 1, 'Enable advanced search filters');

-- Insert sample jobs
INSERT OR REPLACE INTO jobs (id, client_id, title, description, category_id, budget_min, budget_max, location, province, city, status) VALUES
(1, 2, 'Kitchen Plumbing Installation', 'Need a licensed plumber to install new kitchen sink and dishwasher connections', 2, 500.00, 1000.00, 'Toronto, ON', 'ON', 'Toronto', 'open'),
(2, 3, 'Office Cleaning Service', 'Looking for weekly cleaning service for a 2000 sq ft office space', 6, 200.00, 400.00, 'Vancouver, BC', 'BC', 'Vancouver', 'open'),
(3, 4, 'Backyard Landscaping Project', 'Complete backyard makeover including lawn, garden beds, and patio area', 5, 3000.00, 8000.00, 'Calgary, AB', 'AB', 'Calgary', 'open'),
(4, 2, 'Living Room Painting', 'Interior painting for living room and dining room areas', 9, 800.00, 1500.00, 'Toronto, ON', 'ON', 'Toronto', 'open'),
(5, 3, 'Electrical Outlet Installation', 'Install 6 new electrical outlets in home office and basement', 3, 300.00, 600.00, 'Vancouver, BC', 'BC', 'Vancouver', 'open');

-- Insert sample bids
INSERT OR REPLACE INTO bids (job_id, worker_id, bid_amount, message, status) VALUES
(1, 5, 750.00, 'I can complete this kitchen plumbing work professionally. 10+ years experience, fully licensed and insured.', 'pending'),
(2, 6, 320.00, 'Weekly office cleaning service available. Eco-friendly products and flexible scheduling.', 'pending'),
(3, 9, 5500.00, 'Complete landscaping design and installation. Includes 3D design mockup and 2-year plant warranty.', 'pending'),
(4, 10, 1200.00, 'Professional interior painting with premium paint. Color consultation included.', 'pending'),
(5, 7, 450.00, 'Licensed electrician. Can install outlets with proper permits and code compliance.', 'pending');

-- Insert sample reviews
INSERT OR REPLACE INTO reviews (reviewer_id, reviewee_id, job_id, rating, comment) VALUES
(2, 5, NULL, 5, 'Excellent plumbing work! John was professional, on time, and cleaned up after the job.'),
(3, 6, NULL, 4, 'Great cleaning service. Very thorough and reliable. Would recommend to others.'),
(4, 9, NULL, 5, 'Amazing landscaping transformation! Carlos exceeded our expectations with the design.'),
(2, 10, NULL, 4, 'Good painting job. Jennifer was detailed and the finish looks great.'),
(3, 7, NULL, 5, 'David did excellent electrical work. Very knowledgeable and explained everything clearly.');