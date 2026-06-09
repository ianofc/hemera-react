import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cursosService } from "@/services/cursosService";
import { 
  ArrowLeft, Save, Plus, GripVertical, Settings, PlayCircle, FileText, 
  HelpCircle, Trash2, LayoutTemplate, DollarSign, UploadCloud, MonitorPlay
} from "lucide-react";

interface BuilderModulo {
  id: string;
  titulo: string;
  aulas: BuilderAula[];
}

interface BuilderAula {
  id: string;
  titulo: string;
  tipo: 'video' | 'leitura' | 'quiz';
  exigeEntrega: boolean;
}

export default function CursoBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'vitrine' | 'conteudo'>('vitrine');

  // Estado da Vitrine e Monetização
  const [cursoData, setCursoData] = useState({
    titulo: "",
    descricao: "",
    categoria: "Geral",
    isGratis: true,
    preco: 0
  });

  const [imagemCapa, setImagemCapa] = useState("https://images.unsplash.com/photo-1455390582262-044cdead27d8?w=800&q=80");

  // Estado dos Módulos (Builder)
  const [modulos, setModulos] = useState<BuilderModulo[]>([
    {
      id: "m1",
      titulo: "Módulo Introdutório",
      aulas: [
        { id: "a1", titulo: "Boas-vindas ao curso", tipo: "video", exigeEntrega: false }
      ]
    }
  ]);

  // Load existing course data if in Edit Mode
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const curso = await cursosService.getCursoById(id);
          if (curso) {
            setCursoData({
              titulo: curso.titulo,
              descricao: curso.descricao,
              categoria: curso.categoria,
              isGratis: curso.isGratis,
              preco: curso.preco || 0
            });
            if (curso.imagemCapa) {
              setImagemCapa(curso.imagemCapa);
            }
          }
          const modulosData = await cursosService.getModulosCurso(id);
          if (modulosData && modulosData.length > 0) {
            setModulos(modulosData.map(m => ({
              id: m.id,
              titulo: m.titulo,
              aulas: m.aulas.map(a => ({
                id: a.id,
                titulo: a.titulo,
                tipo: a.tipo,
                exigeEntrega: !!a.exigeEntrega
              }))
            })));
          }
        } catch (err) {
          console.error("Erro ao carregar curso:", err);
        }
      })();
    }
  }, [id]);

  const addModulo = () => {
    setModulos([
      ...modulos, 
      { id: `m_${Date.now()}_${Math.random()}`, titulo: "Novo Módulo", aulas: [] }
    ]);
  };

  const removeModulo = (moduloId: string) => {
    if (!confirm("Deseja realmente excluir este módulo e todas as suas aulas?")) return;
    setModulos(modulos.filter(m => m.id !== moduloId));
  };

  const addAula = (moduloId: string) => {
    setModulos(modulos.map(m => {
      if (m.id === moduloId) {
        return {
          ...m,
          aulas: [...m.aulas, { id: `a_${Date.now()}_${Math.random()}`, titulo: "Nova Aula", tipo: "video", exigeEntrega: false }]
        };
      }
      return m;
    }));
  };

  const removeAula = (moduloId: string, aulaId: string) => {
    setModulos(modulos.map(m => {
      if (m.id === moduloId) {
        return { ...m, aulas: m.aulas.filter(a => a.id !== aulaId) };
      }
      return m;
    }));
  };

  const handleSave = async () => {
    if (!cursoData.titulo.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "O título do curso é obrigatório."
      });
      return;
    }

    try {
      const modulosMapeados = modulos.map((m, mIdx) => ({
        id: m.id,
        cursoId: id || "",
        titulo: m.titulo,
        ordem: mIdx + 1,
        aulas: m.aulas.map((a, aIdx) => ({
          id: a.id,
          moduloId: m.id,
          titulo: a.titulo,
          duracaoMinutos: 15,
          tipo: a.tipo,
          ordem: aIdx + 1,
          exigeEntrega: a.exigeEntrega
        }))
      }));

      if (id) {
        await cursosService.editarCurso(id, {
          titulo: cursoData.titulo,
          descricao: cursoData.descricao,
          categoria: cursoData.categoria,
          preco: cursoData.preco,
          isGratis: cursoData.isGratis,
          imagemCapa
        }, modulosMapeados);
        toast({
          title: "Curso Atualizado!",
          description: "As alterações do curso foram salvas com sucesso.",
          className: "bg-emerald-650 text-white border-emerald-700"
        });
      } else {
        await cursosService.criarCurso(
          cursoData.titulo,
          cursoData.descricao,
          cursoData.categoria,
          cursoData.preco,
          imagemCapa,
          modulosMapeados
        );
        toast({
          title: "Curso Criado!",
          description: "O novo curso foi publicado e já está disponível no catálogo.",
          className: "bg-emerald-650 text-white border-emerald-700"
        });
      }
      setTimeout(() => navigate('/professor/cursos'), 1200);
    } catch (err) {
      const error = err as Error;
      toast({
        variant: "destructive",
        title: "Erro ao salvar curso",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in-down pb-20 text-left">
      {/* Header Fixo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-800 font-display">Hemera Studio</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{id ? "Editar Curso" : "Criador de Cursos"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-indigo-200 text-indigo-600 font-bold" onClick={() => navigate('/professor/cursos')}>
              Cancelar
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Salvar e Publicar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navegação de Abas do Studio */}
        <div className="flex gap-2 p-1 bg-slate-200 rounded-xl max-w-sm mb-8">
          <button 
            onClick={() => setActiveTab('vitrine')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'vitrine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutTemplate className="w-4 h-4" /> Vitrine e Preço
          </button>
          <button 
            onClick={() => setActiveTab('conteudo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'conteudo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MonitorPlay className="w-4 h-4" /> Trilha de Módulos
          </button>
        </div>

        {/* ABA 1: VITRINE E MONETIZAÇÃO */}
        {activeTab === 'vitrine' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Informações Básicas</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Título do Curso</label>
                    <input 
                      type="text" 
                      value={cursoData.titulo}
                      onChange={e => setCursoData({...cursoData, titulo: e.target.value})}
                      placeholder="Ex: Redação Nota 1000 para o ENEM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                    <textarea 
                      value={cursoData.descricao}
                      onChange={e => setCursoData({...cursoData, descricao: e.target.value})}
                      placeholder="Sobre o que é este curso e o que o aluno vai aprender..."
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 resize-none font-medium text-slate-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                    <select 
                      value={cursoData.categoria}
                      onChange={e => setCursoData({...cursoData, categoria: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 font-medium text-slate-700"
                    >
                      <option value="Geral">Geral</option>
                      <option value="ENEM">Preparatório ENEM</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Idiomas">Idiomas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações Financeiras e Capa */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" /> Monetização
                </h2>
                
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                  <button 
                    onClick={() => setCursoData({...cursoData, isGratis: true, preco: 0})}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${cursoData.isGratis ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Curso Gratuito
                  </button>
                  <button 
                    onClick={() => setCursoData({...cursoData, isGratis: false})}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!cursoData.isGratis ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Curso Pago (Premium)
                  </button>
                </div>

                {!cursoData.isGratis && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Definir Preço (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input 
                        type="number" 
                        value={cursoData.preco}
                        onChange={e => setCursoData({...cursoData, preco: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-black text-slate-800 text-lg"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                      Esse valor será cobrado no catálogo. A Hemera retém uma taxa administrativa de 5% por venda.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Imagem de Capa</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 bg-slate-50 flex flex-col items-center justify-center text-slate-400 group">
                    <UploadCloud className="w-6 h-6 mb-1 text-slate-400" />
                    <span className="text-xs font-bold">Imagem de Capa Padrão</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1">URL da Imagem de Capa</label>
                    <input 
                      type="url"
                      value={imagemCapa}
                      onChange={e => setImagemCapa(e.target.value)}
                      placeholder="Cole o link da imagem..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CONSTRUTOR DE CONTEÚDO */}
        {activeTab === 'conteudo' && (
          <div className="max-w-4xl animate-fade-in text-left">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 font-display">Grade Curricular</h2>
                <p className="text-slate-500 text-sm">Organize as aulas e módulos do curso. Clique no ícone do tipo de aula para alternar seu formato.</p>
              </div>
              <Button onClick={addModulo} className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Novo Módulo
              </Button>
            </div>

            <div className="space-y-6">
              {modulos.map((mod, index) => (
                <div key={mod.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  
                  {/* Modulo Header */}
                  <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
                    <div className="p-1 text-slate-300">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-400 text-sm">Módulo {index + 1}:</span>
                    <input 
                      type="text" 
                      value={mod.titulo}
                      onChange={(e) => {
                        const newMods = [...modulos];
                        newMods[index].titulo = e.target.value;
                        setModulos(newMods);
                      }}
                      className="bg-transparent border-none font-bold text-slate-800 outline-none flex-1 focus:ring-2 focus:ring-indigo-500/20 rounded px-1"
                    />
                    <button 
                      onClick={() => removeModulo(mod.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      title="Excluir Módulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modulo Body (Aulas) */}
                  <div className="p-2">
                    {mod.aulas.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl m-2 bg-slate-50/50">
                        Nenhuma aula neste módulo ainda.
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {mod.aulas.map((aula, aIdx) => (
                          <div key={aula.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 hover:border-indigo-200 rounded-xl group transition-all">
                            <GripVertical className="w-4 h-4 text-slate-300" />
                            
                            {/* Tipo Icon - Ciclo interativo ao clicar */}
                            <button 
                              type="button"
                              onClick={() => {
                                const newMods = [...modulos];
                                const currentType = newMods[index].aulas[aIdx].tipo;
                                const nextType: 'video' | 'leitura' | 'quiz' = 
                                  currentType === 'video' ? 'leitura' :
                                  currentType === 'leitura' ? 'quiz' : 'video';
                                newMods[index].aulas[aIdx].tipo = nextType;
                                setModulos(newMods);
                              }}
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 hover:bg-indigo-100 transition-colors"
                              title="Clique para alternar tipo de aula (Vídeo / Texto / Questionário)"
                            >
                              {aula.tipo === 'video' ? <PlayCircle className="w-4 h-4" /> : 
                               aula.tipo === 'leitura' ? <FileText className="w-4 h-4" /> : 
                               <HelpCircle className="w-4 h-4" />}
                            </button>

                            <input 
                              type="text" 
                              value={aula.titulo}
                              onChange={(e) => {
                                const newMods = [...modulos];
                                newMods[index].aulas[aIdx].titulo = e.target.value;
                                setModulos(newMods);
                              }}
                              className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none flex-1 focus:bg-slate-50 rounded px-2 py-1"
                            />

                            {/* exigeEntrega Toggle */}
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={aula.exigeEntrega}
                                onChange={(e) => {
                                  const newMods = [...modulos];
                                  newMods[index].aulas[aIdx].exigeEntrega = e.target.checked;
                                  setModulos(newMods);
                                }}
                                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              />
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Exige Entrega</span>
                            </label>

                            <button 
                              onClick={() => removeAula(mod.id, aula.id)}
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                              title="Excluir Aula"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="px-4 pb-4 pt-2">
                      <Button onClick={() => addAula(mod.id)} variant="ghost" className="w-full border border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50">
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Aula
                      </Button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
