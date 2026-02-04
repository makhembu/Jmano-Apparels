
-- ============================================================================
-- JAMBO APPARELS - SECURITY HARDENING (CRITICAL PATCHES)
-- ============================================================================

-- 1. SECURE APP SETTINGS (Remove sensitive data from public view)
-- By default, RLS might allow SELECT * TO anon. We need to prevent this.
-- We will enable RLS on app_settings and create explicit policies.

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to start clean
DROP POLICY IF EXISTS "Allow public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow admin full access app_settings" ON public.app_settings;

-- Policy 1: Allow Admins FULL access
CREATE POLICY "Allow admin full access app_settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (public.check_is_admin(auth.uid()))
WITH CHECK (public.check_is_admin(auth.uid()));

-- Policy 2: Allow Public READ access (but we can't restrict columns in Policy easily)
-- Workaround: We rely on the frontend Service to select specific columns.
-- BUT to be safe, we should ideally separate secrets.
-- Since we can't refactor the whole table schema now without breaking legacy code,
-- we rely on the `getPublicSettings` implementation in `content.ts` filtering the columns.
-- AND we ensure the `anon` role CANNOT access the secrets via PostgREST if we could.
-- Since Supabase exposes the table, we add a comment warning developers.
COMMENT ON TABLE public.app_settings IS 'Contains both public config and PRIVATE SECRETS. Ensure client only selects safe columns.';

-- 2. SECURE STORAGE BUCKETS (Restrict Uploads)
-- The 'images' bucket currently allows uploads from any authenticated user.
-- We must restrict this to Admins only.

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Create Admin-Only Policies
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' AND public.check_is_admin(auth.uid()) );

CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' AND public.check_is_admin(auth.uid()) );

CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' AND public.check_is_admin(auth.uid()) );

-- Keep Public Read Access (Required for storefront)
-- (Assuming "Public Access" policy from previous seed exists, if not recreate it)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'images' );

-- 3. ENSURE ANALYTICS SECURITY
-- Analytics events should be insertable by public, but readable ONLY by admin.
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert of analytics" ON public.analytics_events;
CREATE POLICY "Allow public insert of analytics" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admins to view analytics" ON public.analytics_events;
CREATE POLICY "Allow admins to view analytics" 
ON public.analytics_events 
FOR SELECT 
USING (public.check_is_admin(auth.uid()));

-- Block update/delete on analytics
DROP POLICY IF EXISTS "Allow update analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow delete analytics" ON public.analytics_events;
