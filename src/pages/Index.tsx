import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AuroraBackground } from "@/components/AuroraBackground";

const portas = [
  { to: "/aluno", icon: "fa-user-graduate", label: "Aluno", desc: "Acompanhe turmas, notas e atividades", grad: "from-aurora-primary to-aurora-secondary" },
  { to: "/professor", icon: "fa-chalkboard-teacher", label: "Professor", desc: "Gerencie turmas, avaliações e planejamento", grad: "from-aurora-secondary to-aurora-accent" },
  { to: "/admin", icon: "fa-shield-halved", label: "Administração", desc: "Gestão institucional e relatórios", grad: "from-aurora-accent to-aurora-primary" },
];

export default function Index() {
  useEffect(() => { document.title = "Hemera | Plataforma de Educação Inteligente"; }, []);
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
      <AuroraBackground />
      <div className="relative z-10 w-full max-w-5xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-white shadow-neon rounded-3xl bg-gradient-to-br from-aurora-secondary to-aurora-accent">
            <i className="text-3xl fas fa-bolt" />
          </div>
          <h1 className="text-6xl font-bold text-slate-800 font-display">Hemera</h1>
          <p className="mt-3 text-sm font-bold tracking-[0.3em] uppercase text-slate-400">Educação Inteligente</p>
          <p className="max-w-xl mx-auto mt-4 text-slate-600">Escolha seu perfil de acesso para entrar na plataforma.</p>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {portas.map((p) => (
            <Link key={p.to} to={p.to} className="p-8 transition-all glass-island rounded-3xl hover:-translate-y-1 hover:shadow-2xl group">
              <div className={`flex items-center justify-center w-16 h-16 mb-4 text-white shadow-neon rounded-2xl bg-gradient-to-br ${p.grad} group-hover:scale-110 transition`}>
                <i className={`text-2xl fas ${p.icon}`} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 font-display">{p.label}</h2>
              <p className="mt-2 text-sm text-slate-500">{p.desc}</p>
              <p className="flex items-center gap-2 mt-4 text-xs font-bold text-aurora-secondary">Acessar <i className="fas fa-arrow-right" /></p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
