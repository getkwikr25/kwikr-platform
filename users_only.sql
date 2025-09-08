-- Test import with 3 real workers from Excel data

INSERT OR IGNORE INTO users (
    id, email, password_hash, role, first_name, last_name, 
    phone, province, city, is_verified, is_active, created_at
) VALUES 
(1000, 'plumbingambulanceca@gmail.com', 'hash1', 'worker', 'Plumbing', 'Ambulance Inc', '6475679102', 'Ontario', 'Mississauga', 1, 1, datetime('now')),
