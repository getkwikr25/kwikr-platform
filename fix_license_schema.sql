-- Fix license table schema to match service expectations

-- Add authority_id column to professional_licenses table
ALTER TABLE professional_licenses ADD COLUMN authority_id INTEGER;

-- Update existing records to use authority_id
UPDATE professional_licenses SET authority_id = category_id WHERE authority_id IS NULL;

-- Update some sample data for testing
UPDATE professional_licenses SET 
    authority_id = 1,
    verification_status = 'verified'
WHERE id = 1;

UPDATE professional_licenses SET 
    authority_id = 2,
    verification_status = 'verified' 
WHERE id = 2;

UPDATE professional_licenses SET 
    authority_id = 3,
    verification_status = 'pending'
WHERE id = 3;