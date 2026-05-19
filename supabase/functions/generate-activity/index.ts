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
    const { prompt, toolId, contextId } = await req.json();

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is not set.");
    }

    // Get auth token from request to attribute the artifact to the user
    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) {
      throw new Error("Missing Authorization header.");
    }

    // Prepare system prompt based on toolId
    let systemInstruction = "Você é o GAIA, assistente de inteligência pedagógica do ecossistema Hemera.";
    if (toolId === 'atividade') {
      systemInstruction = "Você é um especialista em educação. Sua tarefa é criar uma atividade pedagógica estruturada, com cabeçalho, objetivos, duração e passo-a-passo, com base no tema fornecido. Formate a saída em Markdown limpo.";
    } else if (toolId === 'prova') {
      systemInstruction = "Você é um professor especializado em avaliação. Crie uma prova com questões de múltipla escolha e discursivas, e inclua um gabarito no final. Formate em Markdown.";
    } else if (toolId === 'plano') {
      systemInstruction = "Você é um coordenador pedagógico. Crie um plano de aula detalhado (objetivos, metodologia, avaliação, cronograma). Formate em Markdown.";
    }

    console.log(`Iniciando geração via GAIA (Gemini). Tool: ${toolId}`);

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
          parts: [{ text: prompt }]
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

    const data = await geminiRes.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro: IA não retornou texto.";

    // Save to Supabase using a client authenticated with the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // We assume there is an 'artefatos_ia' table to save this
    // If url_storage is expected to be a link, we can save the markdown directly in a content column,
    // or return it to the frontend to handle. The user requested we replicate the FastAPI behavior.
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // For simplicity in PMF, we will insert it. The frontend might expect specific fields.
    const artifactRecord = {
      tipo: toolId,
      prompt_origem: prompt,
      contexto_id: contextId || null,
      conteudo_markdown: generatedText, // Saving the text directly. If frontend expects url_storage, we would upload to storage bucket first.
      usuario_id: user.user.id
    };

    const { data: dbData, error: dbError } = await supabase
      .from('artefatos_ia')
      .insert([artifactRecord])
      .select()
      .single();

    if (dbError) {
      console.error("Erro ao salvar no banco:", dbError);
      // Even if db fails, return the content so it's not lost
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
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
