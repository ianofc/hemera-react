import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { pedagogicoService, Turma, Atividade } from "@/services/pedagogicoService";
import { PlanoDeAula } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays, Sparkles, Plus, Loader2, BookOpen, Clock, Target,
  ClipboardCheck, Calendar, Save, Trash2, BrainCircuit, Download,
  FileText, Copy, Check, Eye, Pencil
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabId = "planos" | "avaliacoes" | "ia_prova";

export default function Planejamento() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("planos");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // ── Planos de Aula States ───────────────────────────────────────────────────
  const [planos, setPlanos] = useState<PlanoDeAula[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<PlanoDeAula | null>(null);
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [modalDetalheOpen, setModalDetalheOpen] = useState(false);
  const [temaIA, setTemaIA] = useState("");
  const [gerandoIA, setGerandoIA] = useState(false);

  // Manual Plano States
  const [modalPlanoOpen, setModalPlanoOpen] = useState(false);
  const [planoModalMode, setPlanoModalMode] = useState<"create" | "edit">("create");
  const [editingPlanoId, setEditingPlanoId] = useState<string | null>(null);
  const [planoTitulo, setPlanoTitulo] = useState("");
  const [planoConteudo, setPlanoConteudo] = useState("");
  const [planoHabilidades, setPlanoHabilidades] = useState("");
  const [planoObjetivos, setPlanoObjetivos] = useState("");
  const [planoDuracao, setPlanoDuracao] = useState("1 aula");
  const [planoRecursos, setPlanoRecursos] = useState("");
  const [planoMetodologia, setPlanoMetodologia] = useState("");
  const [planoAvaliacao, setPlanoAvaliacao] = useState("");
  const [planoDataPrevista, setPlanoDataPrevista] = useState("");
  const [planoStatus, setPlanoStatus] = useState("Pendente");
  const [savingPlano, setSavingPlano] = useState(false);

  // ── Avaliações / Atividades States ──────────────────────────────────────────
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [modalAtividadeOpen, setModalAtividadeOpen] = useState(false);
  const [activityModalMode, setActivityModalMode] = useState<"create" | "edit">("create");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [savingAtividade, setSavingAtividade] = useState(false);
  const [tituloAtividade, setTituloAtividade] = useState("");
  const [descricaoAtividade, setDescricaoAtividade] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [valorMaximo, setValorMaximo] = useState("10");
  const [unidadeAtividade, setUnidadeAtividade] = useState("1ª Unidade");
  const [tipoAtividade, setTipoAtividade] = useState("Atividade");

  // ── Gerador de Provas States ────────────────────────────────────────────────
  const [instrucoesProva, setInstrucoesProva] = useState("");
  const [gerandoProva, setGerandoProva] = useState(false);
  const [provaGerada, setProvaGerada] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Sync tab with pathname on load/change
  useEffect(() => {
    if (location.pathname.includes("avaliacoes")) {
      setActiveTab("avaliacoes");
    } else if (location.pathname.includes("ia/prova") || location.pathname.includes("prova")) {
      setActiveTab("ia_prova");
    } else {
      setActiveTab("planos");
    }
  }, [location.pathname]);

  const loadTurmas = useCallback(async () => {
    try {
      const data = await pedagogicoService.getTurmasProfessor();
      setTurmas(data);
      if (data.length > 0) {
        setSelectedTurma(data[0].id);
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar as turmas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadPlanos = useCallback(async (turmaId: string) => {
    try {
      setLoading(true);
      const data = await pedagogicoService.getPlanosDeAula(turmaId);
      setPlanos(data);
    } catch {
      console.warn("Falha ao carregar planos de aula.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAtividades = useCallback(async (turmaId: string) => {
    try {
      setLoading(true);
      const data = await pedagogicoService.getAtividadesTurma(turmaId);
      setAtividades(data);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar avaliações.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load classes initially
  useEffect(() => {
    loadTurmas();
  }, [loadTurmas]);

  // Fetch relevant data when selected class or active tab changes
  useEffect(() => {
    if (!selectedTurma) return;
    if (activeTab === "planos") {
      loadPlanos(selectedTurma);
    } else if (activeTab === "avaliacoes") {
      loadAtividades(selectedTurma);
    }
  }, [selectedTurma, activeTab, loadPlanos, loadAtividades]);

  // ── Planos de Aula Handlers ─────────────────────────────────────────────────
  const handleGerarPlanoIA = async () => {
    if (!temaIA.trim() || !selectedTurma) return;
    setGerandoIA(true);
    try {
      const turmaInfo = turmas.find(t => t.id === selectedTurma);
      const planoGerado = await pedagogicoService.gerarPlanoIA(temaIA, turmaInfo?.nome || "");
      
      await pedagogicoService.criarPlanoDeAula({
        turma_id: selectedTurma,
        titulo: planoGerado.titulo || temaIA,
        conteudo: planoGerado.conteudo,
        habilidades_bncc: planoGerado.habilidades_bncc,
        objetivos: planoGerado.objetivos,
        duracao: planoGerado.duracao || "1 aula",
        recursos: planoGerado.recursos,
        metodologia: planoGerado.metodologia,
        avaliacao: planoGerado.avaliacao,
        data_prevista: new Date().toISOString().split("T")[0],
        status: "Planejado"
      });

      toast({ title: "Sucesso!", description: "Plano gerado com Inteligência Artificial e salvo." });
      setModalIAOpen(false);
      setTemaIA("");
      loadPlanos(selectedTurma);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro na IA", description: msg, variant: "destructive" });
    } finally {
      setGerandoIA(false);
    }
  };

  const openPlanoDetalhes = (plano: PlanoDeAula) => {
    setSelectedPlano(plano);
    setModalDetalheOpen(true);
  };

  const handleLancarAtividadeDePlano = (plano: PlanoDeAula) => {
    // Prefill fields
    setTituloAtividade(plano.titulo);
    setDescricaoAtividade(
      `Atividade baseada no plano de aula.\n\nObjetivos: ${plano.objetivos || ""}\nConteúdo: ${plano.conteudo || ""}\nAvaliação: ${plano.avaliacao || ""}`
    );
    setDataEntrega(new Date().toISOString().split("T")[0]);
    setValorMaximo("10");
    setActivityModalMode("create");
    setSelectedActivityId(null);
    
    // Switch to activities tab and open creation modal
    setActiveTab("avaliacoes");
    setModalAtividadeOpen(true);
  };

  const handleOpenCreatePlano = () => {
    setPlanoModalMode("create");
    setEditingPlanoId(null);
    setPlanoTitulo("");
    setPlanoConteudo("");
    setPlanoHabilidades("");
    setPlanoObjetivos("");
    setPlanoDuracao("1 aula");
    setPlanoRecursos("");
    setPlanoMetodologia("");
    setPlanoAvaliacao("");
    setPlanoDataPrevista(new Date().toISOString().split("T")[0]);
    setPlanoStatus("Pendente");
    setModalPlanoOpen(true);
  };

  const handleOpenEditPlano = (plano: PlanoDeAula) => {
    setPlanoModalMode("edit");
    setEditingPlanoId(plano.id);
    setPlanoTitulo(plano.titulo || "");
    setPlanoConteudo(plano.conteudo || "");
    setPlanoHabilidades(plano.habilidades_bncc || "");
    setPlanoObjetivos(plano.objetivos || "");
    setPlanoDuracao(plano.duracao || "1 aula");
    setPlanoRecursos(plano.recursos || "");
    setPlanoMetodologia(plano.metodologia || "");
    setPlanoAvaliacao(plano.avaliacao || "");
    setPlanoDataPrevista(plano.data_prevista ? new Date(plano.data_prevista).toISOString().split("T")[0] : "");
    setPlanoStatus(plano.status || "Pendente");
    setModalPlanoOpen(true);
  };

  const handleSavePlano = async () => {
    if (!planoTitulo || !planoDataPrevista) {
      toast({ title: "Erro", description: "Preencha o título e a data prevista.", variant: "destructive" });
      return;
    }
    setSavingPlano(true);
    try {
      const payload = {
        titulo: planoTitulo,
        conteudo: planoConteudo,
        habilidades_bncc: planoHabilidades,
        objetivos: planoObjetivos,
        duracao: planoDuracao,
        recursos: planoRecursos,
        metodologia: planoMetodologia,
        avaliacao: planoAvaliacao,
        data_prevista: planoDataPrevista,
        status: planoStatus,
        turma_id: selectedTurma,
      };

      if (planoModalMode === "create") {
        await pedagogicoService.criarPlanoDeAula(payload);
        toast({ title: "Sucesso!", description: "Plano de aula criado com sucesso!" });
      } else if (planoModalMode === "edit" && editingPlanoId) {
        await pedagogicoService.atualizarPlano(editingPlanoId, payload);
        toast({ title: "Sucesso!", description: "Plano de aula atualizado com sucesso!" });
      }
      setModalPlanoOpen(false);
      loadPlanos(selectedTurma);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro", description: "Falha ao salvar plano: " + msg, variant: "destructive" });
    } finally {
      setSavingPlano(false);
    }
  };

  const handleDeletarPlano = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este plano de aula?")) return;
    try {
      await pedagogicoService.deletarPlano(id);
      toast({ title: "Sucesso", description: "Plano de aula removido." });
      loadPlanos(selectedTurma);
    } catch {
      toast({ title: "Erro", description: "Falha ao remover plano de aula.", variant: "destructive" });
    }
  };

  // ── Avaliações / Atividades Handlers ────────────────────────────────────────
  const handleOpenEditActivity = (activity: Atividade) => {
    setActivityModalMode("edit");
    setSelectedActivityId(activity.id);

    let coreTitle = activity.titulo;
    let detectedUnidade = "1ª Unidade";
    const titleMatch = activity.titulo.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (titleMatch) {
      detectedUnidade = titleMatch[1];
      coreTitle = titleMatch[2];
    }

    let coreDesc = activity.descricao || "";
    let detectedTipo = "Atividade";
    if (activity.descricao) {
      const parts = activity.descricao.split("\n\n");
      if (parts.length >= 2) {
        if (parts[0].includes("Unidade:") || parts[0].includes("Tipo:")) {
          const metaLines = parts[0].split("\n");
          metaLines.forEach(line => {
            if (line.startsWith("Tipo: ")) {
              detectedTipo = line.replace("Tipo: ", "").trim();
            }
          });
          coreDesc = parts.slice(1).join("\n\n");
        }
      }
    }

    setTituloAtividade(coreTitle);
    setDescricaoAtividade(coreDesc);
    setDataEntrega(activity.data_entrega ? new Date(activity.data_entrega).toISOString().split("T")[0] : "");
    setValorMaximo(String(activity.valor_maximo || 10));
    setUnidadeAtividade(detectedUnidade);
    setTipoAtividade(detectedTipo);

    setModalAtividadeOpen(true);
  };

  const handleSaveAtividade = async () => {
    if (!tituloAtividade || !dataEntrega) {
      toast({ title: "Erro", description: "Preencha o título e a data de entrega.", variant: "destructive" });
      return;
    }

    setSavingAtividade(true);
    try {
      const payload = {
        titulo: `[${unidadeAtividade}] ${tituloAtividade}`,
        descricao: `Unidade: ${unidadeAtividade}\nTipo: ${tipoAtividade}\n\n${descricaoAtividade}`,
        data_entrega: dataEntrega,
        disciplina_id: null,
        turma_id: selectedTurma,
        valor_maximo: Number(valorMaximo) || 10,
      };

      if (activityModalMode === "create") {
        await pedagogicoService.criarAtividade(payload);
        toast({ title: "Sucesso!", description: "Avaliação cadastrada com sucesso!" });
      } else if (activityModalMode === "edit" && selectedActivityId) {
        await pedagogicoService.editarAtividade(selectedActivityId, payload);
        toast({ title: "Sucesso!", description: "Avaliação atualizada com sucesso!" });
      }

      setModalAtividadeOpen(false);
      setTituloAtividade("");
      setDescricaoAtividade("");
      setDataEntrega("");
      setValorMaximo("10");
      setUnidadeAtividade("1ª Unidade");
      setTipoAtividade("Atividade");
      loadAtividades(selectedTurma);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro", description: "Falha ao salvar avaliação: " + msg, variant: "destructive" });
    } finally {
      setSavingAtividade(false);
    }
  };

  const handleDeletarAtividade = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta avaliação?")) return;
    try {
      await pedagogicoService.deletarAtividade(id);
      toast({ title: "Sucesso", description: "Avaliação removida." });
      loadAtividades(selectedTurma);
    } catch {
      toast({ title: "Erro", description: "Falha ao remover avaliação.", variant: "destructive" });
    }
  };

  // ── Gerador de Provas Handlers ──────────────────────────────────────────────
  const handleGerarProva = async () => {
    if (!selectedTurma || !instrucoesProva.trim()) return;
    setGerandoProva(true);
    setProvaGerada(null);
    try {
      const resultado = await pedagogicoService.gerarProvaIA(selectedTurma, instrucoesProva);
      setProvaGerada(resultado);
      toast({ title: "Sucesso!", description: "Prova gerada com base no histórico da turma." });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro na IA";
      toast({ title: "Erro na IA", description: msg, variant: "destructive" });
    } finally {
      setGerandoProva(false);
    }
  };

  const handleDownloadProva = () => {
    if (!provaGerada) return;
    const blob = new Blob([provaGerada], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Prova_Gerada_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopiarProva = async () => {
    if (!provaGerada) return;
    await navigator.clipboard.writeText(provaGerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-down pt-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Planejamento Pedagógico</h1>
          <p className="text-slate-500 mt-1">Elabore planos de aula, organize avaliações e gere exames usando IA.</p>
        </div>

        {/* Global Class Filter */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm">
          <Label className="text-slate-600 font-semibold text-sm whitespace-nowrap">Turma Ativa:</Label>
          <Select value={selectedTurma} onValueChange={setSelectedTurma}>
            <SelectTrigger className="border-none shadow-none font-bold text-slate-800 focus:ring-0 p-0 h-auto gap-2">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {turmas.map(t => (
                <SelectItem key={t.id} value={t.id} className="font-semibold">{t.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* MODERN INTERACTIVE TABS */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => {
            setActiveTab("planos");
            navigate("/professor/planejamento");
          }}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "planos"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Planos de Aula
        </button>
        <button
          onClick={() => {
            setActiveTab("avaliacoes");
            navigate("/professor/avaliacoes");
          }}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "avaliacoes"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Avaliações & Atividades
        </button>
        <button
          onClick={() => {
            setActiveTab("ia_prova");
            navigate("/professor/ia/prova");
          }}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "ia_prova"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Gerador de Provas (IA)
        </button>
      </div>

      {/* TAB CONTENT RENDER */}
      {loading && turmas.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* ────────────────── PLANOS DE AULA TAB ────────────────── */}
          {activeTab === "planos" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-sm text-slate-500 font-medium">
                  {planos.length} {planos.length === 1 ? "plano encontrado" : "planos encontrados"}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOpenCreatePlano}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Criar Manualmente
                  </Button>
                  <Dialog open={modalIAOpen} onOpenChange={setModalIAOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-md">
                        <Sparkles className="w-4 h-4 mr-2" /> Gerar com IA
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-700 font-bold">
                          <Sparkles className="w-5 h-5" /> Assistente de Planejamento (Thorth)
                        </DialogTitle>
                        <DialogDescription>
                          Descreva o tema da aula. A IA analisará o perfil pedagógico da turma e montará o plano de aula estruturado.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="font-semibold text-slate-700">Tema ou Conteúdo da Aula</Label>
                          <Textarea
                            placeholder="Ex: Revolução Industrial com foco nos impactos sociais na Europa do século XIX..."
                            value={temaIA}
                            onChange={(e) => setTemaIA(e.target.value)}
                            className="h-24 resize-none border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleGerarPlanoIA}
                        disabled={gerandoIA || !temaIA.trim() || !selectedTurma}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold"
                      >
                        {gerandoIA ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {gerandoIA ? "Mapeando BNCC e gerando..." : "Gerar Plano Estruturado"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {planos.length === 0 ? (
                <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl">
                  <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700">Nenhum plano encontrado</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                    Você ainda não planejou aulas para esta turma. Comece criando um plano.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" className="border-indigo-200 text-indigo-600" onClick={handleOpenCreatePlano}>
                      Criar Manualmente
                    </Button>
                    <Button variant="outline" className="border-indigo-200 text-indigo-600" onClick={() => setModalIAOpen(true)}>
                      Gerar com IA
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {planos.map((plano) => (
                    <Card key={plano.id} className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-slate-200/60 overflow-hidden relative flex flex-col justify-between">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-md mb-2">
                            {new Date(plano.data_prevista).toLocaleDateString("pt-BR")}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenEditPlano(plano)}
                              className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition"
                              title="Editar Plano"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletarPlano(plano.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition"
                              title="Excluir Plano"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <CardTitle className="text-base font-bold text-slate-800 line-clamp-2 leading-snug">
                          {plano.titulo}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1 text-slate-500 text-xs">
                          {plano.objetivos || "Sem objetivos definidos."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-col gap-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Duração: {plano.duracao || "-"}</span>
                          </div>
                          {plano.habilidades_bncc && (
                            <div className="flex items-center gap-2">
                              <Target className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">BNCC: {plano.habilidades_bncc}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="ghost"
                            className="flex-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs"
                            onClick={() => openPlanoDetalhes(plano)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Detalhes
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleLancarAtividadeDePlano(plano)}
                            className="flex-1 text-xs font-bold bg-slate-100 hover:bg-slate-200"
                          >
                            Lançar Atividade
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* DETALHE MODAL */}
              <Dialog open={modalDetalheOpen} onOpenChange={setModalDetalheOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                  {selectedPlano && (
                    <>
                      <DialogHeader className="border-b border-slate-100 pb-4">
                        <DialogTitle className="text-xl font-bold text-slate-800">{selectedPlano.titulo}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                            Data: {new Date(selectedPlano.data_prevista).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-slate-400 text-xs">| Duração: {selectedPlano.duracao}</span>
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4 text-sm text-slate-700">
                        {selectedPlano.objetivos && (
                          <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Objetivos de Aprendizagem</h4>
                            <p className="leading-relaxed text-slate-600">{selectedPlano.objetivos}</p>
                          </div>
                        )}
                        {selectedPlano.habilidades_bncc && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Habilidades BNCC</h4>
                            <p className="bg-indigo-50/50 text-indigo-700 p-2 rounded-lg font-mono text-xs font-bold inline-block">
                              {selectedPlano.habilidades_bncc}
                            </p>
                          </div>
                        )}
                        {selectedPlano.conteudo && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Conteúdo Programático</h4>
                            <p className="whitespace-pre-line leading-relaxed text-slate-600">{selectedPlano.conteudo}</p>
                          </div>
                        )}
                        {selectedPlano.metodologia && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Metodologia / Procedimentos</h4>
                            <p className="whitespace-pre-line leading-relaxed text-slate-600">{selectedPlano.metodologia}</p>
                          </div>
                        )}
                        {selectedPlano.recursos && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recursos Didáticos</h4>
                            <p className="leading-relaxed text-slate-600">{selectedPlano.recursos}</p>
                          </div>
                        )}
                        {selectedPlano.avaliacao && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Critérios de Avaliação</h4>
                            <p className="leading-relaxed text-slate-600">{selectedPlano.avaliacao}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              {/* MANUAL PLAN MODAL */}
              <Dialog open={modalPlanoOpen} onOpenChange={setModalPlanoOpen}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-bold text-slate-800">
                      {planoModalMode === "create" ? "Criar Plano de Aula" : "Editar Plano de Aula"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha as informações detalhadas sobre a aula planejada.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 text-left">
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Título do Plano de Aula</Label>
                      <Input value={planoTitulo} onChange={e => setPlanoTitulo(e.target.value)} placeholder="Ex: Introdução à Função Afim" className="rounded-xl border-slate-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-slate-700">Data Prevista</Label>
                        <Input type="date" value={planoDataPrevista} onChange={e => setPlanoDataPrevista(e.target.value)} className="rounded-xl border-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-slate-700">Duração</Label>
                        <Input value={planoDuracao} onChange={e => setPlanoDuracao(e.target.value)} placeholder="Ex: 2 aulas (100 min)" className="rounded-xl border-slate-200" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-slate-700">Habilidades BNCC</Label>
                        <Input value={planoHabilidades} onChange={e => setPlanoHabilidades(e.target.value)} placeholder="Ex: EM13MAT301" className="rounded-xl border-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-slate-700">Status</Label>
                        <select
                          value={planoStatus}
                          onChange={e => setPlanoStatus(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Planejado">Planejado</option>
                          <option value="Agendada">Agendada</option>
                          <option value="Ministrada">Ministrada</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Objetivos de Aprendizagem</Label>
                      <Textarea value={planoObjetivos} onChange={e => setPlanoObjetivos(e.target.value)} placeholder="Objetivos do plano..." className="h-16 resize-none border-slate-200 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Conteúdo Programático</Label>
                      <Textarea value={planoConteudo} onChange={e => setPlanoConteudo(e.target.value)} placeholder="Conteúdo..." className="h-16 resize-none border-slate-200 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Metodologia</Label>
                      <Textarea value={planoMetodologia} onChange={e => setPlanoMetodologia(e.target.value)} placeholder="Metodologia..." className="h-16 resize-none border-slate-200 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Recursos Didáticos</Label>
                      <Input value={planoRecursos} onChange={e => setPlanoRecursos(e.target.value)} placeholder="Ex: Projetor, quadro, material impresso" className="rounded-xl border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Avaliação</Label>
                      <Textarea value={planoAvaliacao} onChange={e => setPlanoAvaliacao(e.target.value)} placeholder="Critérios de avaliação..." className="h-16 resize-none border-slate-200 rounded-xl" />
                    </div>
                  </div>
                  <Button onClick={handleSavePlano} disabled={savingPlano} className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold">
                    {savingPlano ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {planoModalMode === "create" ? "Criar Plano" : "Salvar Alterações"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* ────────────────── AVALIAÇÕES & ATIVIDADES TAB ────────────────── */}
          {activeTab === "avaliacoes" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-sm text-slate-500 font-medium">
                  {atividades.length} {atividades.length === 1 ? "avaliação cadastrada" : "avaliações cadastradas"}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setActivityModalMode("create");
                      setSelectedActivityId(null);
                      setTituloAtividade("");
                      setDescricaoAtividade("");
                      setDataEntrega("");
                      setValorMaximo("10");
                      setUnidadeAtividade("1ª Unidade");
                      setTipoAtividade("Atividade");
                      setModalAtividadeOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Nova Avaliação
                  </Button>
                  <Dialog open={modalAtividadeOpen} onOpenChange={setModalAtividadeOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-bold text-slate-800">
                          {activityModalMode === "create" ? "Cadastrar Avaliação" : "Editar Avaliação"}
                        </DialogTitle>
                        <DialogDescription>
                          {activityModalMode === "create"
                            ? "Cadastre provas ou trabalhos. Ela será listada no boletim da turma."
                            : "Edite as informações da avaliação."}
                        </DialogDescription>
                      </DialogHeader>
                       <div className="space-y-4 py-4 text-left">
                        <div className="space-y-2">
                          <Label className="font-semibold text-slate-700">Título</Label>
                          <Input value={tituloAtividade} onChange={e => setTituloAtividade(e.target.value)} placeholder="Ex: Prova Bimestral 1" className="rounded-xl border-slate-200 focus:ring-indigo-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Unidade Acadêmica</Label>
                            <select
                              value={unidadeAtividade}
                              onChange={e => setUnidadeAtividade(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="1ª Unidade">1ª Unidade</option>
                              <option value="2ª Unidade">2ª Unidade</option>
                              <option value="3ª Unidade">3ª Unidade</option>
                              <option value="4ª Unidade">4ª Unidade</option>
                              <option value="Recuperação">Recuperação</option>
                              <option value="Exame Final">Exame Final</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Tipo de Avaliação</Label>
                            <select
                              value={tipoAtividade}
                              onChange={e => setTipoAtividade(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="Atividade">Atividade / Exercício</option>
                              <option value="Prova">Prova / Teste</option>
                              <option value="Trabalho">Trabalho / Projeto</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Data Limite/Entrega</Label>
                            <Input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="rounded-xl border-slate-200 focus:ring-indigo-500" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Valor Máximo / Peso</Label>
                            <Input type="number" value={valorMaximo} onChange={e => setValorMaximo(e.target.value)} className="rounded-xl border-slate-200 focus:ring-indigo-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold text-slate-700">Instruções / Descrição</Label>
                          <Textarea value={descricaoAtividade} onChange={e => setDescricaoAtividade(e.target.value)} placeholder="Instruções para os alunos e critérios..." className="h-20 resize-none border-slate-200 rounded-xl focus:ring-indigo-500" />
                        </div>
                      </div>
                      <Button onClick={handleSaveAtividade} disabled={savingAtividade} className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold">
                        {savingAtividade ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {activityModalMode === "create" ? "Salvar Avaliação" : "Salvar Alterações"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {atividades.length === 0 ? (
                <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl">
                  <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700">Nenhuma avaliação cadastrada</h3>
                  <p className="text-slate-500 mt-1 mb-6">Cadastre provas ou trabalhos para lançar notas.</p>
                  <Button variant="outline" className="border-indigo-200 text-indigo-600" onClick={() => {
                    setActivityModalMode("create");
                    setSelectedActivityId(null);
                    setTituloAtividade("");
                    setDescricaoAtividade("");
                    setDataEntrega("");
                    setValorMaximo("10");
                    setUnidadeAtividade("1ª Unidade");
                    setTipoAtividade("Atividade");
                    setModalAtividadeOpen(true);
                  }}>
                    Criar primeira avaliação
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {atividades.map((ativ) => (
                    <Card key={ativ.id} className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-slate-200/60 overflow-hidden relative flex flex-col justify-between">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-md mb-2 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ativ.data_entrega).toLocaleDateString("pt-BR")}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenEditActivity(ativ)}
                              className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition"
                              title="Editar Avaliação"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletarAtividade(ativ.id)}
                              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition"
                              title="Excluir Avaliação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <CardTitle className="text-base font-bold text-slate-800 line-clamp-1 leading-snug">{ativ.titulo}</CardTitle>
                        <CardDescription className="line-clamp-3 mt-1 text-slate-500 text-xs min-h-[48px]">
                          {ativ.descricao || "Sem instruções definidas."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="border-t border-slate-100 pt-3 flex gap-2">
                          <Link to={`/professor/turma/${selectedTurma}`} className="flex-1">
                            <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs">
                              Ir p/ Notas da Turma
                            </Button>
                          </Link>
                          <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 rounded-xl border border-slate-100">
                            Valor: {ativ.valor_maximo || 10} pts
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ────────────────── GERADOR DE PROVAS (IA) TAB ────────────────── */}
          {activeTab === "ia_prova" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuration panel */}
              <Card className="border-slate-200/80 shadow-sm rounded-3xl overflow-hidden flex flex-col justify-between">
                <div>
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-indigo-600" /> Parâmetros de Formulação
                    </CardTitle>
                    <CardDescription>A IA cruzará o conteúdo dos planos de aula já ministrados e o rendimento da turma para gerar as questões.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Instruções e Temas</Label>
                      <Textarea
                        placeholder="Ex: Formule 5 questões discursivas e 5 de múltipla escolha sobre Primeira Guerra Mundial, com o gabarito comentado ao final..."
                        value={instrucoesProva}
                        onChange={(e) => setInstrucoesProva(e.target.value)}
                        className="h-44 resize-none border-slate-200 rounded-2xl focus:ring-indigo-500"
                      />
                    </div>
                  </CardContent>
                </div>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-6 rounded-2xl shadow-lg shadow-indigo-100"
                      onClick={handleGerarProva}
                      disabled={gerandoProva || !selectedTurma || !instrucoesProva.trim()}
                    >
                      {gerandoProva ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                      {gerandoProva ? "Gerando Exame e Gabarito..." : "Iniciar Formulação por IA"}
                    </Button>

                    {provaGerada && (
                      <div className="flex gap-2 animate-fade-in">
                        <Button variant="outline" className="flex-1 text-indigo-600 border-indigo-200 rounded-xl font-bold py-5 hover:bg-indigo-50" onClick={handleCopiarProva}>
                          {copiado ? <Check className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copiado ? "Copiado!" : "Copiar Prova"}
                        </Button>
                        <Button variant="outline" className="flex-1 text-slate-600 border-slate-200 rounded-xl font-bold py-5 hover:bg-slate-100" onClick={handleDownloadProva}>
                          <Download className="w-4 h-4 mr-2" /> Exportar MD
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Live result view */}
              <Card className="border-slate-200/80 shadow-sm rounded-3xl overflow-hidden bg-white flex flex-col">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" /> Conteúdo da Prova
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative min-h-[450px]">
                  {gerandoProva && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center">
                      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                      <p className="text-slate-800 font-bold text-base">Alinhando com a BNCC e Histórico...</p>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-xs">Isso pode levar de 15 a 30 segundos enquanto estruturamos os critérios pedagógicos.</p>
                    </div>
                  )}

                  {!provaGerada && !gerandoProva && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <Sparkles className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="font-bold text-slate-600">Visualizador de Provas</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">A visualização em tempo real e a estruturação formatada serão renderizadas aqui.</p>
                    </div>
                  )}

                  {provaGerada && !gerandoProva && (
                    <div className="overflow-y-auto max-h-[600px] p-6 prose prose-slate prose-sm max-w-none
                      prose-headings:font-bold prose-headings:text-slate-800
                      prose-h1:text-xl prose-h1:border-b prose-h1:pb-2 prose-h1:border-slate-200
                      prose-h2:text-lg prose-h2:mt-5
                      prose-h3:text-base prose-h3:text-slate-700
                      prose-strong:text-slate-900 prose-strong:font-bold
                      prose-ol:space-y-1 prose-ul:space-y-1
                      prose-li:text-slate-700
                      prose-hr:border-slate-300 prose-hr:my-4
                      prose-blockquote:border-l-indigo-400 prose-blockquote:bg-indigo-50/50 prose-blockquote:p-3 prose-blockquote:rounded-r-xl"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {provaGerada}
                      </ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
