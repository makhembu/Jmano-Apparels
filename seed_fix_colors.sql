-- Update the Triumph category color to Deep Orange to distinguish it from Hope Yellow
UPDATE public.categories 
SET color = '#E67E22' 
WHERE key = 'TRIUMPHTRACKS';

-- Ensure Sainty Sweatshirts also has a distinct color from Patience if they were similar
UPDATE public.categories
SET color = '#C0392B'
WHERE key = 'SAINTYSWEATSHIRTS';