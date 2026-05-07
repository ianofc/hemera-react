import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function TurmaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id && id !== "nova";
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [periodo, setPeriodo] = useState("Matutino");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${isEdit ? "Editar" : "Nova"} Turma | Hemera`;
    if (isEdit) {
      supabase.from("turmas").select("*").eq("id", id).single().then(({ data }) => {
        if (data) { setNome(data.nome); setAno(data.ano_letivo); setPeriodo(data.periodo); }
      });
    }
  }, [id, isEdit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const payload = { nome, ano_letivo: ano, periodo, professor_id: user.id };
    const { error } = isEdit
      ? await supabase.from("turmas").update(payload).eq("id", id)
      : await supabase.from("turmas").insert(payload);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(isEdit ? "Turma atualizada." : "Turma criada."); navigate("/professor/turmas"); }
  };

  return (
    <div className="max-w-2xl px-6 mx-auto animate-fade-in-up">
      <h1 className="flex items-center gap-3 mb-6 text-3xl font-bold text-slate-800 font-display">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg shadow-md bg-gradient-to-br from-aurora-secondary to-aurora-accent">
          <i className={`fas ${isEdit ? "fa-edit" : "fa-plus"}`} />
        </div>
        {isEdit ? "Editar Turma" : "Nova Turma"}
      </h1>

      <div className="p-8 glass-island rounded-3xl">
        <p className="mb-6 text-sm text-slate-500">Configure os detalhes da sua turma.</p>
        <form onSubmit={submit} className="space-y-5">
          <Field label="Nome da Turma" required>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: 9º Ano A - Matutino"
              className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none" />
          </Field>
          <Field label="Ano Letivo" required>
            <input type="number" value={ano} onChange={(e) => setAno(parseInt(e.target.value))} required
              className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none" />
          </Field>
          <Field label="Período">
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-4 py-3 text-sm transition border bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-aurora-secondary focus:border-transparent outline-none">
              <option>Matutino</option><option>Vespertino</option><option>Noturno</option><option>Integral</option>
            </select>
          </Field>

          <div className="flex items-center gap-4 pt-4">
            <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white transition transform shadow-lg rounded-xl bg-gradient-to-r from-aurora-secondary to-aurora-accent hover:-translate-y-0.5 disabled:opacity-50">
              <i className="mr-2 fas fa-save" /> Salvar
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold transition border rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-bold text-slate-700">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
