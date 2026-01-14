-- 015_fix_manuals_delete_policy.sql: Permitir deleção de manuais para usuários autenticados (Fix Cleanup)

-- Relaxar política de DELETE no bucket 'manuals' para garantir que o cleanup funcione
DROP POLICY IF EXISTS "Delete Manuals Admin" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Manuals" ON storage.objects; -- Nome futuro

CREATE POLICY "Auth Delete Manuals"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'manuals' );
