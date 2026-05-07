import MockScreen from "@/components/MockScreen";
import {
  usuariosGlobais, turmas, disciplinas, matriculas, auditoria, integracoes,
} from "@/data/mockData";

export const AdminDashboard = () => (
  <MockScreen
    title="Painel Institucional" subtitle="Visão geral da escola" icon="fa-gauge-high" accent="accent" variant="dashboard"
    stats={[
      { label: "Alunos ativos", value: "428", icon: "fa-user-graduate" },
      { label: "Professores", value: "37", icon: "fa-chalkboard-teacher" },
      { label: "Turmas", value: String(turmas.length), icon: "fa-school" },
      { label: "Disciplinas", value: String(disciplinas.length), icon: "fa-book" },
    ]}
  />
);

export const AdminUsuarios = () => (
  <MockScreen
    title="Usuários" subtitle="Alunos, professores e equipe" icon="fa-users-cog" accent="accent" variant="list"
    storageKey="admin_usuarios"
    columns={["Nome", "E-mail", "Perfil", "Status", "Último acesso"]}
    filters={["Professor", "Aluno", "Coordenador", "Admin"]} filterColumnIndex={2}
    searchPlaceholder="Buscar usuário ou e-mail..."
    rowHrefBase="/admin/usuarios" pageSize={10}
    rows={usuariosGlobais.map((u) => ({ id: u.id, cols: [u.nome, u.email, u.perfil, u.status, u.ultimoAcesso] }))}
    emptyTitle="Nenhum usuário encontrado"
  />
);

export const AdminUsuarioForm = () => (
  <MockScreen
    title="Novo Usuário" icon="fa-user-plus" accent="accent" variant="form"
    formFields={[
      { label: "Nome completo" },
      { label: "E-mail", type: "email" },
      { label: "Perfil", type: "select", options: ["Professor", "Aluno", "Coordenador", "Admin"] },
      { label: "Status", type: "select", options: ["Ativo", "Inativo", "Pendente"] },
      { label: "Telefone" },
      { label: "Observações", type: "textarea" },
    ]}
  />
);

export const AdminUsuarioDetalhe = () => {
  const u = usuariosGlobais[0];
  return (
    <MockScreen
      title={u.nome} subtitle={u.email} icon="fa-id-badge" accent="accent" variant="detail"
      detail={{
        resumo: `${u.perfil} · ${u.status}. Último acesso registrado em ${u.ultimoAcesso}.`,
        fields: [
          { k: "Perfil", v: u.perfil }, { k: "Status", v: u.status }, { k: "Último acesso", v: u.ultimoAcesso },
          { k: "E-mail", v: u.email }, { k: "ID", v: u.id }, { k: "Criado em", v: "01/02/2026" },
        ],
        timeline: [
          { titulo: "Login realizado", quando: u.ultimoAcesso },
          { titulo: "Senha alterada", quando: "há 2 semanas" },
          { titulo: "Conta criada", quando: "01/02/2026" },
        ],
      }}
    />
  );
};

export const AdminTurmas = () => (
  <MockScreen
    title="Turmas (Global)" icon="fa-school" accent="accent" variant="list"
    columns={["Turma", "Professor", "Alunos", "Período", "Ano"]}
    filters={["Matutino", "Vespertino", "Noturno"]}
    searchPlaceholder="Buscar turma..."
    rows={turmas.map((t) => ({ id: t.id, cols: [t.nome, t.professorNome, t.alunosCount, t.periodo, t.ano] }))}
    emptyTitle="Sem turmas cadastradas"
  />
);

export const AdminTurmaForm = () => (
  <MockScreen
    title="Nova Turma" icon="fa-plus" accent="accent" variant="form"
    formFields={[
      { label: "Nome da turma", placeholder: "Ex.: 9º A" },
      { label: "Período", type: "select", options: ["Matutino", "Vespertino", "Noturno"] },
      { label: "Ano letivo", type: "number", placeholder: "2026" },
      { label: "Professor responsável", type: "select", options: ["Helena Martins", "Rafael Souza", "Beatriz Lima"] },
      { label: "Capacidade máxima", type: "number", placeholder: "30" },
    ]}
  />
);

export const AdminDisciplinas = () => (
  <MockScreen
    title="Disciplinas (Global)" icon="fa-book" accent="accent" variant="list"
    columns={["Disciplina", "Turma", "Carga", "Status", "Ações"]}
    filters={["Ativa", "Arquivada"]}
    searchPlaceholder="Buscar disciplina..."
    rows={disciplinas.map((d) => ({ id: d.id, cols: [d.nome, d.turmaNome, `${d.cargaHoraria}h`, d.status, "Editar"] }))}
  />
);

export const AdminMatriculas = () => (
  <MockScreen
    title="Matrículas" icon="fa-id-card-clip" accent="accent" variant="list"
    columns={["Aluno", "Turma", "Ano", "Status", "Ações"]}
    filters={["Confirmada", "Pendente"]}
    searchPlaceholder="Buscar aluno ou turma..."
    rows={matriculas.map((m) => ({ id: m.id, cols: [m.aluno, m.turma, m.ano, m.status, "Ver"] }))}
    emptyTitle="Sem matrículas registradas"
  />
);

export const AdminAnoLetivo = () => (
  <MockScreen
    title="Ano Letivo" icon="fa-calendar-days" accent="accent" variant="form"
    formFields={[
      { label: "Ano", type: "number", placeholder: "2026" },
      { label: "Início", type: "date" },
      { label: "Fim", type: "date" },
      { label: "Bimestres", type: "select", options: ["4 bimestres", "3 trimestres", "2 semestres"] },
      { label: "Observações", type: "textarea" },
    ]}
  />
);

export const AdminRelatorios = () => (
  <MockScreen
    title="Relatórios Institucionais" icon="fa-file-chart-column" accent="accent" variant="report"
    stats={[
      { label: "Boletins gerados", value: "1.284", icon: "fa-file" },
      { label: "Frequência média", value: "92%", icon: "fa-user-clock" },
      { label: "Aprovação", value: "94%", icon: "fa-trophy" },
      { label: "Inadimplência", value: "3.2%", icon: "fa-triangle-exclamation" },
    ]}
  />
);

export const AdminAuditoria = () => (
  <MockScreen
    title="Logs e Auditoria" icon="fa-clipboard-list" accent="accent" variant="list"
    columns={["Data", "Usuário", "Ação", "Recurso", "IP"]}
    searchPlaceholder="Buscar por usuário, ação ou recurso..."
    rows={auditoria.map((l) => ({ id: l.id, cols: [l.data, l.usuario, l.acao, l.recurso, l.ip] }))}
    emptyTitle="Sem registros de auditoria"
  />
);

export const AdminConfiguracoes = () => (
  <MockScreen
    title="Configurações da Escola" icon="fa-school-flag" accent="accent" variant="form"
    formFields={[
      { label: "Nome da instituição", placeholder: "Hemera Educação" },
      { label: "CNPJ" },
      { label: "Endereço" },
      { label: "Diretor(a) responsável" },
      { label: "E-mail institucional", type: "email" },
      { label: "Sobre", type: "textarea" },
    ]}
  />
);

export const AdminIntegracoes = () => (
  <MockScreen
    title="Integrações" icon="fa-plug" accent="accent" variant="list"
    columns={["Serviço", "Status", "Última sync", "Ações"]}
    filters={["Conectado", "Desconectado"]}
    searchPlaceholder="Buscar integração..."
    rows={integracoes.map((i) => ({ id: i.id, cols: [i.servico, i.status, i.ultimaSync, i.status === "Conectado" ? "Sincronizar" : "Conectar"] }))}
  />
);
