-- ============================================================
-- Migration: Pedagogico Fixes & Missing Tables
-- 2026-05-19 (v2 — sintaxe corrigida: sem IF NOT EXISTS em POLICY)
-- ============================================================

-- 1. Tornar disciplina_id nullable em atividades
ALTER TABLE public.atividades ALTER COLUMN disciplina_id DROP NOT NULL;

-- 2. Adicionar valor_maximo em atividades
ALTER TABLE public.atividades ADD COLUMN IF NOT EXISTS valor_maximo NUMERIC(5,2) DEFAULT 10;

-- 3. Renomear coluna 'data' para 'data_prevista' em planos_aula (se ainda não foi feita)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'planos_aula' AND column_name = 'data' AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'planos_aula' AND column_name = 'data_prevista' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.planos_aula RENAME COLUMN "data" TO data_prevista;
  END IF;
END $$;

-- Garantir coluna data_prevista
ALTER TABLE public.planos_aula ADD COLUMN IF NOT EXISTS data_prevista DATE;

-- 4. Adicionar diario_registro em planos_aula
ALTER TABLE public.planos_aula ADD COLUMN IF NOT EXISTS diario_registro TEXT;

-- 5. Tornar disciplina_id nullable em planos_aula
ALTER TABLE public.planos_aula ALTER COLUMN disciplina_id DROP NOT NULL;

-- 6. Tornar disciplina_id nullable em frequencias
ALTER TABLE public.frequencias ALTER COLUMN disciplina_id DROP NOT NULL;

-- 7. Tornar disciplina_id nullable em diario_classe
ALTER TABLE public.diario_classe ALTER COLUMN disciplina_id DROP NOT NULL;

-- 8. Tabela postagens_mural
CREATE TABLE IF NOT EXISTS public.postagens_mural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  arquivo_nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.postagens_mural ENABLE ROW LEVEL SECURITY;

-- Políticas postagens_mural (sem IF NOT EXISTS — usar DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'postagens_mural' AND policyname = 'Prof manage own postagens_mural'
  ) THEN
    CREATE POLICY "Prof manage own postagens_mural" ON public.postagens_mural
      FOR ALL USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'postagens_mural' AND policyname = 'Alunos read postagens_mural'
  ) THEN
    CREATE POLICY "Alunos read postagens_mural" ON public.postagens_mural
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.alunos a
          WHERE a.turma_id = postagens_mural.turma_id
          AND (a.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      );
  END IF;
END $$;

-- 9. RLS para alunos lerem suas próprias notas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notas' AND policyname = 'Alunos read own notas'
  ) THEN
    CREATE POLICY "Alunos read own notas" ON public.notas
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.alunos a
          WHERE a.id = notas.aluno_id
          AND (a.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      );
  END IF;
END $$;

-- 10. RLS para alunos lerem sua própria frequência
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'frequencias' AND policyname = 'Alunos read own frequencias'
  ) THEN
    CREATE POLICY "Alunos read own frequencias" ON public.frequencias
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.alunos a
          WHERE a.id = frequencias.aluno_id
          AND (a.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      );
  END IF;
END $$;

-- 11. Adicionar campo usuario_id em alunos
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 12. Índices
CREATE INDEX IF NOT EXISTS idx_postagens_mural_turma_id ON public.postagens_mural(turma_id);
CREATE INDEX IF NOT EXISTS idx_postagens_mural_professor_id ON public.postagens_mural(professor_id);
CREATE INDEX IF NOT EXISTS idx_planos_aula_turma_id ON public.planos_aula(turma_id);
CREATE INDEX IF NOT EXISTS idx_alunos_usuario_id ON public.alunos(usuario_id);
