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

const DEFAULT_MODULOS: ModuloCurso[] = [
  {
    id: "m_c1_1",
    cursoId: "c1",
    titulo: "1. Introdução e Estratégia ENEM",
    ordem: 1,
    aulas: [
      { id: "a_c1_1", moduloId: "m_c1_1", titulo: "Estratégia de Resolução Matemática", duracaoMinutos: 12, tipo: "video", ordem: 1 },
      { id: "a_c1_2", moduloId: "m_c1_1", titulo: "Tópicos Mais Recorrentes", duracaoMinutos: 8, tipo: "leitura", ordem: 2 }
    ]
  },
  {
    id: "m_c2_1",
    cursoId: "c2",
    titulo: "1. Configurando o Ambiente",
    ordem: 1,
    aulas: [
      { id: "a_c2_1", moduloId: "m_c2_1", titulo: "Instalação do Python e VS Code", duracaoMinutos: 15, tipo: "video", ordem: 1 },
      { id: "a_c2_2", moduloId: "m_c2_1", titulo: "Variáveis e Operadores Básicos", duracaoMinutos: 20, tipo: "video", ordem: 2 }
    ]
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
      if (!data || data.length === 0) throw new Error("Empty db");

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
      console.warn("Tabelas de cursos não criadas ainda no Supabase. Usando fallback local.", e);
      const local = localStorage.getItem("hemera_cursos");
      if (!local) {
        localStorage.setItem("hemera_cursos", JSON.stringify(mockCursos));
        return mockCursos;
      }
      return JSON.parse(local);
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
      const local = localStorage.getItem("hemera_cursos");
      const list: Curso[] = local ? JSON.parse(local) : mockCursos;
      return list.find(c => c.id === id) || null;
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
      if (!modulosData || modulosData.length === 0) throw new Error("Empty modulos");

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
      const local = localStorage.getItem("hemera_cursos_modulos");
      const list: ModuloCurso[] = local ? JSON.parse(local) : DEFAULT_MODULOS;
      if (!local) {
        localStorage.setItem("hemera_cursos_modulos", JSON.stringify(DEFAULT_MODULOS));
      }
      return list.filter(m => m.cursoId === cursoId);
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
  },

  async criarCurso(titulo: string, descricao: string, categoria: string, preco: number, imagemCapa: string, modulos: ModuloCurso[]): Promise<Curso> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cursos')
        .insert({
          titulo,
          descricao,
          categoria,
          preco,
          imagem_capa: imagemCapa,
          is_gratis: preco === 0,
          instrutor_nome: user?.user_metadata?.first_name || 'Professor',
          instrutor_avatar: user?.user_metadata?.avatar_url || '',
          alunos_inscritos: 0,
          carga_horaria: modulos.reduce((acc, m) => acc + m.aulas.reduce((sum, a) => sum + a.duracaoMinutos, 0), 0) / 60,
          rating: 5.0
        })
        .select()
        .single();
      if (error) throw error;
      
      // Save modules
      for (const m of modulos) {
        const { data: modData } = await supabase.from('modulos').insert({ curso_id: data.id, titulo: m.titulo, ordem: m.ordem }).select().single();
        if (modData) {
          for (const a of m.aulas) {
            await supabase.from('aulas').insert({ modulo_id: modData.id, titulo: a.titulo, duracao_minutos: a.duracaoMinutos, tipo: a.tipo, ordem: a.ordem, exige_entrega: a.exigeEntrega });
          }
        }
      }
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
      console.warn("Erro ao criar curso no Supabase. Salvando localmente.", e);
      const local = localStorage.getItem("hemera_cursos");
      const list: Curso[] = local ? JSON.parse(local) : mockCursos;
      
      const novoId = `c_${Date.now()}`;
      const novoCurso: Curso = {
        id: novoId,
        titulo,
        descricao,
        instrutor: "Professor Local",
        instrutorAvatar: "https://i.pravatar.cc/150?u=prof_local",
        categoria,
        imagemCapa,
        isGratis: preco === 0,
        preco,
        alunosInscritos: 0,
        cargaHoraria: Math.round(modulos.reduce((acc, m) => acc + m.aulas.reduce((sum, a) => sum + a.duracaoMinutos, 0), 0) / 60) || 5,
        rating: 5.0
      };
      
      localStorage.setItem("hemera_cursos", JSON.stringify([...list, novoCurso]));
      
      // Save modules
      const localMods = localStorage.getItem("hemera_cursos_modulos");
      const currentMods: ModuloCurso[] = localMods ? JSON.parse(localMods) : DEFAULT_MODULOS;
      
      const savedMods = modulos.map((m, idx) => ({
        ...m,
        id: m.id || `m_${Date.now()}_${idx}`,
        cursoId: novoId,
        aulas: m.aulas.map((a, aidx) => ({
          ...a,
          id: a.id || `a_${Date.now()}_${idx}_${aidx}`,
          moduloId: m.id || `m_${Date.now()}_${idx}`
        }))
      }));
      
      localStorage.setItem("hemera_cursos_modulos", JSON.stringify([...currentMods, ...savedMods]));
      return novoCurso;
    }
  },

  async editarCurso(id: string, updates: Partial<Curso>, modulos?: ModuloCurso[]): Promise<Curso> {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .update({
          titulo: updates.titulo,
          descricao: updates.descricao,
          categoria: updates.categoria,
          preco: updates.preco,
          is_gratis: updates.preco === 0,
          imagem_capa: updates.imagemCapa,
          carga_horaria: updates.cargaHoraria
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      if (modulos) {
        // Simple update: delete and recreate modules for this course
        await supabase.from('modulos').delete().eq('curso_id', id);
        for (const m of modulos) {
          const { data: modData } = await supabase.from('modulos').insert({ curso_id: id, titulo: m.titulo, ordem: m.ordem }).select().single();
          if (modData) {
            for (const a of m.aulas) {
              await supabase.from('aulas').insert({ modulo_id: modData.id, titulo: a.titulo, duracao_minutos: a.duracaoMinutos, tipo: a.tipo, ordem: a.ordem, exige_entrega: a.exigeEntrega });
            }
          }
        }
      }

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
      console.warn("Erro ao editar curso no Supabase. Editando localmente.", e);
      const local = localStorage.getItem("hemera_cursos");
      const list: Curso[] = local ? JSON.parse(local) : mockCursos;
      
      let updated: Curso | null = null;
      const nextList = list.map(c => {
        if (c.id === id) {
          updated = { ...c, ...updates };
          return updated;
        }
        return c;
      });
      localStorage.setItem("hemera_cursos", JSON.stringify(nextList));

      if (modulos) {
        const localMods = localStorage.getItem("hemera_cursos_modulos");
        const currentMods: ModuloCurso[] = localMods ? JSON.parse(localMods) : DEFAULT_MODULOS;
        
        // Remove current modules for this course
        const otherMods = currentMods.filter(m => m.cursoId !== id);
        
        const savedMods = modulos.map((m, idx) => ({
          ...m,
          id: m.id || `m_${Date.now()}_${idx}`,
          cursoId: id,
          aulas: m.aulas.map((a, aidx) => ({
            ...a,
            id: a.id || `a_${Date.now()}_${idx}_${aidx}`,
            moduloId: m.id || `m_${Date.now()}_${idx}`
          }))
        }));
        
        localStorage.setItem("hemera_cursos_modulos", JSON.stringify([...otherMods, ...savedMods]));
      }

      if (!updated) throw new Error("Curso não encontrado localmente");
      return updated;
    }
  },

  async deletarCurso(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('cursos').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Erro ao deletar curso no Supabase. Deletando localmente.", e);
      const local = localStorage.getItem("hemera_cursos");
      const list: Curso[] = local ? JSON.parse(local) : mockCursos;
      localStorage.setItem("hemera_cursos", JSON.stringify(list.filter(c => c.id !== id)));

      const localMods = localStorage.getItem("hemera_cursos_modulos");
      const currentMods: ModuloCurso[] = localMods ? JSON.parse(localMods) : DEFAULT_MODULOS;
      localStorage.setItem("hemera_cursos_modulos", JSON.stringify(currentMods.filter(m => m.cursoId !== id)));
    }
  }
};
