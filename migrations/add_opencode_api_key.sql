-- Run this in Supabase SQL Editor to add the opencode_api_key column
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS opencode_api_key text;

-- Update the row with id=1 to have a default value (optional)
-- UPDATE app_settings SET opencode_api_key = '' WHERE id = 1;
