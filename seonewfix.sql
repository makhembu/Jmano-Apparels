-- seonewfix.sql
-- Updates the global SEO settings to align with the new index.html meta tags.

UPDATE public.app_settings
SET 
  seo_title = 'Jambo Apparels | Christian Streetwear & Scripture Apparel',
  seo_description = 'Shop premium Christian streetwear at Jambo Apparels. Discover ethically-threaded, scripture-inspired hoodies, tees, and accessories designed to wear your faith boldly.'
WHERE id = 1;
