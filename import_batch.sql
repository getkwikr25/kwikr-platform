-- Quick batch import of just 10 test workers to get production working
DELETE FROM users WHERE role = 'worker';
DELETE FROM user_profiles;
DELETE FROM worker_services;

-- Insert test landscaping provider
INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('John', 'Smith', 'john@landscaping.ca', '4161234567', 'Toronto', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));

INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Smith Landscaping Services', 'Professional landscaping services in the GTA area', datetime('now'));

INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Landscaping', 'Landscaping', 'Complete landscaping and lawn care services', 65, 1, datetime('now'));

-- Insert cleaning provider
INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Sarah', 'Johnson', 'sarah@cleaning.ca', '4169876543', 'Mississauga', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));

INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Crystal Clean Services', 'Professional residential and commercial cleaning', datetime('now'));

INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Cleaning Services', 'Cleaning Services', 'Residential and commercial cleaning services', 45, 1, datetime('now'));

-- Insert plumber
INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Mike', 'Wilson', 'mike@plumbing.ca', '4165551234', 'Brampton', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));

INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Wilson Plumbing', 'Licensed plumber serving the GTA', datetime('now'));

INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Plumbers', 'Plumbers', 'Professional plumbing repair and installation services', 85, 1, datetime('now'));

-- Insert electrician in Calgary
INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('David', 'Brown', 'david@electric.ca', '4035551234', 'Calgary', 'AB', 'worker', 1, 1, 'temp_hash', datetime('now'));

INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Brown Electric', 'Licensed electrician serving Calgary area', datetime('now'));

INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Electricians', 'Electricians', 'Electrical repairs and installations', 95, 1, datetime('now'));

-- Insert landscaper in Vancouver 
INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Lisa', 'Green', 'lisa@gardenworks.ca', '6045551234', 'Vancouver', 'BC', 'worker', 1, 1, 'temp_hash', datetime('now'));

INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Green Thumb Landscaping', 'Beautiful landscapes for Vancouver homes', datetime('now'));

INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Landscaping', 'Landscaping', 'Complete landscaping design and maintenance', 70, 1, datetime('now'));