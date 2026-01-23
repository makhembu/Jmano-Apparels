
-- 1. Add Founder Quote column to app_settings table
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS founder_quote TEXT;

-- 2. Populate with existing default quote
UPDATE public.app_settings 
SET 
  founder_quote = 'Guided by honesty, excellence, and boldness, I lead Jambo Apparels with a commitment to honouring God in the work entrusted to us.'
WHERE id = 1;
