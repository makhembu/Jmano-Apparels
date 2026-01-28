
-- 1. Add column to toggle newsletter signup visibility
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS enable_newsletter_signup BOOLEAN DEFAULT false;

-- 2. Ensure default is set to false for existing record
UPDATE public.app_settings 
SET enable_newsletter_signup = false 
WHERE id = 1;
