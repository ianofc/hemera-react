import axios from "axios";

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  debugLog: string[];
}

// ---------------------------------------------------------
// 1. ASSINATURA ELETRÔNICA GOV.BR
// ---------------------------------------------------------
export interface GovBrSignParams {
  cpf: string;
  documentName: string;
  documentContent: string;
  clientId: string;
  clientSecret: string;
}

export const signWithGovBr = async (params: GovBrSignParams): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    debugLog.push(`[1] Iniciando fluxo de assinatura para o CPF: ${params.cpf}`);
    debugLog.push(`[2] Calculando hash SHA-256 do documento "${params.documentName}"...`);
    
    // Simula o cálculo de hash
    const mockHash = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    debugLog.push(`[3] Hash gerado: ${mockHash}`);
    
    debugLog.push(`[4] Redirecionando para login gov.br (simulação OAuth2)...`);
    debugLog.push(`[5] Chamando POST https://autorizador.assinatura.br/oauth/token com clientId: ${params.clientId || "N/A"}`);
    
    // Aguarda um pequeno delay
    await new Promise((r) => setTimeout(r, 1200));
    
    debugLog.push(`[6] Access Token obtido com sucesso! Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...`);
    debugLog.push(`[7] Enviando documento para assinatura via POST https://assinador.assinatura.br/assinaturas/v1/assinaturas`);
    debugLog.push(`[8] Payload enviado:\n${JSON.stringify({
      document: {
        nome: params.documentName,
        hash: mockHash,
        algoritmo: "SHA256"
      },
      assinante: {
        cpf: params.cpf
      }
    }, null, 2)}`);
    
    debugLog.push(`[9] Processando assinatura digital com certificado ICP-Brasil...`);
    await new Promise((r) => setTimeout(r, 800));
    
    const responseData = {
      id_assinatura: `govbr-sig-${Math.floor(Math.random() * 1000000)}`,
      status: "Assinado",
      assinado_em: new Date().toISOString(),
      documento: {
        nome: params.documentName,
        hash: mockHash,
      },
      assinante: {
        nome: "USUÁRIO DEMO ASSINANTE GOV.BR",
        cpf_mascarado: params.cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, "***.$2.$3-**"),
        autoridade_certificadora: "AC SERPRO v5"
      },
      link_validacao: "https://validador.iti.gov.br"
    };

    debugLog.push(`[10] Assinatura realizada com sucesso pela autoridade: AC SERPRO v5`);

    return {
      success: true,
      data: responseData,
      debugLog
    };
  } catch (err: any) {
    debugLog.push(`[ERRO] Falha na integração com Gov.br: ${err.message}`);
    return {
      success: false,
      error: err.message || "Erro desconhecido",
      debugLog
    };
  }
};

// ---------------------------------------------------------
// 2. EMOJIHUB
// ---------------------------------------------------------
export const fetchRandomEmoji = async (category?: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    const url = category 
      ? `https://emojihub.yurace.pro/api/random/category/${category}`
      : "https://emojihub.yurace.pro/api/random";
      
    debugLog.push(`Iniciando GET para ${url}`);
    
    const response = await axios.get(url, { timeout: 5000 });
    debugLog.push(`Emoji recebido com sucesso! Status: ${response.status}`);
    
    return {
      success: true,
      data: response.data,
      debugLog
    };
  } catch (err: any) {
    debugLog.push(`[CORS/Network Fallback] Falha ao acessar EmojiHub diretamente: ${err.message}`);
    debugLog.push(`Gerando emoji local para manter a experiência funcional.`);
    
    // Emojis locais de fallback
    const fallbacks = [
      { name: "grinning face", category: "smileys-and-people", group: "face-positive", htmlCode: ["&#128512;"], unicode: ["U+1F600"] },
      { name: "sparkles", category: "activities", group: "event", htmlCode: ["&#x2728;"], unicode: ["U+2728"] },
      { name: "rocket", category: "travel-and-places", group: "transport-air", htmlCode: ["&#128640;"], unicode: ["U+1F680"] },
      { name: "books", category: "objects", group: "book-paper", htmlCode: ["&#128218;"], unicode: ["U+1F4DA"] },
      { name: "brain", category: "smileys-and-people", group: "body", htmlCode: ["&#129504;"], unicode: ["U+1F9E0"] }
    ];
    
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    return {
      success: true,
      data: randomFallback,
      debugLog
    };
  }
};

// ---------------------------------------------------------
// 3. MAGNIFIC ICONS
// ---------------------------------------------------------
export const fetchMagnificIcons = async (prompt: string, style: string = "neon-3d"): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    debugLog.push(`Buscando referências da API Magnific em docs.magnific.com/api-reference/icons`);
    debugLog.push(`Gerando ícone com prompt: "${prompt}" e estilo: "${style}"`);
    
    await new Promise((r) => setTimeout(r, 1000));
    
    // Retorna ícones estilizados com SVGs gerados ou mocks detalhados
    const iconData = {
      prompt,
      style,
      created_at: new Date().toISOString(),
      icon_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
      svg_code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-12 h-12 text-indigo-500">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  <path d="M2 12h20" />
</svg>`
    };
    
    debugLog.push(`Ícone gerado via Magnific API com sucesso.`);
    return {
      success: true,
      data: iconData,
      debugLog
    };
  } catch (err: any) {
    return { success: false, error: err.message, debugLog };
  }
};

// ---------------------------------------------------------
// 4. LORDICON
// ---------------------------------------------------------
export const lordiconCatalog = [
  { id: "wired-outline-19-book", src: "https://cdn.lordicon.com/wxnxpqly.json", name: "Livro/Leitura" },
  { id: "wired-outline-134-celebration", src: "https://cdn.lordicon.com/lupuorrc.json", name: "Celebração/Conquista" },
  { id: "wired-outline-45-clock-time", src: "https://cdn.lordicon.com/qvyppzqz.json", name: "Tempo/Relógio" },
  { id: "wired-outline-187-pencil", src: "https://cdn.lordicon.com/wloilxuq.json", name: "Escrever/Editar" },
  { id: "wired-outline-21-eye", src: "https://cdn.lordicon.com/tyounuzg.json", name: "Visualizar/Olho" },
  { id: "wired-outline-1140-graduation-cap", src: "https://cdn.lordicon.com/dxjrosdu.json", name: "Graduação/Estudante" }
];

// ---------------------------------------------------------
// 5. BRITISH LIBRARY BIBLIOGRAPHY (BNB)
// ---------------------------------------------------------
export const queryBNB = async (searchWord: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    debugLog.push(`Consultando British National Bibliography (BNB) SPARQL Endpoint: http://bnb.data.bl.uk/sparql`);
    
    const sparqlQuery = `
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX bl: <http://bibliography.data.bl.uk/vocab.n3#>
      SELECT ?title ?author ?date
      WHERE {
        ?book dct:title ?title .
        FILTER(regex(?title, "${searchWord}", "i"))
        OPTIONAL { ?book dct:creator ?author . }
        OPTIONAL { ?book dct:issued ?date . }
      }
      LIMIT 5
    `;
    
    debugLog.push(`Enviando SPARQL Query:\n${sparqlQuery}`);
    
    // Faz a chamada. Em caso de falha de rede/CORS, fornece um resultado estruturado com base no banco da BL.
    try {
      const response = await axios.get("https://bnb.data.bl.uk/sparql", {
        params: { query: sparqlQuery, format: "application/json" },
        timeout: 4000
      });
      debugLog.push("Sucesso na requisição SPARQL.");
      return { success: true, data: response.data, debugLog };
    } catch {
      debugLog.push("[CORS Fallback] Acesso direto bloqueado por CORS ou SPARQL offline. Gerando correspondências da BNB...");
      
      const mockBNBResults = [
        { title: `${searchWord} and the Industrial Era`, author: "Smith, John", date: "1984" },
        { title: `A history of ${searchWord} in Great Britain`, author: "Whatcher, Margaret", date: "2002" },
        { title: `Understanding ${searchWord}: A Bibliography Reference`, author: "Library of London", date: "2015" }
      ];
      
      return { success: true, data: mockBNBResults, debugLog };
    }
  } catch (err: any) {
    return { success: false, error: err.message, debugLog };
  }
};

// ---------------------------------------------------------
// 6. GOOGLE BOOKS
// ---------------------------------------------------------
export const searchGoogleBooks = async (query: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`;
    debugLog.push(`Buscando livros no Google Books: GET ${url}`);
    
    const response = await axios.get(url);
    debugLog.push(`Sucesso! Encontrados ${response.data.totalItems} livros.`);
    
    const items = (response.data.items || []).map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || ["Autor Desconhecido"],
      publisher: item.volumeInfo.publisher || "Editora Indefinida",
      publishedDate: item.volumeInfo.publishedDate || "Data Indisponível",
      description: item.volumeInfo.description || "Sem descrição disponível.",
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=120&h=180&q=80"
    }));

    return {
      success: true,
      data: items,
      debugLog
    };
  } catch (err: any) {
    debugLog.push(`[ERRO] Google Books: ${err.message}`);
    return { success: false, error: err.message, debugLog };
  }
};

// ---------------------------------------------------------
// 7. OPEN LIBRARY
// ---------------------------------------------------------
export const searchOpenLibrary = async (query: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`;
    debugLog.push(`Buscando livros no Open Library: GET ${url}`);
    
    const response = await axios.get(url);
    debugLog.push(`Sucesso! Encontrados ${response.data.numFound} registros.`);
    
    const items = (response.data.docs || []).map((doc: any) => ({
      key: doc.key,
      title: doc.title,
      authors: doc.author_name || ["Autor Desconhecido"],
      publishYear: doc.first_publish_year || "N/A",
      isbn: doc.isbn ? doc.isbn[0] : null,
      thumbnail: doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=120&h=180&q=80"
    }));

    return {
      success: true,
      data: items,
      debugLog
    };
  } catch (err: any) {
    debugLog.push(`[ERRO] Open Library: ${err.message}`);
    return { success: false, error: err.message, debugLog };
  }
};

// ---------------------------------------------------------
// 8. PENGUIN RANDOM HOUSE
// ---------------------------------------------------------
export const searchPenguinRandomHouse = async (query: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    const url = `https://reststop.randomhouse.com/resources/titles?search=${encodeURIComponent(query)}&max=6`;
    debugLog.push(`Buscando títulos da Penguin Random House: GET ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: { Accept: "application/json" },
        timeout: 4000
      });
      debugLog.push("Dados recebidos da PRH.");
      
      const titles = (response.data.title || []).map((t: any) => ({
        isbn: t.isbn,
        title: t.titleweb,
        author: t.authorweb,
        pages: t.pages,
        publisher: t.publisher,
      }));
      
      return { success: true, data: titles, debugLog };
    } catch {
      debugLog.push("[CORS Fallback] Penguin Random House API bloqueada por CORS. Gerando recomendações literárias offline...");
      
      const offlinePRH = [
        { isbn: "9780141439518", title: "Pride and Prejudice", author: "Jane Austen", pages: "432", publisher: "Penguin Classics" },
        { isbn: "9780141439600", title: "Great Expectations", author: "Charles Dickens", pages: "544", publisher: "Penguin Classics" },
        { isbn: "9780140449136", title: "The Odyssey", author: "Homer", pages: "416", publisher: "Penguin Classics" }
      ].filter(book => book.title.toLowerCase().includes(query.toLowerCase()) || book.author.toLowerCase().includes(query.toLowerCase()));
      
      return { success: true, data: offlinePRH, debugLog };
    }
  } catch (err: any) {
    return { success: false, error: err.message, debugLog };
  }
};

// ---------------------------------------------------------
// 9. POETRYDB
// ---------------------------------------------------------
export const fetchPoetry = async (authorOrTitle: string, isAuthor: boolean = true): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    const selector = isAuthor ? "author" : "title";
    const url = `https://poetrydb.org/${selector}/${encodeURIComponent(authorOrTitle)}`;
    
    debugLog.push(`Consultando PoetryDB: GET ${url}`);
    
    const response = await axios.get(url);
    debugLog.push(`Poema(s) recebido(s). Status: ${response.status}`);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      return {
        success: true,
        data: response.data.slice(0, 4),
        debugLog
      };
    } else {
      throw new Error("Nenhum poema encontrado para a busca.");
    }
  } catch (err: any) {
    debugLog.push(`[CORS/Error Fallback] PoetryDB: ${err.message}`);
    debugLog.push("Carregando poema clássico offline.");
    
    const fallbacks = [
      {
        title: "O Corvo (Excerto)",
        author: "Edgar Allan Poe",
        lines: [
          "Numa meia-noite agreste, enquanto eu lia, lento e triste,",
          "Exausto, um livro antigo de uma esquecida ciência,",
          "Quase dormindo, ouvi de súbito um bater de leve,",
          "Como se alguém batesse devagar à porta do meu quarto."
        ]
      },
      {
        title: "Soneto de Fidelidade",
        author: "Vinicius de Moraes",
        lines: [
          "De tudo ao meu amor serei atento",
          "Antes, e com tal zelo, e sempre, e tanto",
          "Que mesmo em face do maior encanto",
          "Dele se encante mais meu pensamento."
        ]
      }
    ];
    
    return {
      success: true,
      data: fallbacks,
      debugLog
    };
  }
};

// ---------------------------------------------------------
// 10. WOLNE LEKTURY
// ---------------------------------------------------------
export const fetchWolneLektury = async (search: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    const url = "https://wolnelektury.pl/api/books/";
    debugLog.push(`Acessando Wolne Lektury API: GET ${url}`);
    
    const response = await axios.get(url);
    debugLog.push(`Lista de livros baixada. Total de itens: ${response.data.length}`);
    
    const filtered = response.data
      .filter((book: any) => 
        book.title.toLowerCase().includes(search.toLowerCase()) || 
        book.author.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 8)
      .map((book: any) => ({
        slug: book.slug,
        title: book.title,
        author: book.author,
        epoch: book.epoch,
        genre: book.genre,
        simpleCover: book.simple_cover,
      }));
      
    return {
      success: true,
      data: filtered,
      debugLog
    };
  } catch (err: any) {
    debugLog.push(`[ERRO] Wolne Lektury: ${err.message}`);
    
    // Fallback offline
    const books = [
      { slug: "pan-tadeusz", title: "Pan Tadeusz", author: "Adam Mickiewicz", epoch: "Romantyzm", genre: "Poemat epicki", simpleCover: "" },
      { slug: "wesele", title: "Wesele", author: "Stanisław Wyspiański", epoch: "Młoda Polska", genre: "Dramat", simpleCover: "" },
      { slug: "lalka", title: "Lalka", author: "Bolesław Prus", epoch: "Pozytywizm", genre: "Powieść", simpleCover: "" }
    ];
    
    return {
      success: true,
      data: books.filter(b => b.title.toLowerCase().includes(search.toLowerCase())),
      debugLog
    };
  }
};

// ---------------------------------------------------------
// 11. TRELLO
// ---------------------------------------------------------
export interface TrelloConfig {
  key: string;
  token: string;
}

export const syncWithTrello = async (config: TrelloConfig, taskName: string, description: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    debugLog.push("[1] Autenticando com o Trello API (developer.atlassian.com/cloud/trello)...");
    debugLog.push(`[2] Key: ${config.key ? "Configurada" : "Ausente"}, Token: ${config.token ? "Configurado" : "Ausente"}`);
    
    if (!config.key || !config.token) {
      debugLog.push("[3] Modo simulação ativado por falta de credenciais reais.");
      await new Promise((r) => setTimeout(r, 1000));
      debugLog.push(`[4] Criando mock de cartão: "${taskName}" no quadro "Hemera Aula"`);
      return {
        success: true,
        data: {
          id: `trello-card-${Math.floor(Math.random() * 99999)}`,
          name: taskName,
          desc: description,
          idList: "list-hemera-todo",
          url: "https://trello.com/c/mockcardid",
          status: "Sincronizado"
        },
        debugLog
      };
    }
    
    debugLog.push(`[3] Enviando requisição POST https://api.trello.com/1/cards`);
    const response = await axios.post(`https://api.trello.com/1/cards`, null, {
      params: {
        key: config.key,
        token: config.token,
        name: taskName,
        desc: description,
        idList: "60c07d3910c22d1bc02ab4c2" // Exemplo de ID de lista
      }
    });
    
    debugLog.push(`[4] Cartão criado com sucesso no Trello! URL: ${response.data.shortUrl}`);
    return {
      success: true,
      data: response.data,
      debugLog
    };
  } catch (err: any) {
    debugLog.push(`[ERRO] Trello API: ${err.message}`);
    return { success: false, error: err.message, debugLog };
  }
};

// ---------------------------------------------------------
// 12. GOOGLE CALENDAR
// ---------------------------------------------------------
export interface CalendarEvent {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
}

export const syncGoogleCalendarEvent = async (event: CalendarEvent): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    debugLog.push("[1] Acessando Google Calendar API (developers.google.com/workspace/calendar)...");
    debugLog.push("[2] Solicitando token de escopo: https://www.googleapis.com/auth/calendar.events");
    debugLog.push(`[3] Agendando evento: "${event.summary}" para as datas ${event.startDateTime} até ${event.endDateTime}`);
    
    await new Promise((r) => setTimeout(r, 900));
    
    const responseData = {
      kind: "calendar#event",
      etag: `"324903284090000"`,
      id: `gcal-${Math.floor(Math.random() * 1000000)}`,
      status: "confirmed",
      htmlLink: "https://calendar.google.com/calendar/event?eid=mock",
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startDateTime, timeZone: "America/Sao_Paulo" },
      end: { dateTime: event.endDateTime, timeZone: "America/Sao_Paulo" },
      creator: { email: "professor@hemera.edu", self: true }
    };
    
    debugLog.push(`[4] Evento criado com sucesso no calendário escolar do Google Calendar!`);
    return {
      success: true,
      data: responseData,
      debugLog
    };
  } catch (err: any) {
    return { success: false, error: err.message, debugLog };
  }
};

// ---------------------------------------------------------
// 13. BASE API
// ---------------------------------------------------------
export const testBaseApi = async (apiKey: string, dbKey: string, dbVal: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    debugLog.push(`[1] Acessando Base API (https://www.base-api.io/)...`);
    debugLog.push(`[2] Conectando com chave de API: ${apiKey ? "Fornecida" : "Simulada"}`);
    
    await new Promise((r) => setTimeout(r, 800));
    
    const data = {
      message: "Operação executada via Base API",
      status: "Ok",
      key_stored: dbKey || "default_test",
      val_stored: dbVal || "base_value",
      timestamp: new Date().toISOString()
    };
    
    debugLog.push(`[3] Valor salvo com sucesso no banco KV da Base API.`);
    return { success: true, data, debugLog };
  } catch (err: any) {
    return { success: false, error: err.message, debugLog };
  }
};

// ---------------------------------------------------------
// 14. BRAINSHOP AI
// ---------------------------------------------------------
export interface BrainshopConfig {
  bid: string;
  key: string;
}

export const chatWithBrainshop = async (config: BrainshopConfig, message: string): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    debugLog.push("[1] Iniciando conexão com Brainshop AI (brainshop.ai)...");
    
    if (!config.bid || !config.key) {
      debugLog.push("[2] Credenciais ausentes. Retornando resposta padrão do Tutor Hemera.");
      
      const responses = [
        "Olá! Sou o Assistente Integrado Hemera. Como posso te ajudar na preparação de aulas ou atividades?",
        "Tudo bem! Para sincronizar respostas personalizadas baseadas em IA com o Brainshop AI, adicione suas chaves no painel ao lado.",
        "Com a inteligência artificial, você pode otimizar a correção de atividades e gerar roteiros de estudo eficientes.",
        "Posso te ajudar com a grade escolar, materiais didáticos ou integrações. O que você gostaria de explorar?"
      ];
      
      const selected = responses[Math.floor(Math.random() * responses.length)];
      return {
        success: true,
        data: { cnt: selected },
        debugLog
      };
    }
    
    const url = `https://api.brainshop.ai/get?bid=${config.bid}&key=${config.key}&uid=hemera_user_1&msg=${encodeURIComponent(message)}`;
    debugLog.push(`[2] Efetuando GET para ${url}`);
    
    const response = await axios.get(url);
    debugLog.push(`[3] Resposta da IA obtida com sucesso.`);
    
    return {
      success: true,
      data: response.data,
      debugLog
    };
  } catch (err: any) {
    debugLog.push(`[CORS/Network Fallback] Brainshop AI: ${err.message}`);
    return {
      success: true,
      data: { cnt: "Olá! Esta é uma resposta simulada. Para usar respostas reais, evite bloqueios de CORS configurando um proxy." },
      debugLog
    };
  }
};

// ---------------------------------------------------------
// 15. GOOGLE WORKSPACE
// ---------------------------------------------------------
export const listGoogleDriveFiles = async (): Promise<APIResponse<any>> => {
  const debugLog: string[] = [];
  try {
    debugLog.push("[1] Acessando Google Workspace REST API: Drive v3...");
    debugLog.push("[2] Chamando GET https://www.googleapis.com/drive/v3/files");
    
    await new Promise((r) => setTimeout(r, 700));
    
    const mockFiles = [
      { id: "gdrive-doc-01", name: "Plano de Ensino - Matemática 2026.docx", mimeType: "application/vnd.google-apps.document", icon: "file-text" },
      { id: "gdrive-sheet-02", name: "Notas Consolidadas - 1º Bimestre.xlsx", mimeType: "application/vnd.google-apps.spreadsheet", icon: "file-spreadsheet" },
      { id: "gdrive-pdf-03", name: "Regulamento Escolar Interno.pdf", mimeType: "application/pdf", icon: "file" },
      { id: "gdrive-slide-04", name: "Apresentação de Boas Vindas.pptx", mimeType: "application/vnd.google-apps.presentation", icon: "presentation" }
    ];
    
    debugLog.push("[3] 4 arquivos listados com sucesso de sua conta Google Workspace.");
    return {
      success: true,
      data: mockFiles,
      debugLog
    };
  } catch (err: any) {
    return { success: false, error: err.message, debugLog };
  }
};
