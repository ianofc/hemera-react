import React, { useState, useEffect } from "react";
import { alunoService, ResumoDashboard } from "@/services/alunoService";
import { Trophy, Star, Target, BookOpen, Clock, Activity, Award, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AlunoDashboard() {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Meu Painel | Hemera";
    alunoService.getResumoDashboard()
      .then(setResumo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const mediaPercent = resumo ? Math.min((resumo.mediaGeral / 10) * 100, 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-800">Meu Painel</h1>
        <p className="text-slate-500">Acompanhe seu desempenho acadêmico em tempo real.</p>
      </div>

      {/* ── Grid Superior ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Card Principal: Desempenho */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-[6px] border-white/30 shadow-inner flex-shrink-0">
              <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-md" />
            </div>

            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h2 className="text-3xl font-black">
                    {resumo?.mediaGeral ? resumo.mediaGeral.toFixed(1) : '—'}
                  </h2>
                  <p className="text-indigo-200 font-medium">Média Geral</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-400">{resumo?.taxaFrequencia ?? 100}%</p>
                  <p className="text-xs text-indigo-200">Frequência</p>
                </div>
              </div>

              {/* Barra de média */}
              <div className="w-full h-3 bg-indigo-900/50 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-1000"
                  style={{ width: `${mediaPercent}%` }}
                />
              </div>
              <p className="text-right text-xs text-indigo-200 mt-2">
                {mediaPercent.toFixed(0)}% do desempenho máximo
              </p>
            </div>
          </div>
        </div>

        {/* Card Secundário: Resumo Rápido */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Resumo Acadêmico
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="font-medium text-slate-700">Turmas Ativas</span>
              </div>
              <span className="font-bold text-slate-900">{resumo?.minhasTurmas.length ?? 0}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="font-medium text-slate-700">Pendentes</span>
              </div>
              <span className={`font-bold ${(resumo?.atividadesPendentes ?? 0) > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {resumo?.atividadesPendentes ?? 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="font-medium text-slate-700">Entregues</span>
              </div>
              <span className="font-bold text-emerald-700">{resumo?.atividadesConcluidas ?? 0}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/aluno/atividades')}
            className="mt-4 w-full text-center text-xs font-bold text-indigo-600 hover:underline"
          >
            Ver todas as atividades →
          </button>
        </div>
      </div>

      {/* ── Minhas Turmas ── */}
      {(resumo?.minhasTurmas?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" /> Minhas Turmas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumo?.minhasTurmas.map(t => (
              <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <h4 className="font-bold text-slate-800">{t.nome}</h4>
                <p className="text-sm text-slate-500 mt-1">{t.periodo} · {t.ano_letivo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Últimas Notas ── */}
      {(resumo?.ultimasNotas?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" /> Últimas Avaliações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumo?.ultimasNotas.map((nota, i) => {
              const percent = (nota.valor / nota.valorMaximo) * 100;
              const cor = percent >= 70 ? 'text-emerald-600' : percent >= 50 ? 'text-amber-600' : 'text-red-600';
              return (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="font-bold text-slate-700 text-sm line-clamp-1 mb-2">{nota.titulo}</p>
                  <div className="flex items-end justify-between">
                    <span className={`text-2xl font-black ${cor}`}>{nota.valor.toFixed(1)}</span>
                    <span className="text-sm text-slate-400">/ {nota.valorMaximo}</span>
                  </div>
                  <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${percent >= 70 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {(resumo?.minhasTurmas?.length ?? 0) === 0 && (
        <div className="py-20 text-center border border-dashed border-slate-200 rounded-3xl">
          <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Bem-vindo ao Hemera!</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Você ainda não está matriculado em nenhuma turma. Aguarde seu professor vinculá-lo, ou entre em contato com a instituição.
          </p>
        </div>
      )}

      {/* ── Indicadores extras ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { icon: Trophy, label: "Média Geral", value: resumo?.mediaGeral ? resumo.mediaGeral.toFixed(1) : '—', color: 'bg-indigo-100 text-indigo-600' },
          { icon: Clock, label: "Frequência", value: `${resumo?.taxaFrequencia ?? 100}%`, color: 'bg-blue-100 text-blue-600' },
          { icon: Target, label: "Pendentes", value: String(resumo?.atividadesPendentes ?? 0), color: 'bg-amber-100 text-amber-600' },
          { icon: CheckCircle, label: "Concluídas", value: String(resumo?.atividadesConcluidas ?? 0), color: 'bg-emerald-100 text-emerald-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <Icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
