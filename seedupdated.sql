-- 1. Add SEO columns to app_settings table
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 2. Update the existing production settings with professional SEO data
UPDATE public.app_settings 
SET 
  seo_title = 'Jambo Apparels | Premium Christian Streetwear & Scripture Apparel',
  seo_description = 'Wear your faith boldly with Jambo Apparels. Discover ethically threaded, scripture-inspired hoodies, tees, and accessories designed for the modern believer. Free UK shipping over £50.',
  hero_banner_text = 'Divinely Threaded Scriptures'
WHERE id = 1;

-- 3. Ensure the category links are also optimized (Optional but recommended)
UPDATE public.categories SET label = 'Hoodies for Hope' WHERE key = 'HOPEHOODIES';
UPDATE public.categories SET label = 'T-shirts for Testimony' WHERE key = 'TESTAMENTSHIRTS';