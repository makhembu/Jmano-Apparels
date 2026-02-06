-- ============================================================================
-- JAMBO APPARELS - SITELINKS SEO EXPANSION
-- ============================================================================

-- 1. Add column to app_settings to store sitelinks configuration
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS priority_pages JSONB;

-- 2. Seed default priority pages for Sitelinks
UPDATE public.app_settings
SET priority_pages = '[
  {
    "pageUrl": "/shop",
    "pageTitle": "Shop Christian Streetwear",
    "pageDescription": "Browse our full collection of faith-inspired apparel",
    "priority": 9,
    "enabled": true
  },
  {
    "pageUrl": "/blog",
    "pageTitle": "Faith Journal & Blog",
    "pageDescription": "Stories of faith, style guides, and community testimonies",
    "priority": 8,
    "enabled": true
  },
  {
    "pageUrl": "/about",
    "pageTitle": "About Our Mission",
    "pageDescription": "Learn about our commitment to faith-based fashion",
    "priority": 7,
    "enabled": true
  },
  {
    "pageUrl": "/returns",
    "pageTitle": "Returns & Refunds",
    "pageDescription": "View our 30-day return policy and instructions.",
    "priority": 5,
    "enabled": true
  }
]'::jsonb
WHERE id = 1 AND priority_pages IS NULL;
