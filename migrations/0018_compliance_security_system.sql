-- Compliance & Security System Migration
-- Created: 2025-09-07
-- Components: Background Checks, Insurance Verification, License Verification, GDPR Compliance, Security Auditing, Rate Limiting

-- Background Check Integration Tables
CREATE TABLE IF NOT EXISTS background_check_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  api_endpoint TEXT NOT NULL,
  api_key_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  supported_check_types TEXT NOT NULL, -- JSON array of check types
  response_time_sla INTEGER DEFAULT 24, -- hours
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS background_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  check_type TEXT NOT NULL, -- 'criminal', 'employment', 'education', 'reference', 'identity'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'expired'
  external_check_id TEXT, -- Provider's reference ID
  request_data TEXT, -- JSON of submitted data
  result_data TEXT, -- JSON of check results
  verification_score INTEGER, -- 0-100 score
  risk_level TEXT, -- 'low', 'medium', 'high', 'critical'
  expiry_date DATETIME,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES background_check_providers(id)
);

-- Insurance Verification Tables
CREATE TABLE IF NOT EXISTS insurance_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  contact_info TEXT, -- JSON with phone, email, address
  api_endpoint TEXT,
  verification_method TEXT NOT NULL, -- 'api', 'manual', 'document'
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  policy_number TEXT NOT NULL,
  policy_type TEXT NOT NULL, -- 'liability', 'professional', 'workers_comp', 'auto', 'equipment'
  coverage_amount DECIMAL(15,2) NOT NULL,
  deductible_amount DECIMAL(15,2),
  effective_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'suspended'
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'expired'
  verification_date DATETIME,
  certificate_url TEXT, -- Link to insurance certificate
  policy_document TEXT, -- JSON metadata about uploaded documents
  auto_renewal BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES insurance_providers(id)
);

-- License Verification Tables
CREATE TABLE IF NOT EXISTS license_authorities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL, -- State, country, or region
  license_types TEXT NOT NULL, -- JSON array of license types they issue
  verification_endpoint TEXT,
  verification_method TEXT NOT NULL, -- 'api', 'website_scraping', 'manual'
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professional_licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  authority_id INTEGER NOT NULL,
  license_number TEXT NOT NULL,
  license_type TEXT NOT NULL, -- 'contractor', 'electrical', 'plumbing', 'hvac', 'real_estate', etc.
  license_category TEXT, -- Additional categorization if needed
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'suspended', 'revoked'
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'expired'
  verification_date DATETIME,
  verification_reference TEXT, -- External verification reference
  license_document TEXT, -- JSON metadata about uploaded license documents
  renewal_required BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (authority_id) REFERENCES license_authorities(id)
);

-- GDPR Compliance Tables
CREATE TABLE IF NOT EXISTS gdpr_consent_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  email TEXT, -- For non-registered users
  consent_type TEXT NOT NULL, -- 'marketing', 'analytics', 'cookies', 'data_processing', 'profiling'
  consent_status BOOLEAN NOT NULL,
  consent_method TEXT NOT NULL, -- 'explicit_opt_in', 'implicit_acceptance', 'legitimate_interest'
  purpose_description TEXT NOT NULL,
  legal_basis TEXT NOT NULL, -- 'consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'
  data_categories TEXT, -- JSON array of data categories covered
  retention_period INTEGER, -- Days
  withdrawal_method TEXT, -- How user can withdraw consent
  ip_address TEXT,
  user_agent TEXT,
  consent_given_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  consent_withdrawn_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS gdpr_data_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  email TEXT NOT NULL, -- For identification
  request_type TEXT NOT NULL, -- 'access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected', 'partially_completed'
  request_details TEXT, -- JSON with specific request details
  identity_verified BOOLEAN DEFAULT false,
  verification_method TEXT, -- How identity was verified
  processing_notes TEXT,
  response_data TEXT, -- JSON with response/data provided
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  legal_deadline DATE, -- 30 days from request typically
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

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

-- Security Auditing Tables
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Rate Limiting Tables
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

CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL, -- IP address, user ID, or API key
  identifier_type TEXT NOT NULL, -- 'ip', 'user', 'api_key'
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  rule_id INTEGER NOT NULL,
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES rate_limit_rules(id)
);

CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_id INTEGER NOT NULL,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tracking_id) REFERENCES rate_limit_tracking(id)
);

-- Indexes for Performance Optimization

-- Background Checks Indexes
CREATE INDEX IF NOT EXISTS idx_background_checks_user_id ON background_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_background_checks_status ON background_checks(status);
CREATE INDEX IF NOT EXISTS idx_background_checks_expiry ON background_checks(expiry_date);
CREATE INDEX IF NOT EXISTS idx_background_checks_type ON background_checks(check_type);

-- Insurance Verification Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_expiry ON insurance_policies(expiry_date);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_verification ON insurance_policies(verification_status);

-- License Verification Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON professional_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_expiry ON professional_licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON professional_licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_type ON professional_licenses(license_type);

-- GDPR Compliance Indexes
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_user_id ON gdpr_consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_email ON gdpr_consent_records(email);
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_type ON gdpr_consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email ON gdpr_data_requests(email);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON gdpr_data_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_deadline ON gdpr_data_requests(legal_deadline);
CREATE INDEX IF NOT EXISTS idx_gdpr_breaches_severity ON gdpr_data_breaches(severity);
CREATE INDEX IF NOT EXISTS idx_gdpr_breaches_discovered ON gdpr_data_breaches(discovered_at);

-- Security Auditing Indexes
CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON security_audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_type ON security_audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_events_severity ON security_audit_events(severity);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON security_audit_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_events_ip ON security_audit_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_threat_detection_ip ON security_threat_detection(source_ip);
CREATE INDEX IF NOT EXISTS idx_threat_detection_type ON security_threat_detection(threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_detection_severity ON security_threat_detection(severity);
CREATE INDEX IF NOT EXISTS idx_threat_detection_status ON security_threat_detection(status);

-- Rate Limiting Indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_identifier ON rate_limit_tracking(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_endpoint ON rate_limit_tracking(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_last_request ON rate_limit_tracking(last_request_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_identifier ON rate_limit_violations(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_endpoint ON rate_limit_violations(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_time ON rate_limit_violations(violation_at);

-- Composite Indexes for Complex Queries
CREATE INDEX IF NOT EXISTS idx_background_checks_user_status ON background_checks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_insurance_user_status ON insurance_policies(user_id, status);
CREATE INDEX IF NOT EXISTS idx_licenses_user_status ON professional_licenses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_user_type_time ON security_audit_events(user_id, event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_rate_limit_id_endpoint ON rate_limit_tracking(identifier, endpoint);