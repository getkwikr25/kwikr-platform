-- Admin Panel & Management System Migration
-- Creates comprehensive administrative system with 6 core components:
-- 1. Admin Dashboard - Platform overview and metrics
-- 2. User Management - Admin user controls  
-- 3. Content Moderation - Review posts, profiles, messages
-- 4. Financial Reporting - Revenue and commission reports
-- 5. System Monitoring - Performance and error tracking
-- 6. Feature Flags - Enable/disable platform features

-- ====================================
-- 1. ADMIN USERS & ROLES SYSTEM
-- ====================================

-- Admin roles with hierarchical permissions
CREATE TABLE IF NOT EXISTS admin_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT NOT NULL, -- JSON array of permission strings
    hierarchy_level INTEGER NOT NULL DEFAULT 1, -- 1=lowest, 10=highest
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users with role-based access
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- References main users table
    admin_role_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, suspended, inactive
    assigned_by INTEGER, -- Admin who assigned this role
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    login_count INTEGER DEFAULT 0,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_role_id) REFERENCES admin_roles(id),
    FOREIGN KEY (assigned_by) REFERENCES admin_users(id)
);

-- Admin activity logging
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT, -- user, post, file, etc.
    target_id INTEGER,
    details TEXT, -- JSON details of the action
    ip_address TEXT,
    user_agent TEXT,
    severity TEXT DEFAULT 'info', -- info, warning, critical
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);

-- ====================================
-- 2. CONTENT MODERATION SYSTEM
-- ====================================

-- Content moderation queue
CREATE TABLE IF NOT EXISTS moderation_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL, -- post, profile, message, file, comment
    content_id INTEGER NOT NULL,
    reported_by INTEGER, -- User who reported (if applicable)
    auto_flagged BOOLEAN DEFAULT FALSE,
    flag_reasons TEXT, -- JSON array of flag reasons
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, escalated
    assigned_to INTEGER, -- Admin assigned to review
    reviewed_by INTEGER, -- Admin who made decision
    reviewed_at DATETIME,
    review_notes TEXT,
    action_taken TEXT, -- approved, removed, edited, warned
    escalation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES admin_users(id),
    FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
);

-- Content moderation history
CREATE TABLE IF NOT EXISTS moderation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    queue_id INTEGER NOT NULL,
    admin_user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (queue_id) REFERENCES moderation_queue(id),
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);

-- User warnings and sanctions
CREATE TABLE IF NOT EXISTS user_sanctions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    admin_user_id INTEGER NOT NULL,
    sanction_type TEXT NOT NULL, -- warning, temporary_ban, permanent_ban, content_restriction
    reason TEXT NOT NULL,
    duration_hours INTEGER, -- NULL for permanent
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME, -- Calculated based on duration
    status TEXT DEFAULT 'active', -- active, expired, revoked
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);

-- ====================================
-- 3. FINANCIAL REPORTING SYSTEM
-- ====================================

-- Revenue tracking
CREATE TABLE IF NOT EXISTS revenue_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_type TEXT NOT NULL, -- subscription, commission, fee, refund
    user_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT, -- stripe, paypal, crypto
    transaction_id TEXT, -- External payment provider ID
    commission_rate DECIMAL(5,2), -- For commission-based transactions
    platform_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL, -- Amount after fees
    status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
    processed_at DATETIME,
    category TEXT, -- subscription, booking, premium_feature
    description TEXT,
    metadata TEXT, -- JSON additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Financial reports cache
CREATE TABLE IF NOT EXISTS financial_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_type TEXT NOT NULL, -- daily, weekly, monthly, quarterly, yearly
    report_date DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_commissions DECIMAL(10,2) DEFAULT 0,
    total_fees DECIMAL(10,2) DEFAULT 0,
    total_refunds DECIMAL(10,2) DEFAULT 0,
    net_profit DECIMAL(10,2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    report_data TEXT, -- JSON detailed breakdown
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    generated_by INTEGER,
    UNIQUE(report_type, report_date),
    FOREIGN KEY (generated_by) REFERENCES admin_users(id)
);

-- ====================================
-- 4. SYSTEM MONITORING
-- ====================================

-- System performance metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL, -- cpu, memory, disk, network, response_time, error_rate
    metric_value DECIMAL(10,4) NOT NULL,
    unit TEXT NOT NULL, -- percent, ms, mb, gb, requests_per_second
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT, -- server, worker, database, cdn
    metadata TEXT -- JSON additional context
);

-- Error tracking
CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    error_type TEXT NOT NULL, -- javascript, server, database, network
    error_code TEXT,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id INTEGER,
    user_agent TEXT,
    ip_address TEXT,
    url TEXT,
    request_method TEXT,
    request_body TEXT,
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    status TEXT DEFAULT 'open', -- open, investigating, resolved, ignored
    assigned_to INTEGER,
    resolution_notes TEXT,
    resolved_at DATETIME,
    occurrence_count INTEGER DEFAULT 1,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES admin_users(id)
);

-- System alerts and notifications
CREATE TABLE IF NOT EXISTS system_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL, -- performance, security, error, maintenance
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info', -- info, warning, error, critical
    status TEXT DEFAULT 'active', -- active, acknowledged, resolved
    threshold_value DECIMAL(10,4),
    current_value DECIMAL(10,4),
    auto_generated BOOLEAN DEFAULT FALSE,
    acknowledged_by INTEGER,
    acknowledged_at DATETIME,
    resolved_by INTEGER,
    resolved_at DATETIME,
    resolution_notes TEXT,
    metadata TEXT, -- JSON alert context
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (acknowledged_by) REFERENCES admin_users(id),
    FOREIGN KEY (resolved_by) REFERENCES admin_users(id)
);

-- ====================================
-- 5. FEATURE FLAGS SYSTEM
-- ====================================

-- Feature flag definitions
CREATE TABLE IF NOT EXISTS feature_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_key TEXT NOT NULL UNIQUE, -- Unique identifier for the flag
    name TEXT NOT NULL,
    description TEXT,
    flag_type TEXT DEFAULT 'boolean', -- boolean, string, number, json
    default_value TEXT NOT NULL, -- Default value as string
    environment TEXT DEFAULT 'production', -- development, staging, production
    status TEXT DEFAULT 'active', -- active, inactive, archived
    rollout_percentage INTEGER DEFAULT 0, -- 0-100 for gradual rollouts
    target_users TEXT, -- JSON array of specific user IDs
    target_conditions TEXT, -- JSON conditions for targeting
    created_by INTEGER NOT NULL,
    updated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id),
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);

-- Feature flag usage history
CREATE TABLE IF NOT EXISTS feature_flag_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_id INTEGER NOT NULL,
    admin_user_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- created, updated, enabled, disabled, archived
    previous_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    rollout_percentage INTEGER,
    affected_users INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flag_id) REFERENCES feature_flags(id),
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);

-- Feature flag evaluations (for analytics)
CREATE TABLE IF NOT EXISTS feature_flag_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_id INTEGER NOT NULL,
    user_id INTEGER,
    evaluated_value TEXT NOT NULL,
    evaluation_context TEXT, -- JSON context used for evaluation
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flag_id) REFERENCES feature_flags(id)
);

-- ====================================
-- 6. DASHBOARD METRICS VIEWS
-- ====================================

-- Dashboard summary cache for performance
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_key TEXT NOT NULL UNIQUE,
    metric_value TEXT NOT NULL, -- JSON value
    last_calculated DATETIME DEFAULT CURRENT_TIMESTAMP,
    calculation_duration_ms INTEGER,
    expires_at DATETIME,
    auto_refresh BOOLEAN DEFAULT TRUE
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Admin system indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_user ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_logs(action);

-- Content moderation indexes
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_type ON moderation_queue(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned ON moderation_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created ON moderation_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sanctions_user ON user_sanctions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sanctions_status ON user_sanctions(status);
CREATE INDEX IF NOT EXISTS idx_user_sanctions_type ON user_sanctions(sanction_type);

-- Financial reporting indexes
CREATE INDEX IF NOT EXISTS idx_revenue_records_type ON revenue_records(transaction_type);
CREATE INDEX IF NOT EXISTS idx_revenue_records_user ON revenue_records(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_status ON revenue_records(status);
CREATE INDEX IF NOT EXISTS idx_revenue_records_created ON revenue_records(created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_records_processed ON revenue_records(processed_at);
CREATE INDEX IF NOT EXISTS idx_financial_reports_type_date ON financial_reports(report_type, report_date);

-- System monitoring indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON error_logs(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);

-- Feature flags indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_status ON feature_flags(status);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);
CREATE INDEX IF NOT EXISTS idx_feature_flag_evaluations_flag ON feature_flag_evaluations(flag_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_evaluations_user ON feature_flag_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_evaluations_timestamp ON feature_flag_evaluations(timestamp);

-- Dashboard metrics indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_key ON dashboard_metrics(metric_key);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_expires ON dashboard_metrics(expires_at);

-- ====================================
-- TRIGGERS FOR AUTOMATION
-- ====================================

-- Update admin_users.updated_at on changes
CREATE TRIGGER IF NOT EXISTS trigger_admin_users_updated_at
    AFTER UPDATE ON admin_users
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE admin_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update moderation_queue.updated_at on changes
CREATE TRIGGER IF NOT EXISTS trigger_moderation_queue_updated_at
    AFTER UPDATE ON moderation_queue
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE moderation_queue SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Auto-calculate end_date for user sanctions
CREATE TRIGGER IF NOT EXISTS trigger_user_sanctions_end_date
    AFTER INSERT ON user_sanctions
    FOR EACH ROW
    WHEN NEW.duration_hours IS NOT NULL
BEGIN
    UPDATE user_sanctions 
    SET end_date = datetime(NEW.start_date, '+' || NEW.duration_hours || ' hours')
    WHERE id = NEW.id;
END;

-- Update error log occurrence count
CREATE TRIGGER IF NOT EXISTS trigger_error_logs_occurrence_count
    BEFORE INSERT ON error_logs
    FOR EACH ROW
BEGIN
    UPDATE error_logs 
    SET occurrence_count = occurrence_count + 1,
        last_seen = CURRENT_TIMESTAMP
    WHERE error_type = NEW.error_type 
      AND error_message = NEW.error_message
      AND status = 'open';
    
    -- If no existing error was updated, this is a new error
    SELECT CASE 
        WHEN changes() = 0 THEN 
            NEW.occurrence_count
        ELSE 
            0 -- This will prevent the INSERT
    END;
END;

-- Update feature_flags.updated_at on changes
CREATE TRIGGER IF NOT EXISTS trigger_feature_flags_updated_at
    AFTER UPDATE ON feature_flags
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE feature_flags SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ====================================
-- INITIAL DATA SETUP
-- ====================================

-- Insert default admin roles
INSERT OR IGNORE INTO admin_roles (name, description, permissions, hierarchy_level) VALUES
('Super Admin', 'Full system access with all permissions', '["*"]', 10),
('Admin', 'Standard admin with most permissions', '["user_management", "content_moderation", "financial_reports", "system_monitoring", "feature_flags"]', 8),
('Moderator', 'Content moderation and user management', '["content_moderation", "user_management"]', 5),
('Support', 'User support and basic monitoring', '["user_management", "system_monitoring"]', 3),
('Analyst', 'Read-only access to reports and analytics', '["financial_reports", "system_monitoring"]', 2);

-- Insert default feature flags
INSERT OR IGNORE INTO feature_flags (flag_key, name, description, flag_type, default_value, created_by, status) VALUES
('maintenance_mode', 'Maintenance Mode', 'Enable/disable maintenance mode for the platform', 'boolean', 'false', 1, 'active'),
('file_upload_enabled', 'File Upload Feature', 'Enable/disable file upload functionality', 'boolean', 'true', 1, 'active'),
('premium_features', 'Premium Features', 'Enable premium features for paid users', 'boolean', 'true', 1, 'active'),
('new_user_registration', 'New User Registration', 'Allow new users to register', 'boolean', 'true', 1, 'active'),
('content_moderation', 'Content Moderation', 'Enable automatic content moderation', 'boolean', 'true', 1, 'active'),
('analytics_tracking', 'Analytics Tracking', 'Enable user analytics and tracking', 'boolean', 'true', 1, 'active'),
('max_file_size_mb', 'Maximum File Size', 'Maximum file size in MB', 'number', '100', 1, 'active'),
('notification_system', 'Notification System', 'Enable push notifications', 'boolean', 'true', 1, 'active');

-- Insert initial dashboard metrics
INSERT OR IGNORE INTO dashboard_metrics (metric_key, metric_value, expires_at) VALUES
('total_users', '{"value": 0, "change": 0, "period": "24h"}', datetime('now', '+1 hour')),
('total_revenue', '{"value": 0, "change": 0, "period": "24h"}', datetime('now', '+1 hour')),
('active_sessions', '{"value": 0, "change": 0, "period": "24h"}', datetime('now', '+15 minutes')),
('error_rate', '{"value": 0, "change": 0, "period": "24h"}', datetime('now', '+5 minutes')),
('moderation_queue', '{"value": 0, "change": 0, "period": "24h"}', datetime('now', '+1 hour'));

-- ====================================
-- MIGRATION COMPLETION
-- ====================================

-- Log migration completion
INSERT INTO admin_activity_logs (admin_user_id, action, details, created_at) 
SELECT 1, 'migration_completed', 
       '{"migration": "0015_admin_management_system", "tables_created": 15, "indexes_created": 25, "triggers_created": 5}',
       CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM admin_users WHERE id = 1);