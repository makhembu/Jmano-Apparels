
-- Add column for Gemini API Key to app_settings
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;

-- Optional: If you have an existing key you want to seed, uncomment the line below
-- UPDATE public.app_settings SET gemini_api_key = 'your_key_here' WHERE id = 1;
