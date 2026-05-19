-- ============================================================
-- Migration: AVA (Cursos), Gamificação e Biblioteca
-- 2026-05-19 (v2 — sintaxe corrigida: sem IF NOT EXISTS em POLICY)
-- ============================================================

-- ── 1. CURSOS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  instrutor_nome TEXT NOT NULL DEFAULT 'Professor Hemera',
  instrutor_avatar TEXT,
  categoria TEXT NOT NULL DEFAULT 'Geral',
  imagem_capa TEXT,
  is_gratis BOOLEAN NOT NULL DEFAULT true,
  preco NUMERIC(10,2) DEFAULT 0,
  alunos_inscritos INT DEFAULT 0,
  carga_horaria INT DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  nivel TEXT DEFAULT 'Iniciante',
  publicado BOOLEAN NOT NULL DEFAULT false,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cursos' AND policyname = 'Cursos publicados visiveis para todos') THEN
    CREATE POLICY "Cursos publicados visiveis para todos" ON public.cursos
      FOR SELECT USING (publicado = true OR auth.uid() = criado_por);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cursos' AND policyname = 'Professores gerenciam seus cursos') THEN
    CREATE POLICY "Professores gerenciam seus cursos" ON public.cursos
      FOR ALL USING (auth.uid() = criado_por) WITH CHECK (auth.uid() = criado_por);
  END IF;
END $$;

-- ── 2. MÓDULOS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modulos' AND policyname = 'Modulos visiveis para todos') THEN
    CREATE POLICY "Modulos visiveis para todos" ON public.modulos FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modulos' AND policyname = 'Professores gerenciam modulos') THEN
    CREATE POLICY "Professores gerenciam modulos" ON public.modulos
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.cursos c WHERE c.id = curso_id AND c.criado_por = auth.uid())
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.cursos c WHERE c.id = curso_id AND c.criado_por = auth.uid())
      );
  END IF;
END $$;

-- ── 3. AULAS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  duracao_minutos INT DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT 'video' CHECK (tipo IN ('video', 'leitura', 'quiz')),
  ordem INT NOT NULL DEFAULT 1,
  exige_entrega BOOLEAN DEFAULT false,
  conteudo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'aulas' AND policyname = 'Aulas visiveis para todos') THEN
    CREATE POLICY "Aulas visiveis para todos" ON public.aulas FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'aulas' AND policyname = 'Professores gerenciam aulas') THEN
    CREATE POLICY "Professores gerenciam aulas" ON public.aulas
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.modulos m
          JOIN public.cursos c ON c.id = m.curso_id
          WHERE m.id = modulo_id AND c.criado_por = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.modulos m
          JOIN public.cursos c ON c.id = m.curso_id
          WHERE m.id = modulo_id AND c.criado_por = auth.uid()
        )
      );
  END IF;
END $$;

-- ── 4. MATRÍCULAS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (curso_id, aluno_id)
);
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matriculas' AND policyname = 'Alunos veem suas matriculas') THEN
    CREATE POLICY "Alunos veem suas matriculas" ON public.matriculas
      FOR SELECT USING (auth.uid() = aluno_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matriculas' AND policyname = 'Alunos se matriculam') THEN
    CREATE POLICY "Alunos se matriculam" ON public.matriculas
      FOR INSERT WITH CHECK (auth.uid() = aluno_id);
  END IF;
END $$;

-- ── 5. PROGRESSO DO ALUNO ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.progresso_aluno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id UUID NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
  concluida_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (matricula_id, aula_id)
);
ALTER TABLE public.progresso_aluno ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progresso_aluno' AND policyname = 'Alunos veem seu progresso') THEN
    CREATE POLICY "Alunos veem seu progresso" ON public.progresso_aluno
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.matriculas m WHERE m.id = matricula_id AND m.aluno_id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progresso_aluno' AND policyname = 'Alunos registram progresso') THEN
    CREATE POLICY "Alunos registram progresso" ON public.progresso_aluno
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.matriculas m WHERE m.id = matricula_id AND m.aluno_id = auth.uid())
      );
  END IF;
END $$;

-- ── 6. GAMIFICAÇÃO STATUS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gamificacao_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  xp_total INT NOT NULL DEFAULT 0,
  nivel INT NOT NULL DEFAULT 1,
  ultima_atualizacao TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gamificacao_status ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gamificacao_status' AND policyname = 'Alunos veem proprio status') THEN
    CREATE POLICY "Alunos veem proprio status" ON public.gamificacao_status
      FOR SELECT USING (auth.uid() = aluno_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gamificacao_status' AND policyname = 'Alunos atualizam proprio status') THEN
    CREATE POLICY "Alunos atualizam proprio status" ON public.gamificacao_status
      FOR ALL USING (auth.uid() = aluno_id) WITH CHECK (auth.uid() = aluno_id);
  END IF;
END $$;

-- ── 7. GAMIFICAÇÃO CONQUISTAS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gamificacao_conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  desbloqueada_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, badge_id)
);
ALTER TABLE public.gamificacao_conquistas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gamificacao_conquistas' AND policyname = 'Alunos veem suas conquistas') THEN
    CREATE POLICY "Alunos veem suas conquistas" ON public.gamificacao_conquistas
      FOR SELECT USING (auth.uid() = aluno_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gamificacao_conquistas' AND policyname = 'Inserir conquistas') THEN
    CREATE POLICY "Inserir conquistas" ON public.gamificacao_conquistas
      FOR INSERT WITH CHECK (auth.uid() = aluno_id);
  END IF;
END $$;

-- ── 8. BIBLIOTECA ─────────────────────────────────────────────────────────────

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

-- ── 9. ÍNDICES ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_modulos_curso_id ON public.modulos(curso_id);
CREATE INDEX IF NOT EXISTS idx_aulas_modulo_id ON public.aulas(modulo_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso_id ON public.matriculas(curso_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno_id ON public.matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_progresso_matricula_id ON public.progresso_aluno(matricula_id);
CREATE INDEX IF NOT EXISTS idx_gamificacao_status_aluno ON public.gamificacao_status(aluno_id);
CREATE INDEX IF NOT EXISTS idx_gamificacao_conquistas_aluno ON public.gamificacao_conquistas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON public.materiais_biblioteca(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_criado_por ON public.cursos(criado_por);
