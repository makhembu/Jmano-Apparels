-- Add homepage section heading/subtitle fields to app_settings
-- Run this in the Supabase SQL Editor

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS commitment_section_title    text,
  ADD COLUMN IF NOT EXISTS commitment_section_body     text,
  ADD COLUMN IF NOT EXISTS categories_section_title    text,
  ADD COLUMN IF NOT EXISTS categories_section_subtitle text,
  ADD COLUMN IF NOT EXISTS community_section_title     text,
  ADD COLUMN IF NOT EXISTS community_section_subtitle  text,
  ADD COLUMN IF NOT EXISTS journal_section_title       text,
  ADD COLUMN IF NOT EXISTS journal_section_subtitle    text;

-- Seed defaults into the existing settings row
UPDATE public.app_settings
SET
  commitment_section_title    = COALESCE(commitment_section_title,    'Our Commitment to Faith & Quality'),
  commitment_section_body     = COALESCE(commitment_section_body,     'At Jambo Apparels, our mission is to thread scriptures into modern, ethical fashion. We are committed to creating high-quality Christian clothing that serves as a chariot for the gospel.'),
  categories_section_title    = COALESCE(categories_section_title,    'Shop by Category'),
  categories_section_subtitle = COALESCE(categories_section_subtitle, 'Explore our curated collections, each designed with a specific spiritual intention.'),
  community_section_title     = COALESCE(community_section_title,     'From Our Community'),
  community_section_subtitle  = COALESCE(community_section_subtitle,  'Real testimonies from believers who wear their faith boldly.'),
  journal_section_title       = COALESCE(journal_section_title,       'Latest from our Journal'),
  journal_section_subtitle    = COALESCE(journal_section_subtitle,    'Stories of faith, style guides, and community testimonies.')
WHERE id = 1;
