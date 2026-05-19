import React, { useState, useEffect } from "react";
import { pedagogicoService, Turma } from "@/services/pedagogicoService";
import { PlanoDeAula } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CheckCircle, Clock, Save, FileEdit, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DiarioClasse() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [planos, setPlanos] = useState<PlanoDeAula[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Estado local para editar os diários
  const [diarios, setDiarios] = useState<Record<string, string>>({});

  const { toast } = useToast();

  useEffect(() => {
    loadTurmas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTurma) loadPlanos(selectedTurma);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTurma]);

  const loadTurmas = async () => {
    try {
      const data = await pedagogicoService.getTurmasProfessor();
      setTurmas(data);
      if (data.length > 0) setSelectedTurma(data[0].id);
    } catch (error) {
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
      const novosDiarios: Record<string, string> = {};
      data.forEach(p => {
        novosDiarios[p.id] = p.diario_registro ?? '';
      });
      setDiarios(novosDiarios);
    } catch {
      toast({ title: "Aviso", description: "Tabela de planos pode não existir." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (plano: PlanoDeAula) => {
    const texto = diarios[plano.id];
    if (!texto) return;
    setSavingId(plano.id);
    try {
      await pedagogicoService.upsertDiario(plano.id, texto);
      toast({ title: "Sucesso", description: "Registro salvo no diário!" });
      setPlanos(prev => prev.map(p => p.id === plano.id ? { ...p, status: 'Ministrada', diario_registro: texto } : p));
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar diário", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-down pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Diário de Classe</h1>
          <p className="text-slate-500 mt-1">Registre o que foi ministrado, observações e ocorrências das aulas</p>
        </div>
      </div>

      <div className="mb-8 max-w-xs">
        <Label className="text-slate-500 mb-2 block font-bold tracking-wider uppercase text-xs">Filtrar por Turma</Label>
        <Select value={selectedTurma} onValueChange={setSelectedTurma}>
          <SelectTrigger className="bg-white border-slate-200 h-12">
            <SelectValue placeholder="Selecione a turma" />
          </SelectTrigger>
          <SelectContent>
            {turmas.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : planos.length === 0 ? (
        <div className="py-24 text-center bg-white/50 border border-dashed border-slate-300 rounded-3xl">
          <FileEdit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Nenhum plano encontrado</h3>
          <p className="text-slate-500 mt-1">Crie planos de aula primeiro para poder registrá-los no diário.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {planos.map(plano => (
            <Card key={plano.id} className={`border-l-4 transition-all ${plano.status === 'Ministrada' ? 'border-l-emerald-500 bg-emerald-50/30' : 'border-l-orange-500 bg-white hover:shadow-md'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Resumo do Plano */}
                  <div className="w-full lg:w-1/3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                        {new Date(plano.data_prevista).toLocaleDateString('pt-BR')}
                      </span>
                      {plano.status === 'Ministrada' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-100 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Concluído
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{plano.titulo}</h3>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" /> {plano.duracao || "1 aula"}
                    </div>
                  </div>

                  {/* Campo do Diário */}
                  <div className="w-full lg:w-2/3 flex flex-col gap-3">
                    <Label className="text-slate-700 font-bold">Registro da Aula</Label>
                    <Textarea 
                      placeholder="Descreva o que foi lecionado, atividades extras e observações sobre o comportamento da turma..."
                      value={diarios[plano.id]}
                      onChange={(e) => setDiarios({ ...diarios, [plano.id]: e.target.value })}
                      className="resize-none h-24 bg-slate-50 border-slate-200"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleSave(plano)} 
                        disabled={savingId === plano.id || !diarios[plano.id]}
                        className={plano.status === 'Ministrada' ? "bg-slate-800 hover:bg-slate-900" : "bg-orange-600 hover:bg-orange-700"}
                      >
                        {savingId === plano.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {plano.status === 'Ministrada' ? 'Atualizar Registro' : 'Salvar Diário'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
