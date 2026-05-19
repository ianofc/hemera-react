import React, { useState, useEffect } from "react";
import { gamificacaoService, GamificacaoStatus } from "@/services/gamificacaoService";
import { Trophy, Star, Target, BookOpen, Clock, Activity, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AlunoDashboard() {
  const [gamificacao, setGamificacao] = useState<GamificacaoStatus | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    gamificacaoService.getStatusAluno().then(setGamificacao);
  }, []);

  const xpPercent = gamificacao ? (gamificacao.xpProgressoNoNivel / gamificacao.xpTotalDoNivel) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-800">Seu Progresso</h1>
        <p className="text-slate-500">Acompanhe seu desempenho e conquistas na plataforma.</p>
      </div>

      {/* Grid Superior: Gamificação e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Card Principal: Gamificação */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-[6px] border-white/30 shadow-inner">
              <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-md" />
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h2 className="text-3xl font-black">{gamificacao?.titulo || 'Carregando...'}</h2>
                  <p className="text-indigo-200 font-medium">Nível {gamificacao?.nivel || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-400">{gamificacao?.xpAtual || 0} XP</p>
                  <p className="text-xs text-indigo-200">Total acumulado</p>
                </div>
              </div>
              
              <div className="w-full h-3 bg-indigo-900/50 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-1000" style={{ width: `${xpPercent}%` }}></div>
              </div>
              <p className="text-right text-xs text-indigo-200 mt-2">
                Faltam {gamificacao ? gamificacao.xpTotalDoNivel - gamificacao.xpProgressoNoNivel : 0} XP para o Nível {(gamificacao?.nivel || 0) + 1}
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
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4" /></div>
                <span className="font-medium text-slate-700">Cursos Ativos</span>
              </div>
              <span className="font-bold text-slate-900">3</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><Target className="w-4 h-4" /></div>
                <span className="font-medium text-slate-700">Entregas Pendentes</span>
              </div>
              <span className="font-bold text-slate-900">2</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><Clock className="w-4 h-4" /></div>
                <span className="font-medium text-slate-700">Média de Presença</span>
              </div>
              <span className="font-bold text-slate-900">94%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Conquistas (Badges) */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-500" /> Minhas Conquistas
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gamificacao?.conquistas.map(conquista => (
            <div key={conquista.id} className={`p-5 rounded-2xl border text-center transition-all ${conquista.desbloqueada ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-slate-50 border-dashed border-slate-300 opacity-60 grayscale'}`}>
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner ${conquista.desbloqueada ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                {conquista.icone}
              </div>
              <h4 className="font-bold text-sm text-slate-800 mb-1">{conquista.titulo}</h4>
              <p className="text-xs text-slate-500">{conquista.descricao}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
