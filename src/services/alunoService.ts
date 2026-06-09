import { supabase } from '@/integrations/supabase/client';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface AlunoTurmaInfo {
  id: string;
  nome: string;
  matricula: string | null;
  turma_id: string;
  nota_media: number;
  taxa_frequencia: number;
}

export interface MinhaAtividade {
  id: string;
  titulo: string;
  descricao: string | null;
  data_entrega: string;
  turma_id: string;
  valor_maximo: number;
  minha_nota: number | null;
  nota_id: string | null;
  feedback: string | null;
}

export interface MinhaTurma {
  id: string;
  nome: string;
  ano_letivo: number;
  periodo: string;
}

export interface FrequenciaAluno {
  data: string;
  presente: boolean;
}

export interface ResumoDashboard {
  minhasTurmas: MinhaTurma[];
  atividadesPendentes: number;
  atividadesConcluidas: number;
  mediaGeral: number;
  taxaFrequencia: number;
  ultimasNotas: { titulo: string; valor: number; valorMaximo: number }[];
}

// ─── LocalStorage Helpers ──────────────────────────────────────────────────────

const getLocal = <T>(key: string, seed: T): T => {
  if (typeof window === 'undefined') return seed;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seed;
  }
};

const setLocal = <T>(key: string, val: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
};

// ─── Seeds ─────────────────────────────────────────────────────────────────────

const MOCK_TURMAS = [
  { id: "t2", nome: "1ª A ADM (Estação dos Saberes)", ano_letivo: 2026, periodo: "Vespertino", professor_id: "mock-prof-id" },
  { id: "tur-9A", nome: "9º A — Fundamental", ano_letivo: 2026, periodo: "Matutino", professor_id: "prof-01" }
];

const MOCK_ATIVIDADES = [
  { id: "at1", titulo: "Prova de Álgebra (1ª Unidade)", descricao: "Equações de 2º Grau", data_entrega: "2026-05-12", turma_id: "t2", valor_maximo: 10 },
  { id: "at2", titulo: "Seminário de Funções (2ª Unidade)", descricao: "Funções afins e quadráticas", data_entrega: "2026-05-25", turma_id: "t2", valor_maximo: 10 },
  { id: "at3", titulo: "Simulado Geral", descricao: "Trigonometria e Geometria", data_entrega: "2026-06-05", turma_id: "t2", valor_maximo: 10 },
  { id: "at_m1", titulo: "Lista de Cinemática", descricao: "Gráficos de movimento", data_entrega: "2026-05-08", turma_id: "tur-9A", valor_maximo: 10 },
  { id: "at_m2", titulo: "Lista de Troca de Calor", descricao: "Exercícios de Calorimetria", data_entrega: "2026-05-15", turma_id: "tur-9A", valor_maximo: 10 }
];

const MOCK_NOTAS = [
  { id: "n1", aluno_id: "mock-aluno-id", atividade_id: "at1", valor: 8.5, feedback: "Muito bom desenvolvimento teórico" },
  { id: "n2", aluno_id: "mock-aluno-id", atividade_id: "at2", valor: 9.0, feedback: "Excelente apresentação de slides" },
  { id: "n_m1", aluno_id: "mock-aluno-id", atividade_id: "at_m1", valor: 7.8, feedback: "Bom raciocínio nos gráficos de aceleração" }
];

const MOCK_FREQUENCIAS = [
  { data: "2026-06-05", presente: true },
  { data: "2026-06-02", presente: true },
  { data: "2026-05-28", presente: false },
  { data: "2026-05-25", presente: true },
  { data: "2026-05-20", presente: true }
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getAlunoAtual(): Promise<AlunoTurmaInfo | null> {
  const savedMockUser = typeof window !== 'undefined' ? localStorage.getItem("hemera_mock_user") : null;
  if (savedMockUser) {
    try {
      const mock = JSON.parse(savedMockUser);
      if (mock.user_metadata?.role === "aluno") {
        const localAlunos = getLocal<any[]>('hemera_alunos', []);
        let matched = localAlunos.find(a => a.email === mock.email || a.id === mock.id);
        if (!matched) {
          matched = {
            id: mock.id || "mock-aluno-id",
            nome: `${mock.user_metadata.first_name || 'Carlos'} ${mock.user_metadata.last_name || 'Silva'}`,
            matricula: "2026-MAT-009",
            email: mock.email || "aluno@hemera.io",
            turma_id: "t2", // associado a "1ª A ADM"
            nota_media: 8.7,
            taxa_frequencia: 94
          };
          setLocal('hemera_alunos', [...localAlunos, matched]);
        }
        return {
          id: matched.id,
          nome: matched.nome,
          matricula: matched.matricula,
          email: matched.email,
          turma_id: matched.turma_id || "t2",
          nota_media: Number(matched.nota_media) || 8.7,
          taxa_frequencia: Number(matched.taxa_frequencia) || 94
        };
      }
    } catch (e) {
      console.error("Erro ao parsear mock user:", e);
    }
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data: alunoByUserId } = await supabase
      .from('alunos')
      .select('*')
      .eq('usuario_id', userData.user.id)
      .single();

    if (alunoByUserId) return alunoByUserId;

    const { data: alunoByEmail } = await supabase
      .from('alunos')
      .select('*')
      .eq('email', userData.user.email)
      .single();

    return alunoByEmail ?? null;
  } catch (e) {
    console.warn("Busca por Supabase falhou, recorrendo ao primeiro aluno local.", e);
    const localAlunos = getLocal<any[]>('hemera_alunos', []);
    if (localAlunos.length > 0) {
      return localAlunos[0];
    }
    return null;
  }
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const alunoService = {

  async getResumoDashboard(): Promise<ResumoDashboard> {
    const aluno = await getAlunoAtual();

    if (!aluno) {
      return {
        minhasTurmas: [],
        atividadesPendentes: 0,
        atividadesConcluidas: 0,
        mediaGeral: 0,
        taxaFrequencia: 100,
        ultimasNotas: [],
      };
    }

    try {
      const { data: turma } = await supabase
        .from('turmas')
        .select('*')
        .eq('id', aluno.turma_id)
        .single();

      const minhasTurmas: MinhaTurma[] = turma ? [turma] : [];

      const { data: atividades } = await supabase
        .from('atividades')
        .select('*')
        .eq('turma_id', aluno.turma_id);

      const { data: notas } = await supabase
        .from('notas')
        .select('*, atividade:atividades(titulo, valor_maximo)')
        .eq('aluno_id', aluno.id);

      const totalAtividades = atividades?.length ?? 0;
      const totalNotas = notas?.length ?? 0;
      const atividadesPendentes = Math.max(0, totalAtividades - totalNotas);
      const atividadesConcluidas = totalNotas;

      const mediaGeral = notas && notas.length > 0
        ? notas.reduce((acc, n) => acc + Number(n.valor), 0) / notas.length
        : 0;

      const ultimasNotas = (notas || []).slice(0, 5).map(n => ({
        titulo: (n.atividade as { titulo?: string })?.titulo ?? 'Atividade',
        valor: Number(n.valor),
        valorMaximo: Number((n.atividade as { valor_maximo?: number })?.valor_maximo ?? 10),
      }));

      return {
        minhasTurmas,
        atividadesPendentes,
        atividadesConcluidas,
        mediaGeral,
        taxaFrequencia: Number(aluno.taxa_frequencia) || 100,
        ultimasNotas,
      };
    } catch (e) {
      console.warn("Utilizando resumo de dashboard local.");
      const localTurmas = getLocal<MinhaTurma[]>('hemera_turmas', MOCK_TURMAS);
      const minhasTurmas = localTurmas.filter(t => t.id === aluno.turma_id);

      const localAtividades = getLocal<any[]>('hemera_atividades', MOCK_ATIVIDADES);
      const atividades = localAtividades.filter(at => at.turma_id === aluno.turma_id);

      const localNotas = getLocal<any[]>('hemera_notas', MOCK_NOTAS);
      const notas = localNotas.filter(n => n.aluno_id === aluno.id);

      const totalAtividades = atividades.length;
      const totalNotas = notas.length;
      const atividadesPendentes = Math.max(0, totalAtividades - totalNotas);
      const atividadesConcluidas = totalNotas;

      const mediaGeral = notas.length > 0
        ? notas.reduce((acc, n) => acc + Number(n.valor), 0) / notas.length
        : 0;

      const ultimasNotas = notas.slice(0, 5).map(n => {
        const ativ = atividades.find(a => a.id === n.atividade_id);
        return {
          titulo: ativ?.titulo || 'Atividade',
          valor: Number(n.valor),
          valorMaximo: Number(ativ?.valor_maximo || 10),
        };
      });

      return {
        minhasTurmas,
        atividadesPendentes,
        atividadesConcluidas,
        mediaGeral,
        taxaFrequencia: Number(aluno.taxa_frequencia) || 94,
        ultimasNotas,
      };
    }
  },

  async getMinhasAtividades(): Promise<MinhaAtividade[]> {
    const aluno = await getAlunoAtual();
    if (!aluno) return [];

    try {
      const { data: atividades } = await supabase
        .from('atividades')
        .select('*')
        .eq('turma_id', aluno.turma_id)
        .order('data_entrega');

      if (!atividades || atividades.length === 0) return [];

      const { data: notas } = await supabase
        .from('notas')
        .select('*')
        .eq('aluno_id', aluno.id);

      const notaMap: Record<string, { id: string; valor: number; feedback: string | null }> = {};
      (notas || []).forEach(n => {
        notaMap[n.atividade_id] = { id: n.id, valor: Number(n.valor), feedback: n.feedback };
      });

      return atividades.map(at => ({
        id: at.id,
        titulo: at.titulo,
        descricao: at.descricao,
        data_entrega: at.data_entrega,
        turma_id: at.turma_id,
        valor_maximo: Number(at.valor_maximo ?? 10),
        minha_nota: notaMap[at.id]?.valor ?? null,
        nota_id: notaMap[at.id]?.id ?? null,
        feedback: notaMap[at.id]?.feedback ?? null,
      }));
    } catch (e) {
      console.warn("Utilizando atividades locais do LocalStorage.");
      const localAtividades = getLocal<any[]>('hemera_atividades', MOCK_ATIVIDADES);
      const atividades = localAtividades.filter(at => at.turma_id === aluno.turma_id);

      const localNotas = getLocal<any[]>('hemera_notas', MOCK_NOTAS);
      const notas = localNotas.filter(n => n.aluno_id === aluno.id);

      const notaMap: Record<string, { id: string; valor: number; feedback: string | null }> = {};
      notas.forEach(n => {
        notaMap[n.atividade_id] = { id: n.id, valor: Number(n.valor), feedback: n.feedback };
      });

      return atividades.map(at => ({
        id: at.id,
        titulo: at.titulo,
        descricao: at.descricao,
        data_entrega: at.data_entrega,
        turma_id: at.turma_id,
        valor_maximo: Number(at.valor_maximo ?? 10),
        minha_nota: notaMap[at.id]?.valor ?? null,
        nota_id: notaMap[at.id]?.id ?? null,
        feedback: notaMap[at.id]?.feedback ?? null,
      }));
    }
  },

  async getMinhaFrequencia(): Promise<FrequenciaAluno[]> {
    const aluno = await getAlunoAtual();
    if (!aluno) return [];

    try {
      const { data } = await supabase
        .from('frequencias')
        .select('data, presente')
        .eq('aluno_id', aluno.id)
        .order('data', { ascending: false });

      return (data || []) as FrequenciaAluno[];
    } catch (e) {
      console.warn("Utilizando histórico de frequências local.");
      return getLocal<FrequenciaAluno[]>('hemera_frequencias_aluno', MOCK_FREQUENCIAS);
    }
  },
};
