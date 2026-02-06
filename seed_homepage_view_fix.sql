
-- ============================================================================
-- FIX: HOMEPAGE SECTIONS TOGGLE PERSISTENCE
-- Updates the Public View and RPC to expose the homepage section toggles.
-- ============================================================================

-- 1. Ensure Columns Exist (Safety Check)
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS enable_featured_products BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_commitment_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_categories_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_community_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_journal_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_social_section BOOLEAN DEFAULT true;

-- 2. Update the Secure View
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
  -- Homepage Toggles (ADDED)
  enable_featured_products,
  enable_commitment_section,
  enable_categories_section,
  enable_community_section,
  enable_journal_section,
  enable_social_section,
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
  resend_from_email,
  -- Public AI Config (if needed by client)
  gemini_api_key
FROM public.app_settings;

-- 3. Update the RPC Function to return the new fields
CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT 
    -- Chunk 1: Identity & Content
    jsonb_build_object(
      'id', id,
      'slogan', slogan,
      'secondary_slogan', secondary_slogan,
      'logo_image', logo_image,
      'mission', mission,
      'vision', vision,
      'core_values', core_values,
      'founder_name', founder_name,
      'founder_bio', founder_bio,
      'founder_image', founder_image,
      'founder_quote', founder_quote
    ) ||
    -- Chunk 2: Contact & Business
    jsonb_build_object(
      'contact_email', contact_email,
      'contact_phone', contact_phone,
      'contact_address', contact_address,
      'business_hours', business_hours,
      'social_links', social_links,
      'support_email', support_email,
      'currency', currency,
      'tax_rate', tax_rate,
      'free_shipping_threshold', free_shipping_threshold
    ) ||
    -- Chunk 3: Policies & Toggles
    jsonb_build_object(
      'require_login_for_checkout', require_login_for_checkout,
      'shipping_policy', shipping_policy,
      'return_policy', return_policy,
      'privacy_policy', privacy_policy,
      'terms_conditions', terms_conditions,
      'hero_banner_image', hero_banner_image,
      'hero_banner_text', hero_banner_text,
      'announcement_text', announcement_text,
      'is_announcement_enabled', is_announcement_enabled,
      'maintenance_mode', maintenance_mode,
      'maintenance_message', maintenance_message,
      'featured_categories', featured_categories
    ) ||
    -- Chunk 4: Feature Flags (Updated)
    jsonb_build_object(
      'enable_newsletter_signup', enable_newsletter_signup,
      'enable_contact_form', enable_contact_form,
      'enable_reviews', enable_reviews,
      'enable_featured_products', enable_featured_products,
      'enable_commitment_section', enable_commitment_section,
      'enable_categories_section', enable_categories_section,
      'enable_community_section', enable_community_section,
      'enable_journal_section', enable_journal_section,
      'enable_social_section', enable_social_section,
      'enable_email_notifications', enable_email_notifications,
      'enable_email_welcome', enable_email_welcome,
      'enable_email_new_order', enable_email_new_order,
      'enable_email_order_shipped', enable_email_order_shipped,
      'enable_email_admin_new_order', enable_email_admin_new_order,
      'enable_email_contact_admin', enable_email_contact_admin
    ) ||
    -- Chunk 5: SEO & Integrations
    jsonb_build_object(
      'seo_title', seo_title,
      'seo_description', seo_description,
      'default_og_image', default_og_image,
      'google_analytics_id', google_analytics_id,
      'custom_head_scripts', custom_head_scripts,
      'shop_seo_title', shop_seo_title,
      'shop_seo_description', shop_seo_description,
      'blog_seo_title', blog_seo_title,
      'blog_seo_description', blog_seo_description,
      'about_seo_title', about_seo_title,
      'about_seo_description', about_seo_description,
      'paypal_client_id', paypal_client_id,
      'paypal_mode', paypal_mode,
      'payment_gateway_enabled', payment_gateway_enabled,
      'gemini_api_key', gemini_api_key,
      'resend_from_email', resend_from_email
    )
  INTO result
  FROM public.public_app_settings
  WHERE id = 1;
  
  RETURN result;
END;
$$;

-- 4. Permissions
GRANT EXECUTE ON FUNCTION get_public_site_settings() TO anon, authenticated;
GRANT SELECT ON public.public_app_settings TO anon, authenticated;

-- 5. Force Refresh
NOTIFY pgrst, 'reload schema';
