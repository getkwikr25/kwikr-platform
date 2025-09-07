-- Create admin role hierarchy first
CREATE TABLE IF NOT EXISTS admin_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT, -- JSON array of permissions
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, -- References users table
  admin_role_id INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  assigned_by INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_role_id) REFERENCES admin_roles(id)
);

-- Insert default admin roles with comprehensive permissions
INSERT OR REPLACE INTO admin_roles (id, role_name, description, permissions) VALUES
(1, 'Super Admin', 'Full system access', '["user_management","content_moderation","financial_reports","system_monitoring","feature_flags","admin_management"]'),
(2, 'Admin Manager', 'User and content management', '["user_management","content_moderation","system_monitoring"]'),
(3, 'Financial Manager', 'Financial reporting access', '["financial_reports","system_monitoring"]'),
(4, 'Content Moderator', 'Content moderation only', '["content_moderation"]'),
(5, 'System Monitor', 'Read-only system monitoring', '["system_monitoring"]');

-- Create a test user first (admin user needs to reference users table)
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, city, province, is_verified, created_at) VALUES
(1, 'admin@kwikr.ca', '$2b$10$dummyhash', 'Kwikr', 'Administrator', 'admin', 'Toronto', 'Ontario', 1, datetime('now'));

-- Create the first super admin user
INSERT OR REPLACE INTO admin_users (id, user_id, admin_role_id, status, notes) VALUES
(1, 1, 1, 'active', 'Initial super admin user for platform management');

-- Create admin activities table for logging
CREATE TABLE IF NOT EXISTS admin_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  details TEXT, -- JSON details
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);

-- Create moderation queue table
CREATE TABLE IF NOT EXISTS moderation_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL, -- 'profile', 'job', 'message', 'review'
  content_id INTEGER NOT NULL,
  reported_by INTEGER,
  flag_reasons TEXT, -- JSON array
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  status TEXT DEFAULT 'pending', -- pending, in_review, approved, rejected, escalated
  assigned_to INTEGER,
  reviewed_by INTEGER,
  review_notes TEXT,
  auto_flagged INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES admin_users(id),
  FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
);

-- Create system metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_type TEXT NOT NULL,
  metric_value REAL NOT NULL,
  unit TEXT,
  tags TEXT, -- JSON
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  request_url TEXT,
  request_method TEXT,
  user_id INTEGER,
  severity TEXT DEFAULT 'error', -- debug, info, warn, error, critical
  status TEXT DEFAULT 'new', -- new, acknowledged, resolved, ignored
  resolved_by INTEGER,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resolved_by) REFERENCES admin_users(id)
);

-- Create feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flag_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  flag_type TEXT DEFAULT 'boolean', -- boolean, string, number, json
  default_value TEXT NOT NULL,
  environment TEXT DEFAULT 'all', -- development, staging, production, all
  is_active INTEGER DEFAULT 1,
  rollout_percentage INTEGER DEFAULT 100,
  targeting_rules TEXT, -- JSON
  created_by INTEGER,
  updated_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admin_users(id),
  FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);

-- Insert some initial feature flags
INSERT OR REPLACE INTO feature_flags (flag_key, name, description, default_value, created_by) VALUES
('enable_stripe_payments', 'Stripe Payments', 'Enable Stripe payment processing', 'true', 1),
('enable_user_messaging', 'User Messaging', 'Enable direct messaging between users', 'true', 1),
('enable_job_posting', 'Job Posting', 'Enable clients to post new jobs', 'true', 1),
('maintenance_mode', 'Maintenance Mode', 'Enable maintenance mode banner', 'false', 1);

-- Create revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_type TEXT NOT NULL, -- subscription, commission, fee, refund
  user_id INTEGER,
  job_id INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  stripe_transaction_id TEXT,
  description TEXT,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample metrics for testing
INSERT OR REPLACE INTO system_metrics (metric_type, metric_value, unit) VALUES
('active_users', 150, 'count'),
('total_jobs', 450, 'count'),
('revenue_today', 1250.00, 'CAD'),
('response_time_avg', 245, 'ms'),
('error_rate', 0.02, 'percentage');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_user_id ON admin_activities(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type_time ON system_metrics(metric_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_status ON error_logs(severity, status);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment, is_active);