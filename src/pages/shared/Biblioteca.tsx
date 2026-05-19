import React, { useState, useEffect } from "react";
import { BookOpen, Search, Bookmark, Landmark, Globe, Atom, Book, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BookData {
  id: string;
  title: string;
  author: string;
  cover: string;
  link: string;
  isFree: boolean;
}

const CATEGORIES = [
  { id: 'classicos_br', label: 'Clássicos Brasileiros', icon: Book, queries: ['Machado de Assis Dom Casmurro', 'Vidas Secas Graciliano Ramos', 'Grande Sertão Veredas', 'A Hora da Estrela Clarice Lispector', 'O Cortiço Aluísio Azevedo'] },
  { id: 'canone_mundial', label: 'Cânone Mundial', icon: Globe, queries: ['Dom Quixote Cervantes', 'Crime e Castigo Dostoiévski', '1984 George Orwell', 'Cem Anos de Solidão', 'A Divina Comédia Dante'] },
  { id: 'poesia_br', label: 'Poesia & Modernismo', icon: Sparkles, queries: ['Carlos Drummond de Andrade poesia', 'Cecília Meireles', 'Castro Alves Espumas Flutuantes', 'Macunaíma Mário de Andrade'] },
  { id: 'didaticos', label: 'Apoio Didático', icon: Atom, queries: ['Matemática Ensino Médio', 'Física Mecânica', 'Química Tabela Periódica', 'Geografia do Brasil', 'Biologia Celular'] }
];

export default function Biblioteca() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState("classicos_br");
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    loadCategory(CATEGORIES[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadCategory = async (category: any) => {
    setCurrentCategory(category.id);
    setSearchQuery("");
    setStartIndex(0);
    setLoading(true);

    // Seleciona 4 termos aleatórios da categoria
    const shuffled = [...category.queries].sort(() => 0.5 - Math.random());
    const selectedTerms = shuffled.slice(0, 4);

    try {
      const promises = selectedTerms.map((term: string) =>
        fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&maxResults=6&langRestrict=pt&orderBy=relevance`)
          .then(res => res.json())
      );

      const results = await Promise.all(promises);
      let mixedBooks: BookData[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results.forEach((data: any) => {
        if (data.items) {
          mixedBooks = [...mixedBooks, ...data.items.map(normalizeBook)];
        }
      });

      // Remove duplicates
      mixedBooks = mixedBooks.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);
      // Shuffle
      setBooks(mixedBooks.sort(() => 0.5 - Math.random()));
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (append = false) => {
    if (!searchQuery && !append) return;
    
    if (!append) {
      setCurrentCategory("search");
      setStartIndex(0);
      setLoading(true);
    }

    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20&startIndex=${startIndex}&langRestrict=pt`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.items) {
        const newBooks = data.items.map(normalizeBook);
        setBooks(prev => append ? [...prev, ...newBooks] : newBooks);
      } else if (!append) {
        setBooks([]);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const newIndex = startIndex + 20;
    setStartIndex(newIndex);
    if (currentCategory === "search") {
      handleSearch(true);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeBook = (item: any): BookData => {
    const info = item.volumeInfo;
    const access = item.accessInfo;
    
    let cover = 'https://placehold.co/300x450/f1f5f9/94a3b8?text=Sem+Capa';
    if (info.imageLinks) {
      cover = (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail).replace('http:', 'https:');
    }

    const isFree = access.viewability !== 'NO_PAGES' && (item.saleInfo?.saleability === 'FREE' || access.accessViewStatus === 'FULL_PUBLIC_DOMAIN');

    return {
      id: item.id,
      title: info.title || 'Título Desconhecido',
      author: info.authors ? info.authors[0] : 'Autor Desconhecido',
      cover,
      link: access.webReaderLink || info.previewLink || info.infoLink,
      isFree
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      
      {/* HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl p-8 md:p-12 mb-12 min-h-[300px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-indigo-500/30 via-purple-500/20 to-pink-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex gap-2">
              <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-teal-300 uppercase border rounded-full bg-teal-900/30 border-teal-500/30 backdrop-blur-md">
                Obras do Cânone
              </span>
              <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-purple-300 uppercase border rounded-full bg-purple-900/30 border-purple-500/30 backdrop-blur-md">
                Domínio Público
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display">
              Biblioteca <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">Universal</span>
            </h1>
            <p className="text-lg text-slate-300 font-light">
              Explore o acervo essencial para sua formação, conectando-se a grandes obras, livros didáticos e acervos do governo.
            </p>
          </div>

          <div className="w-full md:w-[400px]">
            <div className="relative flex items-center h-14 bg-white/10 backdrop-blur-md rounded-2xl ring-1 ring-white/20 px-2 overflow-hidden focus-within:ring-white/50 focus-within:bg-white/20 transition-all">
              <Search className="w-5 h-5 text-indigo-300 ml-3" />
              <input 
                type="text" 
                placeholder="Ex: Dom Casmurro, Física..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent text-white placeholder-slate-400 px-3 outline-none"
              />
              <Button onClick={() => handleSearch()} className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="flex flex-wrap gap-3 mb-8">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button 
              key={cat.id}
              onClick={() => loadCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 
                ${currentCategory === cat.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200'}`}
            >
              <Icon className="w-4 h-4" /> {cat.label}
            </button>
          )
        })}
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-pulse">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : books.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            {books.map(book => (
              <div key={book.id} className="group cursor-pointer" onClick={() => window.open(book.link, '_blank')}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-[10px] font-bold text-white rounded backdrop-blur-md uppercase shadow-sm ${book.isFree ? 'bg-emerald-500/90' : 'bg-indigo-500/90'}`}>
                      {book.isFree ? 'Grátis' : 'Amostra'}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <span className="px-4 py-2 bg-white text-indigo-900 rounded-full font-bold text-xs shadow-lg flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Ler Agora
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors" title={book.title}>{book.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide truncate">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <Button variant="outline" onClick={loadMore} className="rounded-full px-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              Carregar Mais Livros
            </Button>
          </div>
        </>
      ) : (
        <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Nenhum livro encontrado</h3>
          <p className="text-slate-500 mt-1">Tente buscar por outro termo.</p>
        </div>
      )}

      {/* EXTERNAL LINKS */}
      <div className="mt-16 pt-12 border-t border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 font-display mb-2">Acervos Governamentais</h3>
        <p className="text-slate-500 mb-8">Links diretos para pesquisa profunda em fontes oficiais do governo e universidades.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="http://www.dominiopublico.gov.br/" target="_blank" rel="noreferrer" className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-md transition-all group">
            <Landmark className="w-8 h-8 text-emerald-600 mb-3" />
            <h4 className="font-bold text-slate-800">Domínio Público</h4>
            <p className="text-xs text-slate-600 mt-1">A maior biblioteca virtual do governo brasileiro.</p>
          </a>
          <a href="https://bndigital.bn.gov.br/" target="_blank" rel="noreferrer" className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-all group">
            <Landmark className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-bold text-slate-800">BNDigital</h4>
            <p className="text-xs text-slate-600 mt-1">Acervo da Biblioteca Nacional. Manuscritos e obras raras.</p>
          </a>
          <a href="https://scielo.org/" target="_blank" rel="noreferrer" className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 hover:shadow-md transition-all group">
            <Atom className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="font-bold text-slate-800">SciELO</h4>
            <p className="text-xs text-slate-600 mt-1">Periódicos e artigos científicos para pesquisa.</p>
          </a>
          <a href="https://www2.senado.leg.br/bdsf/" target="_blank" rel="noreferrer" className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-all group">
            <Book className="w-8 h-8 text-slate-600 mb-3" />
            <h4 className="font-bold text-slate-800">Biblioteca do Senado</h4>
            <p className="text-xs text-slate-600 mt-1">História política, leis e arquivos do Senado.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
