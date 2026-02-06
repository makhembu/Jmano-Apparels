-- seed_homepage_toggles.sql
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS enable_featured_products BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_commitment_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_categories_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_community_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_journal_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_social_section BOOLEAN DEFAULT true;

-- Ensure defaults are set for existing row
UPDATE public.app_settings
SET
  enable_featured_products = COALESCE(enable_featured_products, true),
  enable_commitment_section = COALESCE(enable_commitment_section, true),
  enable_categories_section = COALESCE(enable_categories_section, true),
  enable_community_section = COALESCE(enable_community_section, true),
  enable_journal_section = COALESCE(enable_journal_section, true),
  enable_social_section = COALESCE(enable_social_section, true)
WHERE id = 1;
