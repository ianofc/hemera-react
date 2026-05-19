import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  pedagogicoService,
  Aluno,
  PostagemMural,
} from "@/services/pedagogicoService";
import { PlanoDeAula } from "@/types";
import { toast } from "sonner";
import {
  Users, BookOpen, Clock, Settings, FileText, Send, Paperclip,
  BrainCircuit, CheckCircle, XCircle, Loader2, Save, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Turma { id: string; nome: string; ano_letivo: number; periodo: string }

type TabId = 'mural' | 'diario' | 'frequencia' | 'alunos';

export default function TurmaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('mural');
  const [loadingBase, setLoadingBase] = useState(true);

  // ── Mural ────────────────────────────────────────────────────────────────────
  const [postagens, setPostagens] = useState<PostagemMural[]>([]);
  const [novaPostagem, setNovaPostagem] = useState("");
  const [postando, setPostando] = useState(false);

  // ── Diário ───────────────────────────────────────────────────────────────────
  const [planos, setPlanos] = useState<PlanoDeAula[]>([]);
  const [diarios, setDiarios] = useState<Record<string, string>>({});
  const [salvandoDiario, setSalvandoDiario] = useState<string | null>(null);
  const [loadingPlanos, setLoadingPlanos] = useState(false);

  // ── Chamada ──────────────────────────────────────────────────────────────────
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [dataAula, setDataAula] = useState(new Date().toISOString().split('T')[0]);
  const [salvandoChamada, setSalvandoChamada] = useState(false);

  // ── Load base ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    document.title = "Hub da Turma | Hemera";
    (async () => {
      const { data: t } = await supabase.from("turmas").select("*").eq("id", id).single();
      setTurma(t as Turma);
      const { data: a } = await supabase.from("alunos").select("*").eq("turma_id", id).order("nome");
      const lista = (a ?? []) as Aluno[];
      setAlunos(lista);
      // Presença: todos presentes por padrão
      const initP: Record<string, boolean> = {};
      lista.forEach(al => { initP[al.id] = true; });
      setPresencas(initP);
      setLoadingBase(false);
    })();
  }, [id]);

  // ── Load mural ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || activeTab !== 'mural') return;
    pedagogicoService.getPostagensMural(id).then(setPostagens);
  }, [id, activeTab]);

  // ── Load diário ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || activeTab !== 'diario') return;
    setLoadingPlanos(true);
    pedagogicoService.getPlanosDeAula(id).then(data => {
      setPlanos(data);
      const d: Record<string, string> = {};
      data.forEach(p => { d[p.id] = (p as PlanoDeAula & { diario_registro?: string }).diario_registro ?? ''; });
      setDiarios(d);
      setLoadingPlanos(false);
    });
  }, [id, activeTab]);

  if (loadingBase) {
    return (
      <div className="max-w-7xl px-6 mx-auto mt-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="max-w-7xl px-6 mx-auto mt-16 text-center text-slate-500">
        Turma não encontrada.
      </div>
    );
  }

  // ── Handlers Mural ───────────────────────────────────────────────────────────
  const handlePostar = async () => {
    if (!novaPostagem.trim() || !id) return;
    setPostando(true);
    try {
      const nova = await pedagogicoService.criarPostagemMural(id, novaPostagem.trim());
      setPostagens(prev => [nova, ...prev]);
      setNovaPostagem("");
      toast.success("Postagem publicada no mural!");
    } catch {
      toast.error("Erro ao publicar postagem.");
    } finally {
      setPostando(false);
    }
  };

  // ── Handlers Diário ──────────────────────────────────────────────────────────
  const handleSalvarDiario = async (planoId: string) => {
    setSalvandoDiario(planoId);
    try {
      await pedagogicoService.upsertDiario(planoId, diarios[planoId] ?? '');
      setPlanos(prev => prev.map(p => p.id === planoId ? { ...p, status: 'Ministrada' } : p));
      toast.success("Registro salvo no diário!");
    } catch {
      toast.error("Erro ao salvar diário.");
    } finally {
      setSalvandoDiario(null);
    }
  };

  // ── Handlers Chamada ─────────────────────────────────────────────────────────
  const handleFinalizarChamada = async () => {
    if (!id) return;
    setSalvandoChamada(true);
    try {
      await pedagogicoService.registrarFrequencia(id, dataAula, presencas);
      toast.success("Chamada registrada com sucesso!");
    } catch {
      toast.error("Erro ao registrar chamada.");
    } finally {
      setSalvandoChamada(false);
    }
  };

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'mural', label: 'Mural da Turma', icon: FileText },
    { id: 'diario', label: 'Diário Rápido', icon: BookOpen },
    { id: 'frequencia', label: 'Chamada', icon: CheckCircle },
    { id: 'alunos', label: 'Alunos & Notas', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-6 space-y-8 animate-fade-in-down">

      {/* HEADER */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3" />
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
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-lg shadow-indigo-200" onClick={() => navigate('/hemera-lm')}>
              <BrainCircuit className="w-4 h-4 mr-2" /> HemeraLM
            </Button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl max-w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div className="min-h-[500px]">

        {/* ─── ABA MURAL ─────────────────────────────────────────────────── */}
        {activeTab === 'mural' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Nova Postagem */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">P</div>
                <div className="flex-1 space-y-3">
                  <Textarea
                    id="textarea-postagem"
                    placeholder="Escreva um aviso ou poste um material..."
                    rows={2}
                    value={novaPostagem}
                    onChange={e => setNovaPostagem(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl resize-none font-medium text-slate-700"
                  />
                  <div className="flex justify-between items-center pt-2">
                    <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                      <Paperclip className="w-4 h-4" /> Anexar Arquivo
                    </button>
                    <Button
                      id="btn-postar-mural"
                      className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6"
                      onClick={handlePostar}
                      disabled={postando || !novaPostagem.trim()}
                    >
                      {postando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Postar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Feed */}
              <div className="space-y-4">
                {postagens.length === 0 && (
                  <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Nenhuma postagem ainda. Seja o primeiro!</p>
                  </div>
                )}
                {postagens.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">P</div>
                      <div>
                        <h4 className="font-bold text-slate-800">Professor</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {new Date(p.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">{p.texto}</p>
                    {p.arquivo_nome && (
                      <div className="flex items-center gap-3 mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-500 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-700 text-sm">{p.arquivo_nome}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 mb-4">Próximos Prazos</h3>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 text-center">
                <p className="text-sm text-slate-500 font-medium mb-2">Veja o Gradebook para atividades pendentes.</p>
                <button
                  className="text-sm font-bold text-indigo-600 hover:underline"
                  onClick={() => navigate(`/professor/gradebook/turma/${turma.id}`)}
                >
                  Abrir Gradebook
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── ABA DIÁRIO ────────────────────────────────────────────────── */}
        {activeTab === 'diario' && (
          <div className="max-w-3xl space-y-6">
            {loadingPlanos ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
            ) : planos.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-medium">Nenhum plano de aula encontrado.</p>
                <button className="mt-2 text-sm font-bold text-indigo-600 hover:underline" onClick={() => navigate('/professor/planejamento')}>
                  Criar Planos de Aula
                </button>
              </div>
            ) : planos.map(plano => (
              <div
                key={plano.id}
                className={`bg-white p-6 rounded-2xl border-l-4 shadow-sm ${plano.status === 'Ministrada' ? 'border-l-emerald-500' : 'border-l-amber-500'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                    {new Date(plano.data_prevista).toLocaleDateString('pt-BR')}
                  </span>
                  {plano.status === 'Ministrada' && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Concluído
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">{plano.titulo}</h3>
                <Textarea
                  placeholder="Descreva o que foi lecionado, atividades e observações..."
                  value={diarios[plano.id] ?? ''}
                  onChange={e => setDiarios(prev => ({ ...prev, [plano.id]: e.target.value }))}
                  className="resize-none h-24 bg-slate-50 border-slate-200 mb-3"
                />
                <Button
                  onClick={() => handleSalvarDiario(plano.id)}
                  disabled={salvandoDiario === plano.id || !diarios[plano.id]}
                  className={plano.status === 'Ministrada' ? 'bg-slate-700 hover:bg-slate-800' : 'bg-amber-600 hover:bg-amber-700'}
                >
                  {salvandoDiario === plano.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {plano.status === 'Ministrada' ? 'Atualizar Registro' : 'Salvar Diário'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* ─── ABA CHAMADA ───────────────────────────────────────────────── */}
        {activeTab === 'frequencia' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-500" /> Chamada Rápida
                </h2>
                <p className="text-sm text-slate-500 mt-1">Marque a presença e clique em Finalizar</p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={dataAula}
                  onChange={e => setDataAula(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none"
                />
                <Button
                  id="btn-finalizar-chamada"
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  onClick={handleFinalizarChamada}
                  disabled={salvandoChamada || alunos.length === 0}
                >
                  {salvandoChamada ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Finalizar Chamada
                </Button>
              </div>
            </div>

            {alunos.length === 0 ? (
              <div className="py-12 text-center text-slate-400">Nenhum aluno cadastrado nesta turma.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alunos.map(a => (
                  <div key={a.id} className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${presencas[a.id] === false ? 'border-red-200 bg-red-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                    <span className="font-bold text-slate-700 text-sm truncate">{a.nome}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setPresencas(prev => ({ ...prev, [a.id]: true }))}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${presencas[a.id] === true ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPresencas(prev => ({ ...prev, [a.id]: false }))}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${presencas[a.id] === false ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ABA ALUNOS ────────────────────────────────────────────────── */}
        {activeTab === 'alunos' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {alunos.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>Nenhum aluno cadastrado.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-left uppercase text-slate-500">Aluno</th>
                    <th className="px-6 py-4 text-xs font-bold text-center uppercase text-slate-500">Matrícula</th>
                    <th className="px-6 py-4 text-xs font-bold text-center uppercase text-slate-500">Média Geral</th>
                    <th className="px-6 py-4 text-xs font-bold text-center uppercase text-slate-500">Frequência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alunos.map(a => (
                    <tr key={a.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{a.nome}</td>
                      <td className="px-6 py-4 font-mono text-xs text-center text-slate-500">{a.matricula || "—"}</td>
                      <td className="px-6 py-4 text-sm font-bold text-center text-indigo-600">{Number(a.nota_media).toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-center text-emerald-600">{Number(a.taxa_frequencia).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
