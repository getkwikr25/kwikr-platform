-- Marketing & Growth System Database Schema
-- This migration creates comprehensive tables for all marketing and growth components

-- =============================================================================
-- REFERRAL SYSTEM TABLES
-- =============================================================================

-- Referral programs and configurations
CREATE TABLE IF NOT EXISTS referral_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    referrer_reward_type TEXT NOT NULL DEFAULT 'credit', -- 'credit', 'cash', 'discount'
    referrer_reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    referee_reward_type TEXT NOT NULL DEFAULT 'discount', -- 'credit', 'cash', 'discount'
    referee_reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    minimum_referee_spend DECIMAL(10,2) DEFAULT 0.00,
    maximum_referrals_per_user INTEGER DEFAULT NULL, -- NULL means unlimited
    program_start_date DATETIME NOT NULL,
    program_end_date DATETIME DEFAULT NULL, -- NULL means no end date
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User referral relationships and tracking
CREATE TABLE IF NOT EXISTS user_referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referral_code TEXT UNIQUE NOT NULL,
    referrer_id INTEGER NOT NULL,
    referee_id INTEGER DEFAULT NULL, -- NULL until someone signs up with the code
    program_id INTEGER NOT NULL,
    referral_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rewarded', 'cancelled'
    referee_signup_date DATETIME DEFAULT NULL,
    referee_first_purchase_date DATETIME DEFAULT NULL,
    referee_first_purchase_amount DECIMAL(10,2) DEFAULT 0.00,
    referrer_reward_given BOOLEAN DEFAULT FALSE,
    referee_reward_given BOOLEAN DEFAULT FALSE,
    referrer_reward_date DATETIME DEFAULT NULL,
    referee_reward_date DATETIME DEFAULT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referee_id) REFERENCES users(id),
    FOREIGN KEY (program_id) REFERENCES referral_programs(id)
);

-- Referral rewards tracking
CREATE TABLE IF NOT EXISTS referral_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    referral_id INTEGER NOT NULL,
    reward_type TEXT NOT NULL, -- 'credit', 'cash', 'discount'
    reward_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CAD',
    reward_status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'paid', 'cancelled'
    transaction_id INTEGER DEFAULT NULL,
    processed_date DATETIME DEFAULT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (referral_id) REFERENCES user_referrals(id)
);

-- =============================================================================
-- PROMOTIONAL CODES SYSTEM TABLES
-- =============================================================================

-- Promotional campaigns and discount codes
CREATE TABLE IF NOT EXISTS promotional_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL, -- 'discount_percent', 'discount_fixed', 'free_service', 'bogo'
    discount_type TEXT DEFAULT 'percent', -- 'percent', 'fixed_amount', 'free_service'
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount_amount DECIMAL(10,2) DEFAULT NULL,
    usage_limit_total INTEGER DEFAULT NULL, -- NULL means unlimited
    usage_limit_per_user INTEGER DEFAULT 1,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    applicable_services TEXT, -- JSON array of service category IDs
    target_user_type TEXT DEFAULT 'all', -- 'all', 'new_users', 'existing_users', 'specific_segment'
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Individual promotional codes
CREATE TABLE IF NOT EXISTS promotional_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES promotional_campaigns(id)
);

-- Code usage tracking
CREATE TABLE IF NOT EXISTS promotional_code_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    job_id INTEGER DEFAULT NULL,
    booking_id INTEGER DEFAULT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    usage_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES promotional_codes(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- =============================================================================
-- EMAIL MARKETING SYSTEM TABLES
-- =============================================================================

-- Email marketing campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    sender_name TEXT DEFAULT 'Kwikr Directory',
    sender_email TEXT DEFAULT 'noreply@kwikr.directory',
    template_id INTEGER DEFAULT NULL,
    campaign_type TEXT DEFAULT 'newsletter', -- 'newsletter', 'promotional', 'transactional', 'welcome', 'follow_up'
    target_audience TEXT DEFAULT 'all', -- 'all', 'subscribers', 'customers', 'workers', 'custom_segment'
    audience_filters TEXT, -- JSON filters for custom segments
    scheduled_date DATETIME DEFAULT NULL,
    sent_date DATETIME DEFAULT NULL,
    campaign_status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Email templates for campaigns
CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'welcome', 'newsletter', 'promotional', 'transactional'
    subject_template TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables TEXT, -- JSON array of available variables
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Newsletter subscribers and preferences
CREATE TABLE IF NOT EXISTS email_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT NULL, -- NULL for non-user subscribers
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    subscription_source TEXT DEFAULT 'website', -- 'website', 'signup', 'import', 'api'
    subscriber_type TEXT DEFAULT 'general', -- 'general', 'worker', 'client', 'partner'
    subscription_status TEXT DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
    email_preferences TEXT, -- JSON of email type preferences
    subscribed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_date DATETIME DEFAULT NULL,
    last_activity_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Email campaign delivery and engagement tracking
CREATE TABLE IF NOT EXISTS email_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    subscriber_id INTEGER NOT NULL,
    email_address TEXT NOT NULL,
    delivery_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'bounced', 'failed'
    sent_date DATETIME DEFAULT NULL,
    delivered_date DATETIME DEFAULT NULL,
    opened_date DATETIME DEFAULT NULL,
    last_clicked_date DATETIME DEFAULT NULL,
    click_count INTEGER DEFAULT 0,
    unsubscribed_date DATETIME DEFAULT NULL,
    bounce_reason TEXT DEFAULT NULL,
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id),
    FOREIGN KEY (subscriber_id) REFERENCES email_subscribers(id)
);

-- =============================================================================
-- SOCIAL MEDIA INTEGRATION TABLES
-- =============================================================================

-- Social media platform configurations
CREATE TABLE IF NOT EXISTS social_platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_name TEXT NOT NULL, -- 'facebook', 'google', 'twitter', 'linkedin', 'instagram'
    platform_display_name TEXT NOT NULL,
    client_id TEXT,
    client_secret TEXT, -- This should be encrypted in production
    api_endpoints TEXT, -- JSON configuration for API endpoints
    is_login_enabled BOOLEAN DEFAULT FALSE,
    is_sharing_enabled BOOLEAN DEFAULT FALSE,
    login_redirect_url TEXT,
    sharing_api_url TEXT,
    icon_class TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User social media accounts and connections
CREATE TABLE IF NOT EXISTS user_social_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    social_user_id TEXT NOT NULL, -- User ID from the social platform
    social_username TEXT,
    social_email TEXT,
    social_profile_data TEXT, -- JSON data from social platform
    access_token TEXT, -- Encrypted in production
    refresh_token TEXT, -- Encrypted in production
    token_expires_at DATETIME DEFAULT NULL,
    connection_status TEXT DEFAULT 'active', -- 'active', 'expired', 'revoked', 'disconnected'
    first_connected_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (platform_id) REFERENCES social_platforms(id),
    UNIQUE(platform_id, social_user_id)
);

-- Social sharing tracking and analytics
CREATE TABLE IF NOT EXISTS social_shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT NULL,
    platform_id INTEGER NOT NULL,
    content_type TEXT NOT NULL, -- 'job_listing', 'worker_profile', 'service', 'general'
    content_id INTEGER DEFAULT NULL, -- ID of the shared content
    share_url TEXT NOT NULL,
    share_title TEXT,
    share_description TEXT,
    share_image_url TEXT DEFAULT NULL,
    share_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    click_count INTEGER DEFAULT 0,
    engagement_data TEXT, -- JSON for platform-specific engagement metrics
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (platform_id) REFERENCES social_platforms(id)
);

-- =============================================================================
-- AFFILIATE PROGRAM TABLES
-- =============================================================================

-- Affiliate program configurations and tiers
CREATE TABLE IF NOT EXISTS affiliate_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_name TEXT NOT NULL,
    description TEXT,
    commission_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount', 'tiered'
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Percentage or fixed amount
    commission_tiers TEXT, -- JSON for tiered commission structure
    cookie_duration_days INTEGER DEFAULT 30, -- How long to track referrals
    minimum_payout_amount DECIMAL(10,2) DEFAULT 50.00,
    payment_schedule TEXT DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly'
    program_terms TEXT, -- Full terms and conditions
    approval_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate partners and their details
CREATE TABLE IF NOT EXISTS affiliates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT NULL, -- Can be linked to existing user account
    affiliate_code TEXT UNIQUE NOT NULL,
    company_name TEXT,
    contact_person TEXT NOT NULL,
    contact_email TEXT UNIQUE NOT NULL,
    contact_phone TEXT,
    website_url TEXT,
    social_media_urls TEXT, -- JSON of social media profiles
    promotional_methods TEXT, -- How they plan to promote
    target_audience TEXT, -- Their audience description
    application_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
    approval_date DATETIME DEFAULT NULL,
    program_id INTEGER NOT NULL,
    payment_details TEXT, -- JSON with payment information
    tax_information TEXT, -- JSON with tax details
    performance_tier TEXT DEFAULT 'standard', -- 'standard', 'silver', 'gold', 'platinum'
    total_referrals INTEGER DEFAULT 0,
    total_commissions_earned DECIMAL(10,2) DEFAULT 0.00,
    total_commissions_paid DECIMAL(10,2) DEFAULT 0.00,
    last_activity_date DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (program_id) REFERENCES affiliate_programs(id)
);

-- Affiliate referral tracking
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER NOT NULL,
    referred_user_id INTEGER DEFAULT NULL, -- NULL until conversion
    referral_code TEXT NOT NULL,
    source_url TEXT, -- Where the referral came from
    landing_page_url TEXT, -- Where they landed
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referral_status TEXT DEFAULT 'click', -- 'click', 'signup', 'conversion', 'paid'
    click_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    signup_date DATETIME DEFAULT NULL,
    conversion_date DATETIME DEFAULT NULL,
    conversion_amount DECIMAL(10,2) DEFAULT 0.00,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    commission_paid_date DATETIME DEFAULT NULL,
    FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
    FOREIGN KEY (referred_user_id) REFERENCES users(id)
);

-- Affiliate commission payments
CREATE TABLE IF NOT EXISTS affiliate_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER NOT NULL,
    payment_period_start DATE NOT NULL,
    payment_period_end DATE NOT NULL,
    total_referrals INTEGER DEFAULT 0,
    total_commission_amount DECIMAL(10,2) NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL, -- Might differ from commission due to adjustments
    payment_method TEXT NOT NULL, -- 'bank_transfer', 'paypal', 'check', 'stripe'
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed', 'cancelled'
    payment_reference TEXT, -- Payment processor reference
    payment_date DATETIME DEFAULT NULL,
    payment_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
);

-- =============================================================================
-- SHARED MARKETING ANALYTICS AND TRACKING TABLES
-- =============================================================================

-- Campaign performance tracking across all marketing channels
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL, -- 'referral', 'promotional', 'email', 'social', 'affiliate'
    campaign_source_id INTEGER, -- ID from respective campaign table
    campaign_budget DECIMAL(10,2) DEFAULT 0.00,
    campaign_spent DECIMAL(10,2) DEFAULT 0.00,
    start_date DATETIME NOT NULL,
    end_date DATETIME DEFAULT NULL,
    target_metrics TEXT, -- JSON with target KPIs
    actual_metrics TEXT, -- JSON with actual results
    roi DECIMAL(5,2) DEFAULT 0.00, -- Return on investment percentage
    campaign_status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Marketing attribution and conversion tracking
CREATE TABLE IF NOT EXISTS marketing_attributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id TEXT,
    attribution_type TEXT NOT NULL, -- 'referral', 'promo_code', 'email_click', 'social_share', 'affiliate'
    source_campaign_id INTEGER,
    source_details TEXT, -- JSON with source-specific details
    touchpoint_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    conversion_event TEXT, -- 'signup', 'first_booking', 'subscription', 'purchase'
    conversion_date DATETIME DEFAULT NULL,
    conversion_value DECIMAL(10,2) DEFAULT 0.00,
    attribution_weight DECIMAL(3,2) DEFAULT 1.00, -- For multi-touch attribution
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Marketing automation workflows
CREATE TABLE IF NOT EXISTS marketing_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_name TEXT NOT NULL,
    workflow_type TEXT NOT NULL, -- 'welcome_series', 'abandoned_cart', 'win_back', 'upsell'
    trigger_event TEXT NOT NULL, -- 'user_signup', 'email_open', 'inactivity', 'purchase'
    trigger_conditions TEXT, -- JSON conditions for triggering
    workflow_steps TEXT NOT NULL, -- JSON array of workflow steps
    is_active BOOLEAN DEFAULT TRUE,
    total_triggered INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- User workflow enrollments and progress
CREATE TABLE IF NOT EXISTS user_workflow_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    workflow_id INTEGER NOT NULL,
    enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    current_step INTEGER DEFAULT 0,
    enrollment_status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'failed'
    completion_date DATETIME DEFAULT NULL,
    workflow_data TEXT, -- JSON data for personalization
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (workflow_id) REFERENCES marketing_workflows(id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Referral System Indexes
CREATE INDEX IF NOT EXISTS idx_referral_programs_active ON referral_programs(is_active, program_start_date, program_end_date);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referee ON user_referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_status ON user_referrals(referral_status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(reward_status);

-- Promotional Codes Indexes
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_active ON promotional_campaigns(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_code ON promotional_codes(code);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_campaign ON promotional_codes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user ON promotional_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_date ON promotional_code_usage(usage_date);

-- Email Marketing Indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_type ON email_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_campaign ON email_deliveries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_status ON email_deliveries(delivery_status);

-- Social Media Indexes
CREATE INDEX IF NOT EXISTS idx_social_platforms_active ON social_platforms(is_active);
CREATE INDEX IF NOT EXISTS idx_user_social_accounts_user ON user_social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_social_accounts_platform ON user_social_accounts(platform_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_date ON social_shares(share_date);

-- Affiliate Program Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_active ON affiliate_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(contact_email);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(application_status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_code ON affiliate_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(referral_status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_affiliate ON affiliate_payments(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_status ON affiliate_payments(payment_status);

-- Marketing Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_marketing_attributions_user ON marketing_attributions(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_attributions_type ON marketing_attributions(attribution_type);
CREATE INDEX IF NOT EXISTS idx_marketing_attributions_date ON marketing_attributions(touchpoint_date);
CREATE INDEX IF NOT EXISTS idx_marketing_workflows_active ON marketing_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_user_workflow_enrollments_user ON user_workflow_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workflow_enrollments_status ON user_workflow_enrollments(enrollment_status);

-- =============================================================================
-- SAMPLE DATA FOR DEVELOPMENT AND TESTING
-- =============================================================================

-- Insert default referral program
INSERT OR IGNORE INTO referral_programs (
    name, description, referrer_reward_type, referrer_reward_amount,
    referee_reward_type, referee_reward_amount, program_start_date
) VALUES (
    'Default Referral Program',
    'Refer friends and earn rewards when they complete their first booking',
    'credit', 25.00,
    'discount', 15.00,
    datetime('now')
);

-- Insert sample social platforms
INSERT OR IGNORE INTO social_platforms (platform_name, platform_display_name, is_login_enabled, is_sharing_enabled, icon_class, sort_order) VALUES
('facebook', 'Facebook', TRUE, TRUE, 'fab fa-facebook', 1),
('google', 'Google', TRUE, FALSE, 'fab fa-google', 2),
('twitter', 'Twitter/X', FALSE, TRUE, 'fab fa-x-twitter', 3),
('linkedin', 'LinkedIn', TRUE, TRUE, 'fab fa-linkedin', 4),
('instagram', 'Instagram', FALSE, TRUE, 'fab fa-instagram', 5);

-- Insert default affiliate program
INSERT OR IGNORE INTO affiliate_programs (
    program_name, description, commission_type, commission_rate,
    minimum_payout_amount, program_terms
) VALUES (
    'Partner Referral Program',
    'Earn commission by referring new clients and workers to our platform',
    'percentage', 5.00,
    100.00,
    'Standard affiliate terms apply. Commissions paid monthly for completed bookings.'
);

-- Insert sample email templates
INSERT OR IGNORE INTO email_templates (template_name, template_type, subject_template, html_content, text_content, variables) VALUES
('Welcome New User', 'welcome', 'Welcome to Kwikr Directory, {{first_name}}!', 
 '<h1>Welcome {{first_name}}!</h1><p>Thanks for joining Kwikr Directory. Get started by exploring our services.</p>',
 'Welcome {{first_name}}! Thanks for joining Kwikr Directory. Get started by exploring our services.',
 '["first_name", "email", "signup_date"]'),
('Monthly Newsletter', 'newsletter', 'Kwikr Directory Monthly Update - {{month}} {{year}}',
 '<h1>Monthly Update</h1><p>Here are the latest updates and featured services from Kwikr Directory.</p>',
 'Monthly Update: Here are the latest updates and featured services from Kwikr Directory.',
 '["first_name", "month", "year", "featured_services"]'),
('Promotional Campaign', 'promotional', 'Special Offer: {{discount}}% Off Your Next Service!',
 '<h1>Special Offer!</h1><p>Use code {{promo_code}} to get {{discount}}% off your next booking.</p>',
 'Special Offer! Use code {{promo_code}} to get {{discount}}% off your next booking.',
 '["first_name", "discount", "promo_code", "expiry_date"]');

-- Insert sample marketing workflow
INSERT OR IGNORE INTO marketing_workflows (
    workflow_name, workflow_type, trigger_event, trigger_conditions, workflow_steps
) VALUES (
    'Welcome Email Series',
    'welcome_series',
    'user_signup',
    '{"user_type": "any", "delay_hours": 1}',
    '[
        {"step": 1, "type": "email", "template_id": 1, "delay_hours": 1},
        {"step": 2, "type": "email", "template_id": 2, "delay_hours": 72},
        {"step": 3, "type": "email", "template_id": 3, "delay_hours": 168}
    ]'
);