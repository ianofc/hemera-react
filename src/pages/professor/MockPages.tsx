import MockScreen from "@/components/MockScreen";
import {
  turmas, disciplinas, alunos, avaliacoes, trilhaNotas, historicoIA, professores,
} from "@/data/mockData";

const turmaFilters = ["Matutino", "Vespertino", "Noturno"];

export const ProfDisciplinas = () => (
  <MockScreen
    title="Disciplinas" subtitle="Gerencie as matérias que você leciona" icon="fa-book"
    variant="list" storageKey="prof_disciplinas"
    columns={["Disciplina", "Turma", "Carga horária", "Status", "Ações"]}
    filters={["Ativa", "Arquivada"]} filterColumnIndex={3}
    searchPlaceholder="Buscar disciplina ou turma..."
    rowHrefBase="/professor/disciplinas" pageSize={8}
    rows={disciplinas.map((d) => ({ id: d.id, cols: [d.nome, d.turmaNome, `${d.cargaHoraria}h`, d.status, "Editar · Excluir"] }))}
    emptyTitle="Nenhuma disciplina cadastrada"
    emptyHint="Clique em Novo para criar a primeira disciplina."
  />
);

export const ProfDisciplinaForm = () => (
  <MockScreen
    title="Nova Disciplina" subtitle="Cadastrar disciplina" icon="fa-book" variant="form"
    formFields={[
      { label: "Nome da disciplina", placeholder: "Ex.: Matemática" },
      { label: "Turma", type: "select", options: turmas.map((t) => t.nome) },
      { label: "Carga horária (h)", type: "number", placeholder: "60" },
      { label: "Status", type: "select", options: ["Ativa", "Arquivada"] },
      { label: "Ementa", type: "textarea", placeholder: "Resuma os tópicos que serão abordados..." },
    ]}
  />
);

export const ProfDisciplinaDetalhe = () => {
  const d = disciplinas[0];
  return (
    <MockScreen
      title={d.nome} subtitle={`${d.turmaNome} · ${d.cargaHoraria}h`} icon="fa-book-open" variant="detail"
      detail={{
        resumo: d.ementa,
        fields: [
          { k: "Turma", v: d.turmaNome }, { k: "Carga horária", v: `${d.cargaHoraria}h` },
          { k: "Status", v: d.status }, { k: "Avaliações", v: String(avaliacoes.filter(a => a.disciplinaId === d.id).length) },
          { k: "Alunos", v: String(alunos.filter(a => a.turmaId === d.turmaId).length) }, { k: "Última atualização", v: "hoje, 09:12" },
        ],
        timeline: [
          { titulo: "Avaliação criada — Funções", quando: "há 2h" },
          { titulo: "Material adicionado", quando: "ontem" },
          { titulo: "Plano de aula atualizado", quando: "há 3 dias" },
        ],
      }}
    />
  );
};

export const ProfAvaliacoes = () => (
  <MockScreen
    title="Avaliações" subtitle="Provas, trabalhos e exercícios" icon="fa-clipboard-check"
    variant="list" storageKey="prof_avaliacoes"
    columns={["Título", "Disciplina", "Turma", "Data", "Peso", "Status"]}
    filters={["Agendada", "Em correção", "Concluída"]} filterColumnIndex={5}
    searchPlaceholder="Buscar por título ou disciplina..."
    rowHrefBase="/professor/avaliacoes" pageSize={8}
    rows={avaliacoes.map((a) => ({ id: a.id, cols: [a.titulo, a.disciplinaNome, a.turmaNome, a.data, a.peso, a.status] }))}
    emptyTitle="Sem avaliações"
    emptyHint="Crie uma nova avaliação para começar."
  />
);

export const ProfAvaliacaoForm = () => (
  <MockScreen
    title="Nova Avaliação" icon="fa-clipboard-check" variant="form"
    formFields={[
      { label: "Título", placeholder: "Ex.: Prova bimestral" },
      { label: "Tipo", type: "select", options: ["Prova", "Trabalho", "Exercício", "Seminário"] },
      { label: "Disciplina", type: "select", options: disciplinas.map((d) => d.nome) },
      { label: "Turma", type: "select", options: turmas.map((t) => t.nome) },
      { label: "Data", type: "date" },
      { label: "Peso", type: "number", placeholder: "1 a 5" },
      { label: "Instruções", type: "textarea", placeholder: "Orientações para os alunos..." },
    ]}
  />
);

export const ProfAvaliacaoDetalhe = () => {
  const a = avaliacoes[0];
  return (
    <MockScreen
      title={a.titulo} subtitle={`${a.disciplinaNome} · ${a.turmaNome}`} icon="fa-clipboard-list" variant="detail"
      detail={{
        resumo: "Avaliação composta por questões objetivas e dissertativas, abordando os tópicos trabalhados em sala.",
        fields: [
          { k: "Tipo", v: a.tipo }, { k: "Data", v: a.data }, { k: "Peso", v: String(a.peso) },
          { k: "Status", v: a.status }, { k: "Disciplina", v: a.disciplinaNome }, { k: "Turma", v: a.turmaNome },
        ],
        timeline: [
          { titulo: "Notas parciais lançadas", quando: "há 1h" },
          { titulo: "Avaliação aplicada", quando: "ontem, 10:00" },
          { titulo: "Avaliação criada", quando: "há 5 dias" },
        ],
      }}
    />
  );
};

export const ProfLancamentoNotas = () => (
  <MockScreen
    title="Lançamento de Notas" subtitle="Insira ou revise notas por aluno" icon="fa-pen-to-square"
    variant="list"
    columns={["Aluno", "Matrícula", "Nota", "Status", "Última alteração"]}
    filters={["Lançada", "Pendente"]}
    searchPlaceholder="Buscar aluno..."
    rows={alunos.map((a, i) => ({
      id: a.id,
      cols: [a.nome, a.matricula, a.notaMedia.toFixed(1), i % 3 === 2 ? "Pendente" : "Lançada", i % 3 === 2 ? "—" : "hoje, 09:12"],
    }))}
    emptyTitle="Nenhum aluno na turma"
  />
);

export const ProfRevisaoNotas = () => (
  <MockScreen
    title="Revisão e Trilha de Notas" subtitle="Histórico de alterações" icon="fa-clock-rotate-left"
    variant="list"
    columns={["Aluno", "Nota anterior", "Nota nova", "Alterado por", "Quando"]}
    searchPlaceholder="Buscar aluno ou autor..."
    rows={trilhaNotas.map((t) => ({ id: t.id, cols: [t.aluno, t.anterior, t.nova, t.alteradoPor, t.quando] }))}
    emptyTitle="Sem alterações registradas"
  />
);

export const ProfGradebook = () => (
  <MockScreen
    title="Gradebook" subtitle="Visão consolidada de notas" icon="fa-table-cells" variant="report"
    stats={[
      { label: "Turmas", value: String(turmas.length), icon: "fa-users" },
      { label: "Alunos", value: String(alunos.length), icon: "fa-user-graduate" },
      { label: "Média geral", value: "7.9", icon: "fa-chart-line" },
      { label: "Acima da média", value: "68%", icon: "fa-trophy" },
    ]}
  />
);

export const ProfGradebookTurma = () => (
  <MockScreen
    title="Gradebook · 9º A" subtitle="Resultado por aluno" icon="fa-table-list" variant="list"
    columns={["Aluno", "Av1", "Av2", "Av3", "Média", "Situação"]}
    filters={["Aprovado", "Recuperação"]}
    searchPlaceholder="Buscar aluno..."
    rows={alunos.slice(0, 5).map((a, i) => ({
      id: a.id,
      cols: [a.nome, (a.notaMedia - 0.4).toFixed(1), (a.notaMedia + 0.2).toFixed(1), a.notaMedia.toFixed(1), a.notaMedia.toFixed(1), a.notaMedia >= 7 ? "Aprovado" : "Recuperação"],
    }))}
  />
);

export const ProfGradebookAluno = () => {
  const a = alunos[0];
  return (
    <MockScreen
      title={a.nome} subtitle={`Matrícula ${a.matricula} · ${a.turmaNome}`} icon="fa-user-check" variant="detail"
      detail={{
        resumo: `Desempenho consolidado do aluno no ano letivo de 2026. Média atual ${a.notaMedia.toFixed(1)} com ${a.frequencia}% de frequência.`,
        fields: [
          { k: "Média", v: a.notaMedia.toFixed(1) }, { k: "Frequência", v: `${a.frequencia}%` },
          { k: "Status", v: a.status }, { k: "Turma", v: a.turmaNome },
          { k: "E-mail", v: a.email }, { k: "Matrícula", v: a.matricula },
        ],
        timeline: [
          { titulo: "Nota lançada — Matemática 8.7", quando: "hoje" },
          { titulo: "Falta justificada", quando: "há 3 dias" },
          { titulo: "Trabalho entregue — Português", quando: "há 1 semana" },
        ],
      }}
    />
  );
};

export const ProfFrequencia = () => (
  <MockScreen
    title="Frequência" subtitle="Chamada e relatórios" icon="fa-user-clock" variant="list"
    columns={["Aluno", "Aulas", "Faltas", "%", "Status"]}
    filters={["Regular", "Atenção"]}
    searchPlaceholder="Buscar aluno..."
    rows={alunos.map((a) => ({
      id: a.id,
      cols: [a.nome, 32, Math.round(32 * (1 - a.frequencia / 100)), `${a.frequencia}%`, a.frequencia >= 85 ? "Regular" : "Atenção"],
    }))}
  />
);

export const ProfChamada = () => (
  <MockScreen
    title="Chamada Diária" subtitle={`9º A — ${new Date().toLocaleDateString("pt-BR")}`} icon="fa-list-check" variant="kanban"
    kanbanColumns={[
      { titulo: "Presentes", cards: alunos.slice(0, 4).map((a) => ({ titulo: a.nome, descricao: a.matricula, tag: "P" })) },
      { titulo: "Atrasados", cards: [{ titulo: alunos[4].nome, descricao: "Chegou 08:25", tag: "A" }] },
      { titulo: "Ausentes", cards: [{ titulo: alunos[5].nome, descricao: "Sem justificativa", tag: "F" }] },
    ]}
  />
);

export const ProfJustificativas = () => (
  <MockScreen
    title="Justificativas" icon="fa-file-pen" variant="list"
    columns={["Aluno", "Data", "Motivo", "Status", "Ações"]}
    filters={["Pendente", "Aprovada", "Rejeitada"]}
    searchPlaceholder="Buscar aluno..."
    rows={[
      { id: "j1", cols: [alunos[3].nome, "02/05/2026", "Atestado médico", "Aprovada", "Ver"] },
      { id: "j2", cols: [alunos[5].nome, "30/04/2026", "Consulta", "Pendente", "Aprovar · Rejeitar"] },
      { id: "j3", cols: [alunos[1].nome, "28/04/2026", "Compromisso familiar", "Rejeitada", "Ver"] },
    ]}
  />
);

export const ProfPlanejamento = () => (
  <MockScreen title="Planejamento" subtitle="Planos de aula e cronograma" icon="fa-calendar-alt" variant="calendar" />
);

export const ProfPlanoAula = () => (
  <MockScreen
    title="Plano de Aula" icon="fa-clipboard" variant="form"
    formFields={[
      { label: "Disciplina", type: "select", options: disciplinas.map((d) => d.nome) },
      { label: "Turma", type: "select", options: turmas.map((t) => t.nome) },
      { label: "Data da aula", type: "date" },
      { label: "Duração (min)", type: "number", placeholder: "50" },
      { label: "Objetivos", type: "textarea", placeholder: "Ex.: Reconhecer funções do 1º grau..." },
      { label: "Recursos", type: "textarea", placeholder: "Quadro, slides, calculadora..." },
    ]}
  />
);

export const ProfPlanoEnsino = () => (
  <MockScreen
    title="Plano de Ensino" icon="fa-graduation-cap" variant="form"
    formFields={[
      { label: "Disciplina", type: "select", options: disciplinas.map((d) => d.nome) },
      { label: "Carga horária total", type: "number", placeholder: "80" },
      { label: "Bimestre", type: "select", options: ["1º", "2º", "3º", "4º"] },
      { label: "Metodologia", type: "select", options: ["Expositiva", "Ativa", "Projetos", "Híbrida"] },
      { label: "Conteúdos programáticos", type: "textarea" },
      { label: "Critérios de avaliação", type: "textarea" },
    ]}
  />
);

export const ProfGeradorIA = () => (
  <MockScreen
    title="Gerador de Atividades IA" subtitle="Crie exercícios e provas com IA" icon="fa-wand-magic-sparkles" variant="form" accent="accent"
    formFields={[
      { label: "Disciplina", type: "select", options: disciplinas.map((d) => d.nome) },
      { label: "Turma", type: "select", options: turmas.map((t) => t.nome) },
      { label: "Nível", type: "select", options: ["Fácil", "Médio", "Difícil"] },
      { label: "Quantidade de questões", type: "number", placeholder: "10" },
      { label: "Tópicos", type: "textarea", placeholder: "Ex.: equações, funções, gráficos..." },
    ]}
  />
);

export const ProfGeradorProva = () => (
  <MockScreen
    title="Gerador de Prova IA" icon="fa-file-circle-question" variant="form" accent="accent"
    formFields={[
      { label: "Disciplina", type: "select", options: disciplinas.map((d) => d.nome) },
      { label: "Bimestre", type: "select", options: ["1º", "2º", "3º", "4º"] },
      { label: "Total de questões", type: "number", placeholder: "10" },
      { label: "Mistura objetivas/dissertativas", type: "select", options: ["100% objetivas", "70/30", "50/50"] },
      { label: "Tópicos cobertos", type: "textarea" },
    ]}
  />
);

export const ProfGeradorRubrica = () => (
  <MockScreen
    title="Gerador de Rubrica IA" icon="fa-list-ol" variant="form" accent="accent"
    formFields={[
      { label: "Atividade alvo", placeholder: "Ex.: Redação dissertativa" },
      { label: "Critérios", type: "textarea", placeholder: "Coesão, coerência, gramática..." },
      { label: "Escala", type: "select", options: ["0–10", "0–100", "Conceitos A–E"] },
    ]}
  />
);

export const ProfHistoricoIA = () => (
  <MockScreen
    title="Histórico IA" icon="fa-rectangle-history" variant="list"
    columns={["Tipo", "Disciplina", "Criado em", "Ações"]}
    filters={["Atividade", "Prova", "Rubrica"]}
    searchPlaceholder="Buscar..."
    rows={historicoIA.map((h) => ({ id: h.id, cols: [h.tipo, h.disciplina, h.criado, "Ver · Duplicar"] }))}
    emptyTitle="Sem gerações ainda"
    emptyHint="Use os geradores IA para criar conteúdos."
  />
);

export const ProfMural = () => (
  <MockScreen
    title="Mural" subtitle="Avisos e comunicados" icon="fa-bullhorn" variant="kanban"
    kanbanColumns={[
      { titulo: "Rascunhos", cards: [{ titulo: "Recesso de feriado", descricao: "Comunicar pais", tag: "Rascunho" }] },
      { titulo: "Publicados", cards: [
        { titulo: "Reunião de pais", descricao: "12/05 às 19h", tag: "Aviso" },
        { titulo: "Entrega de boletins", descricao: "Próxima semana", tag: "Aviso" },
      ]},
      { titulo: "Arquivados", cards: [{ titulo: "Festa junina 2025", tag: "Arquivado" }] },
    ]}
  />
);

export const ProfMensagens = () => (
  <MockScreen
    title="Mensagens" icon="fa-comments" variant="chat"
    chatItems={alunos.slice(0, 5).map((a) => ({ nome: a.nome, previa: "Posso entregar amanhã?" }))}
  />
);

export const ProfComunicados = () => (
  <MockScreen
    title="Comunicados aos Pais" icon="fa-envelope-open-text" variant="list"
    columns={["Assunto", "Turma", "Enviado", "Lidos", "Ações"]}
    filters={["Enviado", "Agendado"]}
    searchPlaceholder="Buscar comunicado..."
    rows={[
      { id: "c1", cols: ["Reunião de pais", "9º A", "01/05/2026", "24/28", "Reenviar"] },
      { id: "c2", cols: ["Entrega de boletins", "Todas", "28/04/2026", "112/120", "Ver"] },
      { id: "c3", cols: ["Recesso", "1º EM", "Agendado 10/05", "—", "Editar"] },
    ]}
  />
);

export const ProfRelatorios = () => (
  <MockScreen
    title="Relatórios" subtitle="Desempenho e exportações" icon="fa-chart-pie" variant="report"
    stats={[
      { label: "Relatórios gerados", value: "47", icon: "fa-file-export" },
      { label: "Este mês", value: "12", icon: "fa-calendar" },
      { label: "Compartilhados", value: "23", icon: "fa-share" },
      { label: "Salvos", value: "9", icon: "fa-bookmark" },
    ]}
  />
);

export const ProfRelatorioTurma = () => (
  <MockScreen
    title="Relatório de Turma" subtitle="9º A · 1º bimestre" icon="fa-users-rectangle" variant="detail"
    detail={{
      resumo: "Análise consolidada da turma com indicadores de desempenho, frequência e engajamento.",
      fields: [
        { k: "Alunos", v: "28" }, { k: "Média geral", v: "8.1" }, { k: "Frequência", v: "94%" },
        { k: "Aprovados", v: "26" }, { k: "Em recuperação", v: "2" }, { k: "Período", v: "1º bim" },
      ],
      timeline: [{ titulo: "Relatório atualizado", quando: "hoje" }],
    }}
  />
);

export const ProfRelatorioAluno = () => {
  const a = alunos[0];
  return (
    <MockScreen
      title={`Relatório · ${a.nome}`} icon="fa-user-chart" variant="detail"
      detail={{
        resumo: `Histórico individual do aluno no bimestre, com notas, frequência e observações pedagógicas.`,
        fields: [
          { k: "Média", v: a.notaMedia.toFixed(1) }, { k: "Frequência", v: `${a.frequencia}%` },
          { k: "Turma", v: a.turmaNome }, { k: "Matrícula", v: a.matricula },
        ],
      }}
    />
  );
};

export const ProfPerfil = () => {
  const me = professores[0];
  return (
    <MockScreen
      title="Meu Perfil" icon="fa-user-tie" variant="form"
      formFields={[
        { label: "Nome completo", placeholder: me.nome },
        { label: "E-mail", type: "email", placeholder: me.email },
        { label: "Telefone", placeholder: "(00) 00000-0000" },
        { label: "Formação", placeholder: "Ex.: Mestre em Educação" },
        { label: "Bio", type: "textarea", placeholder: "Apresente-se aos seus alunos..." },
      ]}
    />
  );
};

export const ProfConfiguracoes = () => (
  <MockScreen
    title="Configurações" icon="fa-gear" variant="form"
    formFields={[
      { label: "Idioma", type: "select", options: ["Português", "English", "Español"] },
      { label: "Fuso horário", type: "select", options: ["America/Sao_Paulo", "America/Recife"] },
      { label: "Tema", type: "select", options: ["Aurora claro", "Escuro"] },
      { label: "Notificações por e-mail", type: "select", options: ["Ativadas", "Desativadas"] },
    ]}
  />
);
