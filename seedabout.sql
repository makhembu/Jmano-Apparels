
-- ============================================================================
-- ABOUT PAGE CONTENT MIGRATION
-- Adds columns for dynamic About Us page content to app_settings table
-- Updates public_app_settings view to expose these new fields
-- ============================================================================

-- 1. Add Columns to app_settings table
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS about_hero_tag TEXT,
ADD COLUMN IF NOT EXISTS about_hero_title TEXT,
ADD COLUMN IF NOT EXISTS about_founder_tag TEXT,
ADD COLUMN IF NOT EXISTS about_mission_title TEXT,
ADD COLUMN IF NOT EXISTS about_mission_body TEXT,
ADD COLUMN IF NOT EXISTS about_vision_title TEXT,
ADD COLUMN IF NOT EXISTS about_vision_body TEXT,
ADD COLUMN IF NOT EXISTS about_values_tag TEXT,
ADD COLUMN IF NOT EXISTS about_values_title TEXT,
ADD COLUMN IF NOT EXISTS about_values_intro TEXT,
ADD COLUMN IF NOT EXISTS about_value_1_title TEXT,
ADD COLUMN IF NOT EXISTS about_value_1_body TEXT,
ADD COLUMN IF NOT EXISTS about_value_2_title TEXT,
ADD COLUMN IF NOT EXISTS about_value_2_body TEXT,
ADD COLUMN IF NOT EXISTS about_value_3_title TEXT,
ADD COLUMN IF NOT EXISTS about_value_3_body TEXT;

-- 2. Seed Initial Data (if null)
UPDATE public.app_settings
SET 
    about_hero_tag = COALESCE(about_hero_tag, 'Our Divine Purpose'),
    about_hero_title = COALESCE(about_hero_title, 'The Jambo Legacy'),
    about_founder_tag = COALESCE(about_founder_tag, 'Message from the Heart'),
    about_mission_title = COALESCE(about_mission_title, 'The Mission'),
    about_mission_body = COALESCE(about_mission_body, 'To equip the saints for the work of ministry through wearable art that speaks truth.'),
    about_vision_title = COALESCE(about_vision_title, 'The Vision'),
    about_vision_body = COALESCE(about_vision_body, 'A world where the Gospel is visible in every street, workplace, and gathering.'),
    about_values_tag = COALESCE(about_values_tag, 'The Foundation'),
    about_values_title = COALESCE(about_values_title, 'Core Values (H.E.B.)'),
    about_values_intro = COALESCE(about_values_intro, 'These three pillars uphold everything we do, from sourcing fabrics to serving our community.'),
    about_value_1_title = COALESCE(about_value_1_title, 'Honesty'),
    about_value_1_body = COALESCE(about_value_1_body, 'Authentic faith, transparent practices, and integrity in every stitch we thread. We believe in being true to God, true to our customers, and true to ourselves.'),
    about_value_2_title = COALESCE(about_value_2_title, 'Excellence'),
    about_value_2_body = COALESCE(about_value_2_body, 'Striving for the highest quality to reflect the character of God. We don''t settle for mediocrity because our message deserves the best vessel.'),
    about_value_3_title = COALESCE(about_value_3_title, 'Boldness'),
    about_value_3_body = COALESCE(about_value_3_body, 'Courage to wear our scriptures and share the Gospel without compromise. In a world of blending in, we are called to stand out for Christ.')
WHERE id = 1;

-- 3. Recreate View to include new columns
DROP VIEW IF EXISTS public.public_app_settings;

CREATE VIEW public.public_app_settings AS
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
  enable_featured_products,
  enable_commitment_section,
  enable_categories_section,
  enable_community_section,
  enable_journal_section,
  enable_social_section,
  social_section_title,
  social_section_body,
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
  seo_content_title,
  seo_content_intro,
  seo_content_col1_title,
  seo_content_col1_body,
  seo_content_col2_title,
  seo_content_col2_body,
  paypal_client_id,
  paypal_mode,
  payment_gateway_enabled,
  gemini_api_key,
  resend_from_email,
  -- Business Info (from previous migrations)
  company_name,
  registration_number,
  vat_number,
  payment_instructions,
  payment_terms,
  -- About Page Content (New)
  about_hero_tag,
  about_hero_title,
  about_founder_tag,
  about_mission_title,
  about_mission_body,
  about_vision_title,
  about_vision_body,
  about_values_tag,
  about_values_title,
  about_values_intro,
  about_value_1_title,
  about_value_1_body,
  about_value_2_title,
  about_value_2_body,
  about_value_3_title,
  about_value_3_body
FROM
  app_settings;

-- Grant access (standard procedure for public settings view)
GRANT SELECT ON public.public_app_settings TO anon, authenticated;
