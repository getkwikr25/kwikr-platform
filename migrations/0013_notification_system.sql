-- Comprehensive Notification System
-- Created: 2024-01-15
-- This migration creates the complete notification infrastructure

-- Notification Templates Table
CREATE TABLE IF NOT EXISTS notification_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL CHECK (
    template_type IN ('email', 'sms', 'push', 'in_app', 'webhook')
  ),
  category TEXT NOT NULL CHECK (
    category IN ('job_alert', 'payment', 'booking', 'system', 'marketing', 'security')
  ),
  subject_template TEXT,
  body_template TEXT NOT NULL,
  html_template TEXT, -- For email notifications
  variables TEXT, -- JSON array of template variables
  is_active BOOLEAN DEFAULT TRUE,
  priority_level TEXT DEFAULT 'normal' CHECK (
    priority_level IN ('low', 'normal', 'high', 'urgent')
  ),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  preference_type TEXT NOT NULL CHECK (
    preference_type IN ('email', 'sms', 'push', 'in_app')
  ),
  category TEXT NOT NULL CHECK (
    category IN ('job_alert', 'payment', 'booking', 'system', 'marketing', 'security')
  ),
  is_enabled BOOLEAN DEFAULT TRUE,
  frequency TEXT DEFAULT 'immediate' CHECK (
    frequency IN ('immediate', 'daily', 'weekly', 'monthly', 'never')
  ),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'America/Toronto',
  contact_info TEXT, -- Email address, phone number, etc.
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, preference_type, category)
);

-- Notifications Queue Table
CREATE TABLE IF NOT EXISTS notifications_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  template_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL CHECK (
    notification_type IN ('email', 'sms', 'push', 'in_app', 'webhook')
  ),
  category TEXT NOT NULL CHECK (
    category IN ('job_alert', 'payment', 'booking', 'system', 'marketing', 'security')
  ),
  priority_level TEXT DEFAULT 'normal' CHECK (
    priority_level IN ('low', 'normal', 'high', 'urgent')
  ),
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled')
  ),
  recipient_info TEXT NOT NULL, -- Email, phone, device token, etc.
  subject TEXT,
  message_body TEXT NOT NULL,
  html_body TEXT,
  metadata TEXT, -- JSON for additional data
  scheduled_for DATETIME,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,
  sent_at DATETIME,
  delivered_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notification History Table
CREATE TABLE IF NOT EXISTS notification_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL CHECK (
    notification_type IN ('email', 'sms', 'push', 'in_app', 'webhook')
  ),
  category TEXT NOT NULL CHECK (
    category IN ('job_alert', 'payment', 'booking', 'system', 'marketing', 'security')
  ),
  subject TEXT,
  message_body TEXT NOT NULL,
  recipient_info TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('sent', 'delivered', 'failed', 'cancelled')
  ),
  delivery_details TEXT, -- JSON with provider response
  cost DECIMAL(8,4), -- Cost in dollars for SMS/email services
  sent_at DATETIME,
  delivered_at DATETIME,
  read_at DATETIME, -- For in-app notifications
  clicked_at DATETIME, -- For tracking engagement
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- In-App Notifications Table
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('job_alert', 'payment', 'booking', 'system', 'marketing', 'security')
  ),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  icon_class TEXT DEFAULT 'fas fa-bell',
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  priority_level TEXT DEFAULT 'normal' CHECK (
    priority_level IN ('low', 'normal', 'high', 'urgent')
  ),
  expires_at DATETIME,
  metadata TEXT, -- JSON for additional data
  read_at DATETIME,
  clicked_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Push Notification Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notification Events Table (for triggering notifications)
CREATE TABLE IF NOT EXISTS notification_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL, -- JSON with event details
  user_id INTEGER,
  triggered_by_user_id INTEGER,
  processed BOOLEAN DEFAULT FALSE,
  processed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Admin Notification Settings Table
CREATE TABLE IF NOT EXISTS admin_notification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string' CHECK (
    setting_type IN ('string', 'number', 'boolean', 'json')
  ),
  description TEXT,
  category TEXT DEFAULT 'general',
  is_system BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notification Analytics Table
CREATE TABLE IF NOT EXISTS notification_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  notification_type TEXT NOT NULL,
  category TEXT NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, notification_type, category)
);

-- Create Indexes for Performance

-- Notification Templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

-- Notification Preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(preference_type);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_enabled ON notification_preferences(is_enabled);

-- Notifications Queue
CREATE INDEX IF NOT EXISTS idx_notifications_queue_user ON notifications_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_queue_status ON notifications_queue(status);
CREATE INDEX IF NOT EXISTS idx_notifications_queue_type ON notifications_queue(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_queue_scheduled ON notifications_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_queue_priority ON notifications_queue(priority_level);
CREATE INDEX IF NOT EXISTS idx_notifications_queue_created ON notifications_queue(created_at);

-- Notification History
CREATE INDEX IF NOT EXISTS idx_notification_history_user ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_type ON notification_history(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_history_category ON notification_history(category);
CREATE INDEX IF NOT EXISTS idx_notification_history_status ON notification_history(status);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent ON notification_history(sent_at);

-- In-App Notifications
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_read ON in_app_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_archived ON in_app_notifications(is_archived);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_priority ON in_app_notifications(priority_level);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created ON in_app_notifications(created_at);

-- Push Subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

-- Notification Events
CREATE INDEX IF NOT EXISTS idx_notification_events_type ON notification_events(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_events_user ON notification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_events_processed ON notification_events(processed);
CREATE INDEX IF NOT EXISTS idx_notification_events_created ON notification_events(created_at);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_notification_analytics_date ON notification_analytics(date);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_type ON notification_analytics(notification_type);

-- Insert Default Notification Templates
INSERT OR IGNORE INTO notification_templates (template_name, template_type, category, subject_template, body_template, html_template) VALUES
-- Job Alert Templates
('new_job_match_email', 'email', 'job_alert', 'New Job Match: {{job_title}}', 'A new job matching your skills is available: {{job_title}} in {{location}}. Apply now!', '<h2>New Job Match</h2><p>A new job matching your skills is available:</p><h3>{{job_title}}</h3><p>Location: {{location}}</p><p>Budget: ${{budget}}</p><p><a href="{{job_url}}" style="background: #00C881; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Apply Now</a></p>'),
('new_job_match_sms', 'sms', 'job_alert', NULL, 'New job match: {{job_title}} in {{location}}. Budget: ${{budget}}. Apply at {{short_url}}', NULL),
('new_job_match_push', 'push', 'job_alert', 'New Job Match Available', '{{job_title}} in {{location}} - ${{budget}}', NULL),
('new_job_match_in_app', 'in_app', 'job_alert', 'New Job Match', 'A job matching your profile is available: {{job_title}}', NULL),

-- Payment Templates
('payment_received_email', 'email', 'payment', 'Payment Received: ${{amount}}', 'You have received a payment of ${{amount}} for job: {{job_title}}', '<h2>Payment Received</h2><p>Congratulations! You have received a payment of <strong>${{amount}}</strong> for the following job:</p><h3>{{job_title}}</h3><p>Payment Date: {{payment_date}}</p><p>Your earnings are now available in your dashboard.</p>'),
('payment_received_sms', 'sms', 'payment', NULL, 'Payment received: ${{amount}} for {{job_title}}. Check your dashboard for details.', NULL),
('payment_received_push', 'push', 'payment', 'Payment Received', 'You received ${{amount}} for {{job_title}}', NULL),
('payment_received_in_app', 'in_app', 'payment', 'Payment Received', 'Payment of ${{amount}} received for {{job_title}}', NULL),

-- Booking Templates
('booking_confirmed_email', 'email', 'booking', 'Booking Confirmed: {{service_name}}', 'Your booking for {{service_name}} on {{booking_date}} has been confirmed.', '<h2>Booking Confirmed</h2><p>Your booking has been confirmed:</p><ul><li>Service: {{service_name}}</li><li>Date: {{booking_date}}</li><li>Time: {{booking_time}}</li><li>Location: {{location}}</li></ul><p>Please arrive 5 minutes early.</p>'),
('booking_confirmed_sms', 'sms', 'booking', NULL, 'Booking confirmed: {{service_name}} on {{booking_date}} at {{booking_time}}. Location: {{location}}', NULL),
('booking_confirmed_push', 'push', 'booking', 'Booking Confirmed', '{{service_name}} on {{booking_date}} at {{booking_time}}', NULL),
('booking_confirmed_in_app', 'in_app', 'booking', 'Booking Confirmed', 'Your booking for {{service_name}} is confirmed for {{booking_date}}', NULL),

-- System Templates
('welcome_email', 'email', 'system', 'Welcome to Kwikr Directory!', 'Welcome to Kwikr Directory! Start exploring services or offer your own.', '<h2>Welcome to Kwikr Directory!</h2><p>Thank you for joining our community of professionals and clients.</p><p>Get started by:</p><ul><li>Completing your profile</li><li>Browsing available services</li><li>Setting up your preferences</li></ul><p><a href="{{dashboard_url}}" style="background: #00C881; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>'),
('account_security_alert_email', 'email', 'security', 'Security Alert: Account Access', 'There was a login to your account from a new device.', '<h2>Security Alert</h2><p>We detected a login to your account from a new device:</p><ul><li>Device: {{device}}</li><li>Location: {{location}}</li><li>Time: {{login_time}}</li></ul><p>If this was you, no action is needed. If not, please secure your account immediately.</p>');

-- Insert Default Admin Settings
INSERT OR IGNORE INTO admin_notification_settings (setting_key, setting_value, setting_type, description, category) VALUES
('email_provider', 'sendgrid', 'string', 'Email service provider (sendgrid, mailgun, ses)', 'email'),
('email_from_address', 'notifications@kwikr.directory', 'string', 'Default from email address', 'email'),
('email_from_name', 'Kwikr Directory', 'string', 'Default from name for emails', 'email'),
('sms_provider', 'twilio', 'string', 'SMS service provider (twilio, nexmo)', 'sms'),
('push_vapid_public_key', '', 'string', 'VAPID public key for web push notifications', 'push'),
('push_vapid_private_key', '', 'string', 'VAPID private key for web push notifications', 'push'),
('max_retry_attempts', '3', 'number', 'Maximum retry attempts for failed notifications', 'general'),
('notification_rate_limit', '100', 'number', 'Maximum notifications per user per hour', 'general'),
('quiet_hours_default', '22:00-08:00', 'string', 'Default quiet hours for all users', 'general'),
('enable_marketing_notifications', 'true', 'boolean', 'Allow marketing notifications to be sent', 'marketing'),
('notification_retention_days', '90', 'number', 'Days to keep notification history', 'general');

-- Create Triggers for Automatic Notification Events

-- Trigger for new job postings (job alerts)
CREATE TRIGGER IF NOT EXISTS trigger_job_alert_notifications
AFTER INSERT ON jobs
BEGIN
  INSERT INTO notification_events (event_type, event_data, user_id)
  SELECT 'new_job_posted', 
         json_object(
           'job_id', NEW.id,
           'job_title', NEW.title,
           'job_category', NEW.category,
           'location', NEW.city || ', ' || NEW.province,
           'budget', NEW.budget,
           'job_url', '/jobs/' || NEW.id
         ),
         NULL; -- Will be processed for matching workers
END;

-- Trigger for payment notifications
CREATE TRIGGER IF NOT EXISTS trigger_payment_notifications
AFTER INSERT ON worker_earnings
WHEN NEW.payment_status = 'completed'
BEGIN
  INSERT INTO notification_events (event_type, event_data, user_id)
  VALUES ('payment_received', 
          json_object(
            'amount', NEW.net_amount,
            'job_id', NEW.job_id,
            'payment_date', datetime('now'),
            'currency', NEW.currency
          ),
          NEW.worker_id);
END;

-- Trigger for booking confirmations
CREATE TRIGGER IF NOT EXISTS trigger_booking_notifications
AFTER UPDATE ON bookings
WHEN NEW.status = 'confirmed' AND OLD.status != 'confirmed'
BEGIN
  INSERT INTO notification_events (event_type, event_data, user_id)
  VALUES ('booking_confirmed', 
          json_object(
            'booking_id', NEW.id,
            'service_name', NEW.service_name,
            'booking_date', NEW.booking_date,
            'booking_time', NEW.booking_time,
            'location', NEW.location
          ),
          NEW.client_id),
         ('booking_confirmed', 
          json_object(
            'booking_id', NEW.id,
            'service_name', NEW.service_name,
            'booking_date', NEW.booking_date,
            'booking_time', NEW.booking_time,
            'location', NEW.location
          ),
          NEW.worker_id);
END;

-- Trigger for new user welcome notifications
CREATE TRIGGER IF NOT EXISTS trigger_welcome_notifications
AFTER INSERT ON users
BEGIN
  INSERT INTO notification_events (event_type, event_data, user_id)
  VALUES ('user_welcome', 
          json_object(
            'user_name', NEW.first_name || ' ' || NEW.last_name,
            'user_role', NEW.role,
            'dashboard_url', '/dashboard'
          ),
          NEW.id);
          
  -- Create default notification preferences for new users
  INSERT INTO notification_preferences (user_id, preference_type, category, contact_info)
  VALUES 
    (NEW.id, 'email', 'job_alert', NEW.email),
    (NEW.id, 'email', 'payment', NEW.email),
    (NEW.id, 'email', 'booking', NEW.email),
    (NEW.id, 'email', 'system', NEW.email),
    (NEW.id, 'in_app', 'job_alert', NULL),
    (NEW.id, 'in_app', 'payment', NULL),
    (NEW.id, 'in_app', 'booking', NULL),
    (NEW.id, 'in_app', 'system', NULL);
END;