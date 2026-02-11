
-- ============================================================================
-- AUDIT LOGGING & ARCHIVAL SETUP
-- 1. Hardens audit_logs table.
-- 2. Creates the 'audit-backups' storage bucket.
-- 3. Sets up pg_cron (if extension enabled) to trigger archival.
-- ============================================================================

-- 1. Ensure Audit Table Exists & Is Secure
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read, System can insert
DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
CREATE POLICY "Admins read audit logs" ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (check_is_admin(auth.uid()));

-- Allow authenticated users (via API wrapper) to insert their own actions
-- In a stricter system, this would be SECURITY DEFINER functions only.
DROP POLICY IF EXISTS "Users insert audit logs" ON public.audit_logs;
CREATE POLICY "Users insert audit logs" ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);


-- 2. Create Storage Bucket for Backups
-- Note: 'storage.buckets' insert requires postgres role or migration scripts in dashboard
INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-backups', 'audit-backups', false)
ON CONFLICT (id) DO NOTHING;

-- Secure the bucket (Only Admin/Service Role can write)
CREATE POLICY "Admin Write Audit Backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'audit-backups' 
    AND check_is_admin(auth.uid())
);

CREATE POLICY "Admin Read Audit Backups"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'audit-backups' 
    AND check_is_admin(auth.uid())
);


-- 3. Setup pg_cron (Requires 'pg_cron' and 'pg_net' extensions)
-- Run this in your Supabase SQL Editor if extensions are enabled.

/*
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule Job: Run every hour at minute 0
SELECT cron.schedule(
    'archive-admin-logs',
    '0 * * * *', -- Every hour
    $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/archive-logs',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
);
*/
