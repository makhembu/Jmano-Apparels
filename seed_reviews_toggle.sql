
-- 1. Add column to toggle reviews visibility
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS enable_reviews BOOLEAN DEFAULT true;

-- 2. Ensure default is set to true for existing record
UPDATE public.app_settings 
SET enable_reviews = true 
WHERE id = 1;
