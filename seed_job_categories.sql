-- Job Categories Seed Data for Kwikr Platform

INSERT OR IGNORE INTO job_categories (name, description, requires_license, requires_insurance, icon_class, is_active) VALUES
-- Construction & Trades
('Plumbing', 'Installation, repair and maintenance of water systems, pipes, and fixtures', TRUE, TRUE, 'fas fa-wrench', TRUE),
('Electrical', 'Electrical wiring, repairs, installations and electrical system maintenance', TRUE, TRUE, 'fas fa-bolt', TRUE),
('HVAC', 'Heating, ventilation, and air conditioning services', TRUE, TRUE, 'fas fa-temperature-high', TRUE),
('Carpentry', 'Custom woodwork, framing, finishing, and general carpentry services', TRUE, TRUE, 'fas fa-hammer', TRUE),
('Roofing', 'Roof installation, repair, inspection, and maintenance services', TRUE, TRUE, 'fas fa-home', TRUE),
('Flooring', 'Installation and repair of hardwood, tile, carpet, and other flooring', FALSE, TRUE, 'fas fa-th-large', TRUE),
('Drywall', 'Drywall installation, repair, taping, and finishing services', FALSE, TRUE, 'fas fa-paint-roller', TRUE),
('Painting', 'Interior and exterior painting, staining, and surface preparation', FALSE, TRUE, 'fas fa-paint-brush', TRUE),

-- Home Services
('Cleaning', 'Residential and commercial cleaning services', FALSE, TRUE, 'fas fa-broom', TRUE),
('Landscaping', 'Garden design, lawn care, tree services, and outdoor maintenance', FALSE, TRUE, 'fas fa-seedling', TRUE),
('Snow Removal', 'Snow plowing, shoveling, and ice management services', FALSE, TRUE, 'fas fa-snowflake', TRUE),
('Handyman', 'General home repairs and maintenance services', FALSE, TRUE, 'fas fa-tools', TRUE),
('Appliance Repair', 'Repair and maintenance of household appliances', FALSE, TRUE, 'fas fa-blender', TRUE),
('Pest Control', 'Insect and pest management and extermination services', TRUE, TRUE, 'fas fa-bug', TRUE),

-- Moving & Transport
('Moving Services', 'Residential and commercial moving and relocation services', FALSE, TRUE, 'fas fa-truck', TRUE),
('Delivery', 'Package delivery, courier services, and local transport', FALSE, TRUE, 'fas fa-shipping-fast', TRUE),
('Furniture Assembly', 'Assembly of furniture, shelving, and home fixtures', FALSE, FALSE, 'fas fa-couch', TRUE),

-- Technology Services
('Computer Repair', 'PC and laptop repair, troubleshooting, and maintenance', FALSE, FALSE, 'fas fa-laptop', TRUE),
('TV Installation', 'Television mounting, setup, and home theater installation', FALSE, TRUE, 'fas fa-tv', TRUE),
('Smart Home Setup', 'Installation and configuration of smart home devices', FALSE, FALSE, 'fas fa-home', TRUE),

-- Personal Services
('Pet Care', 'Dog walking, pet sitting, and pet care services', FALSE, TRUE, 'fas fa-paw', TRUE),
('Tutoring', 'Academic tutoring and educational support services', FALSE, FALSE, 'fas fa-graduation-cap', TRUE),
('Personal Training', 'Fitness training and wellness coaching services', FALSE, TRUE, 'fas fa-dumbbell', TRUE),
('Childcare', 'Babysitting and child supervision services', FALSE, TRUE, 'fas fa-child', TRUE),

-- Automotive
('Auto Repair', 'Vehicle maintenance, repairs, and automotive services', TRUE, TRUE, 'fas fa-car', TRUE),
('Car Detailing', 'Vehicle cleaning, waxing, and detailing services', FALSE, FALSE, 'fas fa-car-wash', TRUE),

-- Business Services
('Accounting', 'Bookkeeping, tax preparation, and financial services', TRUE, TRUE, 'fas fa-calculator', TRUE),
('Legal Services', 'Legal consultation and document preparation', TRUE, TRUE, 'fas fa-gavel', TRUE),
('Photography', 'Event photography, portraits, and commercial photography', FALSE, TRUE, 'fas fa-camera', TRUE),
('Graphic Design', 'Logo design, branding, and graphic design services', FALSE, FALSE, 'fas fa-palette', TRUE),
('Web Design', 'Website development and web design services', FALSE, FALSE, 'fas fa-code', TRUE),

-- Specialized Services
('Security', 'Security system installation and security services', TRUE, TRUE, 'fas fa-shield-alt', TRUE),
('Catering', 'Event catering and food service', TRUE, TRUE, 'fas fa-utensils', TRUE),
('Event Planning', 'Wedding planning, party planning, and event coordination', FALSE, TRUE, 'fas fa-calendar-alt', TRUE),
('Real Estate', 'Property management and real estate services', TRUE, TRUE, 'fas fa-key', TRUE);

-- Update the schema to ensure proper timestamps
UPDATE job_categories SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;