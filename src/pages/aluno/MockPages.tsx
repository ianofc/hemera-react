import React, { useEffect, useState } from "react";
import MockScreen from "@/components/MockScreen";
import {
  turmas, disciplinas, atividadesAluno, materiais, frequenciaAluno, avaliacoes, alunos,
} from "@/data/mockData";
import { toast } from "sonner";

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

export const AlunoNotas = () => {
  const grades = [
    { disciplina: "Matemática", av1: 8.0, av2: 9.0, av3: 8.7, trabalho: 9.5, media: 8.7, frequencia: 96, status: "Aprovado" },
    { disciplina: "Língua Portuguesa", av1: 7.5, av2: 8.0, av3: 7.8, trabalho: 8.5, media: 7.9, frequencia: 90, status: "Aprovado" },
    { disciplina: "Física", av1: 9.0, av2: 9.2, av3: 8.8, trabalho: 9.0, media: 9.0, frequencia: 100, status: "Aprovado" },
    { disciplina: "Química", av1: 6.0, av2: 6.8, av3: 6.4, trabalho: 7.0, media: 6.5, frequencia: 83, status: "Recuperação" }
  ];

  return (
    <MockScreen
      title="Notas" subtitle="Boletim e desempenho" icon="fa-chart-line" accent="primary" variant="report"
      stats={[
        { label: "Média geral", value: "8.0", icon: "fa-trophy" },
        { label: "Disciplinas", value: "4", icon: "fa-book" },
        { label: "Aprovado em", value: "3/4", icon: "fa-check" },
        { label: "Bimestre", value: "1º", icon: "fa-calendar" },
      ]}
    >
      <div className="p-6 glass-island rounded-3xl mt-6">
        <h3 className="text-lg font-bold text-slate-800 font-display mb-4">Boletim Detalhado</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/40">
              <tr className="text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3 text-left">Disciplina</th>
                <th className="px-4 py-3 text-center">Av1</th>
                <th className="px-4 py-3 text-center">Av2</th>
                <th className="px-4 py-3 text-center">Av3</th>
                <th className="px-4 py-3 text-center">Trabalho</th>
                <th className="px-4 py-3 text-center text-indigo-600 font-bold">Média</th>
                <th className="px-4 py-3 text-center">Faltas / Freq.</th>
                <th className="px-4 py-3 text-center">Situação</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, idx) => (
                <tr key={idx} className="border-t border-white/40 hover:bg-white/30 transition">
                  <td className="px-4 py-4 font-bold text-slate-700">{g.disciplina}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{g.av1.toFixed(1)}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{g.av2.toFixed(1)}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{g.av3.toFixed(1)}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{g.trabalho.toFixed(1)}</td>
                  <td className="px-4 py-4 text-center text-indigo-750 font-extrabold">{g.media.toFixed(1)}</td>
                  <td className="px-4 py-4 text-center text-slate-600 font-semibold">
                    {g.frequencia >= 90 ? '0' : '2'} / <span className={g.frequencia >= 75 ? 'text-slate-500' : 'text-red-500 font-bold'}>{g.frequencia}%</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${g.media >= 7.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {g.media >= 7.0 ? 'Aprovado' : 'Recuperação'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MockScreen>
  );
};

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
    columns={["Disciplina", "Aulas", "Faltas", "%", "Status"]}
    rows={frequenciaAluno.map((f, i) => {
      const status = f.percentual >= 90 ? "Regular" : f.percentual >= 75 ? "Atenção" : "Crítico";
      return {
        id: `f${i}`,
        cols: [
          f.disciplina,
          f.aulas,
          f.faltas,
          `${f.percentual}%`,
          status
        ]
      };
    })}
  >
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      {frequenciaAluno.map((f, idx) => {
        const isCritical = f.percentual < 75;
        const isWarning = f.percentual >= 75 && f.percentual < 90;
        const barColor = isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500";
        const toneColor = isCritical ? "bg-red-50 text-red-700 border-red-100" : isWarning ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100";
        return (
          <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 text-left">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-800 text-xs">{f.disciplina}</h4>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${toneColor}`}>{f.percentual >= 90 ? 'Regular' : f.percentual >= 75 ? 'Atenção' : 'Crítico'}</span>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-bold mb-1">
                <span>Presença: {f.percentual}%</span>
                <span>Faltas: {f.faltas}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${f.percentual}%` }}></div>
              </div>
            </div>
            <p className="text-[9.5px] text-slate-400">Limite legal MEC: Mínimo 75%</p>
          </div>
        );
      })}
    </div>
  </MockScreen>
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

export const AlunoPerfil = () => {
  const mockUserRaw = typeof window !== 'undefined' ? localStorage.getItem("hemera_mock_user") : null;
  const mockUser = mockUserRaw ? JSON.parse(mockUserRaw) : null;
  
  const [nome, setNome] = useState(mockUser?.user_metadata?.first_name ? `${mockUser.user_metadata.first_name} ${mockUser.user_metadata.last_name || ''}`.trim() : "Carlos Silva");
  const [email, setEmail] = useState(mockUser?.email || "aluno@hemera.io");
  const [matricula, setMatricula] = useState("2026009");
  const [turmaVal, setTurmaVal] = useState("9º A — Fundamental");
  const [sobre, setSobre] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (mockUser) {
      const parts = nome.split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      const updated = {
        ...mockUser,
        email,
        user_metadata: {
          ...mockUser.user_metadata,
          first_name: firstName,
          last_name: lastName
        }
      };
      localStorage.setItem("hemera_mock_user", JSON.stringify(updated));
    }
    toast.success("Perfil atualizado com sucesso!");
  };

  return (
    <MockScreen title="Meu Perfil" icon="fa-user" accent="primary" variant="detail">
      <div className="p-8 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl max-w-3xl mx-auto text-left shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full px-4 py-3 text-sm border bg-white border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/25" required />
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 text-sm border bg-white border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/25" required />
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Matrícula</label>
              <input type="text" value={matricula} onChange={e => setMatricula(e.target.value)} className="w-full px-4 py-3 text-sm border bg-slate-50 border-slate-200 rounded-xl outline-none text-slate-500" disabled />
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Turma Vinculada</label>
              <input type="text" value={turmaVal} onChange={e => setTurmaVal(e.target.value)} className="w-full px-4 py-3 text-sm border bg-slate-50 border-slate-200 rounded-xl outline-none text-slate-500" disabled />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Sobre mim</label>
              <textarea rows={4} value={sobre} onChange={e => setSobre(e.target.value)} placeholder="Diga algumas palavras sobre você ou seus interesses de estudos..." className="w-full px-4 py-3 text-sm border bg-white border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/25" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="submit" className="px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:-translate-y-0.5 transition-all">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </MockScreen>
  );
};

export const AlunoConfiguracoes = () => {
  const [lang, setLang] = useState("Português");
  const [notif, setNotif] = useState("Todas");
  const [theme, setTheme] = useState("Aurora claro");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("hemera_aluno_config", JSON.stringify({ lang, notif, theme }));
    toast.success("Configurações salvas!");
  };

  return (
    <MockScreen title="Configurações" icon="fa-gear" accent="primary" variant="detail">
      <div className="p-8 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl max-w-2xl mx-auto text-left shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Idioma</label>
              <select value={lang} onChange={e => setLang(e.target.value)} className="w-full px-4 py-3 text-sm border bg-white border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/25">
                <option value="Português">Português</option>
                <option value="English">English</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Alertas de Notificação</label>
              <select value={notif} onChange={e => setNotif(e.target.value)} className="w-full px-4 py-3 text-sm border bg-white border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/25">
                <option value="Todas">Todas (Grades, mural, e EAD)</option>
                <option value="Importantes">Apenas recados da coordenação</option>
                <option value="Nenhuma">Desativar notificações</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Tema de Visualização</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-4 py-3 text-sm border bg-white border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/25">
                <option value="Aurora claro">Aurora claro</option>
                <option value="Escuro">Escuro</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="submit" className="px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:-translate-y-0.5 transition-all">Salvar Configurações</button>
          </div>
        </form>
      </div>
    </MockScreen>
  );
};
