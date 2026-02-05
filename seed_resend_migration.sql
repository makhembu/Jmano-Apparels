
-- ============================================================================
-- JAMBO APPARELS - RESEND MIGRATION
-- Replaces SMTP settings with specific Resend credentials.
-- ============================================================================

-- 1. Alter app_settings table
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS resend_api_key TEXT,
ADD COLUMN IF NOT EXISTS sender_email TEXT;

-- 2. Drop deprecated SMTP columns
ALTER TABLE public.app_settings
DROP COLUMN IF EXISTS smtp_settings,
DROP COLUMN IF EXISTS email_provider;

-- 3. Update public view to include new fields (safe ones)
-- We exclude resend_api_key from public view, but allow sender_email if needed for UI reference
CREATE OR REPLACE VIEW public.public_app_settings AS
SELECT
  id,
  slogan,
  secondary_slogan,
  logo_image,
  mission,
  vision,
  core_values,
  founder_name,
  founder_bio,
  founder_image,
  founder_quote,
  contact_email,
  contact_phone,
  contact_address,
  business_hours,
  social_links,
  support_email,
  currency,
  tax_rate,
  free_shipping_threshold,
  require_login_for_checkout,
  shipping_policy,
  return_policy,
  privacy_policy,
  terms_conditions,
  hero_banner_image,
  hero_banner_text,
  announcement_text,
  is_announcement_enabled,
  maintenance_mode,
  maintenance_message,
  featured_categories,
  enable_newsletter_signup,
  enable_contact_form,
  enable_reviews,
  enable_email_notifications,
  seo_title,
  seo_description,
  default_og_image,
  google_analytics_id,
  custom_head_scripts,
  shop_seo_title,
  shop_seo_description,
  blog_seo_title,
  blog_seo_description,
  about_seo_title,
  about_seo_description,
  paypal_client_id,
  paypal_mode,
  payment_gateway_enabled,
  -- NEW FIELDS
  sender_email
FROM public.app_settings;

-- 4. Update the trigger function to use simplified logic (no mode switching)
CREATE OR REPLACE FUNCTION public.trigger_send_email(recipient text, subject text, body text)
RETURNS void AS $$
DECLARE
  project_url text := 'https://irsurnyfjgjmlhlrkbeh.supabase.co'; 
  anon_key text := 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';
  internal_secret text := 'jambo_secure_trigger_8823'; 
BEGIN
  -- Perform async HTTP request to Edge Function
  -- The Edge Function now handles fetching the Resend key from DB internally
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
