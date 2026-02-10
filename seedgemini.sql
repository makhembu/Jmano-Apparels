-- Jambo Apparels - Gemini AI Configuration
-- This script ensures the Gemini API key field is available.
-- The key itself should be set in the Admin Dashboard: Admin > App Settings > System

-- Add the column if it doesn't exist (for backward compatibility)
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
