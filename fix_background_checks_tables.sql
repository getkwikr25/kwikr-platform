-- Create basic compliance tables for dashboard functionality

-- Background Check Providers
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

-- Background Checks
CREATE TABLE IF NOT EXISTS background_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider_id INTEGER,
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Providers
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

-- Insurance Policies
CREATE TABLE IF NOT EXISTS insurance_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider_id INTEGER,
  policy_number TEXT NOT NULL,
  policy_type TEXT NOT NULL, -- 'liability', 'professional', 'equipment', 'vehicle'
  coverage_amount DECIMAL(15,2) NOT NULL,
  deductible_amount DECIMAL(15,2) DEFAULT 0,
  effective_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'pending'
  policy_document_url TEXT,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verification_notes TEXT,
  premium_amount DECIMAL(15,2),
  payment_frequency TEXT, -- 'monthly', 'quarterly', 'semi_annual', 'annual'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- License Categories
CREATE TABLE IF NOT EXISTS license_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  issuing_authority TEXT NOT NULL,
  verification_endpoint TEXT,
  verification_method TEXT NOT NULL, -- 'api', 'manual', 'scraping'
  renewal_period_months INTEGER DEFAULT 12,
  is_required BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Professional Licenses
CREATE TABLE IF NOT EXISTS professional_licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER,
  license_number TEXT NOT NULL,
  license_type TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'suspended', 'revoked', 'pending'
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'expired'
  verification_date DATETIME,
  verification_notes TEXT,
  renewal_reminder_sent BOOLEAN DEFAULT false,
  document_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT OR IGNORE INTO background_check_providers (name, api_endpoint, api_key_name, supported_check_types) VALUES
('CanadianBackgroundChecks', 'https://api.canadianbackgroundchecks.com', 'API_KEY', '["criminal", "employment", "education"]'),
('SecureVerify', 'https://api.secureverify.ca', 'X-API-Key', '["identity", "criminal", "reference"]');

INSERT OR IGNORE INTO insurance_providers (name, contact_info, verification_method) VALUES
('Intact Insurance', '{"phone": "1-800-INTACT", "email": "verify@intact.ca"}', 'manual'),
('Aviva Canada', '{"phone": "1-800-AVIVA", "email": "verification@aviva.ca"}', 'manual');

INSERT OR IGNORE INTO license_categories (name, description, issuing_authority, verification_method) VALUES
('Electrical', 'Licensed electrician certification', 'Provincial Electrical Safety Authority', 'manual'),
('Plumbing', 'Licensed plumber certification', 'Provincial Plumbing Board', 'manual'),
('HVAC', 'Heating, Ventilation, and Air Conditioning license', 'Provincial HVAC Board', 'manual');

-- Sample background checks
INSERT OR IGNORE INTO background_checks (user_id, provider_id, check_type, status, verification_score, risk_level, requested_at, completed_at) VALUES
(1, 1, 'criminal', 'completed', 95, 'low', datetime('now', '-30 days'), datetime('now', '-28 days')),
(2, 1, 'criminal', 'completed', 88, 'low', datetime('now', '-25 days'), datetime('now', '-23 days')),
(3, 2, 'identity', 'pending', NULL, NULL, datetime('now', '-5 days'), NULL),
(4, 1, 'employment', 'completed', 92, 'low', datetime('now', '-15 days'), datetime('now', '-13 days')),
(5, 2, 'criminal', 'failed', 0, 'high', datetime('now', '-10 days'), datetime('now', '-8 days'));

-- Sample insurance policies
INSERT OR IGNORE INTO insurance_policies (user_id, provider_id, policy_number, policy_type, coverage_amount, effective_date, expiry_date, status, verification_status) VALUES
(1, 1, 'INT-123456', 'liability', 1000000.00, '2024-01-01', '2024-12-31', 'active', 'verified'),
(2, 2, 'AVI-789012', 'liability', 2000000.00, '2024-03-01', '2025-02-28', 'active', 'verified'),
(3, 1, 'INT-345678', 'professional', 500000.00, '2024-06-01', '2025-05-31', 'active', 'pending'),
(4, 2, 'AVI-901234', 'equipment', 250000.00, '2024-04-15', '2025-04-14', 'active', 'verified');

-- Sample professional licenses
INSERT OR IGNORE INTO professional_licenses (user_id, category_id, license_number, license_type, issuing_authority, issue_date, expiry_date, status, verification_status) VALUES
(1, 1, 'ELE-2024-001', 'Master Electrician', 'Ontario ESA', '2024-01-15', '2025-01-14', 'active', 'verified'),
(2, 2, 'PLB-2024-002', 'Journeyman Plumber', 'BC Plumbing Board', '2024-02-01', '2025-01-31', 'active', 'verified'),
(3, 3, 'HVAC-2024-003', 'HVAC Technician', 'Alberta HVAC Board', '2024-03-10', '2025-03-09', 'active', 'pending');