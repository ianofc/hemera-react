// Centralized mock dataset for HEMERA — coherent IDs and relations across screens.

export type Periodo = "Matutino" | "Vespertino" | "Noturno";

export interface MockUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: "Professor" | "Aluno" | "Coordenador" | "Admin";
  status: "Ativo" | "Inativo" | "Pendente";
  ultimoAcesso: string;
}

export interface MockTurma {
  id: string;
  nome: string;
  periodo: Periodo;
  professorId: string;
  professorNome: string;
  alunosCount: number;
  ano: number;
}

export interface MockDisciplina {
  id: string;
  nome: string;
  turmaId: string;
  turmaNome: string;
  cargaHoraria: number;
  ementa: string;
  status: "Ativa" | "Arquivada";
}

export interface MockAluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  turmaId: string;
  turmaNome: string;
  notaMedia: number;
  frequencia: number;
  status: "Ativo" | "Trancado" | "Transferido";
}

export interface MockAvaliacao {
  id: string;
  titulo: string;
  disciplinaId: string;
  disciplinaNome: string;
  turmaId: string;
  turmaNome: string;
  data: string;
  peso: number;
  tipo: "Prova" | "Trabalho" | "Exercício" | "Seminário";
  status: "Agendada" | "Em correção" | "Concluída";
}

export interface MockAtividade {
  id: string;
  titulo: string;
  disciplinaNome: string;
  professor: string;
  prazo: string;
  status: "Pendente" | "Em andamento" | "Entregue" | "Atrasada";
  nota?: number;
}

export interface MockMaterial {
  id: string;
  titulo: string;
  disciplinaNome: string;
  tipo: "PDF" | "Vídeo" | "Slides" | "Link";
  tamanho: string;
  data: string;
}

// ----- Professores -----
export const professores: MockUsuario[] = [
  { id: "prof-01", nome: "Profa. Helena Martins", email: "helena.martins@hemera.edu", perfil: "Professor", status: "Ativo", ultimoAcesso: "hoje, 09:12" },
  { id: "prof-02", nome: "Prof. Rafael Souza", email: "rafael.souza@hemera.edu", perfil: "Professor", status: "Ativo", ultimoAcesso: "ontem, 18:40" },
  { id: "prof-03", nome: "Profa. Beatriz Lima", email: "beatriz.lima@hemera.edu", perfil: "Professor", status: "Ativo", ultimoAcesso: "hoje, 07:55" },
];

// ----- Turmas -----
export const turmas: MockTurma[] = [
  { id: "tur-9A", nome: "9º A — Fundamental", periodo: "Matutino", professorId: "prof-01", professorNome: "Helena Martins", alunosCount: 28, ano: 2026 },
  { id: "tur-1EM", nome: "1º Ano — Médio", periodo: "Matutino", professorId: "prof-02", professorNome: "Rafael Souza", alunosCount: 32, ano: 2026 },
  { id: "tur-2EM", nome: "2º Ano — Médio", periodo: "Vespertino", professorId: "prof-01", professorNome: "Helena Martins", alunosCount: 30, ano: 2026 },
  { id: "tur-3EM", nome: "3º Ano — Médio", periodo: "Noturno", professorId: "prof-03", professorNome: "Beatriz Lima", alunosCount: 26, ano: 2026 },
];

// ----- Disciplinas -----
export const disciplinas: MockDisciplina[] = [
  { id: "dis-mat-9A", nome: "Matemática", turmaId: "tur-9A", turmaNome: "9º A", cargaHoraria: 80, ementa: "Álgebra, geometria e funções básicas.", status: "Ativa" },
  { id: "dis-port-9A", nome: "Língua Portuguesa", turmaId: "tur-9A", turmaNome: "9º A", cargaHoraria: 80, ementa: "Leitura, gramática e produção textual.", status: "Ativa" },
  { id: "dis-fis-1EM", nome: "Física", turmaId: "tur-1EM", turmaNome: "1º EM", cargaHoraria: 60, ementa: "Cinemática e dinâmica.", status: "Ativa" },
  { id: "dis-quim-1EM", nome: "Química", turmaId: "tur-1EM", turmaNome: "1º EM", cargaHoraria: 60, ementa: "Atomística e ligações químicas.", status: "Ativa" },
  { id: "dis-bio-2EM", nome: "Biologia", turmaId: "tur-2EM", turmaNome: "2º EM", cargaHoraria: 60, ementa: "Genética e evolução.", status: "Ativa" },
  { id: "dis-hist-3EM", nome: "História", turmaId: "tur-3EM", turmaNome: "3º EM", cargaHoraria: 60, ementa: "Brasil República e mundo contemporâneo.", status: "Ativa" },
];

// ----- Alunos -----
export const alunos: MockAluno[] = [
  { id: "alu-01", nome: "Ana Beatriz Costa", matricula: "2026001", email: "ana.costa@aluno.hemera.edu", turmaId: "tur-9A", turmaNome: "9º A", notaMedia: 8.7, frequencia: 96, status: "Ativo" },
  { id: "alu-02", nome: "Bruno Almeida", matricula: "2026002", email: "bruno.almeida@aluno.hemera.edu", turmaId: "tur-9A", turmaNome: "9º A", notaMedia: 7.2, frequencia: 91, status: "Ativo" },
  { id: "alu-03", nome: "Carolina Dias", matricula: "2026003", email: "carolina.dias@aluno.hemera.edu", turmaId: "tur-1EM", turmaNome: "1º EM", notaMedia: 9.1, frequencia: 98, status: "Ativo" },
  { id: "alu-04", nome: "Diego Ferreira", matricula: "2026004", email: "diego.ferreira@aluno.hemera.edu", turmaId: "tur-1EM", turmaNome: "1º EM", notaMedia: 6.4, frequencia: 84, status: "Ativo" },
  { id: "alu-05", nome: "Eduarda Gomes", matricula: "2026005", email: "eduarda.gomes@aluno.hemera.edu", turmaId: "tur-2EM", turmaNome: "2º EM", notaMedia: 8.0, frequencia: 93, status: "Ativo" },
  { id: "alu-06", nome: "Felipe Henrique", matricula: "2026006", email: "felipe.h@aluno.hemera.edu", turmaId: "tur-3EM", turmaNome: "3º EM", notaMedia: 7.8, frequencia: 88, status: "Ativo" },
];

// ----- Avaliações -----
export const avaliacoes: MockAvaliacao[] = [
  { id: "av-01", titulo: "Prova bimestral — Funções", disciplinaId: "dis-mat-9A", disciplinaNome: "Matemática", turmaId: "tur-9A", turmaNome: "9º A", data: "12/05/2026", peso: 4, tipo: "Prova", status: "Em correção" },
  { id: "av-02", titulo: "Redação dissertativa", disciplinaId: "dis-port-9A", disciplinaNome: "Português", turmaId: "tur-9A", turmaNome: "9º A", data: "15/05/2026", peso: 3, tipo: "Trabalho", status: "Agendada" },
  { id: "av-03", titulo: "Lista de cinemática", disciplinaId: "dis-fis-1EM", disciplinaNome: "Física", turmaId: "tur-1EM", turmaNome: "1º EM", data: "08/05/2026", peso: 2, tipo: "Exercício", status: "Concluída" },
  { id: "av-04", titulo: "Seminário — Tabela periódica", disciplinaId: "dis-quim-1EM", disciplinaNome: "Química", turmaId: "tur-1EM", turmaNome: "1º EM", data: "22/05/2026", peso: 3, tipo: "Seminário", status: "Agendada" },
  { id: "av-05", titulo: "Prova — Genética mendeliana", disciplinaId: "dis-bio-2EM", disciplinaNome: "Biologia", turmaId: "tur-2EM", turmaNome: "2º EM", data: "10/05/2026", peso: 4, tipo: "Prova", status: "Em correção" },
];

// ----- Atividades (visão do aluno) -----
export const atividadesAluno: MockAtividade[] = [
  { id: "at-01", titulo: "Lista 04 — Equações do 2º grau", disciplinaNome: "Matemática", professor: "Helena Martins", prazo: "08/05/2026", status: "Pendente" },
  { id: "at-02", titulo: "Resenha — Vidas Secas", disciplinaNome: "Português", professor: "Helena Martins", prazo: "12/05/2026", status: "Em andamento" },
  { id: "at-03", titulo: "Relatório de laboratório", disciplinaNome: "Química", professor: "Rafael Souza", prazo: "30/04/2026", status: "Atrasada" },
  { id: "at-04", titulo: "Exercícios Cap. 3", disciplinaNome: "Física", professor: "Rafael Souza", prazo: "02/05/2026", status: "Entregue", nota: 9.0 },
];

// ----- Materiais -----
export const materiais: MockMaterial[] = [
  { id: "mat-01", titulo: "Apostila — Funções", disciplinaNome: "Matemática", tipo: "PDF", tamanho: "2.4 MB", data: "01/05/2026" },
  { id: "mat-02", titulo: "Aula gravada — Cinemática", disciplinaNome: "Física", tipo: "Vídeo", tamanho: "184 MB", data: "28/04/2026" },
  { id: "mat-03", titulo: "Slides — Tabela periódica", disciplinaNome: "Química", tipo: "Slides", tamanho: "5.1 MB", data: "26/04/2026" },
  { id: "mat-04", titulo: "Khan Academy — Genética", disciplinaNome: "Biologia", tipo: "Link", tamanho: "—", data: "22/04/2026" },
];

// ----- Usuários globais (admin) -----
export const usuariosGlobais: MockUsuario[] = [
  ...professores,
  { id: "coord-01", nome: "Mariana Pires", email: "mariana.pires@hemera.edu", perfil: "Coordenador", status: "Ativo", ultimoAcesso: "hoje, 08:30" },
  { id: "adm-01", nome: "Carlos Tavares", email: "carlos.tavares@hemera.edu", perfil: "Admin", status: "Ativo", ultimoAcesso: "hoje, 06:10" },
  ...alunos.map<MockUsuario>((a) => ({ id: a.id, nome: a.nome, email: a.email, perfil: "Aluno", status: a.status === "Ativo" ? "Ativo" : "Inativo", ultimoAcesso: "hoje, 10:00" })),
  { id: "alu-99", nome: "Larissa Pereira", email: "larissa.p@aluno.hemera.edu", perfil: "Aluno", status: "Pendente", ultimoAcesso: "—" },
];

// ----- Auditoria -----
export const auditoria = [
  { id: "log-01", data: "05/05/2026 09:12", usuario: "helena.martins", acao: "Lançou notas", recurso: "Avaliação #av-01", ip: "189.45.2.10" },
  { id: "log-02", data: "05/05/2026 08:30", usuario: "mariana.pires", acao: "Editou turma", recurso: "Turma 9º A", ip: "189.45.2.55" },
  { id: "log-03", data: "04/05/2026 17:48", usuario: "carlos.tavares", acao: "Criou usuário", recurso: "alu-99", ip: "200.10.1.8" },
  { id: "log-04", data: "04/05/2026 15:22", usuario: "rafael.souza", acao: "Removeu material", recurso: "mat-07", ip: "189.45.2.11" },
];

// ----- Matrículas -----
export const matriculas = alunos.map((a, i) => ({
  id: `mat-${a.id}`,
  aluno: a.nome,
  turma: a.turmaNome,
  ano: 2026,
  status: i === 5 ? "Pendente" : "Confirmada",
}));

// ----- Frequência aluno (visão do aluno) -----
export const frequenciaAluno = [
  { disciplina: "Matemática", aulas: 32, faltas: 1, percentual: 96 },
  { disciplina: "Português", aulas: 32, faltas: 3, percentual: 90 },
  { disciplina: "Física", aulas: 24, faltas: 0, percentual: 100 },
  { disciplina: "Química", aulas: 24, faltas: 4, percentual: 83 },
];

// ----- Histórico de notas (revisão/trilha) -----
export const trilhaNotas = [
  { id: "tn-01", aluno: "Ana Beatriz Costa", anterior: "8.0", nova: "8.7", alteradoPor: "Helena Martins", quando: "hoje, 09:14" },
  { id: "tn-02", aluno: "Bruno Almeida", anterior: "—", nova: "7.2", alteradoPor: "Helena Martins", quando: "hoje, 09:15" },
  { id: "tn-03", aluno: "Carolina Dias", anterior: "8.9", nova: "9.1", alteradoPor: "Rafael Souza", quando: "ontem, 18:30" },
];

// ----- IA histórico -----
export const historicoIA = [
  { id: "ia-01", tipo: "Atividade", disciplina: "Matemática", criado: "04/05/2026" },
  { id: "ia-02", tipo: "Prova", disciplina: "Física", criado: "02/05/2026" },
  { id: "ia-03", tipo: "Rubrica", disciplina: "Português", criado: "29/04/2026" },
];

// ----- Integrações -----
export const integracoes = [
  { id: "int-01", servico: "Google Workspace", status: "Conectado", ultimaSync: "hoje, 06:00" },
  { id: "int-02", servico: "Microsoft Teams", status: "Desconectado", ultimaSync: "—" },
  { id: "int-03", servico: "Khan Academy", status: "Conectado", ultimaSync: "ontem, 22:00" },
];
