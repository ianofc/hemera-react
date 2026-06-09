import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ProfLancamentoNotas } from "../pages/professor/MockPages";
import { Polis } from "../pages/shared/Polis";
import Biblioteca from "../pages/shared/Biblioteca";
import { toast as sonnerToast } from "sonner";
import { useToast } from "@/hooks/use-toast";

// --- MOCKS ---

// Mock do hook useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "mock-aluno-id",
      email: "aluno@hemera.edu",
      user_metadata: { role: "aluno" }
    }
  })
}));

// Mock do hook useToast (shadcn)
vi.mock("@/hooks/use-toast", () => {
  const toastMock = vi.fn();
  return {
    useToast: () => ({
      toast: toastMock
    })
  };
});

// Mock do Sonner (usado no painel do professor)
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("Suíte de Testes de QA & Usabilidade — Hemera OS Frontend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock fetch global para evitar requisições reais de rede e resolver o loading da biblioteca
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: [], results: [], docs: [], response: { docs: [] } }),
      } as any)
    );
  });

  // ────────────────────────────────────────────────────────
  // MÓDULO 1: Lançamento de Notas (Professor)
  // ────────────────────────────────────────────────────────
  describe("Módulo 1: Lançamento de Notas do Professor", () => {
    it("deve carregar a lista de alunos e permitir digitar uma nota válida (ex: 7.5) persistindo no localStorage", () => {
      render(<ProfLancamentoNotas />);

      // Busca o primeiro input de nota do primeiro aluno na listagem (ex: Lucas Silva)
      const inputs = screen.getAllByPlaceholderText("Clique para digitar...");
      expect(inputs.length).toBeGreaterThan(0);

      const firstInput = inputs[0];

      // Digita a nota 7.5
      fireEvent.change(firstInput, { target: { value: "7.5" } });
      expect(firstInput).toHaveValue(7.5);

      // Verifica se a nota foi salva no localStorage
      const savedNotas = localStorage.getItem("hemera_professor_notas");
      expect(savedNotas).not.toBeNull();
      const parsedNotas = JSON.parse(savedNotas!);
      // O valor deve estar associado ao id do primeiro aluno (que geralmente é a1 ou similar do mock)
      expect(Object.values(parsedNotas)).toContain("7.5");
    });

    it("deve rejeitar notas maiores que 10.0 (ex: 12.5), exibindo um toast de erro do sonner", () => {
      render(<ProfLancamentoNotas />);

      const inputs = screen.getAllByPlaceholderText("Clique para digitar...");
      const firstInput = inputs[0];

      // Tenta digitar 12.5
      fireEvent.change(firstInput, { target: { value: "12.5" } });

      // O input não deve manter o valor e o toast de erro deve ser acionado
      expect(sonnerToast.error).toHaveBeenCalledWith("A nota deve ser um número entre 0.0 e 10.0");
      
      const savedNotas = localStorage.getItem("hemera_professor_notas");
      expect(savedNotas).toBeNull(); // Não deve ter persistido nada no localStorage
    });

    it("deve rejeitar notas menores que 0.0 (ex: -1.5), exibindo um toast de erro do sonner", () => {
      render(<ProfLancamentoNotas />);

      const inputs = screen.getAllByPlaceholderText("Clique para digitar...");
      const firstInput = inputs[0];

      // Tenta digitar -1.5
      fireEvent.change(firstInput, { target: { value: "-1.5" } });

      expect(sonnerToast.error).toHaveBeenCalledWith("A nota deve ser um número entre 0.0 e 10.0");
      
      const savedNotas = localStorage.getItem("hemera_professor_notas");
      expect(savedNotas).toBeNull();
    });

    it("deve disparar toast de sucesso quando o professor pressionar 'Enter' no input da nota", () => {
      render(<ProfLancamentoNotas />);

      const inputs = screen.getAllByPlaceholderText("Clique para digitar...");
      const firstInput = inputs[0];

      // Digita a nota e pressiona Enter
      fireEvent.change(firstInput, { target: { value: "9.0" } });
      fireEvent.keyDown(firstInput, { key: "Enter", code: "Enter" });

      expect(sonnerToast.success).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────
  // MÓDULO 2: Validação de Upload no Moodle (Pólis)
  // ────────────────────────────────────────────────────────
  describe("Módulo 2: Upload de Arquivos de Tarefas no Pólis", () => {
    it("deve aceitar arquivos em formato homologado (PDF) menores que 10MB", async () => {
      const { toast } = useToast();
      render(<Polis />);

      // Navega para a aba do Moodle
      const moodleTabBtn = screen.getByRole("button", { name: /moodle/i });
      fireEvent.click(moodleTabBtn);

      // Abre a entrega da primeira tarefa clicando no botão de Enviar Trabalho
      const deliverButtons = screen.getAllByRole("button", { name: /Enviar Trabalho da Tarefa/i });
      expect(deliverButtons.length).toBeGreaterThan(0);
      fireEvent.click(deliverButtons[0]);

      // Busca o input de arquivo pelo seletor de tag do DOM
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();

      // Cria um arquivo fictício PDF válido de 2MB
      const mockFile = new File(["dummy pdf content"], "relatorio_calorimetria.pdf", {
        type: "application/pdf"
      });
      Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 }); // 2MB

      // Simula o upload
      fireEvent.change(fileInput!, { target: { files: [mockFile] } });

      // Verifica se o toast de sucesso foi disparado informando a verificação do arquivo
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Arquivo Carregado com Sucesso",
        description: expect.stringContaining("relatorio_calorimetria.pdf")
      }));
    });

    it("deve rejeitar uploads maiores que 10MB, disparando toast destrutivo de tamanho excedido", () => {
      const { toast } = useToast();
      render(<Polis />);

      const moodleTabBtn = screen.getByRole("button", { name: /moodle/i });
      fireEvent.click(moodleTabBtn);

      const deliverButtons = screen.getAllByRole("button", { name: /Enviar Trabalho da Tarefa/i });
      fireEvent.click(deliverButtons[0]);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();

      // Cria um arquivo fictício PDF de 12MB
      const heavyFile = new File(["dummy heavy content"], "trabalho_gigante.pdf", {
        type: "application/pdf"
      });
      Object.defineProperty(heavyFile, 'size', { value: 12 * 1024 * 1024 }); // 12MB

      // Simula o upload
      fireEvent.change(fileInput!, { target: { files: [heavyFile] } });

      // Deve disparar o toast de tamanho limite
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Arquivo Excede o Limite",
        description: "O tamanho máximo permitido para envios no Moodle é de 10MB.",
        variant: "destructive"
      }));
    });

    it("deve rejeitar uploads com extensões não homologadas (ex: .mp3, .exe), disparando toast destrutivo de formato inválido", () => {
      const { toast } = useToast();
      render(<Polis />);

      const moodleTabBtn = screen.getByRole("button", { name: /moodle/i });
      fireEvent.click(moodleTabBtn);

      const deliverButtons = screen.getAllByRole("button", { name: /Enviar Trabalho da Tarefa/i });
      fireEvent.click(deliverButtons[0]);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();

      // Cria arquivo executável não autorizado
      const invalidFile = new File(["malicious exe code"], "cheat.exe", {
        type: "application/x-msdownload"
      });

      // Simula o upload
      fireEvent.change(fileInput!, { target: { files: [invalidFile] } });

      // Deve disparar o toast de extensão
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Formato de Arquivo Inválido",
        description: expect.stringContaining("Por favor, envie apenas arquivos nos formatos: PDF, ZIP, DOCX, PNG."),
        variant: "destructive"
      }));
    });
  });

  // ────────────────────────────────────────────────────────
  // MÓDULO 3: Biblioteca Digital (Reservas)
  // ────────────────────────────────────────────────────────
  describe("Módulo 3: Reserva de Livros na Biblioteca Digital", () => {
    it("deve permitir que o aluno reserve um livro, exibindo o feedback correto e salvando no localStorage", async () => {
      const { toast } = useToast();
      render(<Biblioteca />);

      // Acha o card do livro "Dom Casmurro" de forma assíncrona após o carregamento inicial
      const bookCard = await screen.findByText("Dom Casmurro");
      expect(bookCard).toBeInTheDocument();
      fireEvent.click(bookCard);

      // Procura o botão de reservar dentro do modal que se abriu
      const reserveButton = await screen.findByRole("button", { name: /Reservar Livro/i });
      expect(reserveButton).toBeInTheDocument();

      // Clica em reservar
      fireEvent.click(reserveButton);

      // Verifica se salvou a reserva no localStorage
      const savedReservations = localStorage.getItem("hemera_biblioteca");
      expect(savedReservations).not.toBeNull();
      const parsedReservations = JSON.parse(savedReservations!);
      expect(parsedReservations["dp_dom_casmurro"]).toBe(true);

      // Verifica o toast de confirmação
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Reserva realizada!",
        description: "Retire o livro na biblioteca em até 48h."
      }));
    });

    it("deve permitir cancelar a reserva, atualizando o localStorage e mostrando toast de cancelamento", async () => {
      const { toast } = useToast();
      
      // Simula que já temos uma reserva existente no localStorage
      localStorage.setItem("hemera_biblioteca", JSON.stringify({ ["dp_dom_casmurro"]: true }));

      render(<Biblioteca />);

      // Abre o modal de "Dom Casmurro"
      const bookCard = await screen.findByText("Dom Casmurro");
      expect(bookCard).toBeInTheDocument();
      fireEvent.click(bookCard);

      // O botão no modal deve estar em estado de devolução
      const returnButton = await screen.findByRole("button", { name: /Devolver Reserva/i });
      expect(returnButton).toBeInTheDocument();
      
      fireEvent.click(returnButton);

      // Verifica o localStorage atualizado (deve estar desmarcado)
      const savedReservations = localStorage.getItem("hemera_biblioteca");
      const parsed = JSON.parse(savedReservations!);
      expect(parsed["dp_dom_casmurro"]).toBe(false);

      // Verifica o toast de cancelamento
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Reserva cancelada!",
        description: "A devolução/cancelamento foi registrado com sucesso."
      }));
    });
  });
});
