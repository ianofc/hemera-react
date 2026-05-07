import { Outlet, Navigate } from "react-router-dom";
import { ProfessorNavbar } from "@/components/professor/ProfessorNavbar";
import { AuroraBackground } from "@/components/AuroraBackground";
import { useAuth } from "@/hooks/useAuth";

export default function ProfessorLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <ProfessorNavbar />
      <main className="relative z-10 flex-grow pt-2 pb-10">
        <Outlet />
      </main>
      <footer className="relative z-10 py-10 mt-auto border-t border-white/50 bg-white/40 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 opacity-80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 text-white rounded-lg bg-slate-800">
              <i className="text-xs fas fa-bolt" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">© 2026 Hemera.</p>
              <p className="text-[10px] text-slate-500">Plataforma de Educação Inteligente.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
