export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'professor' | 'aluno' | 'admin';
  tenant_id?: string;
}

export interface Turma {
  id: string;
  nome: string;
  ano_letivo: string;
  professor_id: string;
  tenant_id?: string;
  created_at?: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  turma_id: string;
  usuario_id?: string;
}

export interface Atividade {
  id: string;
  turma_id: string;
  titulo: string;
  descricao?: string;
  data_aplicacao: string;
  valor_maximo: number;
}

export interface Nota {
  id: string;
  aluno_id: string;
  atividade_id: string;
  valor: number;
}

export interface ArtefatoIA {
  id: string;
  tipo: string;
  url_storage?: string;
  conteudo_markdown?: string;
  prompt_origem: string;
  contexto_id?: string;
  usuario_id: string;
  created_at: string;
}

export interface PlanoDeAula {
  id: string;
  turma_id: string;
  professor_id?: string;
  titulo: string;
  conteudo?: string;
  habilidades_bncc?: string;
  objetivos?: string;
  duracao?: string;
  recursos?: string;
  metodologia?: string;
  avaliacao?: string;
  referencias?: string;
  data_prevista: string;
  status: string;
  diario_registro?: string;
  id_atividade_gerada?: string;
  created_at?: string;
  updated_at?: string;
}
