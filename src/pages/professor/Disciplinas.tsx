import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pedagogicoService, Turma, Disciplina } from "@/services/pedagogicoService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Trash2, Loader2, Search, GraduationCap } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export default function Disciplinas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  // Form
  const [nomeDisciplina, setNomeDisciplina] = useState("");
  const [turmaNova, setTurmaNova] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Disciplinas | Hemera";
    loadTurmas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTurma) loadDisciplinas(selectedTurma);
    else setDisciplinas([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTurma]);

  const loadTurmas = async () => {
    try {
      const data = await pedagogicoService.getTurmasProfessor();
      setTurmas(data);
      if (data.length > 0) {
        setSelectedTurma(data[0].id);
        setTurmaNova(data[0].id);
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar turmas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadDisciplinas = async (turmaId: string) => {
    setLoading(true);
    try {
      const data = await pedagogicoService.getDisciplinasTurma(turmaId);
      setDisciplinas(data);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar disciplinas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!nomeDisciplina.trim() || !turmaNova) {
      toast({ title: "Erro", description: "Preencha o nome e selecione a turma.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("disciplinas").insert([{
        nome: nomeDisciplina.trim(),
        turma_id: turmaNova,
        professor_id: userData.user.id,
      }]);
      if (error) throw error;

      toast({ title: "Sucesso!", description: `Disciplina "${nomeDisciplina}" criada.` });
      setModalOpen(false);
      setNomeDisciplina("");
      if (turmaNova === selectedTurma) loadDisciplinas(selectedTurma);
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Falha ao criar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("disciplinas").delete().eq("id", id);
      if (error) throw error;
      setDisciplinas(prev => prev.filter(d => d.id !== id));
      toast({ title: "Excluído", description: `"${nome}" removida.` });
    } catch {
      toast({ title: "Erro", description: "Falha ao excluir disciplina.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const disciplinasFiltradas = disciplinas.filter(d =>
    d.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const turmaSelecionada = turmas.find(t => t.id === selectedTurma);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Disciplinas</h1>
          <p className="text-slate-500 mt-1">Gerencie as matérias das suas turmas</p>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button id="btn-nova-disciplina" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
              <Plus className="w-4 h-4 mr-2" /> Nova Disciplina
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Disciplina</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Disciplina</Label>
                <Input
                  id="input-nome-disciplina"
                  value={nomeDisciplina}
                  onChange={e => setNomeDisciplina(e.target.value)}
                  placeholder="Ex: Matemática, Português, História..."
                />
              </div>
              <div className="space-y-2">
                <Label>Turma</Label>
                <Select value={turmaNova} onValueChange={setTurmaNova}>
                  <SelectTrigger id="select-turma-disciplina">
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {turmas.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              id="btn-salvar-disciplina"
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Criar Disciplina
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="max-w-xs w-full">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Turma</Label>
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
        <div className="flex-1 max-w-sm">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar disciplina..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : turmas.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 rounded-3xl">
          <GraduationCap className="w-14 h-14 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhuma turma encontrada</h3>
          <p className="text-slate-500 mb-4">Crie uma turma primeiro para poder adicionar disciplinas.</p>
          <Button variant="outline" onClick={() => navigate("/professor/turmas/nova")}>
            Criar Turma
          </Button>
        </div>
      ) : disciplinasFiltradas.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 rounded-3xl">
          <BookOpen className="w-14 h-14 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            {busca ? "Nenhuma disciplina encontrada" : `Nenhuma disciplina em ${turmaSelecionada?.nome}`}
          </h3>
          <p className="text-slate-500 mb-4">
            {busca ? "Tente um termo diferente." : "Adicione a primeira disciplina desta turma."}
          </p>
          {!busca && (
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Disciplina
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disciplinasFiltradas.map(d => (
            <Card
              key={d.id}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/60 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/professor/turmas/${d.turma_id}`)}
            >
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-blue-400" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{d.nome}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {turmas.find(t => t.id === d.turma_id)?.nome ?? "Turma"}
                      </p>
                    </div>
                  </div>
                  <button
                    id={`btn-deletar-${d.id}`}
                    onClick={e => { e.stopPropagation(); handleDelete(d.id, d.nome); }}
                    disabled={deletingId === d.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    {deletingId === d.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
