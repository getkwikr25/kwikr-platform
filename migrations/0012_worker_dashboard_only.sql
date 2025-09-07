-- Worker Dashboard System - Missing Tables Only
-- Created: 2024-01-15
-- This migration creates only the missing tables for the worker dashboard system

-- Worker Job Applications Table
CREATE TABLE IF NOT EXISTS worker_job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'applied' CHECK (
    application_status IN ('applied', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn')
  ),
  bid_amount DECIMAL(10,2),
  estimated_duration_hours INTEGER,
  proposal_text TEXT,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  response_deadline DATETIME,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Worker Customers Table (Client relationships from worker perspective)
CREATE TABLE IF NOT EXISTS worker_customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  relationship_status TEXT NOT NULL DEFAULT 'active' CHECK (
    relationship_status IN ('active', 'inactive', 'blocked', 'preferred')
  ),
  first_interaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_interaction_date DATETIME,
  total_jobs_completed INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  average_rating DECIMAL(3,2),
  notes TEXT,
  tags TEXT,
  communication_preferences TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(worker_id, client_id)
);

-- Worker Service Analytics Table
CREATE TABLE IF NOT EXISTS worker_service_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  service_id INTEGER,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  metric_count INTEGER DEFAULT 0,
  period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (
    period_type IN ('daily', 'weekly', 'monthly', 'yearly')
  ),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  additional_data TEXT, -- JSON format for extra metrics
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Worker Portfolio Table
CREATE TABLE IF NOT EXISTS worker_portfolio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  portfolio_type TEXT NOT NULL CHECK (
    portfolio_type IN ('work_sample', 'certification', 'license', 'award', 'testimonial')
  ),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  document_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT, -- Comma-separated tags
  date_achieved DATE,
  expiry_date DATE,
  issuing_organization TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'verified', 'rejected')
  ),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Worker Dashboard Settings Table
CREATE TABLE IF NOT EXISTS worker_dashboard_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL UNIQUE,
  dashboard_theme TEXT DEFAULT 'light' CHECK (dashboard_theme IN ('light', 'dark', 'auto')),
  default_currency TEXT DEFAULT 'CAD',
  timezone TEXT DEFAULT 'America/Toronto',
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  weekly_summary_email BOOLEAN DEFAULT TRUE,
  new_job_alerts BOOLEAN DEFAULT TRUE,
  payment_notifications BOOLEAN DEFAULT TRUE,
  dashboard_widgets TEXT, -- JSON array of enabled widgets
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Worker Performance Goals Table
CREATE TABLE IF NOT EXISTS worker_performance_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  goal_type TEXT NOT NULL CHECK (
    goal_type IN ('earnings', 'jobs_completed', 'rating_improvement', 'client_acquisition', 'custom')
  ),
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0.00,
  target_date DATE,
  goal_period TEXT DEFAULT 'monthly' CHECK (
    goal_period IN ('weekly', 'monthly', 'quarterly', 'yearly')
  ),
  is_active BOOLEAN DEFAULT TRUE,
  achieved_at DATETIME,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance

-- Job Applications indexes
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_worker ON worker_job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_job ON worker_job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_status ON worker_job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_worker_job_applications_applied ON worker_job_applications(applied_at);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_worker_customers_worker ON worker_customers(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_customers_client ON worker_customers(client_id);
CREATE INDEX IF NOT EXISTS idx_worker_customers_status ON worker_customers(relationship_status);
CREATE INDEX IF NOT EXISTS idx_worker_customers_earnings ON worker_customers(total_earnings);

-- Service Analytics indexes
CREATE INDEX IF NOT EXISTS idx_worker_service_analytics_worker ON worker_service_analytics(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_service_analytics_service ON worker_service_analytics(service_id);
CREATE INDEX IF NOT EXISTS idx_worker_service_analytics_period ON worker_service_analytics(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_worker_service_analytics_metric ON worker_service_analytics(metric_name);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_worker ON worker_portfolio(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_type ON worker_portfolio(portfolio_type);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_featured ON worker_portfolio(is_featured);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_public ON worker_portfolio(is_public);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_order ON worker_portfolio(display_order);

-- Performance Goals indexes
CREATE INDEX IF NOT EXISTS idx_worker_performance_goals_worker ON worker_performance_goals(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_performance_goals_type ON worker_performance_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_worker_performance_goals_active ON worker_performance_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_worker_performance_goals_date ON worker_performance_goals(target_date);

-- Dashboard Settings index
CREATE INDEX IF NOT EXISTS idx_worker_dashboard_settings_worker ON worker_dashboard_settings(worker_id);

-- Create Triggers for Automatic Updates

-- Update worker_customers totals when earnings are created/updated
CREATE TRIGGER IF NOT EXISTS update_worker_customer_totals_on_earnings
AFTER INSERT ON worker_earnings
BEGIN
  INSERT OR REPLACE INTO worker_customers (worker_id, client_id, total_jobs_completed, total_earnings, last_interaction_date, updated_at)
  VALUES (
    NEW.worker_id,
    (SELECT client_id FROM jobs WHERE id = NEW.job_id),
    COALESCE((SELECT total_jobs_completed FROM worker_customers WHERE worker_id = NEW.worker_id AND client_id = (SELECT client_id FROM jobs WHERE id = NEW.job_id)), 0) + 1,
    COALESCE((SELECT total_earnings FROM worker_customers WHERE worker_id = NEW.worker_id AND client_id = (SELECT client_id FROM jobs WHERE id = NEW.job_id)), 0) + NEW.net_amount,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
END;

-- Update service analytics when jobs are completed
CREATE TRIGGER IF NOT EXISTS update_service_analytics_on_job_completion
AFTER UPDATE ON jobs
WHEN NEW.job_status = 'completed' AND OLD.job_status != 'completed'
BEGIN
  INSERT OR REPLACE INTO worker_service_analytics (
    worker_id, service_id, metric_name, metric_value, metric_count, 
    period_type, period_start, period_end, updated_at
  )
  VALUES (
    NEW.assigned_worker_id,
    NEW.service_category_id,
    'jobs_completed',
    COALESCE((SELECT metric_value FROM worker_service_analytics 
             WHERE worker_id = NEW.assigned_worker_id 
             AND service_id = NEW.service_category_id 
             AND metric_name = 'jobs_completed' 
             AND period_type = 'monthly'
             AND period_start = date('now', 'start of month')), 0) + 1,
    COALESCE((SELECT metric_count FROM worker_service_analytics 
             WHERE worker_id = NEW.assigned_worker_id 
             AND service_id = NEW.service_category_id 
             AND metric_name = 'jobs_completed' 
             AND period_type = 'monthly'
             AND period_start = date('now', 'start of month')), 0) + 1,
    'monthly',
    date('now', 'start of month'),
    date('now', 'start of month', '+1 month', '-1 day'),
    CURRENT_TIMESTAMP
  );
END;

-- Update performance goals progress
CREATE TRIGGER IF NOT EXISTS update_performance_goals_progress
AFTER INSERT ON worker_earnings
BEGIN
  UPDATE worker_performance_goals 
  SET 
    current_value = current_value + NEW.net_amount,
    progress_percentage = CASE 
      WHEN target_value > 0 THEN ROUND((current_value + NEW.net_amount) / target_value * 100, 2)
      ELSE 0 
    END,
    achieved_at = CASE 
      WHEN (current_value + NEW.net_amount) >= target_value AND achieved_at IS NULL 
      THEN CURRENT_TIMESTAMP 
      ELSE achieved_at 
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE worker_id = NEW.worker_id 
    AND goal_type = 'earnings' 
    AND is_active = 1;
END;