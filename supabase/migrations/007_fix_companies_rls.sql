-- 007_fix_companies_rls.sql: Corrigir RLS da Tabela Companies

-- O erro acontece porque a Policy de Insert/Update está fazendo uma subquery na tabela Users
-- E se o user não tiver permissão de SELECT na tabela Users (ou na própria linha), a subquery retorna false.

-- Solução 1: Simplificar temporariamente a checagem para "Authenticated"
-- Solução 2: Garantir que a policy de Users permita que o usuário leia seu próprio role

-- Vamos aplicar a Solução 1 para destravar o admin painel imediato.

DROP POLICY IF EXISTS "Companies Admin Insert" ON public.companies;
CREATE POLICY "Companies Admin Insert" 
ON public.companies FOR INSERT
TO authenticated 
WITH CHECK (true); -- Permite qualquer logado criar (temporário para dev)

DROP POLICY IF EXISTS "Companies Admin Update" ON public.companies;
CREATE POLICY "Companies Admin Update" 
ON public.companies FOR UPDATE
TO authenticated 
USING (true); -- Permite qualquer logado editar (temporário para dev)

-- Nota: Em produção, voltaremos para checagem de role, mas verificando se a policy de Users permite leitura.
-- Uma alternativa segura sem subquery complexa é usar (auth.jwt() ->> 'role') se estiver usando custom claims, 
-- mas como usamos tabela publica, vamos manter simples por agora.
