-- Migration to restructure database to match Excel format
-- This creates a new simplified worker_profiles table with all Excel columns

-- Create the new worker_profiles table matching Excel structure
CREATE TABLE IF NOT EXISTS worker_profiles_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  description TEXT,
  address TEXT,
  country TEXT DEFAULT 'Canada',
  province TEXT,
  city TEXT,
  postal_code TEXT,
  email TEXT,
  filename TEXT,
  google_place_id TEXT,
  latitude REAL,
  longitude REAL,
  phone TEXT,
  profile_photo TEXT,
  category TEXT,
  subscription_type TEXT CHECK (subscription_type IN ('Pay-as-you-go', 'Growth Plan', 'Pro Plan')),
  user_id INTEGER UNIQUE,
  website TEXT,
  hours_of_operation TEXT,
  hourly_rate REAL,
  price_range TEXT,
  services_provided TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_worker_profiles_new_company ON worker_profiles_new(company);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_new_category ON worker_profiles_new(category);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_new_province ON worker_profiles_new(province);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_new_city ON worker_profiles_new(city);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_new_user_id ON worker_profiles_new(user_id);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_new_subscription ON worker_profiles_new(subscription_type);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_new_location ON worker_profiles_new(latitude, longitude);

-- Note: Backup tables will be created by import script if needed