-- 4.1 Criar Tabela machines
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255),
  year INTEGER,
  machine_type VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  status VARCHAR(100) DEFAULT 'operacional',
  last_maintenance DATE,
  hours_worked NUMERIC,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Índices machines
CREATE INDEX IF NOT EXISTS idx_machines_type ON public.machines(machine_type);
CREATE INDEX IF NOT EXISTS idx_machines_status ON public.machines(status);

-- 4.2 Criar Tabela technical_manuals
CREATE TABLE IF NOT EXISTS public.technical_manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  machine_type VARCHAR(100) NOT NULL,
  brand VARCHAR(255),
  model VARCHAR(255),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  content_extracted TEXT,
  tags TEXT[], -- Array de strings
  version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  uploaded_by_email VARCHAR(255),
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Índices technical_manuals
CREATE INDEX IF NOT EXISTS idx_manuals_type ON public.technical_manuals(machine_type);
CREATE INDEX IF NOT EXISTS idx_manuals_active ON public.technical_manuals(is_active);
CREATE INDEX IF NOT EXISTS idx_manuals_text_search ON public.technical_manuals 
  USING gin(to_tsvector('portuguese', content_extracted));

-- 4.3 Criar Tabela support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.machines(id),
  problem_description TEXT NOT NULL,
  urgency VARCHAR(50) DEFAULT 'media',
  status VARCHAR(50) DEFAULT 'aberto',
  location VARCHAR(255),
  ai_analysis JSONB, -- Objeto JSON com análise
  mechanic_notes TEXT,
  resolution_notes TEXT,
  parts_replaced TEXT[],
  time_to_resolution NUMERIC,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Índices support_tickets
CREATE INDEX IF NOT EXISTS idx_tickets_machine ON public.support_tickets(machine_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_date ON public.support_tickets(created_date DESC);

-- Habilitar RLS (Recomendado)
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- SEED DATA (Dados de Exemplo)
-- Inserir Maquinas
INSERT INTO public.machines (name, model, brand, serial_number, year, machine_type, status, hours_worked)
VALUES 
('Escavadeira 01', '320D', 'Caterpillar', 'CAT320D12345', 2022, 'Escavadeira', 'operacional', 1200.5),
('Trator de Esteira 05', 'D6T', 'Caterpillar', 'CATD6T98765', 2020, 'Trator', 'manutencao', 3500.0);

-- Inserir Tickets (Vinculado a primeira maquina encontrada)
DO $$
DECLARE
  v_machine_id UUID;
BEGIN
  SELECT id INTO v_machine_id FROM public.machines LIMIT 1;
  
  IF v_machine_id IS NOT NULL THEN
    INSERT INTO public.support_tickets (machine_id, problem_description, urgency, status, location)
    VALUES (v_machine_id, 'Vazamento de óleo na esteira esquerda', 'alta', 'aberto', 'Obra Zona Sul');
  END IF;
END $$;
