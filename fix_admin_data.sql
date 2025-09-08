-- Add sample admin data to make admin panel functional

-- Insert sample admin users
INSERT OR IGNORE INTO admin_users (user_id, role_id, permissions, is_super_admin, created_by, created_at, status) VALUES
(1, 1, '["user_management", "content_moderation", "financial_reports", "system_monitoring", "feature_flags"]', 1, 1, datetime('now'), 'active'),
(2, 2, '["user_management", "content_moderation"]', 0, 1, datetime('now'), 'active'),
(3, 3, '["content_moderation"]', 0, 1, datetime('now'), 'active');

-- Insert admin roles
INSERT OR IGNORE INTO admin_roles (id, name, description, permissions, created_at) VALUES
(1, 'Super Admin', 'Full administrative access', '["user_management", "content_moderation", "financial_reports", "system_monitoring", "feature_flags"]', datetime('now')),
(2, 'Admin Manager', 'User and content management', '["user_management", "content_moderation"]', datetime('now')),
(3, 'Content Moderator', 'Content moderation only', '["content_moderation"]', datetime('now')),
(4, 'System Monitor', 'System monitoring and reports', '["system_monitoring", "financial_reports"]', datetime('now'));

-- Insert sample moderation queue items
INSERT OR IGNORE INTO moderation_queue (content_type, content_id, reported_by, reason, status, severity, content_preview, created_at, assigned_to) VALUES
('user_profile', 1, 2, 'Inappropriate profile content', 'pending', 'medium', 'User profile contains potentially inappropriate content...', datetime('now', '-2 hours'), NULL),
('job_posting', 1, 3, 'Suspicious job posting', 'under_review', 'high', 'Job posting appears to be fraudulent...', datetime('now', '-4 hours'), 1),
('user_profile', 2, 1, 'Spam in bio', 'resolved', 'low', 'User bio contains spam links...', datetime('now', '-1 day'), 2),
('message', 5, 4, 'Harassment', 'pending', 'high', 'Message contains threatening language...', datetime('now', '-30 minutes'), NULL),
('job_posting', 3, 2, 'Duplicate posting', 'resolved', 'low', 'Duplicate job posting detected...', datetime('now', '-3 days'), 2);

-- Insert sample feature flags
INSERT OR IGNORE INTO feature_flags (flag_key, name, description, is_enabled, environment, rollout_percentage, conditions, created_by, created_at) VALUES
('new_ui_design', 'New UI Design', 'Enable new user interface design', 1, 'development', 100, '{}', 1, datetime('now')),
('payment_processing_v2', 'Payment Processing V2', 'Enable new payment processing system', 0, 'production', 25, '{"user_types": ["premium"]}', 1, datetime('now')),
('advanced_search', 'Advanced Search', 'Enable advanced search functionality', 1, 'production', 100, '{}', 1, datetime('now')),
('mobile_app_integration', 'Mobile App Integration', 'Enable mobile app features', 0, 'development', 50, '{}', 1, datetime('now')),
('ai_matching', 'AI Worker Matching', 'Enable AI-powered worker matching', 0, 'staging', 10, '{"min_jobs": 5}', 1, datetime('now'));

-- Insert sample admin activities
INSERT OR IGNORE INTO admin_activities (admin_user_id, action_type, entity_type, entity_id, description, ip_address, user_agent, created_at) VALUES
(1, 'user_suspend', 'user', 5, 'Suspended user for policy violation', '192.168.1.1', 'Mozilla/5.0 Admin Dashboard', datetime('now', '-2 hours')),
(2, 'content_approve', 'job_posting', 3, 'Approved job posting after review', '192.168.1.2', 'Mozilla/5.0 Admin Dashboard', datetime('now', '-4 hours')),
(1, 'feature_toggle', 'feature_flag', 2, 'Disabled payment processing v2 feature', '192.168.1.1', 'Mozilla/5.0 Admin Dashboard', datetime('now', '-1 day')),
(3, 'content_remove', 'user_profile', 8, 'Removed inappropriate profile content', '192.168.1.3', 'Mozilla/5.0 Admin Dashboard', datetime('now', '-3 hours')),
(1, 'role_assign', 'admin_user', 3, 'Assigned content moderator role', '192.168.1.1', 'Mozilla/5.0 Admin Dashboard', datetime('now', '-5 days'));