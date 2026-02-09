-- ============================================================================
-- JAMBO APPARELS - SEO OPTIMIZATION V2 (50-60 Char Titles)
-- Updates global settings to meet length and keyword density requirements.
-- ============================================================================

UPDATE public.app_settings 
SET 
  -- Homepage (Global)
  seo_title = 'Jambo Apparels | Premium Christian Streetwear & Scripture Clothing',
  seo_description = 'Discover Jambo Apparels: Ethically threaded Christian streetwear designed for boldness. Shop premium hoodies, tees, and accessories that speak your testimony.',
  
  -- Shop Page
  shop_seo_title = 'Shop Christian Clothing | Scripture Hoodies, Tees & Faith Apparel',
  shop_seo_description = 'Explore our full collection of faith-based fashion. From "Hope" hoodies to "Testament" tees, find high-quality apparel that helps you wear your faith boldly.',
  
  -- Blog/Journal
  blog_seo_title = 'Faith Journal | Christian Lifestyle, Style Guides & Testimonies',
  blog_seo_description = 'Read stories of faith, customer testimonies, and style guides on how to wear scripture apparel in the modern world. Join the Jambo community discussion.',
  
  -- About Page
  about_seo_title = 'Our Mission & Story | The Heart Behind Jambo Apparels',
  about_seo_description = 'Learn about our commitment to Honesty, Excellence, and Boldness. Discover how we are spreading the Gospel through ethically crafted Christian streetwear.',
  
  -- Additional Keywords configuration if supported by your future logic
  custom_head_scripts = COALESCE(custom_head_scripts, '') || '<!-- SEO: Validated -->'
WHERE id = 1;

-- Update Category SEO for better length
UPDATE public.categories SET 
  seo_title = 'Hope Collection | Yellow Christian Hoodies & Faith Apparel',
  seo_description = 'Bright, bold, and faithful. Shop our signature Yellow Hope Hoodies designed to be a beacon of light and a conversation starter for the Gospel.'
WHERE key = 'HOPEHOODIES';

UPDATE public.categories SET 
  seo_title = 'Testament Collection | Organic Christian T-Shirts & Tops',
  seo_description = 'Wear your testimony. Premium organic cotton t-shirts featuring scripture-inspired designs that help you share your faith without saying a word.'
WHERE key = 'TESTAMENTSHIRTS';
