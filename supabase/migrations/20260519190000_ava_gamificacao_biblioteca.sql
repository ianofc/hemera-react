-- ============================================================
-- Migration: AVA/Gamificação — Ajustes baseados no schema real diagnosticado
-- 2026-05-19
--
-- Estado real do banco:
--   cursos          → existe (instrutor_id, sem criado_por/publicado/nivel)
--   modulos         → existe ✓
--   aulas           → existe (url_conteudo, não conteudo_url)
--   matriculas      → existe ✓
--   progresso_aluno → existe ✓
--   gamificacao_status     → existe ✓ (aluno_id como PK)
--   gamificacao_conquistas → existe ✓ (com badge_titulo, badge_descricao, badge_icone)
--   materiais_biblioteca   → NÃO existe
-- ============================================================

-- ── 1. CURSOS — adicionar colunas faltantes ───────────────────────────────────

ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS publicado BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS nivel TEXT DEFAULT 'Iniciante';
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- RLS em cursos (políticas que faltam)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cursos' AND policyname = 'Cursos publicados visiveis') THEN
    CREATE POLICY "Cursos publicados visiveis" ON public.cursos
      FOR SELECT USING (publicado = true OR auth.uid() = criado_por OR auth.uid() = instrutor_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cursos' AND policyname = 'Instrutores gerenciam cursos') THEN
    CREATE POLICY "Instrutores gerenciam cursos" ON public.cursos
      FOR ALL USING (auth.uid() = instrutor_id OR auth.uid() = criado_por)
      WITH CHECK (auth.uid() = instrutor_id OR auth.uid() = criado_por);
  END IF;
END $$;

-- ── 2. MATERIAIS BIBLIOTECA — criar tabela ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.materiais_biblioteca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'Geral',
  tipo TEXT NOT NULL DEFAULT 'artigo' CHECK (tipo IN ('artigo', 'video', 'ebook', 'podcast', 'link')),
  url TEXT,
  tags TEXT[],
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_publico BOOLEAN NOT NULL DEFAULT true,
  downloads INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.materiais_biblioteca ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materiais_biblioteca' AND policyname = 'Materiais publicos visiveis') THEN
    CREATE POLICY "Materiais publicos visiveis" ON public.materiais_biblioteca
      FOR SELECT USING (is_publico = true OR auth.uid() = criado_por);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materiais_biblioteca' AND policyname = 'Professores gerenciam materiais') THEN
    CREATE POLICY "Professores gerenciam materiais" ON public.materiais_biblioteca
      FOR ALL USING (auth.uid() = criado_por) WITH CHECK (auth.uid() = criado_por);
  END IF;
END $$;

-- ── 3. ÍNDICES ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_cursos_instrutor ON public.cursos(instrutor_id);
CREATE INDEX IF NOT EXISTS idx_cursos_criado_por ON public.cursos(criado_por);
CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON public.materiais_biblioteca(categoria);
CREATE INDEX IF NOT EXISTS idx_materiais_criado_por ON public.materiais_biblioteca(criado_por);
