-- 1. Add page-specific SEO columns to app_settings
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS shop_seo_title TEXT,
ADD COLUMN IF NOT EXISTS shop_seo_description TEXT,
ADD COLUMN IF NOT EXISTS blog_seo_title TEXT,
ADD COLUMN IF NOT EXISTS blog_seo_description TEXT,
ADD COLUMN IF NOT EXISTS about_seo_title TEXT,
ADD COLUMN IF NOT EXISTS about_seo_description TEXT;

-- 2. Add SEO columns to categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 3. Populate professional SEO content for Jambo Apparels (Fixed Syntax)
UPDATE public.app_settings 
SET 
  shop_seo_title = 'Shop Faith-Based Apparel | Jambo Apparels Collection',
  shop_seo_description = 'Browse our collection of ethically threaded scripture hoodies, tees, and accessories. Wear your faith in humility and boldness with our premium Christian streetwear.',
  blog_seo_title = 'The Journal | Faith, Style & Community Testimonies',
  blog_seo_description = 'Explore stories of faith, styling guides for scripture apparel, and real testimonies from the Jambo Apparels community.',
  about_seo_title = 'Our Mission & Vision | Ethically Threaded Faith Apparel',
  about_seo_description = 'Learn about Jambo Apparels’ commitment to honesty, excellence, and boldness. Discover how we thread scriptures into modern fashion to spread the Gospel.'
WHERE id = 1;

-- 4. Update Category SEO
UPDATE public.categories SET seo_title = 'Hoodies for Hope | Scripture Hoodies', seo_description = 'Premium scripture-inspired hoodies to keep you warm and bold in your faith. Divinely threaded with truth.' WHERE key = 'HOPEHOODIES';
UPDATE public.categories SET seo_title = 'Testament T-Shirts | Faith-Based Tees', seo_description = 'Organic cotton t-shirts designed to share your testimony with the world. Durable and divinely inspired.' WHERE key = 'TESTAMENTSHIRTS';
UPDATE public.categories SET seo_title = 'Hats for Humility | Faith Caps & Accessories', seo_description = 'Embroidered baseball caps and beanies featuring scriptures. Complete your look with humility.' WHERE key = 'HUMILITYHATS';

-- 5. Cleanup any missing product/blog SEO fields (professional polish)
UPDATE public.products SET seo_title = title || ' | Jambo Apparels' WHERE seo_title IS NULL;
UPDATE public.products SET seo_description = LEFT(description, 160) WHERE seo_description IS NULL;
UPDATE public.blog_posts SET seo_title = title || ' | Jambo Journal' WHERE seo_title IS NULL;
UPDATE public.blog_posts SET seo_description = summary WHERE seo_description IS NULL;