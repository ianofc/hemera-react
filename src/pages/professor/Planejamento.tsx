import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pedagogicoService, Turma } from "@/services/pedagogicoService";
import { PlanoDeAula } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Sparkles, Plus, Loader2, BookOpen, Clock, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Planejamento() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [planos, setPlanos] = useState<PlanoDeAula[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States para o Gerador de IA
  const [temaIA, setTemaIA] = useState("");
  const [gerandoIA, setGerandoIA] = useState(false);
  const [modalIAOpen, setModalIAOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadTurmas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTurma) {
      loadPlanos(selectedTurma);
    }
  }, [selectedTurma]);

  const loadTurmas = async () => {
    try {
      const data = await pedagogicoService.getTurmasProfessor();
      setTurmas(data);
      if (data.length > 0) {
        setSelectedTurma(data[0].id);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({ title: "Erro", description: "Não foi possível carregar turmas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadPlanos = async (turmaId: string) => {
    try {
      setLoading(true);
      const data = await pedagogicoService.getPlanosDeAula(turmaId);
      setPlanos(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Ignorando erro se a tabela não existir, pois acabamos de implementar
    } finally {
      setLoading(false);
    }
  };

  const handleGerarIA = async () => {
    if (!temaIA.trim() || !selectedTurma) return;
    
    setGerandoIA(true);
    try {
      const turmaInfo = turmas.find(t => t.id === selectedTurma);
      const planoGerado = await pedagogicoService.gerarPlanoIA(temaIA, turmaInfo?.nome || "");
      
      // Salva no banco o plano gerado
      await pedagogicoService.criarPlanoDeAula({
        turma_id: selectedTurma,
        titulo: planoGerado.titulo || temaIA,
        conteudo: planoGerado.conteudo,
        habilidades_bncc: planoGerado.habilidades_bncc,
        objetivos: planoGerado.objetivos,
        duracao: planoGerado.duracao || "1 aula",
        recursos: planoGerado.recursos,
        metodologia: planoGerado.metodologia,
        avaliacao: planoGerado.avaliacao,
        data_prevista: new Date().toISOString().split('T')[0],
        status: 'Planejado'
      });

      toast({ title: "Sucesso!", description: "Plano gerado com Inteligência Artificial e salvo." });
      setModalIAOpen(false);
      setTemaIA("");
      loadPlanos(selectedTurma);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({ title: "Erro na IA", description: error.message, variant: "destructive" });
    } finally {
      setGerandoIA(false);
    }
  };

  if (loading && turmas.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-down pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Planejamento</h1>
          <p className="text-slate-500 mt-1">Crie e gerencie os planos de aula das suas turmas</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={modalIAOpen} onOpenChange={setModalIAOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-200">
                <Sparkles className="w-4 h-4 mr-2" /> Gerar com IA
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-indigo-700">
                  <Sparkles className="w-5 h-5" /> Assistente de Planejamento (Gaia)
                </DialogTitle>
                <DialogDescription>
                  Descreva o tema da aula. A IA analisará a turma e criará o plano baseado na BNCC.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Turma Alvo</Label>
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
                  <Label>Tema ou Conteúdo da Aula</Label>
                  <Textarea 
                    placeholder="Ex: Revolução Industrial com foco nos impactos sociais..." 
                    value={temaIA}
                    onChange={(e) => setTemaIA(e.target.value)}
                    className="h-24 resize-none"
                  />
                </div>
              </div>
              <Button 
                onClick={handleGerarIA} 
                disabled={gerandoIA || !temaIA.trim() || !selectedTurma}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {gerandoIA ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {gerandoIA ? "Mapeando BNCC e gerando plano..." : "Gerar Plano Estruturado"}
              </Button>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <Plus className="w-4 h-4 mr-2" /> Novo Manual
          </Button>
        </div>
      </div>

      <div className="mb-8 max-w-xs">
        <Label className="text-slate-500 mb-2 block">Filtrar por Turma</Label>
        <Select value={selectedTurma} onValueChange={setSelectedTurma}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Selecione a turma" />
          </SelectTrigger>
          <SelectContent>
            {turmas.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white/50 border border-dashed border-slate-300 rounded-2xl">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-700">Nenhum plano encontrado</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Você ainda não tem aulas planejadas para esta turma.
            </p>
            <Button variant="outline" onClick={() => setModalIAOpen(true)}>
              Criar o primeiro plano com IA
            </Button>
          </div>
        ) : (
          planos.map(plano => (
            <Card key={plano.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/60 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-1 rounded-md mb-2">
                    {new Date(plano.data_prevista).toLocaleDateString('pt-BR')}
                  </div>
                  {plano.id_atividade_gerada && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      Lançado
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 line-clamp-2">
                  {plano.titulo}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {plano.objetivos || "Sem objetivos definidos."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Duração: {plano.duracao || "-"}</span>
                  </div>
                  {plano.habilidades_bncc && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span className="truncate">BNCC: {plano.habilidades_bncc}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <Button variant="ghost" className="flex-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    Detalhes
                  </Button>
                  {!plano.id_atividade_gerada && (
                    <Button variant="secondary" className="flex-1">
                      Lançar Atividade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
