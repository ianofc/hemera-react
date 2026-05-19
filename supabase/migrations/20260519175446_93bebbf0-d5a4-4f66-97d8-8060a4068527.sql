
-- ATIVIDADES (avaliações)
CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  disciplina_id UUID REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_entrega DATE NOT NULL,
  valor_maximo NUMERIC(5,2) NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prof manage own atividades" ON public.atividades FOR ALL
  USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);
CREATE INDEX idx_atividades_turma ON public.atividades(turma_id);
CREATE INDEX idx_atividades_prof ON public.atividades(professor_id);

-- NOTAS
CREATE TABLE public.notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  atividade_id UUID NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  valor NUMERIC(5,2) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, atividade_id)
);
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prof manage notas of own atividades" ON public.notas FOR ALL
  USING (EXISTS (SELECT 1 FROM public.atividades a WHERE a.id = atividade_id AND a.professor_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.atividades a WHERE a.id = atividade_id AND a.professor_id = auth.uid()));
CREATE INDEX idx_notas_aluno ON public.notas(aluno_id);
CREATE INDEX idx_notas_atividade ON public.notas(atividade_id);

-- FREQUENCIAS (por turma)
CREATE TABLE public.frequencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  presente BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, turma_id, data)
);
ALTER TABLE public.frequencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prof manage own frequencias" ON public.frequencias FOR ALL
  USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);
CREATE INDEX idx_freq_turma_data ON public.frequencias(turma_id, data);

-- PLANOS DE AULA
CREATE TABLE public.planos_aula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  habilidades_bncc TEXT,
  objetivos TEXT,
  duracao TEXT,
  recursos TEXT,
  metodologia TEXT,
  avaliacao TEXT,
  referencias TEXT,
  data_prevista DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Planejado',
  id_atividade_gerada UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.planos_aula ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prof manage own planos_aula" ON public.planos_aula FOR ALL
  USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);
CREATE INDEX idx_planos_turma ON public.planos_aula(turma_id);

-- DIARIO DE CLASSE
CREATE TABLE public.diario_classe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  conteudo TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(turma_id, data)
);
ALTER TABLE public.diario_classe ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prof manage own diario" ON public.diario_classe FOR ALL
  USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);
CREATE INDEX idx_diario_turma ON public.diario_classe(turma_id);

-- MURAL DA TURMA
CREATE TABLE public.postagens_mural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  arquivo_url TEXT,
  arquivo_nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.postagens_mural ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Author manage own postagens" ON public.postagens_mural FOR ALL
  USING (auth.uid() = autor_id) WITH CHECK (auth.uid() = autor_id);
-- Professor da turma vê todas as postagens da sua turma
CREATE POLICY "Prof view turma postagens" ON public.postagens_mural FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.turmas t WHERE t.id = turma_id AND t.professor_id = auth.uid()));
CREATE INDEX idx_postagens_turma ON public.postagens_mural(turma_id);

-- Trigger genérico de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_notas_updated BEFORE UPDATE ON public.notas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_planos_updated BEFORE UPDATE ON public.planos_aula
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_diario_updated BEFORE UPDATE ON public.diario_classe
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
