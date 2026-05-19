import axios from 'axios';
import { supabase as _supabase } from '@/integrations/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _supabase;

// Define the base URL for the FastAPI backend (ZIOS)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface GenerateArtifactRequest {
  prompt: string;
  toolId: string;
  contextId?: string; // Optional context reference
}

export interface GenerateArtifactResponse {
  id: string;
  tipo: string;
  url_storage: string;
  prompt_origem: string;
  contexto_id: string | null;
  created_at: string;
}

export const aiService = {
  /**
   * Generates an artifact using the Supabase Edge Function (GAIA).
   */
  async generateArtifact(data: GenerateArtifactRequest): Promise<GenerateArtifactResponse> {
    try {
      const { data: responseData, error } = await supabase.functions.invoke('generate-activity', {
        body: {
          prompt: data.prompt,
          toolId: data.toolId,
          contextId: data.contextId,
        }
      });

      if (error) throw error;
      return responseData;
    } catch (error) {
      console.error('Error generating artifact via Edge Function:', error);
      throw error;
    }
  },

  /**
   * Fetches the generated artifacts for a user directly from Supabase
   * (Alternatively, this could also go through FastAPI if business logic is needed)
   */
  async getUserArtifacts() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('artefatos_ia')
      .select('*, conhecimento_contexto(titulo)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching artifacts:', error);
      throw error;
    }
    
    return data;
  }
};
