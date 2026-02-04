
-- ============================================================================
-- FIX: PUBLIC SETTINGS ACCESS
-- ============================================================================

-- 1. Ensure the Safe View Exists (Re-definition to be sure)
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
  payment_gateway_enabled
FROM public.app_settings;

-- 2. Create Security Definer Function
-- This function runs with Admin privileges (bypassing RLS) but only returns the data allowed by the View.
CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Select from the VIEW (which filters columns)
  SELECT row_to_json(v) INTO result FROM public.public_app_settings v LIMIT 1;
  RETURN result;
END;
$$;

-- 3. Grant Execution Permissions
GRANT EXECUTE ON FUNCTION get_public_site_settings TO anon, authenticated;
GRANT SELECT ON public.public_app_settings TO anon, authenticated;
