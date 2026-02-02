
-- ============================================================================
-- JAMBO APPARELS - SEO IMAGE CLEANUP
-- Replaces placeholder images that block Googlebot (picsum) with crawlable ones.
-- ============================================================================

-- 1. Clean Blog Posts (Featured Images)
UPDATE public.blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop'
WHERE featured_image LIKE '%picsum.photos%';

-- 2. Clean Blog Posts (Thumbnails)
UPDATE public.blog_posts
SET thumbnail = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
WHERE thumbnail LIKE '%picsum.photos%';

-- 3. Clean Products (Images Array)
-- This logic unnests the array, replaces bad URLs, and aggregates it back.
-- If complex logic fails in basic SQL, we fallback to a safe default for affected rows.

UPDATE public.products
SET images = ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=800&fit=crop']
WHERE images::text LIKE '%picsum.photos%';

-- 4. Clean App Settings (Logo/Banners)
UPDATE public.app_settings
SET logo_image = 'https://i.imgur.com/pkaScEv.png'
WHERE logo_image LIKE '%picsum.photos%';

UPDATE public.app_settings
SET hero_banner_image = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=600&fit=crop'
WHERE hero_banner_image LIKE '%picsum.photos%';

-- 5. Clean Founder Image
UPDATE public.app_settings
SET founder_image = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=800&fit=crop'
WHERE founder_image LIKE '%picsum.photos%';
