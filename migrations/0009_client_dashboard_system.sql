-- =============================================================================
-- CLIENT DASHBOARD SYSTEM DATABASE SCHEMA
-- =============================================================================
-- This migration creates comprehensive client dashboard functionality with:
-- 1. Client Profile Management - Account settings and preferences
-- 2. Job Management Dashboard - Posted jobs tracking and management
-- 3. Favorite Workers - Save and manage preferred service providers
-- 4. Payment Methods - Credit cards and payment options management
-- 5. Service History - Complete booking and service history tracking
-- 6. Notification Preferences - Email/SMS settings and communication preferences
-- =============================================================================

-- Client Profiles Extended (Enhanced user_profiles for clients)
CREATE TABLE IF NOT EXISTS client_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    
    -- Personal Information
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Preferences
    preferred_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'America/Toronto',
    communication_preference TEXT DEFAULT 'email' CHECK (communication_preference IN ('email', 'sms', 'both', 'none')),
    
    -- Service Preferences
    default_service_radius INTEGER DEFAULT 50, -- km
    preferred_service_times TEXT, -- JSON array of preferred time slots
    special_instructions TEXT,
    accessibility_requirements TEXT,
    
    -- Account Settings
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted', 'pending_verification')),
    privacy_level TEXT DEFAULT 'standard' CHECK (privacy_level IN ('public', 'standard', 'private')),
    marketing_consent BOOLEAN DEFAULT FALSE,
    data_sharing_consent BOOLEAN DEFAULT FALSE,
    
    -- Verification and Security
    identity_verified BOOLEAN DEFAULT FALSE,
    identity_verification_date DATETIME,
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Favorite Workers (Client's saved preferred service providers)
CREATE TABLE IF NOT EXISTS client_favorite_workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    worker_id INTEGER NOT NULL,
    
    -- Favorite Details
    nickname TEXT, -- Custom name client gives to this worker
    favorite_category TEXT, -- Why they're favorited: 'quality', 'price', 'reliability', etc.
    notes TEXT, -- Personal notes about this worker
    priority_level INTEGER DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5), -- 1=highest priority
    
    -- Statistics
    times_hired INTEGER DEFAULT 0,
    last_hired_date DATETIME,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    auto_invite BOOLEAN DEFAULT FALSE, -- Auto-invite to new job postings
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(client_id, worker_id)
);

-- Client Payment Methods (Credit cards and payment options)
CREATE TABLE IF NOT EXISTS client_payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    
    -- Payment Method Details
    payment_type TEXT NOT NULL CHECK (payment_type IN ('credit_card', 'debit_card', 'bank_account', 'paypal', 'apple_pay', 'google_pay')),
    provider TEXT NOT NULL, -- 'visa', 'mastercard', 'amex', 'interac', etc.
    
    -- Card/Account Information (encrypted/tokenized)
    masked_number TEXT NOT NULL, -- Last 4 digits: "**** **** **** 1234"
    expiry_month INTEGER,
    expiry_year INTEGER,
    cardholder_name TEXT,
    
    -- External Payment Processor Data
    stripe_payment_method_id TEXT,
    stripe_customer_id TEXT,
    
    -- Billing Address
    billing_address_line1 TEXT,
    billing_address_line2 TEXT,
    billing_city TEXT,
    billing_province TEXT,
    billing_postal_code TEXT,
    billing_country TEXT DEFAULT 'CA',
    
    -- Settings
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    auto_pay_enabled BOOLEAN DEFAULT FALSE,
    
    -- Security and Verification
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    last_verified_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service History Enhanced (Complete booking and service tracking)
CREATE TABLE IF NOT EXISTS client_service_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    worker_id INTEGER NOT NULL,
    
    -- Service Details
    service_category TEXT NOT NULL,
    service_description TEXT,
    service_date DATE NOT NULL,
    duration_minutes INTEGER,
    
    -- Financial Information
    quoted_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'disputed')),
    payment_method_id INTEGER,
    
    -- Service Quality
    completion_status TEXT CHECK (completion_status IN ('completed', 'cancelled', 'no_show', 'rescheduled')),
    client_satisfaction_score INTEGER CHECK (client_satisfaction_score >= 1 AND client_satisfaction_score <= 10),
    would_rehire BOOLEAN,
    
    -- Review and Feedback
    review_id INTEGER, -- Links to reviews table
    review_submitted BOOLEAN DEFAULT FALSE,
    feedback_provided BOOLEAN DEFAULT FALSE,
    
    -- Worker Performance Tracking
    worker_punctuality_rating INTEGER CHECK (worker_punctuality_rating >= 1 AND worker_punctuality_rating <= 5),
    worker_quality_rating INTEGER CHECK (worker_quality_rating >= 1 AND worker_quality_rating <= 5),
    worker_communication_rating INTEGER CHECK (worker_communication_rating >= 1 AND worker_communication_rating <= 5),
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    warranty_applicable BOOLEAN DEFAULT FALSE,
    warranty_end_date DATE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notification Preferences (Email/SMS settings)
CREATE TABLE IF NOT EXISTS client_notification_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL UNIQUE,
    
    -- Communication Channels
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    
    -- Notification Categories
    
    -- Job and Booking Related
    new_bid_notifications BOOLEAN DEFAULT TRUE,
    booking_confirmations BOOLEAN DEFAULT TRUE,
    booking_reminders BOOLEAN DEFAULT TRUE,
    booking_cancellations BOOLEAN DEFAULT TRUE,
    schedule_changes BOOLEAN DEFAULT TRUE,
    
    -- Worker Communication
    worker_messages BOOLEAN DEFAULT TRUE,
    worker_updates BOOLEAN DEFAULT TRUE,
    emergency_communications BOOLEAN DEFAULT TRUE,
    
    -- Reviews and Feedback
    review_requests BOOLEAN DEFAULT TRUE,
    review_responses BOOLEAN DEFAULT TRUE,
    
    -- Payment and Billing
    payment_confirmations BOOLEAN DEFAULT TRUE,
    payment_reminders BOOLEAN DEFAULT TRUE,
    invoice_notifications BOOLEAN DEFAULT TRUE,
    refund_notifications BOOLEAN DEFAULT TRUE,
    
    -- Marketing and Promotions
    promotional_emails BOOLEAN DEFAULT FALSE,
    service_recommendations BOOLEAN DEFAULT TRUE,
    seasonal_offers BOOLEAN DEFAULT FALSE,
    newsletter BOOLEAN DEFAULT FALSE,
    
    -- System and Security
    security_alerts BOOLEAN DEFAULT TRUE,
    account_updates BOOLEAN DEFAULT TRUE,
    policy_changes BOOLEAN DEFAULT TRUE,
    system_maintenance BOOLEAN DEFAULT FALSE,
    
    -- Frequency Settings
    digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    
    -- Contact Information
    notification_email TEXT,
    notification_phone TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job Posting Management (Enhanced job tracking for clients)
CREATE TABLE IF NOT EXISTS client_job_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL, -- Links to main jobs table
    
    -- Job Management
    post_status TEXT DEFAULT 'active' CHECK (post_status IN ('draft', 'active', 'paused', 'closed', 'cancelled')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invited_only')),
    priority_level INTEGER DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
    
    -- Bidding Management
    total_bids INTEGER DEFAULT 0,
    active_bids INTEGER DEFAULT 0,
    shortlisted_bids INTEGER DEFAULT 0,
    min_bid_amount DECIMAL(10,2),
    max_bid_amount DECIMAL(10,2),
    average_bid_amount DECIMAL(10,2),
    
    -- Timeline Management
    application_deadline DATETIME,
    preferred_start_date DATE,
    estimated_duration_days INTEGER,
    
    -- Performance Tracking
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    
    -- Worker Invitations
    invited_workers TEXT, -- JSON array of worker IDs invited directly
    auto_invite_favorites BOOLEAN DEFAULT FALSE,
    
    -- Selection Process
    selected_worker_id INTEGER,
    selection_date DATETIME,
    selection_reason TEXT,
    
    -- Completion Tracking
    completion_status TEXT CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
    completion_date DATETIME,
    final_payment_amount DECIMAL(10,2),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Client Dashboard Analytics (Usage statistics and insights)
CREATE TABLE IF NOT EXISTS client_dashboard_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL UNIQUE,
    
    -- Account Statistics
    days_since_signup INTEGER DEFAULT 0,
    total_jobs_posted INTEGER DEFAULT 0,
    total_services_received INTEGER DEFAULT 0,
    total_amount_spent DECIMAL(10,2) DEFAULT 0.00,
    
    -- Recent Activity (Last 30 days)
    recent_jobs_posted INTEGER DEFAULT 0,
    recent_services_received INTEGER DEFAULT 0,
    recent_amount_spent DECIMAL(10,2) DEFAULT 0.00,
    recent_logins INTEGER DEFAULT 0,
    
    -- Worker Relationships
    total_workers_hired INTEGER DEFAULT 0,
    favorite_workers_count INTEGER DEFAULT 0,
    repeat_hire_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    
    -- Service Categories
    most_used_service_category TEXT,
    service_categories_used INTEGER DEFAULT 0,
    
    -- Quality Metrics
    average_satisfaction_rating DECIMAL(3,2) DEFAULT 0.00,
    reviews_submitted INTEGER DEFAULT 0,
    reviews_received INTEGER DEFAULT 0,
    
    -- Platform Engagement
    profile_completion_percentage INTEGER DEFAULT 0,
    last_activity_date DATETIME,
    total_platform_time_minutes INTEGER DEFAULT 0,
    
    -- Preferences and Behavior
    preferred_booking_day TEXT, -- Most common day of week
    preferred_booking_time TEXT, -- Most common time
    average_project_budget DECIMAL(10,2) DEFAULT 0.00,
    
    last_calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Client Profiles
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_account_status ON client_profiles(account_status);

-- Favorite Workers
CREATE INDEX IF NOT EXISTS idx_favorite_workers_client_id ON client_favorite_workers(client_id);
CREATE INDEX IF NOT EXISTS idx_favorite_workers_worker_id ON client_favorite_workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_favorite_workers_active ON client_favorite_workers(is_active);
CREATE INDEX IF NOT EXISTS idx_favorite_workers_priority ON client_favorite_workers(client_id, priority_level);

-- Payment Methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_client_id ON client_payment_methods(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON client_payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON client_payment_methods(client_id, is_default);

-- Service History
CREATE INDEX IF NOT EXISTS idx_service_history_client_id ON client_service_history(client_id);
CREATE INDEX IF NOT EXISTS idx_service_history_booking_id ON client_service_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_service_history_worker_id ON client_service_history(worker_id);
CREATE INDEX IF NOT EXISTS idx_service_history_service_date ON client_service_history(service_date);
CREATE INDEX IF NOT EXISTS idx_service_history_completion ON client_service_history(completion_status);

-- Job Posts
CREATE INDEX IF NOT EXISTS idx_job_posts_client_id ON client_job_posts(client_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_job_id ON client_job_posts(job_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON client_job_posts(post_status);
CREATE INDEX IF NOT EXISTS idx_job_posts_selected_worker ON client_job_posts(selected_worker_id);

-- Notification Preferences
CREATE INDEX IF NOT EXISTS idx_notification_prefs_client_id ON client_notification_preferences(client_id);

-- Dashboard Analytics
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_client_id ON client_dashboard_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_last_activity ON client_dashboard_analytics(last_activity_date);

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Initialize client profiles for existing client users
INSERT OR IGNORE INTO client_profiles (user_id, preferred_language, timezone) 
SELECT id, 'en', 'America/Toronto' FROM users WHERE role = 'client';

-- Initialize notification preferences for existing client users
INSERT OR IGNORE INTO client_notification_preferences (client_id) 
SELECT id FROM users WHERE role = 'client';

-- Initialize dashboard analytics for existing client users
INSERT OR IGNORE INTO client_dashboard_analytics (client_id) 
SELECT id FROM users WHERE role = 'client';

-- Sample favorite workers (if we have test data)
INSERT OR IGNORE INTO client_favorite_workers (client_id, worker_id, nickname, favorite_category, notes, priority_level) VALUES 
(1, 4, 'Sarah the Cleaner', 'quality', 'Always does excellent work, very reliable and thorough', 1),
(1, 5, 'Mike the Plumber', 'reliability', 'Available on short notice, fair pricing', 2);

-- Sample payment methods (test data only)
INSERT OR IGNORE INTO client_payment_methods (client_id, payment_type, provider, masked_number, cardholder_name, is_default) VALUES 
(1, 'credit_card', 'visa', '**** **** **** 1234', 'Demo Client', TRUE),
(1, 'credit_card', 'mastercard', '**** **** **** 5678', 'Demo Client', FALSE);

-- =============================================================================
-- VIEWS FOR EASY QUERYING
-- =============================================================================

-- Client Dashboard Summary View
CREATE VIEW IF NOT EXISTS client_dashboard_summary AS
SELECT 
    u.id as client_id,
    u.first_name,
    u.last_name,
    u.email,
    cp.account_status,
    cp.identity_verified,
    cp.phone_verified,
    cp.email_verified,
    cda.total_jobs_posted,
    cda.total_services_received,
    cda.total_amount_spent,
    cda.favorite_workers_count,
    cda.average_satisfaction_rating,
    cda.last_activity_date,
    COUNT(DISTINCT cfh.id) as recent_bookings_count,
    AVG(cfh.client_satisfaction_score) as recent_satisfaction
FROM users u
LEFT JOIN client_profiles cp ON u.id = cp.user_id
LEFT JOIN client_dashboard_analytics cda ON u.id = cda.client_id
LEFT JOIN client_service_history cfh ON u.id = cfh.client_id AND cfh.service_date >= date('now', '-30 days')
WHERE u.role = 'client'
GROUP BY u.id;

-- Active Job Posts View
CREATE VIEW IF NOT EXISTS client_active_jobs_view AS
SELECT 
    cjp.*,
    j.title as job_title,
    j.description as job_description,
    j.budget_min,
    j.budget_max,
    j.location,
    j.created_at as job_created_at,
    COUNT(DISTINCT b.id) as total_bids
FROM client_job_posts cjp
JOIN jobs j ON cjp.job_id = j.id
LEFT JOIN bids b ON j.id = b.job_id
WHERE cjp.post_status IN ('active', 'paused')
GROUP BY cjp.id;

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update client analytics when new bookings are completed
CREATE TRIGGER IF NOT EXISTS update_client_analytics_on_service_completion
AFTER UPDATE ON bookings
WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
    -- Update service history
    INSERT OR REPLACE INTO client_service_history (
        client_id, booking_id, worker_id, service_category, 
        service_date, quoted_amount, completion_status
    ) VALUES (
        NEW.client_id, NEW.id, NEW.user_id, NEW.service_category,
        date(NEW.booking_date), NEW.estimated_cost, 'completed'
    );
    
    -- Update dashboard analytics
    UPDATE client_dashboard_analytics 
    SET 
        total_services_received = total_services_received + 1,
        recent_services_received = recent_services_received + 1,
        total_amount_spent = total_amount_spent + COALESCE(NEW.estimated_cost, 0),
        recent_amount_spent = recent_amount_spent + COALESCE(NEW.estimated_cost, 0),
        last_calculated_at = CURRENT_TIMESTAMP
    WHERE client_id = NEW.client_id;
END;

-- Update analytics when jobs are posted
CREATE TRIGGER IF NOT EXISTS update_client_analytics_on_job_post
AFTER INSERT ON jobs
BEGIN
    -- Create job post record
    INSERT OR REPLACE INTO client_job_posts (client_id, job_id, post_status) 
    VALUES (NEW.client_id, NEW.id, 'active');
    
    -- Update analytics
    UPDATE client_dashboard_analytics 
    SET 
        total_jobs_posted = total_jobs_posted + 1,
        recent_jobs_posted = recent_jobs_posted + 1,
        last_calculated_at = CURRENT_TIMESTAMP
    WHERE client_id = NEW.client_id;
END;

-- =============================================================================
-- SCHEMA COMPLETE
-- =============================================================================