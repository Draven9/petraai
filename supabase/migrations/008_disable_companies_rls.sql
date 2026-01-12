-- 008_disable_companies_rls.sql: Desativar RLS (Nuclear Option)

-- Se as policies não estão funcionando, vamos desativar o mecanismo de segurança da tabela temporariamente
-- Isso confirma se o erro é RLS ou outra Constraint.

ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- Se isso funcionar, o erro era RLS mal configurado. 
-- Se continuar falhando, o erro é outra coisa (tipo coluna faltando ou constraint violation).
