import { supabase } from '@/integrations/supabase/client';
import { PlanoDeAula } from '@/types';

export interface Turma {
  id: string;
  nome: string;
  ano_letivo: number;
  periodo: string;
  professor_id: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string | null;
  turma_id: string;
  email: string | null;
  nota_media: number;
  taxa_frequencia: number;
}

export interface Disciplina {
  id: string;
  turma_id: string;
  professor_id: string;
  nome: string;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string | null;
  data_entrega: string;
  disciplina_id: string | null;
  turma_id: string;
  professor_id: string;
  valor_maximo: number;
}

export interface Nota {
  id: string;
  aluno_id: string;
  atividade_id: string;
  valor: number;
  feedback: string | null;
}

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Usuário não autenticado');
  return data.user.id;
}

export const pedagogicoService = {
  // --- TURMAS ---
  async getTurmasProfessor(): Promise<Turma[]> {
    const u = await uid();
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('professor_id', u)
      .order('nome');
    if (error) throw error;
    return (data || []) as Turma[];
  },

  async getTurmaById(id: string): Promise<Turma | null> {
    const { data, error } = await supabase.from('turmas').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Turma | null;
  },

  // --- DISCIPLINAS ---
  async getDisciplinasTurma(turmaId: string): Promise<Disciplina[]> {
    const { data, error } = await supabase
      .from('disciplinas')
      .select('*')
      .eq('turma_id', turmaId)
      .order('nome');
    if (error) throw error;
    return (data || []) as Disciplina[];
  },

  async criarDisciplina(turmaId: string, nome: string): Promise<Disciplina> {
    const u = await uid();
    const { data, error } = await supabase
      .from('disciplinas')
      .insert([{ turma_id: turmaId, professor_id: u, nome }])
      .select()
      .single();
    if (error) throw error;
    return data as Disciplina;
  },

  // --- ALUNOS ---
  async getAlunosTurma(turmaId: string): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', turmaId)
      .order('nome');
    if (error) throw error;
    return (data || []) as Aluno[];
  },

  // --- FREQUÊNCIA ---
  async registrarFrequencia(
    turmaId: string,
    dataAula: string,
    presencas: Record<string, boolean>,
  ) {
    const u = await uid();
    const rows = Object.entries(presencas).map(([aluno_id, presente]) => ({
      aluno_id,
      turma_id: turmaId,
      professor_id: u,
      data: dataAula,
      presente,
    }));
    if (rows.length === 0) return true;
    const { error } = await supabase
      .from('frequencias')
      .upsert(rows, { onConflict: 'aluno_id,turma_id,data' });
    if (error) throw error;
    return true;
  },

  async getFrequenciaDia(turmaId: string, data: string) {
    const { data: rows, error } = await supabase
      .from('frequencias')
      .select('aluno_id, presente')
      .eq('turma_id', turmaId)
      .eq('data', data);
    if (error) throw error;
    return rows || [];
  },

  // --- ATIVIDADES ---
  async getAtividadesTurma(turmaId: string): Promise<Atividade[]> {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data_entrega', { ascending: false });
    if (error) throw error;
    return (data || []) as Atividade[];
  },

  async criarAtividade(payload: {
    turma_id: string;
    titulo: string;
    descricao?: string;
    data_entrega: string;
    disciplina_id?: string | null;
    valor_maximo?: number;
  }): Promise<Atividade> {
    const u = await uid();
    const { data, error } = await supabase
      .from('atividades')
      .insert([
        {
          turma_id: payload.turma_id,
          titulo: payload.titulo,
          descricao: payload.descricao ?? null,
          data_entrega: payload.data_entrega,
          disciplina_id: payload.disciplina_id ?? null,
          valor_maximo: payload.valor_maximo ?? 10,
          professor_id: u,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as Atividade;
  },

  async excluirAtividade(id: string) {
    const { error } = await supabase.from('atividades').delete().eq('id', id);
    if (error) throw error;
  },

  // --- NOTAS ---
  async getNotasTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('notas')
      .select(`*, atividade:atividades!inner(turma_id)`)
      .eq('atividade.turma_id', turmaId);
    if (error) throw error;
    return data || [];
  },

  async registrarNota(
    alunoId: string,
    atividadeId: string,
    valor: number,
    feedback = '',
  ) {
    const { data, error } = await supabase
      .from('notas')
      .upsert(
        { aluno_id: alunoId, atividade_id: atividadeId, valor, feedback },
        { onConflict: 'aluno_id,atividade_id' },
      )
      .select();
    if (error) throw error;
    return data;
  },

  // --- GRADEBOOK MATRIX ---
  async getGradebookMatrix(turmaId: string) {
    const [alunos, atividades, notasFlat] = await Promise.all([
      this.getAlunosTurma(turmaId),
      this.getAtividadesTurma(turmaId),
      this.getNotasTurma(turmaId),
    ]);

    const mapaNotas: Record<string, Record<string, number | null>> = {};
    notasFlat.forEach((nota: { aluno_id: string; atividade_id: string; valor: number }) => {
      if (!mapaNotas[nota.aluno_id]) mapaNotas[nota.aluno_id] = {};
      mapaNotas[nota.aluno_id][nota.atividade_id] = Number(nota.valor);
    });

    const tabelaNotas = alunos.map((aluno) => {
      let soma = 0;
      let pesos = 0;
      const notasAluno = atividades.map((atividade) => {
        const valor = mapaNotas[aluno.id]?.[atividade.id] ?? null;
        if (valor !== null) {
          soma += valor;
          pesos += 1;
        }
        return { atividade_id: atividade.id, valor };
      });
      const media = pesos > 0 ? (soma / pesos).toFixed(1) : '-';
      return { aluno, notas: notasAluno, media };
    });

    return { atividades, tabelaNotas };
  },

  // --- PLANOS DE AULA ---
  async getPlanosDeAula(turmaId: string): Promise<PlanoDeAula[]> {
    const { data, error } = await supabase
      .from('planos_aula')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data_prevista', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as PlanoDeAula[];
  },

  async criarPlanoDeAula(
    plano: Omit<PlanoDeAula, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<PlanoDeAula> {
    const u = await uid();
    const { data, error } = await supabase
      .from('planos_aula')
      .insert([{ ...plano, professor_id: u }])
      .select()
      .single();
    if (error) throw error;
    return data as unknown as PlanoDeAula;
  },

  async atualizarPlano(id: string, updates: Partial<PlanoDeAula>): Promise<PlanoDeAula> {
    const { data, error } = await supabase
      .from('planos_aula')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as PlanoDeAula;
  },

  // --- DIÁRIO DE CLASSE ---
  async getDiarioTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('diario_classe')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async upsertDiario(turmaId: string, data: string, conteudo: string, observacoes?: string) {
    const u = await uid();
    const { data: row, error } = await supabase
      .from('diario_classe')
      .upsert(
        { turma_id: turmaId, professor_id: u, data, conteudo, observacoes: observacoes ?? null },
        { onConflict: 'turma_id,data' },
      )
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  // --- MURAL ---
  async getPostagensTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('postagens_mural')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async criarPostagem(turmaId: string, texto: string, arquivo?: { url: string; nome: string }) {
    const u = await uid();
    const { data, error } = await supabase
      .from('postagens_mural')
      .insert([
        {
          turma_id: turmaId,
          autor_id: u,
          texto,
          arquivo_url: arquivo?.url ?? null,
          arquivo_nome: arquivo?.nome ?? null,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- IA (mantém edge functions) ---
  async gerarPlanoIA(tema: string, turmaNome: string): Promise<Partial<PlanoDeAula>> {
    const { data, error } = await supabase.functions.invoke('gerar-plano-ia', {
      body: { tema, turmaNome },
    });
    if (error) throw new Error(error.message || 'Falha ao gerar plano com IA.');
    return data.plano;
  },

  async gerarProvaIA(turmaId: string, instrucoes: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('gerar-prova-ia', {
      body: { turmaId, instrucoes },
    });
    if (error) throw error;
    return data.prova_markdown;
  },
};
