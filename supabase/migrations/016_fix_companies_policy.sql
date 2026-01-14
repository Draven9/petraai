-- 016_fix_companies_policy.sql: Garantir visibilidade pública do bucket 'companies'

-- 1. Forçar bucket a ser público (caso tenha sido criado como privado antes)
UPDATE storage.buckets
SET public = true
WHERE id = 'companies';

-- 2. Garantir política de LEITURA (SELECT) para todos (público)
-- Isso é necessário para que getPublicUrl funcione sem token
DROP POLICY IF EXISTS "Public Select Companies" ON storage.objects;
CREATE POLICY "Public Select Companies"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'companies' );

-- 3. Garantir política de INSERT/UPDATE para autenticados (Upload)
-- (Repetindo/Reforçando para garantir que não quebre o upload)
DROP POLICY IF EXISTS "Auth Insert Companies" ON storage.objects;
CREATE POLICY "Auth Insert Companies"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'companies' );

DROP POLICY IF EXISTS "Auth Update Companies" ON storage.objects;
CREATE POLICY "Auth Update Companies"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'companies' );
