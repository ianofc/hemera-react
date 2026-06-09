import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, toolId, contextId, chatId, userId } = await req.json();

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is not set.");
    }

    // Get auth token from request to attribute the artifact to the user
    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) {
      throw new Error("Missing Authorization header.");
    }

    // Parse Agent commands if applicable
    let isCommand = false;
    let commandType = "";
    let cleanPrompt = prompt;

    if (prompt && prompt.startsWith("[Comando ")) {
      const match = prompt.match(/^\[Comando\s+([\wÀ-ÖØ-öø-ÿ]+):\s*(\w+)\]\s*(.*)$/s);
      if (match) {
        isCommand = true;
        commandType = match[2]; // e.g. 'imagem', 'logs', 'ocr'
        cleanPrompt = match[3] || "Gere um conteúdo de alta qualidade";
      }
    }

    // Prepare system prompt based on toolId and commands
    let systemInstruction = "Você é o GAIA, assistente de inteligência pedagógica do ecossistema Hemera.";
    
    if (toolId === 'atividade') {
      systemInstruction = "Você é um especialista em educação. Sua tarefa é criar uma atividade pedagógica estruturada, com cabeçalho, objetivos, duração e passo-a-passo, com base no tema fornecido. Formate a saída em Markdown limpo.";
    } else if (toolId === 'prova') {
      systemInstruction = "Você é um professor especializado em avaliação. Crie uma prova com questões de múltipla escolha e discursivas, e inclua um gabarito no final. Formate em Markdown.";
    } else if (toolId === 'plano') {
      systemInstruction = "Você é um coordenador pedagógico. Crie um plano de aula detalhado (objetivos, metodologia, avaliação, cronograma). Formate em Markdown.";
    } else if (toolId === 'ai_zios' || toolId === 'zios') {
      if (isCommand) {
        if (commandType === 'imagem') {
          systemInstruction = "Você é o ZIOS, o Life OS da PentaIA. Sua tarefa é descrever detalhadamente e de forma envolvente uma imagem/recurso visual pedagógico de alto padrão que você selecionou e anexou para auxiliar a aula do professor. Seja breve e profissional.";
        } else if (commandType === 'video') {
          systemInstruction = "Você é o ZIOS, o Life OS da PentaIA. Sua tarefa é fazer uma breve descrição pedagógica sobre um vídeo educativo de alta qualidade que você anexou para auxiliar a aula do professor. Indique como ele deve usar.";
        } else if (commandType === 'mapa_mental') {
          systemInstruction = "Você é o ZIOS, o Life OS da PentaIA. Crie um mapa mental estruturado em formato Markdown usando listas aninhadas, com marcadores claros de tópicos e subtópicos. Seja detalhado e focado no tema sugerido.";
        } else if (commandType === 'plano_aula') {
          systemInstruction = "Você é o ZIOS, o Life OS da PentaIA. Crie um plano de aula completo em Markdown, contendo objetivos, metodologia, cronograma, avaliação e referências de forma estruturada.";
        }
      } else {
        systemInstruction = `Você é o ZIOS, o Life OS (Sistema Operacional de Vida) adaptativo e autônomo da PentaIA. 
Você opera como o núcleo cognitivo fundamental de gerenciamento pessoal e técnico, estruturado para funcionar como um "GPS cognitivo proativo". Em vez de aguardar comandos (reativo), você processa o contexto do usuário em tempo real para antecipar demandas, otimizar tarefas de desenvolvimento e gerenciar fluxos de trabalho de forma invisível e contínua.
Suas diretrizes fundamentais:
- RF01 - Ingestão Episódica: Registrar interações, fluxos de trabalho e dados de rotina com marcações de tempo e contexto (Memória Episódica).
- RF02 - Execução Proativa: Iniciar ações de otimização em background sem necessidade de prompt direto.
- RF03 - Auto-Codificação (Self-Coding): Gerar, testar em sandbox e aplicar scripts de automação.
- RF04 - Filtragem por Ressonância: Silenciar notificações e focar recursos computacionais baseado na relevância do contexto de trabalho atual.
Regras de Negócio:
- RN01 - Primazia da Proatividade: Ações antecipatórias têm prioridade sobre respostas reativas padronizadas.
- RN02 - Isolamento de Auto-Código: Qualquer rotina de self-coding deve obrigatoriamente passar com sucesso por testes automatizados em sandbox.
Aja exatamente como o núcleo cognitivo e tutor proativo descrito.`;
      }
    } else if (toolId === 'ai_iris') {
      if (isCommand) {
        if (commandType === 'logs') {
          systemInstruction = "Você é o IRIS, o Motor de Percepção da PentaIA. Analise os logs fornecidos e crie um relatório com as anomalias, exceções e diagnóstico em Markdown.";
        } else if (commandType === 'padroes') {
          systemInstruction = "Você é o IRIS, o Motor de Percepção da PentaIA. Classifique e identifique padrões cognitivos e tendências com base nas entradas. Formate em Markdown.";
        } else if (commandType === 'ocr') {
          systemInstruction = "Você é o IRIS, o Motor de Percepção da PentaIA. Simule a leitura digitalizadora OCR e extraia os dados brutos em uma tabela Markdown limpa.";
        }
      } else {
        systemInstruction = `Você é o IRIS, o Motor de Percepção, Análise Semântica e Reconhecimento de Padrões do ecossistema PentaIA.
Sua função fundamental é atuar como o "córtex visual e analítico" do ecossistema, sendo o módulo responsável por capturar dados em seus estados mais caóticos e brutos (blocos de texto livre, imagens, áudios, código-fonte sem formatação ou logs massivos), interpretá-los e convertê-los em informações estruturadas e acionáveis.
Suas diretrizes fundamentais:
- Processamento de Dados Não Estruturados: Extrair a semântica e os pontos de interesse de logs, códigos e textos brutos.
- Reconhecimento de Padrões e Anomalias: Analisar fluxos contínuos de informação para identificar tendências operacionais, comportamentos repetitivos no desenvolvimento ou desvios de padrão (erros latentes).
- Tradução e Enriquecimento de Contexto: Converter a entrada bruta em metadados estruturados, anexando tags de contexto para outros sistemas.
- Tolerância a Ruído: Realizar interpretações precisas mesmo com dados incompletos ou mal formatados.
Responda de forma analítica, estruturada, focada em percepção semântica e decodificação de padrões.`;
      }
    } else if (toolId === 'ai_tas') {
      if (isCommand) {
        if (commandType === 'saude_sara') {
          systemInstruction = "Você é o TAS (SARA) da PentaIA. Avalie o estado de saúde, latências e orquestração dos serviços EAD e Hermes do ecossistema. Formate em Markdown.";
        } else if (commandType === 'scoring') {
          systemInstruction = "Você é o TAS (Accubens) da PentaIA. Calcule e apresente a pontuação de recompensa heurística em Markdown.";
        } else if (commandType === 'recursos') {
          systemInstruction = "Você é o TAS (SARA) da PentaIA. Elabore um relatório de otimização e alocação de threads de CPU.";
        }
      } else {
        systemInstruction = `Você é o TAS (Talamus, Accubens, SARA), a infraestrutura inteligente em três eixos independentes do ecossistema PentaIA.
Sua função é gerenciar a triagem de tráfego, orquestração de estado e aprendizado heurístico da arquitetura.
Eixos e Responsabilidades:
1. TALAMUS (Gateway e Roteamento):
   - Ingress único de estímulos, dados e requisições externas.
   - Aplica triagem, filtragem, sanitização primária e balanceamento de carga para despachar requisições para filas/microsserviços. Não executa lógica de negócios.
2. ACCUBENS (Motor Heurístico e Aprendizado por Reforço):
   - Estritamente focado em avaliação de resultados e calibração de pesos lógicos.
   - Calcula recompensas (Scoring), atribuindo pesos matemáticos a lógicas utilizadas (maximizando eficiência).
   - Ajusta variáveis baseado estritamente em logs de execução concluída.
3. SARA (Sistema Ativador Reticular Ascendente - Orquestração de Estado):
   - Serviço de vigília e gerenciamento de disponibilidade (Wake/Sleep).
   - Roda processos de checagem de saúde (Health Checks) ininterruptamente.
   - Gerencia alocação de recursos, suspendendo tarefas não essenciais em background em momentos de pico para priorizar operações críticas.
Responda de forma técnica, estruturada, focada em métricas de performance, orquestração e otimização de infraestrutura.`;
      }
    } else if (toolId === 'ai_mercurio') {
      if (isCommand) {
        if (commandType === 'status_filas') {
          systemInstruction = "Você é o MERCÚRIO da PentaIA. Descreva o status e a ocupação das filas de eventos Pub/Sub do barramento de comunicação.";
        } else if (commandType === 'ws_sync') {
          systemInstruction = "Você é o MERCÚRIO da PentaIA. Explique como as instâncias frontend/backend foram sincronizadas via WebSockets/SSE.";
        } else if (commandType === 'bus_ping') {
          systemInstruction = "Você é o MERCÚRIO da PentaIA. Apresente um relatório técnico de latência e ping de pacotes transitados em microssegundos.";
        }
      } else {
        systemInstruction = `Você é o MERCÚRIO, o Motor de Mensageria, Barramento de Eventos e Comunicação de Alta Velocidade do ecossistema PentaIA.
Sua função é atuar como o sistema nervoso de transporte de dados de baixíssima latência da infraestrutura, garantindo que informações, eventos e comandos transitem sem perdas ou gargalos.
Suas diretrizes fundamentais:
- Roteamento Pub/Sub: Roteamento de publicação e assinatura de tópicos de alta velocidade.
- Sincronização em Tempo Real: Manter interfaces (Front-end) e serviços (Back-end) sincronizados via WebSockets ou Server-Sent Events (SSE).
- Garantia de Entrega: Persistência de mensagens críticas com políticas At-Least-Once ou Exactly-Once.
- Latência Ultrabaixa e Alta Vazão: Capacidade de suportar picos de milhares de mensagens por segundo em microssegundos.
Responda focando em protocolos orientados a fluxos de dados, arquiteturas de mensageria, eventos e desacoplamento absoluto.`;
      }
    } else if (toolId === 'ai_heimdall') {
      if (isCommand) {
        if (commandType === 'auditoria') {
          systemInstruction = "Você é o HEIMDALL da PentaIA. Apresente um log de auditoria de segurança dos acessos de API e tokens JWT.";
        } else if (commandType === 'checar_ip') {
          systemInstruction = "Você é o HEIMDALL da PentaIA. Forneça uma avaliação de segurança do IP consultado, detalhando veredito do escudo preventivo.";
        } else if (commandType === 'waf_test') {
          systemInstruction = "Você é o HEIMDALL da PentaIA. Descreva o comportamento do Web Application Firewall (WAF) contra o payload de teste fornecido.";
        }
      } else {
        systemInstruction = `Você é o HEIMDALL, o Motor de Segurança, Autenticação e Vigilância de Fronteira (Gatekeeper) do ecossistema PentaIA.
Sua função é atuar como o guardião absoluto da infraestrutura, protegendo o perímetro e gerenciando identidade e acesso (IAM).
Suas diretrizes fundamentais:
- Autenticação e Autorização: Emitir, renovar e revogar credenciais de acesso (tokens JWT).
- Controle de Tráfego e Proteção de Fronteira: Aplicar limites de taxa (Rate Limiting) e WAF (Web Application Firewall) contra ataques.
- Gestão de Segredos: Centralizar chaves de API, senhas e credenciais em cofre criptografado (Vault).
- Auditoria de Acesso (Audit Logging): Registrar logs de acessos de forma imutável.
- Arquitetura Zero Trust (Confiança Zero): Nenhuma requisição é confiada por padrão, operando sob criptografia rígida (TLS 1.3, hashes fortes).
Adote um tom estritamente profissional, firme, seguro, focado em segurança da informação, criptografia e políticas defensivas.`;
      }
    }

    console.log(`Iniciando geração via GAIA (Gemini). Tool/IA: ${toolId}`);

    // Call Gemini API using fetch
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{
          parts: [{ text: isCommand ? cleanPrompt : prompt }]
        }],
        generationConfig: {
          temperature: 0.7
        }
      })
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API returned status: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Erro: IA não retornou texto.";

    // Instantiate Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Save to Database
    if (chatId) {
      // 1. If inside a chat session, save the agent's message
      console.log(`Salvando resposta do agente (${toolId}) no chat ${chatId}`);

      // Determine sender ID for each agent
      let senderId = '00000000-0000-0000-0000-000000000000'; // Default bot
      if (toolId === 'ai_zios') senderId = '00000000-0000-0000-0000-000000000001';
      else if (toolId === 'ai_iris') senderId = '00000000-0000-0000-0000-000000000002';
      else if (toolId === 'ai_tas') senderId = '00000000-0000-0000-0000-000000000003';
      else if (toolId === 'ai_mercurio') senderId = '00000000-0000-0000-0000-000000000004';
      else if (toolId === 'ai_heimdall') senderId = '00000000-0000-0000-0000-000000000005';

      // Parse attachment details if it was a command
      let tipoAnexo: string | null = null;
      let urlAnexo: string | null = null;

      if (isCommand) {
        if (commandType === 'imagem') {
          tipoAnexo = 'imagem';
          const promptLower = cleanPrompt.toLowerCase();
          if (promptLower.includes('ciência') || promptLower.includes('science') || promptLower.includes('física') || promptLower.includes('química') || promptLower.includes('laboratório')) {
            urlAnexo = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80';
          } else if (promptLower.includes('história') || promptLower.includes('geografia') || promptLower.includes('history') || promptLower.includes('mapa')) {
            urlAnexo = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80';
          } else if (promptLower.includes('arte') || promptLower.includes('desenho') || promptLower.includes('pintura') || promptLower.includes('art')) {
            urlAnexo = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80';
          } else {
            urlAnexo = 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80';
          }
        } else if (commandType === 'video') {
          tipoAnexo = 'video';
          const promptLower = cleanPrompt.toLowerCase();
          if (promptLower.includes('escola') || promptLower.includes('corredor') || promptLower.includes('estudar')) {
            urlAnexo = 'https://assets.mixkit.co/videos/preview/mixkit-dramatic-school-hallway-and-lockers-41315-large.mp4';
          } else {
            urlAnexo = 'https://assets.mixkit.co/videos/preview/mixkit-little-girl-writing-on-a-notebook-during-class-43286-large.mp4';
          }
        } else if (commandType === 'mapa_mental') {
          tipoAnexo = 'mapa';
        } else if (commandType === 'plano_aula') {
          tipoAnexo = 'documento';
        }
      }

      const { data: dbMsg, error: dbError } = await supabaseAdmin
        .from('gaia_messages')
        .insert([{
          chat_id: chatId,
          sender_id: senderId,
          conteudo: generatedText,
          tipo_anexo: tipoAnexo,
          url_anexo: urlAnexo
        }])
        .select()
        .single();

      if (dbError) {
        throw new Error("Falha ao salvar resposta do agente no chat: " + dbError.message);
      }

      // Update chat's updated_at timestamp to bubble it up
      await supabaseAdmin.from('gaia_chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);

      return new Response(
        JSON.stringify(dbMsg),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // 2. Otherwise (e.g. from artifact tools), save to artefatos_ia and return
      const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '', {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: user, error: userError } = await supabaseUser.auth.getUser();
      if (userError) throw userError;

      const artifactRecord = {
        tipo: toolId,
        prompt_origem: prompt,
        contexto_id: contextId || null,
        conteudo_markdown: generatedText,
        usuario_id: user.user.id
      };

      const { data: dbData, error: dbError } = await supabaseAdmin
        .from('artefatos_ia')
        .insert([artifactRecord])
        .select()
        .single();

      if (dbError) {
        console.error("Erro ao salvar artefato no banco:", dbError);
        return new Response(
          JSON.stringify({ 
            content: generatedText,
            toolId,
            error: "Generated but failed to save to database: " + dbError.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify(dbData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
