-- Migration para a infraestrutura do GAIA Messenger (Telegram-style)

-- 1. Tabela de Chats (Conversas)
-- Pode representar uma DM (Direct Message), um Grupo, ou um Chat com o ZIOS.
CREATE TABLE IF NOT EXISTS public.gaia_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('dm', 'grupo', 'ai_zios')),
    titulo VARCHAR(255), -- Null para DM, obrigatório para Grupo
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Membros do Chat
-- Quem está participando da conversa.
CREATE TABLE IF NOT EXISTS public.gaia_chat_members (
    chat_id UUID NOT NULL REFERENCES public.gaia_chats(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'ai_agent')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (chat_id, profile_id)
);

-- 3. Tabela de Mensagens
CREATE TABLE IF NOT EXISTS public.gaia_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.gaia_chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    tipo_anexo VARCHAR(50), -- 'imagem', 'mapa', 'video', 'documento'
    url_anexo TEXT, -- URL do storage, se houver anexo
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar o RLS
ALTER TABLE public.gaia_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaia_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaia_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- (Simplificadas: Membros do chat podem ler e enviar mensagens)

-- Membros podem ler o chat
CREATE POLICY "Users can view chats they are part of" ON public.gaia_chats
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.gaia_chat_members 
        WHERE chat_id = gaia_chats.id AND profile_id = auth.uid()
    )
);

-- Membros podem ver quem está no chat
CREATE POLICY "Users can view chat members" ON public.gaia_chat_members
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.gaia_chat_members AS cm
        WHERE cm.chat_id = gaia_chat_members.chat_id AND cm.profile_id = auth.uid()
    )
);

-- Membros podem ver mensagens do chat
CREATE POLICY "Users can view messages in their chats" ON public.gaia_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.gaia_chat_members 
        WHERE chat_id = gaia_messages.chat_id AND profile_id = auth.uid()
    )
);

-- Membros podem enviar mensagens
CREATE POLICY "Users can insert messages in their chats" ON public.gaia_messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.gaia_chat_members 
        WHERE chat_id = gaia_messages.chat_id AND profile_id = auth.uid()
    )
);

-- Criar Conta Sistema para a IA (ZIOS) - Opcional, mas util para centralizar os envios do bot
-- Isso será gerenciado pela Edge Function, mas o sender_id da IA precisa existir em profiles.

-- ATIVAR O SUPABASE REALTIME para as mensagens!
-- Isso é o que faz o "WebSockets" funcionar magicamente
ALTER PUBLICATION supabase_realtime ADD TABLE public.gaia_messages;
