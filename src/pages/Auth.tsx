import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuroraBackground } from "@/components/AuroraBackground";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    if (!email || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      } else {
        if (!firstName) {
          toast.error("Preencha seu nome.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: "professor",
            },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro de autenticação";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/professor`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar com Google";
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: "professor" | "aluno" | "admin") => {
    setLoading(true);
    const mockUser = {
      id: `mock-${role}-id`,
      email: `${role}@hemera.io`,
      user_metadata: {
        role,
        first_name: role === "professor" ? "Ian" : role === "aluno" ? "Carlos" : "Admin",
        last_name: role === "professor" ? "Santos" : role === "aluno" ? "Silva" : "Geral",
      },
    };
    localStorage.setItem("hemera_mock_user", JSON.stringify(mockUser));
    window.location.reload();
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
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mt-1">
            Portal de Acesso
          </p>
        </div>

        <div className="p-8 glass-island rounded-3xl">
          <div className="flex p-1 mb-6 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="btn-tab-signin"
              onClick={() => setMode("signin")}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "signin" ? "bg-white text-aurora-secondary shadow-sm" : "text-slate-500"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              id="btn-tab-signup"
              onClick={() => setMode("signup")}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "signup" ? "bg-white text-aurora-secondary shadow-sm" : "text-slate-500"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  id="input-firstname"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nome"
                  className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none"
                />
                <input
                  id="input-lastname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sobrenome"
                  className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none"
                />
              </div>
            )}
            <input
              id="input-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none"
            />
            <input
              id="input-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mín. 6 caracteres)"
              className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none"
            />
            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-3 text-sm font-bold text-white transition shadow-xl rounded-xl bg-gradient-to-r from-aurora-secondary to-aurora-accent hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <i className="fas fa-sign-in-alt" />
              )}
              {mode === "signin" ? "Entrar" : "Criar Conta"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="px-3 bg-white/80 text-slate-400">ou</span>
            </div>
          </div>

          <button
            id="btn-google-login"
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full gap-3 py-3 text-sm font-bold transition border bg-white border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <i className="fab fa-google text-aurora-accent" />
            )}
            Continuar com Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="px-3 bg-white/80 text-slate-400">Acesso de Demonstração</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("professor")}
              className="py-2.5 px-1 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex flex-col items-center gap-1"
            >
              <i className="fas fa-chalkboard-teacher text-indigo-500 text-sm" />
              <span>Docente</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("aluno")}
              className="py-2.5 px-1 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex flex-col items-center gap-1"
            >
              <i className="fas fa-user-graduate text-emerald-500 text-sm" />
              <span>Aluno</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              className="py-2.5 px-1 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex flex-col items-center gap-1"
            >
              <i className="fas fa-user-shield text-amber-500 text-sm" />
              <span>Gestor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
