-- Add sample admin data with ALL correct column names

-- Insert admin roles first
INSERT OR IGNORE INTO admin_roles (id, role_name, description, permissions) VALUES
(1, 'Super Admin', 'Full administrative access', '["user_management", "content_moderation", "financial_reports", "system_monitoring", "feature_flags"]'),
(2, 'Admin Manager', 'User and content management', '["user_management", "content_moderation"]'),
(3, 'Content Moderator', 'Content moderation only', '["content_moderation"]'),
(4, 'System Monitor', 'System monitoring and reports', '["system_monitoring", "financial_reports"]');

-- Insert sample admin users
INSERT OR IGNORE INTO admin_users (user_id, admin_role_id, status, assigned_by) VALUES
(1, 1, 'active', 1),  -- User 1 as Super Admin
(2, 2, 'active', 1),  -- User 2 as Admin Manager  
(3, 3, 'active', 1);  -- User 3 as Content Moderator

-- Insert sample moderation queue items
INSERT OR IGNORE INTO moderation_queue (content_type, content_id, reported_by, flag_reasons, priority, status, assigned_to, auto_flagged) VALUES
('user_profile', 1, 2, 'Inappropriate profile content', 'medium', 'pending', NULL, 0),
('job_posting', 1, 3, 'Suspicious job posting', 'high', 'under_review', 1, 0),
('user_profile', 2, 1, 'Spam in bio', 'low', 'resolved', 2, 1),
('message', 5, 4, 'Harassment', 'high', 'pending', NULL, 0),
('job_posting', 3, 2, 'Duplicate posting', 'low', 'resolved', 2, 1);

-- Insert sample feature flags
INSERT OR IGNORE INTO feature_flags (flag_key, name, description, flag_type, default_value, environment, is_active, rollout_percentage, created_by) VALUES
('new_ui_design', 'New UI Design', 'Enable new user interface design', 'boolean', 'true', 'development', 1, 100, 1),
('payment_processing_v2', 'Payment Processing V2', 'Enable new payment processing system', 'boolean', 'false', 'production', 1, 25, 1),
('advanced_search', 'Advanced Search', 'Enable advanced search functionality', 'boolean', 'true', 'production', 1, 100, 1),
('mobile_app_integration', 'Mobile App Integration', 'Enable mobile app features', 'boolean', 'false', 'development', 0, 50, 1),
('ai_matching', 'AI Worker Matching', 'Enable AI-powered worker matching', 'boolean', 'false', 'staging', 0, 10, 1);

-- Insert sample admin activities (using correct column names: action, target_type, target_id, details)
INSERT OR IGNORE INTO admin_activities (admin_user_id, action, target_type, target_id, details, ip_address, user_agent) VALUES
(1, 'user_suspend', 'user', 5, 'Suspended user for policy violation', '192.168.1.1', 'Mozilla/5.0 Admin Dashboard'),
(2, 'content_approve', 'job_posting', 3, 'Approved job posting after review', '192.168.1.2', 'Mozilla/5.0 Admin Dashboard'),
(1, 'feature_toggle', 'feature_flag', 2, 'Disabled payment processing v2 feature', '192.168.1.1', 'Mozilla/5.0 Admin Dashboard'),
(3, 'content_remove', 'user_profile', 8, 'Removed inappropriate profile content', '192.168.1.3', 'Mozilla/5.0 Admin Dashboard'),
(1, 'role_assign', 'admin_user', 3, 'Assigned content moderator role', '192.168.1.1', 'Mozilla/5.0 Admin Dashboard');