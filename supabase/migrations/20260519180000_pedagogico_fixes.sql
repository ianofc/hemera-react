-- ============================================================
-- Migration: Pedagogico Fixes (FINAL — baseada no schema REAL diagnosticado)
-- 2026-05-19
-- ============================================================

-- 1. Tornar disciplina_id nullable em atividades
ALTER TABLE public.atividades ALTER COLUMN disciplina_id DROP NOT NULL;

-- 2. Adicionar valor_maximo em atividades
ALTER TABLE public.atividades ADD COLUMN IF NOT EXISTS valor_maximo NUMERIC(5,2) DEFAULT 10;

-- 3. Tornar disciplina_id nullable em planos_aula
ALTER TABLE public.planos_aula ALTER COLUMN disciplina_id DROP NOT NULL;

-- 4. Adicionar turma_id em planos_aula (faltava)
ALTER TABLE public.planos_aula ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE;

-- 5. Adicionar data_prevista em planos_aula (coluna real é 'data', adicionamos alias)
ALTER TABLE public.planos_aula ADD COLUMN IF NOT EXISTS data_prevista DATE;

-- 6. Adicionar diario_registro em planos_aula
ALTER TABLE public.planos_aula ADD COLUMN IF NOT EXISTS diario_registro TEXT;

-- 7. Tornar disciplina_id nullable em frequencias
ALTER TABLE public.frequencias ALTER COLUMN disciplina_id DROP NOT NULL;

-- 8. Adicionar turma_id e professor_id em frequencias
ALTER TABLE public.frequencias ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE;
ALTER TABLE public.frequencias ADD COLUMN IF NOT EXISTS professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 9. Substituir unique constraint de frequencias: de (aluno_id, disciplina_id, data) para (aluno_id, turma_id, data)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'frequencias_aluno_id_disciplina_id_data_key'
    AND conrelid = 'public.frequencias'::regclass
  ) THEN
    ALTER TABLE public.frequencias DROP CONSTRAINT frequencias_aluno_id_disciplina_id_data_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'frequencias_aluno_turma_data_key'
    AND conrelid = 'public.frequencias'::regclass
  ) THEN
    ALTER TABLE public.frequencias ADD CONSTRAINT frequencias_aluno_turma_data_key UNIQUE (aluno_id, turma_id, data);
  END IF;
END $$;

-- 10. Tornar disciplina_id nullable em diario_classe
ALTER TABLE public.diario_classe ALTER COLUMN disciplina_id DROP NOT NULL;

-- 11. Criar tabela postagens_mural (não existe no banco ainda)
CREATE TABLE IF NOT EXISTS public.postagens_mural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  arquivo_url TEXT,
  arquivo_nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.postagens_mural ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'postagens_mural' AND policyname = 'Author manage own postagens') THEN
    CREATE POLICY "Author manage own postagens" ON public.postagens_mural
      FOR ALL USING (auth.uid() = autor_id) WITH CHECK (auth.uid() = autor_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'postagens_mural' AND policyname = 'Prof view turma postagens') THEN
    CREATE POLICY "Prof view turma postagens" ON public.postagens_mural
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.turmas t WHERE t.id = turma_id AND t.professor_id = auth.uid())
      );
  END IF;
END $$;

-- 12. Adicionar usuario_id em alunos
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 13. RLS para alunos lerem notas e frequencias
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notas' AND policyname = 'Alunos read own notas') THEN
    CREATE POLICY "Alunos read own notas" ON public.notas
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.alunos a
          WHERE a.id = notas.aluno_id
          AND (a.usuario_id = auth.uid() OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'frequencias' AND policyname = 'Alunos read own frequencias') THEN
    CREATE POLICY "Alunos read own frequencias" ON public.frequencias
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.alunos a
          WHERE a.id = frequencias.aluno_id
          AND (a.usuario_id = auth.uid() OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      );
  END IF;
END $$;

-- 14. Índices
CREATE INDEX IF NOT EXISTS idx_postagens_mural_turma ON public.postagens_mural(turma_id);
CREATE INDEX IF NOT EXISTS idx_postagens_mural_autor ON public.postagens_mural(autor_id);
CREATE INDEX IF NOT EXISTS idx_frequencias_turma ON public.frequencias(turma_id);
CREATE INDEX IF NOT EXISTS idx_planos_turma ON public.planos_aula(turma_id);
CREATE INDEX IF NOT EXISTS idx_alunos_usuario ON public.alunos(usuario_id);
