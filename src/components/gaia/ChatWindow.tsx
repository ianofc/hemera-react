import React, { useEffect, useRef, useState } from "react";
import { GaiaChat, GaiaMessage, gaiaService } from "@/services/gaiaService";
import { Paperclip, Send, Mic, Sparkles, Image as ImageIcon, Map as MapIcon, Video, FileText, Bot, Eye, Layers, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArtifactViewer } from "@/components/intelligence/ArtifactViewer";

interface ChatWindowProps {
  chat: GaiaChat;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const [messages, setMessages] = useState<GaiaMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Get my user ID
    supabase.auth.getUser().then(({ data }) => setMyUserId(data.user?.id || null));
    
    // 2. Load initial messages
    loadMessages();

    // 3. Subscribe to Realtime Websockets!
    const channel = gaiaService.subscribeToMessages(chat.id, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    });

    return () => {
      gaiaService.unsubscribe(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id]);

  const loadMessages = async () => {
    try {
      const msgs = await gaiaService.getMessages(chat.id);
      setMessages(msgs);
      scrollToBottom();
    } catch (e) {
      console.error("Erro ao carregar mensagens", e);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText(""); // Optimistic clear

    try {
      await gaiaService.sendMessage(chat.id, textToSend);
      scrollToBottom();
    } catch (e) {
      console.error("Erro ao enviar mensagem", e);
      // Revert if error
      setInputText(textToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Funções de mock para anexos dos Agentes da PentaIA (Botões mágicos no input)
  const sendAgentCommand = async (agentName: string, toolId: string) => {
    const defaultPrompts: Record<string, string> = {
      imagem: "Gere uma imagem educacional sobre o tema...",
      mapa_mental: "Crie um mapa mental detalhado sobre...",
      video: "Descreva um vídeo educativo para auxiliar a aula de...",
      plano_aula: "Gere um plano de aula completo em Markdown sobre...",
      logs: "Analise os seguintes logs do sistema...",
      padroes: "Identifique padrões cognitivos na atividade de...",
      ocr: "Extraia o texto semântico estruturado desta imagem ou log...",
      saude_sara: "Verifique o status de saúde SARA e alocação de threads...",
      scoring: "Calcule o score heurístico do Accubens para a atividade...",
      recursos: "Otimize a alocação de recursos de CPU...",
      status_filas: "Mostre o status atual de mensageria das filas Pub/Sub...",
      ws_sync: "Sincronize as instâncias conectadas via WebSockets...",
      bus_ping: "Realize um ping de latência no barramento central Mercúrio...",
      auditoria: "Gere um log de auditoria de acessos de segurança recentes...",
      checar_ip: "Verifique a reputação de segurança do IP 185.220.101.5...",
      waf_test: "Simule uma ameaça e teste as regras ativas do WAF..."
    };

    const textToSend = inputText || defaultPrompts[toolId] || "Gere um artefato sobre o tema...";
    setInputText("");
    try {
      await gaiaService.sendMessage(chat.id, `[Comando ${agentName.toUpperCase()}: ${toolId}] ${textToSend}`);
      scrollToBottom();
    } catch (e) {
      console.error("Erro", e);
    }
  };

  const sendZiosCommand = async (toolId: string) => {
    await sendAgentCommand("ZIOS", toolId);
  };

  const isPentaIA = chat.tipo.startsWith('ai_');

  const getPentaIcon = (tipo: string, className: string) => {
    switch (tipo) {
      case 'ai_zios': return <Bot className={className} />;
      case 'ai_iris': return <Eye className={className} />;
      case 'ai_tas': return <Layers className={className} />;
      case 'ai_mercurio': return <Zap className={className} />;
      case 'ai_heimdall': return <Shield className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const getPentaColor = (tipo: string) => {
    switch (tipo) {
      case 'ai_zios': return 'text-indigo-400';
      case 'ai_iris': return 'text-purple-400';
      case 'ai_tas': return 'text-emerald-400';
      case 'ai_mercurio': return 'text-amber-400';
      case 'ai_heimdall': return 'text-slate-300';
      default: return 'text-indigo-400';
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header do Chat */}
      <div className="h-16 border-b border-white/5 bg-slate-900/80 backdrop-blur-md flex items-center px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
            {isPentaIA ? getPentaIcon(chat.tipo, `${getPentaColor(chat.tipo)} h-5 w-5`) : <div className="text-slate-400 font-bold">{chat.titulo?.[0] || 'C'}</div>}
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">{chat.titulo}</h3>
            <p className="text-xs text-slate-500">
              {isPentaIA ? 'Nó PentaIA conectado' : 'Membros da rede GAIA'}
            </p>
          </div>
        </div>
      </div>

      {/* Background sutil estilo Telegram */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            <div className="bg-slate-900/50 inline-block px-4 py-2 rounded-full border border-white/5">
              Nenhuma mensagem ainda. Inicie a comunicação via Thorth.
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === myUserId;
          const isAgent = isPentaIA && !isMine;

          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
              {!isMine && (
                <div className="h-8 w-8 rounded-full bg-slate-800 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden border border-white/10 self-end mb-1">
                  {isAgent ? getPentaIcon(chat.tipo, `${getPentaColor(chat.tipo)} h-4 w-4`) : (
                    msg.sender?.avatar_url ? <img src={msg.sender.avatar_url} alt="Avatar" /> : <span className="text-xs text-slate-400">{msg.sender?.first_name?.[0] || 'U'}</span>
                  )}
                </div>
              )}
              
              <div className={`max-w-[75%] rounded-2xl p-3 ${
                isMine 
                  ? 'bg-indigo-600 text-white rounded-br-sm' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-white/5'
              }`}>
                {/* Opcional: Se a mensagem for um JSON de Artefato do ZIOS, renderizar bonito */}
                {msg.tipo_anexo ? (
                   // Renderizador de Artefato Especial embutido no chat
                   <div className="mt-1">
                     <p className="text-sm italic mb-2 opacity-80 border-b border-white/10 pb-2">{msg.conteudo}</p>
                     <ArtifactViewer artifact={{
                       id: msg.id,
                       tipo: msg.tipo_anexo,
                       url_storage: msg.url_anexo || msg.conteudo, // Simplificação
                       prompt_origem: '',
                       contexto_id: null,
                       created_at: msg.created_at
                     }} />
                   </div>
                ) : (
                  <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.conteudo}</p>
                )}
                
                <div className={`text-[10px] text-right mt-1 opacity-60 ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Input */}
      <div className="p-4 bg-slate-900 border-t border-white/5 z-10">
        {isPentaIA && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 px-1">
            {chat.tipo === 'ai_zios' && (
              <>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('ZIOS', 'imagem')}>
                  <ImageIcon className="h-3 w-3 mr-1 text-pink-400" /> Imagem
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('ZIOS', 'mapa_mental')}>
                  <MapIcon className="h-3 w-3 mr-1 text-cyan-400" /> Mapa
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('ZIOS', 'video')}>
                  <Video className="h-3 w-3 mr-1 text-purple-400" /> Vídeo
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('ZIOS', 'plano_aula')}>
                  <FileText className="h-3 w-3 mr-1 text-emerald-400" /> Plano
                </Button>
              </>
            )}
            {chat.tipo === 'ai_iris' && (
              <>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('IRIS', 'logs')}>
                  <FileText className="h-3 w-3 mr-1 text-pink-400" /> Analisar Logs
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('IRIS', 'padroes')}>
                  <Eye className="h-3 w-3 mr-1 text-cyan-400" /> Padrões
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('IRIS', 'ocr')}>
                  <ImageIcon className="h-3 w-3 mr-1 text-purple-400" /> Extrair OCR
                </Button>
              </>
            )}
            {chat.tipo === 'ai_tas' && (
              <>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('TAS', 'saude_sara')}>
                  <Sparkles className="h-3 w-3 mr-1 text-pink-400" /> Saúde SARA
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('TAS', 'scoring')}>
                  <Layers className="h-3 w-3 mr-1 text-cyan-400" /> Scoring
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('TAS', 'recursos')}>
                  <Layers className="h-3 w-3 mr-1 text-purple-400" /> Recursos
                </Button>
              </>
            )}
            {chat.tipo === 'ai_mercurio' && (
              <>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('MERCÚRIO', 'status_filas')}>
                  <Layers className="h-3 w-3 mr-1 text-pink-400" /> Status Filas
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('MERCÚRIO', 'ws_sync')}>
                  <Zap className="h-3 w-3 mr-1 text-cyan-400" /> WS Sync
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('MERCÚRIO', 'bus_ping')}>
                  <Zap className="h-3 w-3 mr-1 text-purple-400" /> Bus Ping
                </Button>
              </>
            )}
            {chat.tipo === 'ai_heimdall' && (
              <>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('HEIMDALL', 'auditoria')}>
                  <FileText className="h-3 w-3 mr-1 text-pink-400" /> Auditoria
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('HEIMDALL', 'checar_ip')}>
                  <Eye className="h-3 w-3 mr-1 text-cyan-400" /> Checar IP
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-950 border-white/10 text-slate-300 hover:text-white" onClick={() => sendAgentCommand('HEIMDALL', 'waf_test')}>
                  <Shield className="h-3 w-3 mr-1 text-purple-400" /> Testar WAF
                </Button>
              </>
            )}
          </div>
        )}

        <div className="flex items-end gap-2 bg-black/40 p-1 pl-3 rounded-2xl border border-white/10">
          <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors mb-1 rounded-full hover:bg-white/5">
            <Paperclip className="h-5 w-5" />
          </button>
          
          <input 
            type="text"
            className="flex-1 bg-transparent border-none text-white focus:ring-0 resize-none py-3 text-[15px] outline-none"
            placeholder={isPentaIA ? `Envie uma instrução para ${chat.titulo?.split(' ')[0]}...` : "Mensagem..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          
          {inputText.trim() ? (
            <button 
              onClick={handleSend}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors shadow-lg m-0.5"
            >
              <Send className="h-5 w-5 ml-0.5" />
            </button>
          ) : (
            <button className="p-3 text-slate-400 hover:text-slate-200 transition-colors mb-0.5 rounded-full hover:bg-white/5">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
