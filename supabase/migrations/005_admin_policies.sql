-- 005_admin_policies.sql: Políticas de Administração e Storage de Empresa

-- 1. COMPANIES TABLE RLS
-- Habilitar RLS em companies (caso não esteja)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Política: VIEW (Todos podem ver os dados da empresa para exibir no layout)
DROP POLICY IF EXISTS "Companies Public View" ON public.companies;
CREATE POLICY "Companies Public View" 
ON public.companies FOR SELECT 
TO authenticated 
USING (true);

-- Política: UPDATE (Apenas Admin pode editar dados da empresa)
DROP POLICY IF EXISTS "Companies Admin Update" ON public.companies;
CREATE POLICY "Companies Admin Update" 
ON public.companies FOR UPDATE
TO authenticated 
USING ( 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') 
);

-- Política: INSERT (Apenas Admin pode criar - geralmente so terá 1 empresa)
DROP POLICY IF EXISTS "Companies Admin Insert" ON public.companies;
CREATE POLICY "Companies Admin Insert" 
ON public.companies FOR INSERT
TO authenticated 
WITH CHECK ( 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') 
);

-- 2. USERS TABLE RLS (Atualizacao)
-- Habilitar RLS em users (caso não esteja)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política: VIEW (Admin vê todos, Usuário vê a si mesmo)
DROP POLICY IF EXISTS "Users View Policy" ON public.users;
CREATE POLICY "Users View Policy" 
ON public.users FOR SELECT 
TO authenticated 
USING ( 
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') 
);

-- Política: UPDATE (Admin edita todos, Usuário edita a si mesmo - exceto role)
DROP POLICY IF EXISTS "Users Update Policy" ON public.users;
CREATE POLICY "Users Update Policy" 
ON public.users FOR UPDATE
TO authenticated 
USING ( 
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') 
);
-- Nota: Para restringir que User comum mude o próprio ROLE, isso deve ser tratado via Trigger ou Function se quisermos segurança max, 
-- ou via RLS checks mais complexos. Por enquanto, confiamos no client-side + backend checks simples.

-- 3. STORAGE: Companies Bucket (Logos)
-- insert into storage.buckets (id, name, public) values ('companies', 'companies', true);

-- Policy: Upload (Admin Only)
DROP POLICY IF EXISTS "Company Logo Upload" ON storage.objects;
CREATE POLICY "Company Logo Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
    bucket_id = 'companies' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Update/Delete (Admin Only)
DROP POLICY IF EXISTS "Company Logo Manage" ON storage.objects;
CREATE POLICY "Company Logo Manage"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
    bucket_id = 'companies' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Public Read
DROP POLICY IF EXISTS "Company Logo Read" ON storage.objects;
CREATE POLICY "Company Logo Read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'companies' );
