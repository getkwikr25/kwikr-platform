-- Worker Dashboard System Migration
-- Comprehensive system for worker-side dashboard functionality
-- Created: 2025-09-07
-- Features: Job Applications, Earnings, Customers, Analytics, Availability, Portfolio

-- ================================================================
-- 1. WORKER JOB APPLICATIONS TABLE
-- Track worker applications to client job postings
-- ================================================================

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
    
    -- Foreign key constraints (will be enforced by application logic)
    UNIQUE(worker_id, job_id) -- Prevent duplicate applications
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_worker_id ON worker_job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_status ON worker_job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_applied_at ON worker_job_applications(applied_at);

-- ================================================================
-- 2. WORKER EARNINGS TABLE
-- Track all earnings and financial transactions
-- ================================================================

CREATE TABLE IF NOT EXISTS worker_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    
    -- Transaction Details
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN ('job_payment', 'bonus', 'tip', 'subscription_fee', 'penalty', 'refund', 'adjustment')
    ),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CAD',
    
    -- Source Information
    job_id INTEGER,
    client_id INTEGER,
    booking_id INTEGER,
    
    -- Payment Details
    gross_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL, -- Amount worker receives
    
    -- Status Tracking
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'disputed')
    ),
    
    -- Payment Method
    payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer', 'e_transfer'
    payment_reference TEXT, -- External payment ID
    
    -- Dates
    earned_date DATE NOT NULL,
    paid_date DATE,
    due_date DATE,
    
    -- Description
    description TEXT,
    notes TEXT,
    
    -- Tax Information
    tax_year INTEGER,
    is_taxable BOOLEAN DEFAULT 1,
    tax_category TEXT,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for earnings queries
CREATE INDEX IF NOT EXISTS idx_worker_earnings_worker_id ON worker_earnings(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_earnings_earned_date ON worker_earnings(earned_date);
CREATE INDEX IF NOT EXISTS idx_worker_earnings_payment_status ON worker_earnings(payment_status);
CREATE INDEX IF NOT EXISTS idx_worker_earnings_tax_year ON worker_earnings(tax_year);

-- ================================================================
-- 3. WORKER CUSTOMERS TABLE
-- Track client relationships and history
-- ================================================================

CREATE TABLE IF NOT EXISTS worker_customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    
    -- Relationship Details
    relationship_status TEXT NOT NULL DEFAULT 'active' CHECK (
        relationship_status IN ('active', 'inactive', 'blocked', 'preferred')
    ),
    first_contact_date DATE NOT NULL,
    last_service_date DATE,
    
    -- Customer Statistics
    total_jobs_completed INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    average_job_value DECIMAL(10,2) DEFAULT 0.00,
    
    -- Ratings & Reviews
    average_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    
    -- Customer Preferences
    preferred_service_types TEXT, -- JSON array
    communication_preference TEXT DEFAULT 'email', -- 'email', 'sms', 'phone', 'app'
    scheduling_preferences TEXT, -- JSON object with preferences
    
    -- Notes & Tags
    customer_notes TEXT,
    tags TEXT, -- JSON array of tags like 'high_value', 'repeat_customer', 'difficult'
    
    -- Payment Information
    typical_payment_method TEXT,
    payment_terms TEXT, -- 'immediate', 'net_15', 'net_30'
    credit_status TEXT DEFAULT 'good' CHECK (
        credit_status IN ('excellent', 'good', 'fair', 'poor', 'blocked')
    ),
    
    -- Marketing
    referral_source TEXT,
    lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(worker_id, client_id)
);

-- Indexes for customer management
CREATE INDEX IF NOT EXISTS idx_worker_customers_worker_id ON worker_customers(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_customers_relationship_status ON worker_customers(relationship_status);
CREATE INDEX IF NOT EXISTS idx_worker_customers_last_service_date ON worker_customers(last_service_date);
CREATE INDEX IF NOT EXISTS idx_worker_customers_total_revenue ON worker_customers(total_revenue);

-- ================================================================
-- 4. WORKER SERVICE ANALYTICS TABLE
-- Track performance metrics and analytics
-- ================================================================

CREATE TABLE IF NOT EXISTS worker_service_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    
    -- Time Period
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    
    -- Job Metrics
    jobs_applied INTEGER DEFAULT 0,
    jobs_won INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    jobs_cancelled INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    
    -- Financial Metrics
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    average_job_value DECIMAL(10,2) DEFAULT 0.00,
    total_hours_worked DECIMAL(8,2) DEFAULT 0.00,
    hourly_rate_average DECIMAL(8,2) DEFAULT 0.00,
    
    -- Customer Metrics
    new_customers INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,
    customer_retention_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Quality Metrics
    average_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    five_star_reviews INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Efficiency Metrics
    response_time_average INTEGER, -- Minutes to respond to inquiries
    turnaround_time_average INTEGER, -- Hours from booking to completion
    
    -- Platform Engagement
    profile_views INTEGER DEFAULT 0,
    contact_requests INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00, -- Profile view to job conversion
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(worker_id, period_type, period_start_date)
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_worker_service_analytics_worker_id ON worker_service_analytics(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_service_analytics_period ON worker_service_analytics(period_type, period_start_date);

-- ================================================================
-- 5. WORKER AVAILABILITY TABLE
-- Enhanced availability management system
-- ================================================================

CREATE TABLE IF NOT EXISTS worker_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    
    -- Availability Type
    availability_type TEXT NOT NULL CHECK (
        availability_type IN ('regular_hours', 'time_off', 'busy', 'available', 'emergency_only')
    ),
    
    -- Time Details
    day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc. (NULL for specific dates)
    specific_date DATE, -- For one-time availability changes
    start_time TIME,
    end_time TIME,
    is_all_day BOOLEAN DEFAULT 0,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT 1,
    recurrence_pattern TEXT, -- 'weekly', 'biweekly', 'monthly'
    recurrence_end_date DATE,
    
    -- Availability Details
    max_bookings_per_slot INTEGER DEFAULT 1,
    buffer_time_minutes INTEGER DEFAULT 0, -- Time between appointments
    advance_booking_hours INTEGER DEFAULT 24, -- Minimum advance notice
    
    -- Service Limitations
    service_types TEXT, -- JSON array of service types available during this time
    location_restrictions TEXT, -- JSON array of allowed service areas
    
    -- Status
    is_active BOOLEAN DEFAULT 1,
    reason TEXT, -- Reason for time off or unavailability
    
    -- Emergency Contact
    emergency_available BOOLEAN DEFAULT 0,
    emergency_rate_multiplier DECIMAL(3,2) DEFAULT 1.5,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for availability queries
CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_id ON worker_availability(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_availability_day_of_week ON worker_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_worker_availability_specific_date ON worker_availability(specific_date);
CREATE INDEX IF NOT EXISTS idx_worker_availability_type ON worker_availability(availability_type);

-- ================================================================
-- 6. WORKER PORTFOLIO TABLE
-- Work samples, certifications, and showcase items
-- ================================================================

CREATE TABLE IF NOT EXISTS worker_portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    
    -- Portfolio Item Details
    item_type TEXT NOT NULL CHECK (
        item_type IN ('work_sample', 'certification', 'license', 'insurance', 'testimonial', 'before_after', 'video', 'document')
    ),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Media Files
    image_url TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    document_url TEXT,
    
    -- Work Sample Details
    project_date DATE,
    client_name VARCHAR(100), -- Can be anonymized
    service_type TEXT,
    project_duration_hours INTEGER,
    project_cost DECIMAL(10,2),
    
    -- Certification Details
    issuing_organization VARCHAR(200),
    certification_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    verification_url TEXT,
    
    -- Display Settings
    is_featured BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT 1,
    show_on_profile BOOLEAN DEFAULT 1,
    
    -- Tags and Categories
    tags TEXT, -- JSON array of tags
    categories TEXT, -- JSON array of categories
    
    -- Client Permission
    client_permission_granted BOOLEAN DEFAULT 0,
    client_permission_date DATE,
    
    -- Verification
    is_verified BOOLEAN DEFAULT 0,
    verified_by TEXT,
    verified_at DATETIME,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for portfolio queries
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_worker_id ON worker_portfolio(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_item_type ON worker_portfolio(item_type);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_is_featured ON worker_portfolio(is_featured);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_display_order ON worker_portfolio(display_order);

-- ================================================================
-- 7. WORKER DASHBOARD SETTINGS TABLE
-- Dashboard preferences and configuration
-- ================================================================

CREATE TABLE IF NOT EXISTS worker_dashboard_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL UNIQUE,
    
    -- Dashboard Preferences
    default_view TEXT DEFAULT 'overview' CHECK (
        default_view IN ('overview', 'jobs', 'earnings', 'customers', 'analytics', 'availability', 'portfolio')
    ),
    
    -- Notification Preferences
    email_new_jobs BOOLEAN DEFAULT 1,
    email_job_updates BOOLEAN DEFAULT 1,
    email_payments BOOLEAN DEFAULT 1,
    email_reviews BOOLEAN DEFAULT 1,
    
    sms_urgent_jobs BOOLEAN DEFAULT 0,
    sms_payment_alerts BOOLEAN DEFAULT 0,
    
    push_new_jobs BOOLEAN DEFAULT 1,
    push_job_updates BOOLEAN DEFAULT 1,
    push_payments BOOLEAN DEFAULT 1,
    
    -- Auto-Response Settings
    auto_respond_enabled BOOLEAN DEFAULT 0,
    auto_response_message TEXT,
    auto_response_delay_minutes INTEGER DEFAULT 15,
    
    -- Business Settings
    business_hours_start TIME DEFAULT '09:00:00',
    business_hours_end TIME DEFAULT '17:00:00',
    timezone TEXT DEFAULT 'America/Toronto',
    
    -- Financial Settings
    default_rate DECIMAL(8,2),
    emergency_rate_multiplier DECIMAL(3,2) DEFAULT 1.5,
    minimum_job_value DECIMAL(8,2),
    
    -- Marketing Settings
    allow_profile_promotion BOOLEAN DEFAULT 1,
    accept_emergency_jobs BOOLEAN DEFAULT 1,
    travel_radius_km INTEGER DEFAULT 25,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 8. WORKER PERFORMANCE GOALS TABLE
-- Track worker-set goals and targets
-- ================================================================

CREATE TABLE IF NOT EXISTS worker_performance_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    
    -- Goal Details
    goal_type TEXT NOT NULL CHECK (
        goal_type IN ('monthly_revenue', 'jobs_completed', 'new_customers', 'rating_improvement', 'hours_worked', 'custom')
    ),
    goal_title VARCHAR(200) NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0.00,
    
    -- Time Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT 1,
    is_achieved BOOLEAN DEFAULT 0,
    achievement_date DATE,
    
    -- Progress Tracking
    last_calculated_at DATETIME,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance goals
CREATE INDEX IF NOT EXISTS idx_worker_performance_goals_worker_id ON worker_performance_goals(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_performance_goals_active ON worker_performance_goals(is_active);

-- ================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ================================================================

-- Trigger to update worker_customers statistics when a job is completed
CREATE TRIGGER IF NOT EXISTS update_customer_stats_on_job_completion
AFTER UPDATE ON bookings
WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
    INSERT OR REPLACE INTO worker_customers (
        worker_id, client_id, relationship_status, first_contact_date, 
        last_service_date, total_jobs_completed, total_revenue, average_job_value
    )
    SELECT 
        NEW.worker_id,
        NEW.client_id,
        COALESCE((SELECT relationship_status FROM worker_customers WHERE worker_id = NEW.worker_id AND client_id = NEW.client_id), 'active'),
        COALESCE((SELECT first_contact_date FROM worker_customers WHERE worker_id = NEW.worker_id AND client_id = NEW.client_id), NEW.created_at),
        DATE(NEW.updated_at),
        COALESCE((SELECT total_jobs_completed FROM worker_customers WHERE worker_id = NEW.worker_id AND client_id = NEW.client_id), 0) + 1,
        COALESCE((SELECT total_revenue FROM worker_customers WHERE worker_id = NEW.worker_id AND client_id = NEW.client_id), 0) + NEW.total_cost,
        (COALESCE((SELECT total_revenue FROM worker_customers WHERE worker_id = NEW.worker_id AND client_id = NEW.client_id), 0) + NEW.total_cost) / 
        (COALESCE((SELECT total_jobs_completed FROM worker_customers WHERE worker_id = NEW.worker_id AND client_id = NEW.client_id), 0) + 1);
END;

-- Trigger to update application status timestamp
CREATE TRIGGER IF NOT EXISTS update_application_status_timestamp
AFTER UPDATE ON worker_job_applications
WHEN NEW.application_status != OLD.application_status
BEGIN
    UPDATE worker_job_applications 
    SET status_changed_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on all tables
CREATE TRIGGER IF NOT EXISTS update_worker_job_applications_timestamp
AFTER UPDATE ON worker_job_applications
BEGIN
    UPDATE worker_job_applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_worker_earnings_timestamp
AFTER UPDATE ON worker_earnings
BEGIN
    UPDATE worker_earnings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_worker_customers_timestamp
AFTER UPDATE ON worker_customers
BEGIN
    UPDATE worker_customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_worker_service_analytics_timestamp
AFTER UPDATE ON worker_service_analytics
BEGIN
    UPDATE worker_service_analytics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_worker_availability_timestamp
AFTER UPDATE ON worker_availability
BEGIN
    UPDATE worker_availability SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_worker_portfolio_timestamp
AFTER UPDATE ON worker_portfolio
BEGIN
    UPDATE worker_portfolio SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_worker_dashboard_settings_timestamp
AFTER UPDATE ON worker_dashboard_settings
BEGIN
    UPDATE worker_dashboard_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_worker_performance_goals_timestamp
AFTER UPDATE ON worker_performance_goals
BEGIN
    UPDATE worker_performance_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ================================================================
-- SAMPLE DATA FOR TESTING
-- ================================================================

-- Sample worker job applications
INSERT OR IGNORE INTO worker_job_applications (
    worker_id, job_id, application_status, bid_amount, estimated_duration_hours, 
    proposed_start_date, cover_letter, applied_at
) VALUES 
(1, 1, 'applied', 250.00, 4, '2025-01-20', 'I am experienced in deep cleaning and would love to help with your house cleaning project.', '2025-01-15 10:30:00'),
(1, 2, 'accepted', 150.00, 2, '2025-01-18', 'I can fix your leaky faucet quickly and professionally.', '2025-01-14 14:15:00'),
(2, 1, 'rejected', 300.00, 5, '2025-01-22', 'Professional cleaning service with 10+ years experience.', '2025-01-15 16:45:00');

-- Sample worker earnings
INSERT OR IGNORE INTO worker_earnings (
    worker_id, transaction_type, amount, gross_amount, platform_fee, net_amount, 
    payment_status, earned_date, job_id, client_id, description
) VALUES 
(1, 'job_payment', 150.00, 150.00, 15.00, 135.00, 'completed', '2025-01-18', 2, 1, 'Kitchen faucet repair'),
(1, 'job_payment', 250.00, 250.00, 25.00, 225.00, 'pending', '2025-01-20', 1, 1, 'House deep cleaning'),
(1, 'tip', 25.00, 25.00, 0.00, 25.00, 'completed', '2025-01-18', 2, 1, 'Excellent service tip');

-- Sample worker customers
INSERT OR IGNORE INTO worker_customers (
    worker_id, client_id, relationship_status, first_contact_date, 
    last_service_date, total_jobs_completed, total_revenue, customer_notes
) VALUES 
(1, 1, 'preferred', '2025-01-10', '2025-01-18', 2, 425.00, 'Great client, always pays on time and provides clear instructions'),
(2, 1, 'active', '2025-01-15', NULL, 0, 0.00, 'New potential client');

-- Sample worker availability (Monday-Friday 9-5)
INSERT OR IGNORE INTO worker_availability (
    worker_id, availability_type, day_of_week, start_time, end_time, is_recurring
) VALUES 
(1, 'regular_hours', 1, '09:00:00', '17:00:00', 1), -- Monday
(1, 'regular_hours', 2, '09:00:00', '17:00:00', 1), -- Tuesday  
(1, 'regular_hours', 3, '09:00:00', '17:00:00', 1), -- Wednesday
(1, 'regular_hours', 4, '09:00:00', '17:00:00', 1), -- Thursday
(1, 'regular_hours', 5, '09:00:00', '17:00:00', 1), -- Friday
(1, 'time_off', NULL, NULL, NULL, 0); -- Weekend off

-- Sample portfolio items
INSERT OR IGNORE INTO worker_portfolio (
    worker_id, item_type, title, description, service_type, 
    is_featured, show_on_profile, project_date
) VALUES 
(1, 'work_sample', 'Kitchen Deep Clean Before/After', 'Complete kitchen restoration including appliances, cabinets, and floors.', 'Deep Cleaning', 1, 1, '2024-12-15'),
(1, 'certification', 'Professional Cleaning Certification', 'Certified by Canadian Cleaning Institute', 'Cleaning', 0, 1, '2024-06-01'),
(1, 'work_sample', 'Bathroom Renovation Cleanup', 'Post-construction cleaning of newly renovated bathroom.', 'Construction Cleanup', 0, 1, '2024-11-20');

-- Sample dashboard settings
INSERT OR IGNORE INTO worker_dashboard_settings (
    worker_id, default_view, email_new_jobs, sms_urgent_jobs, 
    business_hours_start, business_hours_end, default_rate, travel_radius_km
) VALUES 
(1, 'overview', 1, 1, '09:00:00', '17:00:00', 45.00, 25);

-- Sample performance goals
INSERT OR IGNORE INTO worker_performance_goals (
    worker_id, goal_type, goal_title, target_value, period_start, period_end, is_active
) VALUES 
(1, 'monthly_revenue', 'January Revenue Goal', 2000.00, '2025-01-01', '2025-01-31', 1),
(1, 'jobs_completed', 'Complete 15 Jobs This Month', 15.00, '2025-01-01', '2025-01-31', 1);

-- Sample daily analytics for current month
INSERT OR IGNORE INTO worker_service_analytics (
    worker_id, period_type, period_start_date, period_end_date,
    jobs_applied, jobs_won, jobs_completed, total_revenue, 
    average_rating, total_reviews, profile_views
) VALUES 
(1, 'daily', '2025-01-18', '2025-01-18', 2, 1, 1, 150.00, 4.8, 1, 12),
(1, 'weekly', '2025-01-13', '2025-01-19', 5, 2, 1, 150.00, 4.8, 1, 45),
(1, 'monthly', '2025-01-01', '2025-01-31', 8, 3, 2, 425.00, 4.7, 2, 120);