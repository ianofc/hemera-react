import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

  const addModulo = () => {
    setModulos([
      ...modulos, 
      { id: Date.now().toString(), titulo: "Novo Módulo", aulas: [] }
    ]);
  };

  const addAula = (moduloId: string) => {
    setModulos(modulos.map(m => {
      if (m.id === moduloId) {
        return {
          ...m,
          aulas: [...m.aulas, { id: Date.now().toString(), titulo: "Nova Aula", tipo: "video", exigeEntrega: false }]
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

  const handleSave = () => {
    toast({
      title: "Curso Salvo!",
      description: "O curso foi salvo no banco de dados e já está disponível no catálogo.",
      className: "bg-emerald-600 text-white border-emerald-700"
    });
    setTimeout(() => navigate('/professor/cursos'), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in-down pb-20">
      {/* Header Fixo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-800 font-display">Hemera Studio</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Criador de Cursos</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                    <textarea 
                      value={cursoData.descricao}
                      onChange={e => setCursoData({...cursoData, descricao: e.target.value})}
                      placeholder="Sobre o que é este curso e o que o aluno vai aprender..."
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none font-medium text-slate-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                    <select 
                      value={cursoData.categoria}
                      onChange={e => setCursoData({...cursoData, categoria: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium text-slate-700"
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-black text-slate-800 text-lg"
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
                <div className="border-2 border-dashed border-slate-200 rounded-xl h-32 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors cursor-pointer group">
                  <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Fazer Upload</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CONSTRUTOR DE CONTEÚDO */}
        {activeTab === 'conteudo' && (
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 font-display">Grade Curricular</h2>
                <p className="text-slate-500 text-sm">Arraste para organizar e construa a trilha que o aluno vai seguir.</p>
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
                    <div className="cursor-move p-1 text-slate-300 hover:text-slate-500 transition-colors">
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
                      className="bg-transparent border-none font-bold text-slate-800 outline-none flex-1 focus:ring-2 focus:ring-indigo-500/30 rounded px-1"
                    />
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
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
                            <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />
                            
                            {/* Tipo Icon */}
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                              {aula.tipo === 'video' ? <PlayCircle className="w-4 h-4" /> : 
                               aula.tipo === 'leitura' ? <FileText className="w-4 h-4" /> : 
                               <HelpCircle className="w-4 h-4" />}
                            </div>

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

                            {/* Moodle Toggle */}
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

                            <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors rounded hover:bg-indigo-50">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeAula(mod.id, aula.id)}
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded hover:bg-red-50"
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
