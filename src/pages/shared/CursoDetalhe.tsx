import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cursosService, Curso, ModuloCurso } from "@/services/cursosService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  PlayCircle, CheckCircle, Lock, Star, Users, Clock, Loader2, ArrowLeft,
  ChevronDown, ChevronUp, FileText, HelpCircle, MonitorPlay, MessageSquare, UploadCloud, Trophy
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { gamificacaoService } from "@/services/gamificacaoService";

export default function CursoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<ModuloCurso[]>([]);
  const [isMatriculado, setIsMatriculado] = useState(false);
  const [progresso, setProgresso] = useState({ aulasAssistidas: [] as string[], percentual: 0 });
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'conteudo' | 'forum' | 'entregas'>('conteudo');
  
  // Controle de sanfona (accordion) dos módulos
  const [modulosAbertos, setModulosAbertos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) loadData(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async (cursoId: string) => {
    try {
      setLoading(true);
      const c = await cursosService.getCursoById(cursoId);
      if (c) {
        setCurso(c);
        const m = await cursosService.getModulosCurso(cursoId);
        setModulos(m);
        const matriculado = await cursosService.isAlunoMatriculado(cursoId);
        setIsMatriculado(matriculado);
        
        if (matriculado) {
          const p = await cursosService.getProgresso(cursoId);
          setProgresso(p);
          // Abre o primeiro módulo por padrão
          if (m.length > 0) setModulosAbertos({ [m[0].id]: true });
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível carregar os detalhes do curso.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMatricular = async () => {
    if (!curso) return;
    setEnrolling(true);
    try {
      await cursosService.matricular(curso.id);
      setIsMatriculado(true);
      toast({ title: "Matrícula Confirmada!", description: "Bem-vindo ao curso. Bons estudos!" });
      // Abre o primeiro módulo automaticamente
      if (modulos.length > 0) setModulosAbertos({ [modulos[0].id]: true });
    } catch (e) {
      toast({ title: "Erro", description: "Falha na matrícula.", variant: "destructive" });
    } finally {
      setEnrolling(false);
    }
  };

  const completarAula = async (aulaId: string) => {
    if (!isMatriculado) return;
    if (progresso.aulasAssistidas.includes(aulaId)) return;
    
    // Atualiza front
    setProgresso(prev => ({
      ...prev,
      aulasAssistidas: [...prev.aulasAssistidas, aulaId],
      percentual: Math.min(100, Math.round(((prev.aulasAssistidas.length + 1) / totalAulas) * 100))
    }));
    
    // Adiciona XP
    const { subiuNivel, novoNivel } = await gamificacaoService.adicionarXP(50, "Aula concluída");
    
    toast({
      title: "+50 XP Ganho! 🌟",
      description: "Aula concluída com sucesso.",
      className: "bg-amber-500 border-amber-600 text-white"
    });
    
    if (subiuNivel) {
      toast({
        title: "Subiu de Nível! 🏆",
        description: `Parabéns, você agora é Nível ${novoNivel}!`,
        className: "bg-indigo-600 border-indigo-700 text-white"
      });
    }
  };

  const toggleModulo = (modId: string) => {
    setModulosAbertos(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const getAulaIcon = (tipo: string, foiAssistida: boolean, isLocked: boolean) => {
    if (isLocked) return <Lock className="w-4 h-4 text-slate-400" />;
    if (foiAssistida) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    
    switch (tipo) {
      case 'video': return <MonitorPlay className="w-4 h-4 text-slate-500 group-hover:text-blue-500" />;
      case 'leitura': return <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-500" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-slate-500 group-hover:text-blue-500" />;
      default: return <PlayCircle className="w-4 h-4 text-slate-500 group-hover:text-blue-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-4rem)]"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  if (!curso) {
    return <div className="p-10 text-center">Curso não encontrado.</div>;
  }

  const totalAulas = modulos.reduce((acc, mod) => acc + mod.aulas.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in-down">
      
      {/* HEADER / HERO SECTION */}
      <div className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src={curso.imagemCapa} alt="Background" className="w-full h-full object-cover blur-md" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/40 z-0"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-white mb-8 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o catálogo
          </button>
          
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-6">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs font-bold uppercase tracking-widest border border-blue-500/30">
                {curso.categoria}
              </span>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight font-display">
                {curso.titulo}
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                {curso.descricao}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-amber-400">{curso.rating}</span>
                  <span>(1.2k avaliações)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  <span>{(curso.alunosInscritos / 1000).toFixed(1)}k inscritos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span>{curso.cargaHoraria}h totais</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700 max-w-md">
                {curso.instrutorAvatar ? (
                  <img src={curso.instrutorAvatar} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-600" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400">Criado por</p>
                  <p className="font-bold text-slate-200">{curso.instrutor}</p>
                </div>
              </div>
            </div>

            {/* SIDEBAR WIDGET (Ação Principal) */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-2xl text-slate-800 border border-slate-200 sticky top-8">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 relative group">
                  <img src={curso.imagemCapa} alt="Thumbnail" className="w-full h-full object-cover" />
                  {!isMatriculado && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group-hover:bg-black/50 transition-colors">
                      <PlayCircle className="w-16 h-16 text-white drop-shadow-lg opacity-90 group-hover:scale-110 transition-transform" />
                    </div>
                  )}
                </div>

                {isMatriculado ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                        <span>Progresso do Curso</span>
                        <span className="text-blue-600">{progresso.percentual}%</span>
                      </div>
                      <Progress value={progresso.percentual} className="h-2 bg-slate-100" />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-lg shadow-blue-200">
                      Continuar Aprendendo
                    </Button>
                    <p className="text-center text-xs text-slate-500">
                      Você completou {progresso.aulasAssistidas.length} de {totalAulas} aulas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      {curso.isGratis ? (
                        <span className="text-3xl font-black text-emerald-600">Gratuito</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-4xl font-black text-slate-800">R$ {curso.preco?.toFixed(2).replace('.', ',')}</span>
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">Acesso Vitalício</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleMatricular} 
                      disabled={enrolling}
                      className={`w-full h-12 text-base font-bold shadow-lg ${curso.isGratis ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                    >
                      {enrolling ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      {curso.isGratis ? "Matricular-se Agora" : "Comprar Agora"}
                    </Button>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="font-bold text-sm text-slate-800">Este curso inclui:</h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2"><MonitorPlay className="w-4 h-4 text-slate-400" /> {curso.cargaHoraria} horas de vídeo sob demanda</li>
                        <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Exercícios e Materiais em PDF</li>
                        <li className="flex items-center gap-2"><Award className="w-4 h-4 text-slate-400" /> Certificado de conclusão válido</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS MOODLE & CONTEÚDO */}
      {isMatriculado && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <div className="flex gap-6 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('conteudo')}
              className={`pb-3 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'conteudo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Conteúdo do Curso
            </button>
            <button 
              onClick={() => setActiveTab('forum')}
              className={`pb-3 px-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'forum' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <MessageSquare className="w-4 h-4" /> Fórum de Dúvidas
            </button>
            <button 
              onClick={() => setActiveTab('entregas')}
              className={`pb-3 px-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'entregas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <UploadCloud className="w-4 h-4" /> Entregas e Trabalhos
            </button>
          </div>
        </div>
      )}

      {/* ÁREA DE CONTEÚDO */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-3xl">
          {activeTab === 'conteudo' && (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 font-display">Conteúdo do Curso</h2>
              
              <div className="flex justify-between items-center mb-4 text-sm text-slate-500">
                <span>{modulos.length} seções • {totalAulas} aulas</span>
                {isMatriculado && <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Matriculado</span>}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                {modulos.map((mod, index) => (
                  <div key={mod.id} className={index !== 0 ? "border-t border-slate-200" : ""}>
                    {/* Header do Módulo */}
                    <button 
                      onClick={() => toggleModulo(mod.id)}
                      className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {modulosAbertos[mod.id] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        <span className="font-bold text-slate-800">{mod.titulo}</span>
                      </div>
                      <span className="text-xs text-slate-500 hidden sm:block">{mod.aulas.length} aulas</span>
                    </button>
                    
                    {/* Aulas do Módulo */}
                    {modulosAbertos[mod.id] && (
                      <div className="bg-white">
                        {mod.aulas.map((aula, i) => {
                          const foiAssistida = progresso.aulasAssistidas.includes(aula.id);
                          const isLocked = !isMatriculado;
                          
                          return (
                            <div 
                              key={aula.id} 
                              onClick={() => completarAula(aula.id)}
                              className={`flex items-center justify-between py-3 px-5 lg:px-10 group ${isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-blue-50'} ${i !== 0 ? 'border-t border-slate-100' : ''}`}
                            >
                              <div className="flex items-center gap-4">
                                {getAulaIcon(aula.tipo, foiAssistida, isLocked)}
                                <span className={`text-sm ${foiAssistida ? 'text-slate-500' : (isLocked ? 'text-slate-500' : 'text-slate-700 font-medium group-hover:text-blue-700')}`}>
                                  {aula.titulo}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                {!foiAssistida && !isLocked && <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full">+50 XP</span>}
                                <span className="text-xs text-slate-400">{aula.duracaoMinutos} min</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'forum' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Fórum de Discussão</h3>
              <p className="text-slate-500 mt-2 mb-6">Tire dúvidas com o instrutor e ganhe XP ajudando a comunidade.</p>
              <Button className="bg-blue-600 hover:bg-blue-700 font-bold">Novo Tópico de Dúvida</Button>
            </div>
          )}

          {activeTab === 'entregas' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <UploadCloud className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Painel de Entregas</h3>
              <p className="text-slate-500 mt-2 mb-6">Trabalhos e exercícios requeridos pelo professor aparecerão aqui.</p>
              <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold">Ver Calendário Moodle</Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
