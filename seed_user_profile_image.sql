-- Adds avatar_url to the users table for profile images.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Creates a secure function to fetch public profile data (name, avatar) for all users.
-- This is used to display author info on blog posts without exposing sensitive user data.
CREATE OR REPLACE FUNCTION get_public_user_profiles()
RETURNS TABLE(id uuid, name text, avatar_url text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- SECURITY DEFINER allows this function to bypass RLS
  SELECT id, name, avatar_url FROM public.users;
$$;

-- Grant permission for anyone (including anonymous visitors) to call this function.
GRANT EXECUTE ON FUNCTION get_public_user_profiles() TO anon, authenticated;
