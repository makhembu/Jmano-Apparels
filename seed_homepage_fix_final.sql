
-- ============================================================================
-- JAMBO APPARELS - HOMEPAGE TOGGLES FIX (FINAL)
-- Resolves issue where toggles reset to 'true' on refresh.
-- ============================================================================

-- 1. Ensure Columns Exist in Table (Idempotent)
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS enable_featured_products BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_commitment_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_categories_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_community_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_journal_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_social_section BOOLEAN DEFAULT true;

-- 2. Drop the existing VIEW to ensure clean recreation
DROP VIEW IF EXISTS public.public_app_settings CASCADE;

-- 3. Recreate the VIEW with ALL columns explicitly included
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
  -- HOMEPAGE TOGGLES (Crucial Fix)
  enable_featured_products,
  enable_commitment_section,
  enable_categories_section,
  enable_community_section,
  enable_journal_section,
  enable_social_section,
  -- Notifications
  enable_email_notifications, enable_email_welcome, enable_email_new_order,
  enable_email_order_shipped, enable_email_admin_new_order, enable_email_contact_admin,
  -- SEO
  seo_title, seo_description, default_og_image, google_analytics_id, custom_head_scripts,
  shop_seo_title, shop_seo_description, blog_seo_title, blog_seo_description,
  about_seo_title, about_seo_description,
  -- Integrations (Public Keys Only)
  paypal_client_id, paypal_mode, payment_gateway_enabled,
  gemini_api_key, resend_from_email
FROM public.app_settings;

-- 4. Recreate the RPC Function (Source of Truth for Frontend)
CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- We select the entire row as a JSON object directly from the view
  -- This automatically includes all columns defined in the view above
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
