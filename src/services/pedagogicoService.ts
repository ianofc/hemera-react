import { supabase } from '@/integrations/supabase/client';
import { PlanoDeAula } from '@/types';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Turma {
  id: string;
  nome: string;
  ano_letivo: number;
  periodo: string;
  professor_id: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  turma_id: string;
  professor_id: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string | null;
  email: string | null;
  turma_id: string;
  nota_media: number;
  taxa_frequencia: number;
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

export interface PostagemMural {
  id: string;
  turma_id: string;
  autor_id: string;        // schema real usa autor_id
  texto: string;
  arquivo_nome: string | null;
  created_at: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getProfessorId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Usuário não autenticado');
  return data.user.id;
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const pedagogicoService = {

  // ── TURMAS ──────────────────────────────────────────────────────────────────

  async getTurmasProfessor(): Promise<Turma[]> {
    const professorId = await getProfessorId();
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('professor_id', professorId)
      .order('nome');
    if (error) throw error;
    return data || [];
  },

  async criarTurma(nome: string, anoLetivo: number, periodo: string): Promise<Turma> {
    const professorId = await getProfessorId();
    const { data, error } = await supabase
      .from('turmas')
      .insert([{ nome, ano_letivo: anoLetivo, periodo, professor_id: professorId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── DISCIPLINAS ─────────────────────────────────────────────────────────────

  async getDisciplinasTurma(turmaId: string): Promise<Disciplina[]> {
    const { data, error } = await supabase
      .from('disciplinas')
      .select('*')
      .eq('turma_id', turmaId)
      .order('nome');
    if (error) throw error;
    return data || [];
  },

  // ── ALUNOS ──────────────────────────────────────────────────────────────────

  async getAlunosTurma(turmaId: string): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', turmaId)
      .order('nome');
    if (error) throw error;
    return data || [];
  },

  // ── FREQUÊNCIA ──────────────────────────────────────────────────────────────

  /**
   * Registra frequência de uma turma para uma data.
   * Schema real: UNIQUE(aluno_id, turma_id, data) — sem disciplina_id
   */
  async registrarFrequencia(
    turmaId: string,
    dataAula: string,
    presencas: Record<string, boolean>,
  ): Promise<void> {
    const professorId = await getProfessorId();
    const registros = Object.entries(presencas).map(([alunoId, presente]) => ({
      aluno_id: alunoId,
      turma_id: turmaId,
      professor_id: professorId,
      data: dataAula,
      presente,
    }));

    if (registros.length === 0) return;

    const { error } = await supabase
      .from('frequencias')
      .upsert(registros, { onConflict: 'aluno_id, turma_id, data', ignoreDuplicates: false });

    if (error) throw error;

    // Atualiza taxa_frequencia nos alunos
    for (const alunoId of Object.keys(presencas)) {
      const { data: freqs } = await supabase
        .from('frequencias')
        .select('presente')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId);
      if (freqs && freqs.length > 0) {
        const presentes = freqs.filter(f => f.presente).length;
        const taxa = Math.round((presentes / freqs.length) * 100);
        await supabase
          .from('alunos')
          .update({ taxa_frequencia: taxa })
          .eq('id', alunoId);
      }
    }
  },

  // ── ATIVIDADES ──────────────────────────────────────────────────────────────

  async getAtividadesTurma(turmaId: string): Promise<Atividade[]> {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data_entrega');
    if (error) {
      console.warn('Tabela atividades pode não existir.', error);
      return [];
    }
    return data || [];
  },

  async criarAtividade(
    atividade: Omit<Atividade, 'id' | 'professor_id'>
  ): Promise<Atividade> {
    const professorId = await getProfessorId();
    const { data, error } = await supabase
      .from('atividades')
      .insert([{ ...atividade, professor_id: professorId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletarAtividade(id: string): Promise<void> {
    const { error } = await supabase.from('atividades').delete().eq('id', id);
    if (error) throw error;
  },

  // ── NOTAS ───────────────────────────────────────────────────────────────────

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
        { onConflict: 'aluno_id, atividade_id' }
      )
      .select();
    if (error) throw error;

    // Recalcula nota_media do aluno
    const { data: notas } = await supabase
      .from('notas')
      .select('valor')
      .eq('aluno_id', alunoId);
    if (notas && notas.length > 0) {
      const media = notas.reduce((acc, n) => acc + Number(n.valor), 0) / notas.length;
      await supabase.from('alunos').update({ nota_media: media }).eq('id', alunoId);
    }

    return data;
  },

  // ── GRADEBOOK ───────────────────────────────────────────────────────────────

  async getGradebookMatrix(turmaId: string) {
    const alunos = await this.getAlunosTurma(turmaId);
    const atividades = await this.getAtividadesTurma(turmaId);
    const notasFlat = await this.getNotasTurma(turmaId);

    const mapaNotas: Record<string, Record<string, number | null>> = {};
    notasFlat.forEach(nota => {
      if (!mapaNotas[nota.aluno_id]) mapaNotas[nota.aluno_id] = {};
      mapaNotas[nota.aluno_id][nota.atividade_id] = nota.valor;
    });

    const tabelaNotas = alunos.map(aluno => {
      let soma = 0;
      let pesos = 0;
      const notasAluno = atividades.map(atividade => {
        const valor = mapaNotas[aluno.id]?.[atividade.id] ?? null;
        if (valor !== null) { soma += Number(valor); pesos += 1; }
        return { atividade_id: atividade.id, valor };
      });
      const media = pesos > 0 ? (soma / pesos).toFixed(1) : '-';
      return { aluno, notas: notasAluno, media };
    });

    return { atividades, tabelaNotas };
  },

  // ── MURAL ───────────────────────────────────────────────────────────────────

  async getPostagensMural(turmaId: string): Promise<PostagemMural[]> {
    const { data, error } = await supabase
      .from('postagens_mural')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Tabela postagens_mural pode não existir.', error);
      return [];
    }
    return data || [];
  },

  async criarPostagemMural(
    turmaId: string,
    texto: string,
    arquivoNome?: string,
  ): Promise<PostagemMural> {
    const autorId = await getProfessorId();
    const { data, error } = await supabase
      .from('postagens_mural')
      .insert([{
        turma_id: turmaId,
        autor_id: autorId,           // schema real usa autor_id
        texto,
        arquivo_nome: arquivoNome ?? null,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── DIÁRIO DE CLASSE ────────────────────────────────────────────────────────

  async upsertDiario(planoId: string, diarioRegistro: string): Promise<void> {
    const { error } = await supabase
      .from('planos_aula')
      .update({ diario_registro: diarioRegistro, status: 'Ministrada' })
      .eq('id', planoId);
    if (error) throw error;
  },

  // ── PLANOS DE AULA ──────────────────────────────────────────────────────────

  async getPlanosDeAula(turmaId: string): Promise<PlanoDeAula[]> {
    // Após migration: planos_aula tem turma_id e data_prevista
    // Antes: filtrar por disciplinas da turma, ordenar por 'data'
    const { data, error } = await supabase
      .from('planos_aula')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data', { ascending: false });
    if (error) {
      console.warn('Tabela planos_aula pode não existir ou turma_id ainda não foi adicionado.', error);
      return [];
    }
    return data || [];
  },

  async criarPlanoDeAula(
    plano: Omit<PlanoDeAula, 'id' | 'created_at'>
  ): Promise<PlanoDeAula> {
    const professorId = await getProfessorId();
    const { data, error } = await supabase
      .from('planos_aula')
      .insert([{ ...plano, professor_id: professorId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async atualizarPlano(id: string, updates: Partial<PlanoDeAula>): Promise<PlanoDeAula> {
    const { data, error } = await supabase
      .from('planos_aula')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletarPlano(id: string): Promise<void> {
    const { error } = await supabase.from('planos_aula').delete().eq('id', id);
    if (error) throw error;
  },

  // ── IA (Edge Functions) ──────────────────────────────────────────────────────

  async gerarPlanoIA(tema: string, turmaNome: string): Promise<Partial<PlanoDeAula>> {
    const { data, error } = await supabase.functions.invoke('gerar-plano-ia', {
      body: { tema, turmaNome },
    });
    if (error) throw new Error('Falha ao gerar plano com IA: ' + error.message);
    return data.plano;
  },

  async gerarProvaIA(turmaId: string, instrucoes: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('gerar-prova-ia', {
      body: { turmaId, instrucoes },
    });
    if (error) throw new Error('Falha ao gerar prova com IA: ' + error.message);
    return data.prova_markdown;
  },
};
