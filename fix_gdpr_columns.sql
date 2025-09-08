-- Fix GDPR consent table columns to match service expectations

-- Add the expected column name
ALTER TABLE gdpr_consent_records ADD COLUMN consent_given_at DATETIME;

-- Copy data from given_at to consent_given_at
UPDATE gdpr_consent_records SET consent_given_at = given_at WHERE consent_given_at IS NULL;