-- Clear existing data
DELETE FROM users WHERE role = 'worker';
DELETE FROM user_profiles;
DELETE FROM worker_services;

-- Insert users
INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('plumbingambulanceca@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info.kodiakplumbing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lethbridge, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@drainmastertrenchless.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Dylan@epicplumbingandheating.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Parksville, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@randbplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales.ezflowplumbing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Bracebridge, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('directplumbing@rogers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@durhampioneerplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oshawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('helloplumber@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fredericton, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kpearce@kalwest.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@instantplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@perfectionplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@saskrooterman.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mdplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lynden, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plomberiedaniellalonde.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Marthe-sur-le-Lac, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@tek-plumbing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Grande Prairie, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plomberieericlalonde.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Blainville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('harpersplumbingyyc@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('magnumplumbing@shaw.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Victoria, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('reception@capitalplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('drainproottawainc@bellnet.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nepean, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@miketheplumber.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cambridge, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('plomberieleducinc@videotron.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Châteauguay, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@redsealplumbing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('crawfordtheplumber@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Wasaga Beach, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@baumanns.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Medicine Hat, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@abmech.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plumbernearmeinc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Georgetown, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mcph.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Estevan, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('chinookplumbingltd@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@archiehorn-son.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('daubie@eaglesnestgolf.comEAGLESNESTGOLF.COM', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('newmarket@mtdrain.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@westbaymechanical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nanaimo, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@globalsewer.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Concord, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('plomberie@pcsh.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Hyacinthe, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('recevables@plomberie.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('trustitplumbing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('bou2@telus.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Rocky Mountain House, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kelly@kitsplumbingandheating.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@plomberiedelacapitale.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in L'Ancienne-Lorette, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@precision-plumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@urbanph.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('drainexpertsplumbing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brampton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@appleplumbingandheating.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@aeair.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Medicine Hat, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('fowlerplumbing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Windsor, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('heartlandgoc@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sherwood Park, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@khairabros.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimation@plomberiesevigny.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Val-d'Or, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('briggsplumbingandheating@bellnet.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Keswick, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('plomberieml2017@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Napierville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('n.beauchamp@alplomberie.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('excelltd@mts.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@southsurreyplumbing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@blueseaplumbing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plomberie117nord.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Malartic, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('plomberie.jd@sympatico.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mascouche, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('david@a3plumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nelson, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@milesplumbing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Victoria, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@linkplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Office@firstklass.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('generaloffice@valleyplumbingandheating.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('theplumberguysic@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sicamous, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sjacques@brassmecanique.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jimmysanterre1983@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beloeil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@drainapro.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sept-Iles, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('christian@plomberiesecours.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Catherine-de-la-Jacques-Cartier, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@forhireplumbing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Gatineau, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@plomberiegariepy.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Whitehorse, YT', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@castlesudbury.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jm.jmplumbing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Greater Sudbury, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('flowmastermechanical@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kenora, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ritewayplumbingltd@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('PLOMBERIERIVESUDINC@GMAIL.COM', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Steve@stevesplumbingandheating.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Bécancour, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('gerrypeters009@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sherwood Park, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('markedwardsplumbingltd@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Medicine Hat, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@universalsheetmetal.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Peterborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@guildwoodroofing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saanichton, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@focusroofingab.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@toiturejfl.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('harold@dwightsroofing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beauharnois, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('andycoteracicot@toiturespg.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('AmberBencharski@AlbertaStrongRoofing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mirabel, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lakeviewroofing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kingston@rydel.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kingsville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@toituresrmartin.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kingston, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ferblanteriedelest.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@nelsonroofing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Pascal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('reception@couvertures-monteregiennes.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cumberland, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@platinumroofingsk.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Jean-Baptiste, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dowle@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Regina, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('r.burkholder@tuffexteriors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Guelph, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mikeroofpg@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lumsden, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@ridgelinecorp.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Prince George, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@cornwallsidingltd.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Prince George, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('john@jdwoodrevival.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cornwall, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@royal-roofing-ltd.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Wellandport, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@actionroofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@integrityroofers.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('centralroofing@eastlink.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@toituresthermotech.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Halifax, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jbreidenbach@tremcoinc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Charette, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('customersroofing@yahoo.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in East York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('accurateroofingns@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cambridge, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('serviceca@aclark.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hammonds Plains, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@stybek.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('newheightsroofingandexteriors@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kitchener, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('metalshop@transconaroofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@roofsofsteel.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('pbussell@londonecoroof.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Gower, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@toitureshogue.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nepean, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('infobelmarroofing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Blainville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('reception@templemetalroofs.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cambridge, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@greatwestroof.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Grande Pointe, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('tiffany@amroofingltd.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Langley, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('advan_roofing@live.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fort McMurray, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@flatroofers.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Blind Bay, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('pontrouge.recrutement@bpcan.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Tottenham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@gerrysroofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lasalle, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@realblueroofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@torontoroofrepairs.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('toitureshp@videotron.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('aspectroofing@ymail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Jean-sur-Richelieu, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@malartech.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Uxbridge, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('yourhomeroofing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mirabel, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('roofingbin@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@centuryroofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('desisroofingwest@yahoo.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('cmarriott@marriottsroofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Binbrook, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('armyroofing@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('supertoitures@live.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Delta, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('toiture@toitureprohd.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Shawinigan, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('vente@toituresummum.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Shawinigan, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('excavationportneuf@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Adolphe-d'Howard, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@selecttoiture.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Levis, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@fourcornerroofing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Levis, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('roofproplus@yahoo.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('toddroofworx@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Georgina, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Dan@dmexteriorcontracting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sutton West, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@cplusroofing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Langton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@www.unitedroofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('bcote@roofingrbm.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Sales@AllProRoofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@alfaexteriors.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@vitaroofs.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@robsqualityroofing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@royalyorkroofing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Gower, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@vandutchexteriors.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@couvreursboudreault.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Barrie, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@couvreurslaplante.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Gatineau, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estelle.caron@publi-7.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Christophe-d'Arthabaska, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('toituredelacapitale@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mirabel, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@uplandgroup.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Brigitte-de-Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('location@lachance.qc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Campbell River, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@cc-canadiancontractors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sherbrooke, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('terri.pcs@shaw.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('samantha@buildpress.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('position@laurin.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Chilliwack, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('victor.giesbrecht@century21.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('candidatures@grnordique.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@tectonici.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sept-Iles, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hr@j-concivil.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Maple, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jeremy.dumont01@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sunnyside, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mongrain.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Jean-de-la-Lande, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@technicon-ind.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mirabel, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('grant@ultimatecontracting.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Terrace, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@jbinc.org', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Canmore, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@windleycontracting.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('nboudreau@edbrunet.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nanaimo, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@maximproconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Gatineau, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimating@dawsonwallace.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brampton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@minersconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@alcorfacilities.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('shawn@alp2017.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fort McMurray, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dkuschminder@chandos.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Parkland County, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@morinvilleflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('greg@alliance-renovations.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Morinville, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('imignault@mcfinc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in East Gwillimbury, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Admin@arwestcoastcontracting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Pascal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('corpaffairs@aecon.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@redstonecontracting.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('basconst@nbnet.nb.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('inquiries@karlenkada.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Tracadie-Sheila, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimating@espositobros.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mail@peakgrp.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Bolton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@constructionpforand.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mickael@zerounzero.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('terry.castlerock@shaw.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Terrebonne, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@pvcorp.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lloydminster, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('accounts@elevationelevator.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Concord, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@canamark.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('gerald@northfieldbuilders.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Port Moody, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@newdawndevelopments.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Happy Valley-Goose Bay, NL', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@habitationsboies.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cranbrook, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@cadacon.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mont-Saint-Hilaire, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mireille.laporte@demonfort.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jturner@citycorecommercial.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Outremont, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('cdafoe@westmarkconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('advext@telus.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nanaimo, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@asselco.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Redcliff, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('reception@rapid-response-restoration.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Lambert-de-Lauzon, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mddeneigement@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@constructiongmr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Thérèse-de-Gaspé, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('PROPERTYMANAGEMENT@RENOCORPINC.CA', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Gatineau, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('adminedm@sekoconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@mjniprojects.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@contactrenovations.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fort McMurray, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('RScholtens@maple.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kirsten@revisionrenovations.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('philippe@mdgp.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('denise.riposati@millergroup.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@pluscontracting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oldcastle, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('rduplessis@constructionsjaly.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brampton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mike.noyeandnoye@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Terrebonne, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('vente@renom3.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Tyne Valley, PE', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('employment@seagatecontract.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Repentigny, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lesconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('generalinfo@prismconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('alexia@somervillecc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Delta, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('econstruction@easternconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@sparconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@northlandmaintenance.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@constructionspac.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hinton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('gonpp1@interbaun.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('queries@TAGconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edson, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@jjpenner.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Langley, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@dmccontracting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('bcladmin@bockstael.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Abbotsford, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('gadourycontracting@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mysite.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Stoney Creek, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jeff@clausencontracting.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Stoney Creek, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('bids.edmonton@eton-west.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@dawnconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('pamela@geoffscontracting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Langley Twp, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ptgeneral.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cranbrook, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimating@matra.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@maylan.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@sbtconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hawkesbury, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('moreinfo@yearroundlandscaping.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Belle River, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@dwinc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('patrick@cre-actif.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('shaneb@westradeconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beloeil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rpgencon.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@nova-construction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cranbrook, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('melanie.nolan@bradfordconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Antigonish, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('renosidentiel@gmail.com, hakimtajouaout@gmail.com , info@renosidentiel.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rightfitreno.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jack@tricityflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rjmacisaac.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kitchener, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('demarco@demarcoconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Antigonish, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('scott@holmanconstruct.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nepean, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@urquhartconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hay, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@DocksideAtlantic.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Charters Settlement, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimates@royalhomeimprovements.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fall River, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('münchen@advito.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Jobs.BC@emconservices.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Coalhurst, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@icehouseent.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Merritt, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@modernorestoration.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Airdrie, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@sema.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('webrequest@wkconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Flavie, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('bdevelopment@kenaidan.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('tinthahack@con-tech.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@arnoldconstruction.co', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@archivecontracting.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@turnerbros.ca.', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kinbencollective@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@systematic.bc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('llavigne@jcb.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@norcope.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brossard, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('techsupport@richtek.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Whitehorse, YT', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@domain.ltd', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Abbotsford, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('emresponse@bltconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oak Bluff, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@dandrskylightinstallations.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('privacyofficer@transpower.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimate@iloverenovations.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Concord, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@hendriksconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dartmouth, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@vcmanagement.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@johngordonconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('steve.bradford@cretetek.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cornwall, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('connie@frontline-contracting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Esterhazy, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@weenengeneral.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kimnadeauhaulage@eastlink.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('waterandair@nothernhomecraft.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kapuskasing, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@turnkeyrenovations.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vanderhoof, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@indigoconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dmaruska@icon-construction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@durcon.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Regina, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('killeensteve@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Pickering, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimating@kdsconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('newcastlemaint@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@vancouvergeneralcontractors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Caistor Centre, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('j.bourque@delmarconstruction.ns.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hello@mysite.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Yarmouth, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@constructiongilbertetfils.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vaudreuil-Dorion, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@cadodevelopments.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lac-Etchemin, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@constructionsipro.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lethbridge, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hivewhistler@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Trois-Rivières, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('richart@nrrenovations.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Whistler, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('richardsipd@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mitchell, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('audrius65@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Duncan, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@immoblex.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jfredericks@seagateconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Jérôme, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimates@frescoconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dartmouth, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@fatcatcontracting.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Woodbridge, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@constructionPro-Lam.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Caledonia, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('francois@laplanteconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Maskinongé, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@constructionmauricesamson.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lac-Beauport, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jfturbide@immeublestondreau.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Gérard-des-Laurentides, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('shelley@dclimited.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('courtney.keenan@k-lineconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cornwall, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@terraex.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hanwell, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@ultrarenovations.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint John, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('cegerco@cegerco.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Swift Current, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@ltlgroup.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Chicoutimi, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('team@devmaninc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Shuniah, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Shirley@kedevelopment.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@bda.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Spruce Grove, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('elwooddisposal@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('carlos@firstclassrenos.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fenelon Falls, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@menuiseriesimonfortin.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Okotoks, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@bienconstruire.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in West Brome, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sahibjeetconstruction@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Hyacinthe, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@fortsaskreno.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimates@guntherconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fort Saskatchewan, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@premiumbuiltstuctures.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fort Saskatchewan, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@bmlhomes.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lacombe County, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@gluzman.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sturgeon County, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@wesbridgeconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kitchener, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@prestalconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lethbridge, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@villellaconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Longueuil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lesentreprisesrlessard.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lasalle, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@mybasementleaks.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beloeil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@orbisgroup.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ajax, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('TY@RENOPROISLAND.CA', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Delta, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('peakperformancerenovations@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cumberland, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('craftex@craftexbuilders.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('bisson.jmb@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lloydminster, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jawadhassanzada39@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Trenton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('savage4carpentry@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ajax, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@morneautremblay.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beaverton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hnconstruction@hncon.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Siméon, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@cjyp.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kmiskelly@gaycompanylimited.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Antonin, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ann@rahnbros.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Bowmanville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@duhamelconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hanover, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('finance@g2orion.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Hyacinthe, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('nicholas@twiggtransformations.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ccscpro.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Victoria, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('constructionrenovationsauclair@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sherwood Park, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@novaxionconstruction.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lac-Beauport, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('frontend@SuperiorDesign.ltd', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in L'Ancienne-Lorette, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@furtahgc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('general@automationnow.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in West Lorne, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@surgeelektrikal.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Thunder Bay, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('cmorrison@pronghor.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in nan, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@IPEC-Systems.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Moose Jaw, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@nicolasfilteau.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@curriecreek.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Haines Junction, YT', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rkselectricinc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Chilliwack, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@encoreelectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Walkerton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@longhouseelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('gary.jackson@pyramidcorporation.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('operations@aggelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Rainbow Lake, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@auroraelectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Acheson, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('vonavolts@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contactus@hottubguys.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Wellesley, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('richard.perri@sparkpowercorp.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Carleton Place, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@steveetfils.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lakesideelectrical.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@electricpotential.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lasalle, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('rharris@melloninc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Thorold, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimating@pronghorn.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@eprocanada.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sarnia, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@hardie.on.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Grande Prairie, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@calibreelectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@aspenelectricltd.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Athabasca, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@electricgroup.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dispatch@westcana.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Customerservice@knappselectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Belleville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@3eelectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kamloops, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('wgaillard@accesscomm.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@robinelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Penticton, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@highangleelectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Elginburg, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@willxon.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('loewenelectrical@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Regina, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@surepoint.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sunnyside, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@truecanadianelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@cbkelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lallyelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Penticton, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@currentgroup.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Drayton Valley, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@box2345.temp.domains', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Red Deer, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('lpatten@nexsourcepower.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in nan, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@powerlinksolutions.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Rocky View, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('evolveelectricinc@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Prince George, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('elena.mobilio@mountainpacific.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Linden, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@clarmak.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edson, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mike@skahaelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('condopotlight@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jordanm@teamelectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mount Albert, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ammelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kencollins@onelec.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@atlantic-eletrical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Leduc, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('canadaelectric@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Penticton, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ribbonelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fort St John, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@jatec.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@humboldtelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Camrose, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('tracy@wiltonelectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@nse2000.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sudbury, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info.canadianelectric@bell.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fort McMurray, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('greenelectricalinc@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('m.bouclin@revampindustries.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Drayton Valley, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('electric@kiedan.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('audioinfo@londonaudio.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('pearce@lightwaveelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kjelect@live.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('keitha@connectenergyservices.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Amherstburg, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('terry@flyerelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Orillia, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@kronoselectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Concord, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('agelectric@bell.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vaughan, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('LisaP@kidsportcalgary.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('tmk.electricalandcontracting@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@gkelectricinc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimate@bencoelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kamloops, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mytekintegration.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@bchighlightelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sault Ste. Marie, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jnaelectric@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edson, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dale_h@allcoelectrical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Regina, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@newlineenergy.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in East York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@bandaelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Bay, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('birniehomesafe@birnie.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Grande Prairie, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('teslaelectric@rogers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Bowmanville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mbmelectrical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ghostyelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Thornhill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('milesmacdonaldelectrical@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Estevan, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('projet@ppdeslandes.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Port Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@katoelectrical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Swift Current, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('rstevens@rjselectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@elecom.shelbygrassick.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Chilliwack, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('antonn@therileygroup4.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dan@capitalelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mainwayelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lethbridge, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@truelinepower.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@borneelectriquelam.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in New Westminster, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@perfectelectricals.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hanna, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('justin@jimselectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Collingwood, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@rbtautomate.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nepean, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@platinumelectric.pro', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Slave Lake, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('okvelectric@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sprucedale, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@celelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Hyacinthe, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@tnetworks.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sundre, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('electriccompanyltd@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Port Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@artizanacanada.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sechelt, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('invoices@horizonhv.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@ganco.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ajax, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('affilie@beqtechnology.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('adam@ryanselectrical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@flexisnap.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Birch Hills No. 460, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@FiberexElectric.Ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Langley Twp, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@bvelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@evtec.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Rocky View, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lesentreprisessle.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Blainville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@smithandlong.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brampton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('buddlyoburger@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Medicine Hat, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('brandon@ryman.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Taber, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@robselectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brantford, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('snfelectric@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Chilliwack, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hugocharest@abixel.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vernon, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@constcorp.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('currentelectric.ltd@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@westshoreelectrical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fernie, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('aadon@nbnet.nb.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@theelectriccompany.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Woodstock, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@cablecc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Komoka, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ableelectricco.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('bryan@1and2electric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sherbrooke, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jschlamp@apolloec.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kindersley, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@apluselectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Yarmouth, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('automatisation@mjlelectrique.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('devin.mckay@elworthy.bc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Bonnyville, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@brantelectriclimited.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fort Saskatchewan, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@chermik.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@stinsonelectrical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Newmarket, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('smiley.n@mjelectricalltd.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Telkwa, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@donaldsonelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('qmasonelectrical@eastlink.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Rocky Mountain House, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@rtsservices.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sherbrooke, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('webmaster@northridgeelectric.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@brahmatech.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Olds, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimates@littleelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Parry Sound, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@schultz-electric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Redcliff, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('blair@net-electric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Redcliff, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('webmaster@thinkgreenelectrical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Chatham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@jmlelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dartmouth, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sweeneyelectric@sasktel.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Amos, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('brad.carter@vicarelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@haltonelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@seacliffelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nanaimo, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ospreyelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint John, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@aitechnologies.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('project.man@feldtelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Steve.Behroozi@vge.limited', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cumberland, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@tradecoelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Red Deer, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('rob.lembryk@langstaffandsloan.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vernon, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@mmelectricians.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Estevan, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@surfacestylz.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Trail, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@valhallacontracting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Hyacinthe, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@boisco.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@floorlab.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('athleticflooring@shaw.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sherwood Park, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('daviddugal@betonlc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nisku, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@vepox.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Huntsville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@renowest.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@bkflooring-nl.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Harcourt, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('aaltoarchitecture@office.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dayspring, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rpsbetonepoxy.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lloydminster, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('SALES@LGRTILES.COM', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ponoka, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('tycanflooring@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ylabrosse@cplsolutions.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Red Deer, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rapprich-flooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Barrie, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@betonsurface.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Moose Jaw, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mmcarpet@bellnet.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@entreprisemricher.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@yourdecor.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@floorsdepot.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Prince Albert, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@priorityoneflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Grande Prairie, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@evergreenflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@sourcefloor.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Campbell River, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('michellewarren@rogers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@armourguard.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@wallandfloor.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Campbell River, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@topfloorsanddesign.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('TEPALCONSTRUCTION@OUTLOOK.COM', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Redwater, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@luxepoxy.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('francisco@ecowoods.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Estevan, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@flooringservice.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@expo-sol.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Redwater, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@buildingblocksco.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ayr, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('infocentre@polysurface.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Varant@ValiantFlooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Slave Lake, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('askus@coastalfloors.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@concreteinspirations.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dataprotection@stonhard.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('realsealepoxy@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@m3flooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('martin@robarflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('journet@aluminiumjclement.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Terrebonne, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@epoxyguys.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Memramcook, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('INFO@COATSYSTEMS.COM', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('goldwellrestoration@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Grand Falls-Windsor, NL', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('stephanie@imperialflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@spartanhardwood.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lavaltrie, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ocfs.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Concord, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@PetraRenovation.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('epoxyprodesign@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@splendid-homes.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Windsor, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('plauzon@atmospherebeton.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Hubert, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dumoulinparquet@icloud.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('howdy@irwinflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Pie, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('support@goodlayers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Terrace, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@garageperfect.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('p.charlebois@solatheque.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('courtney@jp-flooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@betonnovafinis.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Port Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@bedrockfloors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kitchener, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Ryan@atlasflooring.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mdsflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@tdidesign.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dawson Creek, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@bridgeflooringco.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('allan.kargard@akepoxy.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Drummondville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('INSTAFLOORINGCO@GMAIL.COM', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ceramiquesbonamigo.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lahomesolutions.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Repentigny, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('magictouch.flooring@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ronsflooring@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dunham, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('saeed@xpertflooringservices.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('stephanie@robertsonfloors.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in White Rock, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ottawa.zonegarage@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('emileeflooring@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Whitby, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('heritagefloors@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Georgetown, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@floormaster.biz', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('1action@kos.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimating@adlersmaintile.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mont-Tremblant, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@evolutionconcepts.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@crowncoatings.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@tricancontract.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@floorsaversinc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@planchersdupont.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@asdelaceramique.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@hdpainting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@planchers-exoconcept.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Adèle, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@superiortile.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@floorbyfloor.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dunham, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@cerabois.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('scott@ironstonesolutions.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Portage la Prairie, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('fraserplusepoxy@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Repentigny, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@concreteshine.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Victoriaville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@claytonflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@poxy.co', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Laurent, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@legacycustomfloors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plancherprecision.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@dogwoodflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Joseph-de-Ham-Sud, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plancherspolyservices.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Barrie, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@polysol.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Flin Flon, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('teejayle@shaw.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('htoronto@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('martinmiron@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@pierceflorcraft.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@craftsmanfloors.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hugofarley@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beaver Bank, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('designessentialsal@sasktel.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Levis, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@planchersmarineau.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lethbridge, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('yawnflooring@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ultimateflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Prince George, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@concretefusion.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('oxfordflooring17@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ceramiquedepot.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Gatineau, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('greatlakesepoxy@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('edmonton@zonegarage.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@reflexepoxy.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@parquetrycanada.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kingston, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Email@sentinelpolymers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Concord, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@garagetailors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@boisfrancclaudelefort.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('EPOXYDIAMANT@OUTLOOK.COM', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('shumylasflooringsolutions@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ceramiquegc@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plancherspolyfloor.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Boisbriand, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ferreiraflooring@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in St Thomas, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@polyplay.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Repentigny, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('renaumic@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sault Ste. Marie, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('prospecspoly@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Whitehorse, YT', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('priairieconcrete.kevin@sasktel.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Granby, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@uniqueflooringggta.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@jrhardwoodflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@planchersmassecomeau.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('elawrence@bchardwood.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kingston, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('gingerh@designflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Laurent, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@economieplancherboisfranc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('webmaster@bulltoughflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@canpoly.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mission, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('askus@floorsmodern.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Blainville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sklassen@omegaflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Martine, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('estimating@westpacificcoatings.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Pickering, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('tripleehardwood@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@capitalfloor.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@atlasfloors.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cantley, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rexcoatflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Thunder Bay, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('wd@wdcontractors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@surfacerenewal.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Trois-Rivières, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lamontflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dominic@daro-flooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Hubert, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('maintenance@kbmcommercial.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('graham@barroncontractinggroup.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kitchener, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@concreteyourway.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@chateauflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brampton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('robert@allabouthardwoods.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('nmclintock@abbafloorcoverings.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montréal-Est, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@mooreflooringdesign.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Port Elgin, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@vintageflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nisku, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('​gc.carastan@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vaudreuil-Dorion, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rickscarpet.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('south.calgary@endoftheroll.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('support@coveredbysurfaces.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('tracy@carpetsandmoreforless.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Gatineau, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dsapone@fabbritile.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('order.abbotsford@prosol.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('installsplus@rogers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Marie-Madeleine, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@carpetone.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Colomban, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@uptowndecor.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@cdpceramique.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sherbrooke, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@yourcompany.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lachute, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('thiessentrades@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-304@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@example.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('classictilecalgary@shaw.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hierik@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Riviere-des-Prairies—Pointe-aux-Trembles, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@whelansflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jturcotte@cpchapdelaine.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Medicine Hat, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('commandescpmdoyon@flordeco.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ashleymain@ashleycarpets.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@alexanian.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@modernhardwood.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in New Westminster, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('e-marketing@miragefloors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lethbridge, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mounthope@tileit.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('patrick@floortrends.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@stittsvillefloors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@dragonaflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plancherspayless.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jenkinsbrandon@jenkinsflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('speers@speersflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@tapisgilleslamothe.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Gatineau, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-281@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@miracleflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('tapismilton@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hello@localflooringgroup.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Concord, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@canadianhomestyle.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Airdrie, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('coquitlam@jordans.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('janet.daniel@fiberandcloth.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@planchertendancerivesud.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@planchermarceletfils.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nanaimo, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@yfcustomflooring.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@boisettendance.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beechville, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@darmaga.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ppdusseaultexcavation@bellnet.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Norwich, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ecoevolutioninc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kamloops, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('reservations@captremblant.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@planchersmnr.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('robert@rojservices.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mike@canadawestwood.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Point Edward, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@supremeflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@tiptopflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Georgetown, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('walnutgrovehardwood@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in St. Catharines, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('MaresFlooring@yahoo.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Windsor, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@teamhardwoodfloors.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Parry Sound, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('soumission@glclimatisationchauffage.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Delson, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@marbletopshop.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-253@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Campbell River, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mcmplanchers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Longueuil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mariomeunier-sablage@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oshawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('montrealfloors@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-249@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Windsor, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@polissage-beton.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Peterborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('starplanchers@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Drummondville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('acoghill@valleystonescapes.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mciupa@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Stephen@jenkynscoatings.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brantford, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mrmarbleandstone.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Pickering, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@foreverepoxy.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in St. Catharines, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('customerservice@armorrock.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Alma, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@docteursablage.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Regina, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lbepoxyflooring.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mount Hope, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-238@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mike@aaacarpetrepair.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cobourg, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@whitelambfinlay.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Stittsville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-233@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ContactUs@drcarpet.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nanaimo, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('interpose.couvreplancher@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dollard-Des Ormeaux, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@curlyscarpetrepair.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brandon, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@hmacarpet.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('brandon@thedecorgroup.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Papineauville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@nyservices.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Miramichi, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@liteforminternational.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Abbotsford, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@aucourantlighting.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@arevco.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('commandes@lumidecor.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Granby, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@roycelight.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Taylor@outdoor-lighting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('serviceweb@unionltg.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kingston, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('shopillights@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('lightdepot2@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@eclairagediode.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Michel, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('salesnanaimo@mclarenlighting.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Jacques, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('n.brazeau@eclairage-etc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('customercare@robinsonco.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Julie, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@eclairagesaran.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('support@multiluminaire.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Joseph-de-Beauce, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@GravityTech.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Boisbriand, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@danasmarthomes.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Gédéon-de-Beauce, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@pureimage.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beauharnois, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('kenton@aspenautomation.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nepean, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('gordon@weissenterprise.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@elite-systems.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dparadis@mbisystemes.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@can-nor.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('services@ips.us', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@jtelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('miranda@ratech.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@canal.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@smeincofseattle.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Guelph, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('matt@potterelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in L'Assomption, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('andy@veelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Granby, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('welcome@ptxelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Laurent, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@renewablenorth.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cantley, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('brubacherpowerline@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Terrebonne, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('careers@symtech.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('emlira.magazine@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Abbotsford, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('lukepotter@aquareach.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Innisfil Beach, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-184@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('rboyer@immacex.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in West Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dan@danthewindowman.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Irishtown, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lavagedevitreslp.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('winduckscleaning@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Longueuil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mastershine.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vernon, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('romanexteriors7@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Jean-Port-Joli, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@myaurum.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Klearview@KlearviewWindowCleaning.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-175@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Duncan, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('KelownaWindowCleaners@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Etobicoke, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('lambswindowcleaning@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@tinmangroup.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Erin, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@rembourrageautomobile.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beloeil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('scholarship@hallmarkhousekeeping.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('e.l.v.i.s.-treat-me-nice@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in nan, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@climaticgroup.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@signaturecleaning.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Thornbury, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@doubleclean.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ritewayfiltration@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('etetreault@rondeaunet.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mount Royal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('chad@goldenenviro.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('inquiry@smottawa.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Jean-sur-Richelieu, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('quotes@cityproparkade.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Guelph, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@firstgeneralniagara.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Lethbridge, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('customerservice@pinnaclehygiene.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Montreal, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@pearlcleaninginc.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brampton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hello@cleananswers.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jpetersen@mulberrymc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@lowfaremaintenance.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nanaimo, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-154@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Val-d'Or, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('commcorporate_addressercial@servicemaster.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hello@ehmaids.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Jean-sur-Richelieu, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('menagebonheur@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Laval, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@womanstouchcleaning.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ancaster, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info.cleanvictoria@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vaughan, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('marlenisi@freshandshiny.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Victoria, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('lynda@sagecleaning.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@merrymaidsscarborough.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Orillia, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('reception.coopbec@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Waterloo, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-144@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Granby, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('weclean@hellamaid.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('thecleanest.toronto@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dataprotection@opulentcleaning.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@parfaitmenage.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Barrie, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@mrsclean.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Bolton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lathered.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in St. Catharines, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@easternontarioeavestrough.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Port Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('blastawaycanada@hotmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brooks, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@procleanmobilewash.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('professionalpowerwash@shaw.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Langford, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@stpowerwash.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Niagara-on-the-Lake, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@canadianmobilewash.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in New Westminster, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jkenboyle@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Clearwater County, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('operations@mervsmobilewash.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Leduc County, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('salspowerwash613@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fergus, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@heavyspec.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('southerndetailfleetwash@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saskatoon, SK', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('niagaramw@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Québec City, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('importdata-125@kwikr.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Beamsville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@smwg.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Amherstburg, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('anchorwash902@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@auroraroofinglm.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ajax, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Jason@mustangexteriors.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Longueuil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@toiturespremium.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@smcgroup.io', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burlington, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@metalroofcanada.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('gableroofing@bellnet.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('support@studiojohnsharp.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kitchener, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@epsteinpropertycare.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Greater Sudbury, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('davidreeder@mrlandscape.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kelowna, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('wildrosegardeners@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jenny.anne.cook@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Red Deer, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('rebecca@tranquilitygardendesign.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Longueuil, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('colin.maybee@maybeebrothers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@precisionlandscaping.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in St-Bruno-de-Montarville, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ecologicallandscaping.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Kitchener, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@spruced-up.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Winnipeg, MB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@jsslighting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Burnaby, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@earth-elements.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Erin, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@moonstruck.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Hubert, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@newagaincleaning.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Barrie, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lightsupalberta.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ottawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('abbalandscaping1@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@eclairageoasis.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in St. Catharines, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('hello@cypresslighting.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Port Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@concept72.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@lightright.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Abbotsford, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ContactUs.Web@enercare.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Newmarket, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@enterprisemechanical.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Markham, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('inquiries@lairdandson.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@ahsbc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('quotes@towerph.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Brampton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@greenapprovedsolutions.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Levis, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('theratio_interior@mail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@av-chandeliers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Victoria, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@alkonelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Ajax, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('john_electrician@yahoo.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Nanaimo, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Info@SteinmetzElectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@AlbrightElectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in La Malbaie, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@foxwoodelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Waterloo, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@ramcoelectric.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('privacy@web.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Scarborough, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('reception@futurecoreelectric.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oshawa, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@directelectricc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Granby, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('dynamicelectricltd@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('webmaster@m.priorityplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Edmonton, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@plumberondemand.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Augusta, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@newcanadiandrain.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Oakville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('service@livingservices.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('ltdbdoyle@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@masterfixplumbing.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Langley, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@oakridgeplumbingontario.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Dollard-Des Ormeaux, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@antaplumbing.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Miramichi, NB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('infobc@lisimechanical.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cambridge, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('contact@strongplumbinginc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Cornwall, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@mjkconstruction.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Conception Bay South, NL', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('mike@cornerstoneconstruction-inc.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hanover, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@freestylespaces.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Smithville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('lespaysagesheydra@videotron.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Fenwick, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('boutin.steeve@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@paritek.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Jonquière, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('online.store@krm.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Halifax, NS', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('officemanager@parastone.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('vitankservices@shaw.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in London, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@greencleantoronto.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Rosemère, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@pro-clean.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Richmond Hill, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('operations@cleanforgood.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Saint-Laurent, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('jeff.butler@renuesystems.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('privacyofficer@servicemasterclean.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('admin@cleanlux.cam', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@topmaxcleaning.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('office@pbs-corp.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@starteamcleaning.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('Office@bubblesandsqueak.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('judy@homehelpers.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('sales@blanco.cleaning', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('accommodations-ext@fb.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('marcus@handimaidsandaman.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('matttibbophotography@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Hamilton, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('majestichomeservices@bell.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Huntsville, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('maidtoperfection@outlook.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Concord, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('CozyHomeMaid@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('twinpeaks@twinpeakshomecare.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Calgary, AB', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('CLIENTS@STEAMKLEEN.CA', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Surrey, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('cleansceneyellowknife@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in La Prairie, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@canadiansteamcarpetcleaning.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North Vancouver, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@applecarpetcleaning.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Sainte-Anne-de-Bellevue, QC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('khalidcleaningservices@gmail.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Victoria, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@canadacleanhome.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Vaughan, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('freshandclean@telus.net', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Barrie, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@svmtruro.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in North York, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@bayviewsteamcleaning.com', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Toronto, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('info@kleenithomeservices.ca', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Coquitlam, BC', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('nan', 'temp_hash', 'worker', 'Professional', 'Worker', 'ON', 'worker', 1, 1, 'temp_hash', datetime('now'));
INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), 'Professional Professional Services provider in Mississauga, ON', '', datetime('now'));
INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), 'Professional Services', 'Professional Services', 'Professional Professional Services services', 75, 1, datetime('now'));

