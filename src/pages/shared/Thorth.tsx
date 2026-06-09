import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  User, 
  Users, 
  Sparkles, 
  Check, 
  CheckCheck,
  ChevronLeft, 
  Info, 
  Bell, 
  BellOff,
  Mic, 
  Folder,
  ArrowLeft,
  X,
  FileText,
  Volume2,
  Menu,
  File,
  Image,
  Music,
  Trash2,
  Lock,
  Plus,
  Loader2,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";


// --- INTERFACES ---
interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  type: 'private' | 'group' | 'bot' | 'channel';
  status: 'online' | 'offline' | 'typing';
  lastSeen?: string;
  unreadCount: number;
  previewMessage: string;
  previewTime: string;
  bio?: string;
  phone?: string;
  username?: string;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'user' | 'other' | 'bot';
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'image' | 'audio';
  };
}

// --- INITIAL DATA ---
const initialContacts: ChatContact[] = [
  {
    id: "c-zios",
    name: "🤖 ZIOS Bridge (PentaIA)",
    avatar: "🤖",
    avatarBg: "bg-indigo-600 text-white",
    type: "bot",
    status: "online",
    unreadCount: 2,
    previewMessage: "Olá! Como posso ajudar você no ecossistema Hemera hoje?",
    previewTime: "11:15",
    bio: "Núcleo Cognitivo e assistente de IA oficial do Hemera OS. Pergunte-me qualquer dúvida sobre a BNCC ou matérias.",
    username: "@zios_bridge_bot"
  },
  {
    id: "c-group-9a",
    name: "💬 Grupão do 9º Ano A",
    avatar: "👥",
    avatarBg: "bg-emerald-600 text-white",
    type: "group",
    status: "online",
    unreadCount: 5,
    previewMessage: "Fernanda: Pessoal, a tarefa de Física tá difícil...",
    previewTime: "10:50",
    bio: "Grupo de discussão oficial dos estudantes e docentes da turma de Ciências e Matemática do 9º A.",
    username: "@hemera_9a_grupo"
  },
  {
    id: "c-prof-alberto",
    name: "Prof. Alberto Santos",
    avatar: "AS",
    avatarBg: "bg-blue-600 text-white",
    type: "private",
    status: "offline",
    lastSeen: "última vez visto há 2h",
    unreadCount: 0,
    previewMessage: "Tudo bem, aguardo a entrega amanhã.",
    previewTime: "Ontem",
    bio: "Professor de Física Geral e Termodinâmica. Coordenador da olimpíada científica.",
    phone: "+55 (75) 99884-1234",
    username: "@prof_albertosantos"
  },
  {
    id: "c-profa-helena",
    name: "Profa. Helena Martins",
    avatar: "HM",
    avatarBg: "bg-pink-600 text-white",
    type: "private",
    status: "online",
    unreadCount: 0,
    previewMessage: "Parabéns pelas notas na prova de Álgebra!",
    previewTime: "30 mai",
    bio: "Professora de Matemática Aplicada e Álgebra Linear. Doutora em Educação.",
    phone: "+55 (75) 99123-5678",
    username: "@helena_martins"
  },
  {
    id: "c-canal-avisos",
    name: "📢 Canal de Avisos da Reitoria",
    avatar: "📢",
    avatarBg: "bg-red-500 text-white",
    type: "channel",
    status: "offline",
    unreadCount: 1,
    previewMessage: "Reitoria: Cronograma de provas do 2º bimestre liberado.",
    previewTime: "29 mai",
    bio: "Canal oficial para publicação de portarias, calendários letivos e reajustes da reitoria.",
    username: "@hemera_reitoria_canal"
  }
];

const initialMessages: Record<string, ChatMessage[]> = {
  "c-zios": [
    { id: "m-z-1", senderName: "ZIOS Bridge", senderRole: "bot", text: "Olá! Eu sou o ZIOS-Bridge, o assistente inteligente cognitivo integrado ao Thorth. Consigo explicar dúvidas sobre os microsserviços do Hemera OS (como Hermes, Polis, Olimpo e HemeraLM), e também resolver exercícios acadêmicos da BNCC baseando-me nas suas fontes curriculares.", time: "11:14", status: "read" },
    { id: "m-z-2", senderName: "ZIOS Bridge", senderRole: "bot", text: "Como posso ajudar você no ecossistema Hemera hoje?", time: "11:15", status: "read" }
  ],
  "c-group-9a": [
    { id: "m-g-1", senderName: "Gustavo Nogueira", senderRole: "other", text: "Galera, o trabalho de termodinâmica do Prof. Alberto tá tenso. Alguém já fez a questão de dilatação linear?", time: "10:45", status: "read" },
    { id: "m-g-2", senderName: "Fernanda Costa", senderRole: "other", text: "Eu fiz Gustavo! Basicamente você usa a fórmula ΔL = L0 * α * ΔT. O coeficiente do cobre está na apostila.", time: "10:48", status: "read" },
    { id: "m-g-3", senderName: "Gustavo Nogueira", senderRole: "other", text: "Ah, valeu Fernanda! Vou revisar minhas contas aqui.", time: "10:50", status: "read" }
  ],
  "c-prof-alberto": [
    { id: "m-a-1", senderName: "Você", senderRole: "user", text: "Professor, boa tarde. Posso enviar o arquivo do projeto de Física até as 23h de amanhã?", time: "18:40", status: "read" },
    { id: "m-a-2", senderName: "Prof. Alberto Santos", senderRole: "other", text: "Olá! Tudo bem, aguardo a entrega amanhã no Moodle ou no mural de arquivos.", time: "18:45", status: "read" }
  ],
  "c-profa-helena": [
    { id: "m-h-1", senderName: "Profa. Helena Martins", senderRole: "other", text: "Olá! Só passando para parabenizar pelas notas na prova de Álgebra! Seu raciocínio sobre matrizes de rotação foi exemplar.", time: "14:20", status: "read" },
    { id: "m-h-2", senderName: "Você", senderRole: "user", text: "Muito obrigado, Professora! Estudei bastante a apostila que a senhora recomendou.", time: "14:35", status: "read" }
  ],
  "c-canal-avisos": [
    { id: "m-c-1", senderName: "Reitoria", senderRole: "other", text: "Prezados docentes e discentes, o cronograma de provas do 2º bimestre já se encontra disponível no painel acadêmico de cada turma. Certifiquem-se de alinhar as revisões de conteúdo.", time: "10:00", status: "read" }
  ]
};

const EMOLIS = [
  "📚", "✍️", "📝", "🧠", "🎓", "📐", "🔬", "🧪", "🎨", "🎭", "🎮", "⚽", 
  "👍", "👎", "❤️", "😂", "🎉", "🔥", "🤔", "🤖", "✨", "🚀", "💡", "📎", 
  "🔒", "📅", "✅", "❌", "📢", "💬"
];

export const Thorth: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const userId = user?.id || 'mock-professor-id';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Navigation / Filter States
  const [activeFolder, setActiveFolder] = useState<"todos" | "privados" | "grupos" | "bots" | "canais">("todos");
  const [searchContactQuery, setSearchContactQuery] = useState("");
  
  // Active Chat State
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContactId, setActiveContactId] = useState<string>("");
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  
  // Chat Input State
  const [inputText, setInputText] = useState("");
  
  // Sidebar info drawer toggle
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);

  // Popover Toggle States
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string; size: string; type: 'pdf' | 'image' | 'audio' } | null>(null);
  
  // Internal message search states
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  // Muted Chats Map
  const [mutedChats, setMutedChats] = useState<Record<string, boolean>>({});

  // Loading States
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // New Chat Modal States
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState("");
  const [newChatResults, setNewChatResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // References
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // API Call: Fetch rooms
  const fetchRooms = async (selectRoomId?: string) => {
    try {
      setIsLoadingContacts(true);
      const response = await fetch(`${API_BASE_URL}/core/api/chat/rooms/`, {
        headers: {
          'X-User-Id': userId
        }
      });
      if (!response.ok) throw new Error("Erro ao carregar salas");
      const data = await response.json();
      
      const mappedContacts: ChatContact[] = data.rooms.map((r: any) => ({
        id: String(r.id),
        name: r.title,
        avatar: r.avatar || (r.type === 'bot' ? '🤖' : (r.title.charAt(0).toUpperCase())),
        avatarBg: r.type === 'bot' ? 'bg-indigo-600 text-white' : (r.type === 'group' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'),
        type: r.type === 'bot' ? 'bot' : (r.type === 'group' ? 'group' : (r.type === 'channel' ? 'channel' : 'private')),
        status: r.type === 'bot' ? 'online' : 'offline',
        unreadCount: r.unread_count,
        previewMessage: r.last_message ? r.last_message.content : 'Iniciar conexão...',
        previewTime: r.last_message ? new Date(r.last_message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : '',
        bio: r.bio,
        phone: r.phone,
        username: r.username
      }));

      setContacts(mappedContacts);
      
      if (selectRoomId) {
        setActiveContactId(selectRoomId);
      } else if (mappedContacts.length > 0 && !activeContactId) {
        setActiveContactId(mappedContacts[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // API Call: Fetch messages
  const fetchMessages = async (roomId: string, quiet = false) => {
    try {
      if (!quiet) setIsLoadingMessages(true);
      const response = await fetch(`${API_BASE_URL}/core/api/chat/rooms/${roomId}/messages/`, {
        headers: {
          'X-User-Id': userId
        }
      });
      if (!response.ok) throw new Error("Erro ao carregar histórico");
      const data = await response.json();
      
      const mappedMessages: ChatMessage[] = data.messages.map((m: any) => ({
        id: String(m.id),
        senderName: m.sender.name,
        senderRole: m.is_me ? 'user' : (m.sender.role === 'bot' ? 'bot' : 'other'),
        text: m.content,
        time: new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: m.is_read ? 'read' : 'delivered'
      }));

      setMessagesMap(prev => ({
        ...prev,
        [roomId]: mappedMessages
      }));
    } catch (error) {
      console.error(error);
    } finally {
      if (!quiet) setIsLoadingMessages(false);
    }
  };

  // Load rooms initially
  useEffect(() => {
    fetchRooms();
  }, [userId]);

  // Load messages when active room changes
  useEffect(() => {
    if (activeContactId) {
      fetchMessages(activeContactId);
      // Clean unread count locally
      setContacts(prev =>
        prev.map(c => c.id === activeContactId ? { ...c, unreadCount: 0 } : c)
      );
    }
  }, [activeContactId, userId]);

  // Poll messages every 5 seconds for the active chat
  useEffect(() => {
    if (!activeContactId) return;
    const interval = setInterval(() => {
      fetchMessages(activeContactId, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeContactId, userId]);

  // Debounced search for new users
  useEffect(() => {
    if (!newChatQuery.trim()) {
      setNewChatResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const response = await fetch(`${API_BASE_URL}/core/api/chat/users/?q=${encodeURIComponent(newChatQuery)}`, {
          headers: {
            'X-User-Id': userId
          }
        });
        if (response.ok) {
          const data = await response.json();
          setNewChatResults(data.users || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [newChatQuery, userId]);

  // Handler: Start new chat DM
  const handleStartNewChat = async (username: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/core/api/chat/start-dm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ username })
      });
      if (!response.ok) throw new Error("Erro ao iniciar conversa");
      const data = await response.json();
      
      // Reload rooms list and activate the new one
      await fetchRooms(String(data.room_id));
      setIsNewChatModalOpen(false);
      setNewChatQuery("");
      toast({ title: "Sucesso", description: "Nova conversa iniciada!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível iniciar o chat.", variant: "destructive" });
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesMap, activeContactId]);

  // Active chat calculation
  const activeContact = contacts.find(c => c.id === activeContactId);
  const activeChatMessages = activeContactId ? (messagesMap[activeContactId] || []) : [];

  // Filter messages by search query if search is open
  const filteredChatMessages = activeChatMessages.filter(msg => 
    msg.text.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  // Filter contacts by folder & search
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchContactQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFolder === "privados") return contact.type === "private";
    if (activeFolder === "grupos") return contact.type === "group";
    if (activeFolder === "bots") return contact.type === "bot";
    if (activeFolder === "canais") return contact.type === "channel";
    return true;
  });

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !pendingAttachment) return;

    const textToSend = inputText.trim();
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      senderName: "Você",
      senderRole: "user",
      text: textToSend,
      time: timeStr,
      status: "sent",
      attachment: pendingAttachment ? {
        name: pendingAttachment.name,
        size: pendingAttachment.size,
        type: pendingAttachment.type
      } : undefined
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));

    setInputText("");
    setPendingAttachment(null);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);

    try {
      const response = await fetch(`${API_BASE_URL}/core/api/chat/rooms/${activeContactId}/messages/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ content: textToSend })
      });
      
      if (!response.ok) throw new Error("Erro ao enviar");
      const data = await response.json();
      
      // Update optimistic message with real saved message
      setMessagesMap(prev => {
        const currentMsgs = prev[activeContactId] || [];
        const nextMsgs = currentMsgs.map(m => {
          if (m.id === tempId) {
            return {
              id: String(data.message.id),
              senderName: data.message.sender.name,
              senderRole: 'user',
              text: data.message.content,
              time: new Date(data.message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              status: 'delivered',
              attachment: newMsg.attachment
            };
          }
          return m;
        });
        
        // Add Zios bot reply if available
        if (data.reply) {
          const botMsg: ChatMessage = {
            id: String(data.reply.id),
            senderName: data.reply.sender.name,
            senderRole: 'bot',
            text: data.reply.content,
            time: new Date(data.reply.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            status: 'read'
          };
          return [...nextMsgs, botMsg];
        }
        
        return nextMsgs;
      });
      
      // Update preview on sidebar
      setContacts(prev => prev.map(c => c.id === activeContactId ? {
        ...c,
        previewMessage: textToSend,
        previewTime: timeStr
      } : c));

    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao enviar mensagem.", variant: "destructive" });
      setMessagesMap(prev => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).filter(m => m.id !== tempId)
      }));
    }
  };

  // Select simulated attachments
  const selectAttachment = (type: 'pdf' | 'image' | 'audio') => {
    if (type === 'pdf') {
      setPendingAttachment({
        name: "trabalho_dilatacao_linear.pdf",
        size: "1.2 MB",
        type: 'pdf'
      });
    } else if (type === 'image') {
      setPendingAttachment({
        name: "foto_quadro_matematica.jpg",
        size: "2.4 MB",
        type: 'image'
      });
    } else if (type === 'audio') {
      setPendingAttachment({
        name: "nota_de_voz_explicativa.mp3",
        size: "3.5 MB",
        type: 'audio'
      });
    }
    setShowAttachmentMenu(false);
    toast({ title: "Anexo carregado", description: "O arquivo foi preparado para envio." });
  };

  // Toggle Mute Chat
  const toggleMuteChat = (contactId: string) => {
    const isMuted = !mutedChats[contactId];
    setMutedChats(prev => ({ ...prev, [contactId]: isMuted }));
    toast({
      title: isMuted ? "Notificações Silenciadas" : "Notificações Ativadas",
      description: isMuted ? "Este chat foi silenciado temporariamente." : "Você receberá notificações deste chat normalmente."
    });
  };

  // Append emoji to text input
  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };


  return (
    <div className="h-[calc(100vh-6rem)] max-w-[1600px] mx-auto px-4 md:px-8 pb-4 flex gap-4 overflow-hidden relative">
      
      {/* ────────────────── TELEGRAM WEB SIDEBAR (Left - 30%) ────────────────── */}
      <aside className="w-full md:w-80 lg:w-96 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shrink-0 shadow-sm relative">
        
        {/* Telegram light blue header banner */}
        <div className="bg-[#517DA2] text-white p-4 space-y-3.5 shrink-0 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              {/* Hamburger menu button */}
              <button 
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
                title="Menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <h2 className="font-bold text-sm tracking-wide font-display">Thorth Telegram</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-1 hover:bg-white/25 rounded-lg transition"
                title="Nova Conversa"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded">ZIOS-Bridge</span>
            </div>
          </div>

          {/* Telegram Menu Dropdown Popover */}
          {showHamburgerMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowHamburgerMenu(false)} />
              <div className="absolute left-4 top-12 z-50 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 text-slate-700 animate-fade-in text-[12.5px] font-bold">
                <button onClick={() => { setShowHamburgerMenu(false); toast({ title: "Ação Simulada", description: "Novo Grupo iniciado." }) }} className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-lg transition">
                  <Users className="w-4 h-4 text-slate-400" /> Novo Grupo
                </button>
                <button onClick={() => { setShowHamburgerMenu(false); toast({ title: "Ação Simulada", description: "Lista de Contatos aberta." }) }} className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-lg transition">
                  <User className="w-4 h-4 text-slate-400" /> Contatos
                </button>
                <button onClick={() => { setShowHamburgerMenu(false); toast({ title: "Ação Simulada", description: "Saved Messages." }) }} className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-lg transition">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Mensagens Salvas
                </button>
                <button onClick={() => { setShowHamburgerMenu(false); toast({ title: "Configurações", description: "Painel administrativo de Thorth." }) }} className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-lg transition">
                  <Info className="w-4 h-4 text-slate-400" /> Configurações
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={() => { setShowHamburgerMenu(false); toggleMuteChat(activeContactId) }} className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-550 transition">
                  <Bell className="w-4 h-4" /> Silenciar Notificações
                </button>
              </div>
            </>
          )}

          {/* Telegram search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar..."
              value={searchContactQuery}
              onChange={e => setSearchContactQuery(e.target.value)}
              className="w-full bg-[#41688B] placeholder-white/60 text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none border border-transparent focus:border-white/20 transition-all font-semibold"
            />
            {searchContactQuery && (
              <button 
                onClick={() => setSearchContactQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories navigation folders */}
        <div className="flex border-b border-slate-100 bg-[#FAFBFD] p-1 gap-1 shrink-0 text-slate-500 font-bold overflow-x-auto text-[11px] select-none">
          {(
            [
              { id: "todos", label: "Todos" },
              { id: "privados", label: "Privados" },
              { id: "grupos", label: "Grupos" },
              { id: "bots", label: "Bots" },
              { id: "canais", label: "Canais" }
            ] as const
          ).map(folder => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`px-3 py-2 rounded-lg transition-all shrink-0 ${activeFolder === folder.id ? 'bg-[#EAF2FA] text-[#4A76A8]' : 'hover:bg-slate-50'}`}
            >
              {folder.label}
            </button>
          ))}
        </div>

        {/* Contacts Lists */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
          {filteredContacts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Users className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-xs font-bold">Nenhum chat correspondente</p>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const isActive = contact.id === activeContactId;
              const isTyping = contact.status === "typing";
              const isMuted = mutedChats[contact.id];

              return (
                <div 
                  key={contact.id}
                  onClick={() => {
                    setActiveContactId(contact.id);
                    setShowInfoDrawer(false);
                    setShowChatSearch(false);
                    setChatSearchQuery("");
                  }}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-[#4A76A8] text-white' : 'hover:bg-slate-50 bg-white'}`}
                >
                  {/* Avatar Circle */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm relative ${isActive ? 'bg-white/20' : contact.avatarBg}`}>
                    {contact.avatar}
                    {/* Status online badge dot */}
                    {contact.status === "online" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>

                  {/* Previa information */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-extrabold text-[12.5px] truncate flex items-center gap-1">
                        {contact.name}
                        {isMuted && <BellOff className={`w-3 h-3 ${isActive ? 'text-white/60' : 'text-slate-400'}`} />}
                      </h4>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                        {contact.previewTime}
                      </span>
                    </div>
                    
                    <p className={`text-[11px] truncate leading-normal font-semibold ${isTyping ? (isActive ? 'text-white' : 'text-indigo-650') : (isActive ? 'text-white/80' : 'text-slate-500')}`}>
                      {isTyping ? "digitando..." : contact.previewMessage}
                    </p>
                  </div>

                  {/* Unread badge count counter */}
                  {contact.unreadCount > 0 && !isActive && (
                    <span className="bg-[#4EBC66] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ────────────────── TELEGRAM WEB MAIN CHAT WINDOW (Right - 70%) ────────────────── */}
      <main className="flex-grow border border-slate-200 bg-[#E6EBF0] flex flex-col rounded-3xl overflow-hidden shadow-sm relative">
        
        {/* Telegram Chat Header bar */}
        <header className="bg-white border-b border-slate-200 p-3.5 px-5 flex justify-between items-center shrink-0 z-10 relative">
          <div 
            onClick={() => setShowInfoDrawer(!showInfoDrawer)}
            className="flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${activeContact.avatarBg}`}>
              {activeContact.avatar}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[13px] group-hover:text-[#4A76A8] transition flex items-center gap-1.5">
                {activeContact.name}
                {mutedChats[activeContact.id] && <BellOff className="w-3.5 h-3.5 text-slate-400" />}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide capitalize">
                {activeContact.status === "typing" ? "digitando..." : (activeContact.status === "online" ? "online" : (activeContact.lastSeen || "offline"))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button 
              onClick={() => toggleMuteChat(activeContact.id)}
              className="p-1.5 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
              title={mutedChats[activeContact.id] ? "Ativar Notificações" : "Silenciar"}
            >
              {mutedChats[activeContact.id] ? <BellOff className="w-4 h-4 text-red-500" /> : <Bell className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setShowChatSearch(!showChatSearch)}
              className={`p-1.5 hover:text-slate-700 rounded-lg transition ${showChatSearch ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-50'}`} 
              title="Pesquisar no Chat"
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowInfoDrawer(!showInfoDrawer)}
              className={`p-1.5 hover:text-slate-750 rounded-lg transition ${showInfoDrawer ? 'text-[#4A76A8] bg-blue-50' : 'hover:bg-slate-50'}`}
              title="Informações do Chat"
            >
              <Info className="w-4.5 h-4.5" />
            </button>
            <button onClick={() => toast({ title: "Configurações", description: "Menu do chat estendido." })} className="p-1.5 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Internal Chat Message Search input bar */}
        {showChatSearch && (
          <div className="bg-slate-50 border-b border-slate-200 p-2.5 px-5 flex gap-2 items-center shrink-0 z-10 animate-slide-in">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar mensagens neste chat..." 
              value={chatSearchQuery}
              onChange={e => setChatSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-700 outline-none border-none placeholder-slate-400 font-medium"
              autoFocus
            />
            {chatSearchQuery && (
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-bold text-slate-500">
                {filteredChatMessages.length} encontradas
              </span>
            )}
            <button 
              onClick={() => {
                setShowChatSearch(false);
                setChatSearchQuery("");
              }}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Telegram wall container feed */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-4 relative"
          style={{ 
            backgroundColor: "#eef2f6",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 15h2v2h-2zm10 25h2v2h-2zm20-20h2v2h-2zm-30 20h2v2h-2zm25 10h2v2h-2zm-25 10h2v2h-2zm20-30h2v2h-2zm-10-15h2v2h-2zm-20 20h2v2h-2zm30 30h2v2h-2z' fill='%23517da2' fill-opacity='0.06'/%3E%3C/svg%3E")`,
            backgroundSize: "auto"
          }}
        >
          {filteredChatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p className="bg-slate-900/10 text-slate-700 text-xs px-4 py-2 rounded-full font-bold">
                {chatSearchQuery ? "Nenhuma mensagem corresponde à busca" : "Sem mensagens neste chat"}
              </p>
            </div>
          ) : (
            filteredChatMessages.map((msg) => {
              const isUser = msg.senderRole === "user";
              const isBot = msg.senderRole === "bot";

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[70%] text-left ${isUser ? 'ml-auto items-end' : 'mr-auto'}`}
                >
                  {/* Sender Name for group chats */}
                  {!isUser && activeContact.type === "group" && (
                    <span className="text-[10px] font-bold text-[#4A76A8] mb-1 px-1">{msg.senderName}</span>
                  )}

                  <div 
                    className={`p-3 rounded-2xl relative shadow-sm leading-relaxed text-xs break-words ${
                      isUser 
                        ? 'bg-[#EEFFDE] border border-[#d9f5bd] text-slate-800 rounded-tr-none' 
                        : (isBot ? 'bg-[#F2F6FA] border border-blue-150 text-indigo-950 rounded-tl-none shadow-sm' : 'bg-white text-slate-850 rounded-tl-none')
                    }`}
                  >
                    {/* Render attachment card */}
                    {msg.attachment && (
                      <div className="flex items-center gap-3 p-2.5 mb-2 rounded-xl bg-slate-900/5 border border-slate-900/10 text-xs select-none">
                        <div className="p-2 bg-white/60 rounded-lg text-[#517DA2]">
                          {msg.attachment.type === 'pdf' ? <FileText className="w-5 h-5" /> : 
                           msg.attachment.type === 'image' ? <Image className="w-5 h-5" /> : 
                           <Music className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold truncate text-slate-800">{msg.attachment.name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{msg.attachment.size} • {msg.attachment.type.toUpperCase()}</p>
                        </div>
                      </div>
                    )}

                    <p className="pr-12 whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Status checklist and time in bottom right */}
                    <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[8.5px] font-bold text-slate-400/80">
                      <span>{msg.time}</span>
                      {isUser && (
                        <span>
                          {msg.status === "sent" && <Check className="w-2.5 h-2.5 text-slate-400" />}
                          {msg.status === "delivered" && <CheckCheck className="w-2.5 h-2.5 text-slate-400" />}
                          {msg.status === "read" && <CheckCheck className="w-2.5 h-2.5 text-blue-500" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Attachment Uploading Bar Preview */}
        {pendingAttachment && (
          <div className="bg-slate-50 border-t border-slate-200 p-2.5 px-5 flex items-center justify-between z-10 animate-slide-in">
            <div className="flex items-center gap-3 text-xs">
              <Paperclip className="w-4 h-4 text-[#517DA2]" />
              <div>
                <span className="font-bold text-slate-800">{pendingAttachment.name}</span>
                <span className="text-[10px] text-slate-400 ml-2 font-semibold">({pendingAttachment.size})</span>
              </div>
            </div>
            <button 
              onClick={() => setPendingAttachment(null)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Telegram Chat Input Bar */}
        <form 
          onSubmit={handleSendMessage}
          className="bg-white border-t border-slate-200 p-3.5 flex items-center gap-3 shrink-0 relative"
        >
          {/* Emojis Selector Button */}
          <button 
            type="button" 
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachmentMenu(false);
            }}
            className={`text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-55 transition ${showEmojiPicker ? 'bg-slate-100 text-indigo-600' : ''}`}
          >
            <Smile className="w-5.5 h-5.5" />
          </button>

          {/* Emoji Popover Drawer Box */}
          {showEmojiPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
              <div className="absolute left-4 bottom-16 z-50 w-[280px] bg-white rounded-2xl shadow-xl border border-slate-150 p-3.5 grid grid-cols-6 gap-2.5 animate-slide-up">
                {EMOLIS.map((e) => (
                  <button 
                    key={e} 
                    type="button" 
                    onClick={() => addEmoji(e)}
                    className="text-lg hover:scale-125 transition active:scale-95 flex items-center justify-center p-1 rounded hover:bg-slate-50"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
          
          {/* Attachment Paperclip Button */}
          <button 
            type="button" 
            onClick={() => {
              setShowAttachmentMenu(!showAttachmentMenu);
              setShowEmojiPicker(false);
            }}
            className={`text-slate-400 hover:text-slate-655 p-1.5 rounded-full hover:bg-slate-55 transition ${showAttachmentMenu ? 'bg-slate-100 text-indigo-600' : ''}`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Attachment Options Popover Box */}
          {showAttachmentMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAttachmentMenu(false)} />
              <div className="absolute left-14 bottom-16 z-50 w-48 bg-white rounded-2xl shadow-xl border border-slate-150 p-1.5 font-bold text-slate-700 animate-slide-up text-xs">
                <button 
                  type="button"
                  onClick={() => selectAttachment('pdf')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition"
                >
                  <FileText className="w-4 h-4 text-red-500" /> Documento (PDF)
                </button>
                <button 
                  type="button"
                  onClick={() => selectAttachment('image')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition"
                >
                  <Image className="w-4 h-4 text-emerald-500" /> Imagem / Foto
                </button>
                <button 
                  type="button"
                  onClick={() => selectAttachment('audio')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition"
                >
                  <Music className="w-4 h-4 text-blue-500" /> Áudio / Podcast
                </button>
              </div>
            </>
          )}

          <input 
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#517DA2] transition"
          />

          <button 
            type="submit"
            disabled={!inputText.trim() && !pendingAttachment}
            className="w-9 h-9 rounded-full bg-[#517DA2] hover:bg-[#41688B] disabled:opacity-60 text-white flex items-center justify-center transition shrink-0 shadow-sm"
          >
            {(inputText.trim() || pendingAttachment) ? (
              <Send className="w-4 h-4 ml-0.5" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </form>
      </main>

      {/* ────────────────── TELEGRAM CONTACT DRAWER (Right Sidebar - Toggleable) ────────────────── */}
      {showInfoDrawer && (
        <aside className="w-80 bg-white border border-slate-200 rounded-3xl overflow-hidden shrink-0 shadow-sm flex flex-col text-left animate-slide-in">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Info do Usuário</h3>
            <button 
              onClick={() => setShowInfoDrawer(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* User Bio and details */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Centered Avatar and Name */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-md ${activeContact.avatarBg}`}>
                {activeContact.avatar}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm leading-normal">{activeContact.name}</h4>
                <p className="text-[10px] text-slate-400 capitalize">{activeContact.type}</p>
              </div>
            </div>

            {/* Info details stack */}
            <div className="space-y-4 text-xs">
              
              {/* Bio info */}
              {activeContact.bio && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Bio / Descrição</span>
                  <p className="text-slate-655 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border">{activeContact.bio}</p>
                </div>
              )}

              {/* Username */}
              {activeContact.username && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Username</span>
                  <p className="text-[#4A76A8] font-bold">{activeContact.username}</p>
                </div>
              )}

              {/* Phone number */}
              {activeContact.phone && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Telefone</span>
                  <p className="text-slate-700 font-semibold">{activeContact.phone}</p>
                </div>
              )}

              {/* Notifications switcher (Simulated) */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 cursor-pointer" onClick={() => toggleMuteChat(activeContact.id)}>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-600">Notificações</span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 flex items-center transition ${mutedChats[activeContact.id] ? 'bg-slate-300 justify-start' : 'bg-emerald-500 justify-end'}`}>
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>

            </div>
          </div>
        </aside>
      )}

      {/* ========================================== */}
      {/* DIALOG: NOVA CONVERSA                      */}
      {/* ========================================== */}
      <Dialog open={isNewChatModalOpen} onOpenChange={setIsNewChatModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-0 overflow-hidden border border-slate-200 shadow-2xl">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Nova Conversa</h2>
            <button onClick={() => setIsNewChatModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4.5 h-4.5" /></button>
          </div>
          
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-[#517DA2] transition">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text"
                autoFocus
                value={newChatQuery}
                onChange={e => setNewChatQuery(e.target.value)}
                placeholder="Pesquisar por nome ou @usuario..." 
                className="w-full bg-transparent text-xs text-slate-800 outline-none border-none placeholder-slate-400 font-medium py-1"
              />
            </div>
          </div>

          <div className="p-2 h-[350px] overflow-y-auto scrollbar-hide bg-white">
            {isSearchingUsers ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#517DA2] animate-spin" /></div>
            ) : newChatQuery && newChatResults.length === 0 ? (
              <p className="text-center text-slate-400 text-xs mt-10 font-bold">Nenhum usuário encontrado.</p>
            ) : newChatResults.length > 0 ? (
              newChatResults.map(u => (
                <div 
                  key={u.id} 
                  onClick={() => handleStartNewChat(u.username)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-blue-100 text-blue-700">
                    {u.initials}
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-slate-800 text-[13px]">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{u.handle} • {u.role}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center mt-16 opacity-50">
                <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500">Busque no Multiverso Hemera</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Thorth;
