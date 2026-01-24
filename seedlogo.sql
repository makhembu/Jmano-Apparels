-- 1. Add logo_image column to app_settings table
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS logo_image TEXT;

-- 2. Populate with the current default logo
UPDATE public.app_settings 
SET logo_image = 'https://i.imgur.com/pkaScEv.png'
WHERE id = 1;
