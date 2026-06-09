import React, { useState, useEffect } from "react";
import { 
  Plug, Search, Settings2, Play, FileText, Smile, Compass, BookOpen, 
  Calendar, Trello, Database, MessageSquare, Folder, Book, CheckCircle2, 
  XCircle, Info, Lock, User, Copy, Sparkles, RefreshCw, Sliders, Download, 
  ExternalLink, Send, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { 
  signWithGovBr, fetchRandomEmoji, fetchMagnificIcons, lordiconCatalog,
  queryBNB, searchGoogleBooks, searchOpenLibrary, searchPenguinRandomHouse,
  fetchPoetry, fetchWolneLektury, syncWithTrello, syncGoogleCalendarEvent,
  testBaseApi, chatWithBrainshop, listGoogleDriveFiles 
} from "@/services/integrationsService";

// Interfaces das Integrações
interface IntegrationItem {
  id: string;
  name: string;
  url: string;
  category: "books" | "productivity" | "media" | "utilities";
  description: string;
  docsUrl: string;
  authRequired: boolean;
  status: "Conectado" | "Configuração Requerida";
  iconName: string;
}

export default function AdminIntegracoes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedApiId, setSelectedApiId] = useState<string>("gov-br");
  const [activeTab, setActiveTab] = useState<"playground" | "config" | "docs">("playground");

  // Estados Globais de Credenciais (LocalStorage)
  const [govBrCpf, setGovBrCpf] = useState("123.456.789-00");
  const [govBrDocName, setGovBrDocName] = useState("Contrato_Matricula_2026.pdf");
  const [trelloKey, setTrelloKey] = useState("");
  const [trelloToken, setTrelloToken] = useState("");
  const [brainshopBid, setBrainshopBid] = useState("");
  const [brainshopKey, setBrainshopKey] = useState("");
  const [baseApiKey, setBaseApiKey] = useState("");
  
  // Estado para Logs e Respostas de Cada API
  const [apiLogs, setApiLogs] = useState<Record<string, string[]>>({});
  const [apiResponses, setApiResponses] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Inputs Dinâmicos do Playground
  const [emojiCategory, setEmojiCategory] = useState("");
  const [magnificPrompt, setMagnificPrompt] = useState("A beautiful golden key representing knowledge");
  const [magnificStyle, setMagnificStyle] = useState("neon-3d");
  const [selectedLordicon, setSelectedLordicon] = useState(lordiconCatalog[0].id);
  const [lordiconTrigger, setLordiconTrigger] = useState("hover");
  const [lordiconColor, setLordiconColor] = useState("#4f46e5");
  const [bnbQuery, setBnbQuery] = useState("Austen");
  const [gbooksQuery, setGbooksQuery] = useState("Inteligencia Artificial Educacao");
  const [olibraryQuery, setOlibraryQuery] = useState("Pedagogy");
  const [prhQuery, setPrhQuery] = useState("Classic");
  const [poetryQuery, setPoetryQuery] = useState("Shakespeare");
  const [poetryIsAuthor, setPoetryIsAuthor] = useState(true);
  const [wolneQuery, setWolneQuery] = useState("Milosc");
  const [trelloTaskName, setTrelloTaskName] = useState("Preparar aula de Álgebra");
  const [trelloTaskDesc, setTrelloTaskDesc] = useState("Focar em equações quadráticas.");
  const [calSummary, setCalSummary] = useState("Reunião Pedagógica Mensal");
  const [calDesc, setCalDesc] = useState("Alinhamento do calendário acadêmico de 2026.");
  const [calStart, setCalStart] = useState("2026-06-15T14:00:00");
  const [calEnd, setCalEnd] = useState("2026-06-15T15:30:00");
  const [baseDbKey, setBaseDbKey] = useState("hemera_config");
  const [baseDbVal, setBaseDbVal] = useState("active_v2");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Olá! Como posso ajudar nas tarefas escolares hoje?" }
  ]);
  const [gdriveFiles, setGdriveFiles] = useState<any[]>([]);

  // Carrega Lordicon CDN script e credenciais salvas no localStorage
  useEffect(() => {
    document.title = "Integrações | Hemera";

    // Lordicon Script
    const scriptId = "lordicon-cdn-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.lordicon.com/lordicon.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Carregar credenciais salvas
    setTrelloKey(localStorage.getItem("h_trello_key") || "");
    setTrelloToken(localStorage.getItem("h_trello_token") || "");
    setBrainshopBid(localStorage.getItem("h_brainshop_bid") || "");
    setBrainshopKey(localStorage.getItem("h_brainshop_key") || "");
    setBaseApiKey(localStorage.getItem("h_base_key") || "");
  }, []);

  // Salvar credenciais
  const saveCredentials = (key: string, val: string, storageName: string) => {
    localStorage.setItem(storageName, val);
    toast.success("Configuração salva com sucesso!");
  };

  // Lista de APIs
  const apiList: IntegrationItem[] = [
    { id: "gov-br", name: "Assinatura Eletrônica Gov.br", url: "https://assinatura.br", category: "utilities", description: "Assinatura digital padrão ICP-Brasil pelo Governo Federal.", docsUrl: "https://manual-integracao-assinatura-eletronica.servicos.gov.br/pt-br/latest/", authRequired: true, status: "Configuração Requerida", iconName: "FileText" },
    { id: "emojihub", name: "EmojiHub", url: "https://emojihub.yurace.pro", category: "media", description: "API de Emojis aleatórios categorizados para engajamento.", docsUrl: "https://github.com/cheatsnake/emojihub", authRequired: false, status: "Conectado", iconName: "Smile" },
    { id: "magnific", name: "Magnific Icons", url: "https://api.magnific.com", category: "media", description: "Motor de inteligência artificial para geração de ícones personalizados.", docsUrl: "https://docs.magnific.com/api-reference/icons/icons-api", authRequired: true, status: "Configuração Requerida", iconName: "Sparkles" },
    { id: "lordicon", name: "Lordicon Player", url: "https://lordicon.com", category: "media", description: "Ícones interativos animados integrados no ecossistema.", docsUrl: "https://lordicon.com/", authRequired: false, status: "Conectado", iconName: "Sliders" },
    { id: "bnb", name: "British Library Bibliography (BNB)", url: "http://bnb.data.bl.uk", category: "books", description: "Banco de dados bibliográfico nacional britânico via SPARQL.", docsUrl: "http://bnb.data.bl.uk/", authRequired: false, status: "Conectado", iconName: "Compass" },
    { id: "gbooks", name: "Google Books", url: "https://googleapis.com/books", category: "books", description: "Pesquisa no maior acervo mundial de livros digitais.", docsUrl: "https://developers.google.com/books?hl=pt-br", authRequired: false, status: "Conectado", iconName: "BookOpen" },
    { id: "olibrary", name: "Open Library", url: "https://openlibrary.org", category: "books", description: "Consultas de catalogação e visualizações de capas de livros livres.", docsUrl: "https://openlibrary.org/developers/api", authRequired: false, status: "Conectado", iconName: "Book" },
    { id: "prh", name: "Penguin Random House", url: "https://reststop.randomhouse.com", category: "books", description: "Acesso ao catálogo de publicações da editora Random House.", docsUrl: "https://www.penguinrandomhouse.biz/webservices/rest/", authRequired: false, status: "Conectado", iconName: "BookOpen" },
    { id: "poetrydb", name: "PoetryDB API", url: "https://poetrydb.org", category: "books", description: "Busca de poemas, sonetos, poetas e versos em domínio público.", docsUrl: "https://github.com/thundercomb/poetrydb#readme", authRequired: false, status: "Conectado", iconName: "Compass" },
    { id: "wolnelektury", name: "Wolne Lektury", url: "https://wolnelektury.pl", category: "books", description: "Obras clássicas polonesas e mundiais com download gratuito.", docsUrl: "https://wolnelektury.pl/api/", authRequired: false, status: "Conectado", iconName: "BookOpen" },
    { id: "trello", name: "Trello API", url: "https://api.trello.com", category: "productivity", description: "Integração e sincronização de quadros e cartões de atividades.", docsUrl: "https://developer.atlassian.com/cloud/trello/", authRequired: true, status: trelloKey && trelloToken ? "Conectado" : "Configuração Requerida", iconName: "Trello" },
    { id: "gcal", name: "Google Calendar", url: "https://googleapis.com/calendar", category: "productivity", description: "Sincronização bidirecional de eventos e reuniões escolares.", docsUrl: "https://developers.google.com/workspace/calendar?hl=pt-br", authRequired: true, status: "Configuração Requerida", iconName: "Calendar" },
    { id: "base-api", name: "Base API", url: "https://base-api.io", category: "utilities", description: "Ferramentas backend simples para bancos de chaves-valores e mails.", docsUrl: "https://www.base-api.io/", authRequired: true, status: baseApiKey ? "Conectado" : "Configuração Requerida", iconName: "Database" },
    { id: "brainshop", name: "Brainshop AI Chatbot", url: "https://brainshop.ai", category: "utilities", description: "Assistente conversacional inteligente com respostas em tempo de execução.", docsUrl: "https://brainshop.ai/", authRequired: true, status: brainshopBid && brainshopKey ? "Conectado" : "Configuração Requerida", iconName: "MessageSquare" },
    { id: "gworkspace", name: "Google Workspace REST API", url: "https://googleapis.com/drive", category: "productivity", description: "Sincronização de arquivos do Google Drive e materiais no AVA.", docsUrl: "https://developers.google.com/workspace/docs/api/reference/rest?hl=pt-br", authRequired: true, status: "Configuração Requerida", iconName: "Folder" }
  ];

  // Helper para renderizar ícones
  const renderIcon = (name: string, className: string = "w-5 h-5") => {
    switch (name) {
      case "FileText": return <FileText className={className} />;
      case "Smile": return <Smile className={className} />;
      case "Sparkles": return <Sparkles className={className} />;
      case "Sliders": return <Sliders className={className} />;
      case "Compass": return <Compass className={className} />;
      case "BookOpen": return <BookOpen className={className} />;
      case "Book": return <Book className={className} />;
      case "Trello": return <Trello className={className} />;
      case "Calendar": return <Calendar className={className} />;
      case "Database": return <Database className={className} />;
      case "MessageSquare": return <MessageSquare className={className} />;
      case "Folder": return <Folder className={className} />;
      default: return <Plug className={className} />;
    }
  };

  // Filtragem
  const filteredApis = apiList.filter((api) => {
    const matchesSearch = api.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          api.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || api.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedApi = apiList.find(a => a.id === selectedApiId) || apiList[0];

  // Handler para Execução do Playground
  const handleExecute = async () => {
    const apiId = selectedApi.id;
    setIsLoading(prev => ({ ...prev, [apiId]: true }));
    
    try {
      let res: any = null;
      
      switch (apiId) {
        case "gov-br":
          res = await signWithGovBr({
            cpf: govBrCpf,
            documentName: govBrDocName,
            documentContent: "SIMULATED_CONTENT_BYTES_10204",
            clientId: "hemera-edu-client",
            clientSecret: "sc_9023419084"
          });
          break;
        case "emojihub":
          res = await fetchRandomEmoji(emojiCategory);
          break;
        case "magnific":
          res = await fetchMagnificIcons(magnificPrompt, magnificStyle);
          break;
        case "lordicon":
          // Simulação interativa
          res = {
            success: true,
            data: {
              activeIcon: selectedLordicon,
              trigger: lordiconTrigger,
              colors: `primary:${lordiconColor},secondary:#06b6d4`,
              embedCode: `<lord-icon src="${lordiconCatalog.find(l => l.id === selectedLordicon)?.src}" trigger="${lordiconTrigger}" colors="primary:${lordiconColor},secondary:#06b6d4" style="width:120px;height:120px"></lord-icon>`
            },
            debugLog: [
              `[1] Carregando configurações para o ícone animado: ${selectedLordicon}`,
              `[2] Injetando gatilho de execução: "${lordiconTrigger}"`,
              `[3] Ajustando paleta primária para hexadecimal: ${lordiconColor}`,
              `[4] Renderizando elemento Web Component na árvore React`
            ]
          };
          break;
        case "bnb":
          res = await queryBNB(bnbQuery);
          break;
        case "gbooks":
          res = await searchGoogleBooks(gbooksQuery);
          break;
        case "olibrary":
          res = await searchOpenLibrary(olibraryQuery);
          break;
        case "prh":
          res = await searchPenguinRandomHouse(prhQuery);
          break;
        case "poetrydb":
          res = await fetchPoetry(poetryQuery, poetryIsAuthor);
          break;
        case "wolnelektury":
          res = await fetchWolneLektury(wolneQuery);
          break;
        case "trello":
          res = await syncWithTrello({ key: trelloKey, token: trelloToken }, trelloTaskName, trelloTaskDesc);
          break;
        case "gcal":
          res = await syncGoogleCalendarEvent({
            summary: calSummary,
            description: calDesc,
            startDateTime: calStart,
            endDateTime: calEnd
          });
          break;
        case "base-api":
          res = await testBaseApi(baseApiKey, baseDbKey, baseDbVal);
          break;
        case "brainshop":
          res = await chatWithBrainshop({ bid: brainshopBid, key: brainshopKey }, "Olá tutor!");
          break;
        case "gworkspace":
          res = await listGoogleDriveFiles();
          if (res.success) {
            setGdriveFiles(res.data);
          }
          break;
        default:
          throw new Error("Integração não suportada.");
      }

      if (res) {
        setApiResponses(prev => ({ ...prev, [apiId]: res.data }));
        setApiLogs(prev => ({ ...prev, [apiId]: res.debugLog }));
        if (res.success) {
          toast.success(`${selectedApi.name} executada com sucesso!`);
        } else {
          toast.error(`Erro ao executar ${selectedApi.name}.`);
        }
      }
    } catch (err: any) {
      toast.error(`Falha: ${err.message}`);
      setApiLogs(prev => ({ ...prev, [apiId]: [`[ERRO DE EXECUÇÃO] ${err.message}`] }));
    } finally {
      setIsLoading(prev => ({ ...prev, [apiId]: false }));
    }
  };

  // Chatbot interativo na aba da Brainshop
  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    
    setIsLoading(prev => ({ ...prev, brainshop: true }));
    try {
      const res = await chatWithBrainshop({ bid: brainshopBid, key: brainshopKey }, userMsg);
      if (res.success && res.data) {
        setChatHistory(prev => [...prev, { sender: "bot", text: res.data.cnt || res.data.msg || "Não entendi." }]);
        setApiLogs(prev => ({ ...prev, brainshop: res.debugLog }));
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(prev => ({ ...prev, brainshop: false }));
    }
  };

  // Ação de importar livro para a biblioteca escolar
  const handleAddToLibrary = (bookTitle: string, author: string) => {
    toast.success(`Livro "${bookTitle}" (${author}) importado com sucesso para a Biblioteca Hemera!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      
      {/* Cabeçalho */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl border border-indigo-900/50">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/40">
                <Plug className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Administração</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white font-display tracking-tight mb-2">
              Central de Integrações e APIs
            </h1>
            <p className="text-slate-300 max-w-xl">
              Configure, teste e execute 15 provedores de serviços educacionais externos e ferramentas de desenvolvimento integrados no Hemera.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => toast.info("Sincronizando todas as credenciais ativas...")}
              className="px-4 py-2 bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 rounded-xl hover:bg-indigo-600/50 transition-all font-semibold flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" /> Sincronizar Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Menu Lateral de Seleção (4 Colunas) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar integrações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Filtros de Categoria */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
            {[
              { id: "all", label: "Todas" },
              { id: "books", label: "Livros" },
              { id: "productivity", label: "Produtividade" },
              { id: "media", label: "Mídia/Design" },
              { id: "utilities", label: "Utilidades" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat.id 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Lista de Itens */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredApis.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhuma integração encontrada.
              </div>
            ) : filteredApis.map((api) => {
              const isSelected = api.id === selectedApiId;
              const hasConfig = api.authRequired;
              return (
                <button
                  key={api.id}
                  onClick={() => {
                    setSelectedApiId(api.id);
                    // Reseta aba para playground
                    setActiveTab("playground");
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex gap-3.5 items-start ${
                    isSelected 
                      ? "bg-gradient-to-br from-indigo-50/50 to-violet-50/50 border-indigo-500/50 shadow-sm" 
                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                      : "bg-white text-slate-500 border-slate-200"
                  }`}>
                    {renderIcon(api.iconName, "w-4.5 h-4.5")}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex justify-between items-center gap-2">
                      <h3 className={`font-bold text-sm truncate ${isSelected ? "text-indigo-950" : "text-slate-800"}`}>
                        {api.name}
                      </h3>
                      {api.authRequired && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black tracking-wide ${
                          api.status === "Conectado" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {api.status === "Conectado" ? "Ativo" : "Auth"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {api.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Console / Playground Workspace (8 Colunas) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Menu de Abas da API selecionada */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                {renderIcon(selectedApi.iconName, "w-4 h-4")}
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 text-base">{selectedApi.name}</h2>
                <a href={selectedApi.docsUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                  Manual de Integração <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Abas */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActiveTab("playground")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "playground" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Play className="w-3.5 h-3.5" /> Playground
              </button>
              <button
                onClick={() => setActiveTab("config")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "config" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" /> Configuração
              </button>
              <button
                onClick={() => setActiveTab("docs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "docs" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Info className="w-3.5 h-3.5" /> Detalhes/Docs
              </button>
            </div>
          </div>

          {/* Conteúdo da Aba */}
          <div className="flex-1 p-6 flex flex-col min-h-0">
            
            {/* 1. ABA PLAYGROUND INTERATIVO */}
            {activeTab === "playground" && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                {/* Inputs de Controle Específicos para cada API */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <h3 className="font-extrabold text-slate-700 text-sm flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-500" /> Parâmetros de Execução
                  </h3>
                  
                  {/* GOV.BR SIGN */}
                  {selectedApi.id === "gov-br" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">CPF do Assinante</label>
                        <input
                          type="text"
                          value={govBrCpf}
                          onChange={(e) => setGovBrCpf(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Documento</label>
                        <input
                          type="text"
                          value={govBrDocName}
                          onChange={(e) => setGovBrDocName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* EMOJIHUB */}
                  {selectedApi.id === "emojihub" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Categoria de Emojis</label>
                      <select
                        value={emojiCategory}
                        onChange={(e) => setEmojiCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Qualquer Categoria (Aleatório)</option>
                        <option value="smileys-and-people">Pessoas & Expressões (smileys-and-people)</option>
                        <option value="animals-and-nature">Animais & Natureza (animals-and-nature)</option>
                        <option value="food-and-drink">Comida & Bebida (food-and-drink)</option>
                        <option value="travel-and-places">Viagens & Lugares (travel-and-places)</option>
                        <option value="activities">Atividades (activities)</option>
                        <option value="objects">Objetos (objects)</option>
                        <option value="symbols">Símbolos (symbols)</option>
                        <option value="flags">Bandeiras (flags)</option>
                      </select>
                    </div>
                  )}

                  {/* MAGNIFIC ICONS */}
                  {selectedApi.id === "magnific" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Prompt para Criação do Ícone</label>
                        <input
                          type="text"
                          value={magnificPrompt}
                          onChange={(e) => setMagnificPrompt(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Estilo Visual</label>
                        <select
                          value={magnificStyle}
                          onChange={(e) => setMagnificStyle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="neon-3d">3D Neon Glow</option>
                          <option value="minimalist-flat">Plano Minimalista</option>
                          <option value="hand-drawn-doodle">Desenho à Mão</option>
                          <option value="glassmorphism">Glassmorphism Soft</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* LORDICON */}
                  {selectedApi.id === "lordicon" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Selecionar Ícone</label>
                        <select
                          value={selectedLordicon}
                          onChange={(e) => setSelectedLordicon(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {lordiconCatalog.map(icon => (
                            <option key={icon.id} value={icon.id}>{icon.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Gatilho de Animação</label>
                        <select
                          value={lordiconTrigger}
                          onChange={(e) => setLordiconTrigger(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="hover">Hover (Mouse por cima)</option>
                          <option value="click">Click (Ao Clicar)</option>
                          <option value="loop">Loop (Contínuo)</option>
                          <option value="morph">Morph (Transição)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Cor Primária</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={lordiconColor}
                            onChange={(e) => setLordiconColor(e.target.value)}
                            className="w-8 h-8 rounded border cursor-pointer"
                          />
                          <span className="text-xs font-mono">{lordiconColor}</span>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleExecute}
                          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5" /> Atualizar Player
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BRITISH LIBRARY BIBLIOGRAPHY */}
                  {selectedApi.id === "bnb" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Palavra-chave para busca no BNB (SPARQL)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bnbQuery}
                          onChange={(e) => setBnbQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleExecute}
                          disabled={isLoading.bnb}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          {isLoading.bnb ? "Processando..." : "Executar SPARQL"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* GOOGLE BOOKS */}
                  {selectedApi.id === "gbooks" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Termo de Pesquisa no Google Books</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={gbooksQuery}
                          onChange={(e) => setGbooksQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleExecute}
                          disabled={isLoading.gbooks}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          {isLoading.gbooks ? "Buscando..." : "Pesquisar Livros"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OPEN LIBRARY */}
                  {selectedApi.id === "olibrary" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Termo de Pesquisa no Open Library</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={olibraryQuery}
                          onChange={(e) => setOlibraryQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleExecute}
                          disabled={isLoading.olibrary}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          {isLoading.olibrary ? "Consultando..." : "Pesquisar no Acervo"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PENGUIN RANDOM HOUSE */}
                  {selectedApi.id === "prh" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Pesquisar Títulos/Autores (Random House)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={prhQuery}
                          onChange={(e) => setPrhQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleExecute}
                          disabled={isLoading.prh}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          {isLoading.prh ? "Consultando..." : "Pesquisar Títulos"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* POETRYDB */}
                  {selectedApi.id === "poetrydb" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Pesquisar por Autor ou Título de Poema</label>
                          <input
                            type="text"
                            value={poetryQuery}
                            onChange={(e) => setPoetryQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Filtro</label>
                          <select
                            value={poetryIsAuthor ? "author" : "title"}
                            onChange={(e) => setPoetryIsAuthor(e.target.value === "author")}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                          >
                            <option value="author">Filtrar por Autor</option>
                            <option value="title">Filtrar por Título</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleExecute}
                          disabled={isLoading.poetrydb}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          {isLoading.poetrydb ? "Buscando Poema..." : "Buscar Poemas"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* WOLNE LEKTURY */}
                  {selectedApi.id === "wolnelektury" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Buscar Obra no Wolne Lektury (Polonês/Domínio Público)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={wolneQuery}
                          onChange={(e) => setWolneQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleExecute}
                          disabled={isLoading.wolnelektury}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          {isLoading.wolnelektury ? "Pesquisando..." : "Buscar Obras"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TRELLO */}
                  {selectedApi.id === "trello" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Cartão/Tarefa</label>
                        <input
                          type="text"
                          value={trelloTaskName}
                          onChange={(e) => setTrelloTaskName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Descrição</label>
                        <input
                          type="text"
                          value={trelloTaskDesc}
                          onChange={(e) => setTrelloTaskDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* GOOGLE CALENDAR */}
                  {selectedApi.id === "gcal" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Título do Evento</label>
                        <input
                          type="text"
                          value={calSummary}
                          onChange={(e) => setCalSummary(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none mb-3"
                        />
                        <label className="block text-xs font-bold text-slate-500 mb-1">Descrição do Evento</label>
                        <input
                          type="text"
                          value={calDesc}
                          onChange={(e) => setCalDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Horário de Início (ISO)</label>
                        <input
                          type="datetime-local"
                          value={calStart}
                          onChange={(e) => setCalStart(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none mb-3"
                        />
                        <label className="block text-xs font-bold text-slate-500 mb-1">Horário de Término (ISO)</label>
                        <input
                          type="datetime-local"
                          value={calEnd}
                          onChange={(e) => setCalEnd(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* BASE API */}
                  {selectedApi.id === "base-api" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Chave KV no Banco</label>
                        <input
                          type="text"
                          value={baseDbKey}
                          onChange={(e) => setBaseDbKey(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Valor</label>
                        <input
                          type="text"
                          value={baseDbVal}
                          onChange={(e) => setBaseDbVal(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* BRAINSHOP AI CHATBOT */}
                  {selectedApi.id === "brainshop" && (
                    <div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-1">
                        Use o campo de conversa interativo na seção de resultados abaixo para testar este bot de conversação em tempo real.
                      </p>
                    </div>
                  )}

                  {/* GOOGLE WORKSPACE */}
                  {selectedApi.id === "gworkspace" && (
                    <div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-1">
                        Permite acessar sua conta do Google Drive escolar para associar arquivos às ementas do professor.
                      </p>
                    </div>
                  )}

                  {/* Botão de disparo para APIs comuns */}
                  {selectedApi.id !== "bnb" && 
                   selectedApi.id !== "gbooks" && 
                   selectedApi.id !== "olibrary" && 
                   selectedApi.id !== "prh" && 
                   selectedApi.id !== "poetrydb" && 
                   selectedApi.id !== "wolnelektury" && 
                   selectedApi.id !== "lordicon" && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleExecute}
                        disabled={isLoading[selectedApi.id]}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        {isLoading[selectedApi.id] ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Conectando Servidor...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Executar Operação
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Área de Visualização de Resultados */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 mt-6">
                  
                  {/* Logs de Depuração (5 Colunas) */}
                  <div className="md:col-span-5 bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2">Logs da Conexão</span>
                    <div className="flex-1 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1.5 max-h-[220px]">
                      {apiLogs[selectedApi.id]?.length > 0 ? (
                        apiLogs[selectedApi.id].map((log, index) => (
                          <div key={index} className="leading-relaxed border-l-2 border-indigo-500/30 pl-2">
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 italic py-2 text-center">Nenhuma operação realizada ainda neste ciclo de sessão.</div>
                      )}
                    </div>
                  </div>

                  {/* Renderizador de Dados / JSON (7 Colunas) */}
                  <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Dados Retornados (Visualização/JSON)</span>
                    <div className="flex-1 overflow-y-auto max-h-[220px] text-xs">
                      
                      {/* Resposta padrão JSON */}
                      {apiResponses[selectedApi.id] && (
                        <div className="space-y-4">
                          
                          {/* Visualizadores Estilizados para APIs específicas */}
                          {/* 1. Assinatura Digital Gov.br */}
                          {selectedApi.id === "gov-br" && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 space-y-2.5">
                              <div className="flex items-center gap-2 font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Documento Assinado Digitalmente
                              </div>
                              <p className="text-[11px] text-emerald-700">
                                O arquivo <strong>{apiResponses["gov-br"].documento.nome}</strong> foi assinado pelo cidadão <strong>{apiResponses["gov-br"].assinante.nome}</strong> via credenciais Gov.br (ICP-Brasil).
                              </p>
                              <div className="text-[10px] bg-white/60 p-2 rounded font-mono text-slate-700 space-y-1">
                                <div>Hash: {apiResponses["gov-br"].documento.hash}</div>
                                <div>ID Assinatura: {apiResponses["gov-br"].id_assinatura}</div>
                                <div>AC Emissora: {apiResponses["gov-br"].assinante.autoridade_certificadora}</div>
                              </div>
                              <a href={apiResponses["gov-br"].link_validacao} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-1">
                                Validar no portal ITI do Governo Federal <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}

                          {/* 2. EmojiHub */}
                          {selectedApi.id === "emojihub" && (
                            <div className="flex items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl bg-white gap-4">
                              <span 
                                className="text-6xl animate-bounce-slow"
                                dangerouslySetInnerHTML={{ __html: apiResponses["emojihub"].htmlCode[0] }} 
                              />
                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-800 capitalize">{apiResponses["emojihub"].name}</h4>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Categoria: {apiResponses["emojihub"].category}<br />
                                  Unicode: {apiResponses["emojihub"].unicode[0]}
                                </div>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(apiResponses["emojihub"].htmlCode[0]);
                                    toast.success("Código copiado!");
                                  }}
                                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copiar Código HTML
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 3. Magnific Icons */}
                          {selectedApi.id === "magnific" && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                                <div 
                                  className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"
                                  dangerouslySetInnerHTML={{ __html: apiResponses["magnific"].svg_code }}
                                />
                                <div>
                                  <h4 className="font-bold text-slate-800">Resultado do Ícone Magnific</h4>
                                  <p className="text-[10px] text-slate-500">Geração vetorial inline em estilo <strong>{apiResponses["magnific"].style}</strong></p>
                                </div>
                              </div>
                              <textarea
                                readOnly
                                value={apiResponses["magnific"].svg_code}
                                className="w-full h-16 font-mono text-[9px] p-2 bg-slate-900 text-slate-300 rounded-lg border border-slate-800"
                              />
                            </div>
                          )}

                          {/* 4. Lordicon */}
                          {selectedApi.id === "lordicon" && (
                            <div className="space-y-3">
                              <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl">
                                {/* Componente Lordicon dinâmico */}
                                <div className="w-20 h-20 mb-2">
                                  <lord-icon
                                    src={lordiconCatalog.find(l => l.id === selectedLordicon)?.src}
                                    trigger={lordiconTrigger}
                                    colors={`primary:${lordiconColor},secondary:#06b6d4`}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold">Passe o mouse / interaja com o ícone acima!</span>
                              </div>
                              <textarea
                                readOnly
                                value={apiResponses["lordicon"].embedCode}
                                className="w-full h-16 font-mono text-[9px] p-2 bg-slate-900 text-slate-300 rounded-lg border border-slate-800"
                              />
                            </div>
                          )}

                          {/* 5. British Library BNB */}
                          {selectedApi.id === "bnb" && (
                            <div className="space-y-2">
                              {Array.isArray(apiResponses["bnb"]) ? (
                                apiResponses["bnb"].map((book: any, idx: number) => (
                                  <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl flex justify-between items-center gap-2">
                                    <div>
                                      <h4 className="font-bold text-slate-800 text-[11px]">{book.title}</h4>
                                      <p className="text-[10px] text-slate-500">{book.author} · {book.date}</p>
                                    </div>
                                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">BNB SPARQL</span>
                                  </div>
                                ))
                              ) : (
                                <pre className="p-2 bg-slate-950 text-emerald-400 font-mono rounded text-[10px] overflow-auto">
                                  {JSON.stringify(apiResponses["bnb"], null, 2)}
                                </pre>
                              )}
                            </div>
                          )}

                          {/* 6. Google Books */}
                          {selectedApi.id === "gbooks" && (
                            <div className="space-y-2">
                              {apiResponses["gbooks"].map((book: any) => (
                                <div key={book.id} className="p-3 bg-white border border-slate-200 rounded-xl flex gap-3 items-start">
                                  <img src={book.thumbnail} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm border border-slate-200" />
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <h4 className="font-bold text-slate-800 text-xs truncate">{book.title}</h4>
                                    <p className="text-[10px] text-slate-500 truncate">{book.authors.join(", ")}</p>
                                    <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight">{book.description}</p>
                                  </div>
                                  <button
                                    onClick={() => handleAddToLibrary(book.title, book.authors[0])}
                                    className="px-2 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded text-[9px] font-bold text-indigo-700 flex items-center gap-0.5 self-center"
                                  >
                                    + Biblioteca
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 7. Open Library */}
                          {selectedApi.id === "olibrary" && (
                            <div className="space-y-2">
                              {apiResponses["olibrary"].map((doc: any, i: number) => (
                                <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex gap-3 items-start">
                                  <img src={doc.thumbnail} alt={doc.title} className="w-12 h-16 object-cover rounded shadow-sm border" />
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <h4 className="font-bold text-slate-800 text-xs truncate">{doc.title}</h4>
                                    <p className="text-[10px] text-slate-500 truncate">{doc.authors.join(", ")}</p>
                                    <p className="text-[9px] text-slate-400">Publicado em: {doc.publishYear}</p>
                                  </div>
                                  <button
                                    onClick={() => handleAddToLibrary(doc.title, doc.authors[0])}
                                    className="px-2 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded text-[9px] font-bold text-indigo-700 flex items-center gap-0.5 self-center"
                                  >
                                    Importar
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 8. Penguin Random House */}
                          {selectedApi.id === "prh" && (
                            <div className="space-y-2">
                              {apiResponses["prh"].map((book: any, idx: number) => (
                                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                                  <div>
                                    <h4 className="font-bold text-slate-800 text-xs">{book.title}</h4>
                                    <p className="text-[10px] text-slate-500">{book.author} · {book.publisher} ({book.pages} pgs)</p>
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-mono">ISBN: {book.isbn}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 9. PoetryDB */}
                          {selectedApi.id === "poetrydb" && (
                            <div className="space-y-4">
                              {apiResponses["poetrydb"].map((poem: any, index: number) => (
                                <div key={index} className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
                                  <h4 className="font-bold text-amber-900 text-xs">{poem.title}</h4>
                                  <p className="text-[10px] text-amber-800 italic">Por {poem.author}</p>
                                  <div className="text-[10px] font-serif leading-relaxed text-slate-700 border-l border-amber-300 pl-3 py-1 whitespace-pre-line max-h-[100px] overflow-y-auto">
                                    {poem.lines.slice(0, 10).join("\n")}
                                    {poem.lines.length > 10 && "\n[...Versos truncados no playground...]"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 10. Wolne Lektury */}
                          {selectedApi.id === "wolnelektury" && (
                            <div className="space-y-2">
                              {apiResponses["wolnelektury"].map((book: any, idx: number) => (
                                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                                  <div>
                                    <h4 className="font-bold text-slate-800 text-xs">{book.title}</h4>
                                    <p className="text-[10px] text-slate-500">{book.author} · {book.epoch} ({book.genre})</p>
                                  </div>
                                  <button
                                    onClick={() => handleAddToLibrary(book.title, book.author)}
                                    className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[9px] font-bold text-slate-700 hover:bg-slate-200"
                                  >
                                    Vincular Aula
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 11. Trello */}
                          {selectedApi.id === "trello" && (
                            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-3 text-sky-900">
                              <div className="flex items-center gap-2 font-bold text-xs">
                                <Trello className="w-4 h-4 text-sky-600" /> Quadro de Sincronização de Tarefas (Atlassian)
                              </div>
                              <div className="bg-white rounded-lg border border-sky-100 p-3 space-y-1.5 shadow-sm text-slate-700">
                                <span className="text-[9px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.5 rounded">A FAZER</span>
                                <h4 className="font-bold text-xs">{apiResponses["trello"].name}</h4>
                                <p className="text-[10px] text-slate-500">{apiResponses["trello"].desc}</p>
                              </div>
                              <p className="text-[10px] text-sky-700">Cartão ID: <code>{apiResponses["trello"].id}</code> criado. Sincronização de tarefas ativa.</p>
                            </div>
                          )}

                          {/* 12. Google Calendar */}
                          {selectedApi.id === "gcal" && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 text-blue-900">
                              <div className="flex items-center gap-2 font-bold text-xs">
                                <Calendar className="w-4 h-4 text-blue-600" /> Integração com Google Workspace
                              </div>
                              <div className="bg-white rounded-lg border border-blue-100 p-3 shadow-sm text-slate-700 space-y-1.5">
                                <h4 className="font-bold text-xs flex justify-between">
                                  <span>{apiResponses["gcal"].summary}</span>
                                  <span className="text-[9px] text-emerald-600 font-bold">CONFIRMADO</span>
                                </h4>
                                <p className="text-[10px] text-slate-500">{apiResponses["gcal"].description}</p>
                                <div className="text-[9px] font-mono text-slate-400">
                                  Início: {apiResponses["gcal"].start.dateTime}<br />
                                  Término: {apiResponses["gcal"].end.dateTime}
                                </div>
                              </div>
                              <p className="text-[10px] text-blue-600 font-bold">Evento agendado no calendário oficial do professor.</p>
                            </div>
                          )}

                          {/* 13. Base API */}
                          {selectedApi.id === "base-api" && (
                            <div className="space-y-2">
                              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-[11px] font-bold">
                                Chave KV salva com sucesso em base-api.io!
                              </div>
                              <pre className="p-3 bg-slate-900 text-slate-300 font-mono rounded-xl text-[10px] overflow-auto leading-relaxed border border-slate-800">
                                {JSON.stringify(apiResponses["base-api"], null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* 15. Google Workspace Drive */}
                          {selectedApi.id === "gworkspace" && (
                            <div className="space-y-2">
                              {gdriveFiles.map((file: any) => (
                                <div key={file.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                                    <span className="font-bold text-slate-800 text-[11px] truncate">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => toast.success(`Arquivo "${file.name}" vinculado ao AVA!`)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border border-slate-300"
                                  >
                                    Vincular AVA
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* JSON Geral de visualização para depuração */}
                          {selectedApi.id !== "gov-br" && 
                           selectedApi.id !== "emojihub" && 
                           selectedApi.id !== "magnific" && 
                           selectedApi.id !== "lordicon" && 
                           selectedApi.id !== "gbooks" && 
                           selectedApi.id !== "olibrary" && 
                           selectedApi.id !== "poetrydb" && 
                           selectedApi.id !== "trello" && 
                           selectedApi.id !== "gcal" && 
                           selectedApi.id !== "base-api" && 
                           selectedApi.id !== "gworkspace" && (
                            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono rounded-xl text-[10px] overflow-auto max-h-[160px] leading-relaxed border border-slate-850">
                              {JSON.stringify(apiResponses[selectedApi.id], null, 2)}
                            </pre>
                          )}
                        </div>
                      )}

                      {/* Playground exclusivo e direto do Chatbot Brainshop AI */}
                      {selectedApi.id === "brainshop" && (
                        <div className="flex flex-col h-[200px]">
                          <div className="flex-1 overflow-y-auto space-y-2.5 mb-3 pr-1">
                            {chatHistory.map((chat, idx) => (
                              <div 
                                key={idx} 
                                className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div className={`max-w-[80%] rounded-2xl p-2.5 text-xs ${
                                  chat.sender === "user" 
                                    ? "bg-indigo-600 text-white rounded-tr-none" 
                                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                                }`}>
                                  {chat.text}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Digite uma mensagem..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSendChat();
                              }}
                              className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              onClick={handleSendChat}
                              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {!apiResponses[selectedApi.id] && selectedApi.id !== "brainshop" && (
                        <div className="text-slate-400 italic py-8 text-center">Nenhum dado retornado. Clique em &quot;Executar Operação&quot; acima para acionar a chamada de API.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABA CONFIGURAÇÃO DE CREDENCIAIS */}
            {activeTab === "config" && (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Lock className="w-5 h-5 text-indigo-500" />
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">Credenciais & tokens de acesso</h3>
                      <p className="text-[10px] text-slate-500">Estes dados são mantidos localmente no seu navegador para simulações seguras.</p>
                    </div>
                  </div>

                  {/* Configurações específicas com base na API selecionada */}
                  {selectedApi.id === "gov-br" && (
                    <div className="space-y-4">
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
                        A integração oficial requer cadastro como Parceiro Gov.br e configuração de certificados ICP-Brasil.
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Client ID (Provedor)</label>
                          <input type="text" placeholder="Ex: hemera_assinaturas_portal" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Client Secret Token</label>
                          <input type="password" value="*************************" readOnly className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedApi.id === "trello" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Trello Developer API Key</label>
                        <input 
                          type="text" 
                          value={trelloKey}
                          onChange={(e) => setTrelloKey(e.target.value)}
                          placeholder="Cole sua Developer Key do Trello" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Trello Token</label>
                        <input 
                          type="password" 
                          value={trelloToken}
                          onChange={(e) => setTrelloToken(e.target.value)}
                          placeholder="Cole seu Token gerado" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none" 
                        />
                      </div>
                      <button 
                        onClick={() => {
                          saveCredentials("h_trello_key", trelloKey, "h_trello_key");
                          saveCredentials("h_trello_token", trelloToken, "h_trello_token");
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Salvar Credenciais Trello
                      </button>
                    </div>
                  )}

                  {selectedApi.id === "brainshop" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Brainshop Brain ID (bid)</label>
                          <input 
                            type="text" 
                            value={brainshopBid}
                            onChange={(e) => setBrainshopBid(e.target.value)}
                            placeholder="Ex: 15907" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Brainshop API Key</label>
                          <input 
                            type="password" 
                            value={brainshopKey}
                            onChange={(e) => setBrainshopKey(e.target.value)}
                            placeholder="Sua chave secreta Brainshop" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none" 
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          saveCredentials("h_brainshop_bid", brainshopBid, "h_brainshop_bid");
                          saveCredentials("h_brainshop_key", brainshopKey, "h_brainshop_key");
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Salvar Credenciais Chatbot
                      </button>
                    </div>
                  )}

                  {selectedApi.id === "base-api" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Base API Secret Key</label>
                        <input 
                          type="password" 
                          value={baseApiKey}
                          onChange={(e) => setBaseApiKey(e.target.value)}
                          placeholder="Sua Secret Key cadastrada" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none" 
                        />
                      </div>
                      <button 
                        onClick={() => saveCredentials("h_base_key", baseApiKey, "h_base_key")}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Salvar Chave Base API
                      </button>
                    </div>
                  )}

                  {!selectedApi.authRequired && (
                    <div className="p-5 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded-xl bg-white leading-relaxed">
                      Esta API é pública e <strong>não requer autenticação</strong> (API Keys, Client Secrets ou OAuth2).<br />
                      Você pode realizar testes e chamadas diretamente na aba de <strong>Playground</strong> sem configurações prévias.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. ABA DOCUMENTAÇÃO & DETALHES */}
            {activeTab === "docs" && (
              <div className="space-y-5 text-slate-600 text-xs leading-relaxed max-h-[420px] overflow-y-auto pr-1">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-sm">Resumo da Integração</h3>
                  <p>{selectedApi.description}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-sm">Fluxo Técnico e Endpoints</h3>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 whitespace-pre overflow-x-auto leading-relaxed">
                    {selectedApi.id === "gov-br" && (
                      `1. Redirecionar Usuário para: GET https://autorizador.assinatura.br/oauth/authorize\n` +
                      `2. Receber o authorization_code via callback de redirecionamento\n` +
                      `3. Trocar por access_token: POST https://autorizador.assinatura.br/oauth/token\n` +
                      `4. Calcular Hash SHA256 do arquivo a ser assinado digitalmente\n` +
                      `5. Efetuar assinatura: POST https://assinador.assinatura.br/assinaturas/v1/assinaturas`
                    )}
                    {selectedApi.id === "emojihub" && (
                      `Endpoint Principal (GET):\n` +
                      `https://emojihub.yurace.pro/api/random\n\n` +
                      `Endpoint com Filtros (GET):\n` +
                      `https://emojihub.yurace.pro/api/random/category/{categoria}\n` +
                      `https://emojihub.yurace.pro/api/random/group/{grupo}`
                    )}
                    {selectedApi.id === "magnific" && (
                      `Gerar Ícone por IA (POST):\n` +
                      `Headers: { Authorization: "Bearer [API_KEY]" }\n` +
                      `URL: https://api.magnific.com/v1/icons/generate\n` +
                      `Payload: { prompt: string, style: string, size: "128x128" | "256x256" }`
                    )}
                    {selectedApi.id === "lordicon" && (
                      `Código de incorporação do Web Component:\n` +
                      `<!-- Carregar Lordicon CDN -->\n` +
                      `<script src="https://cdn.lordicon.com/lordicon.js"></script>\n\n` +
                      `<!-- Usar elemento Web Component no HTML -->\n` +
                      `<lord-icon\n` +
                      `  src="https://cdn.lordicon.com/wxnxpqly.json"\n` +
                      `  trigger="hover"\n` +
                      `  colors="primary:#4f46e5,secondary:#0891b2"\n` +
                      `  style="width:64px;height:64px">\n` +
                      `</lord-icon>`
                    )}
                    {selectedApi.id === "bnb" && (
                      `SPARQL RDF Query (GET/POST):\n` +
                      `Endpoint: http://bnb.data.bl.uk/sparql\n` +
                      `Accept headers: application/sparql-results+json, application/rdf+xml`
                    )}
                    {selectedApi.id === "gbooks" && (
                      `Pesquisa Geral (GET):\n` +
                      `https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=10`
                    )}
                    {selectedApi.id === "olibrary" && (
                      `Busca Geral de Títulos (GET):\n` +
                      `https://openlibrary.org/search.json?q={query}\n\n` +
                      `Visualizador de Capas de Livros:\n` +
                      `https://covers.openlibrary.org/b/id/{cover_id}-M.jpg`
                    )}
                    {selectedApi.id === "prh" && (
                      `Catálogo de Livros PRH (GET):\n` +
                      `https://reststop.randomhouse.com/resources/titles?search={query}\n` +
                      `Headers: { Accept: "application/json" }`
                    )}
                    {selectedApi.id === "poetrydb" && (
                      `Consultar poemas por autor (GET):\n` +
                      `https://poetrydb.org/author/{author_name}\n\n` +
                      `Consultar poemas por título (GET):\n` +
                      `https://poetrydb.org/title/{poem_title}`
                    )}
                    {selectedApi.id === "wolnelektury" && (
                      `Listar todos os livros de domínio público (GET):\n` +
                      `https://wolnelektury.pl/api/books/\n\n` +
                      `Detalhe do livro (GET):\n` +
                      `https://wolnelektury.pl/api/books/{slug}/`
                    )}
                    {selectedApi.id === "trello" && (
                      `Criar Cartão em Lista (POST):\n` +
                      `https://api.trello.com/1/cards?key={key}&token={token}&idList={id_lista}\n` +
                      `Query Params: { name: string, desc: string, due: date }`
                    )}
                    {selectedApi.id === "gcal" && (
                      `Criar Evento no Calendário (POST):\n` +
                      `Headers: { Authorization: "Bearer [OAuth_Token]" }\n` +
                      `URL: https://www.googleapis.com/calendar/v3/calendars/primary/events\n` +
                      `Payload: { summary: string, start: { dateTime }, end: { dateTime } }`
                    )}
                    {selectedApi.id === "base-api" && (
                      `Armazenamento de Valores KV (POST):\n` +
                      `Headers: { Authorization: "Bearer [API_KEY]" }\n` +
                      `URL: https://api.base-api.io/v1/storage\n` +
                      `Payload: { key: string, value: string }`
                    )}
                    {selectedApi.id === "brainshop" && (
                      `Obter resposta do Chatbot (GET):\n` +
                      `https://api.brainshop.ai/get?bid={bid}&key={key}&uid={uid}&msg={msg}`
                    )}
                    {selectedApi.id === "gworkspace" && (
                      `Listar Arquivos do Drive (GET):\n` +
                      `Headers: { Authorization: "Bearer [OAuth_Token]" }\n` +
                      `URL: https://www.googleapis.com/drive/v3/files?q=mimeType='application/pdf'`
                    )}
                  </div>
                </div>

                <div className="flex justify-start">
                  <a
                    href={selectedApi.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    Acessar Documentação Oficial <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
