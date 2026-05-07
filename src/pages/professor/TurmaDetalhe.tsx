import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Turma { id: string; nome: string; ano_letivo: number; periodo: string }
interface Aluno { id: string; nome: string; matricula: string | null; nota_media: number; taxa_frequencia: number }

export default function TurmaDetalhe() {
  const { id } = useParams();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [novoNome, setNovoNome] = useState("");

  useEffect(() => {
    if (!id) return;
    document.title = "Detalhes da Turma | Hemera";
    (async () => {
      const { data: t } = await supabase.from("turmas").select("*").eq("id", id).single();
      setTurma(t as any);
      const { data: a } = await supabase.from("alunos").select("*").eq("turma_id", id).order("nome");
      setAlunos((a ?? []) as any);
    })();
  }, [id]);

  const addAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turma || !novoNome.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("alunos").insert({ nome: novoNome.trim(), turma_id: turma.id, professor_id: user.id });
    if (error) toast.error(error.message);
    else {
      setNovoNome("");
      const { data: a } = await supabase.from("alunos").select("*").eq("turma_id", turma.id).order("nome");
      setAlunos((a ?? []) as any);
    }
  };

  if (!turma) return <div className="max-w-6xl px-6 mx-auto text-slate-500">Carregando...</div>;

  return (
    <div className="max-w-6xl px-6 mx-auto space-y-8">
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <Link to="/professor/turmas" className="inline-flex items-center gap-2 mb-2 text-xs font-bold transition text-slate-500 hover:text-aurora-secondary">
            <i className="fas fa-arrow-left" /> Voltar
          </Link>
          <h1 className="text-4xl font-bold text-slate-800 font-display">{turma.nome}</h1>
          <p className="mt-1 text-sm text-slate-500">{turma.periodo} · {turma.ano_letivo} · {alunos.length} aluno(s)</p>
        </div>
        <Link to={`/professor/turmas/${turma.id}/editar`} className="flex items-center gap-2 px-5 py-3 font-bold transition border rounded-xl text-slate-700 border-slate-200 bg-white hover:bg-slate-50">
          <i className="fas fa-cog" /> Configurar
        </Link>
      </div>

      <div className="p-6 glass-island rounded-3xl">
        <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800">
          <span className="w-2 h-6 rounded-full bg-aurora-secondary" /> Adicionar Aluno
        </h2>
        <form onSubmit={addAluno} className="flex gap-3">
          <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome completo do aluno"
            className="flex-1 px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none" />
          <button className="flex items-center gap-2 px-5 py-3 font-bold text-white transition shadow-lg rounded-xl bg-gradient-to-r from-aurora-secondary to-aurora-accent hover:-translate-y-0.5">
            <i className="fas fa-plus" /> Adicionar
          </button>
        </form>
      </div>

      <div className="overflow-hidden glass-island rounded-3xl">
        <div className="p-6 border-b border-slate-100">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <span className="w-2 h-6 bg-indigo-500 rounded-full" /> Lista de Alunos
          </h2>
        </div>
        {alunos.length === 0 ? (
          <p className="p-8 text-center text-slate-500">Nenhum aluno cadastrado ainda.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-indigo-50/30 text-indigo-900/70">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-left uppercase">Aluno</th>
                <th className="px-6 py-4 text-xs font-bold text-center uppercase">Matrícula</th>
                <th className="px-6 py-4 text-xs font-bold text-center uppercase">Média</th>
                <th className="px-6 py-4 text-xs font-bold text-center uppercase">Frequência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alunos.map((a) => (
                <tr key={a.id} className="transition hover:bg-white/50">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{a.nome}</td>
                  <td className="px-6 py-4 font-mono text-xs text-center text-slate-500">{a.matricula || "—"}</td>
                  <td className="px-6 py-4 text-sm font-bold text-center text-indigo-700">{Number(a.nota_media).toFixed(1)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-center text-emerald-600">{Number(a.taxa_frequencia).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
