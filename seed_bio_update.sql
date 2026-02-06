
-- 1. Add bio column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Update the public profile fetch function to include bio
-- Must drop first because we are changing the RETURN TABLE signature
DROP FUNCTION IF EXISTS get_public_user_profiles();

CREATE OR REPLACE FUNCTION get_public_user_profiles()
RETURNS TABLE(id uuid, name text, avatar_url text, bio text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- SECURITY DEFINER allows this function to bypass RLS
  SELECT id, name, avatar_url, bio FROM public.users;
$$;

-- 3. Grant permission
GRANT EXECUTE ON FUNCTION get_public_user_profiles() TO anon, authenticated;
