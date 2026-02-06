-- ============================================================================
-- SECURITY & RELIABILITY FIX: PUBLIC SETTINGS
-- This script replaces the complex/insecure settings RPC with a robust
-- VIEW + RPC pattern. This ensures no secret keys are ever exposed
-- to the public client and fixes the data loading issue on the About Us page.
-- ============================================================================

-- 1. Create a secure VIEW that ONLY exposes public-safe columns from app_settings.
-- This is the single source of truth for what the frontend is allowed to see.
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
  -- Feature Flags
  enable_newsletter_signup,
  enable_contact_form,
  enable_reviews,
  -- Notification Flags
  enable_email_notifications,
  enable_email_welcome,
  enable_email_new_order,
  enable_email_order_shipped,
  enable_email_admin_new_order,
  enable_email_contact_admin,
  -- Global SEO
  seo_title,
  seo_description,
  default_og_image,
  google_analytics_id,
  custom_head_scripts,
  -- Page-specific SEO
  shop_seo_title,
  shop_seo_description,
  blog_seo_title,
  blog_seo_description,
  about_seo_title,
  about_seo_description,
  -- Public Payment Config
  paypal_client_id,
  paypal_mode,
  payment_gateway_enabled,
  -- Public Email Config
  resend_from_email
FROM public.app_settings;


-- 2. Create a simple, secure SECURITY DEFINER function to read from the view.
-- This function runs with elevated privileges but can only see what the VIEW exposes.
CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Select a single row from the VIEW and convert it to JSON.
  SELECT row_to_json(s) INTO result FROM public.public_app_settings s WHERE s.id = 1 LIMIT 1;
  RETURN result;
END;
$$;


-- 3. Grant Permissions
-- Allow anonymous and logged-in users to execute the function.
GRANT EXECUTE ON FUNCTION get_public_site_settings() TO anon, authenticated;
-- Allow anonymous and logged-in users to select from the view (required by the function).
GRANT SELECT ON public.public_app_settings TO anon, authenticated;

-- 4. Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';