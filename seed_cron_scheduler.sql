-- ============================================================================
-- JAMBO APPARELS - SUPABASE CRON SCHEDULER
-- Replaces Vercel Cron with pg_cron to trigger the publish-posts function.
-- ============================================================================
-- NOTE:
-- 1. Enable the 'pg_cron' extension in your Supabase Dashboard > Database > Extensions.
-- 2. Set the CRON_SECRET in your Supabase project secrets:
--    supabase secrets set CRON_SECRET="your_strong_random_secret"
-- ============================================================================

-- 1. Enable pg_net if not already enabled (required to call functions)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Unschedule any existing jobs to prevent duplicates
SELECT cron.unschedule('publish-blog-posts');

-- 3. Schedule the new job
-- This runs every 5 minutes. Use '*' for every minute for more frequent checks.
SELECT cron.schedule(
  'publish-blog-posts',
  '*/5 * * * *', -- Every 5 minutes
  $$
    SELECT net.http_post(
        url:='https://irsurnyfjgjmlhlrkbeh.supabase.co/functions/v1/publish-posts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer your_strong_random_secret_from_supabase_dashboard"}'::jsonb,
        body:='{}'::jsonb
    )
  $$
);

-- IMPORTANT: Replace 'your_strong_random_secret_from_supabase_dashboard' with the actual secret you set in your project secrets.
-- It is recommended to run this part of the script manually in the Supabase SQL editor
-- with your real secret, rather than committing the secret to your repository.
