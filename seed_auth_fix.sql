
-- 1. Clean up existing problematic policies
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.users;
DROP POLICY IF EXISTS "Allow individual user profile creation" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- 2. Create a Security Definer function to check admin status
-- This function bypasses RLS, breaking the recursion chain.
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Simple, non-recursive policies
CREATE POLICY "users_read_policy" ON public.users
FOR SELECT TO authenticated
USING (auth.uid() = id OR check_is_admin(auth.uid()));

CREATE POLICY "users_insert_own_profile" ON public.users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.users
FOR UPDATE TO authenticated
USING (auth.uid() = id OR check_is_admin(auth.uid()));

-- 5. Ensure existing users have a default role
UPDATE public.users SET role = 'user' WHERE role IS NULL;
