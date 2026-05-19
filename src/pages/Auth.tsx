import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
// Integrado diretamente com o cliente Supabase
import { useAuth } from "@/hooks/useAuth";
import { AuroraBackground } from "@/components/AuroraBackground";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signInMock } = useAuth();

  useEffect(() => {
    document.title = "Hemera | Autenticação";
    if (user) {
      const role = user.user_metadata?.role || "professor";
      if (role === "aluno") navigate("/aluno", { replace: true });
      else if (role === "admin") navigate("/admin", { replace: true });
      else navigate("/professor", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      signInMock();
      toast.success("Login simulado ativado! Entrando como Professor Ian.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
      <AuroraBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mb-4 text-white shadow-neon rounded-2xl bg-gradient-to-br from-aurora-secondary to-aurora-accent">
            <i className="text-2xl fas fa-chalkboard-teacher" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 font-display">Hemera</h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mt-1">Portal de Acesso</p>
        </div>

        <div className="p-8 glass-island rounded-3xl">
          <div className="flex p-1 mb-6 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "signin" ? "bg-white text-aurora-secondary shadow-sm" : "text-slate-500"}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "signup" ? "bg-white text-aurora-secondary shadow-sm" : "text-slate-500"}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nome" className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none"
                />
                <input
                  value={lastName} onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sobrenome" className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none"
                />
              </div>
            )}
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none"
            />
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mín. 6)" className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none"
            />
            <button
              type="submit" disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-3 text-sm font-bold text-white transition shadow-xl rounded-xl bg-gradient-to-r from-aurora-secondary to-aurora-accent hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-sign-in-alt" />}
              {mode === "signin" ? "Entrar" : "Criar Conta"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="px-3 bg-white/80 text-slate-400">ou</span></div>
          </div>

          <button
            type="button"
            onClick={() => {
              signInMock();
              toast.success("Login simulado com Google ativado! Entrando como Professor Ian.");
            }}
            className="flex items-center justify-center w-full gap-3 py-3 text-sm font-bold transition border bg-white border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
          >
            <i className="fab fa-google text-aurora-accent" /> Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}
