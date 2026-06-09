import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Sparkles, Send, User,
  Briefcase, BarChart3, FileText, BookOpen, 
  Plus, MoreVertical, Share2, Settings, 
  Grid, FileUp, Youtube, Cloud, Clipboard, X, Volume2, Play, Pause, 
  FileSpreadsheet, Layers, Tv, ChevronRight, Wand2, PlusCircle, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProfessorNavbar } from "@/components/professor/ProfessorNavbar";
import { AlunoNavbar } from "@/components/aluno/AlunoNavbar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AuroraBackground } from "@/components/AuroraBackground";

interface Hemera {
  id: string;
  titulo: string;
  data: string;
  fontesCount: number;
  icon: string; // Emoji
  bgClass: string;
}

interface Source {
  id: string;
  name: string;
  type: "pdf" | "site" | "drive" | "text";
  selected: boolean;
  content: string;
  sizeOrWords: string;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  sourcesUsed?: string[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function HemeraLM() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const role = user?.user_metadata?.role || "professor";

  const [currentView, setCurrentView] = useState<"dashboard" | "workspace">("dashboard");
  const [activeTab, setActiveTab] = useState<"todos" | "meus">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [selectedHemera, setSelectedHemera] = useState<Hemera | null>(null);

  // Sources and Messages state
  const [sources, setSources] = useState<Source[]>([]);
  const [chat, setChat] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("hemera_notes");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("hemera_notes", JSON.stringify(notes));
  }, [notes]);

  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Add Source form states
  const [inputUrl, setInputUrl] = useState("");
  const [inputText, setInputText] = useState("");
  const [inputName, setInputName] = useState("");
  const [activeSourceInputTab, setActiveSourceInputTab] = useState<"upload" | "url" | "drive" | "text">("upload");

  // Studio states
  const [activeStudioTool, setActiveStudioTool] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Initially empty recent list as requested (user only starts with the creation option)
  const [hemeras, setHemeras] = useState<Hemera[]>([]);

  // Flashcards items
  const flashcards = [
    { question: "O que é o barramento Mercúrio?", answer: "É o barramento de eventos assíncronos do ecossistema Hemera, que desacopla a comunicação entre os submódulos acadêmicos." },
    { question: "Qual a função do Heimdall?", answer: "Ele é a fronteira Zero Trust, centralizando tokens JWT, permissões e segredos com escopo rígido para cada submódulo." },
    { question: "Qual o papel do ZIOS na plataforma?", answer: "O ZIOS atua como o núcleo cognitivo proativo que analisa dados, emite alertas pedagógicos e orquestra a inteligência artificial." },
    { question: "O que é o oráculo HemeraLM?", answer: "É um agente RAG inteligente que gera avaliações livres de alucinações baseando-se nos documentos oficiais de estudo carregados." },
  ];

  // Quiz questions
  const quizQuestions = [
    { id: 1, q: "Qual protocolo garante latência zero e comunicação em tempo real no módulo Thorth?", options: ["REST APIs", "GraphQL", "WebSockets", "gRPC"], correct: "WebSockets" },
    { id: 2, q: "Como o módulo Hermes garante total segurança e rastreabilidade nas transações financeiras?", options: ["Excluindo logs periodicamente", "Event Sourcing e Imutabilidade", "Consultas em SQL puro", "Triggers no PostgreSQL"], correct: "Event Sourcing e Imutabilidade" },
    { id: 3, q: "Qual o nível tolerado de alucinação para o oráculo HemeraLM?", options: ["Até 5%", "Tolerância Zero (grounding absoluto)", "Apenas em respostas curtas", "Conforme o modelo de LLM configurado"], correct: "Tolerância Zero (grounding absoluto)" },
  ];

  // Mindmap data representation
  const mindmapNodes = {
    title: "Hemera OS Hub",
    children: [
      {
        title: "Thorth (Comunicação)",
        desc: "Mensagens em tempo real, suporte a WebSockets, canal humano-máquina seguro com criptografia E2EE.",
        children: ["Chat Instantâneo", "ZIOS Bridge", "Mensagens de Voz"]
      },
      {
        title: "Hemera Hermes (Back-office)",
        desc: "Controle de faturamento, conciliação CNAB, assinaturas digitais, repasses de cursos e transações ACID.",
        children: ["Conciliação de Pix", "Contratos Acadêmicos", "Split de Recebíveis"]
      },
      {
        title: "HemeraLM (Cognitivo RAG)",
        desc: "Agente inteligente ancorado na documentação pedagógica oficial para gerar provas e resumos.",
        children: ["Geração de Provas", "Validador de Código", "Filtro BNCC"]
      }
    ]
  };

  // Audio simulation timer
  useEffect(() => {
    if (isAudioPlaying) {
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsAudioPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isAudioPlaying]);

  // Open a Hemera workspace
  const openHemera = (h: Hemera) => {
    setSelectedHemera(h);
    setChat([
      { role: "assistant", text: `Olá! Vamos iniciar seu Hemera sobre "${h.titulo}". Eu sou o Thorth, seu escrivão pedagógico conectado às suas fontes no HemeraLM. O que você gostaria de explorar hoje?` }
    ]);
    
    // Set some default sources
    setSources([
      { id: "src1", name: "projeto_hemera_master.pdf", type: "pdf", selected: true, sizeOrWords: "148 KB", content: "Documento contendo toda a arquitetura dos submódulos do ecossistema Hemera OS, incluindo Hermes, Thorth, Pólis e Olimpo." },
      { id: "src2", name: "referencial_teorico_rag.pdf", type: "pdf", selected: true, sizeOrWords: "210 KB", content: "Princípios do RAG (Retrieval-Augmented Generation) focado em tolerância zero a alucinação de dados acadêmicos." },
      { id: "src3", name: "anotacoes_aula_auditoria.txt", type: "text", selected: false, sizeOrWords: "450 palavras", content: "Anotações do professor sobre auditoria financeira em banco de dados utilizando conceitos de imutabilidade e Event Sourcing." }
    ]);
    setCurrentView("workspace");
  };

  // Create a new Hemera
  const handleCreateHemera = () => {
    const name = prompt("Nome do novo Hemera:", "Hemera sem título");
    if (!name) return;
    
    const icons = ["🧠", "📚", "🔬", "⚖️", "🎨", "💻", "🧬", "🌍", "🔮", "💡"];
    const bgs = [
      "bg-[#E8F0FE]", // pastel blue
      "bg-[#FEF7E0]", // pastel yellow
      "bg-[#E6F4EA]", // pastel green
      "bg-[#F3E8FD]", // pastel purple
      "bg-[#FCE8E6]"  // pastel red
    ];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const randomBg = bgs[Math.floor(Math.random() * bgs.length)];

    const newHemera: Hemera = {
      id: "nb_" + Date.now(),
      titulo: name,
      data: "Hoje",
      fontesCount: 0,
      icon: randomIcon,
      bgClass: randomBg
    };
    setHemeras([newHemera, ...hemeras]);
    openHemera(newHemera);
    toast({ title: "Hemera Criado", description: `"${name}" está pronto para receber fontes.` });
  };

  // Switch source selection
  const toggleSourceSelection = (id: string) => {
    setSources(sources.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  // Handle source adding
  const handleAddSource = () => {
    let newSource: Source | null = null;
    if (activeSourceInputTab === "url" && inputUrl) {
      newSource = {
        id: "src_" + Date.now(),
        name: inputUrl.replace("https://", "").replace("http://", "").split("/")[0] || "link_externo.html",
        type: "site",
        selected: true,
        sizeOrWords: "Website",
        content: `Conteúdo indexado a partir do site: ${inputUrl}`
      };
      setInputUrl("");
    } else if (activeSourceInputTab === "text" && inputText && inputName) {
      newSource = {
        id: "src_" + Date.now(),
        name: inputName.endsWith(".txt") ? inputName : `${inputName}.txt`,
        type: "text",
        selected: true,
        sizeOrWords: `${inputText.split(/\s+/).length} palavras`,
        content: inputText
      };
      setInputText("");
      setInputName("");
    } else {
      // Simulate generic file upload
      newSource = {
        id: "src_" + Date.now(),
        name: `documento_pesquisa_${sources.length + 1}.pdf`,
        type: "pdf",
        selected: true,
        sizeOrWords: "350 KB",
        content: "Conteúdo simulado de PDF anexado pelo usuário para grounding do LLM."
      };
    }

    if (newSource) {
      setSources([...sources, newSource]);
      setIsAddSourceOpen(false);
      toast({ title: "Fonte Adicionada", description: `"${newSource.name}" foi integrada ao Hemera.` });
    }
  };

  // Chat message submit
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isGeneratingResponse) return;
    const userText = chatInput.trim();
    setChat(prev => [...prev, { role: "user", text: userText }]);
    setChatInput("");
    setIsGeneratingResponse(true);

    const activeSources = sources.filter(s => s.selected);
    const sourcesUsed = activeSources.map(s => s.name);

    if (activeSources.length === 0) {
      setChat(prev => [...prev, { role: "assistant", text: "Não há fontes ativas selecionadas para responder a esta pergunta. Por favor, marque pelo menos uma fonte na barra lateral esquerda." }]);
      setIsGeneratingResponse(false);
      return;
    }

    try {
      const AI_URL = import.meta.env.VITE_AI_URL || "http://localhost:8001";
      const token = "segredo_super_secreto_da_prefeitura_2025";
      
      const response = await fetch(`${AI_URL}/v1/chat/interact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-service-token": token
        },
        body: JSON.stringify({
          message: `[Fontes Ativas: ${sourcesUsed.join(", ")}] Pergunta: ${userText}`,
          role: role,
          user_name: user?.email || "Visitante",
          context: {
            sources: activeSources.map(s => ({ name: s.name, content: s.content })),
            page: "HemeraLM"
          }
        })
      });

      if (!response.ok) {
        throw new Error("Erro de comunicação com a IA");
      }

      const data = await response.json();
      if (data && data.reply) {
        setChat(prev => [...prev, { role: "assistant", text: data.reply, sourcesUsed }]);
      } else {
        throw new Error("Resposta inválida da IA");
      }
    } catch (err) {
      console.warn("FastAPI offline ou erro, usando fallback local simulado:", err);
      // Simulate RAG extraction and answer synthesis offline
      let responseText = "";
      if (userText.toLowerCase().includes("hermes")) {
        responseText = "Com base em 'projeto_hemera_master.pdf', o Hemera Hermes é o ERP financeiro administrativo. Ele opera com imutabilidade estrita (Event Sourcing) e transações ACID para emitir boletos e conciliar registros, garantindo que não existam registros financeiros apagados ou fraudados.";
      } else if (userText.toLowerCase().includes("thorth")) {
        responseText = "De acordo com 'projeto_hemera_master.pdf', a plataforma Thorth gerencia a comunicação humana e humano-máquina do ecossistema. Utiliza conexões WebSockets persistentes para chats rápidos e suporta criptografia de ponta-a-ponta (E2EE).";
      } else if (userText.toLowerCase().includes("rag") || userText.toLowerCase().includes("alunac")) {
        responseText = "Conforme explicado em 'referencial_teorico_rag.pdf', o oráculo HemeraLM aplica técnicas RAG para assegurar tolerância zero a alucinação de dados. Isso ocorre porque o modelo limita suas respostas estritamente aos textos carregados e selecionados como fonte.";
      } else {
        responseText = `Com base nas fontes ativas (${sourcesUsed.join(", ")}), posso afirmar que o Hemera OS foi desenhado para unificar todas as pontas da instituição. O que mais você deseja extrair desses documentos?`;
      }

      setChat(prev => [...prev, { role: "assistant", text: responseText, sourcesUsed }]);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  // Preset prompts clicking
  const handlePresetPrompt = (promptText: string) => {
    setChatInput(promptText);
    setTimeout(() => handleSendChatMessage(), 100);
  };

  // Add Note handler
  const handleAddManualNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const newNote: Note = {
      id: "note_" + Date.now(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      date: new Date().toLocaleDateString("pt-BR")
    };
    setNotes([newNote, ...notes]);
    setIsNewNoteOpen(false);
    setNoteTitle("");
    setNoteContent("");
    toast({ title: "Anotação Salva", description: "Sua nota foi armazenada no Estúdio." });
  };

  // Quiz submission handler
  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        score += 1;
      }
    });
    setQuizScore(score);
    setIsQuizSubmitted(true);
    toast({ title: "Teste Concluído", description: `Você acertou ${score} de ${quizQuestions.length} questões.` });
  };

  // Conditionally render top navbar based on role
  const renderNavbar = () => {
    if (role === "admin") return <AdminNavbar />;
    if (role === "aluno") return <AlunoNavbar />;
    return <ProfessorNavbar />;
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden font-sans text-slate-800 relative">
      <AuroraBackground />
      
      {/* MENU NA PARTE SUPERIOR */}
      <div className="shrink-0 relative z-50">
        {renderNavbar()}
      </div>
      
      {/* ────────────────── DASHBOARD VIEW ────────────────── */}
      {currentView === "dashboard" && (
        <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6 w-full max-w-[1250px] mx-auto space-y-8 relative z-10">
          
          {/* HEADER DASHBOARD */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 pb-6">
            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => navigate(-1)} 
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white/80 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {/* Concentric circle logo representing Hemera / PentaIA brainwave */}
              <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <svg viewBox="0 0 100 100" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="10">
                  <circle cx="50" cy="50" r="40" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="25" strokeDasharray="10 20" />
                  <circle cx="50" cy="50" r="10" fill="currentColor" />
                </svg>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">HemeraLM</h1>
                <p className="text-[10px] text-indigo-650 font-bold tracking-wider uppercase">Oráculo Cognitivo RAG / PentaIA</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Pesquise seus Hemeras..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-white/80 backdrop-blur-md shadow-sm transition-all"
                />
              </div>
              
              <Button 
                onClick={handleCreateHemera} 
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold gap-1.5 rounded-xl shadow-lg shadow-indigo-500/25 text-xs h-10 px-5 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Criar novo Hemera
              </Button>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex justify-between items-center border-b border-slate-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("todos")}
                className={`py-3 px-4 font-semibold text-sm transition-all relative ${activeTab === "todos" ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-655"}`}
              >
                Todos Hemeras
                {activeTab === "todos" && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("meus")}
                className={`py-3 px-4 font-semibold text-sm transition-all relative ${activeTab === "meus" ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-655"}`}
              >
                Meus Hemeras
                {activeTab === "meus" && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <button className="p-1.5 hover:text-slate-700 bg-white border border-slate-200 shadow-sm rounded-lg text-slate-750">
                <Grid className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:text-slate-700 hover:bg-slate-50 rounded-lg">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              
              <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                <span>Mais recentes</span>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* RECENT HEMERAS */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Hemeras recentes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Add New Hemera - Stunning and highly styled */}
              <div 
                onClick={handleCreateHemera} 
                className="bg-white/80 backdrop-blur-md border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer h-48 text-center space-y-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50/70 text-indigo-650 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 text-xs block">Criar novo Hemera</span>
                  <span className="text-[10px] text-slate-400 block px-4 leading-normal">Comece um novo workspace cognitivo</span>
                </div>
              </div>

              {/* Loop Hemeras or Empty State next to it */}
              {hemeras.length === 0 ? (
                <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3 bg-indigo-50/20 backdrop-blur-xs border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-5 h-48">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="font-extrabold text-slate-800 text-sm">Bem-vindo ao HemeraLM!</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[550px]">
                      Este é o seu portal de inteligência contextual. Clique no botão de criação ao lado para criar o seu primeiro Hemera. Com ele, você poderá carregar apostilas, notas de aulas, links ou textos, gerando chats cognitivos fundamentados e resumos inteligentes sem alucinações.
                    </p>
                  </div>
                </div>
              ) : (
                hemeras
                  .filter(h => h.titulo.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(h => (
                    <div 
                      key={h.id} 
                      onClick={() => openHemera(h)}
                      className="border border-slate-200/60 rounded-3xl p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 cursor-pointer h-48 relative group shadow-sm bg-white/95 backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-2xl ${h.bgClass || 'bg-slate-100'} flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-200`}>
                          {h.icon}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Deseja mesmo excluir o Hemera "${h.titulo}"?`)) {
                              setHemeras(hemeras.filter(x => x.id !== h.id));
                              toast({ title: "Hemera Removido", description: "O workspace foi excluído." });
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir Hemera"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-1 mt-4">
                        <h3 className="font-extrabold text-xs leading-snug text-slate-900 group-hover:text-indigo-650 transition-colors">{h.titulo}</h3>
                        <p className="text-[9px] font-bold tracking-wide uppercase text-indigo-500/80">
                          {h.data} • {h.fontesCount} {h.fontesCount === 1 ? "fonte" : "fontes"}
                        </p>
                      </div>
                    </div>
                  ))
              )}

            </div>
          </div>
        </div>
      )}

      {/* ────────────────── WORKSPACE VIEW ────────────────── */}
      {currentView === "workspace" && selectedHemera && (
        <div className="flex-1 flex flex-col overflow-hidden bg-transparent relative z-10">
          
          {/* HEADER WORKSPACE */}
          <header className="h-14 border-b border-slate-250/60 flex items-center justify-between px-6 shrink-0 bg-white/70 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setCurrentView("dashboard");
                  setActiveStudioTool(null);
                }} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-white transition-colors"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              
              <div className="flex items-center gap-3">
                {/* SVG Concentric arches representing Hemera logo */}
                <div className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="12">
                    <circle cx="50" cy="50" r="38" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="20" strokeDasharray="8 12" />
                    <circle cx="50" cy="50" r="8" fill="currentColor" />
                  </svg>
                </div>
                
                <input 
                  type="text" 
                  value={selectedHemera.titulo} 
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedHemera({ ...selectedHemera, titulo: val });
                    setHemeras(hemeras.map(h => h.id === selectedHemera.id ? { ...h, titulo: val } : h));
                  }}
                  className="font-bold text-slate-800 text-xs bg-transparent border-b border-transparent hover:border-slate-350 focus:border-slate-800 focus:outline-none px-1 py-0.5"
                />
                <span className="text-[9px] font-bold text-slate-500 bg-white border border-slate-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Hemera</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCreateHemera} 
                className="bg-slate-950 hover:bg-slate-850 text-white font-bold h-8 text-[10px] rounded-lg px-2.5 shadow-sm gap-1"
              >
                <Plus className="w-3 h-3" /> Criar Hemera
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-200 bg-white/80 hover:bg-white font-bold h-8 text-[10px] rounded-lg px-2.5 flex items-center gap-1 shadow-sm"
              >
                <BarChart3 className="w-3 h-3 text-slate-500" /> Análise de dados
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-200 bg-white/80 hover:bg-white font-bold h-8 text-[10px] rounded-lg px-2.5 flex items-center gap-1 shadow-sm"
              >
                <Share2 className="w-3 h-3 text-slate-500" /> Compartilhar
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-200 bg-white/80 hover:bg-white font-bold h-8 text-[10px] rounded-lg px-2.5 flex items-center gap-1 shadow-sm"
              >
                <Settings className="w-3 h-3 text-slate-500" /> Configurações
              </Button>
              
              <div className="h-5 w-px bg-slate-200 mx-1"></div>
              
              <div className="bg-[#FFFDE7] border border-yellow-250 rounded-md px-2 py-0.5 text-[8.5px] font-black uppercase text-yellow-750 tracking-wider">
                PRO
              </div>
              
              <button className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-white shadow-sm border border-slate-100 transition">
                <Grid className="w-4 h-4" />
              </button>
              
              <div className="w-7 h-7 rounded-full bg-slate-950 text-white font-bold text-xxs flex items-center justify-center shadow-inner">
                H
              </div>
            </div>
          </header>

          {/* THREE COLUMN GRID LAYOUT (translucent background to show Aurora background) */}
          <div className="flex-1 grid grid-cols-12 overflow-hidden p-3 gap-3 bg-slate-200/40 backdrop-blur-xs">
            
            {/* ── COLUMN 1: FONTES (3 cols) ── */}
            <aside className="col-span-3 border border-slate-200/80 flex flex-col bg-white/95 backdrop-blur-md overflow-hidden rounded-2xl shadow-sm">
              <div className="p-4 border-b border-slate-100 space-y-3.5 shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-slate-800 text-xs">Fontes</h2>
                  <span className="text-[10px] bg-slate-100 text-slate-650 font-bold px-2 py-0.5 rounded-full border border-slate-200/40 shadow-sm">
                    {sources.filter(s => s.selected).length} de {sources.length} ativas
                  </span>
                </div>

                <Button 
                  onClick={() => setIsAddSourceOpen(true)}
                  className="w-full border border-indigo-200 hover:bg-indigo-50/50 hover:border-indigo-300 text-indigo-700 bg-white font-bold text-xs h-10 rounded-xl shadow-sm gap-1 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-0.5 text-indigo-650" /> Adicionar fontes
                </Button>

                {/* Web Search input matching Image 1 */}
                <div className="border border-slate-200 rounded-xl bg-slate-50/60 p-2.5 space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Pesquise novas fontes na web"
                      className="w-full pl-7 pr-3 py-1 bg-transparent text-[11px] outline-none text-slate-700 font-semibold"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1.5">
                      <select className="bg-white border border-slate-250 rounded px-1.5 py-0.5 text-[9px] text-slate-600 font-bold outline-none cursor-pointer">
                        <option>Web</option>
                        <option>Biblioteca</option>
                      </select>
                      <select className="bg-white border border-slate-250 rounded px-1.5 py-0.5 text-[9px] text-slate-600 font-bold outline-none cursor-pointer">
                        <option>Pesquisa rápida</option>
                        <option>Pesquisa profunda</option>
                      </select>
                    </div>
                    <button className="w-5.5 h-5.5 bg-slate-200 text-slate-650 hover:bg-slate-300 rounded-full flex items-center justify-center transition">
                      <Search className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sources checklist */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sources.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-350 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">
                        As fontes salvas vão aparecer aqui
                      </p>
                      <p className="text-[10px] text-slate-400 leading-normal max-w-[190px] mx-auto">
                        Clique em "Adicionar fonte" para incluir arquivos PDF, de sites, de texto, de vídeo ou de áudio. Ou importe um arquivo do Google Drive.
                      </p>
                    </div>
                  </div>
                ) : (
                  sources.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => toggleSourceSelection(s.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${s.selected ? 'bg-indigo-50/50 border-indigo-250 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={s.selected}
                        onChange={() => {}} // Handled by click on parent
                        className="mt-0.5 accent-slate-900 rounded"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${s.selected ? 'text-indigo-650' : 'text-slate-400'}`} />
                          <span className="text-[11px] font-bold text-slate-800 truncate block">{s.name}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{s.type} • {s.sizeOrWords}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* ── COLUMN 2: CONVERSA / CHAT (5 cols) ── */}
            <main className="col-span-5 border border-slate-200/80 flex flex-col bg-white/95 backdrop-blur-md overflow-hidden rounded-2xl shadow-sm justify-between">
              {/* Header Conversa */}
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="font-bold text-slate-850 text-xs">Conversa</h2>
                <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chat.length <= 1 && (
                  <div className="py-6 px-4 text-center max-w-sm mx-auto space-y-6">
                    <div className="flex justify-center">
                      {/* Stylized hand wave with nice animation styling */}
                      <span className="text-4xl inline-block animate-wave transform-gpu origin-[70%_70%]">👋</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 font-display">
                        Vamos iniciar seu Hemera...
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Esta é sua tela em branco para entender, criar ou progredir em algo novo. Posso te ajudar a começar ou você pode adicionar as próprias fontes.
                      </p>
                    </div>

                    <div className="space-y-2 text-left pt-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">O que você quer fazer com este Hemera?</p>
                      
                      <button 
                        onClick={() => handlePresetPrompt("Quais são as diferenças arquiteturais entre Hermes e Thorth?")}
                        className="w-full text-left bg-slate-50/70 border border-slate-200 hover:border-slate-350 hover:bg-slate-100/50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all duration-200 shadow-xs"
                      >
                        Começar um projeto
                      </button>
                      <button 
                        onClick={() => handlePresetPrompt("Qual o papel do RAG e da tolerância zero a alucinação no oráculo HemeraLM?")}
                        className="w-full text-left bg-slate-50/70 border border-slate-200 hover:border-slate-350 hover:bg-slate-100/50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all duration-200 shadow-xs"
                      >
                        Aprender ou entender algo
                      </button>
                      <button 
                        onClick={() => handlePresetPrompt("Gere um roteiro para um resumo em áudio explicando a infraestrutura global.")}
                        className="w-full text-left bg-slate-50/70 border border-slate-200 hover:border-slate-350 hover:bg-slate-100/50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all duration-200 shadow-xs"
                      >
                        Criar um podcast, vídeo, apresentação de slides etc.
                      </button>
                      <button 
                        onClick={() => handlePresetPrompt("Outra coisa...")}
                        className="w-full text-left bg-slate-50/70 border border-slate-200 hover:border-slate-350 hover:bg-slate-100/50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all duration-200 shadow-xs"
                      >
                        Outra coisa...
                      </button>
                    </div>
                  </div>
                )}

                {chat.slice(1).map((msg, i) => (
                  <div key={i} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-slate-100 text-slate-655 border border-slate-200/50' : 'bg-slate-950 text-white shadow-sm'}`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-1">
                      <div className={`p-3 rounded-2xl text-[11.5px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#F1F5F9] text-slate-800 rounded-tr-none border border-slate-200/60' : 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-250/30 text-indigo-950 rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                      {msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.sourcesUsed.map((srcName, idx) => (
                            <span key={idx} className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[8.5px] font-bold text-slate-500 shadow-sm">
                              {srcName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isGeneratingResponse && (
                  <div className="flex gap-3 max-w-[90%] mr-auto items-center">
                    <div className="w-7.5 h-7.5 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-indigo-50/20 border border-indigo-100 p-3 rounded-2xl text-[11px] text-slate-400 animate-pulse">
                      Consultando fontes ativas no HemeraLM...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Faça uma pergunta ou crie algo"
                    className="w-full bg-slate-50 border border-slate-250 rounded-2xl pl-4 pr-24 py-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition"
                  />
                  
                  <div className="absolute right-2 flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-255 border border-slate-200/80 px-2 py-0.5 rounded shadow-sm">
                      {sources.filter(s=>s.selected).length} {sources.filter(s=>s.selected).length === 1 ? "fonte" : "fontes"}
                    </span>
                    <button 
                      onClick={handleSendChatMessage}
                      disabled={!chatInput.trim() || isGeneratingResponse}
                      className="w-8 h-8 bg-slate-955 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-center text-[9px] text-slate-400 mt-2 font-semibold">
                  O HemeraLM pode gerar respostas incorretas. Por isso, cheque o conteúdo crítico.
                </p>
              </div>
            </main>

            {/* ── COLUMN 3: ESTÚDIO (4 cols) ── */}
            <aside className="col-span-4 border border-slate-200/80 flex flex-col bg-white/95 backdrop-blur-md overflow-hidden rounded-2xl shadow-sm justify-between">
              
              {/* Header Estúdio */}
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="font-bold text-slate-800 text-xs">Estúdio</h2>
                <button className="text-slate-400 hover:text-slate-655 p-1 rounded hover:bg-slate-50 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Studio Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {activeStudioTool === null ? (
                  // Grid of Studio tools matching Image 1 (More vibrant, polished style)
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Audio summary */}
                      <div 
                        onClick={() => {
                          setActiveStudioTool("audio");
                          setIsAudioPlaying(true);
                        }}
                        className="bg-[#E8F0FE]/80 border border-blue-200/40 hover:border-blue-400 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                            <Volume2 className="w-4 h-4" />
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#1A73E8] leading-tight">Resumo em Áudio</span>
                      </div>

                      {/* Presentation */}
                      <div 
                        onClick={() => setActiveStudioTool("apresentacao")}
                        className="bg-[#FEF7E0]/90 border border-yellow-200/40 hover:border-yellow-400 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-700">
                            <Tv className="w-4 h-4" />
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-yellow-400" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#B06000] leading-tight">Apresentação de...</span>
                      </div>

                      {/* Video Summary */}
                      <div 
                        onClick={() => setActiveStudioTool("video")}
                        className="bg-[#E6F4EA]/80 border border-emerald-200/40 hover:border-emerald-400 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="23 7 16 12 23 17 23 7" />
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-450" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#137333] leading-tight">Resumo em Vídeo</span>
                      </div>

                      {/* Mindmap */}
                      <div 
                        onClick={() => setActiveStudioTool("mapamental")}
                        className="bg-[#F3E8FD]/80 border border-purple-200/40 hover:border-purple-400 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-700">
                            <Layers className="w-4 h-4" />
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#A142F4] leading-tight">Mapa mental</span>
                      </div>

                      {/* Reports */}
                      <div 
                        onClick={() => setActiveStudioTool("relatorios")}
                        className="bg-[#FEF7E0]/90 border border-yellow-200/40 hover:border-yellow-450 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-yellow-600/10 text-yellow-750">
                            <Briefcase className="w-4 h-4" />
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-yellow-500" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#B06000] leading-tight">Relatórios</span>
                      </div>

                      {/* Flashcards */}
                      <div 
                        onClick={() => setActiveStudioTool("flashcards")}
                        className="bg-[#FCE8E6]/80 border border-red-200/40 hover:border-red-400 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-red-500/10 text-red-700">
                            <Clipboard className="w-4 h-4" />
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#C5221F] leading-tight">Cartões didáticos</span>
                      </div>

                      {/* Test */}
                      <div 
                        onClick={() => {
                          setActiveStudioTool("quiz");
                          setIsQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="bg-[#E8F0FE]/80 border border-blue-200/40 hover:border-blue-400 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-700">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 11l3 3L22 4" />
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#1A73E8] leading-tight">Teste</span>
                      </div>

                      {/* Info chart */}
                      <div 
                        onClick={() => setActiveStudioTool("infografico")}
                        className="bg-[#FCE8E6]/80 border border-[#e91e63]/10 hover:border-[#e91e63]/30 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-[#e91e63]/10 text-[#e91e63]">
                            <BarChart3 className="w-4 h-4" />
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#C5221F] leading-tight">Infográfico</span>
                      </div>

                      {/* Table chart */}
                      <div 
                        onClick={() => setActiveStudioTool("tabela")}
                        className="bg-[#E8F0FE]/80 border border-blue-200/40 hover:border-blue-400 p-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-22 text-left col-span-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-700">
                            <FileSpreadsheet className="w-4 h-4" />
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-450" />
                        </div>
                        <span className="font-bold text-[10.5px] text-[#1A73E8] leading-tight">Tabela de dados</span>
                      </div>

                    </div>

                    {/* Notes List */}
                    {notes.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suas Notas</p>
                        {notes.map(note => (
                          <div key={note.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 shadow-xs">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-xs text-slate-800">{note.title}</h4>
                              <button 
                                onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                                className="text-slate-400 hover:text-red-500 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-655 whitespace-pre-wrap">{note.content}</p>
                            <div className="text-[9px] text-slate-400 font-bold mt-1 text-right">{note.date}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Active Tool Workspace
                  <div className="space-y-4 h-full flex flex-col justify-between">
                    
                    {/* Active Tool Header */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
                      <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                        {activeStudioTool === "audio" && "Resumo em Áudio"}
                        {activeStudioTool === "apresentacao" && "Apresentação de Slides"}
                        {activeStudioTool === "video" && "Resumo em Vídeo"}
                        {activeStudioTool === "mapamental" && "Mapa mental"}
                        {activeStudioTool === "relatorios" && "Relatório"}
                        {activeStudioTool === "flashcards" && "Cartões didáticos"}
                        {activeStudioTool === "quiz" && "Teste"}
                        {activeStudioTool === "infografico" && "Infográfico"}
                        {activeStudioTool === "tabela" && "Tabela de dados"}
                      </span>
                      <button 
                        onClick={() => {
                          setActiveStudioTool(null);
                          setIsAudioPlaying(false);
                        }}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Active Tool Content */}
                    <div className="flex-1 overflow-y-auto py-2">
                      
                      {/* Audio Tool */}
                      {activeStudioTool === "audio" && (
                        <div className="space-y-5 flex flex-col items-center justify-center py-4">
                          <div className="w-20 h-20 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-md relative group">
                            {isAudioPlaying ? (
                              <Pause className="w-8 h-8 cursor-pointer" onClick={() => setIsAudioPlaying(false)} />
                            ) : (
                              <Play className="w-8 h-8 cursor-pointer ml-1" onClick={() => setIsAudioPlaying(true)} />
                            )}
                            {isAudioPlaying && (
                              <div className="absolute inset-0 border-4 border-slate-400 rounded-full animate-ping opacity-20" />
                            )}
                          </div>
                          
                          <div className="text-center space-y-1">
                            <h4 className="font-extrabold text-xs text-slate-800">Podcast: Arquitetura Hemera OS</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Módulos Cognitivos, ERP e Mensageria</p>
                          </div>

                          <div className="w-full space-y-2">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400">
                              <span>{Math.floor((audioProgress * 120) / 100)}s</span>
                              <span>2:00</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const clickX = e.clientX - rect.left;
                              setAudioProgress(Math.floor((clickX / rect.width) * 100));
                            }}>
                              <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${audioProgress}%` }} />
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-[11px] text-slate-655 leading-relaxed w-full">
                            <p className="font-bold text-slate-900">Transcrição Simulado:</p>
                            <p><strong>Host A:</strong> "No Hemera OS, a separação de escopo é fundamental. Temos o barramento assíncrono Mercúrio para garantir que nenhum módulo interfira no outro diretamente."</p>
                            <p><strong>Host B:</strong> "Sim, e com o Thorth garantindo chats com WebSockets e o Hermes isolado para CNAB e Pix, a segurança é formidável."</p>
                          </div>
                        </div>
                      )}

                      {/* Mindmap Tool */}
                      {activeStudioTool === "mapamental" && (
                        <div className="space-y-4">
                          <p className="text-[11px] text-slate-500 font-semibold">Estrutura organizacional extraída das fontes:</p>
                          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                            <div className="bg-slate-950 text-white p-2 rounded-lg text-center font-bold text-xs shadow-sm">
                              {mindmapNodes.title}
                            </div>
                            
                            <div className="flex flex-col gap-2 pl-4 border-l-2 border-slate-200">
                              {mindmapNodes.children.map((child, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="bg-white border border-slate-300 p-2 rounded-lg text-[10.5px] font-bold text-slate-800 shadow-sm">
                                    {child.title}
                                  </div>
                                  <p className="text-[10px] text-slate-500 pl-2 leading-relaxed">{child.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Flashcards Tool */}
                      {activeStudioTool === "flashcards" && (
                        <div className="space-y-5 py-2 flex flex-col items-center">
                          <div 
                            onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                            className={`w-full max-w-[250px] h-32 rounded-2xl border flex items-center justify-center p-5 text-center cursor-pointer transition-all duration-300 shadow-sm ${isFlashcardFlipped ? 'bg-slate-950 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-800 font-bold'}`}
                          >
                            <span className="text-xs leading-relaxed">
                              {isFlashcardFlipped ? flashcards[currentFlashcardIndex].answer : flashcards[currentFlashcardIndex].question}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button 
                              variant="outline" 
                              disabled={currentFlashcardIndex === 0}
                              onClick={() => {
                                  setCurrentFlashcardIndex(currentFlashcardIndex - 1);
                                  setIsFlashcardFlipped(false);
                              }}
                              className="h-7 text-[10px] rounded-lg shadow-sm"
                            >
                              Anterior
                            </Button>
                            <span className="text-[10px] font-bold text-slate-400">
                              {currentFlashcardIndex + 1} de {flashcards.length}
                            </span>
                            <Button 
                              variant="outline" 
                              disabled={currentFlashcardIndex === flashcards.length - 1}
                              onClick={() => {
                                  setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                                  setIsFlashcardFlipped(false);
                              }}
                              className="h-7 text-[10px] rounded-lg shadow-sm"
                            >
                              Próximo
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Quiz Tool */}
                      {activeStudioTool === "quiz" && (
                        <div className="space-y-4">
                          {!isQuizSubmitted ? (
                            <div className="space-y-4 text-left">
                              {quizQuestions.map(q => (
                                <div key={q.id} className="space-y-1.5">
                                  <p className="text-[11.5px] font-bold text-slate-800">{q.id}. {q.q}</p>
                                  <div className="grid grid-cols-1 gap-1.5">
                                    {q.options.map(opt => (
                                      <label key={opt} className={`flex items-center gap-2 p-2 rounded-xl border text-[10.5px] cursor-pointer transition ${quizAnswers[q.id] === opt ? 'border-slate-850 bg-slate-50 font-bold text-slate-950' : 'border-slate-200 hover:bg-slate-50 text-slate-655'}`}>
                                        <input 
                                          type="radio" 
                                          name={`q-${q.id}`} 
                                          value={opt}
                                          checked={quizAnswers[q.id] === opt}
                                          onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                          className="accent-slate-900"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              
                              <Button 
                                onClick={handleSubmitQuiz}
                                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                                className="w-full bg-slate-950 hover:bg-slate-900 font-bold rounded-xl h-9 text-xs mt-2 shadow-sm"
                              >
                                Enviar Respostas
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4 text-center">
                              <div className="w-12 h-12 rounded-full bg-slate-950 text-white flex items-center justify-center mx-auto shadow-sm">
                                <Sparkles className="w-6 h-6 animate-pulse" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-sm text-slate-800">Resultado do Teste</h4>
                                <p className="text-xs text-slate-500">Você acertou <strong className="text-slate-900">{quizScore}</strong> de {quizQuestions.length} questões.</p>
                              </div>

                              <div className="text-left space-y-2.5 pt-1">
                                {quizQuestions.map(q => (
                                  <div key={q.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 text-[10.5px] space-y-1 shadow-xs">
                                    <p className="font-bold text-slate-700">{q.id}. {q.q}</p>
                                    <p className="flex items-center gap-1.5">
                                      <span>Sua resposta:</span>
                                      <span className={quizAnswers[q.id] === q.correct ? 'text-emerald-700 font-bold' : 'text-rose-500 font-bold'}>
                                        {quizAnswers[q.id] || "—"}
                                      </span>
                                    </p>
                                    {quizAnswers[q.id] !== q.correct && (
                                      <p className="text-slate-400">Resposta correta: <strong className="text-emerald-700">{q.correct}</strong></p>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <Button 
                                onClick={() => {
                                  setIsQuizSubmitted(false);
                                  setQuizAnswers({});
                                }}
                                className="w-full bg-slate-950 hover:bg-slate-850 font-bold text-xs h-9 rounded-xl shadow-sm"
                              >
                                Refazer Teste
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Presentation Summary Tool */}
                      {activeStudioTool === "apresentacao" && (
                        <div className="space-y-3 text-left">
                          <p className="text-[11px] text-slate-500 font-semibold">Slides recomendados com base nas fontes selecionadas:</p>
                          <div className="space-y-3">
                            <div className="bg-[#FEF7E0]/40 border border-yellow-200 p-3 rounded-xl space-y-1 shadow-xs">
                              <span className="text-[8px] uppercase tracking-wider font-bold text-yellow-800 bg-yellow-100 px-1.5 py-0.5 rounded">Slide 1</span>
                              <h4 className="font-bold text-xs text-slate-800">O Ecossistema Educacional Hemera OS</h4>
                              <p className="text-[10px] text-slate-500">Separando o faturamento (Hermes), a mensageria (Thorth) e a inteligência cognitiva baseada em IA (HemeraLM).</p>
                            </div>
                            <div className="bg-[#FEF7E0]/40 border border-yellow-200 p-3 rounded-xl space-y-1 shadow-xs">
                              <span className="text-[8px] uppercase tracking-wider font-bold text-yellow-800 bg-yellow-100 px-1.5 py-0.5 rounded">Slide 2</span>
                              <h4 className="font-bold text-xs text-slate-800">Barramento Mercúrio & Segurança Heimdall</h4>
                              <p className="text-[10px] text-slate-500">Mapeamento dos barramentos assíncronos e a barreira Zero Trust que regula acessos e rotas.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Video Summary Tool */}
                      {activeStudioTool === "video" && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500 font-semibold">Resumo do conteúdo em vídeo indexado:</p>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-655 leading-relaxed space-y-2 shadow-xs">
                            <p className="font-bold text-emerald-800">Roteiro Cronológico:</p>
                            <p><strong>00:00 - 01:20:</strong> Introdução conceitual ao sistema operacional Hemera.</p>
                            <p><strong>01:20 - 02:40:</strong> Demonstração do fluxo financeiro CNAB sob o Hermes.</p>
                            <p><strong>02:40 - Fim:</strong> Teste prático do oráculo cognitivo no ambiente do estudante.</p>
                          </div>
                        </div>
                      )}

                      {/* Reports Tool */}
                      {activeStudioTool === "relatorios" && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500 font-semibold">Relatório técnico sintetizado:</p>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-655 leading-relaxed space-y-2 shadow-inner">
                            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Relatório: Grounding no HemeraLM</h4>
                            <p><strong>Contexto:</strong> Evitar alucinações de modelos de linguagem aplicados a testes e notas escolares.</p>
                            <p><strong>Princípio RAG:</strong> Recuperação de documentos estruturados do professor antes do prompt da LLM. Caso a resposta não conste na base, o oráculo nega a resposta para evitar dados falsos.</p>
                          </div>
                        </div>
                      )}

                      {/* Infographics Tool */}
                      {activeStudioTool === "infografico" && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500 font-semibold">Proporção de uso de canais escolares:</p>
                          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 shadow-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span className="font-bold text-slate-700">Polis (Comunicações Sociais)</span>
                                <span className="text-slate-500 font-bold bg-white px-2 py-0.5 rounded border shadow-xxs">85%</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-900 rounded-full" style={{ width: "85%" }} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span className="font-bold text-slate-700">Olimpo (Gamificação)</span>
                                <span className="text-slate-500 font-bold bg-white px-2 py-0.5 rounded border shadow-xxs">60%</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-600 rounded-full" style={{ width: "60%" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Table Summary Tool */}
                      {activeStudioTool === "tabela" && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500 font-semibold">Estrutura comparativa de submódulos:</p>
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-[10.5px] shadow-sm">
                            <table className="w-full text-left">
                              <thead className="bg-slate-100 border-b border-slate-200 font-bold">
                                <tr>
                                  <th className="p-2 text-slate-700">Módulo</th>
                                  <th className="p-2 text-slate-700">Domínio</th>
                                  <th className="p-2 text-slate-700">Tecnologia</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 bg-white">
                                <tr>
                                  <td className="p-2 font-bold text-slate-800">Thorth</td>
                                  <td className="p-2 text-slate-600">Comunicação</td>
                                  <td className="p-2 text-slate-550">WebSockets, E2EE</td>
                                </tr>
                                <tr>
                                  <td className="p-2 font-bold text-slate-800">Hermes</td>
                                  <td className="p-2 text-slate-600">Finanças / ERP</td>
                                  <td className="p-2 text-slate-550">Event Sourcing, CNAB</td>
                                </tr>
                                <tr>
                                  <td className="p-2 font-bold text-slate-800">HemeraLM</td>
                                  <td className="p-2 text-slate-600">IA Cognitiva</td>
                                  <td className="p-2 text-slate-550">RAG, Grounding</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Active Tool Footer Action */}
                    <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
                      <Button 
                        onClick={() => {
                          setActiveStudioTool(null);
                          setIsAudioPlaying(false);
                        }}
                        variant="outline"
                        className="flex-1 font-bold text-xs h-9 rounded-xl shadow-none"
                      >
                        Fechar Visualização
                      </Button>
                    </div>

                  </div>
                )}

              </div>

              {/* Bottom add note button matching Image 1 */}
              <div className="p-4 border-t border-slate-100 bg-[#F8FAFC]/90 shrink-0 text-center space-y-4">
                {activeStudioTool === null && (
                  <div className="space-y-3.5">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      {/* Wand2 representing ZIOS brainwave creator */}
                      <Wand2 className="w-5.5 h-5.5 text-slate-350" />
                      <p className="text-[10px] text-slate-400 max-w-[220px] leading-relaxed mx-auto font-semibold">
                        O resultado do Studio será salvo aqui. Depois de incluir as fontes, clique para adicionar um Resumo em Áudio, um Guia de Estudo, um Mapa Mental e muito mais.
                      </p>
                    </div>

                    <Dialog open={isNewNoteOpen} onOpenChange={setIsNewNoteOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-slate-950 hover:bg-slate-900 text-white font-bold h-9.5 text-xs rounded-xl shadow-md gap-1 w-full justify-center">
                          <PlusCircle className="w-4 h-4" /> Adicionar nota
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-bold text-sm">Adicionar Nota Manual</DialogTitle>
                          <DialogDescription>Crie uma anotação escolar para grounding do oráculo cognitivo HemeraLM.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label className="font-semibold text-xs">Título</Label>
                            <Input 
                              value={noteTitle} 
                              onChange={e => setNoteTitle(e.target.value)} 
                              placeholder="Ex: Resumos de Event Sourcing" 
                              className="rounded-xl border-slate-200 focus:ring-slate-900" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-semibold text-xs">Conteúdo da Anotação</Label>
                            <textarea 
                              value={noteContent} 
                              onChange={e => setNoteContent(e.target.value)} 
                              placeholder="Digite ou cole aqui os insights..." 
                              className="w-full h-32 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-slate-900/15 bg-white" 
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddManualNote} className="w-full bg-slate-900 hover:bg-slate-850 font-bold text-xs h-10 rounded-xl shadow-sm">
                          Salvar Nota
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </aside>

          </div>

          {/* ── ADD SOURCE MODAL DIALOG matching Image 2 ── */}
          <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
            <DialogContent className="sm:max-w-[550px] p-6 rounded-3xl">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-center font-bold text-lg text-slate-800 flex-1 px-4 leading-normal">
                    Crie Resumos em Áudio e em Vídeo usando <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-650 to-emerald-650">suas anotações no Hemera</span>
                  </DialogTitle>
                  <button 
                    onClick={() => setIsAddSourceOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </DialogHeader>

              {/* Web search input inside Modal */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-3 mt-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Pesquise novas fontes na web" 
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    className="w-full pl-9 pr-12 py-2 bg-transparent text-sm outline-none text-slate-700 font-semibold"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655">
                    <Search className="w-4.5 h-4.5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-650 font-bold outline-none cursor-pointer">
                      <option>Web</option>
                      <option>Biblioteca</option>
                    </select>
                    <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-650 font-bold outline-none cursor-pointer">
                      <option>Pesquisa rápida</option>
                      <option>Pesquisa profunda</option>
                    </select>
                  </div>
                  
                  <button className="w-7 h-7 bg-slate-200 hover:bg-slate-250 text-slate-700 rounded-full flex items-center justify-center transition">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drag Area or Custom Form Tabs */}
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-4 bg-slate-50/20 relative mt-4">
                
                {activeSourceInputTab === "upload" && (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">ou solte seus arquivos</p>
                      <p className="text-xs text-slate-400 mt-1">pdf, imagens, documentos, áudio e outros</p>
                    </div>
                  </div>
                )}

                {activeSourceInputTab === "url" && (
                  <div className="space-y-3">
                    <p className="font-bold text-sm text-slate-800">Inserir Link Externo</p>
                    <Input 
                      placeholder="https://exemplo.com/doc-estudo" 
                      value={inputUrl}
                      onChange={e => setInputUrl(e.target.value)}
                      className="rounded-xl border-slate-200 bg-white focus:ring-slate-900"
                    />
                  </div>
                )}

                {activeSourceInputTab === "text" && (
                  <div className="space-y-3 text-left">
                    <p className="font-bold text-sm text-slate-800 text-center">Inserir Bloco de Texto</p>
                    <Input 
                      placeholder="Nome do documento (ex: aula_quimica)" 
                      value={inputName}
                      onChange={e => setInputName(e.target.value)}
                      className="rounded-xl border-slate-200 bg-white mb-2 focus:ring-slate-900"
                    />
                    <textarea 
                      placeholder="Cole aqui o conteúdo textual..." 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      className="w-full h-24 border border-slate-200 rounded-xl p-3 text-xs outline-none bg-white focus:ring-2 focus:ring-slate-900/15"
                    />
                  </div>
                )}

                {activeSourceInputTab === "drive" && (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-slate-800">Google Drive</p>
                    <p className="text-xs text-slate-400 max-w-[280px] mx-auto">Conecte sua conta e importe arquivos PDF ou documentos de texto oficiais.</p>
                  </div>
                )}

              </div>

              {/* Bottom Buttons inside upload area matching Image 2 */}
              <div className="grid grid-cols-4 gap-2 mt-4 shrink-0">
                <button 
                  onClick={() => setActiveSourceInputTab("upload")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-[10px] font-bold transition ${activeSourceInputTab === "upload" ? "border-slate-800 bg-slate-50 text-slate-800 shadow-sm" : "border-slate-100 hover:bg-slate-50 text-slate-500"}`}
                >
                  <FileUp className="w-4.5 h-4.5" />
                  <span>Enviar arquivos</span>
                </button>
                <button 
                  onClick={() => setActiveSourceInputTab("url")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-[10px] font-bold transition ${activeSourceInputTab === "url" ? "border-slate-800 bg-slate-50 text-slate-800 shadow-sm" : "border-slate-100 hover:bg-slate-50 text-slate-500"}`}
                >
                  <Youtube className="w-4.5 h-4.5" />
                  <span>Sites</span>
                </button>
                <button 
                  onClick={() => setActiveSourceInputTab("drive")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-[10px] font-bold transition ${activeSourceInputTab === "drive" ? "border-slate-800 bg-slate-50 text-slate-800 shadow-sm" : "border-slate-100 hover:bg-slate-50 text-slate-500"}`}
                >
                  <Cloud className="w-4.5 h-4.5" />
                  <span>Drive</span>
                </button>
                <button 
                  onClick={() => setActiveSourceInputTab("text")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-[10px] font-bold transition ${activeSourceInputTab === "text" ? "border-slate-800 bg-slate-50 text-slate-800 shadow-sm" : "border-slate-100 hover:bg-slate-50 text-slate-500"}`}
                >
                  <Clipboard className="w-4.5 h-4.5" />
                  <span>Texto copiado</span>
                </button>
              </div>

              {activeSourceInputTab !== "upload" && (
                <Button 
                  onClick={handleAddSource}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold h-10 text-xs rounded-xl mt-4 shadow-md"
                >
                  Confirmar e Adicionar Fonte
                </Button>
              )}
            </DialogContent>
          </Dialog>

        </div>
      )}

    </div>
  );
}

// ── MOCK COMPONENT DIALOG (SIMPLE IMPLEMENTATION TO KEEP FILE COMPILABLE AND CLEAN) ──
interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Dialog({ children, open, onOpenChange }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  );
}

function DialogTrigger({ children, asChild }: { children: React.ReactElement; asChild?: boolean }) {
  return children;
}

function DialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl shadow-2xl relative overflow-hidden border border-slate-150 ${className}`}>
      {children}
    </div>
  );
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-5 pb-1">{children}</div>;
}

function DialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-base font-bold text-slate-950 ${className}`}>{children}</h3>;
}

function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-slate-400 mt-1">{children}</p>;
}

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;
function Label({ children, className = "", ...props }: LabelProps) {
  return (
    <label className={`text-xs font-bold text-slate-700 ${className}`} {...props}>
      {children}
    </label>
  );
}
