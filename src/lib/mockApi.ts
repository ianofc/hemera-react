// Mock APIs para Biblioteca, Cursos (AVA estilo Moodle) e Área Escolar.
// Simula latência e respostas para integração futura com backend real.

import { seed, SeedLivro, SeedCurso, SeedModulo, SeedEvento } from "@/data/seed";

const delay = (ms = 120) => new Promise((res) => setTimeout(res, ms));

// ----- Biblioteca -----
export const bibliotecaApi = {
  async list(filtro?: { q?: string; status?: SeedLivro["status"] }): Promise<SeedLivro[]> {
    await delay();
    let r = seed.livros;
    if (filtro?.q) {
      const q = filtro.q.toLowerCase();
      r = r.filter((l) => l.titulo.toLowerCase().includes(q) || l.autor.toLowerCase().includes(q));
    }
    if (filtro?.status) r = r.filter((l) => l.status === filtro.status);
    return r;
  },
  async get(id: string): Promise<SeedLivro | undefined> {
    await delay();
    return seed.livros.find((l) => l.id === id);
  },
  async reservar(id: string) {
    await delay();
    return { ok: true, id, status: "Reservado" as const };
  },
  async devolver(id: string) {
    await delay();
    return { ok: true, id, status: "Disponível" as const };
  },
};

// ----- Cursos (AVA) -----
export const cursosApi = {
  async list(filtro?: { q?: string; categoria?: string; status?: SeedCurso["status"] }): Promise<SeedCurso[]> {
    await delay();
    let r = seed.cursos;
    if (filtro?.q) {
      const q = filtro.q.toLowerCase();
      r = r.filter((c) => c.titulo.toLowerCase().includes(q));
    }
    if (filtro?.categoria) r = r.filter((c) => c.categoria === filtro.categoria);
    if (filtro?.status) r = r.filter((c) => c.status === filtro.status);
    return r;
  },
  async get(id: string): Promise<SeedCurso | undefined> {
    await delay();
    return seed.cursos.find((c) => c.id === id);
  },
  async modulos(cursoId: string): Promise<SeedModulo[]> {
    await delay();
    return seed.modulos.filter((m) => m.cursoId === cursoId);
  },
  async inscrever(cursoId: string) {
    await delay();
    return { ok: true, cursoId, inscrito: true };
  },
  async progresso(cursoId: string) {
    await delay();
    const mods = seed.modulos.filter((m) => m.cursoId === cursoId);
    return { cursoId, percent: Math.floor(Math.random() * 100), totalAulas: mods.reduce((s, m) => s + m.aulas, 0) };
  },
};

// ----- Área Escolar -----
export const areaEscolarApi = {
  async eventos(): Promise<SeedEvento[]> {
    await delay();
    return seed.eventos;
  },
  async secretaria() {
    await delay();
    return [
      { id: "doc-01", titulo: "Declaração de matrícula", prazo: "2 dias úteis" },
      { id: "doc-02", titulo: "Histórico escolar", prazo: "5 dias úteis" },
      { id: "doc-03", titulo: "Atestado de frequência", prazo: "1 dia útil" },
    ];
  },
  async financeiro() {
    await delay();
    return [
      { id: "fin-01", descricao: "Mensalidade Maio/26", venc: "10/05/2026", valor: "R$ 980,00", status: "Em aberto" },
      { id: "fin-02", descricao: "Mensalidade Abril/26", venc: "10/04/2026", valor: "R$ 980,00", status: "Pago" },
      { id: "fin-03", descricao: "Material didático", venc: "01/02/2026", valor: "R$ 420,00", status: "Pago" },
    ];
  },
};
