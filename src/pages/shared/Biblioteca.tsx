import React, { useState, useEffect } from "react";
import { BookOpen, Search, Bookmark, Landmark, Globe, Atom, Book, Loader2, Sparkles, AlertCircle, X, ChevronRight, Brain, Briefcase, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BookData {
  id: string;
  title: string;
  author: string;
  cover: string;
  description?: string;
  categories?: string[];
  pageCount?: number;
  isbn?: string;
  link: string;
  isFree: boolean;
  source: 'google' | 'gutenberg' | 'openlibrary' | 'archive' | 'dominiopublico' | 'openstax';
}

const CATEGORIES = [
  { id: 'todos', label: 'Todos os Livros', icon: BookOpen, query: '"Machado de Assis" OR "Dostoievski" OR "Shakespeare" OR "Fisica" OR "Calculo" OR "Kafka" OR "Orwell"' },
  { id: 'classicos_br', label: 'Clássicos Brasileiros', icon: Book, query: '"literatura brasileira" OR "romance brasileiro" OR "Machado de Assis" OR "Aluisio Azevedo" OR "Jose de Alencar" OR "Lima Barreto"' },
  { id: 'canone_mundial', label: 'Cânone Mundial', icon: Globe, query: '"classic literature" OR "Dostoievski" OR "Shakespeare" OR "Tolstoy" OR "Austen" OR "Homer" OR "Dante"' },
  { id: 'didaticos', label: 'Didáticos & Apoio', icon: Landmark, query: '"calculo" OR "physics" OR "chemistry" OR "biologia" OR "algebra" OR "didatico" OR "textbook"' },
  { id: 'ciencia_tecnologia', label: 'Ciência & Tecnologia', icon: Atom, query: '"science" OR "astronomia" OR "computacao" OR "inteligencia artificial" OR "physics" OR "cosmos"' },
  { id: 'filosofia_psico', label: 'Filosofia & Mente', icon: Brain, query: '"filosofia" OR "psicologia" OR "Nietzsche" OR "Platao" OR "Aristoteles" OR "Freud" OR "Jung"' }
];

// Curadorias Locais Estáveis em HTTPS para fusão e fallbacks
const DOMINIO_PUBLICO_BOOKS: BookData[] = [
  {
    id: "dp_dom_casmurro",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
    description: "Um dos maiores clássicos da literatura brasileira. A narrativa em primeira pessoa de Bento Santiago sobre sua relação com Capitu e suas eternas dúvidas de traição.",
    categories: ["Literatura Brasileira", "Realismo"],
    pageCount: 256,
    link: "https://www.dominiopublico.gov.br/download/texto/ua000194.pdf",
    isFree: true,
    source: "dominiopublico"
  },
  {
    id: "dp_memorias_postumas",
    title: "Memórias Póstumas de Brás Cubas",
    author: "Machado de Assis",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
    description: "Um defunto autor relata suas experiências terrenas com ironia mordaz e crítica social contundente, inaugurando o Realismo no Brasil.",
    categories: ["Literatura Brasileira", "Realismo"],
    pageCount: 224,
    link: "https://www.dominiopublico.gov.br/download/texto/ua000051.pdf",
    isFree: true,
    source: "dominiopublico"
  },
  {
    id: "dp_o_cortico",
    title: "O Cortiço",
    author: "Aluísio Azevedo",
    cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
    description: "Obra máxima do Naturalismo brasileiro. Descreve a vida dos moradores de uma habitação coletiva no Rio de Janeiro e a influência direta do meio físico e biológico no comportamento humano.",
    categories: ["Literatura Brasileira", "Naturalismo"],
    pageCount: 320,
    link: "https://www.dominiopublico.gov.br/download/texto/ua000002.pdf",
    isFree: true,
    source: "dominiopublico"
  },
  {
    id: "dp_quincas_borba",
    title: "Quincas Borba",
    author: "Machado de Assis",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80",
    description: "A história do ingênuo professor Rubião, que herda a grande fortuna do filósofo demente Quincas Borba e se muda para o Rio de Janeiro, sendo consumido pelas intrigas cariocas.",
    categories: ["Literatura Brasileira", "Realismo"],
    pageCount: 280,
    link: "https://www.dominiopublico.gov.br/download/texto/ua000208.pdf",
    isFree: true,
    source: "dominiopublico"
  },
  {
    id: "dp_triste_fim",
    title: "Triste Fim de Policarpo Quaresma",
    author: "Lima Barreto",
    cover: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80",
    description: "A comovente história do patriota idealista Policarpo Quaresma, que propõe a oficialização da língua tupi-guarani e luta bravamente pela reforma agrária.",
    categories: ["Literatura Brasileira", "Pré-Modernismo"],
    pageCount: 240,
    link: "https://www.dominiopublico.gov.br/download/texto/ua000109.pdf",
    isFree: true,
    source: "dominiopublico"
  },
  {
    id: "dp_iracema",
    title: "Iracema",
    author: "José de Alencar",
    cover: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80",
    description: "Lenda indianista sobre o amor impossível entre a virgem dos lábios de mel Iracema e o guerreiro branco Martim, colonizador português do Ceará.",
    categories: ["Literatura Brasileira", "Romantismo"],
    pageCount: 160,
    link: "https://www.dominiopublico.gov.br/download/texto/ua000185.pdf",
    isFree: true,
    source: "dominiopublico"
  },
  {
    id: "dp_o_ateneu",
    title: "O Ateneu",
    author: "Raul Pompéia",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
    description: "Um clássico impressionista sobre a vida no colégio interno Ateneu sob o comando do aristocrático diretor Aristarco. Crítica aos costumes burgueses.",
    categories: ["Literatura Brasileira", "Impressionismo"],
    pageCount: 192,
    link: "https://www.dominiopublico.gov.br/download/texto/ua000216.pdf",
    isFree: true,
    source: "dominiopublico"
  },
  {
    id: "dp_marilia_dirceu",
    title: "Marília de Dirceu",
    author: "Tomás Antônio Gonzaga",
    cover: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80",
    description: "Liras árcades do pastor Dirceu destinadas a sua amada Marília. O maior documento poético da Inconfidência Mineira e do Arcadismo nacional.",
    categories: ["Literatura Brasileira", "Arcadismo"],
    pageCount: 128,
    link: "https://www.dominiopublico.gov.br/download/texto/ua000171.pdf",
    isFree: true,
    source: "dominiopublico"
  }
];

const OPENSTAX_BOOKS: BookData[] = [
  {
    id: "os_calculo_v1",
    title: "Calculus Volume 1",
    author: "Gilbert Strang & Edwin Herman",
    cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80",
    description: "Cálculo diferencial e integral para exatas e engenharias. Explora limites, derivadas, integrais e aplicações essenciais.",
    categories: ["Matemática", "Cálculo", "Didático"],
    pageCount: 800,
    link: "https://openstax.org/details/books/calculus-volume-1",
    isFree: true,
    source: "openstax"
  },
  {
    id: "os_fisica_u_v1",
    title: "University Physics Volume 1",
    author: "Samuel J. Ling, Jeff Sanny, William Moebs",
    cover: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=400&q=80",
    description: "Física Universitária Vol 1. Foco em mecânica geral, forças, ondas, acústica e movimento retilíneo.",
    categories: ["Física", "Exatas", "Didático"],
    pageCount: 950,
    link: "https://openstax.org/details/books/university-physics-volume-1",
    isFree: true,
    source: "openstax"
  },
  {
    id: "os_fisica_u_v2",
    title: "University Physics Volume 2",
    author: "Samuel J. Ling, Jeff Sanny, William Moebs",
    cover: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80",
    description: "Física Universitária Vol 2. Teorias de termodinâmica, eletricidade, magnetismo e campos elétricos.",
    categories: ["Física", "Exatas", "Didático"],
    pageCount: 880,
    link: "https://openstax.org/details/books/university-physics-volume-2",
    isFree: true,
    source: "openstax"
  },
  {
    id: "os_quimica_g",
    title: "Chemistry 2e",
    author: "Paul Flowers, Klaus Theopold, Richard Langley",
    cover: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=400&q=80",
    description: "Química geral. Explora a teoria de átomos, moléculas, reações estequiométricas, ligações químicas e termoquímica.",
    categories: ["Química", "Exatas", "Didático"],
    pageCount: 1300,
    link: "https://openstax.org/details/books/chemistry-2e",
    isFree: true,
    source: "openstax"
  },
  {
    id: "os_biologia",
    title: "Biology 2e",
    author: "Mary Ann Clark, Matthew Douglas, Jung Choi",
    cover: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=400&q=80",
    description: "Didático completo sobre células, evolução de organismos vivos, DNA, genética evolutiva e reinos vegetais.",
    categories: ["Biologia", "Ciências", "Didático"],
    pageCount: 1500,
    link: "https://openstax.org/details/books/biology-2e",
    isFree: true,
    source: "openstax"
  },
  {
    id: "os_psicologia",
    title: "Psychology 2e",
    author: "Rose M. Spielman, William J. Jenkins, Marilyn D. Lovett",
    cover: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80",
    description: "Uma introdução científica aos estudos da psicologia, abrangendo comportamento, neurobiologia, cognição e distúrbios clínicos.",
    categories: ["Psicologia", "Humanas", "Didático"],
    pageCount: 750,
    link: "https://openstax.org/details/books/psychology-2e",
    isFree: true,
    source: "openstax"
  },
  {
    id: "os_sociologia",
    title: "Introduction to Sociology 3e",
    author: "Tonja R. Conerly, Kathleen Holmes, Asha Lal Tamang",
    cover: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
    description: "Visão científica sobre dinâmicas da sociedade moderna, cultura, desigualdade social e movimentos de mudança global.",
    categories: ["Sociologia", "Humanas", "Didático"],
    pageCount: 520,
    link: "https://openstax.org/details/books/introduction-sociology-3e",
    isFree: true,
    source: "openstax"
  },
  {
    id: "os_algebra_trig",
    title: "Algebra and Trigonometry 2e",
    author: "Jay Abramson",
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
    description: "Didático elementar sobre equações polinomiais, trigonometria, funções exponenciais e gráficos para estudantes.",
    categories: ["Matemática", "Didático"],
    pageCount: 1200,
    link: "https://openstax.org/details/books/algebra-and-trigonometry-2e",
    isFree: true,
    source: "openstax"
  }
];

// ────────────────────────────────────────────────────────────────
// CORE API FETCHERS (BUSCA DINÂMICA COMPLETA)
// ────────────────────────────────────────────────────────────────

async function fetchGoogleBooks(query: string): Promise<BookData[]> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items) return [];

    return data.items
      .filter((item: any) => {
        const access = item.accessInfo || {};
        const isEmbeddable = access.embeddable === true;
        const isFull = access.viewability === "ALL_PAGES" || access.accessViewStatus === "FULL_PUBLIC_DOMAIN";
        const isNotSnippet = access.accessViewStatus !== "SAMPLE" && access.accessViewStatus !== "NONE";
        return isEmbeddable && isFull && isNotSnippet;
      })
      .map((item: any) => {
        const info = item.volumeInfo || {};
        let isbn = "";
        if (info.industryIdentifiers) {
          const isbn13 = info.industryIdentifiers.find((id: any) => id.type === "ISBN_13");
          const isbn10 = info.industryIdentifiers.find((id: any) => id.type === "ISBN_10");
          isbn = isbn13 ? isbn13.identifier : (isbn10 ? isbn10.identifier : "");
        }

        let cover = "";
        if (info.imageLinks) {
          cover = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || "";
          if (cover) cover = cover.replace("http:", "https:");
        }
        if (!cover && isbn) {
          cover = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        }

        return {
          id: item.id,
          title: info.title,
          author: info.authors ? info.authors.join(", ") : "Autor Desconhecido",
          cover,
          description: info.description || "Sem sinopse disponível.",
          categories: info.categories || ["Geral"],
          pageCount: info.pageCount || 0,
          isbn,
          link: `https://books.google.com/books?id=${item.id}`,
          isFree: true,
          source: 'google'
        };
      });
  } catch (e) {
    console.error("Google Books fetch failed:", e);
    return [];
  }
}

async function fetchGutendex(query: string): Promise<BookData[]> {
  try {
    const res = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any) => {
      let author = "Autor Desconhecido";
      if (item.authors && item.authors.length > 0) {
        const rawName = item.authors[0].name;
        if (rawName.includes(",")) {
          const parts = rawName.split(",");
          author = `${parts[1].trim()} ${parts[0].trim()}`;
        } else {
          author = rawName;
        }
      }

      const formats = item.formats || {};
      let cover = formats["image/jpeg"] || "";
      if (cover) cover = cover.replace("http:", "https:");

      const link = formats["text/html"] || formats["text/plain; charset=utf-8"] || formats["application/epub+zip"] || `https://www.gutenberg.org/ebooks/${item.id}`;

      return {
        id: `gut_${item.id}`,
        title: item.title,
        author,
        cover,
        description: `Obra clássica do Gutenberg. Downloads: ${item.download_count}`,
        categories: item.bookshelves?.length ? item.bookshelves : (item.subjects?.length ? item.subjects : ["Clássico"]),
        pageCount: 0,
        link,
        isFree: true,
        source: 'gutenberg'
      };
    });
  } catch (e) {
    console.error("Gutendex fetch failed:", e);
    return [];
  }
}

async function fetchOpenLibrary(query: string): Promise<BookData[]> {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=key,title,author_name,cover_i,cover_edition_key,isbn,ia,availability&limit=40`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.docs) return [];

    return data.docs
      .filter((item: any) => {
        const avail = item.availability || {};
        const hasIA = item.ia && item.ia.length > 0;
        const isFreeOpen = avail.status === "open" || avail.is_readable === true || (!avail.is_restricted && hasIA);
        const isBorrowOnly = avail.status === "borrow_available" || avail.status === "borrow_unavailable" || avail.status === "private" || avail.is_restricted === true;
        return hasIA && isFreeOpen && !isBorrowOnly;
      })
      .map((item: any) => {
        let cover = "";
        if (item.cover_i) {
          cover = `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`;
        } else if (item.cover_edition_key) {
          cover = `https://covers.openlibrary.org/b/olid/${item.cover_edition_key}-L.jpg`;
        } else if (item.isbn && item.isbn.length > 0) {
          cover = `https://covers.openlibrary.org/b/isbn/${item.isbn[0]}-L.jpg`;
        }

        const avail = item.availability || {};
        const iaKey = avail.identifier || (item.ia && item.ia.length > 0 ? item.ia[0] : "");
        const link = iaKey 
          ? `https://archive.org/embed/${iaKey}`
          : `https://openlibrary.org${item.key}`;

        return {
          id: `ol_${item.key.replace("/works/", "")}`,
          title: item.title,
          author: item.author_name ? item.author_name[0] : "Autor Desconhecido",
          cover,
          description: "Edição digital gratuita fornecida pela Biblioteca Aberta (Open Library).",
          categories: item.subject || ["Geral"],
          pageCount: 0,
          link,
          isFree: true,
          source: 'openlibrary',
          isbn: item.isbn ? item.isbn[0] : undefined
        };
      });
  } catch (e) {
    console.error("OpenLibrary fetch failed:", e);
    return [];
  }
}

async function fetchInternetArchive(query: string): Promise<BookData[]> {
  try {
    const formattedQuery = `mediatype:texts AND (language:por OR language:portuguese) AND -access:restricted AND -collection:inlibrary AND -collection:printdisabled AND -collection:lendinglibrary AND -collection:borrowonly AND -collection:booksbylanguage AND (${query})`;
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(formattedQuery)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=downloads&fl[]=description&fl[]=format&output=json&rows=40`;
    
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.response || !data.response.docs) return [];

    return data.response.docs
      .filter((doc: any) => {
        if (doc.identifier && /0000[a-z]/.test(doc.identifier)) return false;
        
        const formats = doc.format || [];
        const formatsLower = formats.map((f: any) => String(f).toLowerCase());
        const hasEncrypted = formatsLower.some((f: string) => f.includes('encrypted') || f.includes('lcp'));
        const hasFreeReader = formatsLower.some((f: string) => 
          f.includes('pdf') || f.includes('epub') || f.includes('text') || f.includes('html') || f.includes('kindle') || f.includes('mobi')
        );
        return !(hasEncrypted && !hasFreeReader);
      })
      .map((doc: any) => {
        const id = `ia_${doc.identifier}`;
        const title = doc.title || "Obra de Arquivo";
        let author = doc.creator || "Autor Desconhecido";
        if (Array.isArray(author)) author = author[0];

        const cover = `https://archive.org/services/img/${doc.identifier}`;
        const link = `https://archive.org/embed/${doc.identifier}`;

        return {
          id,
          title,
          author,
          cover,
          description: doc.description || "Sem descrição disponível.",
          categories: ["Arquivo"],
          pageCount: 0,
          link,
          isFree: true,
          source: 'archive'
        };
      });
  } catch (e) {
    console.error("Internet Archive fetch failed:", e);
    return [];
  }
}

// Open Library Read Link dynamic check
async function checkOpenLibraryRead(book: BookData): Promise<string | null> {
  if (book.isbn) {
    try {
      const res = await fetch(`https://openlibrary.org/api/volumes/brief/isbn/${book.isbn}.json`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const readableItem = data.items.find((item: any) => 
            item.status === "open" || item.status === "readable" || item.preview === "preview"
          );
          if (readableItem) {
            const iaKey = readableItem.identifier;
            if (iaKey) return `https://archive.org/embed/${iaKey}`;
            const olEditionId = readableItem["ol-edition-id"] || readableItem["ol-work-id"];
            if (olEditionId) return `https://openlibrary.org/books/${olEditionId}`;
          }
        }
        if (data.records) {
          for (const key in data.records) {
            const rec = data.records[key];
            if (rec.data && rec.data.ebooks && rec.data.ebooks.length > 0) {
              const ebook = rec.data.ebooks.find((e: any) => e.availability === "open" || e.preview_url);
              if (ebook && ebook.preview_url) {
                let link = ebook.preview_url;
                if (link.includes("archive.org/details/")) {
                  link = link.replace("archive.org/details/", "archive.org/embed/");
                }
                return link;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Open Library ISBN check failed:", e);
    }
  }

  try {
    const q = `title:"${book.title}" AND author:"${book.author}"`;
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=key,title,author_name,isbn,ia,availability&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.docs && data.docs.length > 0) {
        const doc = data.docs[0];
        const avail = doc.availability || {};
        const hasIA = doc.ia && doc.ia.length > 0;
        const isFreeOpen = avail.status === "open" || avail.is_readable === true || (!avail.is_restricted && hasIA);
        const isBorrowOnly = avail.status === "borrow_available" || avail.status === "borrow_unavailable" || avail.status === "private" || avail.is_restricted === true;

        if (hasIA && isFreeOpen && !isBorrowOnly) {
          return `https://archive.org/embed/${avail.identifier || doc.ia[0]}`;
        }
      }
    }
  } catch (e) {
    console.warn("Open Library search query check failed:", e);
  }

  return null;
}

// ────────────────────────────────────────────────────────────────
// AUXILIAR: Lombadas e Capas 3D
// ────────────────────────────────────────────────────────────────

function BookCover({ book }: { book: BookData }) {
  const [hasError, setHasError] = useState(false);

  const getGradient = (text: string) => {
    const gradients = [
      "from-rose-600 to-rose-950",
      "from-blue-600 to-indigo-950",
      "from-emerald-600 to-teal-950",
      "from-amber-600 to-orange-950",
      "from-purple-600 to-violet-950",
      "from-fuchsia-600 to-pink-950",
      "from-cyan-600 to-slate-900",
      "from-violet-600 to-purple-950"
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const spineOverlay = (
    <>
      <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10" />
      <div className="absolute top-0 left-[3px] bottom-0 w-[1px] bg-white/15 z-10" />
      <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-l from-black/10 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10" />
    </>
  );

  if (book.cover && !hasError) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-slate-900 shadow-md">
        {spineOverlay}
        <img 
          src={book.cover} 
          alt={book.title} 
          onError={() => setHasError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
      </div>
    );
  }

  const gradientClass = getGradient(book.title);

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex flex-col justify-between p-5 text-white relative shadow-inner select-none overflow-hidden`}>
      {spineOverlay}
      <div className="pl-3 pt-3 text-left relative z-20">
        <span className="text-[7.5px] uppercase tracking-widest font-black bg-white/15 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
          {book.source === 'google' ? 'Google Books' : book.source === 'openstax' ? 'OpenStax' : book.source === 'gutenberg' ? 'Gutenberg' : book.source === 'openlibrary' ? 'Open Library' : book.source === 'archive' ? 'Archive' : 'MEC'}
        </span>
        <h3 className="font-extrabold text-sm mt-4 leading-snug line-clamp-4 font-serif text-shadow-md tracking-tight">{book.title}</h3>
      </div>
      <div className="pl-3 pb-3 text-left relative z-20">
        <p className="text-[9px] font-black tracking-wider border-t border-white/15 pt-2.5 opacity-90 truncate font-sans uppercase">{book.author}</p>
      </div>
    </div>
  );
}

const getSourceBadge = (source: string) => {
  switch (source) {
    case 'google':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
          Google Books
        </span>
      );
    case 'gutenberg':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
          Gutenberg
        </span>
      );
    case 'openlibrary':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-md">
          Open Library
        </span>
      );
    case 'archive':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
          Archive
        </span>
      );
    case 'openstax':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-400/30 backdrop-blur-md">
          OpenStax
        </span>
      );
    case 'dominiopublico':
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30 backdrop-blur-md">
          Domínio Público
        </span>
      );
  }
};

// ────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────────────────────────

export default function Biblioteca() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState("todos");
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(24);

  // States do Modal Leitor
  const [readingBook, setReadingBook] = useState<BookData | null>(null);
  const [readingLink, setReadingLink] = useState<string | null>(null);
  const [checkingReadLink, setCheckingReadLink] = useState(false);
  const [readingTheme, setReadingTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Reservas persistidas no localStorage
  const [reservations, setReservations] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("hemera_biblioteca");
    return saved ? JSON.parse(saved) : {};
  });

  const toggleReservation = (bookId: string) => {
    const isReserved = !!reservations[bookId];
    const nextReservations = { ...reservations, [bookId]: !isReserved };
    setReservations(nextReservations);
    localStorage.setItem("hemera_biblioteca", JSON.stringify(nextReservations));
    
    if (!isReserved) {
      toast({
        title: "Reserva realizada!",
        description: "Retire o livro na biblioteca em até 48h.",
      });
    } else {
      toast({
        title: "Reserva cancelada!",
        description: "A devolução/cancelamento foi registrado com sucesso.",
      });
    }
  };

  const fetchUnifiedAcervo = async (queryTerm: string, isSearchMode = false) => {
    setLoading(true);
    if (!isSearchMode) setDisplayLimit(24);

    try {
      const googlePromise = fetchGoogleBooks(queryTerm);
      const gutenbergPromise = fetchGutendex(queryTerm);
      const openLibraryPromise = fetchOpenLibrary(queryTerm);
      const archivePromise = fetchInternetArchive(queryTerm);

      const results = await Promise.allSettled([
        googlePromise,
        gutenbergPromise,
        openLibraryPromise,
        archivePromise
      ]);

      let mergedList: BookData[] = [];

      results.forEach(res => {
        if (res.status === "fulfilled" && res.value) {
          mergedList = [...mergedList, ...res.value];
        }
      });

      // Fusão e fallbacks das listas locais
      if (!isSearchMode) {
        if (currentCategory === 'todos' || currentCategory === 'classicos_br') {
          mergedList = [...DOMINIO_PUBLICO_BOOKS, ...mergedList];
        }
        if (currentCategory === 'todos' || currentCategory === 'didaticos') {
          mergedList = [...OPENSTAX_BOOKS, ...mergedList];
        }
      } else {
        // Filtrar curadorias locais também na busca
        const filteredDP = DOMINIO_PUBLICO_BOOKS.filter(b => 
          b.title.toLowerCase().includes(queryTerm.toLowerCase()) || b.author.toLowerCase().includes(queryTerm.toLowerCase())
        );
        const filteredOS = OPENSTAX_BOOKS.filter(b => 
          b.title.toLowerCase().includes(queryTerm.toLowerCase()) || b.author.toLowerCase().includes(queryTerm.toLowerCase())
        );
        mergedList = [...filteredDP, ...filteredOS, ...mergedList];
      }

      // Algoritmo de Desduplicação inteligente por Título e Autor Normalizados
      const finalUniqueBooks: BookData[] = [];
      const seenTitles = new Set<string>();
      const seenIsbns = new Set<string>();

      mergedList.forEach(b => {
        const titleAuthorKey = `${b.title.toLowerCase().trim()}_${b.author.toLowerCase().trim()}`;
        const isbnKey = b.isbn ? b.isbn.toLowerCase().trim() : null;

        if (seenTitles.has(titleAuthorKey) || (isbnKey && seenIsbns.has(isbnKey))) {
          const idx = finalUniqueBooks.findIndex(fb => {
            const fbTitleAuthor = `${fb.title.toLowerCase().trim()}_${fb.author.toLowerCase().trim()}`;
            const fbIsbn = fb.isbn ? fb.isbn.toLowerCase().trim() : null;
            return fbTitleAuthor === titleAuthorKey || (isbnKey && fbIsbn === isbnKey);
          });
          if (idx !== -1) {
            // Se já existe e a versão duplicada é um PDF livre ou HTML, prefira ela
            if (!finalUniqueBooks[idx].cover && b.cover) {
              finalUniqueBooks[idx].cover = b.cover;
            }
            if (b.source !== 'google' && finalUniqueBooks[idx].source === 'google') {
              finalUniqueBooks[idx].link = b.link;
              finalUniqueBooks[idx].source = b.source;
            }
          }
          return;
        }

        seenTitles.add(titleAuthorKey);
        if (isbnKey) seenIsbns.add(isbnKey);
        finalUniqueBooks.push(b);
      });

      // Ordenar por relevância de fontes nativas livres
      finalUniqueBooks.sort((a, b) => {
        const sourceWeights: Record<string, number> = { dominiopublico: 0, openstax: 1, gutenberg: 2, openlibrary: 3, archive: 4, google: 5 };
        return (sourceWeights[a.source] ?? 9) - (sourceWeights[b.source] ?? 9);
      });

      setBooks(finalUniqueBooks);
    } catch (e) {
      console.error("Unified fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadCategory = (catId: string) => {
    setCurrentCategory(catId);
    setSearchQuery("");
  };

  // Carrega ao alternar categoria
  useEffect(() => {
    const cat = CATEGORIES.find(c => c.id === currentCategory) || CATEGORIES[0];
    fetchUnifiedAcervo(cat.query, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory]);

  const handleSearch = () => {
    if (!searchQuery) {
      const cat = CATEGORIES.find(c => c.id === currentCategory) || CATEGORIES[0];
      fetchUnifiedAcervo(cat.query, false);
      return;
    }
    fetchUnifiedAcervo(searchQuery, true);
  };

  const handleOpenBook = async (book: BookData) => {
    setReadingBook(book);
    setReadingLink(null);
    setIsFullScreen(false);

    if (book.source !== 'google') {
      setReadingLink(book.link);
      return;
    }

    setCheckingReadLink(true);
    toast({
      title: "Buscando Leitura Completa",
      description: `Verificando versão integral de "${book.title}" nas bibliotecas digitais públicas.`
    });

    const readUrl = await checkOpenLibraryRead(book);
    setCheckingReadLink(false);

    if (readUrl) {
      setReadingLink(readUrl);
      toast({
        title: "Leitor Carregado",
        description: `Obra livre carregada com sucesso do acervo.`
      });
    } else {
      setReadingLink(book.link);
      toast({
        title: "Ficha Bibliográfica",
        description: `Carregando dados informativos da obra.`,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      
      {/* BANNER PRINCIPAL */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl p-8 md:p-12 mb-12 min-h-[280px] flex flex-col justify-center text-left">
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-b from-indigo-500/25 via-purple-500/15 to-pink-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex gap-2">
              <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-teal-300 uppercase border rounded-full bg-teal-900/30 border-teal-500/30 backdrop-blur-md">
                Pesquisa Unificada
              </span>
              <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-purple-300 uppercase border rounded-full bg-purple-900/30 border-purple-500/30 backdrop-blur-md">
                Acervo Integrado
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display">
              Biblioteca <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">Digital</span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 font-light max-w-xl leading-relaxed">
              Explore dezenas de milhares de obras didáticas, científicas e clássicas do domínio público mundial sem divisões por provedores.
            </p>
          </div>

          <div className="w-full md:w-[400px]">
            <div className="relative flex items-center h-14 bg-white/10 backdrop-blur-md rounded-2xl ring-1 ring-white/20 px-2 overflow-hidden focus-within:ring-white/50 focus-within:bg-white/20 transition-all">
              <Search className="w-5 h-5 text-indigo-300 ml-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Busque por título, autor, assunto ou didáticos..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent text-white placeholder-slate-400 px-3 outline-none text-sm"
              />
              <Button onClick={handleSearch} className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shrink-0">
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIAS ACADÊMICAS */}
      <div className="flex flex-wrap gap-3 mb-10 border-b border-slate-200/80 pb-6 text-left">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button 
              key={cat.id}
              onClick={() => loadCategory(cat.id)}
              className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border
                ${currentCategory === cat.id 
                  ? 'bg-indigo-600 text-white shadow-lg border-indigo-600' 
                  : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200'}`}
            >
              <Icon className="w-4 h-4" /> {cat.label}
            </button>
          )
        })}
      </div>

      {/* GRID DE LIVROS */}
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12 animate-fade-in">
            {books.slice(0, displayLimit).map(book => (
              <div key={book.id} className="group cursor-pointer flex flex-col justify-between" onClick={() => handleOpenBook(book)}>
                <div className="relative aspect-[2/3] rounded-r-xl rounded-l-md overflow-hidden shadow-[4px_8px_16px_rgba(0,0,0,0.18)] group-hover:shadow-[12px_20px_32px_rgba(0,0,0,0.35)] group-hover:-translate-y-3 group-hover:scale-[1.03] group-hover:rotate-[0.5deg] transition-all duration-500 ease-out z-20">
                  <BookCover book={book} />
                  
                  <div className="absolute top-2.5 right-2.5 z-35">
                    {getSourceBadge(book.source)}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6 z-30">
                    <span className="px-4 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-xs shadow-xl flex items-center gap-2 border border-indigo-400/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <BookOpen className="w-3.5 h-3.5" /> Acessar Livro
                    </span>
                  </div>
                </div>
                
                {/* Prateleira horizontal base */}
                <div className="relative h-1.5 w-[106%] -left-[3%] bg-gradient-to-b from-slate-200/50 via-slate-300/30 to-slate-400/10 border-t border-white/40 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.06)] mt-2 hidden md:block" />

                <div className="mt-3 text-left">
                  <div className="flex justify-between items-start gap-1.5">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors font-display" title={book.title}>{book.title}</h3>
                    {reservations[book.id] && (
                      <span className="shrink-0 bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-200">Reservado</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide truncate font-semibold">{book.author}</p>
                </div>
              </div>
            ))}
          </div>

          {books.length > displayLimit && (
            <div className="mt-16 flex justify-center">
              <Button onClick={() => setDisplayLimit(prev => prev + 24)} className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-md transition-all font-bold">
                Carregar Mais Livros
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Nenhum livro listado</h3>
          <p className="text-slate-500 mt-1">Tente buscar por termos diferentes nas categorias.</p>
        </div>
      )}

      {/* DETALHES E LEITOR MODAL */}
      {readingBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-350 ${
            isFullScreen ? 'max-w-full max-h-screen rounded-none p-0' : 'max-w-6xl max-h-[90vh]'
          } ${
            readingTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 
            readingTheme === 'sepia' ? 'bg-[#F4ECD8] text-[#5C4033]' : 'bg-white text-slate-850'
          }`}>
            
            {/* Cabeçalho */}
            <header className="p-4 border-b border-slate-800/20 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-slate-950 text-white z-50 shadow-md">
              <div className="text-left max-w-xs md:max-w-lg">
                <h2 className="font-extrabold text-sm leading-tight flex items-center gap-2 truncate" title={readingBook.title}>
                  <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" /> {readingBook.title}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{readingBook.author}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                {/* Abrir em Nova Aba */}
                <a 
                  href={readingBook.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Globe className="w-4 h-4" /> Abrir em Nova Aba
                </a>

                {/* Reservar/Devolver */}
                <button 
                  onClick={() => toggleReservation(readingBook.id)}
                  className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm text-white ${
                    reservations[readingBook.id] 
                      ? "bg-rose-600 hover:bg-rose-500" 
                      : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  <Bookmark className="w-4 h-4" /> {reservations[readingBook.id] ? "Devolver Reserva" : "Reservar Livro"}
                </button>

                {/* Tela Cheia */}
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1"
                  title={isFullScreen ? "Minimizar" : "Tela Cheia"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Temas */}
                <div className="flex gap-1.5 border-l border-slate-800 pl-3">
                  <button 
                    onClick={() => setReadingTheme('light')} 
                    className={`w-5 h-5 rounded-full bg-white border border-slate-400 shadow-xs`} 
                    title="Tema Claro"
                  />
                  <button 
                    onClick={() => setReadingTheme('sepia')} 
                    className={`w-5 h-5 rounded-full bg-[#F4ECD8] border border-[#E4DCB8] shadow-xs`} 
                    title="Tema Sépia"
                  />
                  <button 
                    onClick={() => setReadingTheme('dark')} 
                    className={`w-5 h-5 rounded-full bg-slate-900 border border-slate-850 shadow-xs`} 
                    title="Tema Escuro"
                  />
                </div>

                <button 
                  onClick={() => {
                    setReadingBook(null);
                    setReadingLink(null);
                    setIsFullScreen(false);
                  }}
                  className="ml-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <X className="w-4 h-4" /> Fechar
                </button>
              </div>
            </header>

            {/* Painel Central */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-900">
              
              {checkingReadLink ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                  <p className="text-sm font-semibold tracking-wide text-slate-300">
                    Buscando link de leitura livre da biblioteca digital...
                  </p>
                </div>
              ) : readingLink && (readingBook.source !== 'google' || readingLink.includes('archive.org') || readingLink.includes('openlibrary')) ? (
                <>
                  {/* Banner amigável */}
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center gap-3 text-xs text-amber-300 font-medium z-45 shrink-0 text-left">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                    <p className="leading-snug">
                      Dica do Acervo: Se o leitor abaixo não exibir a barra de rolagem completa ou bloquear a conexão, clique em <strong className="text-white">Abrir em Nova Aba</strong> para ler diretamente na fonte digital.
                    </p>
                  </div>

                  <div className="flex-1 p-4 overflow-hidden relative">
                    <iframe 
                      src={readingLink.toLowerCase().endsWith('.pdf') || readingLink.toLowerCase().includes('.pdf') || readingLink.toLowerCase().includes('dominio%20publico') || readingLink.toLowerCase().includes('dominiopublico')
                        ? `https://docs.google.com/gview?url=${encodeURIComponent(readingLink)}&embedded=true` 
                        : readingLink
                      } 
                      className="w-full h-full rounded-2xl bg-white border border-slate-800 shadow-inner overflow-auto scroll-auto" 
                      title={readingBook.title}
                      scrolling="yes"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                    />
                  </div>
                </>
              ) : (
                /* Detalhes de Ficha Bibliográfica / Fallback de Sinopse se não carregar leitor livre */
                <div className="flex-1 p-8 overflow-y-auto text-left text-white max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
                  <div className="w-[180px] aspect-[2/3] shrink-0 rounded-r-xl rounded-l-md overflow-hidden shadow-2xl">
                    <BookCover book={readingBook} />
                  </div>
                  
                  <div className="space-y-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Ficha da Obra
                    </span>
                    <h3 className="text-2xl font-bold font-display">{readingBook.title}</h3>
                    <p className="text-sm font-semibold text-slate-400">Autor: {readingBook.author}</p>
                    
                    <div className="flex gap-4 text-xs font-semibold text-slate-400">
                      {readingBook.pageCount ? <p>Páginas: {readingBook.pageCount}</p> : null}
                      {readingBook.categories ? <p>Categorias: {readingBook.categories.join(", ")}</p> : null}
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed text-justify">
                      {readingBook.description}
                    </p>

                    <div className="pt-6 flex flex-wrap gap-3">
                      <a 
                        href={readingBook.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 transition shadow-md"
                      >
                        <Globe className="w-4 h-4" /> Acessar Amostra Completa (Nova Aba)
                      </a>

                      <button 
                        onClick={() => toggleReservation(readingBook.id)}
                        className={`px-6 py-3 font-bold rounded-xl text-xs inline-flex items-center gap-2 transition shadow-md text-white ${
                          reservations[readingBook.id] 
                            ? "bg-rose-600 hover:bg-rose-500" 
                            : "bg-emerald-600 hover:bg-emerald-500"
                        }`}
                      >
                        <Bookmark className="w-4 h-4" /> {reservations[readingBook.id] ? "Devolver Reserva" : "Reservar Livro"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
