import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Image as ImageIcon, Map as MapIcon, Video, FileText, Loader2 } from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { useToast } from "@/hooks/use-toast";
import { aiService, GenerateArtifactResponse } from "@/services/aiService";

interface IntelligenceCanvasProps {
  onGenerated?: (artifact: GenerateArtifactResponse) => void;
}

export function IntelligenceCanvas({ onGenerated }: IntelligenceCanvasProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { toast } = useToast();

  const tools = [
    { id: 'image', label: 'Gerar Imagem', icon: <ImageIcon className="h-4 w-4" />, color: 'text-pink-400' },
    { id: 'map', label: 'Mapa Mental', icon: <MapIcon className="h-4 w-4" />, color: 'text-cyan-400' },
    { id: 'video', label: 'Gerar Vídeo', icon: <Video className="h-4 w-4" />, color: 'text-purple-400' },
    { id: 'plan', label: 'Plano de Aula', icon: <FileText className="h-4 w-4" />, color: 'text-emerald-400' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt vazio",
        description: "Por favor, descreva o que você deseja criar.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTool) {
      toast({
        title: "Nenhuma ferramenta selecionada",
        description: "Selecione o tipo de artefato que deseja gerar (Imagem, Mapa Mental, etc).",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Call our FastAPI integration
      const artifact = await aiService.generateArtifact({
        prompt,
        toolId: selectedTool,
      });

      toast({
        title: "Artefato gerado com sucesso!",
        description: "O Hemera Intelligence processou seu pedido.",
      });
      
      // Clear input on success
      setPrompt("");
      if (onGenerated) {
        onGenerated(artifact);
      }
    } catch (error: any) {
      toast({
        title: "Erro na geração",
        description: error.message || "Ocorreu um erro ao processar seu pedido no Hemera Intelligence.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-[400px] rounded-3xl overflow-hidden border border-white/10">
      <AuroraBackground className="absolute inset-0 opacity-50" />
      
      <div className="relative z-10 p-8 flex flex-col h-full justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            Hemera Intelligence
          </h2>
          <p className="text-slate-300 max-w-md">
            Selecione uma ferramenta criativa e peça para o Hemera transformar seus documentos em artefatos.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              onClick={() => setSelectedTool(tool.id)}
              className={`bg-black/40 border-white/5 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer group ${selectedTool === tool.id ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className={`p-3 rounded-full bg-white/5 group-hover:scale-110 transition-transform ${tool.color}`}>
                  {tool.icon}
                </div>
                <span className="text-sm font-semibold text-white">{tool.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <textarea 
            placeholder="O que vamos criar hoje com base nos seus documentos?"
            className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 resize-none h-20 outline-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 transition-all"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Processando...' : 'Executar Comando'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
