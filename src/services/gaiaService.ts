import { supabase as _supabase } from '@/integrations/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _supabase;

export interface GaiaChat {
  id: string;
  tipo: 'dm' | 'grupo' | 'ai_zios' | 'ai_iris' | 'ai_tas' | 'ai_mercurio' | 'ai_heimdall';
  titulo?: string;
  avatar_url?: string;
  created_at: string;
}

export interface GaiaMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  conteudo: string;
  tipo_anexo?: 'imagem' | 'mapa' | 'video' | 'documento';
  url_anexo?: string;
  is_read: boolean;
  created_at: string;
  // Join properties (opcionais, populadas em selects com joins)
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export const gaiaService = {
  // --- CHATS ---
  async getMyChats(): Promise<GaiaChat[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    // Buscando todos os chats onde o usuário é membro
    const { data, error } = await supabase
      .from('gaia_chats')
      .select(`
        *,
        gaia_chat_members!inner(profile_id)
      `)
      .eq('gaia_chat_members.profile_id', user.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createOrGetPentaIAChats(): Promise<GaiaChat[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    const pentaIAs = [
      { tipo: 'ai_zios', titulo: 'ZIOS (Tutor Educacional)' },
      { tipo: 'ai_iris', titulo: 'IRIS (Visão e Tendências)' },
      { tipo: 'ai_tas', titulo: 'TAS (Curador de Feed)' },
      { tipo: 'ai_mercurio', titulo: 'MERCÚRIO (Hub e Notificações)' },
      { tipo: 'ai_heimdall', titulo: 'HEIMDALL (Segurança e Sistema)' }
    ];

    const results: GaiaChat[] = [];

    for (const ai of pentaIAs) {
      // 1. Tentar achar um chat do tipo específico que o usuário já participe
      const { data: existingChats } = await supabase
        .from('gaia_chats')
        .select(`*, gaia_chat_members!inner(profile_id)`)
        .eq('tipo', ai.tipo)
        .eq('gaia_chat_members.profile_id', user.user.id)
        .limit(1);

      if (existingChats && existingChats.length > 0) {
        results.push(existingChats[0]);
        continue;
      }

      // 2. Se não existir, criar um novo chat para a IA
      const { data: newChat, error: chatError } = await supabase
        .from('gaia_chats')
        .insert([{ tipo: ai.tipo, titulo: ai.titulo }])
        .select()
        .single();

      if (chatError) throw chatError;

      // 3. Adicionar o usuário no chat
      await supabase.from('gaia_chat_members').insert([
        { chat_id: newChat.id, profile_id: user.user.id, role: 'admin' }
      ]);

      results.push(newChat);
    }

    return results;
  },

  // --- MENSAGENS ---
  async getMessages(chatId: string): Promise<GaiaMessage[]> {
    const { data, error } = await supabase
      .from('gaia_messages')
      .select(`
        *,
        sender:profiles(first_name, last_name, avatar_url)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(chatId: string, conteudo: string, anexo?: { tipo: string, url: string }): Promise<GaiaMessage> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      chat_id: chatId,
      sender_id: user.user.id,
      conteudo
    };

    if (anexo) {
      payload.tipo_anexo = anexo.tipo;
      payload.url_anexo = anexo.url;
    }

    const { data, error } = await supabase
      .from('gaia_messages')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    
    // Atualiza a data de 'updated_at' do chat para subir na lista
    await supabase.from('gaia_chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);

    // Se o chat for com alguma PentaIA, disparar a Edge Function do agente em background
    const { data: chatData } = await supabase.from('gaia_chats').select('tipo').eq('id', chatId).single();
    if (chatData?.tipo && chatData.tipo.startsWith('ai_')) {
      this.triggerPentaIAAgent(chatId, chatData.tipo, conteudo, user.user.id);
    }

    return data;
  },

  async triggerPentaIAAgent(chatId: string, aiTipo: string, prompt: string, userId: string) {
    try {
      // Idealmente chama uma edge function roteadora ('pentaia-router') que decide qual motor rodar
      // Por enquanto, chamamos a function genérica 'generate-activity' e passamos o tipo da IA.
      await supabase.functions.invoke('generate-activity', {
        body: {
          prompt,
          toolId: aiTipo, // Ex: 'ai_zios', 'ai_iris'
          chatId: chatId,
          userId: userId
        }
      });
    } catch (e) {
      console.error(`Erro ao acionar agente ${aiTipo}:`, e);
    }
  },

  // --- REALTIME WEBSOCKETS ---
  subscribeToMessages(chatId: string, onNewMessage: (msg: GaiaMessage) => void) {
    return supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gaia_messages', filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          // Quando chegar uma nova mensagem, precisamos fazer um "fetch" adicional do profile do sender 
          // caso a tela precise mostrar nome/avatar
          const newMessage = payload.new as GaiaMessage;
          const { data: profile } = await supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', newMessage.sender_id).single();
          
          if (profile) {
            newMessage.sender = profile;
          }
          onNewMessage(newMessage);
        }
      )
      .subscribe();
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unsubscribe(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
};
