import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { turmaId, instrucoes } = await req.json();

    if (!turmaId) {
      return new Response(
        JSON.stringify({ error: 'Campo "turmaId" é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) throw new Error('GOOGLE_API_KEY não configurada nos secrets do Supabase.');

    // Busca contexto pedagógico da turma (RAG simples)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Busca turma
    const { data: turma } = await supabase.from('turmas').select('nome, periodo, ano_letivo').eq('id', turmaId).single();

    // Busca últimos planos de aula para contexto
    const { data: planos } = await supabase
      .from('planos_aula')
      .select('titulo, objetivos, habilidades_bncc, conteudo')
      .eq('turma_id', turmaId)
      .order('data_prevista', { ascending: false })
      .limit(5);

    // Monta contexto
    const contextoPedagogico = planos && planos.length > 0
      ? planos.map(p => `- ${p.titulo}: ${p.objetivos || ''} (${p.habilidades_bncc || ''})`).join('\n')
      : 'Nenhum plano de aula anterior registrado.';

    const turmaNome = turma ? `${turma.nome} (${turma.periodo} - ${turma.ano_letivo})` : 'Turma não identificada';

    const systemPrompt = `Você é GAIA, assistente pedagógico do ecossistema Hemera.
Sua tarefa é criar uma prova/avaliação completa e bem estruturada para professores brasileiros.
Formate a saída em Markdown limpo e organizado, pronto para impressão.`;

    const userPrompt = `Crie uma prova para a turma: ${turmaNome}

Contexto pedagógico (conteúdos já trabalhados em sala):
${contextoPedagogico}

Instruções adicionais do professor:
${instrucoes || 'Nenhuma instrução adicional.'}

A prova deve conter:
1. Cabeçalho com nome da escola, turma, data e espaço para o nome do aluno
2. Pelo menos 5 questões de múltipla escolha (4 alternativas cada)
3. Pelo menos 2 questões discursivas
4. Gabarito ao final (separado por linha horizontal)
5. Instruções de preenchimento

Formate em Markdown limpo.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.6 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${err}`);
    }

    const geminiData = await geminiRes.json();
    const provaMarkdown = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!provaMarkdown) throw new Error('Gemini não retornou conteúdo.');

    return new Response(
      JSON.stringify({ prova_markdown: provaMarkdown }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('gerar-prova-ia error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
