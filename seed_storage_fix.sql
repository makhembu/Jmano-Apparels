
-- ==========================================
-- FIX STORAGE PERMISSIONS (RLS)
-- ==========================================

-- 1. Ensure the 'images' bucket exists and is set to public
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remove existing policies on 'images' bucket to prevent conflicts
-- We attempt to drop common policy names to ensure a clean slate for this bucket.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- 3. Apply new, correct policies

-- Allow ANYONE (including unauthenticated users) to VIEW images
-- This is crucial for your shopfront to display images to visitors.
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Allow AUTHENTICATED users (Logged in Admins) to UPLOAD images
-- Matches the checks in your Admin panel (must be logged in).
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- Allow AUTHENTICATED users to UPDATE images
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' );

-- Allow AUTHENTICATED users to DELETE images
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );
