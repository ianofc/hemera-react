import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, BookOpen, GraduationCap, School, Loader2, TrendingUp, Activity, Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminStats {
  totalUsuarios: number;
  totalTurmas: number;
  totalAlunos: number;
  totalCursos: number;
}

interface TurmaRecente {
  id: string;
  nome: string;
  periodo: string;
  ano_letivo: number;
  professor_nome: string | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [turmasRecentes, setTurmasRecentes] = useState<TurmaRecente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Painel Admin | Hemera";
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        { count: usuarios },
        { count: turmas },
        { count: alunos },
        { count: cursos },
        { data: turmasData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("turmas").select("*", { count: "exact", head: true }),
        supabase.from("alunos").select("*", { count: "exact", head: true }),
        supabase.from("cursos").select("*", { count: "exact", head: true }),
        supabase.from("turmas").select("id, nome, periodo, ano_letivo").order("created_at", { ascending: false }).limit(6),
      ]);

      setStats({
        totalUsuarios: usuarios ?? 0,
        totalTurmas: turmas ?? 0,
        totalAlunos: alunos ?? 0,
        totalCursos: cursos ?? 0,
      });

      setTurmasRecentes((turmasData ?? []).map(t => ({
        id: t.id,
        nome: t.nome,
        periodo: t.periodo,
        ano_letivo: t.ano_letivo,
        professor_nome: null,
      })));
    } catch (err) {
      console.error("Erro ao carregar dados admin:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Usuários Cadastrados", value: stats?.totalUsuarios ?? 0, color: "from-indigo-500 to-blue-600", shadow: "shadow-indigo-100" },
    { icon: School, label: "Turmas Ativas", value: stats?.totalTurmas ?? 0, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-100" },
    { icon: GraduationCap, label: "Alunos Matriculados", value: stats?.totalAlunos ?? 0, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-100" },
    { icon: BookOpen, label: "Cursos Publicados", value: stats?.totalCursos ?? 0, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest text-indigo-200 uppercase">Painel Administrativo</span>
          </div>
          <h1 className="text-4xl font-bold text-white font-display mb-2">
            Olá, {user?.user_metadata?.first_name || "Admin"}
          </h1>
          <p className="text-indigo-200">Visão geral do ecossistema Hemera</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ icon: Icon, label, value, color, shadow }) => (
          <div key={label} className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:-translate-y-1 transition-all ${shadow}`}>
            <div className={`w-12 h-12 bg-gradient-to-br ${color} text-white rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <Icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-800">{value.toLocaleString()}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Corpo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Turmas Recentes */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Turmas Recentes
            </h2>
            <Link to="/professor/turmas" className="text-sm font-bold text-indigo-600 hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {turmasRecentes.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400">
                Nenhuma turma cadastrada ainda.
              </div>
            ) : turmasRecentes.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {t.nome.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{t.nome}</h4>
                    <p className="text-xs text-slate-500">{t.periodo} · {t.ano_letivo}</p>
                  </div>
                </div>
                <Link
                  to={`/professor/turmas/${t.id}`}
                  className="text-xs font-bold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Acessar
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Ações Rápidas
          </h2>
          <div className="space-y-3">
            {[
              { label: "Criar Nova Turma", href: "/professor/turmas/nova", icon: School, color: "indigo" },
              { label: "Ver Todos os Alunos", href: "/professor/turmas", icon: GraduationCap, color: "emerald" },
              { label: "Biblioteca de Materiais", href: "/biblioteca", icon: BookOpen, color: "amber" },
              { label: "Catálogo de Cursos (AVA)", href: "/cursos", icon: BookOpen, color: "violet" },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                to={href}
                className={`flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${color}-100 text-${color}-600`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
