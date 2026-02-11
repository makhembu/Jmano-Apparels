
-- ============================================================================
-- SECURITY HARDENING MIGRATION
-- Enforces strict RLS policies on analytics and user tables.
-- ============================================================================

-- 1. Secure Analytics Events (Currently often open in Supabase templates)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT analytics (page views)
DROP POLICY IF EXISTS "Public insert analytics" ON public.analytics_events;
CREATE POLICY "Public insert analytics" ON public.analytics_events
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow admins to SELECT analytics
DROP POLICY IF EXISTS "Admins read analytics" ON public.analytics_events;
CREATE POLICY "Admins read analytics" ON public.analytics_events
    FOR SELECT
    TO authenticated
    USING (check_is_admin(auth.uid()));


-- 2. Secure Users Table (Sensitive Data)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users read own profile" ON public.users;
CREATE POLICY "Users read own profile" ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
CREATE POLICY "Users update own profile" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Admins can read ALL profiles
DROP POLICY IF EXISTS "Admins read all profiles" ON public.users;
CREATE POLICY "Admins read all profiles" ON public.users
    FOR SELECT
    TO authenticated
    USING (check_is_admin(auth.uid()));

-- Admins can delete users
DROP POLICY IF EXISTS "Admins delete users" ON public.users;
CREATE POLICY "Admins delete users" ON public.users
    FOR DELETE
    TO authenticated
    USING (check_is_admin(auth.uid()));

-- 3. Secure Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
CREATE POLICY "Admins read audit logs" ON public.audit_logs
    FOR ALL
    TO authenticated
    USING (check_is_admin(auth.uid()));

-- 4. Secure System Logs (If table exists from previous migrations)
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    level TEXT,
    operation TEXT,
    context TEXT,
    details JSONB
);
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage logs" ON public.system_logs;
CREATE POLICY "Admins manage logs" ON public.system_logs
    FOR ALL
    TO authenticated
    USING (check_is_admin(auth.uid()));
