import React, { useState, useEffect } from "react";
import { pedagogicoService, Turma, Aluno } from "@/services/pedagogicoService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock, Save, UserCheck, CalendarDays, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Frequencia() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // true = presente, false = ausente, null = não marcado
  const [presencas, setPresencas] = useState<Record<string, boolean | null>>({});
  const [dataAula, setDataAula] = useState(new Date().toISOString().split('T')[0]);

  const { toast } = useToast();

  useEffect(() => {
    loadTurmas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTurma) loadAlunos(selectedTurma);
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

  const loadAlunos = async (turmaId: string) => {
    try {
      setLoading(true);
      const data = await pedagogicoService.getAlunosTurma(turmaId);
      setAlunos(data);
      
      // Reseta as presenças (todos presentes por padrão para facilitar)
      const initialPresencas: Record<string, boolean> = {};
      data.forEach(a => initialPresencas[a.id] = true);
      setPresencas(initialPresencas);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar alunos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const togglePresenca = (alunoId: string, status: boolean) => {
    setPresencas(prev => ({ ...prev, [alunoId]: status }));
  };

  const markAll = (status: boolean) => {
    const newPresencas: Record<string, boolean> = {};
    alunos.forEach(a => newPresencas[a.id] = status);
    setPresencas(newPresencas);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await pedagogicoService.registrarFrequencia(selectedTurma, dataAula, presencas as Record<string, boolean>);
      toast({ title: "Sucesso", description: "Diário de frequência salvo com sucesso." });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const totalPresentes = Object.values(presencas).filter(v => v === true).length;
  const totalAusentes = Object.values(presencas).filter(v => v === false).length;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-down pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Frequência</h1>
          <p className="text-slate-500 mt-1">Realize a chamada e controle a assiduidade dos alunos</p>
        </div>
        
        <div className="flex gap-3 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <CalendarDays className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="date" 
            value={dataAula}
            onChange={(e) => setDataAula(e.target.value)}
            className="border-none bg-transparent outline-none text-slate-700 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LADO ESQUERDO: CONTROLES */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Turma Alvo</label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <div className="text-emerald-500 mb-1"><CheckCircle2 className="w-5 h-5" /></div>
                <div className="text-2xl font-black text-emerald-700">{totalPresentes}</div>
                <div className="text-xs font-bold text-emerald-600 uppercase">Presentes</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <div className="text-red-500 mb-1"><XCircle className="w-5 h-5" /></div>
                <div className="text-2xl font-black text-red-700">{totalAusentes}</div>
                <div className="text-xs font-bold text-red-600 uppercase">Ausentes</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => markAll(true)}>
                Todos Presentes
              </Button>
              <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => markAll(false)}>
                Todos Ausentes
              </Button>
            </div>

            <Button 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 text-lg"
              onClick={handleSave}
              disabled={saving || alunos.length === 0}
            >
              {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              Salvar Diário
            </Button>
          </div>

          {/* LADO DIREITO: LISTA DE ALUNOS */}
          <div className="w-full lg:w-2/3">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-slate-50 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <p>Carregando alunos...</p>
              </div>
            ) : alunos.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <UserCheck className="w-12 h-12 text-slate-300" />
                <p>Nenhum aluno nesta turma.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-4 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aluno / Matrícula</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Presença</span>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
                  {alunos.map(aluno => (
                    <Card key={aluno.id} className={`transition-all duration-200 ${presencas[aluno.id] === false ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}>
                      <CardContent className="p-3 md:p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-sm">
                            {aluno.nome.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{aluno.nome}</p>
                            <p className="text-xs text-slate-500 font-mono">{aluno.matricula}</p>
                          </div>
                        </div>
                        
                        <div className="flex bg-slate-100 rounded-xl p-1">
                          <button
                            onClick={() => togglePresenca(aluno.id, true)}
                            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${presencas[aluno.id] === true ? 'bg-emerald-500 text-white shadow-md transform scale-105' : 'text-slate-400 hover:bg-slate-200'}`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => togglePresenca(aluno.id, false)}
                            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${presencas[aluno.id] === false ? 'bg-red-500 text-white shadow-md transform scale-105' : 'text-slate-400 hover:bg-slate-200'}`}
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
