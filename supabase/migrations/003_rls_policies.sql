-- 003_rls_policies.sql: Configurar Permissões e Segurança

-- Helper Helper para verificar se usuário é admin
-- (Supondo que você setou 'role' na tabela public.users. 
-- Uma abordagem mais segura no Supabase é usar Custom Claims no auth.users, 
-- mas para este MVP usaremos a tabela public.users consultada via join ou policy)

-- Habilitar RLS em todas as tabelas (caso ainda não esteja)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- POLITICAS DE ACESSO (POLICIES)

-- --------------------------------------------------------
-- USERS
-- --------------------------------------------------------
-- Leitura: Usuários podem ver dados de outros usuários (ex: nome do dono da maquina)? 
-- Vamos permitir leitura publica autenticada para simplificar listagens.
CREATE POLICY "Users Read Authenticated" ON public.users FOR SELECT
USING (auth.role() = 'authenticated');

-- Atualização: Usuário só altera seu próprio perfil
CREATE POLICY "Users Update Own" ON public.users FOR UPDATE
USING (auth.uid() = id);


-- --------------------------------------------------------
-- MACHINES (Maquinas)
-- --------------------------------------------------------
-- Leitura: Todos autenticados veem
CREATE POLICY "Machines Read All" ON public.machines FOR SELECT
USING (auth.role() = 'authenticated');

-- Escrita (Create/Update/Delete): Apenas Admin
-- Truque: Verifica na tabela users se o id do usuario atual tem role 'admin'
-- (Nota: isso pode ter impacto de performance, ideal é usar Claims JWT em produção real)
CREATE POLICY "Machines Write Admin" ON public.machines FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);


-- --------------------------------------------------------
-- TECHNICAL MANUALS (Manuais)
-- --------------------------------------------------------
-- Leitura: Todos autenticados
CREATE POLICY "Manuals Read All" ON public.technical_manuals FOR SELECT
USING (auth.role() = 'authenticated');

-- Escrita: Apenas Admin
CREATE POLICY "Manuals Write Admin" ON public.technical_manuals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);


-- --------------------------------------------------------
-- SUPPORT TICKETS (Chamados)
-- --------------------------------------------------------
-- Leitura: Todos autenticados (ou deveria ser: usuario só vê os seus?)
-- Vamos permitir ver todos por enquanto (visão da empresa)
CREATE POLICY "Tickets Read All" ON public.support_tickets FOR SELECT
USING (auth.role() = 'authenticated');

-- Criação: Qualquer usuario autenticado pode abrir chamado
CREATE POLICY "Tickets Create Auth" ON public.support_tickets FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Atualização: Admin OU o próprio criador (se quiser editar)
CREATE POLICY "Tickets Update AdminOrOwner" ON public.support_tickets FOR UPDATE
USING (
  (created_by = auth.uid()::text) OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
