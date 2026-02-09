
-- Add columns to app_settings table
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS seo_content_title TEXT,
ADD COLUMN IF NOT EXISTS seo_content_intro TEXT,
ADD COLUMN IF NOT EXISTS seo_content_col1_title TEXT,
ADD COLUMN IF NOT EXISTS seo_content_col1_body TEXT,
ADD COLUMN IF NOT EXISTS seo_content_col2_title TEXT,
ADD COLUMN IF NOT EXISTS seo_content_col2_body TEXT;

-- Seed default data for the homepage SEO content
UPDATE public.app_settings
SET
  seo_content_title = COALESCE(seo_content_title, 'Faith & Fashion: The Jambo Difference'),
  seo_content_intro = COALESCE(seo_content_intro, 'At **Jambo Apparels**, we believe that clothing is more than just fabric—it''s a statement. As a premier **Christian streetwear brand**, we bridge the gap between modern style and timeless truth. Our collection of **scripture-inspired hoodies**, t-shirts, and accessories are designed for the believer who isn''t afraid to stand out.'),
  seo_content_col1_title = COALESCE(seo_content_col1_title, 'Why Choose Christian Streetwear?'),
  seo_content_col1_body = COALESCE(seo_content_col1_body, 'Fashion is a language. What you wear speaks before you do. **Faith-based fashion** allows you to carry a message of hope, humility, and boldness into every room you enter. Whether it''s the gym, the campus, or the coffee shop, our apparel is designed to be a conversation starter for the Gospel.'),
  seo_content_col2_title = COALESCE(seo_content_col2_title, 'Ethical, Sustainable, Faithful'),
  seo_content_col2_body = COALESCE(seo_content_col2_body, 'We don''t compromise on quality or integrity. Our commitment to **ethical manufacturing** reflects our stewardship of God''s creation. Every stitch in our **Christian clothing** collection is placed with care, ensuring that your apparel lasts as long as your testimony.')
WHERE id = 1;

-- DROP VIEW FIRST TO ALLOW COLUMN REORDERING AND TYPE CHANGES
DROP VIEW IF EXISTS public.public_app_settings CASCADE;

-- Recreate the public view to include the new columns
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
  enable_featured_products, enable_commitment_section, enable_categories_section,
  enable_community_section, enable_journal_section, enable_social_section,
  -- HOMEPAGE SEO CONTENT (NEW)
  seo_content_title, seo_content_intro,
  seo_content_col1_title, seo_content_col1_body,
  seo_content_col2_title, seo_content_col2_body,
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

-- Permissions
GRANT SELECT ON public.public_app_settings TO anon, authenticated;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
