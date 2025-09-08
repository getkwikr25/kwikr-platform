-- Fix for compliance dashboard - Create missing critical tables

-- Security Auditing Events Table
CREATE TABLE IF NOT EXISTS security_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'failed_login', 'password_change', 'data_access', 'api_call', 'admin_action'
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  user_id INTEGER,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  endpoint TEXT, -- API endpoint or page accessed
  method TEXT, -- HTTP method
  request_data TEXT, -- JSON of request data (sanitized)
  response_status INTEGER, -- HTTP status code
  event_details TEXT, -- JSON with additional event-specific details
  risk_score INTEGER DEFAULT 0, -- 0-100 automated risk assessment
  threat_indicators TEXT, -- JSON array of detected threat indicators
  geolocation TEXT, -- JSON with location data
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME, -- When event was processed by security system
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rate Limiting Rules Table
CREATE TABLE IF NOT EXISTS rate_limit_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT NOT NULL UNIQUE,
  endpoint_pattern TEXT NOT NULL, -- Regex pattern for matching endpoints
  method_types TEXT NOT NULL, -- JSON array of HTTP methods
  limit_per_minute INTEGER DEFAULT 60,
  limit_per_hour INTEGER DEFAULT 3600,
  limit_per_day INTEGER DEFAULT 86400,
  burst_limit INTEGER DEFAULT 10, -- Allow short bursts
  user_type_restrictions TEXT, -- JSON with limits per user type
  ip_whitelist TEXT, -- JSON array of whitelisted IPs
  ip_blacklist TEXT, -- JSON array of blacklisted IPs
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100, -- Higher priority rules checked first
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rate Limiting Tracking Table
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL, -- IP address, user ID, or API key
  identifier_type TEXT NOT NULL, -- 'ip', 'user', 'api_key'
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  rule_id INTEGER,
  requests_per_minute INTEGER DEFAULT 0,
  requests_per_hour INTEGER DEFAULT 0,
  requests_per_day INTEGER DEFAULT 0,
  last_request_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  minute_window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  hour_window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  day_window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  violations_count INTEGER DEFAULT 0,
  last_violation_at DATETIME,
  is_blocked BOOLEAN DEFAULT false,
  block_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data for Rate Limiting Rules
INSERT OR IGNORE INTO rate_limit_rules (rule_name, endpoint_pattern, method_types, limit_per_minute, limit_per_hour, limit_per_day) VALUES
('api_general', '/api/.*', '["GET", "POST", "PUT", "DELETE"]', 60, 3600, 86400),
('auth_strict', '/api/auth/.*', '["POST"]', 10, 100, 1000),
('compliance_api', '/api/compliance/.*', '["GET", "POST"]', 30, 1800, 43200);

-- Sample Security Audit Events
INSERT OR IGNORE INTO security_audit_events (event_type, severity, endpoint, method, event_details) VALUES
('api_call', 'info', '/api/compliance/dashboard/overview', 'GET', '{"response_time": 25, "user_authenticated": false}'),
('api_call', 'info', '/api/auth/login', 'POST', '{"login_attempt": true, "success": true}'),
('threat_detection', 'warning', '/api/user/data', 'GET', '{"suspicious_pattern": "multiple_rapid_requests", "requests_per_minute": 45}');