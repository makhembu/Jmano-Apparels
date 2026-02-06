-- ============================================================================
-- JAMBO APPARELS - BLOG POST SCHEDULER
-- Adds the ability to schedule blog posts for future publication.
-- ============================================================================

-- 1. Add 'scheduled_for' column to the blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- 2. Add an index for potentially querying scheduled posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_for ON public.blog_posts(scheduled_for);

-- NOTE: In a production environment, a cron job would be set up to run periodically.
-- This job would execute a query like the one below to publish scheduled posts:
/*
  UPDATE public.blog_posts
  SET status = 'published', scheduled_for = NULL
  WHERE status = 'draft'
  AND scheduled_for IS NOT NULL
  AND scheduled_for <= now();
*/
-- For this prototype, the column is sufficient to demonstrate the feature.
