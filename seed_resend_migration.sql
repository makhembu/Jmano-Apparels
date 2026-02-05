-- ============================================================================
-- JAMBO APPARELS - RESEND MIGRATION
-- Replaces SMTP with Resend configuration
-- ============================================================================

-- 1. Modify app_settings table
ALTER TABLE public.app_settings
DROP COLUMN IF EXISTS smtp_settings,
DROP COLUMN IF EXISTS email_provider;

ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS resend_api_key TEXT,
ADD COLUMN IF NOT EXISTS resend_from_email TEXT DEFAULT 'onboarding@resend.dev';

-- 2. Update the public view to ensure secrets are excluded but safe fields included
DROP VIEW IF EXISTS public.public_app_settings;

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
  enable_email_welcome,
  enable_email_new_order,
  enable_email_order_shipped,
  enable_email_admin_new_order,
  enable_email_contact_admin,
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
  gemini_api_key,
  resend_from_email -- Safe to expose FROM email, but API key is hidden
FROM public.app_settings;

GRANT SELECT ON public.public_app_settings TO anon, authenticated;

-- 3. Update the trigger function to remove providerConfig logic
CREATE OR REPLACE FUNCTION public.trigger_send_email(recipient text, subject text, body text)
RETURNS void AS $$
DECLARE
  -- Replace with your actual project URL and Anon Key if they differ
  -- In production these should be injected or retrieved dynamically if possible, 
  -- but for this migration we ensure the function signature remains valid.
  project_url text := 'https://irsurnyfjgjmlhlrkbeh.supabase.co'; 
  anon_key text := 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';
BEGIN
  -- Perform an async HTTP request to the Edge Function
  -- No config passed; Edge Function reads from DB
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
