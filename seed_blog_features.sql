-- ============================================================================
-- JAMBO APPARELS - BLOG ENGAGEMENT FEATURES
-- Adds likes, comments, and helper functions for the blog.
-- ============================================================================

-- 1. Add 'likes' column to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0 NOT NULL;

-- 2. Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true, -- Auto-approve for prototype
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);

-- 4. RLS Policies for blog_comments
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved comments" ON public.blog_comments;
CREATE POLICY "Public can read approved comments"
ON public.blog_comments FOR SELECT
USING (is_approved = true);

DROP POLICY IF EXISTS "Users can insert their own comments" ON public.blog_comments;
CREATE POLICY "Users can insert their own comments"
ON public.blog_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all comments" ON public.blog_comments;
CREATE POLICY "Admins can manage all comments"
ON public.blog_comments FOR ALL
USING (public.check_is_admin(auth.uid()));

-- 5. Create RPC function to atomically increment likes
CREATE OR REPLACE FUNCTION increment_blog_like(post_id_to_inc UUID)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes int;
BEGIN
  -- This function can be called by anonymous users.
  -- The frontend will use localStorage to prevent multiple likes from the same client.
  UPDATE public.blog_posts
  SET likes = likes + 1
  WHERE id = post_id_to_inc
  RETURNING likes INTO new_likes;
  
  RETURN new_likes;
END;
$$;

-- Grant execution permission to logged-in users and anonymous users
GRANT EXECUTE ON FUNCTION increment_blog_like TO authenticated;
GRANT EXECUTE ON FUNCTION increment_blog_like TO anon;
