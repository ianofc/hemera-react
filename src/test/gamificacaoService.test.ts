/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { gamificacaoService } from "../services/gamificacaoService";
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

describe("gamificacaoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("Fallback Mode (Sem Usuário Logado)", () => {
    it("deve retornar o status padrão com mockXP quando não há usuário logado", async () => {
      // Configura mock para retornar usuário nulo
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const status = await gamificacaoService.getStatusAluno();

      // MockXP inicial é 850.
      // Raiz quadrada de 850/100 = 2.915. Nivel = Math.floor(2.915) + 1 = 3.
      expect(status.nivel).toBe(3);
      expect(status.xpAtual).toBe(850);
      expect(status.titulo).toBe("Aprendiz Dedicado");
      expect(status.conquistas).toBeDefined();
      expect(status.conquistas.length).toBeGreaterThan(0);
    });

    it("deve somar XP no mockXP e retornar se subiu de nível", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Se mockXP inicial é 850, nível é 3 (necessário 900 XP para nível 4 (base do nível 4 = (4-1)^2 * 100 = 900))
      // Adicionando 40 XP -> XP vai para 890 (continua nível 3)
      let res = await gamificacaoService.adicionarXP(40, "Tarefa concluída");
      expect(res.subiuNivel).toBe(false);
      expect(res.novoNivel).toBe(3);

      // Adicionando mais 20 XP -> XP vai para 910 (sobe para nível 4)
      res = await gamificacaoService.adicionarXP(20, "Participação em aula");
      expect(res.subiuNivel).toBe(true);
      expect(res.novoNivel).toBe(4);
    });
  });

  describe("Authenticated Mode (Com Usuário Logado)", () => {
    it("deve carregar dados de XP e conquistas do Supabase para o usuário logado", async () => {
      const mockUser = { id: "user_test_123", email: "student@hemera.edu.br" };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      // Cria mocks específicos para as chamadas de banco
      const selectMock = vi.fn();
      const eqMock = vi.fn();
      const maybeSingleMock = vi.fn();
      const selectConqMock = vi.fn();
      const eqConqMock = vi.fn();

      // Configurando queries do supabase
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "gamificacao_status") {
          return {
            select: selectMock.mockReturnValue({
              eq: eqMock.mockReturnValue({
                maybeSingle: maybeSingleMock.mockResolvedValue({
                  data: { xp_total: 1650 }, // Nível 5 (base = 1600 XP)
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        if (table === "gamificacao_conquistas") {
          return {
            select: selectConqMock.mockReturnValue({
              eq: eqConqMock.mockResolvedValue({
                data: [
                  { badge_id: "c3", desbloqueada_em: "2026-06-01T12:00:00Z" },
                ],
                error: null,
              }),
            }),
          } as any;
        }
        return {} as any;
      });

      const status = await gamificacaoService.getStatusAluno();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith("gamificacao_status");
      expect(supabase.from).toHaveBeenCalledWith("gamificacao_conquistas");

      // XP = 1650 -> Nivel = floor(sqrt(16.5)) + 1 = 4 + 1 = 5
      expect(status.nivel).toBe(5);
      expect(status.xpAtual).toBe(1650);
      expect(status.titulo).toBe("Veterano");

      // Verifica se a conquista c3 (Sempre Presente) foi desbloqueada pelo mock
      const conquistaC3 = status.conquistas.find(c => c.id === "c3");
      expect(conquistaC3?.desbloqueada).toBe(true);
    });

    it("deve adicionar XP e realizar upsert no banco de dados", async () => {
      const mockUser = { id: "user_test_123", email: "student@hemera.edu.br" };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const selectMock = vi.fn();
      const eqMock = vi.fn();
      const maybeSingleMock = vi.fn();
      const upsertMock = vi.fn();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "gamificacao_status") {
          return {
            select: selectMock.mockReturnValue({
              eq: eqMock.mockReturnValue({
                maybeSingle: maybeSingleMock.mockResolvedValue({
                  data: { xp_total: 100 }, // Nível 2
                  error: null,
                }),
              }),
            }),
            upsert: upsertMock.mockResolvedValue({ error: null }),
          } as any;
        }
        return {} as any;
      });

      // Adicionando 800 XP a partir de 100 XP -> Total 900 XP (Nível 4).
      // Anterior: 100 XP (Nível 2).
      // Novo: 900 XP (Nível 4).
      const res = await gamificacaoService.adicionarXP(800, "Superação de Desafio");

      expect(res.subiuNivel).toBe(true);
      expect(res.novoNivel).toBe(4);
      expect(upsertMock).toHaveBeenCalledWith({
        aluno_id: mockUser.id,
        xp_total: 900,
        nivel: 4,
        ultima_atualizacao: expect.any(String),
      });
    });
  });
});
