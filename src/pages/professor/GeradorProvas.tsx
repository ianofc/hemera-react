import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { pedagogicoService, Turma } from "@/services/pedagogicoService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Download, FileText, BrainCircuit, Copy, Check } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function GeradorProvas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [instrucoes, setInstrucoes] = useState("");
  const [gerando, setGerando] = useState(false);
  const [provaGerada, setProvaGerada] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadTurmas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTurmas = async () => {
    try {
      const data = await pedagogicoService.getTurmasProfessor();
      setTurmas(data);
      if (data.length > 0) setSelectedTurma(data[0].id);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar turmas", variant: "destructive" });
    }
  };

  const handleGerarProva = async () => {
    if (!selectedTurma || !instrucoes.trim()) return;
    setGerando(true);
    setProvaGerada(null);
    try {
      const resultado = await pedagogicoService.gerarProvaIA(selectedTurma, instrucoes);
      setProvaGerada(resultado);
      toast({ title: "Sucesso!", description: "Prova gerada com base no histórico da turma." });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro na IA";
      toast({ title: "Erro na IA", description: msg, variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  const handleDownload = () => {
    if (!provaGerada) return;
    const blob = new Blob([provaGerada], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prova_Gerada_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopiar = async () => {
    if (!provaGerada) return;
    await navigator.clipboard.writeText(provaGerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-down pt-8">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-200">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 font-display">Gerador de Provas (IA)</h1>
        <p className="text-slate-500 mt-1">Crie avaliações personalizadas analisando o histórico pedagógico da turma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Painel de Configuração ── */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg">Configurar Prova</CardTitle>
            <CardDescription>A IA lerá os planos de aula e notas automaticamente para gerar contexto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Turma Alvo</Label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger id="select-turma-prova">
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Instruções para a IA</Label>
              <Textarea
                id="textarea-instrucoes-prova"
                placeholder="Ex: Quero 10 questões de múltipla escolha sobre Revolução Industrial, nível médio, com gabarito..."
                value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)}
                className="h-32 resize-none"
              />
            </div>

            <Button
              id="btn-gerar-prova"
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-fuchsia-200"
              onClick={handleGerarProva}
              disabled={gerando || !selectedTurma || !instrucoes.trim()}
            >
              {gerando ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
              {gerando ? "Analisando histórico e gerando..." : "Gerar Prova Inteligente"}
            </Button>

            {provaGerada && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-indigo-600 border-indigo-200" onClick={handleCopiar}>
                  {copiado ? <Check className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiado ? "Copiado!" : "Copiar Texto"}
                </Button>
                <Button variant="outline" className="flex-1 text-slate-600 border-slate-200" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" /> Baixar .md
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Resultado com Markdown ── */}
        <Card className="border-slate-200 shadow-md bg-white overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Resultado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative min-h-[400px]">

            {gerando && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-16 h-16 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-700 font-bold">Processando com IA...</p>
                <p className="text-xs text-slate-400 mt-1">Lendo planos de aula e histórico de notas</p>
              </div>
            )}

            {!provaGerada && !gerando && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <Sparkles className="w-12 h-12 mb-3 text-slate-300" />
                <p className="font-medium">A prova gerada aparecerá aqui</p>
                <p className="text-xs mt-1">Com formatação completa: questões, alternativas e gabarito</p>
              </div>
            )}

            {provaGerada && !gerando && (
              <div className="overflow-y-auto max-h-[600px] p-6 prose prose-slate prose-sm max-w-none
                prose-headings:font-bold prose-headings:text-slate-800
                prose-h1:text-xl prose-h1:border-b prose-h1:pb-2 prose-h1:border-slate-200
                prose-h2:text-lg prose-h2:mt-5
                prose-h3:text-base prose-h3:text-slate-700
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-ol:space-y-1 prose-ul:space-y-1
                prose-li:text-slate-700
                prose-hr:border-slate-300 prose-hr:my-4
                prose-blockquote:border-l-violet-400 prose-blockquote:bg-violet-50 prose-blockquote:p-3 prose-blockquote:rounded-r-xl"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {provaGerada}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
