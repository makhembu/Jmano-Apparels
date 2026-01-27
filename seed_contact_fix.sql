
-- 1. Add column to toggle contact form visibility
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS enable_contact_form BOOLEAN DEFAULT true;

-- 2. Ensure default is set to true for existing record
UPDATE public.app_settings 
SET enable_contact_form = true 
WHERE id = 1;
