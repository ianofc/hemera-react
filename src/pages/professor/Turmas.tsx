import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pedagogicoService, Turma } from "@/services/pedagogicoService";

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Minhas Turmas | Hemera"; load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await pedagogicoService.getTurmasProfessor();
      setTurmas(data);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remover = async (id: string) => {
    if (!confirm("Excluir esta turma?")) return;
    try {
      await pedagogicoService.deletarTurma(id);
      toast.success("Turma excluída.");
      load();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erro ao excluir turma.");
    }
  };

  return (
    <div className="max-w-6xl px-6 mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Minhas Turmas</h1>
          <p className="mt-1 text-sm text-slate-500">Gerencie suas turmas e turmas de apoio.</p>
        </div>
        <Link to="/professor/turmas/nova" className="flex items-center gap-2 px-5 py-3 font-bold text-white transition shadow-xl rounded-xl bg-gradient-to-r from-aurora-secondary to-aurora-accent hover:-translate-y-0.5">
          <i className="fas fa-plus" /> Nova Turma
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : turmas.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full shadow-inner bg-slate-100">
            <i className="text-4xl text-slate-400 fas fa-inbox" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-800">Nenhuma turma encontrada</h3>
          <p className="max-w-md mx-auto mb-8 text-slate-500">Comece criando sua primeira turma.</p>
          <Link to="/professor/turmas/nova" className="flex items-center gap-2 px-8 py-3 font-bold text-white transition shadow-xl rounded-xl bg-gradient-to-r from-aurora-secondary to-aurora-accent hover:-translate-y-1">
            <i className="fas fa-plus" /> Criar Turma
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {turmas.map((t) => (
            <div key={t.id} className="flex flex-col justify-between h-full p-6 transition glass-card rounded-2xl hover:-translate-y-1 hover:shadow-md">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold truncate text-slate-800" title={t.nome}>{t.nome}</h3>
                  <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full">{t.ano_letivo}</span>
                </div>
                <div className="mb-6 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center"><i className="w-5 mr-2 text-center fas fa-clock text-aurora-secondary" />{t.periodo}</p>
                  <p className="flex items-center"><i className="w-5 mr-2 text-center fas fa-fingerprint text-aurora-secondary" />
                    <span className="font-mono text-xs text-slate-400">ID: {t.id.slice(0, 8)}...</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                <button onClick={() => remover(t.id)} className="flex items-center gap-1 text-xs font-semibold transition text-slate-500 hover:text-destructive">
                  <i className="fas fa-trash" /> Excluir
                </button>
                <Link to={`/professor/turmas/${t.id}`} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition shadow-lg rounded-xl bg-aurora-secondary hover:bg-aurora-primary">
                  <i className="fas fa-eye" /> Acessar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
