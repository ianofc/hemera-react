-- Migration: Pedagogico & Cortex Integration

-- 1. Escolas (SaaS Tenant)
CREATE TABLE public.escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'SaaS_Head',
  tenant_id UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Escolas viewable by everyone" ON public.escolas FOR SELECT USING (true);

-- 2. Atualizar Profiles com campos do Cortex
ALTER TABLE public.profiles 
  ADD COLUMN cpf TEXT UNIQUE,
  ADD COLUMN matricula TEXT UNIQUE,
  ADD COLUMN telefone TEXT,
  ADD COLUMN endereco TEXT,
  ADD COLUMN data_nascimento DATE,
  ADD COLUMN escola_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL;

-- 3. Atividades (Assignments)
CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_entrega TIMESTAMPTZ,
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prof manage own atividades" ON public.atividades FOR ALL USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);

-- 4. Notas (Grades)
CREATE TABLE public.notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  atividade_id UUID NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  valor NUMERIC(5,2) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, atividade_id)
);
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
-- Professores can manage grades for their turmas (via activity's professor_id)
CREATE POLICY "Prof manage own notas" ON public.notas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.atividades a WHERE a.id = atividade_id AND a.professor_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.atividades a WHERE a.id = atividade_id AND a.professor_id = auth.uid())
);

-- 5. Frequencia (Attendance)
CREATE TABLE public.frequencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  presente BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, disciplina_id, data)
);
ALTER TABLE public.frequencias ENABLE ROW LEVEL SECURITY;
-- Professores manage attendance for their disciplines
CREATE POLICY "Prof manage own frequencias" ON public.frequencias FOR ALL USING (
  EXISTS (SELECT 1 FROM public.disciplinas d WHERE d.id = disciplina_id AND d.professor_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.disciplinas d WHERE d.id = disciplina_id AND d.professor_id = auth.uid())
);

-- 6. Planos de Aula
CREATE TABLE public.planos_aula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT,
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  status TEXT DEFAULT 'Planejado',
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.planos_aula ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prof manage own planos_aula" ON public.planos_aula FOR ALL USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);

-- 7. Diario de Classe
CREATE TABLE public.diario_classe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diario_classe ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prof manage own diario_classe" ON public.diario_classe FOR ALL USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_escola_id ON public.profiles(escola_id);
CREATE INDEX IF NOT EXISTS idx_atividades_disciplina_id ON public.atividades(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_atividades_turma_id ON public.atividades(turma_id);
CREATE INDEX IF NOT EXISTS idx_atividades_professor_id ON public.atividades(professor_id);
CREATE INDEX IF NOT EXISTS idx_notas_aluno_id ON public.notas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_notas_atividade_id ON public.notas(atividade_id);
CREATE INDEX IF NOT EXISTS idx_frequencias_aluno_id ON public.frequencias(aluno_id);
CREATE INDEX IF NOT EXISTS idx_frequencias_disciplina_id ON public.frequencias(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_planos_aula_disciplina_id ON public.planos_aula(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_planos_aula_professor_id ON public.planos_aula(professor_id);
CREATE INDEX IF NOT EXISTS idx_diario_classe_turma_id ON public.diario_classe(turma_id);
CREATE INDEX IF NOT EXISTS idx_diario_classe_disciplina_id ON public.diario_classe(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_diario_classe_professor_id ON public.diario_classe(professor_id);
