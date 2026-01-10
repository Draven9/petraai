-- 3.1 Criar Tabela users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user', -- 'admin' ou 'user'
  job_title VARCHAR(255),
  phone VARCHAR(50),
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW()
);

-- 3.2 Criar Tabela companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  contact_email VARCHAR(255),
  address TEXT,
  owner_email VARCHAR(255) NOT NULL,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Habilitar Row Level Security (RLS) é recomendado por padrão
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança básicas (Opcional para teste inicial, mas recomendado)
-- Permitir leitura pública para teste (CUIDADO EM PRODUÇÃO)
-- CREATE POLICY "Public read access" ON public.companies FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);
