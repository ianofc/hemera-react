import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

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
   * Generates an artifact using the FastAPI backend and Gemini.
   */
  async generateArtifact(data: GenerateArtifactRequest): Promise<GenerateArtifactResponse> {
    try {
      // We send the request to our FastAPI server
      const response = await axios.post(`${API_BASE_URL}/api/intelligence/generate`, {
        prompt: data.prompt,
        tool_type: data.toolId,
        context_id: data.contextId,
      });

      // Assuming the FastAPI backend returns the created artifact object
      // which has already been saved to Supabase 'artefatos_ia' table
      return response.data;
    } catch (error) {
      console.error('Error generating artifact via FastAPI:', error);
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
