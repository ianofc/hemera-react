import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cursosService, Curso } from "@/services/cursosService";
import { Search, GraduationCap, PlayCircle, Star, Users, User, Clock, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CursosCatalogProps {
  basePath?: string;
  accent?: "primary" | "secondary" | "accent";
}

export default function CursosCatalog({ basePath = "/aluno/cursos", accent = "primary" }: CursosCatalogProps) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"explorar" | "meus">("explorar");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Cores dinâmicas baseadas no accent (Aluno=primary, Prof=secondary)
  const theme = {
    gradient: accent === 'primary' ? 'from-blue-600 to-indigo-600' : 'from-indigo-600 to-purple-600',
    text: accent === 'primary' ? 'text-blue-600' : 'text-indigo-600',
    bgBadge: accent === 'primary' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700',
    button: accent === 'primary' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700',
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const data = await cursosService.getCatalogo();
      setCursos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtros provisórios: No "Meus Cursos", simulamos que ele tem o 'c2'
  const filteredCursos = cursos.filter(c => {
    const matchesSearch = c.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.categoria.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "meus") {
      // Simula que ele só está matriculado no c2
      return matchesSearch && c.id === "c2"; 
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      
      {/* HEADER BANNER */}
      <div className={`relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl p-8 md:p-12 mb-10 min-h-[280px] flex flex-col justify-center`}>
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b ${theme.gradient} opacity-20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-300 uppercase border rounded-full bg-emerald-900/30 border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                <Award className="w-3 h-3" /> Certificados Oficiais
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display">
              Hemera <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Academy</span>
            </h1>
            <p className="text-lg text-slate-300 font-light max-w-xl">
              Desenvolva novas habilidades com cursos focados no seu futuro. Acesse conteúdos gratuitos ou Premium criados por especialistas.
            </p>
          </div>

          <div className="w-full md:w-[350px]">
            <div className="relative flex items-center h-14 bg-white/10 backdrop-blur-md rounded-2xl ring-1 ring-white/20 px-2 overflow-hidden focus-within:ring-white/50 focus-within:bg-white/20 transition-all">
              <Search className="w-5 h-5 text-slate-300 ml-3" />
              <input 
                type="text" 
                placeholder="Buscar cursos..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-400 px-3 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABS E AÇÕES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-4">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("explorar")}
            className={`pb-2 px-2 font-bold text-lg transition-all border-b-2 ${activeTab === "explorar" ? `border-slate-800 text-slate-800` : `border-transparent text-slate-400 hover:text-slate-600`}`}
          >
            Explorar Catálogo
          </button>
          <button 
            onClick={() => setActiveTab("meus")}
            className={`pb-2 px-2 font-bold text-lg transition-all border-b-2 ${activeTab === "meus" ? `border-slate-800 text-slate-800` : `border-transparent text-slate-400 hover:text-slate-600`}`}
          >
            Meus Cursos
          </button>
        </div>

        {accent === "secondary" && (
          <Button 
            onClick={() => navigate("/professor/cursos/novo")}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200"
          >
            <Award className="w-4 h-4 mr-2" /> Criar Novo Curso
          </Button>
        )}
      </div>

      {/* GRID DE CURSOS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-100 h-80 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : filteredCursos.length === 0 ? (
        <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Nenhum curso encontrado</h3>
          <p className="text-slate-500 mt-1">
            {activeTab === "meus" ? "Você ainda não está matriculado em nenhum curso." : "Tente buscar por outro termo."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCursos.map((curso) => (
            <div 
              key={curso.id} 
              onClick={() => navigate(`${basePath}/${curso.id}`)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={curso.imagemCapa} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {curso.categoria}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  {curso.isGratis ? (
                    <span className="px-3 py-1 bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-sm">
                      Grátis
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-900 text-white font-black text-xs rounded-full shadow-sm">
                      R$ {curso.preco?.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-white drop-shadow-md" />
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {curso.titulo}
                </h3>
                
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                  {curso.descricao}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  {curso.instrutorAvatar ? (
                    <img src={curso.instrutorAvatar} alt={curso.instrutor} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"><User className="w-3 h-3 text-slate-400" /></div>
                  )}
                  <span className="text-xs font-semibold text-slate-600">{curso.instrutor}</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" /> {curso.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {(curso.alunosInscritos / 1000).toFixed(1)}k
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {curso.cargaHoraria}h
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
