-- Create remaining compliance tables needed by dashboard

-- License Authorities
CREATE TABLE IF NOT EXISTS license_authorities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  jurisdiction TEXT NOT NULL, -- 'federal', 'provincial', 'municipal'
  province_code TEXT, -- 'ON', 'BC', 'AB', etc.
  contact_info TEXT, -- JSON with contact details
  website_url TEXT,
  api_endpoint TEXT,
  verification_method TEXT NOT NULL, -- 'api', 'manual', 'scraping'
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GDPR Data Requests
CREATE TABLE IF NOT EXISTS gdpr_data_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  request_type TEXT NOT NULL, -- 'access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'
  status TEXT NOT NULL DEFAULT 'received', -- 'received', 'processing', 'completed', 'rejected', 'extended'
  request_details TEXT, -- JSON with specific request details
  identity_verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  legal_basis TEXT, -- Legal basis for processing or rejection
  response_data TEXT, -- JSON with response data
  processing_notes TEXT,
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at DATETIME,
  completed_at DATETIME,
  legal_deadline DATE, -- 30 days from request typically
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GDPR Data Breaches
CREATE TABLE IF NOT EXISTS gdpr_data_breaches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id TEXT NOT NULL UNIQUE,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  breach_type TEXT NOT NULL, -- 'confidentiality', 'integrity', 'availability'
  affected_data_types TEXT NOT NULL, -- JSON array of data types affected
  affected_users_count INTEGER DEFAULT 0,
  breach_source TEXT, -- 'internal', 'external', 'third_party', 'unknown'
  discovery_method TEXT, -- How breach was discovered
  description TEXT NOT NULL,
  impact_assessment TEXT,
  containment_measures TEXT,
  notification_required BOOLEAN DEFAULT false,
  authority_notified BOOLEAN DEFAULT false,
  users_notified BOOLEAN DEFAULT false,
  discovered_at DATETIME NOT NULL,
  contained_at DATETIME,
  authority_notification_deadline DATETIME, -- 72 hours typically
  user_notification_deadline DATETIME, -- Without undue delay
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Security Threat Detection
CREATE TABLE IF NOT EXISTS security_threat_detection (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  threat_type TEXT NOT NULL, -- 'brute_force', 'sql_injection', 'xss', 'csrf', 'suspicious_pattern', 'data_exfiltration'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  source_ip TEXT NOT NULL,
  user_id INTEGER,
  detection_method TEXT NOT NULL, -- 'pattern_matching', 'ml_model', 'rate_limiting', 'manual_review'
  threat_indicators TEXT NOT NULL, -- JSON array of indicators
  affected_endpoints TEXT, -- JSON array of affected endpoints
  attack_pattern TEXT, -- Description of attack pattern
  mitigation_applied TEXT, -- JSON of mitigation measures taken
  status TEXT NOT NULL DEFAULT 'detected', -- 'detected', 'investigating', 'mitigated', 'false_positive'
  confidence_score INTEGER NOT NULL, -- 0-100 confidence in threat detection
  first_detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Security Audit Reports
CREATE TABLE IF NOT EXISTS security_audit_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'incident', 'compliance'
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  total_events INTEGER DEFAULT 0,
  security_incidents INTEGER DEFAULT 0,
  threat_detections INTEGER DEFAULT 0,
  compliance_issues INTEGER DEFAULT 0,
  risk_summary TEXT, -- JSON with risk analysis
  recommendations TEXT, -- JSON with security recommendations
  generated_by INTEGER, -- Admin user who generated report
  report_data TEXT, -- JSON with full report data
  status TEXT NOT NULL DEFAULT 'generated', -- 'generated', 'reviewed', 'archived'
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rate Limit Violations
CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_id INTEGER,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  exceeded_limit TEXT NOT NULL, -- 'minute', 'hour', 'day', 'burst'
  limit_value INTEGER NOT NULL,
  actual_requests INTEGER NOT NULL,
  violation_severity TEXT NOT NULL DEFAULT 'warning', -- 'warning', 'block', 'escalate'
  action_taken TEXT, -- JSON describing action taken
  user_agent TEXT,
  ip_address TEXT,
  request_headers TEXT, -- JSON of relevant headers
  violation_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT OR IGNORE INTO license_authorities (name, jurisdiction, province_code, contact_info, verification_method) VALUES
('Ontario ESA', 'provincial', 'ON', '{"phone": "1-877-372-7233", "website": "https://esasafe.com"}', 'manual'),
('BC Safety Authority', 'provincial', 'BC', '{"phone": "1-866-566-7233", "website": "https://www.safetyauthority.ca"}', 'manual'),
('Alberta Safety Codes Council', 'provincial', 'AB', '{"phone": "1-888-272-5324", "website": "https://www.safetycodes.ab.ca"}', 'manual');

INSERT OR IGNORE INTO gdpr_data_requests (user_id, request_type, status, request_details, received_at) VALUES
(1, 'access', 'completed', '{"requested_data": ["profile", "activity_logs"]}', datetime('now', '-15 days')),
(2, 'erasure', 'processing', '{"reason": "account_closure"}', datetime('now', '-5 days')),
(3, 'rectification', 'received', '{"field": "email_address", "correction": "new@email.com"}', datetime('now', '-2 days'));

INSERT OR IGNORE INTO security_threat_detection (threat_type, severity, source_ip, detection_method, threat_indicators, status, confidence_score) VALUES
('brute_force', 'medium', '192.168.1.100', 'pattern_matching', '["multiple_failed_logins", "rapid_requests"]', 'mitigated', 85),
('suspicious_pattern', 'low', '10.0.0.50', 'rate_limiting', '["unusual_endpoint_access"]', 'detected', 60),
('sql_injection', 'high', '203.0.113.45', 'pattern_matching', '["sql_keywords", "special_characters"]', 'investigating', 92);