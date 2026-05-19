-- ============================================================
-- Migration: Pedagogico Fixes (v3 — baseada no schema REAL do banco)
-- 2026-05-19
--
-- Schema real encontrado na migration 20260519175446:
--   atividades  → turma_id, disciplina_id (nullable), valor_maximo JÁ EXISTEM
--   frequencias → aluno_id, turma_id, professor_id, data, presente (SEM disciplina_id)
--   planos_aula → turma_id, data_prevista JÁ EXISTE (sem disciplina_id)
--   diario_classe → turma_id, data (SEM disciplina_id)
--   postagens_mural → JÁ EXISTE com autor_id (não professor_id)
-- ============================================================

-- 1. Adicionar diario_registro em planos_aula (única coluna que ainda falta)
ALTER TABLE public.planos_aula ADD COLUMN IF NOT EXISTS diario_registro TEXT;

-- 2. Adicionar campo usuario_id em alunos (para vincular aluno ao auth.users)
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. RLS para alunos lerem suas próprias notas
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
          AND (
            a.usuario_id = auth.uid()
            OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
          )
        )
      );
  END IF;
END $$;

-- 4. RLS para alunos lerem sua própria frequência
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
          AND (
            a.usuario_id = auth.uid()
            OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
          )
        )
      );
  END IF;
END $$;

-- 5. Índice para usuario_id em alunos (performance)
CREATE INDEX IF NOT EXISTS idx_alunos_usuario_id ON public.alunos(usuario_id);

-- 6. Índice para data_prevista em planos_aula (performance)
CREATE INDEX IF NOT EXISTS idx_planos_data_prevista ON public.planos_aula(data_prevista);
