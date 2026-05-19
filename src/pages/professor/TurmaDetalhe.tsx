import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, BookOpen, Clock, Settings, FileText, Send, Paperclip, 
  BrainCircuit, CheckCircle, XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Turma { id: string; nome: string; ano_letivo: number; periodo: string }
interface Aluno { id: string; nome: string; matricula: string | null; nota_media: number; taxa_frequencia: number }

export default function TurmaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [activeTab, setActiveTab] = useState<'mural' | 'diario' | 'frequencia' | 'alunos'>('mural');

  // Mock postagens no mural
  const [postagens] = useState([
    { id: 1, autor: "Prof. Você", texto: "Pessoal, segue o PDF com os slides da aula de Revolução Francesa. Estudem para o quiz de sexta!", data: "Hoje às 10:30", arquivo: "slides_revolucao.pdf" }
  ]);

  useEffect(() => {
    if (!id) return;
    document.title = "Hub da Turma | Hemera";
    (async () => {
      const { data: t } = await supabase.from("turmas").select("*").eq("id", id).single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTurma(t as any);
      const { data: a } = await supabase.from("alunos").select("*").eq("turma_id", id).order("nome");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAlunos((a ?? []) as any);
    })();
  }, [id]);

  if (!turma) return <div className="max-w-7xl px-6 mx-auto mt-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-6 space-y-8 animate-fade-in-down">
      
      {/* HEADER DA TURMA */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/professor/turmas" className="inline-flex items-center gap-2 mb-4 text-xs font-bold transition text-slate-500 hover:text-indigo-600">
              <i className="fas fa-arrow-left" /> Voltar para Turmas
            </Link>
            <h1 className="text-4xl font-bold text-slate-800 font-display tracking-tight">{turma.nome}</h1>
            <p className="mt-2 text-slate-500 flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> {turma.periodo}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-400" /> {alunos.length} alunos</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-200 text-slate-600 font-bold" onClick={() => navigate(`/professor/turmas/${turma.id}/editar`)}>
              <Settings className="w-4 h-4 mr-2" /> Configurações
            </Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg shadow-indigo-200" onClick={() => navigate('/hemera-lm')}>
              <BrainCircuit className="w-4 h-4 mr-2" /> Abrir no HemeraLM
            </Button>
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO DO HUB */}
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl max-w-fit">
        {[
          { id: 'mural', label: 'Mural da Turma', icon: FileText },
          { id: 'diario', label: 'Diário Rápido', icon: BookOpen },
          { id: 'frequencia', label: 'Chamada', icon: CheckCircle },
          { id: 'alunos', label: 'Alunos & Notas', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="min-h-[500px]">
        
        {/* ABA: MURAL */}
        {activeTab === 'mural' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Nova Postagem */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                  P
                </div>
                <div className="flex-1 space-y-3">
                  <textarea 
                    placeholder="Escreva um aviso, poste um material ou anexe a aula de hoje..." 
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-medium text-slate-700"
                  />
                  <div className="flex justify-between items-center pt-2">
                    <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                      <Paperclip className="w-4 h-4" /> Anexar Arquivo
                    </button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6">
                      <Send className="w-4 h-4 mr-2" /> Postar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Feed do Mural */}
              <div className="space-y-4">
                {postagens.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">P</div>
                      <div>
                        <h4 className="font-bold text-slate-800">{p.autor}</h4>
                        <p className="text-xs text-slate-500 font-medium">{p.data}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 mb-4">{p.texto}</p>
                    
                    {/* Anexo PDF com Botão HemeraLM */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-500 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{p.arquivo}</p>
                          <p className="text-xs text-slate-500">Documento PDF</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50" onClick={() => navigate('/hemera-lm')}>
                        <BrainCircuit className="w-3.5 h-3.5 mr-2" /> Estudar no HemeraLM
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Próximas Atividades */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 mb-4">Próximos Prazos</h3>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 text-center">
                <p className="text-sm text-slate-500 font-medium mb-2">Nenhuma atividade agendada para os próximos dias.</p>
                <button className="text-sm font-bold text-indigo-600 hover:underline">Agendar Avaliação</button>
              </div>
            </div>
          </div>
        )}

        {/* ABA: DIÁRIO */}
        {activeTab === 'diario' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" /> Registro de Aula do Dia
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Data da Aula</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Conteúdo Ministrado</label>
                <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none resize-none" placeholder="O que foi ensinado hoje..." />
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-12 text-base">Salvar no Diário Oficial</Button>
            </div>
          </div>
        )}

        {/* ABA: FREQUÊNCIA */}
        {activeTab === 'frequencia' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" /> Chamada Rápida (Hoje)
              </h2>
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold">Finalizar Chamada</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alunos.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                  <span className="font-bold text-slate-700 text-sm">{a.nome}</span>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors">P</button>
                    <button className="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors">F</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: ALUNOS (Tabela Original Adaptada) */}
        {activeTab === 'alunos' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-left uppercase text-slate-500">Aluno</th>
                  <th className="px-6 py-4 text-xs font-bold text-center uppercase text-slate-500">Matrícula</th>
                  <th className="px-6 py-4 text-xs font-bold text-center uppercase text-slate-500">Média Geral</th>
                  <th className="px-6 py-4 text-xs font-bold text-center uppercase text-slate-500">Frequência Global</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alunos.map((a) => (
                  <tr key={a.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{a.nome}</td>
                    <td className="px-6 py-4 font-mono text-xs text-center text-slate-500">{a.matricula || "—"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-center text-indigo-600">{Number(a.nota_media).toFixed(1)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-center text-emerald-600">{Number(a.taxa_frequencia).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
