-- Test import with 3 real workers from Excel data

INSERT OR IGNORE INTO users (
    id, email, password_hash, role, first_name, last_name, 
    phone, province, city, is_verified, is_active, created_at
) VALUES 
(1000, 'plumbingambulanceca@gmail.com', 'hash1', 'worker', 'Plumbing', 'Ambulance Inc', '6475679102', 'Ontario', 'Mississauga', 1, 1, datetime('now')),
(1001, 'Dylan@epicplumbingandheating.ca', 'hash2', 'worker', 'Epic', 'Plumbing', '6047402171', 'British Columbia', 'Vancouver', 1, 1, datetime('now')),
(1002, 'sales@drainmastertrenchless.com', 'hash3', 'worker', 'Drain', 'Master', '6044230177', 'British Columbia', 'Burnaby', 1, 1, datetime('now'));

INSERT OR IGNORE INTO user_profiles (
    user_id, company_name, company_description, created_at
) VALUES 
(1000, 'Plumbing Ambulance Inc', 'Fast, reliable emergency plumbing services across the GTA', datetime('now')),
(1001, 'Epic Plumbing and Heating', 'Professional plumbing and heating services', datetime('now')),
(1002, 'Drain Master Trenchless', 'Trenchless drain repair specialists', datetime('now'));

INSERT OR IGNORE INTO worker_services (
    user_id, service_category, service_name, description, is_available, created_at
) VALUES 
(1000, 'Plumbing', 'Emergency Plumbing Services', 'Fast emergency plumbing repair', 1, datetime('now')),
(1001, 'Plumbing', 'Plumbing and Heating', 'Comprehensive plumbing solutions', 1, datetime('now')),
(1002, 'Plumbing', 'Drain Repair Services', 'Trenchless sewer and drain repair', 1, datetime('now'));