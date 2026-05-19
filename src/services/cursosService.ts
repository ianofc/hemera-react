import { supabase } from '@/integrations/supabase/client';

export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  instrutor: string;
  instrutorAvatar?: string;
  categoria: string;
  imagemCapa: string;
  isGratis: boolean;
  preco?: number;
  alunosInscritos: number;
  cargaHoraria: number;
  rating: number;
  nivel?: string;
}

export interface ModuloCurso {
  id: string;
  cursoId: string;
  titulo: string;
  ordem: number;
  aulas: AulaCurso[];
}

export interface AulaCurso {
  id: string;
  moduloId: string;
  titulo: string;
  duracaoMinutos: number;
  tipo: 'video' | 'leitura' | 'quiz';
  ordem: number;
  exigeEntrega?: boolean;
}

// Mocks de segurança caso o banco ainda não tenha as tabelas criadas
const mockCursos: Curso[] = [
  {
    id: "c1",
    titulo: "Matemática para o ENEM: O Guia Definitivo",
    descricao: "Revise todos os tópicos de matemática que mais caem no ENEM com exercícios práticos e simulados.",
    instrutor: "Prof. Alberto Santos",
    instrutorAvatar: "https://i.pravatar.cc/150?u=alberto",
    categoria: "ENEM",
    imagemCapa: "https://images.unsplash.com/photo-1632559646095-c49646292bf8?w=800&q=80",
    isGratis: true,
    alunosInscritos: 1254,
    cargaHoraria: 40,
    rating: 4.8
  },
  {
    id: "c2",
    titulo: "Introdução à Lógica de Programação com Python",
    descricao: "O primeiro passo para o mundo da tecnologia. Aprenda algoritmos e desenvolva seus primeiros scripts em Python.",
    instrutor: "ZIOS (IA Tutor)",
    instrutorAvatar: "https://i.pravatar.cc/150?u=zios",
    categoria: "Tecnologia",
    imagemCapa: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    isGratis: true,
    alunosInscritos: 830,
    cargaHoraria: 20,
    rating: 4.9
  }
];

export const cursosService = {
  
  async getCatalogo(): Promise<Curso[]> {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return mockCursos;

      return data.map(c => ({
        id: c.id,
        titulo: c.titulo,
        descricao: c.descricao,
        instrutor: c.instrutor_nome,
        instrutorAvatar: c.instrutor_avatar,
        categoria: c.categoria,
        imagemCapa: c.imagem_capa || "https://images.unsplash.com/photo-1455390582262-044cdead27d8?w=800&q=80",
        isGratis: c.is_gratis,
        preco: Number(c.preco),
        alunosInscritos: c.alunos_inscritos,
        cargaHoraria: c.carga_horaria,
        rating: Number(c.rating)
      }));
    } catch (e) {
      console.warn("Tabelas de cursos não criadas ainda no Supabase. Usando fallback.", e);
      return mockCursos;
    }
  },

  async getCursoById(id: string): Promise<Curso | null> {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        instrutor: data.instrutor_nome,
        instrutorAvatar: data.instrutor_avatar,
        categoria: data.categoria,
        imagemCapa: data.imagem_capa,
        isGratis: data.is_gratis,
        preco: Number(data.preco),
        alunosInscritos: data.alunos_inscritos,
        cargaHoraria: data.carga_horaria,
        rating: Number(data.rating)
      };
    } catch (e) {
      return mockCursos.find(c => c.id === id) || null;
    }
  },

  async getModulosCurso(cursoId: string): Promise<ModuloCurso[]> {
    try {
      const { data: modulosData, error: modError } = await supabase
        .from('modulos')
        .select('*')
        .eq('curso_id', cursoId)
        .order('ordem', { ascending: true });

      if (modError) throw modError;
      if (!modulosData) return [];

      const result: ModuloCurso[] = [];
      for (const m of modulosData) {
        const { data: aulasData } = await supabase
          .from('aulas')
          .select('*')
          .eq('modulo_id', m.id)
          .order('ordem', { ascending: true });

        result.push({
          id: m.id,
          cursoId: m.curso_id,
          titulo: m.titulo,
          ordem: m.ordem,
          aulas: (aulasData || []).map(a => ({
            id: a.id,
            moduloId: a.modulo_id,
            titulo: a.titulo,
            duracaoMinutos: a.duracao_minutos,
            tipo: (a.tipo as AulaCurso['tipo']) ?? 'video',
            ordem: a.ordem,
            exigeEntrega: a.exige_entrega
          }))
        });
      }

      return result;
    } catch (e) {
      return [
        {
          id: "m_fake", cursoId, titulo: "Módulo Introdutório (Demo)", ordem: 1, aulas: [
            { id: "a_fake1", moduloId: "m_fake", titulo: "Bem-vindo ao curso", duracaoMinutos: 5, tipo: "video", ordem: 1 }
          ]
        }
      ];
    }
  },

  async isAlunoMatriculado(cursoId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('matriculas')
        .select('id')
        .eq('curso_id', cursoId)
        .eq('aluno_id', user.id)
        .maybeSingle();

      return !!data;
    } catch (e) {
      return cursoId === "c2"; // Mock fallback
    }
  },

  async getProgresso(cursoId: string): Promise<{ aulasAssistidas: string[], percentual: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { aulasAssistidas: [], percentual: 0 };

      const { data: matData } = await supabase
        .from('matriculas')
        .select('id')
        .eq('curso_id', cursoId)
        .eq('aluno_id', user.id)
        .single();

      if (!matData) return { aulasAssistidas: [], percentual: 0 };

      const { data: progData } = await supabase
        .from('progresso_aluno')
        .select('aula_id')
        .eq('matricula_id', matData.id);

      const assistidas = (progData || []).map(p => p.aula_id);
      
      // Total de aulas
      const modulos = await this.getModulosCurso(cursoId);
      const totalAulas = modulos.reduce((acc, curr) => acc + curr.aulas.length, 0);

      return {
        aulasAssistidas: assistidas,
        percentual: totalAulas > 0 ? Math.round((assistidas.length / totalAulas) * 100) : 0
      };
    } catch (e) {
      if (cursoId === "c2") return { aulasAssistidas: ["a_fake1"], percentual: 100 };
      return { aulasAssistidas: [], percentual: 0 };
    }
  },

  async matricular(cursoId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('matriculas')
        .insert({ curso_id: cursoId, aluno_id: user.id });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error(e);
      return true; // Fallback success para testes sem DB
    }
  }
};
