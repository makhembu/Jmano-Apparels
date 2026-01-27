-- 1. Add Email Provider column to app_settings
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS email_provider TEXT DEFAULT 'smtp';

-- 2. Update trigger_send_email to handle Mode Logic
CREATE OR REPLACE FUNCTION public.trigger_send_email(recipient text, subject text, body text)
RETURNS void AS $$
DECLARE
  project_url text := 'https://irsurnyfjgjmlhlrkbeh.supabase.co'; 
  anon_key text := 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';
  settings_row record;
  provider_config jsonb;
  current_mode text;
BEGIN
  -- Fetch current email settings
  SELECT * INTO settings_row FROM public.app_settings WHERE id = 1;
  
  -- Extract mode, default to 'env' if not set
  current_mode := COALESCE(settings_row.smtp_settings->>'mode', 'env');

  -- Construct payload based on mode
  IF current_mode = 'env' THEN
     -- Env mode: Send minimal config, let Edge Function use Secrets
     provider_config := jsonb_build_object(
        'mode', 'env',
        'provider', settings_row.email_provider
     );
  ELSE
     -- Custom mode: Merge all settings from DB and force 'custom' mode
     provider_config := settings_row.smtp_settings || jsonb_build_object(
        'mode', 'custom',
        'provider', settings_row.email_provider
     );
  END IF;

  -- Perform async HTTP request
  PERFORM net.http_post(
    url := project_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object(
      'to', recipient,
      'subject', subject,
      'htmlBody', body,
      'providerConfig', provider_config
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Failed to trigger email to %: %', recipient, SQLERRM;
END;
$$ LANGUAGE plpgsql;