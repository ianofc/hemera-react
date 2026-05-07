import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MockScreen from "@/components/MockScreen";
import { bibliotecaApi, cursosApi, areaEscolarApi } from "@/lib/mockApi";
import type { SeedLivro, SeedCurso, SeedModulo, SeedEvento } from "@/data/seed";

// ============ BIBLIOTECA ============

export const BibliotecaLista = ({ basePath = "/aluno/biblioteca", accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const [items, setItems] = useState<SeedLivro[] | null>(null);
  useEffect(() => { bibliotecaApi.list().then(setItems); }, []);
  const rows = (items || []).map((l) => ({
    id: l.id,
    cols: [l.titulo, l.autor, l.categoria, l.isbn, l.status, `${l.emprestimos}`],
  }));
  return (
    <MockScreen
      title="Biblioteca" subtitle="Acervo digital e físico" icon="fa-book-bookmark" variant="list" accent={accent}
      columns={["Título", "Autor", "Categoria", "ISBN", "Status", "Empréstimos"]}
      filters={["Disponível", "Emprestado", "Reservado"]}
      filterColumnIndex={4}
      searchPlaceholder="Buscar título, autor ou ISBN..."
      rows={rows}
      rowHrefBase={basePath}
      pageSize={8}
      storageKey="biblioteca"
      emptyTitle={items === null ? "Carregando acervo..." : "Acervo vazio"}
      emptyHint="Quando livros forem adicionados, aparecerão aqui."
    />
  );
};

export const BibliotecaDetalhe = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const { id } = useParams();
  const [livro, setLivro] = useState<SeedLivro | undefined | null>(null);
  useEffect(() => { if (id) bibliotecaApi.get(id).then((l) => setLivro(l ?? undefined)); }, [id]);
  if (livro === null) return <MockScreen title="Carregando..." icon="fa-book" variant="detail" accent={accent} />;
  if (!livro) return (
    <MockScreen title="Livro não encontrado" icon="fa-circle-exclamation" variant="detail" accent={accent}
      detail={{ resumo: "O livro solicitado não está mais disponível ou o link está incorreto." }} />
  );
  return (
    <MockScreen
      title={livro.titulo} subtitle={`${livro.autor} · ${livro.categoria}`} icon="fa-book" variant="detail" accent={accent}
      detail={{
        resumo: `Obra clássica disponibilizada pela Biblioteca Hemera. Status atual: ${livro.status}.`,
        fields: [
          { k: "Autor", v: livro.autor }, { k: "Categoria", v: livro.categoria }, { k: "ISBN", v: livro.isbn },
          { k: "Status", v: livro.status }, { k: "Empréstimos", v: String(livro.emprestimos) }, { k: "ID", v: livro.id },
        ],
        timeline: [
          { titulo: "Devolvido por aluno", quando: "ontem" },
          { titulo: "Reservado", quando: "há 3 dias" },
        ],
      }}
    />
  );
};

// ============ CURSOS / AVA ============

export const CursosLista = ({ basePath = "/aluno/cursos", accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const [items, setItems] = useState<SeedCurso[] | null>(null);
  useEffect(() => { cursosApi.list().then(setItems); }, []);
  const rows = (items || []).map((c) => ({
    id: c.id,
    cols: [c.titulo, c.categoria, c.nivel, `${c.cargaHoraria}h`, `${c.modulos} mód.`, c.alunosInscritos, c.status],
  }));
  return (
    <MockScreen
      title="Cursos · AVA" subtitle="Ambiente Virtual de Aprendizagem" icon="fa-graduation-cap" variant="list" accent={accent}
      columns={["Curso", "Categoria", "Nível", "Carga", "Módulos", "Inscritos", "Status"]}
      filters={["Aberto", "Em breve", "Encerrado"]}
      filterColumnIndex={6}
      searchPlaceholder="Buscar curso..."
      rows={rows}
      rowHrefBase={basePath}
      pageSize={8}
      storageKey="cursos"
      emptyTitle={items === null ? "Carregando catálogo..." : "Nenhum curso disponível"}
    />
  );
};

export const CursoDetalhe = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const { id } = useParams();
  const [curso, setCurso] = useState<SeedCurso | undefined | null>(null);
  const [mods, setMods] = useState<SeedModulo[]>([]);
  const [prog, setProg] = useState<{ percent: number; totalAulas: number } | null>(null);
  useEffect(() => {
    if (!id) return;
    cursosApi.get(id).then((c) => setCurso(c ?? undefined));
    cursosApi.modulos(id).then(setMods);
    cursosApi.progresso(id).then((p) => setProg({ percent: p.percent, totalAulas: p.totalAulas }));
  }, [id]);
  if (curso === null) return <MockScreen title="Carregando..." icon="fa-graduation-cap" variant="detail" accent={accent} />;
  if (!curso) return (
    <MockScreen title="Curso não encontrado" icon="fa-circle-exclamation" variant="detail" accent={accent}
      detail={{ resumo: "Este curso pode ter sido encerrado ou o link está incorreto." }} />
  );
  return (
    <MockScreen
      title={curso.titulo} subtitle={`${curso.categoria} · ${curso.nivel} · ${curso.cargaHoraria}h`}
      icon="fa-graduation-cap" variant="detail" accent={accent}
      detail={{
        resumo: `Curso ${curso.nivel.toLowerCase()} de ${curso.categoria}. ${curso.alunosInscritos} alunos inscritos. Progresso simulado: ${prog?.percent ?? 0}%.`,
        fields: [
          { k: "Instrutor", v: curso.instrutor }, { k: "Módulos", v: String(curso.modulos) },
          { k: "Carga horária", v: `${curso.cargaHoraria}h` }, { k: "Inscritos", v: String(curso.alunosInscritos) },
          { k: "Status", v: curso.status }, { k: "Total de aulas", v: String(prog?.totalAulas ?? "—") },
        ],
        timeline: mods.slice(0, 6).map((m) => ({ titulo: m.titulo, quando: `${m.aulas} aulas · ${m.duracao}` })),
      }}
    />
  );
};

// ============ ÁREA ESCOLAR ============

export const AreaEscolarPainel = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => (
  <MockScreen
    title="Área Escolar" subtitle="Secretaria, financeiro e calendário" icon="fa-school-flag" variant="dashboard" accent={accent}
    stats={[
      { label: "Eventos no mês", value: "5", icon: "fa-calendar" },
      { label: "Documentos", value: "3", icon: "fa-file-lines" },
      { label: "Mensalidade", value: "R$ 980", icon: "fa-coins" },
      { label: "Status financeiro", value: "Em aberto", icon: "fa-circle-check" },
    ]}
  />
);

export const AreaEscolarEventos = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const [items, setItems] = useState<SeedEvento[] | null>(null);
  useEffect(() => { areaEscolarApi.eventos().then(setItems); }, []);
  return (
    <MockScreen
      title="Calendário Escolar" icon="fa-calendar-days" variant="list" accent={accent}
      columns={["Evento", "Tipo", "Data", "Local"]}
      filters={["Reunião", "Evento", "Avaliação", "Calendário"]}
      filterColumnIndex={1}
      rows={(items || []).map((e) => ({ id: e.id, cols: [e.titulo, e.tipo, e.data, e.local] }))}
      pageSize={10}
      storageKey="ae_eventos"
      emptyTitle={items === null ? "Carregando..." : "Sem eventos cadastrados"}
    />
  );
};

export const AreaEscolarSecretaria = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const [items, setItems] = useState<{ id: string; titulo: string; prazo: string }[] | null>(null);
  useEffect(() => { areaEscolarApi.secretaria().then(setItems); }, []);
  return (
    <MockScreen
      title="Secretaria" subtitle="Solicitação de documentos" icon="fa-folder-open" variant="list" accent={accent}
      columns={["Documento", "Prazo", "Ações"]}
      rows={(items || []).map((d) => ({ id: d.id, cols: [d.titulo, d.prazo, "Solicitar"] }))}
      pageSize={10}
      storageKey="ae_secretaria"
      emptyTitle={items === null ? "Carregando..." : "Nenhum documento disponível"}
    />
  );
};

export const AreaEscolarFinanceiro = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const [items, setItems] = useState<{ id: string; descricao: string; venc: string; valor: string; status: string }[] | null>(null);
  useEffect(() => { areaEscolarApi.financeiro().then(setItems); }, []);
  return (
    <MockScreen
      title="Financeiro" subtitle="Mensalidades e cobranças" icon="fa-coins" variant="list" accent={accent}
      columns={["Descrição", "Vencimento", "Valor", "Status"]}
      filters={["Em aberto", "Pago"]}
      filterColumnIndex={3}
      rows={(items || []).map((f) => ({ id: f.id, cols: [f.descricao, f.venc, f.valor, f.status] }))}
      pageSize={10}
      storageKey="ae_fin"
      emptyTitle={items === null ? "Carregando..." : "Nenhum lançamento"}
    />
  );
};

// ============ Cenários propositadamente VAZIOS ============

export const VazioTurmas = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => (
  <MockScreen
    title="Minhas Turmas (vazio)" icon="fa-book-open" variant="list" accent={accent}
    columns={["Turma", "Disciplinas", "Período", "Professor"]}
    rows={[]} forceEmpty
    emptyTitle="Você ainda não está matriculado em nenhuma turma"
    emptyHint="Procure a secretaria para concluir sua matrícula."
  />
);

export const VazioAvaliacoes = ({ accent = "secondary" as "primary" | "secondary" | "accent" }) => (
  <MockScreen
    title="Avaliações (vazio)" icon="fa-clipboard-check" variant="list" accent={accent}
    columns={["Título", "Disciplina", "Data", "Peso"]}
    rows={[]} forceEmpty
    emptyTitle="Sem avaliações cadastradas"
    emptyHint="Crie a primeira avaliação clicando em Novo."
  />
);

export const VazioMateriais = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => (
  <MockScreen
    title="Materiais (vazio)" icon="fa-folder-open" variant="list" accent={accent}
    columns={["Arquivo", "Disciplina", "Tipo", "Tamanho"]}
    rows={[]} forceEmpty
    emptyTitle="Nenhum material publicado"
    emptyHint="Os materiais enviados pelos professores aparecerão aqui."
  />
);
