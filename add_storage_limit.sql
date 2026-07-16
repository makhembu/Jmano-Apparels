-- Add storage_limit_bytes to app_settings (defaults to 1 GB = 1073741824 bytes)
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS storage_limit_bytes bigint DEFAULT 1073741824;

-- Set the existing row to 1 GB (Supabase free tier)
UPDATE app_settings SET storage_limit_bytes = 1073741824 WHERE storage_limit_bytes IS NULL;
