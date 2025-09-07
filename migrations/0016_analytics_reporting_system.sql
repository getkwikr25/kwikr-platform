-- Analytics & Reporting System Database Schema
-- Migration: 0016_analytics_reporting_system.sql
-- Purpose: Comprehensive analytics and reporting infrastructure
-- Components: User Analytics, Business Intelligence, Performance Metrics, Custom Reports, Real-time Dashboards, Predictive Analytics

-- =============================================================================
-- 1. ANALYTICS EVENTS - Core event tracking system
-- =============================================================================

-- Main analytics events table - captures all platform interactions
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE, -- UUID for event identification
    user_id INTEGER, -- References users table, NULL for anonymous events
    session_id TEXT, -- Session tracking
    event_type TEXT NOT NULL, -- 'page_view', 'click', 'registration', 'job_post', 'job_apply', etc.
    event_category TEXT NOT NULL, -- 'user', 'job', 'payment', 'system', 'engagement'
    event_action TEXT NOT NULL, -- Specific action taken
    event_label TEXT, -- Additional event context
    event_value REAL, -- Numeric value (duration, amount, count)
    page_url TEXT, -- Current page URL
    referrer_url TEXT, -- Referrer URL
    user_agent TEXT, -- Browser user agent
    ip_address TEXT, -- Client IP (hashed for privacy)
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser_name TEXT, -- Browser identification
    os_name TEXT, -- Operating system
    country TEXT, -- Geographic location
    city TEXT, -- City location
    properties TEXT, -- JSON blob for additional event properties
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Event properties for structured data
CREATE TABLE IF NOT EXISTS analytics_event_properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    property_key TEXT NOT NULL,
    property_value TEXT NOT NULL,
    property_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES analytics_events(event_id)
);

-- =============================================================================
-- 2. USER ANALYTICS - Registration and engagement metrics
-- =============================================================================

-- User engagement summary - aggregated daily metrics per user
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    metric_date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0, -- Total seconds spent
    sessions_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    jobs_viewed INTEGER DEFAULT 0,
    jobs_applied INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    profile_updates INTEGER DEFAULT 0,
    login_count INTEGER DEFAULT 0,
    last_activity_time DATETIME,
    engagement_score REAL DEFAULT 0, -- Calculated engagement score
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, metric_date)
);

-- User lifecycle stages and progression
CREATE TABLE IF NOT EXISTS user_lifecycle_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stage TEXT NOT NULL, -- 'new', 'active', 'engaged', 'power_user', 'at_risk', 'churned'
    stage_entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    stage_duration INTEGER, -- Days in this stage
    previous_stage TEXT,
    stage_metadata TEXT, -- JSON with stage-specific data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Registration funnel tracking
CREATE TABLE IF NOT EXISTS registration_funnel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    funnel_step TEXT NOT NULL, -- 'landing', 'signup_start', 'email_entered', 'completed', 'verified'
    user_id INTEGER, -- NULL until registration complete
    referrer_source TEXT, -- Marketing channel
    landing_page TEXT,
    device_type TEXT,
    step_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    conversion_time INTEGER, -- Seconds from landing to this step
    dropped_out BOOLEAN DEFAULT 0,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================================================
-- 3. BUSINESS INTELLIGENCE - Revenue and growth analytics
-- =============================================================================

-- Revenue tracking and analysis
CREATE TABLE IF NOT EXISTS revenue_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    metric_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
    total_revenue REAL DEFAULT 0,
    subscription_revenue REAL DEFAULT 0,
    commission_revenue REAL DEFAULT 0,
    one_time_payment_revenue REAL DEFAULT 0,
    refunds_amount REAL DEFAULT 0,
    net_revenue REAL DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    paying_users_count INTEGER DEFAULT 0,
    new_paying_users INTEGER DEFAULT 0,
    churned_paying_users INTEGER DEFAULT 0,
    average_order_value REAL DEFAULT 0,
    customer_lifetime_value REAL DEFAULT 0,
    monthly_recurring_revenue REAL DEFAULT 0,
    annual_recurring_revenue REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(metric_date, metric_type)
);

-- Growth metrics and KPIs
CREATE TABLE IF NOT EXISTS growth_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    metric_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    user_retention_rate REAL DEFAULT 0,
    user_churn_rate REAL DEFAULT 0,
    jobs_posted INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    job_success_rate REAL DEFAULT 0,
    platform_utilization_rate REAL DEFAULT 0,
    user_acquisition_cost REAL DEFAULT 0,
    conversion_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(metric_date, metric_type)
);

-- Marketing channel performance
CREATE TABLE IF NOT EXISTS marketing_channel_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    channel_name TEXT NOT NULL, -- 'organic', 'paid_search', 'social', 'email', 'referral', 'direct'
    channel_source TEXT, -- Specific source within channel
    visitors INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate REAL DEFAULT 0,
    cost REAL DEFAULT 0,
    revenue REAL DEFAULT 0,
    roi REAL DEFAULT 0,
    customer_acquisition_cost REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(metric_date, channel_name, channel_source)
);

-- =============================================================================
-- 4. PERFORMANCE METRICS - Job completion rates and satisfaction
-- =============================================================================

-- Job performance analytics
CREATE TABLE IF NOT EXISTS job_performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    job_category TEXT,
    job_subcategory TEXT,
    jobs_posted INTEGER DEFAULT 0,
    jobs_with_applications INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    jobs_cancelled INTEGER DEFAULT 0,
    avg_time_to_first_application REAL DEFAULT 0, -- Hours
    avg_time_to_completion REAL DEFAULT 0, -- Hours
    avg_applications_per_job REAL DEFAULT 0,
    completion_rate REAL DEFAULT 0,
    client_satisfaction_avg REAL DEFAULT 0,
    worker_satisfaction_avg REAL DEFAULT 0,
    avg_job_value REAL DEFAULT 0,
    dispute_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(metric_date, job_category, job_subcategory)
);

-- Platform performance metrics
CREATE TABLE IF NOT EXISTS platform_performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    response_time_avg REAL DEFAULT 0, -- Average API response time in ms
    response_time_p95 REAL DEFAULT 0, -- 95th percentile response time
    error_rate REAL DEFAULT 0, -- Percentage of failed requests
    uptime_percentage REAL DEFAULT 100,
    concurrent_users INTEGER DEFAULT 0,
    page_load_time_avg REAL DEFAULT 0, -- Average page load time
    database_query_time_avg REAL DEFAULT 0,
    memory_usage_percentage REAL DEFAULT 0,
    cpu_usage_percentage REAL DEFAULT 0,
    request_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User satisfaction surveys and feedback
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id TEXT NOT NULL UNIQUE,
    user_id INTEGER,
    job_id INTEGER,
    survey_type TEXT NOT NULL, -- 'job_completion', 'platform_experience', 'nps'
    overall_rating INTEGER, -- 1-5 or 1-10 scale
    nps_score INTEGER, -- Net Promoter Score (0-10)
    feedback_text TEXT,
    satisfaction_categories TEXT, -- JSON with category ratings
    improvement_suggestions TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- =============================================================================
-- 5. CUSTOM REPORTS - Exportable data reports
-- =============================================================================

-- Custom report definitions
CREATE TABLE IF NOT EXISTS custom_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    report_name TEXT NOT NULL,
    report_description TEXT,
    created_by_user_id INTEGER,
    report_type TEXT NOT NULL, -- 'standard', 'custom', 'scheduled'
    data_sources TEXT NOT NULL, -- JSON array of table/view names
    filters TEXT, -- JSON with filter criteria
    grouping_columns TEXT, -- JSON array of columns to group by
    aggregation_functions TEXT, -- JSON with aggregation specs
    sort_order TEXT, -- JSON with sorting specification
    output_format TEXT DEFAULT 'json', -- 'json', 'csv', 'excel', 'pdf'
    schedule_frequency TEXT, -- NULL, 'daily', 'weekly', 'monthly'
    schedule_time TIME,
    is_public BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    last_generated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Generated report instances
CREATE TABLE IF NOT EXISTS generated_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_instance_id TEXT NOT NULL UNIQUE,
    custom_report_id INTEGER NOT NULL,
    generated_by_user_id INTEGER,
    report_data TEXT, -- JSON with report results
    file_path TEXT, -- Path to exported file if applicable
    file_size INTEGER, -- File size in bytes
    generation_time_ms INTEGER, -- Time taken to generate
    row_count INTEGER, -- Number of data rows
    date_range_start DATE,
    date_range_end DATE,
    parameters TEXT, -- JSON with generation parameters
    status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    error_message TEXT,
    expires_at DATETIME, -- Auto-cleanup date
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (custom_report_id) REFERENCES custom_reports(id),
    FOREIGN KEY (generated_by_user_id) REFERENCES users(id)
);

-- Report sharing and access
CREATE TABLE IF NOT EXISTS report_access (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    custom_report_id INTEGER NOT NULL,
    shared_with_user_id INTEGER,
    shared_with_role TEXT, -- 'admin', 'manager', 'analyst'
    access_level TEXT NOT NULL, -- 'view', 'edit', 'admin'
    granted_by_user_id INTEGER NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    
    FOREIGN KEY (custom_report_id) REFERENCES custom_reports(id),
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id),
    FOREIGN KEY (granted_by_user_id) REFERENCES users(id)
);

-- =============================================================================
-- 6. PREDICTIVE ANALYTICS - Demand forecasting and trend prediction
-- =============================================================================

-- Demand forecasting models and predictions
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    forecast_id TEXT NOT NULL UNIQUE,
    forecast_type TEXT NOT NULL, -- 'job_demand', 'user_growth', 'revenue', 'seasonal'
    category TEXT, -- Job category or metric category
    forecast_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    forecast_date DATE NOT NULL,
    predicted_value REAL NOT NULL,
    confidence_interval_lower REAL,
    confidence_interval_upper REAL,
    confidence_score REAL, -- 0-1 confidence in prediction
    model_version TEXT, -- Version of prediction model used
    model_accuracy REAL, -- Historical accuracy of model
    training_data_period_start DATE,
    training_data_period_end DATE,
    factors_considered TEXT, -- JSON with model input factors
    seasonal_adjustments TEXT, -- JSON with seasonal factors
    trend_direction TEXT, -- 'increasing', 'decreasing', 'stable'
    trend_strength REAL, -- Strength of trend (0-1)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(forecast_type, category, forecast_period, forecast_date)
);

-- Trend analysis and pattern detection
CREATE TABLE IF NOT EXISTS trend_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id TEXT NOT NULL UNIQUE,
    analysis_type TEXT NOT NULL, -- 'user_behavior', 'job_patterns', 'revenue_trends'
    metric_name TEXT NOT NULL,
    time_period TEXT NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
    trend_start_date DATE NOT NULL,
    trend_end_date DATE NOT NULL,
    trend_type TEXT NOT NULL, -- 'linear', 'exponential', 'seasonal', 'cyclic'
    trend_slope REAL, -- Rate of change
    correlation_strength REAL, -- Statistical correlation strength
    statistical_significance REAL, -- P-value or confidence level
    seasonal_pattern TEXT, -- JSON with seasonal components
    anomalies_detected INTEGER DEFAULT 0,
    pattern_description TEXT,
    business_impact TEXT, -- Description of business implications
    recommended_actions TEXT, -- JSON with suggested actions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(analysis_type, metric_name, time_period, trend_start_date)
);

-- Predictive model performance tracking
CREATE TABLE IF NOT EXISTS model_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_type TEXT NOT NULL, -- 'regression', 'classification', 'time_series'
    version TEXT NOT NULL,
    training_date DATETIME NOT NULL,
    validation_accuracy REAL,
    test_accuracy REAL,
    precision_score REAL,
    recall_score REAL,
    f1_score REAL,
    mean_absolute_error REAL,
    root_mean_square_error REAL,
    training_data_size INTEGER,
    feature_count INTEGER,
    hyperparameters TEXT, -- JSON with model parameters
    feature_importance TEXT, -- JSON with feature weights
    model_file_path TEXT, -- Path to serialized model
    is_active BOOLEAN DEFAULT 1,
    performance_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(model_id, version)
);

-- Real-time prediction cache
CREATE TABLE IF NOT EXISTS prediction_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT NOT NULL UNIQUE,
    model_id TEXT NOT NULL,
    input_features TEXT NOT NULL, -- JSON with input data
    prediction_result TEXT NOT NULL, -- JSON with prediction output
    confidence_score REAL,
    computation_time_ms INTEGER,
    cache_expiry DATETIME NOT NULL,
    hit_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Analytics Events Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category_action ON analytics_events(event_category, event_action);

-- User Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_date ON user_engagement_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_user_lifecycle_user_id ON user_lifecycle_stages(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_funnel_session ON registration_funnel(session_id);
CREATE INDEX IF NOT EXISTS idx_registration_funnel_user ON registration_funnel(user_id);

-- Business Intelligence Indexes
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_date_type ON revenue_metrics(metric_date, metric_type);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_date_type ON growth_metrics(metric_date, metric_type);
CREATE INDEX IF NOT EXISTS idx_marketing_channel_date ON marketing_channel_metrics(metric_date, channel_name);

-- Performance Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_job_performance_date_category ON job_performance_metrics(metric_date, job_category);
CREATE INDEX IF NOT EXISTS idx_platform_performance_timestamp ON platform_performance_metrics(metric_timestamp);
CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_user ON satisfaction_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_job ON satisfaction_surveys(job_id);

-- Custom Reports Indexes
CREATE INDEX IF NOT EXISTS idx_custom_reports_created_by ON custom_reports(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_custom_id ON generated_reports(custom_report_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_by ON generated_reports(generated_by_user_id);
CREATE INDEX IF NOT EXISTS idx_report_access_report_id ON report_access(custom_report_id);

-- Predictive Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_type_date ON demand_forecasts(forecast_type, forecast_date);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_type_metric ON trend_analysis(analysis_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_model_performance_model_version ON model_performance(model_id, version);
CREATE INDEX IF NOT EXISTS idx_prediction_cache_key ON prediction_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_prediction_cache_expiry ON prediction_cache(cache_expiry);

-- =============================================================================
-- VIEWS FOR COMMON ANALYTICS QUERIES
-- =============================================================================

-- Real-time dashboard metrics view
CREATE VIEW IF NOT EXISTS realtime_dashboard_metrics AS
SELECT 
    'users' as metric_category,
    COUNT(*) as total_count,
    SUM(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 ELSE 0 END) as last_24h,
    SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as last_7d,
    SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END) as last_30d
FROM users
UNION ALL
SELECT 
    'jobs',
    COUNT(*),
    SUM(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 ELSE 0 END),
    SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END),
    SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END)
FROM jobs
UNION ALL
SELECT 
    'applications',
    COUNT(*),
    SUM(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 ELSE 0 END),
    SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END),
    SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END)
FROM job_applications;

-- User engagement summary view
CREATE VIEW IF NOT EXISTS user_engagement_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.user_type,
    u.created_at as registration_date,
    COALESCE(SUM(uem.page_views), 0) as total_page_views,
    COALESCE(SUM(uem.session_duration), 0) as total_session_duration,
    COALESCE(AVG(uem.engagement_score), 0) as avg_engagement_score,
    COUNT(DISTINCT uem.metric_date) as active_days,
    MAX(uem.last_activity_time) as last_activity,
    CASE 
        WHEN MAX(uem.last_activity_time) >= datetime('now', '-7 days') THEN 'active'
        WHEN MAX(uem.last_activity_time) >= datetime('now', '-30 days') THEN 'at_risk'
        ELSE 'churned'
    END as user_status
FROM users u
LEFT JOIN user_engagement_metrics uem ON u.id = uem.user_id
GROUP BY u.id, u.email, u.user_type, u.created_at;

-- Revenue analytics view
CREATE VIEW IF NOT EXISTS revenue_analytics_summary AS
SELECT 
    rm.metric_date,
    rm.total_revenue,
    rm.net_revenue,
    rm.paying_users_count,
    rm.average_order_value,
    rm.monthly_recurring_revenue,
    gm.new_users,
    gm.active_users,
    gm.conversion_rate,
    CASE 
        WHEN gm.new_users > 0 THEN rm.total_revenue / gm.new_users 
        ELSE 0 
    END as revenue_per_new_user,
    CASE 
        WHEN rm.paying_users_count > 0 THEN rm.total_revenue / rm.paying_users_count 
        ELSE 0 
    END as revenue_per_paying_user
FROM revenue_metrics rm
LEFT JOIN growth_metrics gm ON rm.metric_date = gm.metric_date AND rm.metric_type = gm.metric_type
WHERE rm.metric_type = 'daily'
ORDER BY rm.metric_date DESC;