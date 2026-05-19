import React, { useState, useEffect } from "react";
import { pedagogicoService, Turma, Atividade } from "@/services/pedagogicoService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Plus, Calendar, Save, Trash2, Loader2, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Avaliacoes() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Novo formulário
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [valorMaximo, setValorMaximo] = useState("10");

  const { toast } = useToast();

  useEffect(() => {
    loadTurmas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTurma) loadAtividades(selectedTurma);
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

  const loadAtividades = async (turmaId: string) => {
    try {
      setLoading(true);
      const data = await pedagogicoService.getAtividadesTurma(turmaId);
      setAtividades(data);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar avaliações", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!titulo || !dataEntrega) {
      toast({ title: "Erro", description: "Preencha o título e a data de entrega.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await pedagogicoService.criarAtividade({
        titulo,
        descricao,
        data_entrega: dataEntrega,
        disciplina_id: 'geral', // Simplificação para o contexto atual
        turma_id: selectedTurma,
        // No schema original não adicionamos valorMaximo na Interface, mas aqui supomos que exista
      });

      toast({ title: "Sucesso!", description: "Avaliação cadastrada. Ela já aparecerá no seu Gradebook." });
      setModalOpen(false);
      setTitulo("");
      setDescricao("");
      setDataEntrega("");
      loadAtividades(selectedTurma);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao criar avaliação.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-down pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Avaliações</h1>
          <p className="text-slate-500 mt-1">Crie provas, trabalhos e acompanhe as métricas no Gradebook</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                <Plus className="w-4 h-4 mr-2" /> Nova Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Avaliação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Prova Bimestral 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Aplicação/Entrega</Label>
                    <Input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Peso/Valor Máximo</Label>
                    <Input type="number" value={valorMaximo} onChange={e => setValorMaximo(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição / Instruções</Label>
                  <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Critérios de avaliação..." />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={saving} className="w-full bg-indigo-600">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Avaliação
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-8 max-w-xs">
        <Label className="text-slate-500 mb-2 block font-bold text-xs uppercase tracking-wider">Turma Alvo</Label>
        <Select value={selectedTurma} onValueChange={setSelectedTurma}>
          <SelectTrigger className="bg-white border-slate-200">
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
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : atividades.length === 0 ? (
        <div className="py-24 text-center bg-white/50 border border-dashed border-slate-300 rounded-3xl">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Nenhuma avaliação encontrada</h3>
          <p className="text-slate-500 mt-1 mb-4">Adicione uma prova ou trabalho para começar a avaliar.</p>
          <Button variant="outline" onClick={() => setModalOpen(true)}>Criar primeira avaliação</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {atividades.map(ativ => (
            <Card key={ativ.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/60 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-1 rounded-md mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(ativ.data_entrega).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1">{ativ.titulo}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
                  {ativ.descricao || "Sem descrição."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <Button variant="ghost" className="flex-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    Editar
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => window.location.href='/professor/gradebook'}>
                    Lançar Notas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
