-- Add business fields for worker profiles
-- Migration: Add business_name, business_email, and service_type columns to users table

-- Add business_name column (for company/business name)
ALTER TABLE users ADD COLUMN business_name TEXT;

-- Add business_email column (for company contact email)
ALTER TABLE users ADD COLUMN business_email TEXT;

-- Add service_type column (for primary service category)
ALTER TABLE users ADD COLUMN service_type TEXT;

-- Note: phone column already exists in the users table
-- These fields are required for worker role signups but optional for client signups