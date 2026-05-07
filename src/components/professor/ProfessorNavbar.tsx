import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/professor", icon: "fas fa-layer-group", label: "Painel", end: true },
  { to: "/professor/turmas", icon: "fas fa-users", label: "Turmas" },
  { to: "/professor/avaliacoes", icon: "fas fa-clipboard-check", label: "Avaliações" },
  { to: "/professor/cursos", icon: "fas fa-graduation-cap", label: "Cursos" },
  { to: "/professor/biblioteca", icon: "fas fa-book-bookmark", label: "Biblioteca" },
];

export const ProfessorNavbar = () => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const firstName = (user?.user_metadata?.first_name as string) || user?.email?.split("@")[0] || "Professor";
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=a855f7&color=fff`;

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-2 mb-6 transition-all duration-300 shadow-sm glass-nav">
      <div className="max-w-[1600px] mx-auto px-2 h-20 flex items-center justify-between">
        <NavLink to="/professor" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 text-white transition-transform rounded-xl bg-gradient-to-br from-aurora-secondary to-aurora-accent shadow-neon group-hover:scale-105">
            <i className="text-lg fas fa-chalkboard-teacher" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight transition-colors text-slate-700 font-display group-hover:text-aurora-secondary">Hemera</span>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400">Portal do Docente</span>
          </div>
        </NavLink>

        <div className="hidden md:flex items-center bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/50 shadow-inner gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 text-sm font-bold transition-all rounded-full hover:bg-white ${
                  isActive ? "text-aurora-secondary bg-white shadow-sm" : "text-slate-600 hover:text-aurora-secondary"
                }`
              }
            >
              <i className={l.icon} /> {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center w-10 h-10 transition border border-white rounded-full shadow-sm bg-white/60 hover:bg-white text-slate-500 hover:text-aurora-secondary">
            <i className="fas fa-inbox" />
          </button>
          <div className="relative pl-4 border-l border-slate-200">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 group">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-bold text-slate-700">{firstName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Professor</p>
              </div>
              <img src={avatarUrl} alt={firstName} className="object-cover w-10 h-10 transition-colors border-2 border-white shadow-sm rounded-xl group-hover:border-aurora-secondary" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 z-50 w-56 p-2 space-y-1 origin-top-right transform border shadow-xl top-12 bg-white/90 backdrop-blur-xl rounded-2xl border-white/50">
                  <button className="w-full text-left flex items-center gap-3 px-3 py-2 text-xs font-bold transition rounded-xl text-slate-600 hover:bg-slate-100 hover:text-aurora-secondary">
                    <i className="w-4 fas fa-user-tie" /> Meu Perfil
                  </button>
                  <div className="h-px my-1 bg-slate-100" />
                  <button
                    onClick={async () => { await signOut(); navigate("/auth"); }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-xs font-bold transition rounded-xl text-destructive hover:bg-red-50"
                  >
                    <i className="w-4 fas fa-sign-out-alt" /> Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
