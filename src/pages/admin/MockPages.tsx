import React, { useState, useEffect } from "react";
import MockScreen from "@/components/MockScreen";
import {
  usuariosGlobais, turmas, disciplinas, matriculas, auditoria, integracoes,
} from "@/data/mockData";
import { toast } from "sonner";
import { Plus, Download, Printer, Landmark, Eye, Check, X, ShieldCheck, FileText, FileBadge } from "lucide-react";

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

export const AdminMatriculas = () => {
  const [listaMatriculas, setListaMatriculas] = useState<{ id: string; aluno: string; turma: string; ano: number; status: string }[]>(() => {
    const saved = localStorage.getItem("hemera_admin_matriculas");
    if (saved) return JSON.parse(saved);
    const initial = matriculas.map(m => ({
      id: m.id,
      aluno: m.aluno,
      turma: m.turma,
      ano: m.ano,
      status: m.status
    }));
    localStorage.setItem("hemera_admin_matriculas", JSON.stringify(initial));
    return initial;
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Todos" | "Confirmada" | "Pendente">("Todos");

  // States de modais
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [alunoNome, setAlunoNome] = useState("");
  const [turmaMat, setTurmaMat] = useState("9º A");
  const [statusMat, setStatusMat] = useState("Confirmada");

  const [declModalOpen, setDeclModalOpen] = useState(false);
  const [selectedMat, setSelectedMat] = useState<{ id: string; aluno: string; turma: string; ano: number; status: string } | null>(null);

  const handleCreateMatricula = () => {
    if (!alunoNome.trim()) {
      toast.error("Por favor, insira o nome completo do aluno.");
      return;
    }
    const novaMat = {
      id: "mat_" + Date.now(),
      aluno: alunoNome.trim(),
      turma: turmaMat,
      ano: 2026,
      status: statusMat
    };
    const nextList = [novaMat, ...listaMatriculas];
    setListaMatriculas(nextList);
    localStorage.setItem("hemera_admin_matriculas", JSON.stringify(nextList));
    setNewModalOpen(false);
    setAlunoNome("");

    toast.success(`Aluno ${novaMat.aluno} matriculado com sucesso na turma ${novaMat.turma}!`);
  };

  const handleOpenDecl = (mat: { id: string; aluno: string; turma: string; ano: number; status: string }) => {
    setSelectedMat(mat);
    setDeclModalOpen(true);
  };

  const handleExportDecl = () => {
    toast.success("Declaração de matrícula exportada com sucesso em PDF!");
    setDeclModalOpen(false);
  };

  const filteredMatriculas = listaMatriculas.filter(m => {
    const matchesSearch = m.aluno.toLowerCase().includes(search.toLowerCase()) || m.turma.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Todos" || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down text-left">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-island rounded-3xl mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 text-white shadow-neon rounded-2xl bg-gradient-to-br from-aurora-accent to-aurora-primary">
            <i className="text-xl fas fa-id-card-clip" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Matrículas e Enturmação</h1>
            <p className="text-sm text-slate-500">Gerencie a vinculação de alunos a turmas e emita declarações</p>
          </div>
        </div>
        <button
          onClick={() => setNewModalOpen(true)}
          className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-aurora-accent to-aurora-primary rounded-xl shadow-lg hover:-translate-y-0.5 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nova Matrícula
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between glass-island rounded-2xl mb-6">
        <div className="relative flex-1 max-w-md">
          <i className="absolute -translate-y-1/2 left-4 top-1/2 fas fa-search text-slate-400 text-xs" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aluno ou turma..."
            className="w-full py-2.5 pl-10 pr-4 text-sm border bg-white/70 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-aurora-accent"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["Todos", "Confirmada", "Pendente"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition border ${
                filter === f
                  ? "text-white border-transparent bg-gradient-to-r from-aurora-accent to-aurora-primary shadow-sm"
                  : "bg-white/70 text-slate-600 border-slate-200 hover:bg-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Matrículas */}
      <div className="overflow-hidden glass-island rounded-3xl">
        {filteredMatriculas.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-xs font-bold">Nenhuma matrícula registrada</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/40 border-b border-slate-150">
              <tr className="text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">
                <th className="px-5 py-3.5 text-left">Aluno</th>
                <th className="px-5 py-3.5 text-left">Turma</th>
                <th className="px-5 py-3.5 text-left">Ano Letivo</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/50">
              {filteredMatriculas.map((m) => (
                <tr key={m.id} className="hover:bg-white/40 transition animate-fade-in">
                  <td className="px-5 py-4 font-bold text-slate-700">{m.aluno}</td>
                  <td className="px-5 py-4 text-slate-550 font-bold">{m.turma}</td>
                  <td className="px-5 py-4 text-slate-500 font-semibold">{m.ano}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      m.status === "Confirmada" 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' 
                        : 'bg-amber-100 text-amber-800 border border-amber-250'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => handleOpenDecl(m)}
                      className="px-3.5 py-2 font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1 shadow-sm"
                    >
                      <FileBadge className="w-3.5 h-3.5 text-indigo-500" /> Declaração
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nova Matrícula */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full space-y-4 text-left relative border border-slate-150 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 font-display">Nova Matrícula</h3>
              <button onClick={() => setNewModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4.5 h-4.5" /></button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nome Completo do Aluno</label>
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  value={alunoNome}
                  onChange={(e) => setAlunoNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-850 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Turma</label>
                  <select
                    value={turmaMat}
                    onChange={(e) => setTurmaMat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="9º A">9º A</option>
                    <option value="9º B">9º B</option>
                    <option value="8º A">8º A</option>
                    <option value="1º EM">1º EM</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={statusMat}
                    onChange={(e) => setStatusMat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Confirmada">Confirmada</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setNewModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateMatricula}
                className="flex-grow px-4 py-2.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-500 rounded-xl transition shadow-md"
              >
                Concluir Matrícula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Declaração */}
      {declModalOpen && selectedMat && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-5 text-left relative border border-slate-150 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 font-display flex items-center gap-1.5">
                <Landmark className="w-5 h-5 text-indigo-600" /> Declaração de Matrícula
              </h3>
              <button onClick={() => setDeclModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4.5 h-4.5" /></button>
            </div>

            {/* Document body preview */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 font-serif text-slate-750 text-xs leading-relaxed space-y-4 shadow-inner">
              <div className="text-center space-y-1 font-sans border-b border-slate-200 pb-4">
                <h4 className="font-black text-sm uppercase tracking-wide text-slate-900">Hemera OS Educação</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Secretaria Geral de Registros Acadêmicos</p>
              </div>

              <div className="text-center font-bold text-sm uppercase my-4 font-sans text-slate-950">
                DECLARAÇÃO DE MATRÍCULA
              </div>

              <p className="text-justify indent-8">
                Declaramos para os devidos fins de direito que o(a) aluno(a) <strong className="text-slate-950">{selectedMat.aluno}</strong>, portador(a) do registro acadêmico nº <strong className="text-slate-950">{selectedMat.id}</strong>, encontra-se regularmente matriculado(a) nesta instituição de ensino no ano letivo de <strong>{selectedMat.ano}</strong>, cursando a turma <strong className="text-slate-950">{selectedMat.turma}</strong> do Ensino Regular.
              </p>

              <p className="text-justify indent-8">
                Por ser a expressão da verdade, firmamos a presente declaração sob carimbo digital e assinatura criptográfica autorizada.
              </p>

              <div className="pt-8 text-right font-sans text-[10px] text-slate-400 font-bold">
                Hemera Educação, {new Date().toLocaleDateString("pt-BR")}.
              </div>

              <div className="flex items-center gap-2 border-t border-dashed border-slate-200 pt-4 font-sans text-[9px] text-slate-400">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Documento assinado digitalmente pelo sistema Heimdall Zero Trust. Chave: {selectedMat.id}.{selectedMat.ano}.{selectedMat.turma.replace(" ", "")}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDeclModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                onClick={handleExportDecl}
                className="flex-grow px-4 py-2.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-500 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" /> Exportar / Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
