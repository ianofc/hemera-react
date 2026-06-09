import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/admin", icon: "fas fa-gauge-high", label: "Painel", end: true },
  { to: "/admin/usuarios", icon: "fas fa-users-cog", label: "Usuários" },
  { to: "/admin/turmas", icon: "fas fa-school", label: "Turmas" },
  { to: "/admin/cursos", icon: "fas fa-graduation-cap", label: "Cursos" },
  { to: "/admin/biblioteca", icon: "fas fa-book-bookmark", label: "Biblioteca" },
  { to: "/admin/area-escolar", icon: "fas fa-school-flag", label: "Área Escolar" },
  { to: "/admin/thorth", icon: "fas fa-comments", label: "Thorth" },
  { to: "/admin/hermes", icon: "fas fa-coins", label: "Hermes" },
  { to: "/admin/polis", icon: "fas fa-bullhorn", label: "Polis" },
  { to: "/admin/olimpo", icon: "fas fa-crown", label: "Olimpo" },
  { to: "/admin/pentaia", icon: "fas fa-brain", label: "PentaIA" },
  { to: "/hemera-lm", icon: "fas fa-brain", label: "HemeraLM" },
];

export const AdminNavbar = () => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const firstName = (user?.user_metadata?.first_name as string) || user?.email?.split("@")[0] || "Admin";
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=ec4899&color=fff`;

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-2 mb-6 transition-all duration-300 shadow-sm glass-nav">
      <div className="max-w-[1600px] mx-auto px-2 h-20 flex items-center justify-between">
        <NavLink to="/admin" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 text-white rounded-xl bg-gradient-to-br from-aurora-accent to-aurora-primary shadow-neon">
            <i className="text-lg fas fa-shield-halved" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-700 font-display">Hemera</span>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400">Administração</span>
          </div>
        </NavLink>

        <div className="hidden md:flex items-center bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/50 shadow-inner gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `flex items-center gap-2 px-5 py-2 text-sm font-bold transition-all rounded-full hover:bg-white ${isActive ? "text-aurora-accent bg-white shadow-sm" : "text-slate-600"}`}>
              <i className={l.icon} /> {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-bold text-slate-700">{firstName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Admin</p>
              </div>
              <img src={avatarUrl} alt={firstName} className="object-cover w-10 h-10 border-2 border-white shadow-sm rounded-xl" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 z-50 w-56 p-2 space-y-1 origin-top-right transform border shadow-xl top-12 bg-white/90 backdrop-blur-xl rounded-2xl border-white/50">
                  <NavLink to="/admin/configuracoes" className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"><i className="w-4 fas fa-cog" />Configurações</NavLink>
                  <NavLink to="/admin/auditoria" className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"><i className="w-4 fas fa-clipboard-list" />Auditoria</NavLink>
                  <div className="h-px my-1 bg-slate-100" />
                  <button onClick={async () => { await signOut(); navigate("/auth"); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl text-destructive hover:bg-red-50"><i className="w-4 fas fa-sign-out-alt" />Sair</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
