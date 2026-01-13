-- 013_security_hardening.sql: Fortalecimento das Políticas de Segurança (RLS)

-- Objetivo: Remover políticas permissivas de desenvolvimento e garantir que apenas Admins possam alterar dados críticos.

-- ========================================================
-- 1. TABLE: USERS
-- ========================================================
-- Remover política perigosa criada no passo 004
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.users;

-- VIEW: Todo usuário autenticado pode ver a lista de usuários (para exibir "Responsável", "Chat", etc)
DROP POLICY IF EXISTS "Users Read Authenticated" ON public.users;
DROP POLICY IF EXISTS "Users View Policy" ON public.users; -- Cleanup duplicatas
CREATE POLICY "Users Read Authenticated" ON public.users FOR SELECT 
USING (auth.role() = 'authenticated');

-- UPDATE: Usuário edita a si mesmo OU Admin edita qualquer um
DROP POLICY IF EXISTS "Users Update Own" ON public.users;
DROP POLICY IF EXISTS "Users Update Policy" ON public.users;
CREATE POLICY "Users Update Self Or Admin" ON public.users FOR UPDATE
USING ( auth.uid() = id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') )
WITH CHECK ( auth.uid() = id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );

-- INSERT: Apenas Admin pode criar novos usuários manualmente (via Painel)
-- (O self-registration via Supabase Auth é tratado via triggers, se houver)
DROP POLICY IF EXISTS "Users Insert Admin" ON public.users;
CREATE POLICY "Users Insert Admin" ON public.users FOR INSERT
WITH CHECK ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );

-- DELETE: Apenas Admin
DROP POLICY IF EXISTS "Users Delete Admin" ON public.users;
CREATE POLICY "Users Delete Admin" ON public.users FOR DELETE
USING ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );


-- ========================================================
-- 2. TABLE: MACHINES
-- ========================================================
-- Remover políticas antigas
DROP POLICY IF EXISTS "Machines Read All" ON public.machines;
DROP POLICY IF EXISTS "Machines Write Admin" ON public.machines;
DROP POLICY IF EXISTS "Machines Default" ON public.machines;

-- VIEW: Todos autenticados
CREATE POLICY "Machines Read All" ON public.machines FOR SELECT 
USING (auth.role() = 'authenticated');

-- WRITE (Insert/Update/Delete): Apenas Admin
CREATE POLICY "Machines Insert Admin" ON public.machines FOR INSERT
WITH CHECK ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );

CREATE POLICY "Machines Update Admin" ON public.machines FOR UPDATE
USING ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );

CREATE POLICY "Machines Delete Admin" ON public.machines FOR DELETE
USING ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );


-- ========================================================
-- 3. TABLE: TECHNICAL MANUALS
-- ========================================================
-- Remover políticas antigas
DROP POLICY IF EXISTS "Manuals Read All" ON public.technical_manuals;
DROP POLICY IF EXISTS "Manuals Write Admin" ON public.technical_manuals;

-- VIEW: Todos autenticados
CREATE POLICY "Manuals Read All" ON public.technical_manuals FOR SELECT 
USING (auth.role() = 'authenticated');

-- WRITE: Apenas Admin
CREATE POLICY "Manuals Insert Admin" ON public.technical_manuals FOR INSERT
WITH CHECK ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );

CREATE POLICY "Manuals Update Admin" ON public.technical_manuals FOR UPDATE
USING ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );

CREATE POLICY "Manuals Delete Admin" ON public.technical_manuals FOR DELETE
USING ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') );

-- ========================================================
-- 4. STORAGE (Buckets) - Reforço
-- ========================================================
-- Se necessário, garantir que policies de storage também chequem role='admin'
-- (Já feito em 005_admin_policies.sql e 004_storage_policies.sql, mantemos como está)
