/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { alunoService } from "../services/alunoService";
import { supabase } from "@/integrations/supabase/client";

// Mock do cliente Supabase
vi.mock("@/integrations/supabase/client", () => {
  const mockAuth = {
    getUser: vi.fn(),
  };

  const mockFrom = vi.fn();

  return {
    supabase: {
      auth: mockAuth,
      from: mockFrom,
    },
  };
});

describe("alunoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getResumoDashboard", () => {
    it("deve retornar painel vazio se não houver usuário autenticado no sistema", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const resumo = await alunoService.getResumoDashboard();

      expect(resumo).toEqual({
        minhasTurmas: [],
        atividadesPendentes: 0,
        atividadesConcluidas: 0,
        mediaGeral: 0,
        taxaFrequencia: 100,
        ultimasNotas: [],
      });
    });

    it("deve retornar painel vazio se não encontrar aluno correspondente no banco", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user_123", email: "aluno@test.com" } as any },
        error: null,
      });

      // Configura mock do supabase.from('alunos').select('*').eq(...).single() para retornar vazio/erro
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "alunos") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: new Error("Não encontrado") }),
          } as any;
        }
        return {} as any;
      });

      const resumo = await alunoService.getResumoDashboard();

      expect(resumo.minhasTurmas.length).toBe(0);
      expect(resumo.mediaGeral).toBe(0);
    });

    it("deve calcular corretamente as métricas e o resumo do aluno", async () => {
      const mockUser = { id: "user_123", email: "aluno@test.com" };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const mockAluno = {
        id: "aluno_789",
        nome: "Carlos Santos",
        matricula: "MAT-2026-001",
        turma_id: "turma_001",
        nota_media: 8.5,
        taxa_frequencia: 92,
      };

      const mockTurma = {
        id: "turma_001",
        nome: "3º Ano Ensino Médio",
        ano_letivo: 2026,
        periodo: "Matutino",
      };

      const mockAtividades = [
        { id: "at_1", titulo: "Prova de Física", valor_maximo: 10 },
        { id: "at_2", titulo: "Redação Gramática", valor_maximo: 10 },
        { id: "at_3", titulo: "Trabalho História", valor_maximo: 10 },
      ];

      const mockNotas = [
        { id: "n_1", atividade_id: "at_1", valor: 8.0, atividade: { titulo: "Prova de Física", valor_maximo: 10 } },
        { id: "n_2", atividade_id: "at_2", valor: 9.0, atividade: { titulo: "Redação Gramática", valor_maximo: 10 } },
      ];

      // Configuração dinâmica das tabelas no Supabase Client
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "alunos") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockAluno, error: null }),
          } as any;
        }
        if (table === "turmas") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockTurma, error: null }),
          } as any;
        }
        if (table === "atividades") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: mockAtividades, error: null }),
          } as any;
        }
        if (table === "notas") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: mockNotas, error: null }),
          } as any;
        }
        return {} as any;
      });

      const resumo = await alunoService.getResumoDashboard();

      expect(resumo.minhasTurmas).toEqual([mockTurma]);
      // Atividades planejadas (3) - notas recebidas (2) = 1 pendente
      expect(resumo.atividadesPendentes).toBe(1);
      expect(resumo.atividadesConcluidas).toBe(2);
      // Média das notas: (8.0 + 9.0) / 2 = 8.5
      expect(resumo.mediaGeral).toBe(8.5);
      expect(resumo.taxaFrequencia).toBe(92);
      expect(resumo.ultimasNotas.length).toBe(2);
      expect(resumo.ultimasNotas[0]).toEqual({
        titulo: "Prova de Física",
        valor: 8.0,
        valorMaximo: 10,
      });
    });
  });

  describe("getMinhasAtividades", () => {
    it("deve carregar as atividades vinculando as notas e feedbacks correspondentes", async () => {
      const mockUser = { id: "user_123", email: "aluno@test.com" };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const mockAluno = { id: "aluno_789", turma_id: "turma_001" };
      const mockAtividades = [
        { id: "at_1", titulo: "Prova Física", descricao: "Cinemática", data_entrega: "2026-06-01", turma_id: "turma_001", valor_maximo: 10 },
        { id: "at_2", titulo: "Simulado", descricao: "BNCC Geral", data_entrega: "2026-06-15", turma_id: "turma_001", valor_maximo: 10 },
      ];
      const mockNotas = [
        { id: "nota_1", atividade_id: "at_1", valor: 7.5, feedback: "Bom progresso!" },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "alunos") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockAluno, error: null }),
          } as any;
        }
        if (table === "atividades") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockAtividades, error: null }),
          } as any;
        }
        if (table === "notas") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: mockNotas, error: null }),
          } as any;
        }
        return {} as any;
      });

      const atividades = await alunoService.getMinhasAtividades();

      expect(atividades.length).toBe(2);
      // Atividade 1 (entregue/avaliada)
      expect(atividades[0].id).toBe("at_1");
      expect(atividades[0].minha_nota).toBe(7.5);
      expect(atividades[0].nota_id).toBe("nota_1");
      expect(atividades[0].feedback).toBe("Bom progresso!");

      // Atividade 2 (pendente)
      expect(atividades[1].id).toBe("at_2");
      expect(atividades[1].minha_nota).toBeNull();
      expect(atividades[1].feedback).toBeNull();
    });
  });

  describe("getMinhaFrequencia", () => {
    it("deve carregar os registros de frequências ordenados do aluno", async () => {
      const mockUser = { id: "user_123", email: "aluno@test.com" };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const mockAluno = { id: "aluno_789" };
      const mockFrequencia = [
        { data: "2026-06-02", presente: true },
        { data: "2026-06-01", presente: false },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "alunos") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockAluno, error: null }),
          } as any;
        }
        if (table === "frequencias") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockFrequencia, error: null }),
          } as any;
        }
        return {} as any;
      });

      const freq = await alunoService.getMinhaFrequencia();

      expect(freq).toEqual(mockFrequencia);
    });
  });
});
