
-- ============================================================================
-- JAMBO APPARELS - SOCIAL SECTION EDITABILITY
-- Adds editable title and body for the homepage social section.
-- ============================================================================

-- 1. Add Columns to app_settings
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS social_section_title TEXT,
ADD COLUMN IF NOT EXISTS social_section_body TEXT;

-- 2. Seed Default Content
UPDATE public.app_settings
SET
  social_section_title = 'Follow Our Journey',
  social_section_body = 'Join our community on social media for behind-the-scenes content, new drops, and daily inspiration.'
WHERE id = 1;

-- 3. Update the Public View (Recreate to include new columns)
DROP VIEW IF EXISTS public.public_app_settings CASCADE;

CREATE OR REPLACE VIEW public.public_app_settings AS
SELECT
  id,
  -- Identity
  slogan, secondary_slogan, logo_image, mission, vision, core_values,
  founder_name, founder_bio, founder_image, founder_quote,
  -- Contact
  contact_email, contact_phone, contact_address, business_hours, social_links, support_email,
  -- Commerce
  currency, tax_rate, free_shipping_threshold, require_login_for_checkout,
  shipping_policy, return_policy, privacy_policy, terms_conditions,
  -- Hero / Banners
  hero_banner_image, hero_banner_text, announcement_text, is_announcement_enabled,
  maintenance_mode, maintenance_message, featured_categories,
  -- Features
  enable_newsletter_signup, enable_contact_form, enable_reviews,
  -- HOMEPAGE TOGGLES
  enable_featured_products,
  enable_commitment_section,
  enable_categories_section,
  enable_community_section,
  enable_journal_section,
  enable_social_section,
  -- SOCIAL SECTION TEXT (NEW)
  social_section_title,
  social_section_body,
  -- Notifications
  enable_email_notifications, enable_email_welcome, enable_email_new_order,
  enable_email_order_shipped, enable_email_admin_new_order, enable_email_contact_admin,
  -- SEO
  seo_title, seo_description, default_og_image, google_analytics_id, custom_head_scripts,
  shop_seo_title, shop_seo_description, blog_seo_title, blog_seo_description,
  about_seo_title, about_seo_description,
  -- Homepage SEO Content
  seo_content_title, seo_content_intro,
  seo_content_col1_title, seo_content_col1_body,
  seo_content_col2_title, seo_content_col2_body,
  -- Integrations (Public Keys Only)
  paypal_client_id, paypal_mode, payment_gateway_enabled,
  gemini_api_key, resend_from_email
FROM public.app_settings;

-- 4. Recreate the RPC Function
CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT row_to_json(s) INTO result 
  FROM public.public_app_settings s 
  WHERE s.id = 1 
  LIMIT 1;
  
  RETURN result;
END;
$$;

-- 5. Restore Permissions
GRANT SELECT ON public.public_app_settings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_site_settings() TO anon, authenticated;

-- 6. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
