import MockScreen from "@/components/MockScreen";
import {
  turmas, disciplinas, atividadesAluno, materiais, frequenciaAluno, avaliacoes, alunos,
} from "@/data/mockData";

export const AlunoDashboard = () => (
  <MockScreen
    title="Início" subtitle="Bem-vindo ao seu portal" icon="fa-home" accent="primary" variant="dashboard"
    stats={[
      { label: "Atividades pendentes", value: String(atividadesAluno.filter(a => a.status === "Pendente" || a.status === "Em andamento").length), icon: "fa-tasks" },
      { label: "Próxima avaliação", value: "12/05", icon: "fa-clipboard-check" },
      { label: "Média atual", value: "8.5", icon: "fa-chart-line" },
      { label: "Frequência", value: "94%", icon: "fa-user-clock" },
    ]}
  />
);

export const AlunoTurmas = () => (
  <MockScreen
    title="Minhas Turmas" icon="fa-book-open" accent="primary" variant="list"
    columns={["Turma", "Disciplinas", "Período", "Professor", "Ações"]}
    filters={["Matutino", "Vespertino", "Noturno"]}
    searchPlaceholder="Buscar turma..."
    rows={turmas.slice(0, 2).map((t) => ({
      id: t.id,
      cols: [t.nome, disciplinas.filter((d) => d.turmaId === t.id).length, t.periodo, t.professorNome, "Acessar"],
    }))}
    emptyTitle="Você ainda não está em uma turma"
  />
);

export const AlunoTurmaDetalhe = () => {
  const t = turmas[0];
  return (
    <MockScreen
      title={t.nome} subtitle={`${t.periodo} · ${t.professorNome}`} icon="fa-users" accent="primary" variant="detail"
      detail={{
        resumo: `Turma com ${t.alunosCount} alunos. Disciplinas, materiais e atividades disponíveis abaixo.`,
        fields: [
          { k: "Período", v: t.periodo }, { k: "Professor", v: t.professorNome }, { k: "Alunos", v: String(t.alunosCount) },
          { k: "Disciplinas", v: String(disciplinas.filter(d => d.turmaId === t.id).length) }, { k: "Ano letivo", v: String(t.ano) },
        ],
        timeline: [
          { titulo: "Nova atividade postada", quando: "há 2h" },
          { titulo: "Aula de Matemática", quando: "ontem" },
        ],
      }}
    />
  );
};

export const AlunoDisciplinaDetalhe = () => {
  const d = disciplinas[0];
  return (
    <MockScreen
      title={d.nome} subtitle={d.turmaNome} icon="fa-book" accent="primary" variant="detail"
      detail={{
        resumo: d.ementa,
        fields: [
          { k: "Carga horária", v: `${d.cargaHoraria}h` }, { k: "Turma", v: d.turmaNome },
          { k: "Status", v: d.status }, { k: "Professor", v: "Helena Martins" },
        ],
      }}
    />
  );
};

export const AlunoAtividades = () => (
  <MockScreen
    title="Atividades" subtitle="Pendentes e entregues" icon="fa-tasks" accent="primary" variant="kanban"
    kanbanColumns={[
      { titulo: "Pendentes", cards: atividadesAluno.filter(a => a.status === "Pendente").map(a => ({ titulo: a.titulo, descricao: `${a.disciplinaNome} · entrega ${a.prazo}`, tag: a.disciplinaNome })) },
      { titulo: "Em andamento", cards: atividadesAluno.filter(a => a.status === "Em andamento" || a.status === "Atrasada").map(a => ({ titulo: a.titulo, descricao: a.disciplinaNome, tag: a.status })) },
      { titulo: "Entregues", cards: atividadesAluno.filter(a => a.status === "Entregue").map(a => ({ titulo: a.titulo, descricao: `Nota ${a.nota}`, tag: "Entregue" })) },
    ]}
  />
);

export const AlunoAtividadeDetalhe = () => {
  const a = atividadesAluno[0];
  return (
    <MockScreen
      title={a.titulo} subtitle={`${a.disciplinaNome} · ${a.professor}`} icon="fa-file-lines" accent="primary" variant="detail"
      detail={{
        resumo: "Resolva os exercícios propostos e envie sua resolução em PDF até o prazo indicado.",
        fields: [
          { k: "Disciplina", v: a.disciplinaNome }, { k: "Prazo", v: a.prazo },
          { k: "Status", v: a.status }, { k: "Professor", v: a.professor },
        ],
        timeline: [
          { titulo: "Atividade publicada", quando: "há 3 dias" },
          { titulo: "Lembrete enviado", quando: "há 1 dia" },
        ],
      }}
    />
  );
};

export const AlunoEntregas = () => (
  <MockScreen
    title="Minhas Entregas" icon="fa-paper-plane" accent="primary" variant="list"
    columns={["Atividade", "Disciplina", "Entregue em", "Status", "Nota"]}
    filters={["Entregue", "Atrasada"]}
    searchPlaceholder="Buscar entrega..."
    rows={atividadesAluno.filter(a => a.status === "Entregue" || a.status === "Atrasada").map(a => ({
      id: a.id, cols: [a.titulo, a.disciplinaNome, a.prazo, a.status, a.nota?.toFixed(1) ?? "—"],
    }))}
    emptyTitle="Você ainda não enviou entregas"
  />
);

export const AlunoAvaliacoes = () => (
  <MockScreen
    title="Avaliações" icon="fa-clipboard-check" accent="primary" variant="list"
    columns={["Avaliação", "Disciplina", "Data", "Peso", "Status"]}
    filters={["Agendada", "Em correção", "Concluída"]}
    searchPlaceholder="Buscar avaliação..."
    rows={avaliacoes.slice(0, 4).map(a => ({ id: a.id, cols: [a.titulo, a.disciplinaNome, a.data, a.peso, a.status] }))}
  />
);

export const AlunoNotas = () => (
  <MockScreen
    title="Notas" subtitle="Boletim e desempenho" icon="fa-chart-line" accent="primary" variant="report"
    stats={[
      { label: "Média geral", value: "8.5", icon: "fa-trophy" },
      { label: "Disciplinas", value: String(disciplinas.length), icon: "fa-book" },
      { label: "Aprovado em", value: "4/4", icon: "fa-check" },
      { label: "Bimestre", value: "1º", icon: "fa-calendar" },
    ]}
  />
);

export const AlunoNotaDetalhe = () => (
  <MockScreen
    title="Matemática · Boletim" icon="fa-square-poll-vertical" accent="primary" variant="detail"
    detail={{
      resumo: "Detalhamento das notas obtidas em cada avaliação da disciplina.",
      fields: [
        { k: "Av1", v: "8.0" }, { k: "Av2", v: "9.0" }, { k: "Av3", v: "8.7" },
        { k: "Trabalho", v: "9.5" }, { k: "Média", v: "8.7" }, { k: "Situação", v: "Aprovado" },
      ],
    }}
  />
);

export const AlunoFrequencia = () => (
  <MockScreen
    title="Frequência" icon="fa-user-clock" accent="primary" variant="list"
    columns={["Disciplina", "Aulas", "Faltas", "%"]}
    rows={frequenciaAluno.map((f, i) => ({ id: `f${i}`, cols: [f.disciplina, f.aulas, f.faltas, `${f.percentual}%`] }))}
  />
);

export const AlunoMateriais = () => (
  <MockScreen
    title="Materiais" subtitle="Conteúdos e arquivos" icon="fa-folder-open" accent="primary" variant="list"
    columns={["Arquivo", "Disciplina", "Tipo", "Tamanho", "Data"]}
    filters={["PDF", "Vídeo", "Slides", "Link"]}
    searchPlaceholder="Buscar material..."
    rows={materiais.map(m => ({ id: m.id, cols: [m.titulo, m.disciplinaNome, m.tipo, m.tamanho, m.data] }))}
    emptyTitle="Nenhum material disponível"
  />
);

export const AlunoMural = () => (
  <MockScreen
    title="Mural" icon="fa-bullhorn" accent="primary" variant="kanban"
    kanbanColumns={[
      { titulo: "Avisos", cards: [
        { titulo: "Reunião de pais", descricao: "12/05 às 19h", tag: "Importante" },
        { titulo: "Recesso", descricao: "Feriado prolongado", tag: "Aviso" },
      ]},
      { titulo: "Eventos", cards: [{ titulo: "Feira de ciências", descricao: "20/05", tag: "Evento" }] },
      { titulo: "Atualizações", cards: [{ titulo: "Boletim disponível", tag: "Sistema" }] },
    ]}
  />
);

export const AlunoMensagens = () => (
  <MockScreen
    title="Mensagens" icon="fa-comments" accent="primary" variant="chat"
    chatItems={[
      { nome: "Profa. Helena Martins", previa: "Lembre-se da entrega de amanhã" },
      { nome: "Prof. Rafael Souza", previa: "Ótimo trabalho na lista!" },
      { nome: "Coordenação", previa: "Reunião de pais marcada" },
    ]}
  />
);

export const AlunoCalendario = () => <MockScreen title="Calendário" icon="fa-calendar" accent="primary" variant="calendar" />;

export const AlunoBiblioteca = () => (
  <MockScreen
    title="Biblioteca" icon="fa-book-bookmark" accent="primary" variant="list"
    columns={["Título", "Autor", "Categoria", "Status"]}
    filters={["Disponível", "Emprestado"]}
    searchPlaceholder="Buscar livro..."
    rows={[
      { id: "b1", cols: ["Vidas Secas", "Graciliano Ramos", "Romance", "Disponível"] },
      { id: "b2", cols: ["Dom Casmurro", "Machado de Assis", "Romance", "Emprestado"] },
      { id: "b3", cols: ["Iracema", "José de Alencar", "Romance", "Disponível"] },
      { id: "b4", cols: ["O Cortiço", "Aluísio Azevedo", "Romance", "Disponível"] },
    ]}
  />
);

export const AlunoPerfil = () => {
  const me = alunos[0];
  return (
    <MockScreen
      title="Meu Perfil" icon="fa-user" accent="primary" variant="form"
      formFields={[
        { label: "Nome", placeholder: me.nome },
        { label: "Matrícula", placeholder: me.matricula },
        { label: "E-mail", type: "email", placeholder: me.email },
        { label: "Turma", placeholder: me.turmaNome },
        { label: "Sobre mim", type: "textarea" },
      ]}
    />
  );
};

export const AlunoConfiguracoes = () => (
  <MockScreen
    title="Configurações" icon="fa-gear" accent="primary" variant="form"
    formFields={[
      { label: "Idioma", type: "select", options: ["Português", "English"] },
      { label: "Notificações", type: "select", options: ["Todas", "Apenas importantes", "Nenhuma"] },
      { label: "Tema", type: "select", options: ["Aurora claro", "Escuro"] },
    ]}
  />
);
