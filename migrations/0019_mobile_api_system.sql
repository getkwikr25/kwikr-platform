-- Mobile & API System Database Schema
-- Comprehensive schema for API Documentation, Webhooks, SDK Development, and PWA features

-- API Documentation Tables
CREATE TABLE IF NOT EXISTS api_documentation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint_path TEXT NOT NULL,
  http_method TEXT NOT NULL CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  title TEXT NOT NULL,
  description TEXT,
  request_schema TEXT, -- JSON schema for request
  response_schema TEXT, -- JSON schema for response
  examples TEXT, -- JSON examples
  tags TEXT, -- Comma-separated tags
  deprecated BOOLEAN DEFAULT false,
  version TEXT NOT NULL DEFAULT 'v1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_documentation_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  documentation_id INTEGER REFERENCES api_documentation(id),
  user_id INTEGER,
  developer_id TEXT, -- External developer ID
  accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT
);

CREATE TABLE IF NOT EXISTS developer_portal_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  api_key TEXT UNIQUE NOT NULL,
  api_secret TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  rate_limit_tier TEXT NOT NULL DEFAULT 'free' CHECK (rate_limit_tier IN ('free', 'basic', 'premium', 'enterprise')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

-- Webhooks Tables
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  events TEXT NOT NULL, -- JSON array of subscribed events
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'failed')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  developer_id INTEGER REFERENCES developer_portal_users(id),
  user_id INTEGER, -- Internal user ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_success_at DATETIME,
  last_failure_at DATETIME
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL, -- JSON data
  triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER,
  related_entity_type TEXT, -- job, user, payment, etc.
  related_entity_id INTEGER
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_endpoint_id INTEGER REFERENCES webhook_endpoints(id),
  webhook_event_id INTEGER REFERENCES webhook_events(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'cancelled')),
  http_status_code INTEGER,
  response_body TEXT,
  response_headers TEXT, -- JSON
  attempt_count INTEGER DEFAULT 0,
  next_retry_at DATETIME,
  delivered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SDK Development Tables
CREATE TABLE IF NOT EXISTS sdk_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL CHECK (platform IN ('javascript', 'python', 'php', 'java', 'csharp', 'ruby', 'go')),
  version TEXT NOT NULL,
  download_url TEXT NOT NULL,
  documentation_url TEXT,
  changelog TEXT,
  status TEXT NOT NULL DEFAULT 'stable' CHECK (status IN ('alpha', 'beta', 'stable', 'deprecated')),
  file_size INTEGER,
  checksum TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sdk_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sdk_version_id INTEGER REFERENCES sdk_versions(id),
  developer_id INTEGER REFERENCES developer_portal_users(id),
  ip_address TEXT,
  user_agent TEXT,
  downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sdk_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sdk_version_id INTEGER REFERENCES sdk_versions(id),
  developer_id INTEGER REFERENCES developer_portal_users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  issue_type TEXT CHECK (issue_type IN ('bug', 'feature_request', 'documentation', 'performance', 'other')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Progressive Web App Tables
CREATE TABLE IF NOT EXISTS pwa_installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  device_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'desktop', 'other')),
  browser TEXT,
  version TEXT,
  installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uninstalled_at DATETIME
);

CREATE TABLE IF NOT EXISTS pwa_push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME
);

CREATE TABLE IF NOT EXISTS pwa_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  data TEXT, -- JSON data
  action_buttons TEXT, -- JSON array of action buttons
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  clicked_at DATETIME,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'clicked', 'failed'))
);

CREATE TABLE IF NOT EXISTS pwa_offline_sync (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL, -- job, message, profile, etc.
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  data TEXT NOT NULL, -- JSON data
  synced BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_at DATETIME
);

-- API Analytics and Metrics
CREATE TABLE IF NOT EXISTS api_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  developer_id INTEGER REFERENCES developer_portal_users(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time INTEGER, -- milliseconds
  request_size INTEGER, -- bytes
  response_size INTEGER, -- bytes
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mobile_app_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  device_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  app_version TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  page_views INTEGER DEFAULT 0,
  actions_performed INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_documentation_endpoint ON api_documentation(endpoint_path, http_method);
CREATE INDEX IF NOT EXISTS idx_api_documentation_tags ON api_documentation(tags);
CREATE INDEX IF NOT EXISTS idx_api_documentation_version ON api_documentation(version);

CREATE INDEX IF NOT EXISTS idx_developer_portal_api_key ON developer_portal_users(api_key);
CREATE INDEX IF NOT EXISTS idx_developer_portal_status ON developer_portal_users(status);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_developer ON webhook_endpoints(developer_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_status ON webhook_endpoints(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_triggered ON webhook_events(triggered_at);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON webhook_deliveries(webhook_endpoint_id);

CREATE INDEX IF NOT EXISTS idx_sdk_versions_platform ON sdk_versions(platform);
CREATE INDEX IF NOT EXISTS idx_sdk_versions_status ON sdk_versions(status);
CREATE INDEX IF NOT EXISTS idx_sdk_downloads_version ON sdk_downloads(sdk_version_id);
CREATE INDEX IF NOT EXISTS idx_sdk_downloads_developer ON sdk_downloads(developer_id);

CREATE INDEX IF NOT EXISTS idx_pwa_installations_user ON pwa_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_installations_device ON pwa_installations(device_id);
CREATE INDEX IF NOT EXISTS idx_pwa_push_subscriptions_user ON pwa_push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_notifications_user ON pwa_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_notifications_status ON pwa_notifications(status);
CREATE INDEX IF NOT EXISTS idx_pwa_offline_sync_user ON pwa_offline_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_offline_sync_synced ON pwa_offline_sync(synced);

CREATE INDEX IF NOT EXISTS idx_api_requests_developer ON api_requests(developer_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_endpoint ON api_requests(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_requests_created ON api_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_user ON mobile_app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_device ON mobile_app_sessions(device_id);