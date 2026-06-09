import React, { useState, useEffect, useRef } from "react";
import { 
  BrainCircuit, Bot, Eye, Layers, Zap, Shield, Play, 
  Terminal, RefreshCw, Cpu, Database, Network, KeyRound, 
  AlertOctagon, CheckCircle2, Sliders, HardDrive, 
  Activity, ArrowUpRight, Search, Plus, Trash2, ShieldCheck, HeartPulse,
  Sparkles, User, Calendar, BookOpen, MessageSquare, ShieldAlert, Send, Newspaper, BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

// URL do Serviço PentaIA FastAPI
const VITE_AI_URL = import.meta.env.VITE_AI_URL || "http://localhost:8001";
const SERVICE_TOKEN = "segredo_super_secreto_da_prefeitura_2025";

// Mock data: IRIS Sentiment analysis
const IRIS_SENTIMENT_DATA = [
  { name: "Post Fitness", positivo: 85, neutro: 10, negativo: 5 },
  { name: "Post Academia", positivo: 92, neutro: 6, negativo: 2 },
  { name: "Post Psicologia", positivo: 78, neutro: 15, negativo: 7 },
  { name: "Q&A Stories", positivo: 88, neutro: 9, negativo: 3 },
];

// Mock data: MERCÚRIO Gorjeio handshake logs
const MERCURIO_HANDSHAKE_LOGS = [
  { id: "gh1", time: "21:40:12", event: "Gorjeio E2EE Handshake inicializado", device: "Desktop-Ian (Windows)" },
  { id: "gh2", time: "21:40:15", event: "Chave pública do nó PentaIA trocada via Diffie-Hellman", device: "PentaIA-Mercúrio" },
  { id: "gh3", time: "21:42:01", event: "Mensagens salvas sincronizadas via canal seguro", device: "Mobile-Ian (iOS)" },
];

// Mock data: HEIMDALL backups and active snapshots
const HEIMDALL_SNAPSHOTS = [
  { id: "s1", time: "21:30:00", project: "Hortus Innocentiae Database", size: "148 MB", status: "Integridade OK" },
  { id: "s2", time: "21:00:00", project: "NioCortex Core Configuration", size: "42 KB", status: "Integridade OK" },
  { id: "s3", time: "18:00:00", project: "Empire Benvik Story Scripts", size: "2.4 MB", status: "Integridade OK" },
];

export default function PentaIADashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // PENTAIA States
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash");
  const [giseleStats, setGiseleStats] = useState({
    followers: "125K",
    sentiment: "91% Positivo",
    postsThisWeek: 8
  });
  const [pautaResult, setPautaResult] = useState<string | null>(null);

  // ZIOS States (Chatbot & Second Mind)
  const [ziosNotes, setZiosNotes] = useState<any[]>([]);
  const [ziosMessages, setZiosMessages] = useState<Array<{ sender: "user" | "zios"; text: string }>>([
    { sender: "zios", text: "Olá Ian! Sou o ZIOS (Life OS). Como posso te ajudar com a sua rotina, códigos ou cronograma CEEPS hoje?" }
  ]);
  const [ziosInput, setZiosInput] = useState("");
  const [sendingZios, setSendingZios] = useState(false);
  const [routineChecked, setRoutineChecked] = useState<Record<string, boolean>>({
    iuza: true,
    benjamim: false,
    benicio: false,
    ceeps: true,
    empire: false
  });
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteType, setNewNoteType] = useState("Geral");

  // IRIS States (Sentiment & External News)
  const [sentimentData] = useState(IRIS_SENTIMENT_DATA);
  const [uiAuditResult, setUiAuditResult] = useState<string | null>(null);
  const [irisNews, setIrisNews] = useState<any[]>([]);
  const [fetchingNews, setFetchingNews] = useState(false);

  // TAS States (Accubens / Moodle Courses)
  const [tasWeights, setTasWeights] = useState({
    talamus: 80,   // Ingestão e Triagem
    accubens: 90,  // Recompensa e Retenção
    sara: 70       // Prioridade e Alerta
  });
  const [localResonance, setLocalResonance] = useState(true);
  const [tasRecommendations, setTasRecommendations] = useState<any[]>([]);
  const [fetchingRecs, setFetchingRecs] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>(["História", "Programação", "Robótica", "Teologia"]);
  const [newPreference, setNewPreference] = useState("");

  // MERCÚRIO States (Reminders & News Feed)
  const [mercurioReminders, setMercurioReminders] = useState([
    { id: 1, text: "Lançar notas do 2º Bimestre para Turma A (CEEPS)", date: "Hoje" },
    { id: 2, text: "Revisar colisão de física no Hortus Innocentiae", date: "Amanhã" },
    { id: 3, text: "Alinhamento pedagógico com coordenação", date: "Segunda-feira" }
  ]);
  const [newReminderText, setNewReminderText] = useState("");

  // HEIMDALL States
  const [gjallarhornActive, setGjallarhornActive] = useState(false);
  const [snapshots, setSnapshots] = useState(HEIMDALL_SNAPSHOTS);
  const [blacklistedIps, setBlacklistedIps] = useState(["185.220.101.5", "45.132.22.189"]);
  const [checkIp, setCheckIp] = useState("");
  const [ipVerdict, setIpVerdict] = useState<any>(null);

  // Carrega as Notas do Second Mind no Supabase
  const loadZiosNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("conhecimento_contexto")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      if (data) {
        const formatted = data.map((n: any) => ({
          id: n.id,
          date: new Date(n.created_at).toLocaleDateString("pt-BR"),
          type: n.metadata?.type || "Geral",
          title: n.titulo,
          words: `${n.conteudo_raw ? n.conteudo_raw.split(/\s+/).length : 0} palavras`
        }));
        setZiosNotes(formatted);
      }
    } catch (err) {
      console.error("Erro ao buscar notas da Segunda Mente:", err);
    }
  };

  useEffect(() => {
    loadZiosNotes();
  }, []);

  // Auto-scroll do chat ZIOS
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ziosMessages]);

  // Sincronização geral
  const handleSyncSystems = () => {
    setLoading(true);
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: "Sincronizando barramentos da PentaIA...",
      success: () => {
        setLoading(false);
        return "Sincronização concluída! Todos os subsistemas operando em harmonia.";
      },
      error: "Erro na sincronização."
    });
  };

  // Gerar pauta real para Gisele Oliveira
  const generateGiselePauta = async () => {
    setPautaResult("Gerando pauta de conteúdo...");
    try {
      const response = await fetch(`${VITE_AI_URL}/v1/chat/interact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Token": SERVICE_TOKEN
        },
        body: JSON.stringify({
          message: "Crie uma pauta de conteúdo para o Instagram da influenciadora digital Gisele Oliveira. Foque em hábitos saudáveis de academia e controle dopaminérgico. Inclua uma sugestão de legenda e orientação de imagem em formato de tópicos.",
          role: "Gestor de Persona (Gisele)",
          user_name: "Ian Santos",
          context: {
            selected_model: selectedModel,
            followers: giseleStats.followers
          }
        })
      });

      if (!response.ok) throw new Error("Falha na comunicação com o backend FastAPI.");
      const data = await response.json();
      setPautaResult(data.reply);
      toast.success("Nova pauta de Gisele gerada pela PentaIA!");
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao gerar pauta: " + err.message);
      setPautaResult("Erro na geração.");
    }
  };

  // Enviar Nota ao Second Mind (Supabase Real)
  const addZiosNote = async () => {
    if (!newNoteTitle.trim()) return;
    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;

      const { data, error } = await supabase
        .from("conhecimento_contexto")
        .insert([{
          titulo: newNoteTitle,
          conteudo_raw: `Nota de insight rápido sobre ${newNoteTitle}. Categoria: ${newNoteType}.`,
          metadata: { type: newNoteType },
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;

      const note = {
        id: data.id,
        date: new Date(data.created_at).toLocaleDateString("pt-BR"),
        type: data.metadata?.type || "Geral",
        title: data.titulo,
        words: `${data.conteudo_raw ? data.conteudo_raw.split(/\s+/).length : 0} palavras`
      };

      setZiosNotes([note, ...ziosNotes]);
      setNewNoteTitle("");
      toast.success("Nota arquivada na Segunda Mente do ZIOS!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar nota: " + err.message);
    }
  };

  // Enviar Mensagem para o Chatbot ZIOS
  const sendZiosMessage = async () => {
    if (!ziosInput.trim() || sendingZios) return;
    const userMsg = ziosInput;
    setZiosInput("");
    setZiosMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setSendingZios(true);

    try {
      const response = await fetch(`${VITE_AI_URL}/v1/chat/interact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Token": SERVICE_TOKEN
        },
        body: JSON.stringify({
          message: userMsg,
          role: "ZIOS",
          user_name: "Ian Santos",
          context: {
            routine: routineChecked,
            notes_count: ziosNotes.length
          }
        })
      });

      if (!response.ok) throw new Error("Erro na comunicação com a API.");
      const data = await response.json();
      setZiosMessages(prev => [...prev, { sender: "zios", text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setZiosMessages(prev => [...prev, { sender: "zios", text: "Erro ao conectar-me com o núcleo ZIOS. Verifique se o FastAPI está rodando na porta 8001." }]);
    } finally {
      setSendingZios(false);
    }
  };

  // Buscar Notícias Externas via IRIS
  const fetchIrisNews = async () => {
    setFetchingNews(true);
    toast.info("IRIS varrendo canais de notícias externos...");
    try {
      const response = await fetch(`${VITE_AI_URL}/v1/proactive/iris/news`, {
        headers: {
          "X-Service-Token": SERVICE_TOKEN
        }
      });
      if (!response.ok) throw new Error("Não foi possível buscar notícias.");
      const data = await response.json();
      setIrisNews(data);
      toast.success("IRIS retornou notícias educacionais externas!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao buscar notícias: " + err.message);
    } finally {
      setFetchingNews(false);
    }
  };

  // Rodar Auditoria de UI (IRIS)
  const runUiAudit = async () => {
    setUiAuditResult("IRIS analisando interfaces do NioCortex...");
    try {
      const response = await fetch(`${VITE_AI_URL}/v1/chat/interact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Token": SERVICE_TOKEN
        },
        body: JSON.stringify({
          message: "Realize uma análise heurística simulando o comportamento de professores do CEEPS na tela de Notas e diário escolar. Retorne feedbacks de UX.",
          role: "Auditor UI/UX (IRIS)",
          user_name: "Ian Santos",
          context: {}
        })
      });
      if (!response.ok) throw new Error("Erro de comunicação.");
      const data = await response.json();
      setUiAuditResult(data.reply);
      toast.success("Auditoria de UI concluída pela IRIS!");
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao rodar auditoria: " + err.message);
      setUiAuditResult("Erro na auditoria.");
    }
  };

  // Buscar Recomendações do TAS para Moodle/Cursos
  const fetchTasRecommendations = async () => {
    setFetchingRecs(true);
    toast.info("TAS calculando matching de aprendizado...");
    try {
      const response = await fetch(`${VITE_AI_URL}/v1/proactive/tas/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Token": SERVICE_TOKEN
        },
        body: JSON.stringify({
          interesses: userPreferences,
          weights: tasWeights,
          local: localResonance ? "Bahia/Nordeste" : "Geral"
        })
      });
      if (!response.ok) throw new Error("Erro de comunicação.");
      const data = await response.json();
      setTasRecommendations(data);
      toast.success("Recomendações do Moodle atualizadas pelo TAS!");
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao carregar recomendações: " + err.message);
    } finally {
      setFetchingRecs(false);
    }
  };

  const addUserPreference = () => {
    if (!newPreference.trim() || userPreferences.includes(newPreference)) return;
    setUserPreferences([...userPreferences, newPreference.trim()]);
    setNewPreference("");
  };

  const removeUserPreference = (pref: string) => {
    setUserPreferences(userPreferences.filter(p => p !== pref));
  };

  // Simular checagem de IP real (HEIMDALL)
  const runIpVerdictCheck = async () => {
    if (!checkIp.trim()) return;
    try {
      const response = await fetch(`${VITE_AI_URL}/v1/proactive/heimdall/check?ip=${encodeURIComponent(checkIp)}`, {
        headers: {
          "X-Service-Token": SERVICE_TOKEN
        }
      });
      if (!response.ok) throw new Error("Erro ao consultar firewall do Heimdall.");
      const data = await response.json();
      
      setIpVerdict({
        ip: data.client_ip,
        status: data.threat_detected ? "Bloqueado" : "Liberado",
        score: data.threat_detected ? "Crítico (98%)" : "Inofensivo (1%)",
        reason: data.reason
      });

      if (data.threat_detected) {
        toast.warning("Gjallarhorn! Alerta de segurança detectado pelo Heimdall.");
      } else {
        toast.success("Conexão autorizada.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Falha na varredura do Heimdall: " + err.message);
    }
  };

  // Executar snapshot de backup (HEIMDALL)
  const triggerBackupSnapshot = (project: string) => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: `Criando snapshot de segurança do ${project}...`,
      success: () => {
        const newSnap = {
          id: "snap_" + Date.now(),
          time: new Date().toLocaleTimeString(),
          project: `${project} Database`,
          size: "152 MB",
          status: "Integridade OK"
        };
        setSnapshots([newSnap, ...snapshots]);
        return `Snapshot do ${project} Salvo com segurança no cofre Heimdall!`;
      },
      error: "Falha ao criar snapshot."
    });
  };

  // Adicionar lembrete local do Mercúrio
  const addReminder = () => {
    if (!newReminderText.trim()) return;
    setMercurioReminders([
      ...mercurioReminders,
      { id: Date.now(), text: newReminderText.trim(), date: "Hoje" }
    ]);
    setNewReminderText("");
    toast.success("Lembrete local adicionado ao Mercúrio!");
  };

  const removeReminder = (id: number) => {
    setMercurioReminders(mercurioReminders.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-6">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20 space-y-8 animate-fade-in">
        
        {/* Banner Central */}
        <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[180px] border border-white/5 bg-slate-900/40 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/60 via-slate-950 to-purple-950/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex items-center px-8 md:px-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider uppercase border border-indigo-500/30 rounded-full bg-indigo-500/10 text-indigo-300 mb-2">
                  <BrainCircuit className="w-3.5 h-3.5 animate-pulse" /> SISTEMA OPERACIONAL DA MENTE
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight md:text-4xl font-display">
                  Cérebro de Controle <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">PentaIA</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">Gerencie a inteligência centralizada do ecossistema educacional e cívico do Hemera OS.</p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/25 text-indigo-300 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  PENTAIA OPERACIONAL
                </Badge>
                <button 
                  onClick={handleSyncSystems}
                  disabled={loading}
                  className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-indigo-200 hover:text-white transition-all shadow-md"
                  title="Sincronizar barramento de dados"
                >
                  <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Abas e Menus */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto p-1.5 bg-slate-900/60 border border-white/5 rounded-2xl max-w-5xl">
            <TabsTrigger value="overview" className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              1. 🧠 PENTAIA
            </TabsTrigger>
            <TabsTrigger value="zios" className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> 2. 🕸️ ZIOS
            </TabsTrigger>
            <TabsTrigger value="iris" className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> 3. 👁️ IRIS
            </TabsTrigger>
            <TabsTrigger value="tas" className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 4. 🎯 TAS
            </TabsTrigger>
            <TabsTrigger value="mercurio" className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 5. ⚡ MERCÚRIO
            </TabsTrigger>
            <TabsTrigger value="heimdall" className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> 6. 🛡️ HEIMDALL
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PENTAIA (Visão Geral & Mestre) */}
          <TabsContent value="overview" className="space-y-6 outline-none">
            
            {/* Resumo da constelação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Persona de Gisele Oliveira */}
              <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-400" /> Persona Digital: Gisele Oliveira
                  </CardTitle>
                  <CardDescription className="text-xs">Consistência estritamente gerenciada pela inteligência central.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Seguidores Simulados</span>
                    <span className="font-bold text-white">{giseleStats.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sentimento da Audiência</span>
                    <span className="font-bold text-emerald-400">{giseleStats.sentiment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Posts Planejados (Semana)</span>
                    <span className="font-bold text-indigo-400">{giseleStats.postsThisWeek}</span>
                  </div>
                  <Button onClick={generateGiselePauta} className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold text-xs mt-2">
                    Gerar Pauta Gisele
                  </Button>
                </CardContent>
              </Card>

              {/* Parâmetros do Modelo Mestre */}
              <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                    <BrainCircuit className="w-4.5 h-4.5 text-indigo-400" /> Modelo Mestre do Cérebro
                  </CardTitle>
                  <CardDescription className="text-xs">Selecione o modelo base que orquestra a inteligência.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400">Model Engine</Label>
                    <select 
                      value={selectedModel}
                      onChange={e => setSelectedModel(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option value="gemini-3-flash">Gemini 2.5/3.5 Flash</option>
                      <option value="nano-banana">Nano Banana 2 (Local Speed)</option>
                      <option value="veo-video">Veo / Lyria Synth</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    O cérebro distribui as requisições cognitivas do NioCortex, CEEPs e Moodle conforme o carregamento do modelo.
                  </p>
                </CardContent>
              </Card>

              {/* Status do Barramento Nervoso */}
              <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md shadow-lg rounded-2xl flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-indigo-400" /> Saúde do Ecossistema
                  </CardTitle>
                  <CardDescription className="text-xs">Orquestrador e subsistemas conectados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {[
                    { name: "Orquestrador PentaIA", status: "ATIVO" },
                    { name: "Second Mind Index", status: "SYNCED" },
                    { name: "Filtro Ético Cristão", status: "PROTECTED" }
                  ].map((x, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-black/40 border border-white/5 rounded-xl">
                      <span className="text-slate-400">{x.name}</span>
                      <span className="text-[10px] font-bold text-indigo-400 font-mono">{x.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>

            {/* Pauta Gerada Showbox */}
            {pautaResult && (
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xs font-bold text-white">Console Gisele Oliveira Pauta</CardTitle>
                </CardHeader>
                <CardContent className="font-mono text-xs text-slate-300 whitespace-pre-line bg-black/40 p-4 rounded-xl border border-white/5">
                  {pautaResult}
                </CardContent>
              </Card>
            )}

            {/* Descrição Conceitual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/20 p-6 rounded-3xl border border-white/5">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">A Filosofia do Pentagon (5 Pilares)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O **PENTAIA** é a inteligência mestre encarregada de gerenciar a lógica de negócios e as personas digitais do ecossistema. Ele opera de forma invisível nos bastidores do **NioCortex**, do jogo sandbox **Hortus Innocentiae**, e das redes sociais, mantendo a harmonia entre tecnologia, design e propósito.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Integração dos Elementos</span>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
                  <li>**ZIOS** fornece o corpo operacional de tutoria e Segunda Mente.</li>
                  <li>**IRIS** monitora a estética visual, sentimentos e busca notícias.</li>
                  <li>**TAS** regula as sugestões do Moodle de acordo com interesses.</li>
                  <li>**MERCÚRIO** publica o jornal com notícias externas e lembretes locais.</li>
                  <li>**HEIMDALL** protege a Bifrost e as regras éticas do sistema.</li>
                </ul>
              </div>
            </div>

          </TabsContent>

          {/* TAB 2: ZIOS */}
          <TabsContent value="zios" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily Flow Routine */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Fluxo Diário e Família (Daily Flow)
                  </CardTitle>
                  <CardDescription className="text-xs">Sincronização de metas pessoais e familiares.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: "iuza", label: "Tempo de Qualidade com Iuza" },
                    { key: "benjamim", label: "Notas de Estudos com Benjamim" },
                    { key: "benicio", label: "Atividade Lúdica com Benício" },
                    { key: "ceeps", label: "Cronograma de Aulas CEEPS" },
                    { key: "empire", label: "Sprint de Código: Empire Benvik" }
                  ].map(x => (
                    <div key={x.key} className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-xl">
                      <Label htmlFor={`chk-${x.key}`} className="text-xs font-semibold text-slate-300">{x.label}</Label>
                      <Switch 
                        id={`chk-${x.key}`}
                        checked={routineChecked[x.key]}
                        onCheckedChange={checked => setRoutineChecked({ ...routineChecked, [x.key]: checked })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ZIOS Chatbot (Novo Requisito) */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl flex flex-col h-[400px]">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-400 animate-pulse" /> Chatbot ZIOS (Tutor Virtual)
                  </CardTitle>
                  <CardDescription className="text-xs">Diálogo direto com o assistente inteligente da PentaIA.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
                  {ziosMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </CardContent>
                <CardFooter className="p-3 border-t border-white/5 flex gap-2">
                  <Input 
                    placeholder="Digite sua dúvida ou instrução..." 
                    value={ziosInput} 
                    onChange={e => setZiosInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && sendZiosMessage()}
                    className="bg-black/60 border-white/10 text-xs text-white h-9"
                    disabled={sendingZios}
                  />
                  <Button onClick={sendZiosMessage} size="sm" className="bg-indigo-600 hover:bg-indigo-500 h-9" disabled={sendingZios}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Second Mind (ZIOS Knowledge Store) */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl flex flex-col h-[400px]">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-400" /> Segunda Mente
                    </CardTitle>
                    <CardDescription className="text-xs">Notas salvas no Supabase (`conhecimento_contexto`).</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Novo insight..."
                      value={newNoteTitle}
                      onChange={e => setNewNoteTitle(e.target.value)}
                      className="bg-black/60 border-white/10 h-8 text-xs text-white"
                    />
                    <select
                      value={newNoteType}
                      onChange={e => setNewNoteType(e.target.value)}
                      className="bg-black/60 border border-white/10 h-8 text-xs rounded-lg text-white"
                    >
                      <option value="História">História</option>
                      <option value="Teologia">Teologia</option>
                      <option value="Desenvolvimento">Dev</option>
                      <option value="Geral">Geral</option>
                    </select>
                    <Button onClick={addZiosNote} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs h-8">
                      Salvar
                    </Button>
                  </div>

                  <Table>
                    <TableHeader className="bg-slate-950/40 border-white/5">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-slate-400 px-2">Data</TableHead>
                        <TableHead className="text-xs font-bold text-slate-400 px-2">Tipo</TableHead>
                        <TableHead className="text-xs font-bold text-slate-400">Título</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ziosNotes.map(n => (
                        <TableRow key={n.id} className="border-white/5">
                          <TableCell className="text-[10px] font-mono text-slate-500 px-2">{n.date}</TableCell>
                          <TableCell className="px-2">
                            <Badge className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[8px] font-bold px-1.5 py-0">
                              {n.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{n.title}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 3: IRIS */}
          <TabsContent value="iris" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* UI UX auditor & Crawler de Notícias Externas */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl h-fit">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-indigo-400" /> IRIS Observador & Crawler
                  </CardTitle>
                  <CardDescription className="text-xs">Auditoria de UI e captação de notícias externas sobre educação e EdTech.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-350 block">Auditoria Interna de Layout</span>
                    <Button onClick={runUiAudit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold h-9">
                      Executar UI Auditor
                    </Button>
                    {uiAuditResult && (
                      <div className="p-3 bg-black/60 border border-white/5 rounded-xl font-mono text-[10px] text-indigo-300 whitespace-pre-line max-h-40 overflow-y-auto">
                        {uiAuditResult}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <span className="text-xs font-bold text-slate-350 block">Notícias Externas da Web</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      A IRIS vasculha fora do projeto em portais do MEC, fóruns e blogs de EdTechs para trazer novidades.
                    </p>
                    <Button 
                      onClick={fetchIrisNews} 
                      disabled={fetchingNews}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs font-bold h-9"
                    >
                      {fetchingNews ? "Buscando..." : "Buscar Notícias da Web"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Gisele Sentiment analysis */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-indigo-400" /> Análise de Sentimento (IRIS Listening)
                  </CardTitle>
                  <CardDescription className="text-xs">Verificação de reações e engajamento sobre as redes sociais externas da persona.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sentimentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="positivo" name="Positivo (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="neutro" name="Neutro (%)" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="negativo" name="Negativo (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 4: TAS */}
          <TabsContent value="tas" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sliders bio-inspirados do TAS */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl h-fit">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4.5 h-4.5 text-indigo-400" /> Modulação Biológica do TAS
                  </CardTitle>
                  <CardDescription className="text-xs">Calibração do fluxo de sensações e dopamina (Accubens) para cursos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-355">ACCUBENS (Recompensa & Retenção no Moodle)</span>
                      <span className="text-indigo-400 font-mono">{tasWeights.accubens}%</span>
                    </div>
                    <Slider 
                      min={10} 
                      max={100} 
                      step={5} 
                      value={[tasWeights.accubens]} 
                      onValueChange={val => setTasWeights({ ...tasWeights, accubens: val[0] })}
                      className="py-1"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between p-2 bg-black/40 border border-white/5 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-300 block">Ressonância Local</span>
                        <p className="text-[9px] text-slate-500">Regionalização das recomendações.</p>
                      </div>
                      <Switch 
                        checked={localResonance}
                        onCheckedChange={setLocalResonance}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <span className="text-xs font-bold text-slate-350 block">Preferências do Usuário</span>
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {userPreferences.map(pref => (
                        <Badge key={pref} className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 text-[9px] flex items-center gap-1">
                          {pref}
                          <button onClick={() => removeUserPreference(pref)} className="hover:text-red-400 font-bold ml-1">×</button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Novo interesse..."
                        value={newPreference}
                        onChange={e => setNewPreference(e.target.value)}
                        className="bg-black/60 border-white/10 h-8 text-xs text-white"
                      />
                      <Button onClick={addUserPreference} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs h-8">
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendador do Moodle / Cursos */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl lg:col-span-2 flex flex-col min-h-[300px]">
                <CardHeader className="flex flex-row justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" /> Recomendações de Cursos no Moodle (TAS Engine)
                    </CardTitle>
                    <CardDescription className="text-xs">O TAS analisa as preferências de dopamina e indica os melhores caminhos.</CardDescription>
                  </div>
                  <Button 
                    onClick={fetchTasRecommendations} 
                    disabled={fetchingRecs}
                    className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold h-8 px-4"
                  >
                    {fetchingRecs ? "Processando..." : "Calcular Recomendações"}
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 pt-4 space-y-3">
                  {tasRecommendations.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-10">
                      Nenhuma recomendação calculada. Clique no botão acima para mapear caminhos personalizados no Moodle.
                    </div>
                  ) : (
                    tasRecommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-200">{rec.titulo}</h4>
                            <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0">
                              {rec.categoria}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{rec.descricao}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-bold text-emerald-400 font-mono">{rec.match_score}% Match</span>
                          <span className="text-[8px] text-slate-500 block">Accubens Recompensa</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 5: MERCÚRIO */}
          <TabsContent value="mercurio" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Jornal do Hemera (Notícias da IRIS) */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl lg:col-span-2 flex flex-col min-h-[400px]">
                <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-indigo-400 animate-pulse" /> Jornal do Hemera (Feed Externo)
                    </CardTitle>
                    <CardDescription className="text-xs">As últimas novidades EdTech trazidas pela IRIS da web.</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/25 text-indigo-300 text-[9px] px-2 py-0.5">
                    Responsável: MERCÚRIO Bus
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 pt-4">
                  {irisNews.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-14">
                      <BellRing className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                      O jornal está sem publicações no momento. 
                      <p className="text-[10px] text-slate-500 mt-1">Vá na aba "IRIS" e clique em "Buscar Notícias da Web" para preencher este feed.</p>
                    </div>
                  ) : (
                    irisNews.map((newsItem, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="text-xs font-bold text-slate-100 hover:underline cursor-pointer">
                            <a href={newsItem.url} target="_blank" rel="noreferrer">{newsItem.titulo}</a>
                          </h4>
                          <Badge className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[8px] font-bold shrink-0">
                            {newsItem.fonte}
                          </Badge>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">{newsItem.snippet}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quadro de Lembretes do Projeto & Latência */}
              <div className="space-y-6">
                <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl flex flex-col h-[280px]">
                  <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" /> Quadro de Lembretes (Mercúrio)
                    </CardTitle>
                    <CardDescription className="text-xs">Lembretes e destaques locais de tarefas do projeto.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-3 space-y-2 pt-3">
                    <div className="flex gap-1.5 pb-2">
                      <Input 
                        placeholder="Novo lembrete..."
                        value={newReminderText}
                        onChange={e => setNewReminderText(e.target.value)}
                        className="bg-black/60 border-white/10 h-7 text-xs text-white"
                      />
                      <Button onClick={addReminder} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs h-7 px-2.5">
                        Add
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      {mercurioReminders.map(rem => (
                        <div key={rem.id} className="flex items-center justify-between p-2 bg-black/40 border border-white/5 rounded-lg text-[10.5px]">
                          <span className="text-slate-300 font-semibold truncate max-w-[200px]">{rem.text}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-400 font-mono text-[9px]">{rem.date}</span>
                            <button onClick={() => removeReminder(rem.id)} className="text-slate-500 hover:text-red-400">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-400" /> Latência do Canal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 space-y-1">
                    <div className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-550 tracking-wider">WebSocket Bus Ping</span>
                      <h4 className="text-xl font-black text-indigo-400 font-mono">14.2 ms</h4>
                      <span className="text-[8.5px] text-slate-500 block">Status de Entrega: At-Least-Once</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* TAB 6: HEIMDALL */}
          <TabsContent value="heimdall" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Threat simulator & Gjallarhorn */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl h-fit">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-500" /> Gjallarhorn Alerta & IP Scanner
                  </CardTitle>
                  <CardDescription className="text-xs">Responsável pela segurança e prevenção contra intrusões.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-350">Gjallarhorn WAF</span>
                      <p className="text-[9px] text-slate-550">Notificação crítica de firewall ativa.</p>
                    </div>
                    <Switch 
                      checked={gjallarhornActive}
                      onCheckedChange={setGjallarhornActive}
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <Label className="text-xs font-bold text-slate-400">Verificar IP da Bifrost</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ex: 185.220.101.5"
                        value={checkIp}
                        onChange={e => setCheckIp(e.target.value)}
                        className="bg-black/60 border-white/10 text-xs text-white"
                      />
                      <Button onClick={runIpVerdictCheck} className="bg-indigo-600 hover:bg-indigo-500 text-xs shrink-0 font-bold">
                        Avaliar
                      </Button>
                    </div>
                  </div>

                  {ipVerdict && (
                    <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl font-mono text-[10.5px] space-y-1">
                      <div className="flex justify-between text-rose-400">
                        <span>IP: {ipVerdict.ip}</span>
                        <span>{ipVerdict.status}</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">Ameaça: {ipVerdict.score}</p>
                      <p className="text-slate-500 text-[9px] italic">Motivo: {ipVerdict.reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Snapshot recovery database backups */}
              <Card className="bg-slate-900/40 border-white/5 shadow-lg rounded-2xl lg:col-span-2">
                <CardHeader className="flex flex-row justify-between items-center pb-3">
                  <div>
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-indigo-400" /> Snapshot Recovery (Cofre Heimdall)
                    </CardTitle>
                    <CardDescription className="text-xs">Pontos de restauração e integridade de dados educacionais.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => triggerBackupSnapshot("Hortus Innocentiae")} size="sm" variant="outline" className="border-white/10 text-xs">
                      Backup Hortus
                    </Button>
                    <Button onClick={() => triggerBackupSnapshot("NioCortex Config")} size="sm" variant="outline" className="border-white/10 text-xs">
                      Backup NioCortex
                    </Button>
                    <Button onClick={() => triggerBackupSnapshot("Empire Benvik")} size="sm" variant="outline" className="border-white/10 text-xs">
                      Backup Empire
                    </Button>
                  </div>

                  <Table>
                    <TableHeader className="bg-slate-950/40 border-white/5">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-slate-400">Timestamp</TableHead>
                        <TableHead className="text-xs font-bold text-slate-400">Recurso do Snapshot</TableHead>
                        <TableHead className="text-xs font-bold text-slate-400">Tamanho</TableHead>
                        <TableHead className="text-xs font-bold text-slate-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {snapshots.map(snap => (
                        <TableRow key={snap.id} className="border-white/5">
                          <TableCell className="text-xs font-mono text-slate-500">{snap.time}</TableCell>
                          <TableCell className="text-xs font-bold text-slate-350">{snap.project}</TableCell>
                          <TableCell className="text-xs text-slate-400 font-mono">{snap.size}</TableCell>
                          <TableCell><Badge className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[8.5px] font-bold">{snap.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
