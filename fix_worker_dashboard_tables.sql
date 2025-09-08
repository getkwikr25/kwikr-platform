-- Fix Worker Dashboard Tables
-- Create essential tables for worker dashboard functionality

-- Worker Customers Table
CREATE TABLE IF NOT EXISTS worker_customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    
    -- Relationship Details
    relationship_status TEXT NOT NULL DEFAULT 'active' CHECK (
        relationship_status IN ('active', 'inactive', 'blocked', 'preferred')
    ),
    relationship_type TEXT DEFAULT 'regular' CHECK (
        relationship_type IN ('regular', 'premium', 'one_time', 'recurring')
    ),
    
    -- Contact Information
    first_contact_date DATE NOT NULL DEFAULT (date('now')),
    last_service_date DATE,
    last_communication_date DATETIME,
    
    -- Business Metrics
    total_jobs_completed INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    average_job_value DECIMAL(15,2) DEFAULT 0.00,
    
    -- Ratings & Feedback
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Preferences & Notes
    customer_notes TEXT,
    preferred_contact_method TEXT DEFAULT 'email' CHECK (
        preferred_contact_method IN ('email', 'phone', 'text', 'platform')
    ),
    service_preferences TEXT, -- JSON of service preferences
    
    -- Billing & Payment
    preferred_payment_method TEXT,
    payment_terms INTEGER DEFAULT 30, -- Days
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(worker_id, client_id)
);

-- Worker Job Applications Table
CREATE TABLE IF NOT EXISTS worker_job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    
    -- Application Details
    application_status TEXT NOT NULL DEFAULT 'applied' CHECK (
        application_status IN ('applied', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn')
    ),
    bid_amount DECIMAL(10,2),
    estimated_duration_hours INTEGER,
    proposed_start_date DATE,
    
    -- Application Content
    cover_letter TEXT,
    portfolio_items TEXT, -- JSON array of portfolio item IDs
    certifications TEXT, -- JSON array of certification IDs
    
    -- Timeline Tracking
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    status_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Communication
    client_message TEXT,
    worker_response TEXT,
    last_communication_at DATETIME,
    
    -- Metadata
    application_source TEXT DEFAULT 'direct', -- 'direct', 'invitation', 'referral'
    is_urgent BOOLEAN DEFAULT 0,
    priority_score INTEGER DEFAULT 0,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(worker_id, job_id)
);

-- Worker Earnings Table
CREATE TABLE IF NOT EXISTS worker_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    
    -- Earnings Period
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    
    -- Earnings Breakdown
    gross_earnings DECIMAL(15,2) DEFAULT 0.00,
    platform_fees DECIMAL(15,2) DEFAULT 0.00,
    net_earnings DECIMAL(15,2) DEFAULT 0.00,
    
    -- Job Statistics
    jobs_completed INTEGER DEFAULT 0,
    average_job_value DECIMAL(15,2) DEFAULT 0.00,
    total_hours_worked DECIMAL(8,2) DEFAULT 0.00,
    hourly_rate DECIMAL(8,2) DEFAULT 0.00,
    
    -- Performance Metrics
    customer_rating DECIMAL(3,2) DEFAULT 0.00,
    repeat_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Worker Availability Table
CREATE TABLE IF NOT EXISTS worker_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    
    -- Availability Schedule
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Availability Status
    is_available BOOLEAN DEFAULT 1,
    availability_type TEXT DEFAULT 'regular' CHECK (
        availability_type IN ('regular', 'extended', 'emergency', 'seasonal')
    ),
    
    -- Service Area & Capacity
    max_jobs_per_day INTEGER DEFAULT 3,
    travel_radius_km INTEGER DEFAULT 25,
    service_areas TEXT, -- JSON array of postal codes or areas
    
    -- Pricing & Rates
    base_hourly_rate DECIMAL(8,2) DEFAULT 0.00,
    rush_hour_multiplier DECIMAL(3,2) DEFAULT 1.5,
    weekend_multiplier DECIMAL(3,2) DEFAULT 1.25,
    
    -- Special Conditions
    minimum_job_duration INTEGER DEFAULT 1, -- Hours
    advance_booking_required INTEGER DEFAULT 0, -- Days
    special_requirements TEXT,
    
    effective_from DATE NOT NULL DEFAULT (date('now')),
    effective_to DATE,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT OR IGNORE INTO worker_customers (worker_id, client_id, relationship_status, first_contact_date, last_service_date, total_jobs_completed, total_revenue, average_job_value, average_rating) VALUES
(1, 1, 'active', '2024-06-01', '2024-08-15', 5, 2500.00, 500.00, 4.8),
(1, 2, 'preferred', '2024-07-15', '2024-09-01', 3, 1800.00, 600.00, 4.9),
(1, 3, 'active', '2024-08-01', '2024-08-30', 2, 900.00, 450.00, 4.6),
(2, 4, 'active', '2024-05-15', '2024-09-05', 7, 3500.00, 500.00, 4.7),
(2, 5, 'inactive', '2024-04-01', '2024-06-15', 1, 300.00, 300.00, 4.2);

INSERT OR IGNORE INTO worker_job_applications (worker_id, job_id, application_status, bid_amount, estimated_duration_hours, applied_at, cover_letter) VALUES
(1, 101, 'accepted', 450.00, 8, datetime('now', '-5 days'), 'I have extensive experience in residential plumbing repairs...'),
(1, 102, 'under_review', 650.00, 12, datetime('now', '-3 days'), 'Looking forward to helping with your kitchen renovation...'),
(1, 103, 'rejected', 300.00, 6, datetime('now', '-7 days'), 'I can complete this electrical work safely and efficiently...'),
(2, 104, 'applied', 800.00, 16, datetime('now', '-2 days'), 'Specialized in HVAC installations with 10+ years experience...'),
(2, 105, 'shortlisted', 520.00, 10, datetime('now', '-4 days'), 'Certified electrician ready to upgrade your panel...');

INSERT OR IGNORE INTO worker_earnings (worker_id, period_type, period_start_date, period_end_date, gross_earnings, platform_fees, net_earnings, jobs_completed, average_job_value) VALUES
(1, 'monthly', '2024-08-01', '2024-08-31', 2800.00, 280.00, 2520.00, 6, 466.67),
(1, 'monthly', '2024-07-01', '2024-07-31', 3200.00, 320.00, 2880.00, 7, 457.14),
(2, 'monthly', '2024-08-01', '2024-08-31', 3500.00, 350.00, 3150.00, 8, 437.50),
(2, 'monthly', '2024-07-01', '2024-07-31', 2900.00, 290.00, 2610.00, 6, 483.33);

INSERT OR IGNORE INTO worker_availability (worker_id, day_of_week, start_time, end_time, is_available, max_jobs_per_day, base_hourly_rate) VALUES
(1, 1, '08:00', '17:00', 1, 3, 45.00), -- Monday
(1, 2, '08:00', '17:00', 1, 3, 45.00), -- Tuesday
(1, 3, '08:00', '17:00', 1, 3, 45.00), -- Wednesday
(1, 4, '08:00', '17:00', 1, 3, 45.00), -- Thursday
(1, 5, '08:00', '16:00', 1, 2, 45.00), -- Friday
(2, 1, '07:00', '18:00', 1, 4, 50.00), -- Monday
(2, 2, '07:00', '18:00', 1, 4, 50.00), -- Tuesday
(2, 3, '07:00', '18:00', 1, 4, 50.00), -- Wednesday
(2, 4, '07:00', '18:00', 1, 4, 50.00), -- Thursday
(2, 5, '07:00', '17:00', 1, 3, 50.00), -- Friday
(2, 6, '09:00', '15:00', 1, 2, 62.50); -- Saturday (weekend rate)

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_worker_customers_worker_id ON worker_customers(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_customers_relationship_status ON worker_customers(relationship_status);
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_worker_id ON worker_job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_status ON worker_job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_worker_earnings_worker_id ON worker_earnings(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_earnings_period ON worker_earnings(period_type, period_start_date);
CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_id ON worker_availability(worker_id);