import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, CloudSun, Calendar, BookOpen, Clock, 
  Plus, Sparkles, FileText, ChevronRight, X
} from "lucide-react";
import { pedagogicoService, Lembrete, Turma } from "@/services/pedagogicoService";
import { toast } from "sonner";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const TEMPOS = ["07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00"];

interface Horario { 
  id: string; 
  turma_id: string; 
  dia_semana: number; 
  hora_inicio: string; 
  is_ac: boolean; 
  turmas: { nome: string } | null 
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = (user?.user_metadata?.first_name as string) || user?.email?.split("@")[0] || "Professor";
  const [periodo, setPeriodo] = useState<"manha" | "tarde" | "noite">("manha");
  const [stats, setStats] = useState({ turmas: 0, alunos: 0, hoje: 0 });
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [professorTurmas, setProfessorTurmas] = useState<Turma[]>([]);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  
  const [formTurmaId, setFormTurmaId] = useState("");
  const [formDiaSemana, setFormDiaSemana] = useState(0);
  const [formHoraInicio, setFormHoraInicio] = useState("");
  const [formIsAc, setFormIsAc] = useState(false);

  useEffect(() => {
    document.title = "Painel do Docente | Hemera";
    if (!user) return;
    (async () => {
      try {
        const [{ count: turmasCount }, { count: alunosCount }] = await Promise.all([
          supabase.from("turmas").select("*", { count: "exact", head: true }),
          supabase.from("alunos").select("*", { count: "exact", head: true }),
        ]);
        const hData = await pedagogicoService.getHorariosProfessor();
        const tList = await pedagogicoService.getTurmasProfessor();
        setProfessorTurmas(tList);
        
        const today = new Date().getDay() - 1; // 0=seg
        setStats({
          turmas: turmasCount ?? tList.length,
          alunos: alunosCount ?? 199,
          hoje: (hData ?? []).filter((h) => (h as unknown as Horario).dia_semana === today).length,
        });
        setHorarios((hData ?? []) as unknown as Horario[]);
        const myLembretes = await pedagogicoService.getLembretes();
        setLembretes(myLembretes);
      } catch (err) {
        console.warn("Falha ao buscar dados do Supabase. Usando fallback de mock.", err);
        const hData = await pedagogicoService.getHorariosProfessor();
        const tList = await pedagogicoService.getTurmasProfessor();
        setProfessorTurmas(tList);
        setStats({ turmas: tList.length, alunos: 199, hoje: 3 });
        setHorarios(hData);
        const myLembretes = await pedagogicoService.getLembretes();
        setLembretes(myLembretes);
      }
    })();
  }, [user]);

  const handleOpenCreateModal = (diaIdx: number, tempo: string) => {
    setModalMode("create");
    setFormDiaSemana(diaIdx);
    setFormHoraInicio(tempo);
    setFormIsAc(false);
    if (professorTurmas.length > 0) {
      setFormTurmaId(professorTurmas[0].id);
    } else {
      setFormTurmaId("");
    }
    setModalOpen(true);
  };

  const handleOpenEditModal = (h: Horario) => {
    setSelectedHorario(h);
    setModalMode("edit");
    setFormDiaSemana(h.dia_semana);
    setFormHoraInicio(h.hora_inicio.slice(0, 5));
    setFormIsAc(h.is_ac);
    setFormTurmaId(h.turma_id);
    setModalOpen(true);
  };

  const handleSaveHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        const novo = await pedagogicoService.criarHorario(formTurmaId, formDiaSemana, formHoraInicio, formIsAc);
        setHorarios(prev => [...prev, novo]);
        toast.success("Horário adicionado com sucesso!");
      } else if (selectedHorario) {
        const updated = await pedagogicoService.editarHorario(selectedHorario.id, {
          turma_id: formTurmaId,
          dia_semana: formDiaSemana,
          hora_inicio: formHoraInicio.includes(":") ? `${formHoraInicio}:00` : `${formHoraInicio}:00:00`,
          is_ac: formIsAc
        });
        setHorarios(prev => prev.map(h => h.id === selectedHorario.id ? updated : h));
        toast.success("Horário atualizado com sucesso!");
      }
      setModalOpen(false);
      
      const today = new Date().getDay() - 1;
      const hData = await pedagogicoService.getHorariosProfessor() as unknown as Horario[];
      setStats(prev => ({
        ...prev,
        hoje: hData.filter((h) => h.dia_semana === today).length
      }));
    } catch (error) {
      const err = error as Error;
      toast.error("Erro ao salvar horário: " + err.message);
    }
  };

  const handleDeleteHorario = async () => {
    if (!selectedHorario) return;
    if (!confirm("Tem certeza que deseja excluir esta aula da sua grade horária?")) return;
    try {
      await pedagogicoService.excluirHorario(selectedHorario.id);
      setHorarios(prev => prev.filter(h => h.id !== selectedHorario.id));
      toast.success("Horário excluído com sucesso!");
      setModalOpen(false);

      const today = new Date().getDay() - 1;
      const hData = await pedagogicoService.getHorariosProfessor() as unknown as Horario[];
      setStats(prev => ({
        ...prev,
        hoje: hData.filter((h) => h.dia_semana === today).length
      }));
    } catch (error) {
      const err = error as Error;
      toast.error("Erro ao excluir horário: " + err.message);
    }
  };

  const filtraTempo = (t: string) => {
    const h = parseInt(t.slice(0, 2));
    if (periodo === "manha") return h < 12;
    if (periodo === "tarde") return h >= 12 && h < 18;
    return h >= 18;
  };

  const getCell = (tempo: string, diaIdx: number) =>
    horarios.find((h) => h.hora_inicio.slice(0, 5) === tempo && h.dia_semana === diaIdx);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20 space-y-8 pt-6">
      
      {/* HERO BANNER */}
      <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[280px] group bg-slate-900 border border-slate-800 animate-fade-in-down">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80"
            alt="Sala de aula"
            className="w-full h-full object-cover transition-transform duration-[5s] ease-in-out group-hover:scale-105 opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/70 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

        <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-16">
          <div className="relative z-10 flex flex-col items-start justify-between w-full gap-6 md:flex-row md:items-end">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold tracking-wider text-indigo-200 uppercase border rounded-full shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                Portal de Acesso Docente
              </span>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white font-display drop-shadow-xl">
                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">{firstName} Santos</span>.
              </h1>
              <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                Professor de Matemática • Matrícula: #45129 • Liceu Hemera
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <StatChip icon="fa-layer-group" color="indigo" value={stats.turmas} label="Turmas" />
                <StatChip icon="fa-user-graduate" color="emerald" value={stats.alunos} label="Alunos" />
                <StatChip icon="fa-clock" color="orange" value={stats.hoje} label="Aulas Hoje" />
              </div>
            </div>
            
            {/* Inline Weather Widget */}
            <div className="flex items-center gap-4 px-5 py-3 border bg-white/5 backdrop-blur-md rounded-2xl border-white/10 text-white shadow-xl">
              <div className="text-indigo-300">
                <CloudSun className="w-10 h-10" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase tracking-wider text-indigo-200">Seabra - BA</p>
                <p className="text-lg font-black leading-none">26°C</p>
                <p className="text-[10px] text-slate-200 font-semibold">Parcialmente Nublado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRADE HORÁRIA */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col items-center justify-between gap-4 p-6 border-b border-slate-100 sm:flex-row">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <span className="w-2 h-6 bg-indigo-500 rounded-full" /> Grade Horária Semanal
          </h2>
          <div className="flex p-1 bg-slate-100 rounded-xl">
            {(["manha", "tarde", "noite"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${periodo === p ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
              >
                {p === "manha" ? "Manhã" : p}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <th className="w-32 px-6 py-4 text-xs font-bold text-left uppercase">Horário</th>
                {DIAS.map((d) => <th key={d} className="w-1/5 px-6 py-4 text-xs font-bold text-center uppercase">{d}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TEMPOS.filter(filtraTempo).map((t) => (
                <tr key={t} className="transition-colors hover:bg-slate-50/55">
                  <td className="px-6 py-4 text-xs font-bold border-r text-slate-500 border-slate-100 bg-slate-50/30">{t}</td>
                  {DIAS.map((_, di) => {
                    const item = getCell(t, di);
                    return (
                      <td key={di} className="relative h-24 p-2 align-top border-r border-dashed border-slate-100 last:border-0 group">
                        {item ? (
                          <div
                            onClick={() => handleOpenEditModal(item)}
                            className={`block w-full h-full p-3 transition-all border shadow-sm rounded-2xl cursor-pointer text-left ${
                              item.is_ac ? "border-orange-200 bg-orange-50/50 hover:bg-orange-100" : "border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100"
                            }`}
                          >
                            <h4 className={`text-xs font-bold truncate ${item.is_ac ? "text-orange-850" : "text-indigo-900"}`}>
                              {item.turmas?.nome || "Turma"}
                            </h4>
                            <span className="text-[10px] text-slate-450 mt-1 block font-medium">
                              {item.is_ac ? "Atividade Complementar" : "Aula Presencial"}
                            </span>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleOpenCreateModal(di, t)}
                            className="flex items-center justify-center w-full h-full transition-all border border-transparent opacity-0 cursor-pointer rounded-xl group-hover:opacity-100 hover:bg-slate-50 hover:border-dashed hover:border-slate-200"
                          >
                            <Plus className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOWER ROW: QUICK ACTIONS + IA creator (col-span-2) & NOTICES/REMINDERS (col-span-1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIONS & IA CARDS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* QUICK ACTIONS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Link to="/professor/turmas/nova" className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group min-h-[120px]">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Plus className="w-5 h-5" /></div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-slate-800 text-xs sm:text-sm">Nova Turma</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link to="/professor/planejamento" className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-purple-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group min-h-[120px]">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-slate-800 text-xs sm:text-sm">Plano de Aula</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link to="/professor/ia/prova" className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-pink-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group min-h-[120px]">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-slate-800 text-xs sm:text-sm">Gerador Provas IA</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link to="/professor/biblioteca" className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group min-h-[120px]">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-slate-800 text-xs sm:text-sm">Biblioteca Digital</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* AI CREATOR CTA */}
          <div className="relative rounded-[2rem] bg-gradient-to-br from-violet-600 to-fuchsia-700 p-8 text-white overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-2 px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-white/20 rounded-full backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Assistente IA
              </span>
              <h3 className="text-2xl font-bold font-display">Crie planos de aula e provas inteligentes.</h3>
              <p className="text-white/80 max-w-lg text-xs leading-relaxed">O motor HemeraLM auxilia a fundamentar provas e atividades utilizando grounding nos seus PDFs didáticos ou na ementa da BNCC.</p>
              <Link to="/professor/intelligence" className="mt-2 w-fit flex items-center gap-2 px-5 py-2.5 font-bold transition bg-white text-violet-700 hover:bg-slate-100 rounded-xl text-xs shadow-lg">
                Falar com IA
              </Link>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: NOTICES / CALENDAR */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-pink-500" /> Lembretes & Avisos
            </h3>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {lembretes.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">Nenhum aviso importante.</p>
              ) : (
                lembretes.map((l) => (
                  <div key={l.id} className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase text-pink-500">
                      <span>{l.status === 'Concluido' ? 'Concluído' : 'Ativo'}</span>
                      <span>{l.data_criacao ? new Date(l.data_criacao.replace(' ', 'T')).toLocaleDateString('pt-BR') : ''}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-snug">{l.texto}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Metas BNCC 2026</span>
            <span className="text-emerald-500">100% OK</span>
          </div>
        </div>

      </div>

      {/* Horário Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-fade-in text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 font-display">
                {modalMode === "create" ? "Adicionar Horário" : "Editar Horário"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveHorario} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Turma / Aula</label>
                <select
                  value={formTurmaId}
                  onChange={e => setFormTurmaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  required
                >
                  <option value="" disabled>Selecione a Turma</option>
                  {professorTurmas.map(t => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Dia da Semana</label>
                  <select
                    value={formDiaSemana}
                    onChange={e => setFormDiaSemana(Number(e.target.value))}
                    className="w-full bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled
                  >
                    {DIAS.map((dia, idx) => (
                      <option key={idx} value={idx}>{dia}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Horário de Início</label>
                  <input
                    type="text"
                    value={formHoraInicio}
                    className="w-full bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="formIsAc"
                  checked={formIsAc}
                  onChange={e => setFormIsAc(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-350 focus:ring-indigo-500"
                />
                <label htmlFor="formIsAc" className="text-xs font-bold text-slate-600 cursor-pointer">
                  Marcar como Atividade Complementar (AC)
                </label>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl transition text-sm shadow-md"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition text-sm"
                  >
                    Cancelar
                  </button>
                </div>
                {modalMode === "edit" && selectedHorario && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/professor/turmas/${selectedHorario.turma_id}`)}
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 font-bold rounded-xl transition text-xs"
                    >
                      Acessar Hub da Turma
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteHorario}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl transition text-xs"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const COLOR_MAP: Record<string, { bg: string; text: string; tag: string }> = {
  indigo: { bg: "bg-indigo-500/20", text: "text-indigo-300", tag: "text-indigo-200" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-300", tag: "text-emerald-200" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-300", tag: "text-orange-200" },
};

function StatChip({ icon, color, value, label }: { icon: string; color: string; value: number; label: string }) {
  const c = COLOR_MAP[color];
  return (
    <div className="flex items-center gap-3 px-4 py-2 border bg-white/10 backdrop-blur-md rounded-xl border-white/10 text-white">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${c.bg} ${c.text}`}><i className={`fas ${icon}`} /></div>
      <div>
        <p className="text-base font-bold leading-none">{value}</p>
        <p className={`text-[8px] uppercase font-bold tracking-wider ${c.tag} mt-0.5`}>{label}</p>
      </div>
    </div>
  );
}
