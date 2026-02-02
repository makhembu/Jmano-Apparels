
-- ============================================================================
-- FIX ANALYTICS SCHEMA
-- Adds missing columns that cause the PGRST204 error in the frontend logs.
-- ============================================================================

-- 1. Add 'duration' column (Integer, seconds)
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;

-- 2. Add Geo columns if they are missing
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS geo_country TEXT,
ADD COLUMN IF NOT EXISTS geo_city TEXT;

-- 3. Refresh PostgREST schema cache to recognize new columns immediately
NOTIFY pgrst, 'reload config';
