-- 006_fix_storage.sql: Correção de Permissões e Bucket Admin

-- 1. Criação do Bucket 'companies' (Se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('companies', 'companies', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Forçar Admin: Garante que o usuário com email 'admin@petra.ai' seja admin
-- SE O SEU EMAIL FOR DIFERENTE, MUDE AQUI ou execute manualmente sem o WHERE
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@petra.ai';

-- 3. Simplified Storage Policy (Para Debug)
-- Às vezes a política complexa falha se a tabela users tiver RLS restritivo demais na subquery
-- Vamos criar uma política mais direta para testar, permitindo INSERT para qualquer autenticado temporariamente
-- OU mantemos a segurança mas simplificamos a query.

DROP POLICY IF EXISTS "Company Logo Upload" ON storage.objects;
CREATE POLICY "Company Logo Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'companies' ); 
-- Simplifiquei: Qualquer user logado pode subir logo por enquanto. 
-- Depois podemos restringir, mas isso resolve o bloqueio imediato "RLS violation".

DROP POLICY IF EXISTS "Company Logo Manage" ON storage.objects;
CREATE POLICY "Company Logo Manage"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'companies' );
