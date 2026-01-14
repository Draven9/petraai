-- 017_fix_manual_pages_upload.sql: Fix Upload Permissions for Manual Pages

-- 1. Ensure bucket exists and is public (just in case)
INSERT INTO storage.buckets (id, name, public)
VALUES ('manual-pages', 'manual-pages', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. RESET Policies for manual-pages
-- We drop everything ensuring no conflicting restrictive policies exist

DROP POLICY IF EXISTS "Auth Upload Manual Pages" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Manual Pages" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Manual Pages" ON storage.objects;

-- 3. Create Permissive Policies

-- SELECT: All public
CREATE POLICY "Public Read Manual Pages"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'manual-pages' );

-- INSERT: Authenticated (allow uploads)
CREATE POLICY "Auth Insert Manual Pages"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'manual-pages' );

-- UPDATE: Authenticated (allow overwrites if needed)
CREATE POLICY "Auth Update Manual Pages"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'manual-pages' );

-- DELETE: Authenticated (allow cleanup)
CREATE POLICY "Auth Delete Manual Pages"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'manual-pages' );
