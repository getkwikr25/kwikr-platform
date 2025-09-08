-- Fix GDPR data requests table column name

-- Add the expected column name
ALTER TABLE gdpr_data_requests ADD COLUMN requested_at DATETIME;

-- Copy data from received_at to requested_at  
UPDATE gdpr_data_requests SET requested_at = received_at WHERE requested_at IS NULL;