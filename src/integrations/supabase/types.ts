export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          created_at: string
          email: string | null
          id: string
          matricula: string | null
          nome: string
          nota_media: number | null
          professor_id: string
          taxa_frequencia: number | null
          turma_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          matricula?: string | null
          nome: string
          nota_media?: number | null
          professor_id: string
          taxa_frequencia?: number | null
          turma_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          matricula?: string | null
          nome?: string
          nota_media?: number | null
          professor_id?: string
          taxa_frequencia?: number | null
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          created_at: string
          data_entrega: string
          descricao: string | null
          disciplina_id: string | null
          id: string
          professor_id: string
          titulo: string
          turma_id: string
          valor_maximo: number
        }
        Insert: {
          created_at?: string
          data_entrega: string
          descricao?: string | null
          disciplina_id?: string | null
          id?: string
          professor_id: string
          titulo: string
          turma_id: string
          valor_maximo?: number
        }
        Update: {
          created_at?: string
          data_entrega?: string
          descricao?: string | null
          disciplina_id?: string | null
          id?: string
          professor_id?: string
          titulo?: string
          turma_id?: string
          valor_maximo?: number
        }
        Relationships: [
          {
            foreignKeyName: "atividades_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      diario_classe: {
        Row: {
          conteudo: string | null
          created_at: string
          data: string
          id: string
          observacoes: string | null
          professor_id: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          data?: string
          id?: string
          observacoes?: string | null
          professor_id: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          data?: string
          id?: string
          observacoes?: string | null
          professor_id?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diario_classe_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinas: {
        Row: {
          created_at: string
          id: string
          nome: string
          professor_id: string
          turma_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          professor_id: string
          turma_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          professor_id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplinas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      frequencias: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          id: string
          presente: boolean
          professor_id: string
          turma_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data?: string
          id?: string
          presente?: boolean
          professor_id: string
          turma_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          id?: string
          presente?: boolean
          professor_id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "frequencias_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frequencias_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios: {
        Row: {
          created_at: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
          is_ac: boolean
          professor_id: string
          turma_id: string
        }
        Insert: {
          created_at?: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
          is_ac?: boolean
          professor_id: string
          turma_id: string
        }
        Update: {
          created_at?: string
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          is_ac?: boolean
          professor_id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          aluno_id: string
          atividade_id: string
          created_at: string
          feedback: string | null
          id: string
          updated_at: string
          valor: number
        }
        Insert: {
          aluno_id: string
          atividade_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          updated_at?: string
          valor: number
        }
        Update: {
          aluno_id?: string
          atividade_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_aula: {
        Row: {
          avaliacao: string | null
          conteudo: string | null
          created_at: string
          data_prevista: string
          duracao: string | null
          habilidades_bncc: string | null
          id: string
          id_atividade_gerada: string | null
          metodologia: string | null
          objetivos: string | null
          professor_id: string
          recursos: string | null
          referencias: string | null
          status: string
          titulo: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          avaliacao?: string | null
          conteudo?: string | null
          created_at?: string
          data_prevista: string
          duracao?: string | null
          habilidades_bncc?: string | null
          id?: string
          id_atividade_gerada?: string | null
          metodologia?: string | null
          objetivos?: string | null
          professor_id: string
          recursos?: string | null
          referencias?: string | null
          status?: string
          titulo: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          avaliacao?: string | null
          conteudo?: string | null
          created_at?: string
          data_prevista?: string
          duracao?: string | null
          habilidades_bncc?: string | null
          id?: string
          id_atividade_gerada?: string | null
          metodologia?: string | null
          objetivos?: string | null
          professor_id?: string
          recursos?: string | null
          referencias?: string | null
          status?: string
          titulo?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_aula_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      postagens_mural: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          autor_id: string
          created_at: string
          id: string
          texto: string
          turma_id: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          autor_id: string
          created_at?: string
          id?: string
          texto: string
          turma_id: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          autor_id?: string
          created_at?: string
          id?: string
          texto?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "postagens_mural_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          ano_letivo: number
          created_at: string
          id: string
          nome: string
          periodo: string
          professor_id: string
        }
        Insert: {
          ano_letivo?: number
          created_at?: string
          id?: string
          nome: string
          periodo?: string
          professor_id: string
        }
        Update: {
          ano_letivo?: number
          created_at?: string
          id?: string
          nome?: string
          periodo?: string
          professor_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "aluno" | "professor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["aluno", "professor", "admin"],
    },
  },
} as const
