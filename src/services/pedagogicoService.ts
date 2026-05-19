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
  matricula: string;
  turma_id: string;
  email: string;
  nota_media: number;
  taxa_frequencia: number;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  data_entrega: string;
  disciplina_id: string;
  turma_id: string;
}

export interface Nota {
  id: string;
  aluno_id: string;
  atividade_id: string;
  valor: number;
  feedback: string;
}

export const pedagogicoService = {
  // --- TURMAS ---
  async getTurmasProfessor(): Promise<Turma[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('professor_id', user.user.id)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  // --- ALUNOS ---
  async getAlunosTurma(turmaId: string): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', turmaId)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  // --- FREQUÊNCIA ---
  async registrarFrequencia(turmaId: string, dataAula: string, presencas: Record<string, boolean>) {
    // Exemplo de payload: { 'aluno_id_1': true, 'aluno_id_2': false }
    // Numa implementação real no Supabase, faríamos um upsert na tabela 'frequencia'
    console.log(`Frequência registrada para turma ${turmaId} em ${dataAula}`, presencas);
    return true; // Simulado
  },

  // --- ATIVIDADES ---
  async getAtividadesTurma(turmaId: string): Promise<Atividade[]> {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data_entrega');

    if (error) {
      console.warn("Tabela atividades pode não existir ainda.", error);
      return [];
    }
    return data || [];
  },

  async criarAtividade(atividade: Omit<Atividade, 'id'>): Promise<Atividade> {
    const { data, error } = await supabase
      .from('atividades')
      .insert([atividade])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- NOTAS ---
  async getNotasTurma(turmaId: string) {
    // Busca todas as notas de atividades vinculadas a essa turma
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        atividade:atividades!inner(turma_id)
      `)
      .eq('atividade.turma_id', turmaId);

    if (error) throw error;
    return data || [];
  },

  async registrarNota(alunoId: string, atividadeId: string, valor: number, feedback: string = '') {
    const { data, error } = await supabase
      .from('notas')
      .upsert({ 
        aluno_id: alunoId, 
        atividade_id: atividadeId, 
        valor, 
        feedback 
      }, { onConflict: 'aluno_id, atividade_id' })
      .select();

    if (error) throw error;
    return data;
  },

  // --- GRADEBOOK MATRIX ---
  // Lógica pesada que existia no Django 'gradebook' view. 
  // O React agora vai montar a matriz de notas!
  async getGradebookMatrix(turmaId: string) {
    const alunos = await this.getAlunosTurma(turmaId);
    const atividades = await this.getAtividadesTurma(turmaId);
    const notasFlat = await this.getNotasTurma(turmaId);

    // Mapeamento { aluno_id: { atividade_id: valor_nota } }
    const mapaNotas: Record<string, Record<string, number | null>> = {};
    notasFlat.forEach(nota => {
      if (!mapaNotas[nota.aluno_id]) mapaNotas[nota.aluno_id] = {};
      mapaNotas[nota.aluno_id][nota.atividade_id] = nota.valor;
    });

    // Montando as linhas da tabela
    const tabelaNotas = alunos.map(aluno => {
      let soma = 0;
      let pesos = 0;
      const notasAluno = atividades.map(atividade => {
        const valor = mapaNotas[aluno.id]?.[atividade.id] ?? null;
        if (valor !== null) {
          soma += Number(valor);
          pesos += 1;
        }
        return { atividade_id: atividade.id, valor };
      });

      const media = pesos > 0 ? (soma / pesos).toFixed(1) : '-';

      return {
        aluno,
        notas: notasAluno,
        media
      };
    });

    return {
      atividades,
      tabelaNotas
    };
  },

  // --- PLANOS DE AULA E PLANEJAMENTO ---
  async getPlanosDeAula(turmaId: string): Promise<PlanoDeAula[]> {
    const { data, error } = await supabase
      .from('planos_aula')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data_prevista', { ascending: false });

    if (error) {
      console.warn("Tabela planos_aula pode não existir ainda no Supabase. Retornando vazio.");
      return [];
    }
    return data || [];
  },

  async criarPlanoDeAula(plano: Omit<PlanoDeAula, 'id' | 'created_at'>): Promise<PlanoDeAula> {
    const { data, error } = await supabase
      .from('planos_aula')
      .insert([plano])
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

  // --- INTELIGÊNCIA ARTIFICIAL (Migrado do Cortex/Flask) ---
  async gerarPlanoIA(tema: string, turmaNome: string): Promise<Partial<PlanoDeAula>> {
    // Chamando Edge Function para proteger a API Key do Gemini
    const { data, error } = await supabase.functions.invoke('gerar-plano-ia', {
      body: { tema, turmaNome }
    });

    if (error) {
      console.error("Erro na Edge Function gerar-plano-ia:", error);
      throw new Error("Falha ao gerar plano com IA. A Edge Function precisa estar implantada no Supabase.");
    }

    return data.plano; // O backend retornará as chaves: titulo, conteudo, objetivos, etc.
  },

  async gerarProvaIA(turmaId: string, instrucoes: string): Promise<string> {
    // O backend fará o "Mega-Prompt", agregando resumos dos planos e desempenho da turma
    const { data, error } = await supabase.functions.invoke('gerar-prova-ia', {
      body: { turmaId, instrucoes }
    });

    if (error) throw error;
    return data.prova_markdown; // O backend retornará o conteúdo em markdown
  }
};
