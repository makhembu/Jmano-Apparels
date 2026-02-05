-- ============================================================================
-- JAMBO APPARELS - SECURE DB EMAIL TRIGGER
-- Updates the trigger function to include the shared security secret header.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_send_email(recipient text, subject text, body text)
RETURNS void AS $$
DECLARE
  project_url text := 'https://irsurnyfjgjmlhlrkbeh.supabase.co'; 
  anon_key text := 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';
  -- This secret MUST match the one in the Edge Function code
  internal_secret text := 'jambo_secure_trigger_8823'; 
BEGIN
  PERFORM net.http_post(
    url := project_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key,
      'x-jambo-secret', internal_secret
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