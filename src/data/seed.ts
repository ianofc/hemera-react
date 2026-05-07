// Gerador determinístico de dados mock (seed) — IDs e relações coerentes.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const NOMES = [
  "Ana Souza", "Bruno Lima", "Camila Reis", "Diego Castro", "Eduarda Paz",
  "Felipe Rocha", "Gabriela Pinto", "Henrique Sá", "Isabela Cruz", "João Mendes",
  "Karen Dias", "Lucas Faria", "Marina Tavares", "Nicolas Vieira", "Olívia Brito",
  "Paulo Henrique", "Quésia Lopes", "Rafaela Marques", "Samuel Costa", "Tainá Melo",
  "Ulisses Borges", "Vitória Nunes", "Wagner Couto", "Xavier Prado", "Yasmin Reis",
];

const DISCIPLINAS = ["Matemática", "Português", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Filosofia", "Sociologia", "Artes", "Ed. Física"];

const LIVROS_BASE = [
  "Vidas Secas", "Dom Casmurro", "Iracema", "O Cortiço", "Memórias Póstumas",
  "Capitães da Areia", "Macunaíma", "Grande Sertão: Veredas", "A Hora da Estrela",
  "O Quinze", "Sagarana", "Triste Fim de Policarpo", "O Tempo e o Vento",
  "Os Sertões", "Quincas Borba", "Hora dos Ruminantes", "São Bernardo",
];

const AUTORES = ["Graciliano Ramos", "Machado de Assis", "Jorge Amado", "Clarice Lispector", "Guimarães Rosa", "Lima Barreto", "Erico Verissimo", "Euclides da Cunha"];

const CURSOS_TITULOS = [
  "Pré-Cálculo Essencial", "Redação para o ENEM", "Inglês Básico A1", "Programação em Python I",
  "História do Brasil Colonial", "Química Orgânica Introdutória", "Educação Financeira",
  "Biologia Celular", "Geometria Analítica", "Filosofia Antiga",
];

export interface SeedAluno { id: string; nome: string; matricula: string; email: string; turmaId: string; turmaNome: string; notaMedia: number; frequencia: number; status: string; }
export interface SeedTurma { id: string; nome: string; periodo: string; professorId: string; professorNome: string; alunosCount: number; ano: number; }
export interface SeedDisciplina { id: string; nome: string; turmaId: string; turmaNome: string; cargaHoraria: number; ementa: string; status: string; professorNome: string; }
export interface SeedLivro { id: string; titulo: string; autor: string; categoria: string; isbn: string; status: "Disponível" | "Emprestado" | "Reservado"; emprestimos: number; }
export interface SeedCurso { id: string; titulo: string; categoria: string; cargaHoraria: number; modulos: number; alunosInscritos: number; nivel: string; status: "Aberto" | "Em breve" | "Encerrado"; instrutor: string; }
export interface SeedModulo { id: string; cursoId: string; titulo: string; aulas: number; duracao: string; }
export interface SeedEvento { id: string; titulo: string; tipo: string; data: string; local: string; }

export interface Seed {
  turmas: SeedTurma[];
  disciplinas: SeedDisciplina[];
  alunos: SeedAluno[];
  livros: SeedLivro[];
  cursos: SeedCurso[];
  modulos: SeedModulo[];
  eventos: SeedEvento[];
}

export function generateSeed(seedNum = 42): Seed {
  const r = rng(seedNum);
  const pick = <T>(arr: T[]) => arr[Math.floor(r() * arr.length)];

  // Turmas
  const profsNomes = ["Helena Martins", "Rafael Souza", "Beatriz Lima", "Carlos Andrade", "Fernanda Lopes"];
  const periodos = ["Matutino", "Vespertino", "Noturno"];
  const turmas: SeedTurma[] = [];
  const series = ["6º A", "7º A", "8º A", "9º A", "1º EM", "2º EM", "3º EM"];
  for (let i = 0; i < series.length; i++) {
    const profIdx = i % profsNomes.length;
    turmas.push({
      id: `tur-${i + 1}`,
      nome: series[i],
      periodo: periodos[i % 3],
      professorId: `prof-${profIdx + 1}`,
      professorNome: profsNomes[profIdx],
      alunosCount: 24 + Math.floor(r() * 12),
      ano: 2026,
    });
  }

  // Disciplinas — 3 por turma
  const disciplinas: SeedDisciplina[] = [];
  turmas.forEach((t, ti) => {
    for (let j = 0; j < 3; j++) {
      const nome = DISCIPLINAS[(ti * 3 + j) % DISCIPLINAS.length];
      disciplinas.push({
        id: `dis-${t.id}-${j + 1}`,
        nome,
        turmaId: t.id,
        turmaNome: t.nome,
        cargaHoraria: [40, 60, 80][Math.floor(r() * 3)],
        ementa: `Ementa de ${nome} para ${t.nome}: tópicos centrais, metodologia ativa e avaliação contínua.`,
        status: r() > 0.1 ? "Ativa" : "Arquivada",
        professorNome: t.professorNome,
      });
    }
  });

  // Alunos — distribuídos pelas turmas
  const alunos: SeedAluno[] = [];
  let aid = 1;
  turmas.forEach((t) => {
    const n = 6 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const nome = NOMES[(aid - 1) % NOMES.length];
      const media = +(5 + r() * 5).toFixed(1);
      alunos.push({
        id: `alu-${String(aid).padStart(3, "0")}`,
        nome,
        matricula: `2026${String(aid).padStart(4, "0")}`,
        email: `${nome.split(" ")[0].toLowerCase()}.${aid}@aluno.hemera.edu`,
        turmaId: t.id,
        turmaNome: t.nome,
        notaMedia: media,
        frequencia: 75 + Math.floor(r() * 25),
        status: r() > 0.05 ? "Ativo" : "Trancado",
      });
      aid++;
    }
  });

  // Livros (Biblioteca)
  const livros: SeedLivro[] = [];
  for (let i = 0; i < 24; i++) {
    const titulo = LIVROS_BASE[i % LIVROS_BASE.length] + (i >= LIVROS_BASE.length ? ` (Vol. ${Math.floor(i / LIVROS_BASE.length) + 1})` : "");
    livros.push({
      id: `liv-${String(i + 1).padStart(3, "0")}`,
      titulo,
      autor: AUTORES[i % AUTORES.length],
      categoria: ["Romance", "Conto", "Crônica", "Poesia", "Ensaio"][i % 5],
      isbn: `978-85-${String(1000 + i)}-${String(100 + i)}-${i % 10}`,
      status: (["Disponível", "Disponível", "Emprestado", "Reservado"] as const)[i % 4],
      emprestimos: Math.floor(r() * 40),
    });
  }

  // Cursos (AVA / Moodle)
  const cursos: SeedCurso[] = [];
  const modulos: SeedModulo[] = [];
  for (let i = 0; i < CURSOS_TITULOS.length; i++) {
    const id = `cur-${String(i + 1).padStart(3, "0")}`;
    const mods = 4 + Math.floor(r() * 6);
    cursos.push({
      id,
      titulo: CURSOS_TITULOS[i],
      categoria: ["Exatas", "Linguagens", "Humanas", "Ciências da Natureza", "Tecnologia"][i % 5],
      cargaHoraria: [20, 40, 60, 80][i % 4],
      modulos: mods,
      alunosInscritos: 20 + Math.floor(r() * 200),
      nivel: ["Iniciante", "Intermediário", "Avançado"][i % 3],
      status: (["Aberto", "Aberto", "Em breve", "Encerrado"] as const)[i % 4],
      instrutor: profsNomes[i % profsNomes.length],
    });
    for (let m = 0; m < mods; m++) {
      modulos.push({
        id: `mod-${id}-${m + 1}`,
        cursoId: id,
        titulo: `Módulo ${m + 1} — ${["Fundamentos", "Aprofundamento", "Aplicações", "Projeto", "Avaliação", "Revisão"][m % 6]}`,
        aulas: 3 + Math.floor(r() * 6),
        duracao: `${1 + Math.floor(r() * 4)}h${10 + Math.floor(r() * 50)}`,
      });
    }
  }

  // Eventos da Área Escolar
  const eventos: SeedEvento[] = [
    { id: "ev-01", titulo: "Reunião de pais", tipo: "Reunião", data: "12/05/2026", local: "Auditório" },
    { id: "ev-02", titulo: "Feira de Ciências", tipo: "Evento", data: "20/05/2026", local: "Quadra coberta" },
    { id: "ev-03", titulo: "Conselho de Classe", tipo: "Reunião", data: "28/05/2026", local: "Sala dos professores" },
    { id: "ev-04", titulo: "Recesso", tipo: "Calendário", data: "01/06/2026", local: "—" },
    { id: "ev-05", titulo: "Olimpíada de Matemática", tipo: "Avaliação", data: "10/06/2026", local: "Sala 12" },
  ];

  return { turmas, disciplinas, alunos, livros, cursos, modulos, eventos };
}

export const seed = generateSeed(42);
