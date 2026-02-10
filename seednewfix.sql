-- ============================================================================
-- SEO & DATA CONSISTENCY FIXES (v2.1)
-- This script adds missing URL slugs to existing products to fix SSR.
-- It should be run once after the initial seed.sql.
-- ============================================================================

-- Add slugs to products for SEO-friendly URLs and correct SSR meta tag generation.
UPDATE public.products
SET slug = 'hope-hoodie-gold'
WHERE title = 'Hope Hoodie - Gold';

UPDATE public.products
SET slug = 'hope-hoodie-black'
WHERE title = 'Hope Hoodie - Black';

UPDATE public.products
SET slug = 'testament-tee-purple'
WHERE title = 'Testament Tee - Purple';

UPDATE public.products
SET slug = 'testament-tee-white'
WHERE title = 'Testament Tee - White';

-- Note: No changes to blog posts are needed as slugs were already present.
-- This file addresses the issue of product pages falling back to homepage meta.
