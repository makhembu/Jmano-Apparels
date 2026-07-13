-- Add hero_video column to blog_posts table
-- Run this in the Supabase SQL Editor

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS hero_video text;

COMMENT ON COLUMN blog_posts.hero_video IS 'URL or iframe embed code for the hero video displayed below the featured image';
