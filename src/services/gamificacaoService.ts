import { supabase } from '@/integrations/supabase/client';

export interface GamificacaoStatus {
  nivel: number;
  xpAtual: number;
  xpProximoNivel: number;
  titulo: string;
  conquistas: Conquista[];
}

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: string; 
  desbloqueada: boolean;
  dataDesbloqueio?: string;
}

const TITULOS_NIVEIS = [
  "Iniciante", "Explorador", "Aprendiz Dedicado", "Estudante Notável", 
  "Veterano", "Sábio", "Mestre do Hemera"
];

const calcularNivel = (xp: number) => {
  const nivel = Math.floor(Math.sqrt(xp / 100)) + 1;
  const xpBaseAtual = Math.pow(nivel - 1, 2) * 100;
  const xpProximoNivel = Math.pow(nivel, 2) * 100;
  
  return {
    nivel,
    xpAtual: xp,
    xpProgressoNoNivel: xp - xpBaseAtual,
    xpTotalDoNivel: xpProximoNivel - xpBaseAtual,
    xpProximoNivel,
    titulo: TITULOS_NIVEIS[Math.min(nivel - 1, TITULOS_NIVEIS.length - 1)]
  };
};

const defaultConquistas: Conquista[] = [
  { id: "c1", titulo: "Primeiros Passos", descricao: "Acessou a plataforma pela primeira vez.", icone: "🚀", desbloqueada: true, dataDesbloqueio: "2023-01-10" },
  { id: "c2", titulo: "Rato de Biblioteca", descricao: "Leu 5 materiais na biblioteca.", icone: "📚", desbloqueada: true, dataDesbloqueio: "2023-02-15" },
  { id: "c3", titulo: "Sempre Presente", descricao: "100% de frequência no mês.", icone: "⭐", desbloqueada: false },
  { id: "c4", titulo: "No Prazo", descricao: "Entregou 5 atividades antes do prazo.", icone: "⚡", desbloqueada: false }
];

let mockXP = 850;

export const gamificacaoService = {
  
  async getStatusAluno(): Promise<GamificacaoStatus> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const calc = calcularNivel(mockXP);
        return { nivel: calc.nivel, xpAtual: calc.xpAtual, xpProximoNivel: calc.xpProximoNivel, titulo: calc.titulo, conquistas: defaultConquistas };
      }

      // Busca XP no Supabase
      const { data: xpData, error: xpError } = await supabase
        .from('gamificacao_status')
        .select('*')
        .eq('aluno_id', user.id)
        .maybeSingle();

      if (xpError) throw xpError;

      const xp = xpData ? xpData.xp_total : 0;
      const calc = calcularNivel(xp);

      // Busca Conquistas
      const { data: conqData } = await supabase
        .from('gamificacao_conquistas')
        .select('*')
        .eq('aluno_id', user.id);

      const conquistas = defaultConquistas.map(def => {
        const achada = (conqData || []).find(c => c.badge_id === def.id);
        if (achada) {
          return {
            ...def,
            desbloqueada: true,
            dataDesbloqueio: achada.desbloqueada_em ? new Date(achada.desbloqueada_em).toLocaleDateString() : undefined
          };
        }
        return def;
      });

      return {
        nivel: calc.nivel,
        xpAtual: calc.xpAtual,
        xpProximoNivel: calc.xpProximoNivel,
        titulo: calc.titulo,
        conquistas
      };
    } catch (e) {
      const calc = calcularNivel(mockXP);
      return {
        nivel: calc.nivel,
        xpAtual: calc.xpAtual,
        xpProximoNivel: calc.xpProximoNivel,
        titulo: calc.titulo,
        conquistas: defaultConquistas
      };
    }
  },

  async adicionarXP(quantidade: number, motivo: string): Promise<{ subiuNivel: boolean, novoNivel: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const nivelAnterior = calcularNivel(mockXP).nivel;
        mockXP += quantidade;
        const novoNivelInfo = calcularNivel(mockXP);
        return { subiuNivel: novoNivelInfo.nivel > nivelAnterior, novoNivel: novoNivelInfo.nivel };
      }

      // Busca XP atual
      const { data: xpData } = await supabase
        .from('gamificacao_status')
        .select('xp_total')
        .eq('aluno_id', user.id)
        .maybeSingle();

      const xpAtual = xpData ? xpData.xp_total : 0;
      const calcAnterior = calcularNivel(xpAtual);
      const novoXP = xpAtual + quantidade;
      const calcNovo = calcularNivel(novoXP);

      // Salva novo XP
      await supabase
        .from('gamificacao_status')
        .upsert({ 
          aluno_id: user.id, 
          xp_total: novoXP,
          nivel: calcNovo.nivel,
          ultima_atualizacao: new Date().toISOString()
        });

      return {
        subiuNivel: calcNovo.nivel > calcAnterior.nivel,
        novoNivel: calcNovo.nivel
      };
    } catch (e) {
      const nivelAnterior = calcularNivel(mockXP).nivel;
      mockXP += quantidade;
      const novoNivelInfo = calcularNivel(mockXP);
      return {
        subiuNivel: novoNivelInfo.nivel > nivelAnterior,
        novoNivel: novoNivelInfo.nivel
      };
    }
  }

};
