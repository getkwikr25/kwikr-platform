-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location_province, location_city);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_worker_id ON bids(worker_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(bid_amount);

CREATE INDEX IF NOT EXISTS idx_job_messages_sender ON job_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_job_messages_recipient ON job_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_job_messages_job ON job_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_job_messages_sent_at ON job_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_job_messages_is_read ON job_messages(is_read);

-- Insert default job categories
INSERT OR IGNORE INTO job_categories (name, description, icon_class) VALUES
('Cleaning', 'House cleaning, commercial cleaning, deep cleaning', 'fas fa-broom'),
('Plumbing', 'Pipe repair, installation, emergency plumbing', 'fas fa-wrench'),
('Electrical', 'Electrical repairs, installations, troubleshooting', 'fas fa-bolt'),
('Carpentry', 'Wood work, furniture, home repairs', 'fas fa-hammer'),
('Painting', 'Interior/exterior painting, wallpaper, staining', 'fas fa-paint-roller'),
('Flooring', 'Flooring installation, repair, refinishing', 'fas fa-layer-group'),
('HVAC', 'Heating, ventilation, air conditioning', 'fas fa-fan'),
('Landscaping', 'Gardening, lawn care, outdoor maintenance', 'fas fa-seedling'),
('Handyman', 'General repairs, maintenance, odd jobs', 'fas fa-tools'),
('Roofing', 'Roof repair, installation, inspection', 'fas fa-home'),
('Moving', 'Moving services, packing, transportation', 'fas fa-truck-moving'),
('Other', 'Other services not listed above', 'fas fa-question-circle');

-- Insert sample jobs for demo purposes
INSERT OR IGNORE INTO jobs (
  client_id, title, description, category_id, budget_min, budget_max, 
  location_province, location_city, status, urgency
) VALUES
-- Using existing client IDs (2 and 3)
(2, 'Kitchen Deep Clean', 'Need a thorough deep cleaning of my kitchen including appliances, cabinets, and floors. Kitchen is approximately 200 sq ft.', 1, 150.00, 250.00, 'ON', 'Toronto', 'posted', 'normal'),
(2, 'Bathroom Plumbing Repair', 'Leaky faucet in master bathroom needs repair. Also need to check water pressure in shower.', 2, 100.00, 200.00, 'ON', 'Toronto', 'posted', 'high'),
(2, 'Living Room Painting', 'Paint living room walls (approx 300 sq ft). Paint will be provided, need labor only.', 5, 300.00, 500.00, 'ON', 'Toronto', 'posted', 'low'),
(3, 'Garage Organization', 'Organize and clean 2-car garage. Install shelving system and sort items.', 9, 200.00, 400.00, 'BC', 'Vancouver', 'posted', 'normal'),
(3, 'Garden Cleanup', 'Fall garden cleanup including leaf removal, pruning, and bed preparation for winter.', 8, 150.00, 300.00, 'BC', 'Vancouver', 'posted', 'normal');

-- Insert sample bids using existing worker IDs
INSERT OR IGNORE INTO bids (
  job_id, worker_id, bid_amount, cover_message, estimated_timeline, status
) VALUES
-- Bids for Kitchen Deep Clean (job_id 1)
(1, 4, 200.00, 'I have 5+ years experience in residential cleaning. I use eco-friendly products and can complete this job in 4-6 hours. I am available this weekend.', '4-6 hours', 'pending'),
(1, 5, 180.00, 'Professional cleaning service with excellent references. I specialize in kitchen deep cleaning and can provide all supplies.', '3-4 hours', 'pending'),

-- Bids for Bathroom Plumbing (job_id 2) 
(2, 9, 150.00, 'Licensed plumber with 10+ years experience. I can fix the faucet and check your water pressure. Available for emergency service.', '2-3 hours', 'pending'),
(2, 10, 120.00, 'Quick and reliable plumbing service. I have dealt with similar issues many times and can complete this efficiently.', '1-2 hours', 'pending'),

-- Bids for Living Room Painting (job_id 3)
(3, 29, 350.00, 'Professional painter with 8 years experience. I guarantee clean lines and smooth finish. Can work around your schedule.', '1-2 days', 'pending'),
(3, 30, 400.00, 'High-quality painting service with warranty. I prep surfaces properly and use premium techniques for lasting results.', '2 days', 'pending');

-- Insert sample messages for demo
INSERT OR IGNORE INTO job_messages (
  sender_id, recipient_id, job_id, message
) VALUES
(2, 4, 1, 'Hi Emma! I saw your bid for the kitchen cleaning. Do you bring your own cleaning supplies or should I provide them?'),
(4, 2, 1, 'Hi! Yes, I bring all my own eco-friendly cleaning supplies. I just need access to water and electricity. When would be a good time to schedule?'),
(2, 9, 2, 'Hi James, when would you be available to come take a look at the leaky faucet? It seems to be getting worse.'),
(9, 2, 2, 'I can come by tomorrow morning around 9 AM if that works for you. I will bring all necessary tools and parts.');