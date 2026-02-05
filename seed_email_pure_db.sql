-- ============================================================================
-- JAMBO APPARELS - PURE DB EMAIL CONFIG
-- This function overwrites previous versions to STOP sending config details.
-- The Edge Function is now responsible for fetching credentials from DB.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_send_email(recipient text, subject text, body text)
RETURNS void AS $$
DECLARE
  project_url text := 'https://irsurnyfjgjmlhlrkbeh.supabase.co'; 
  anon_key text := 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';
BEGIN
  -- Perform async HTTP request WITHOUT providerConfig
  -- The Edge Function will see providerConfig is missing and fetch `app_settings` from row 1.
  PERFORM net.http_post(
    url := project_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object(
      'to', recipient,
      'subject', subject,
      'htmlBody', body
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Failed to trigger email to %: %', recipient, SQLERRM;
END;
$$ LANGUAGE plpgsql;