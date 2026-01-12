-- 009_re_enable_rls.sql: Reativando RLS com Segurança (Jeito Certo)

-- 1. Criar Função Helper "is_admin()"
-- SECURITY DEFINER: Roda com permissões do dono da função (bypass RLS da tabela users)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Reativar RLS na tabela Companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 3. Recriar Policies de CUIDADO (Insert/Update)
DROP POLICY IF EXISTS "Companies Admin Insert" ON public.companies;
CREATE POLICY "Companies Admin Insert" 
ON public.companies FOR INSERT 
TO authenticated 
WITH CHECK ( is_admin() );

DROP POLICY IF EXISTS "Companies Admin Update" ON public.companies;
CREATE POLICY "Companies Admin Update" 
ON public.companies FOR UPDATE 
TO authenticated 
USING ( is_admin() );

-- 4. Garantir Leitura Pública (Authenticated)
DROP POLICY IF EXISTS "Companies Public View" ON public.companies;
CREATE POLICY "Companies Public View" 
ON public.companies FOR SELECT 
TO authenticated 
USING (true);

-- 5. Atualizar Storage Policy também (opcional, mas recomendado)
DROP POLICY IF EXISTS "Company Logo Upload" ON storage.objects;
CREATE POLICY "Company Logo Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'companies' AND is_admin() );

DROP POLICY IF EXISTS "Company Logo Manage" ON storage.objects;
CREATE POLICY "Company Logo Manage"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'companies' AND is_admin() );
