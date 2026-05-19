import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { gaiaService, GaiaChat } from "@/services/gaiaService";
import { Search, Bot, Users, User, MessagesSquare, Paperclip, Send, Mic, Eye, Layers, Zap, Shield } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export function GaiaLayout() {
  const [chats, setChats] = useState<GaiaChat[]>([]);
  const [activeChat, setActiveChat] = useState<GaiaChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      // 1. Garantir que os chats da PentaIA existem
      const pentaChats = await gaiaService.createOrGetPentaIAChats();
      
      // 2. Carregar todos os chats
      const allChats = await gaiaService.getMyChats();
      setChats(allChats);
      
      // Auto-selecionar o ZIOS se for o primeiro acesso
      if (!activeChat) {
        const zios = allChats.find(c => c.tipo === 'ai_zios');
        if (zios) setActiveChat(zios);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro ao carregar GAIA:", error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar à rede GAIA.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getChatIcon = (tipo: string) => {
    switch (tipo) {
      case 'ai_zios': return <Bot className="text-indigo-400 h-6 w-6" />;
      case 'ai_iris': return <Eye className="text-purple-400 h-6 w-6" />;
      case 'ai_tas': return <Layers className="text-emerald-400 h-6 w-6" />;
      case 'ai_mercurio': return <Zap className="text-amber-400 h-6 w-6" />;
      case 'ai_heimdall': return <Shield className="text-slate-300 h-6 w-6" />;
      case 'grupo': return <Users className="text-slate-400 h-6 w-6" />;
      default: return <User className="text-slate-400 h-6 w-6" />;
    }
  };

  const isPentaIA = (tipo: string) => tipo.startsWith('ai_');

  const getAITagColor = (tipo: string) => {
    switch (tipo) {
      case 'ai_zios': return 'bg-indigo-500/20 text-indigo-300';
      case 'ai_iris': return 'bg-purple-500/20 text-purple-300';
      case 'ai_tas': return 'bg-emerald-500/20 text-emerald-300';
      case 'ai_mercurio': return 'bg-amber-500/20 text-amber-300';
      case 'ai_heimdall': return 'bg-slate-500/20 text-slate-300';
      default: return 'bg-indigo-500/20 text-indigo-300';
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 border-t border-white/5 overflow-hidden animate-fade-in-down">
      
      {/* Sidebar - Lista de Chats (Estilo Telegram) */}
      <div className="w-80 flex-shrink-0 border-r border-white/5 bg-slate-900/50 flex flex-col">
        {/* Header Sidebar */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 text-white mb-4">
            <div className="bg-indigo-500/20 p-2 rounded-lg">
              <MessagesSquare className="text-indigo-400 h-5 w-5" />
            </div>
            <h2 className="font-bold text-lg font-display tracking-wide">GAIA</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar chats..." 
              className="w-full bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Lista de Contatos/Chats */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 text-sm">Conectando...</div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeChat?.id === chat.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-white/10">
                  {getChatIcon(chat.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-slate-200 font-semibold text-sm truncate">
                      {chat.titulo || 'Chat Desconhecido'}
                    </h3>
                    {isPentaIA(chat.tipo) && (
                      <span className={`text-[10px] ${getAITagColor(chat.tipo)} px-2 py-0.5 rounded-full uppercase tracking-wider font-bold`}>
                        PentaIA
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs truncate">
                    {isPentaIA(chat.tipo) ? 'Conectado. Operando online.' : 'Toque para abrir a conversa'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área Principal (Chat) */}
      <div className="flex-1 bg-black/40 relative flex flex-col">
        {activeChat ? (
          <ChatWindow chat={activeChat} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="h-24 w-24 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <MessagesSquare className="h-10 w-10 text-slate-700" />
            </div>
            <p className="text-lg font-medium text-slate-400">Selecione um chat para começar</p>
            <p className="text-sm">Rede GAIA conectada.</p>
          </div>
        )}
      </div>

    </div>
  );
}
