
-- 1. Add Founder columns to app_settings table
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS founder_name TEXT,
ADD COLUMN IF NOT EXISTS founder_bio TEXT,
ADD COLUMN IF NOT EXISTS founder_image TEXT;

-- 2. Populate with existing About Us data
UPDATE public.app_settings 
SET 
  founder_name = 'Linah Makembu',
  founder_bio = 'Linah Makembu is the Founding Director of Jambo Apparels, a faith-driven apparel brand created to glorify God through creativity, service, and purpose. Her journey began in 2019 through grassroots service in a local church, where she developed a heart for ministry, humility, and bold obedience. These values remain at the core of Jambo Apparels today.

With a strong passion for advocacy and community, Linah envisions Jambo Apparels as more than clothing. It is a platform for spreading the gospel to the ends of the earth, using uniquely threaded wear to communicate truth, faith, and identity in Christ.',
  founder_image = 'https://i.imgur.com/EuNbPGG.png'
WHERE id = 1;
