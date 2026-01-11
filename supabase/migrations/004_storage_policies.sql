-- 004_storage_policies.sql: Configurar Permissões de Storage para Manuais

-- 1. Inserir este bucket na tabela de buckets (Opcional, geralmente o Supabase cria automático pela UI)
-- insert into storage.buckets (id, name, public) values ('manuals', 'manuals', true);

-- 2. Habilitar RLS na tabela de objetos (garantia)
-- alter table storage.objects enable row level security;

-- P.S. As políticas abaixo assumem que você criou o bucket 'manuals' Público na interface.

-- -------------------------------------------------------------
-- PERMISSÕES OBRIGATÓRIAS PARA UPLOAD
-- -------------------------------------------------------------

-- Política DE INSERT (Upload): Permitir que qualquer usuário autenticado faça upload
DROP POLICY IF EXISTS "Upload Manuals Auth" ON storage.objects;
CREATE POLICY "Upload Manuals Auth"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'manuals' );


-- Política DE UPDATE (Substituir arquivo): Apenas Admin
DROP POLICY IF EXISTS "Update Manuals Admin" ON storage.objects;
CREATE POLICY "Update Manuals Admin"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
    bucket_id = 'manuals' AND 
    (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);


-- Política DE DELETE (Excluir arquivo): Apenas Admin
DROP POLICY IF EXISTS "Delete Manuals Admin" ON storage.objects;
CREATE POLICY "Delete Manuals Admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'manuals' AND 
    (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);


-- Política DE SELECT (Download): Publico (já é o padrão se bucket for public, mas garante acesso via API storage)
DROP POLICY IF EXISTS "Select Manuals Public" ON storage.objects;
CREATE POLICY "Select Manuals Public"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'manuals' );

-- -------------------------------------------------------------
-- GARANTIA EXTRA: CORRIGIR ADMIN ROLE (novamente, para garantir)
-- -------------------------------------------------------------
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@petra.ai'; -- Substitua se seu email for outro, mas isso ajuda se estiver testando com este.
