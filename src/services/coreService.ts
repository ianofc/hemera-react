import { supabase } from '@/integrations/supabase/client';

export interface Escola {
  id: string;
  nome: string;
  tipo: string;
  tenant_id: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  cpf?: string;
  matricula?: string;
  telefone?: string;
  escola_id?: string;
}

export const coreService = {
  // --- ESCOLAS (TENANTS) ---
  async getEscolas(): Promise<Escola[]> {
    const { data, error } = await supabase
      .from('escolas')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  async getEscolaById(id: string): Promise<Escola | null> {
    const { data, error } = await supabase
      .from('escolas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  // --- PROFILES (Usuários Cortex) ---
  async getMeuPerfil(): Promise<Profile | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      throw error;
    }
    return data;
  },

  async atualizarPerfil(updates: Partial<Profile>): Promise<Profile> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
