-- Add GDPR consent records table

CREATE TABLE IF NOT EXISTS gdpr_consent_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  consent_type TEXT NOT NULL, -- 'marketing', 'analytics', 'processing', 'cookies'
  consent_status TEXT NOT NULL, -- 'given', 'withdrawn', 'pending'
  consent_method TEXT, -- 'explicit', 'implicit', 'opt_in', 'opt_out'
  purpose_description TEXT NOT NULL,
  legal_basis TEXT NOT NULL, -- 'consent', 'legitimate_interest', 'contract', 'legal_obligation'
  data_categories TEXT, -- JSON array of data categories affected
  retention_period TEXT, -- How long data will be kept
  consent_text TEXT, -- Exact text shown to user
  consent_version TEXT, -- Version of privacy policy/terms
  given_at DATETIME,
  withdrawn_at DATETIME,
  expires_at DATETIME,
  last_confirmed_at DATETIME,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample GDPR consent records
INSERT OR IGNORE INTO gdpr_consent_records (user_id, consent_type, consent_status, consent_method, purpose_description, legal_basis, given_at, last_confirmed_at) VALUES
(1, 'marketing', 'given', 'explicit', 'Email marketing communications', 'consent', datetime('now', '-60 days'), datetime('now', '-30 days')),
(1, 'analytics', 'given', 'explicit', 'Website usage analytics', 'consent', datetime('now', '-60 days'), datetime('now', '-30 days')),
(2, 'marketing', 'withdrawn', 'explicit', 'Email marketing communications', 'consent', datetime('now', '-90 days'), datetime('now', '-10 days')),
(2, 'analytics', 'given', 'explicit', 'Website usage analytics', 'consent', datetime('now', '-90 days'), datetime('now', '-45 days')),
(3, 'marketing', 'pending', 'opt_in', 'Email marketing communications', 'consent', NULL, NULL),
(3, 'processing', 'given', 'explicit', 'Service provision and billing', 'contract', datetime('now', '-30 days'), datetime('now', '-30 days'));