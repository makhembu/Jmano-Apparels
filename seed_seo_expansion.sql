
-- ============================================================================
-- JAMBO APPARELS - ADVANCED SEO SCHEMA EXPANSION
-- Adds capabilities for Indexing control, Canonical URLs, and Global Scripts
-- ============================================================================

-- 1. GLOBAL SETTINGS (Analytics & Scripts)
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS google_analytics_id TEXT, -- e.g. G-XXXXXXXX
ADD COLUMN IF NOT EXISTS custom_head_scripts TEXT, -- Raw HTML for <head>
ADD COLUMN IF NOT EXISTS default_og_image TEXT;    -- Fallback social share image

-- 2. PRODUCTS (Advanced SEO)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS is_noindex BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_nofollow BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS keywords TEXT[]; -- For internal tracking / meta keywords

-- 3. BLOG POSTS (Advanced SEO)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS is_noindex BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_nofollow BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- 4. CATEGORIES (Advanced SEO)
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS is_noindex BOOLEAN DEFAULT false;

-- 5. SEED DEFAULT DATA
UPDATE public.app_settings 
SET 
  default_og_image = 'https://i.imgur.com/pkaScEv.png'
WHERE id = 1;
