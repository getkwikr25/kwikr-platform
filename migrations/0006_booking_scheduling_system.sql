-- Comprehensive Booking & Scheduling System Database Schema

-- ============================================================================
-- FEATURE 1: Calendar Integration - Worker availability calendar
-- ============================================================================

-- Worker availability schedules (recurring weekly patterns)
CREATE TABLE IF NOT EXISTS worker_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, -- References users.id where role='worker'
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TEXT NOT NULL, -- Store as TEXT in SQLite
  end_time TEXT NOT NULL, -- Store as TEXT in SQLite
  timezone TEXT DEFAULT 'America/Toronto',
  is_available BOOLEAN DEFAULT TRUE,
  break_start_time TEXT,
  break_end_time TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Specific date availability overrides (holidays, vacations, special hours)
CREATE TABLE IF NOT EXISTS availability_overrides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, -- References users.id where role='worker'
  override_date TEXT NOT NULL, -- Store as TEXT in SQLite
  override_type TEXT NOT NULL, -- 'unavailable', 'custom_hours', 'extended_hours'
  start_time TEXT,
  end_time TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Time slot templates (service duration and buffer times)
CREATE TABLE IF NOT EXISTS service_time_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, -- References users.id where role='worker'
  service_category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  buffer_before_minutes INTEGER DEFAULT 15,
  buffer_after_minutes INTEGER DEFAULT 15,
  max_bookings_per_day INTEGER DEFAULT 10,
  advance_booking_days INTEGER DEFAULT 30,
  same_day_booking BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FEATURE 2: Appointment Booking - Clients book time slots
-- ============================================================================

-- Main bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL, -- References users.id where role='worker'
  job_id INTEGER,
  service_category TEXT NOT NULL,
  booking_date TEXT NOT NULL, -- Store as TEXT in SQLite format YYYY-MM-DD
  start_time TEXT NOT NULL, -- Store as TEXT in SQLite format HH:MM:SS
  end_time TEXT NOT NULL, -- Store as TEXT in SQLite format HH:MM:SS
  duration_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'
  
  -- Client details
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  client_timezone TEXT DEFAULT 'America/Toronto',
  
  -- Service details
  service_description TEXT,
  special_instructions TEXT,
  estimated_cost DECIMAL(10,2),
  
  -- Booking metadata
  booking_source TEXT DEFAULT 'web', -- 'web', 'mobile', 'phone', 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Recurring booking reference
  recurring_booking_id INTEGER,
  is_recurring BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- FEATURE 3: Booking Confirmation - Automated confirmations
-- ============================================================================

-- Booking confirmations and notifications
CREATE TABLE IF NOT EXISTS booking_confirmations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  confirmation_type TEXT NOT NULL, -- 'initial', 'reminder', 'modification', 'cancellation'
  confirmation_method TEXT NOT NULL, -- 'email', 'sms', 'push', 'in_app'
  recipient_type TEXT NOT NULL, -- 'client', 'worker', 'both'
  
  -- Message details
  subject TEXT,
  message_content TEXT,
  template_used TEXT,
  
  -- Delivery tracking
  sent_at DATETIME,
  delivered_at DATETIME,
  opened_at DATETIME,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'opened'
  
  -- Scheduling
  scheduled_for DATETIME,
  retry_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Confirmation templates
CREATE TABLE IF NOT EXISTS confirmation_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL, -- 'booking_confirmation', 'reminder', 'cancellation', etc.
  subject_template TEXT,
  content_template TEXT NOT NULL,
  variables TEXT, -- JSON array of available variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FEATURE 4: Reschedule/Cancel - Modify existing bookings
-- ============================================================================

-- Booking modification history
CREATE TABLE IF NOT EXISTS booking_modifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  modification_type TEXT NOT NULL, -- 'reschedule', 'cancel', 'update_details', 'status_change'
  modified_by_type TEXT NOT NULL, -- 'client', 'worker', 'admin', 'system'
  modified_by_id INTEGER,
  
  -- Previous values (JSON for flexibility)
  previous_values TEXT, -- JSON object with old values
  new_values TEXT, -- JSON object with new values
  
  -- Modification details
  reason TEXT,
  cancellation_fee DECIMAL(10,2),
  refund_amount DECIMAL(10,2),
  
  -- Policy checks
  policy_violation BOOLEAN DEFAULT FALSE,
  policy_override_reason TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cancellation and reschedule policies
CREATE TABLE IF NOT EXISTS booking_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, -- References users.id where role='worker'
  policy_type TEXT NOT NULL, -- 'cancellation', 'reschedule', 'no_show'
  
  -- Time restrictions
  minimum_notice_hours INTEGER DEFAULT 24,
  same_day_changes_allowed BOOLEAN DEFAULT FALSE,
  
  -- Fees and penalties
  cancellation_fee_type TEXT DEFAULT 'none', -- 'none', 'fixed', 'percentage'
  cancellation_fee_amount DECIMAL(10,2),
  reschedule_fee_type TEXT DEFAULT 'none',
  reschedule_fee_amount DECIMAL(10,2),
  
  -- Limits
  max_reschedules_per_booking INTEGER DEFAULT 2,
  blackout_dates TEXT, -- JSON array of dates
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FEATURE 5: Recurring Bookings - Weekly/monthly services
-- ============================================================================

-- Recurring booking patterns
CREATE TABLE IF NOT EXISTS recurring_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL, -- References users.id where role='worker'
  
  -- Pattern definition
  pattern_type TEXT NOT NULL, -- 'weekly', 'biweekly', 'monthly', 'custom'
  frequency INTEGER DEFAULT 1, -- Every N weeks/months
  days_of_week TEXT, -- JSON array for weekly patterns [1,3,5] = Mon,Wed,Fri
  day_of_month INTEGER, -- For monthly patterns
  
  -- Time details
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  timezone TEXT DEFAULT 'America/Toronto',
  
  -- Service details
  service_category TEXT NOT NULL,
  service_description TEXT,
  estimated_cost DECIMAL(10,2),
  
  -- Pattern lifecycle
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = indefinite
  max_occurrences INTEGER, -- Alternative to end_date
  
  -- Status and control
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  auto_confirm BOOLEAN DEFAULT FALSE,
  
  -- Generation tracking
  last_generated_date DATE,
  next_booking_date DATE,
  total_bookings_generated INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FEATURE 6: Time Zone Management - Multi-timezone support
-- ============================================================================

-- Timezone definitions and DST handling
CREATE TABLE IF NOT EXISTS timezone_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timezone_code TEXT NOT NULL UNIQUE, -- 'America/Toronto', 'America/Vancouver'
  timezone_name TEXT NOT NULL, -- 'Eastern Time', 'Pacific Time'
  country_code TEXT NOT NULL,
  region TEXT NOT NULL,
  utc_offset_standard INTEGER NOT NULL, -- Minutes from UTC (standard time)
  utc_offset_dst INTEGER, -- Minutes from UTC (daylight saving time)
  dst_start_rule TEXT, -- DST start rule
  dst_end_rule TEXT, -- DST end rule
  is_active BOOLEAN DEFAULT TRUE
);

-- User timezone preferences
CREATE TABLE IF NOT EXISTS user_timezone_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'America/Toronto',
  auto_detect_timezone BOOLEAN DEFAULT TRUE,
  display_format_24h BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Booking timezone conversion log (for debugging and auditing)
CREATE TABLE IF NOT EXISTS timezone_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  original_timezone TEXT NOT NULL,
  target_timezone TEXT NOT NULL,
  original_datetime DATETIME NOT NULL,
  converted_datetime DATETIME NOT NULL,
  conversion_context TEXT, -- 'booking_creation', 'display', 'notification'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Worker availability indexes
CREATE INDEX IF NOT EXISTS idx_worker_availability_user_day ON worker_availability(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_user_date ON availability_overrides(user_id, override_date);
CREATE INDEX IF NOT EXISTS idx_service_time_slots_user_category ON service_time_slots(user_id, service_category);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_worker_date ON bookings(user_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_client_date ON bookings(client_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_recurring ON bookings(recurring_booking_id);

-- Confirmation indexes
CREATE INDEX IF NOT EXISTS idx_booking_confirmations_booking ON booking_confirmations(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_confirmations_scheduled ON booking_confirmations(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_booking_confirmations_status ON booking_confirmations(status);

-- Modification history indexes
CREATE INDEX IF NOT EXISTS idx_booking_modifications_booking ON booking_modifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_type ON booking_modifications(modification_type);

-- Recurring booking indexes
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_worker ON recurring_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_client ON recurring_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_status ON recurring_bookings(status);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_next_date ON recurring_bookings(next_booking_date);

-- Timezone indexes
CREATE INDEX IF NOT EXISTS idx_user_timezone_preferences_user ON user_timezone_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_timezone_conversions_booking ON timezone_conversions(booking_id);