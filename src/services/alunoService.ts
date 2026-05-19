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

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getAlunoAtual(): Promise<AlunoTurmaInfo | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  // Busca o aluno pelo usuario_id ou pelo email
  const { data: alunoByUserId } = await supabase
    .from('alunos')
    .select('*')
    .eq('usuario_id', userData.user.id)
    .single();

  if (alunoByUserId) return alunoByUserId;

  // Fallback: busca por email
  const { data: alunoByEmail } = await supabase
    .from('alunos')
    .select('*')
    .eq('email', userData.user.email)
    .single();

  return alunoByEmail ?? null;
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const alunoService = {

  async getResumoDashboard(): Promise<ResumoDashboard> {
    const aluno = await getAlunoAtual();

    if (!aluno) {
      // Retorna dados vazios se o aluno não estiver vinculado
      return {
        minhasTurmas: [],
        atividadesPendentes: 0,
        atividadesConcluidas: 0,
        mediaGeral: 0,
        taxaFrequencia: 100,
        ultimasNotas: [],
      };
    }

    // Busca turma do aluno
    const { data: turma } = await supabase
      .from('turmas')
      .select('*')
      .eq('id', aluno.turma_id)
      .single();

    const minhasTurmas: MinhaTurma[] = turma ? [turma] : [];

    // Busca atividades da turma
    const { data: atividades } = await supabase
      .from('atividades')
      .select('*')
      .eq('turma_id', aluno.turma_id);

    // Busca notas do aluno
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
  },

  async getMinhasAtividades(): Promise<MinhaAtividade[]> {
    const aluno = await getAlunoAtual();
    if (!aluno) return [];

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
  },

  async getMinhaFrequencia(): Promise<FrequenciaAluno[]> {
    const aluno = await getAlunoAtual();
    if (!aluno) return [];

    const { data } = await supabase
      .from('frequencias')
      .select('data, presente')
      .eq('aluno_id', aluno.id)
      .order('data', { ascending: false });

    return (data || []) as FrequenciaAluno[];
  },
};
