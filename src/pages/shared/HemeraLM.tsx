import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, BrainCircuit, FileText, CheckCircle2, Search, Sparkles, 
  Headphones, ListTree, PlayCircle, Send, User, MessageSquare, HelpCircle
} from "lucide-react";

export default function HemeraLM() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([
    { role: 'assistant', text: "Olá! Eu sou o ZIOS, sua IA conectada aos documentos desta turma. Como posso ajudar com os materiais de hoje?" }
  ]);
  const [sources] = useState([
    { id: 1, name: "slides_revolucao.pdf", type: "PDF", selected: true },
    { id: 2, name: "capitulo_5_historia.pdf", type: "PDF", selected: true },
    { id: 3, name: "anotacoes_lousa.txt", type: "Texto", selected: false }
  ]);

  const handleSend = () => {
    if (!query.trim()) return;
    setChat([...chat, { role: 'user', text: query }]);
    setQuery("");
    
    // Simula resposta RAG
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'assistant', 
        text: "De acordo com o arquivo 'slides_revolucao.pdf' (Página 4), a Revolução Francesa foi impulsionada pela crise financeira e pela insatisfação do Terceiro Estado com os privilégios do clero e da nobreza." 
      }]);
    }, 1000);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER NAVBAR */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-indigo-600">
            <BrainCircuit className="w-6 h-6" />
            <h1 className="font-bold text-lg font-display tracking-tight">HemeraLM</h1>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Turma 8º Ano A</span>
        </div>
      </header>

      {/* WORKSPACE CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR (SOURCES) */}
        <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-slate-800">Fontes de Conhecimento</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{sources.filter(s=>s.selected).length} Ativas</span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar nas fontes..." className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sources.map(s => (
              <div key={s.id} className={`p-3 rounded-xl border cursor-pointer transition-colors ${s.selected ? 'bg-white border-indigo-200 shadow-sm' : 'bg-transparent border-slate-200 opacity-60'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${s.selected ? 'text-indigo-500' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold text-slate-700 truncate w-40">{s.name}</span>
                  </div>
                  {s.selected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{s.type}</p>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-white border-t border-slate-200">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 font-bold text-sm h-10 shadow-md">
              + Adicionar Fonte
            </Button>
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="flex-1 flex flex-col bg-white relative">
          
          {/* Top Actions (Audio Overview / Study Guide) */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Ações de Estudo</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button className="flex-shrink-0 flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Resumo em Áudio</p>
                  <p className="text-[10px] text-slate-500">Podcast das fontes ativas</p>
                </div>
              </button>
              
              <button className="flex-shrink-0 flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <ListTree className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Mapa Mental</p>
                  <p className="text-[10px] text-slate-500">Gerar estrutura visual</p>
                </div>
              </button>

              <button className="flex-shrink-0 flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Gerar Quiz</p>
                  <p className="text-[10px] text-slate-500">Testar conhecimento</p>
                </div>
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chat.map((msg, i) => (
              <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-lg'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-slate-100 text-slate-800 rounded-tr-sm' : 'bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tl-sm'}`}>
                  <p className="text-[15px] leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto relative">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte algo sobre os materiais ou gere um resumo..." 
                className="w-full bg-slate-100 border-none rounded-full pl-6 pr-14 py-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-inner"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              ZIOS AI • Suas respostas são baseadas apenas nas fontes selecionadas
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}
