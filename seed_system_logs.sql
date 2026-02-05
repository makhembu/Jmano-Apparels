
-- ============================================================================
-- JAMBO APPARELS - SYSTEM LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp BIGINT,
    operation TEXT,
    context TEXT,
    details JSONB,
    level TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Allow anyone (including anon) to insert logs (client-side error reporting)
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.system_logs;
CREATE POLICY "Enable insert for everyone" 
ON public.system_logs FOR INSERT 
WITH CHECK (true);

-- 2. Allow Admins to read logs
DROP POLICY IF EXISTS "Enable read for admins" ON public.system_logs;
CREATE POLICY "Enable read for admins" 
ON public.system_logs FOR SELECT 
TO authenticated 
USING (public.check_is_admin(auth.uid()));

-- 3. Allow Admins to delete logs (cleanup)
DROP POLICY IF EXISTS "Enable delete for admins" ON public.system_logs;
CREATE POLICY "Enable delete for admins" 
ON public.system_logs FOR DELETE 
TO authenticated 
USING (public.check_is_admin(auth.uid()));
