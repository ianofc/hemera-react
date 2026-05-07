import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const TEMPOS = ["07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00"];

interface Horario { id: string; turma_id: string; dia_semana: number; hora_inicio: string; is_ac: boolean; turmas: { nome: string } | null }

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = (user?.user_metadata?.first_name as string) || user?.email?.split("@")[0] || "Professor";
  const [periodo, setPeriodo] = useState<"manha" | "tarde" | "noite">("manha");
  const [stats, setStats] = useState({ turmas: 0, alunos: 0, hoje: 0 });
  const [horarios, setHorarios] = useState<Horario[]>([]);

  useEffect(() => {
    document.title = "Painel do Docente | Hemera";
    if (!user) return;
    (async () => {
      const [{ count: turmasCount }, { count: alunosCount }, { data: hData }] = await Promise.all([
        supabase.from("turmas").select("*", { count: "exact", head: true }),
        supabase.from("alunos").select("*", { count: "exact", head: true }),
        supabase.from("horarios").select("id, turma_id, dia_semana, hora_inicio, is_ac, turmas(nome)"),
      ]);
      const today = new Date().getDay() - 1; // 0=seg
      setStats({
        turmas: turmasCount ?? 0,
        alunos: alunosCount ?? 0,
        hoje: (hData ?? []).filter((h: any) => h.dia_semana === today).length,
      });
      setHorarios((hData ?? []) as any);
    })();
  }, [user]);

  const filtraTempo = (t: string) => {
    const h = parseInt(t.slice(0, 2));
    if (periodo === "manha") return h < 12;
    if (periodo === "tarde") return h >= 12 && h < 18;
    return h >= 18;
  };

  const getCell = (tempo: string, diaIdx: number) =>
    horarios.find((h) => h.hora_inicio.slice(0, 5) === tempo && h.dia_semana === diaIdx);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20 space-y-8">
      {/* HERO */}
      <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[320px] group bg-slate-900 border border-slate-800 animate-fade-in-down">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80"
            alt="Sala de aula"
            className="w-full h-full object-cover transition-transform duration-[5s] ease-in-out group-hover:scale-110 opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-purple-900/80 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

        <div className="absolute inset-0 flex items-center px-8 md:px-12 lg:px-16">
          <div className="relative z-10 flex flex-col items-end justify-between w-full gap-8 md:flex-row">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold tracking-wider text-indigo-200 uppercase border rounded-full shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                Ambiente Docente
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl font-display drop-shadow-xl">
                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">{firstName}</span>.
              </h1>
              <div className="flex flex-wrap gap-4 mt-4">
                <StatChip icon="fa-layer-group" color="indigo" value={stats.turmas} label="Turmas" />
                <StatChip icon="fa-user-graduate" color="emerald" value={stats.alunos} label="Alunos" />
                <StatChip icon="fa-clock" color="orange" value={stats.hoje} label="Hoje" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/professor/turmas/nova" className="flex items-center gap-3 px-6 py-3 font-bold transition-all bg-white shadow-xl text-indigo-950 rounded-2xl hover:bg-indigo-50 hover:-translate-y-1">
                <i className="fas fa-plus" /> Nova Turma
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* GRADE HORÁRIA */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-glass border border-white/50 overflow-hidden">
        <div className="flex flex-col items-center justify-between gap-4 p-6 border-b border-indigo-50 sm:flex-row">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <span className="w-2 h-6 bg-indigo-500 rounded-full" /> Grade Horária
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
              <tr className="bg-indigo-50/30 text-indigo-900/70">
                <th className="w-32 px-6 py-4 text-xs font-bold text-left uppercase">Horário</th>
                {DIAS.map((d) => <th key={d} className="w-1/5 px-6 py-4 text-xs font-bold text-center uppercase">{d}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TEMPOS.filter(filtraTempo).map((t) => (
                <tr key={t} className="transition-colors hover:bg-white/50">
                  <td className="px-6 py-4 text-xs font-bold border-r text-slate-500 border-slate-100 bg-slate-50/30">{t}</td>
                  {DIAS.map((_, di) => {
                    const item = getCell(t, di);
                    return (
                      <td key={di} className="relative h-24 p-2 align-top border-r border-dashed border-slate-100 last:border-0 group">
                        {item ? (
                          <Link
                            to={`/professor/turmas/${item.turma_id}`}
                            className={`block w-full h-full p-3 transition-all border shadow-sm rounded-2xl ${
                              item.is_ac ? "border-orange-200 bg-orange-50/50 hover:bg-orange-100" : "border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100"
                            }`}
                          >
                            <h4 className={`text-sm font-bold truncate ${item.is_ac ? "text-orange-800" : "text-indigo-900"}`}>
                              {item.turmas?.nome || "Turma"}
                            </h4>
                          </Link>
                        ) : (
                          <div className="flex items-center justify-center w-full h-full transition-all border-2 border-transparent opacity-0 cursor-pointer rounded-xl group-hover:opacity-100 hover:bg-slate-50 hover:border-dashed hover:border-slate-200">
                            <i className="fas fa-plus text-slate-300" />
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

      {/* CARD CTA IA */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="relative rounded-[2rem] bg-gradient-to-br from-violet-600 to-fuchsia-700 p-8 text-white overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-2 px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-white/20 rounded-full backdrop-blur-md">
                <i className="fas fa-brain" /> Assistente IA
              </span>
              <h3 className="text-3xl font-bold font-display">Crie aulas, provas e atividades em segundos.</h3>
              <p className="text-white/80 max-w-lg">Use o Zios para gerar planejamentos pedagógicos alinhados à BNCC.</p>
              <button className="mt-2 w-fit flex items-center gap-2 px-6 py-3 font-bold transition bg-white shadow-xl text-violet-700 rounded-xl hover:-translate-y-1">
                <i className="fas fa-sparkles" /> Começar agora
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 glass-card rounded-[2rem]">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800">
            <span className="w-2 h-6 bg-pink-500 rounded-full" /> Avisos
          </h3>
          <p className="text-sm text-slate-500">Nenhum aviso novo.</p>
        </div>
      </div>
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
    <div className="flex items-center gap-3 px-4 py-2 border bg-white/10 backdrop-blur-md rounded-xl border-white/10">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${c.bg} ${c.text}`}><i className={`fas ${icon}`} /></div>
      <div>
        <p className="text-lg font-bold leading-none text-white">{value}</p>
        <p className={`text-[10px] uppercase font-bold tracking-wider ${c.tag}`}>{label}</p>
      </div>
    </div>
  );
}
