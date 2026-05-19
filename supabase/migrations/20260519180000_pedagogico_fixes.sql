-- Adicionar diario_registro em planos_aula
ALTER TABLE public.planos_aula ADD COLUMN IF NOT EXISTS diario_registro TEXT;

-- Adicionar data_prevista em planos_aula caso coluna se chame 'data'
ALTER TABLE public.planos_aula ADD COLUMN IF NOT EXISTS data_prevista DATE;

-- Adicionar usuario_id em alunos
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
