import React, { useState, useEffect } from "react";
import { pedagogicoService, Turma } from "@/services/pedagogicoService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Download, FileText, BrainCircuit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GeradorProvas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [instrucoes, setInstrucoes] = useState("");
  const [gerando, setGerando] = useState(false);
  const [provaGerada, setProvaGerada] = useState<string | null>(null);

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
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar turmas", variant: "destructive" });
    }
  };

  const handleGerarProva = async () => {
    if (!selectedTurma || !instrucoes.trim()) return;

    setGerando(true);
    setProvaGerada(null);
    try {
      // Aqui a Edge Function vai rodar o "Mega-Prompt" analisando os planos da turma e as notas (o desempenho).
      const resultado = await pedagogicoService.gerarProvaIA(selectedTurma, instrucoes);
      setProvaGerada(resultado);
      toast({ title: "Sucesso!", description: "Prova gerada com base no histórico da turma." });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({ title: "Erro na IA", description: error.message, variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  const handleDownloadDocs = () => {
    if (!provaGerada) return;
    // O download em DOCX real pode ser feito enviando o Markdown para um utilitário, ou direto da Edge Function.
    // Aqui usaremos um fallback de download TXT/MD caso não haja o conversor DOCX no front.
    const blob = new Blob([provaGerada], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prova_Gerada.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-down pt-8">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-200">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 font-display">Gerador de Provas (IA)</h1>
        <p className="text-slate-500 mt-1">Crie avaliações altamente personalizadas analisando o histórico e desempenho da turma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg">Configurar Prova</CardTitle>
            <CardDescription>O Mega-Prompt lerá os planos de aula e as notas automaticamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Turma Alvo (Contexto)</Label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger>
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
              <Label>Instruções Específicas</Label>
              <Textarea 
                placeholder="Ex: Quero 10 questões de múltipla escolha sobre Revolução Industrial, focando em questões fáceis pois a média da turma foi baixa no último bimestre..."
                value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)}
                className="h-32 resize-none"
              />
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-fuchsia-200"
              onClick={handleGerarProva}
              disabled={gerando || !selectedTurma || !instrucoes.trim()}
            >
              {gerando ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
              {gerando ? "Analisando histórico e gerando..." : "Gerar Prova Inteligente"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md bg-slate-50 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-200 bg-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> Resultado
              </CardTitle>
              {provaGerada && (
                <Button variant="outline" size="sm" onClick={handleDownloadDocs} className="text-indigo-600 border-indigo-200">
                  <Download className="w-4 h-4 mr-2" /> Salvar Arquivo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative min-h-[300px]">
            {gerando && (
              <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-16 h-16 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Processando Mega-Prompt...</p>
                <p className="text-xs text-slate-400 mt-1">Lendo planos de aula e médias de notas</p>
              </div>
            )}
            
            {!provaGerada && !gerando && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <Sparkles className="w-12 h-12 mb-3 text-slate-300" />
                <p>A prova gerada aparecerá aqui</p>
              </div>
            )}

            {provaGerada && !gerando && (
              <div className="p-6 h-full overflow-y-auto whitespace-pre-wrap font-mono text-sm text-slate-700">
                {provaGerada}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
