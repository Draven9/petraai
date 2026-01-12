-- 010_add_ai_settings.sql: Adicionar configurações de IA na empresa

-- Adicionar coluna JSONB para guardar keys e prompts
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{}'::jsonb;

-- A permissão de UPDATE já está restrita a Admins pela policy anterior (009), então está seguro.
-- O admin poderá editar essa coluna livremente.
