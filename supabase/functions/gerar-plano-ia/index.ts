import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tema, turmaNome } = await req.json();

    if (!tema) {
      return new Response(
        JSON.stringify({ error: 'Campo "tema" é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) throw new Error('GOOGLE_API_KEY não configurada nos secrets do Supabase.');

    const systemPrompt = `Você é GAIA, assistente pedagógico especialista em BNCC do ecossistema Hemera.
Sua tarefa é criar um plano de aula estruturado e completo para professores brasileiros da educação básica.
Sempre retorne SOMENTE um JSON válido, sem markdown, sem texto extra fora do JSON.`;

    const userPrompt = `Crie um plano de aula para a turma "${turmaNome || 'não especificada'}" sobre o tema: "${tema}".

Retorne APENAS este JSON (sem nenhum texto antes ou depois):
{
  "titulo": "título do plano de aula",
  "objetivos": "objetivos de aprendizagem claros e mensuráveis",
  "habilidades_bncc": "ex: EF05MA01, EF05MA02",
  "duracao": "ex: 2 aulas de 50 minutos",
  "conteudo": "conteúdo a ser abordado",
  "metodologia": "metodologia e estratégias pedagógicas",
  "recursos": "materiais e recursos necessários",
  "avaliacao": "forma de avaliação da aprendizagem"
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${err}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Gemini não retornou conteúdo.');

    // Parse seguro do JSON
    let plano: Record<string, string>;
    try {
      // Remove possíveis marcadores de código que a IA possa ter incluído
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      plano = JSON.parse(cleaned);
    } catch {
      // Se não conseguir parsear, retorna o texto em campo conteudo
      plano = {
        titulo: tema,
        conteudo: rawText,
        objetivos: '',
        habilidades_bncc: '',
        duracao: '1 aula',
        metodologia: '',
        recursos: '',
        avaliacao: '',
      };
    }

    return new Response(
      JSON.stringify({ plano }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('gerar-plano-ia error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
