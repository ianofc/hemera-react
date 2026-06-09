import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  pedagogicoService,
  Aluno,
  PostagemMural,
  Atividade,
} from "@/services/pedagogicoService";
import { PlanoDeAula } from "@/types";
import { toast } from "sonner";
import {
  Users, BookOpen, Clock, Settings, FileText, Send, Paperclip,
  BrainCircuit, CheckCircle, XCircle, Loader2, Save, CheckCircle2,
  LayoutDashboard, TrendingUp, Calendar, AlertCircle, Edit, Trash2, Plus, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Turma { id: string; nome: string; ano_letivo: number; periodo: string }

type TabId = 'visao_geral' | 'mural' | 'diario' | 'frequencia' | 'notas' | 'alunos';

export default function TurmaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('visao_geral');
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

  // ── Lançamento de Notas ──────────────────────────────────────────────────────
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [selectedAtividade, setSelectedAtividade] = useState<string>("");
  const [notasInput, setNotasInput] = useState<Record<string, { valor: string, feedback: string }>>({});
  const [salvandoNotas, setSalvandoNotas] = useState(false);

  // ── Aluno CRUD ────────────────────────────────────────────────────────────────
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [alunoModalOpen, setAlunoModalOpen] = useState(false);
  const [alunoModalMode, setAlunoModalMode] = useState<"create" | "edit">("create");
  
  const [formAlunoNome, setFormAlunoNome] = useState("");
  const [formAlunoMatricula, setFormAlunoMatricula] = useState("");
  const [formAlunoEmail, setFormAlunoEmail] = useState("");
  const [formAlunoNota, setFormAlunoNota] = useState(0);
  const [formAlunoFreq, setFormAlunoFreq] = useState(100);

  const handleOpenCreateAlunoModal = () => {
    setFormAlunoNome("");
    setFormAlunoMatricula("");
    setFormAlunoEmail("");
    setFormAlunoNota(0);
    setFormAlunoFreq(100);
    setAlunoModalMode("create");
    setAlunoModalOpen(true);
  };

  const handleOpenEditAlunoModal = (al: Aluno) => {
    setSelectedAluno(al);
    setFormAlunoNome(al.nome);
    setFormAlunoMatricula(al.matricula || "");
    setFormAlunoEmail(al.email || "");
    setFormAlunoNota(al.nota_media || 0);
    setFormAlunoFreq(al.taxa_frequencia || 100);
    setAlunoModalMode("edit");
    setAlunoModalOpen(true);
  };

  const handleSaveAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      if (alunoModalMode === "create") {
        const novo = await pedagogicoService.criarAluno(formAlunoNome, formAlunoMatricula, formAlunoEmail, id);
        if (formAlunoNota > 0 || formAlunoFreq < 100) {
          await pedagogicoService.editarAluno(novo.id, { nota_media: formAlunoNota, taxa_frequencia: formAlunoFreq });
        }
        toast.success("Aluno matriculado com sucesso!");
      } else if (selectedAluno) {
        await pedagogicoService.editarAluno(selectedAluno.id, {
          nome: formAlunoNome,
          matricula: formAlunoMatricula,
          email: formAlunoEmail,
          nota_media: formAlunoNota,
          taxa_frequencia: formAlunoFreq
        });
        toast.success("Dados do aluno atualizados com sucesso!");
      }
      setAlunoModalOpen(false);
      const data = await pedagogicoService.getAlunosTurma(id);
      setAlunos(data);
    } catch (err) {
      const error = err as Error;
      toast.error("Erro ao salvar dados do aluno: " + error.message);
    }
  };

  const handleDeleteAluno = async (alunoId: string) => {
    if (!confirm("Tem certeza que deseja desvincular/excluir este aluno da turma?")) return;
    try {
      await pedagogicoService.excluirAluno(alunoId);
      toast.success("Aluno excluído com sucesso!");
      if (id) {
        const data = await pedagogicoService.getAlunosTurma(id);
        setAlunos(data);
      }
    } catch (err) {
      const error = err as Error;
      toast.error("Erro ao excluir aluno: " + error.message);
    }
  };

  // Load Atividades
  useEffect(() => {
    if (!id) return;
    pedagogicoService.getAtividadesTurma(id).then(data => {
      setAtividades(data);
      if (data.length > 0) {
        setSelectedAtividade(data[0].id);
      }
    });
  }, [id, activeTab]);

  // Load existing grades when selectedActivity changes
  useEffect(() => {
    if (!selectedAtividade || !id) return;
    (async () => {
      try {
        const notasFlat = await pedagogicoService.getNotasTurma(id);
        const currentNotas = notasFlat.filter(n => n.atividade_id === selectedAtividade);
        const map: Record<string, { valor: string, feedback: string }> = {};
        alunos.forEach(al => {
          const match = currentNotas.find(n => n.aluno_id === al.id);
          map[al.id] = {
            valor: match ? String(match.valor) : "",
            feedback: match?.feedback ?? ""
          };
        });
        setNotasInput(map);
      } catch (err) {
        console.warn("Failed to load grades for activity", err);
      }
    })();
  }, [selectedAtividade, alunos, id]);

  const handleSalvarNotas = async () => {
    if (!selectedAtividade || !id) return;
    setSalvandoNotas(true);
    try {
      const promises = Object.entries(notasInput).map(([alunoId, data]) => {
        const val = data.valor.trim() === "" ? null : Number(data.valor);
        if (val !== null && !isNaN(val)) {
          return pedagogicoService.registrarNota(alunoId, selectedAtividade, val, data.feedback);
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      toast.success("Notas salvas com sucesso!");
      const updatedAlunos = await pedagogicoService.getAlunosTurma(id);
      setAlunos(updatedAlunos);
    } catch {
      toast.error("Erro ao salvar notas.");
    } finally {
      setSalvandoNotas(false);
    }
  };

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
    if (!id || (activeTab !== 'diario' && activeTab !== 'visao_geral')) return;
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

  const handleDeletarPostagem = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta postagem do mural?")) return;
    try {
      await pedagogicoService.deletarPostagemMural(postId);
      setPostagens(prev => prev.filter(p => p.id !== postId));
      toast.success("Postagem removida com sucesso!");
    } catch {
      toast.error("Erro ao remover postagem.");
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
    { id: 'visao_geral', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'mural', label: 'Mural da Turma', icon: FileText },
    { id: 'diario', label: 'Diário Rápido', icon: BookOpen },
    { id: 'frequencia', label: 'Chamada', icon: CheckCircle },
    { id: 'notas', label: 'Lançar Notas', icon: FileText },
    { id: 'alunos', label: 'Alunos', icon: Users },
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

        {/* ─── ABA VISÃO GERAL ───────────────────────────────────────────── */}
        {activeTab === 'visao_geral' && (
          <div className="space-y-8 animate-fade-in">
            {/* METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Users className="w-6 h-6" /></div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{alunos.length}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total de Alunos</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center"><FileText className="w-6 h-6" /></div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{planos.length || 8} Aulas</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Atividades Previstas</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle className="w-6 h-6" /></div>
                <div>
                  <p className="text-2xl font-black text-slate-800">
                    {alunos.length > 0 
                      ? Math.round(alunos.reduce((acc, curr) => acc + Number(curr.taxa_frequencia || 0), 0) / alunos.length)
                      : 92}%
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Frequência Média</p>
                </div>
              </div>
            </div>

            {/* SITUAÇÃO ACADÊMICA */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 text-xs uppercase tracking-wider">Situação Acadêmica da Turma</h3>
              <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" 
                      strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.80)} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" 
                      strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.15)} className="origin-center transform rotate-[288deg]" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12" 
                      strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.05)} className="origin-center transform rotate-[342deg]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-slate-800">80%</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Aprovados</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-1 gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Aprovados Direto: 80%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Em Recuperação: 15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Reprovados/Críticos: 5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DOUBLE COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* ALUNOS LIST WITH GRADES */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> Desempenho dos Alunos
                </h3>
                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-2 space-y-1">
                  {alunos.map(a => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-700 text-sm">{a.nome}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Matrícula: {a.matricula || "—"}</p>
                      </div>
                      <div className="text-right flex items-center gap-6 font-semibold">
                        <div>
                          <p className="text-[10px] text-slate-400 text-right">Média</p>
                          <p className={`text-sm font-bold ${Number(a.nota_media) >= 6 ? 'text-indigo-600' : 'text-red-500'}`}>
                            {Number(a.nota_media).toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 text-right">Frequência</p>
                          <p className="text-sm font-bold text-emerald-600">{Number(a.taxa_frequencia).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIMELINE / CRONOGRAMA */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-500" /> Cronograma de Atividades
                </h3>
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 max-h-[380px] overflow-y-auto pr-2">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Concluído</span>
                        <span className="text-[10px] font-semibold text-slate-400">28 Mai</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Simulado Geral de Álgebra</h4>
                      <p className="text-xs text-slate-500">Resolução de equações quadráticas e análise de gráficos.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm animate-pulse" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Pendente</span>
                        <span className="text-[10px] font-semibold text-slate-400">02 Jun</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Entrega de Lista de Exercícios</h4>
                      <p className="text-xs text-slate-500">Estudo de funções afins e exponenciais da ementa didática.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">Agendado</span>
                        <span className="text-[10px] font-semibold text-slate-400">05 Jun</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Prova Bimestral de Trigonometria</h4>
                      <p className="text-xs text-slate-500">Avaliação baseada no grounding didático do Moodle.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

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
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">P</div>
                        <div>
                          <h4 className="font-bold text-slate-800">Professor</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {new Date(p.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletarPostagem(p.id)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir postagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

        {/* ─── ABA LANÇAR NOTAS ───────────────────────────────────────────── */}
        {activeTab === 'notas' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-500" /> Lançamento de Notas
                </h2>
                <p className="text-sm text-slate-500 mt-1">Selecione a atividade e atribua as notas correspondentes</p>
              </div>
              <div className="flex items-center gap-4">
                {atividades.length > 0 ? (
                  <select
                    value={selectedAtividade}
                    onChange={e => setSelectedAtividade(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none bg-white max-w-xs font-semibold"
                  >
                    {atividades.map(a => (
                      <option key={a.id} value={a.id}>{a.titulo} (Peso {a.valor_maximo || 10})</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-rose-500 font-semibold">Nenhuma atividade cadastrada</span>
                )}
                
                <Button
                  id="btn-salvar-notas"
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                  onClick={handleSalvarNotas}
                  disabled={salvandoNotas || !selectedAtividade || alunos.length === 0}
                >
                  {salvandoNotas ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Notas
                </Button>
              </div>
            </div>

            {alunos.length === 0 ? (
              <div className="py-12 text-center text-slate-400">Nenhum aluno cadastrado nesta turma.</div>
            ) : !selectedAtividade ? (
              <div className="py-12 text-center text-slate-400">Nenhuma atividade disponível. Crie uma atividade em Planejamento.</div>
            ) : (
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-left uppercase text-slate-500">Aluno</th>
                      <th className="px-6 py-4 text-xs font-bold text-center uppercase text-slate-500 w-36">Nota</th>
                      <th className="px-6 py-4 text-xs font-bold text-left uppercase text-slate-500">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {alunos.map(a => (
                      <tr key={a.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                          <div>{a.nome}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Matrícula: {a.matricula || "—"}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max={atividades.find(at => at.id === selectedAtividade)?.valor_maximo || 10}
                            step="0.1"
                            value={notasInput[a.id]?.valor ?? ""}
                            onChange={e => setNotasInput(prev => ({
                              ...prev,
                              [a.id]: { ...prev[a.id], valor: e.target.value }
                            }))}
                            placeholder="0.0"
                            className="w-24 text-center border border-slate-200 rounded-xl px-2 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={notasInput[a.id]?.feedback ?? ""}
                            onChange={e => setNotasInput(prev => ({
                              ...prev,
                              [a.id]: { ...prev[a.id], feedback: e.target.value }
                            }))}
                            placeholder="Critérios de avaliação..."
                            className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── ABA ALUNOS ────────────────────────────────────────────────── */}
        {activeTab === 'alunos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Quadro Discente</h3>
                <p className="text-xs text-slate-500 font-medium">Matricule ou gerencie estudantes vinculados a esta turma.</p>
              </div>
              <Button
                onClick={handleOpenCreateAlunoModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100"
              >
                <Plus className="w-4 h-4 mr-2" /> Matricular Aluno
              </Button>
            </div>

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
                      <th className="px-6 py-4 text-xs font-bold text-center uppercase text-slate-500 w-28">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alunos.map(a => (
                      <tr key={a.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700 text-left">
                          <div>{a.nome}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{a.email || 'Sem e-mail cadastrado'}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-center text-slate-500">{a.matricula || "—"}</td>
                        <td className="px-6 py-4 text-sm font-bold text-center text-indigo-600">{Number(a.nota_media).toFixed(1)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-center text-emerald-600">{Number(a.taxa_frequencia).toFixed(0)}%</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditAlunoModal(a)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-900 transition hover:bg-slate-100 rounded-lg"
                              title="Editar Aluno"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAluno(a.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-950 transition hover:bg-rose-50 rounded-lg"
                              title="Remover Aluno"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Aluno CRUD Modal */}
      {alunoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-fade-in text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 font-display">
                {alunoModalMode === "create" ? "Matricular Novo Aluno" : "Editar Aluno"}
              </h3>
              <button 
                onClick={() => setAlunoModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAluno} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  value={formAlunoNome}
                  onChange={e => setFormAlunoNome(e.target.value)}
                  placeholder="Ex: Ana Beatriz Costa"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Matrícula (opcional)</label>
                <input
                  type="text"
                  value={formAlunoMatricula}
                  onChange={e => setFormAlunoMatricula(e.target.value)}
                  placeholder="Ex: 2026001"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Email (opcional)</label>
                <input
                  type="email"
                  value={formAlunoEmail}
                  onChange={e => setFormAlunoEmail(e.target.value)}
                  placeholder="Ex: ana.costa@aluno.hemera.edu"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Média Inicial</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formAlunoNota}
                    onChange={e => setFormAlunoNota(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Frequência (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formAlunoFreq}
                    onChange={e => setFormAlunoFreq(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl transition text-sm shadow-md"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setAlunoModalOpen(false)}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
