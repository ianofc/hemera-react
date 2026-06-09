import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { pedagogicoService, Turma, Atividade, Aluno } from "@/services/pedagogicoService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Filter, Users, Percent, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const UNIDADES = [
  "Todas",
  "1ª Unidade",
  "2ª Unidade",
  "3ª Unidade",
  "4ª Unidade",
  "Recuperação",
  "Exame Final"
];

export default function GradebookReal() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [savingCell, setSavingCell] = useState<{ alunoId: string; atividadeId: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ alunoId: string; atividadeId: string } | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  
  // Filter & bulk grading states
  const [selectedUnidade, setSelectedUnidade] = useState<string>("Todas");
  const [selectedAtivMassa, setSelectedAtivMassa] = useState<string>("");
  const [notaMassa, setNotaMassa] = useState<string>("");
  const [savingMassa, setSavingMassa] = useState(false);

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [gradebookData, setGradebookData] = useState<{
    atividades: Atividade[];
    tabelaNotas: { aluno: Aluno; notas: { atividade_id: string; valor: number | null }[]; media: string }[];
  } | null>(null);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const myTurmas = await pedagogicoService.getTurmasProfessor();
      setTurmas(myTurmas);

      if (id) {
        const matrix = await pedagogicoService.getGradebookMatrix(id);
        setGradebookData(matrix);
      }
    } catch (error: unknown) {
      const err = error as { message?: string } | null;
      toast.error(err?.message || "Erro ao carregar Gradebook");
    } finally {
      setLoading(false);
    }
  };

  const matchesUnitFilter = (ativ: Atividade, filter: string) => {
    if (filter === "Todas") return true;
    const cleanTitle = ativ.titulo.toLowerCase();
    const filterLower = filter.toLowerCase();
    
    // Check if starts with [Unit] or contains unit text
    if (cleanTitle.startsWith(`[${filterLower}]`) || cleanTitle.includes(filterLower)) {
      return true;
    }
    
    // Check description
    if (ativ.descricao) {
      const descLower = ativ.descricao.toLowerCase();
      if (descLower.includes(`unidade: ${filterLower}`) || descLower.includes(filterLower)) {
        return true;
      }
    }
    return false;
  };

  const handleSaveNota = async (alunoId: string, atividadeId: string, oldValor: number | null) => {
    setEditingCell(null);
    const cleanVal = tempValue.trim().replace(",", ".");
    const floatVal = cleanVal !== "" ? Number(cleanVal) : null;
    
    if (floatVal !== null && isNaN(floatVal)) {
      toast.error("Por favor, digite um valor numérico válido.");
      return;
    }

    if (floatVal !== null && (floatVal < 0 || floatVal > 100)) {
      toast.error("A nota deve estar entre 0 e 100.");
      return;
    }

    const ativ = gradebookData?.atividades.find(a => a.id === atividadeId);
    if (ativ && floatVal !== null && floatVal > ativ.valor_maximo) {
      toast.error(`A nota excede o valor máximo da avaliação (${ativ.valor_maximo} pts).`);
      return;
    }

    if (floatVal === oldValor) return;

    setSavingCell({ alunoId, atividadeId });
    try {
      await pedagogicoService.registrarNota(alunoId, atividadeId, floatVal ?? 0);
      
      setGradebookData(prev => {
        if (!prev) return null;
        
        const newTabela = prev.tabelaNotas.map(linha => {
          if (linha.aluno.id !== alunoId) return linha;
          
          const newNotas = linha.notas.map(nota => {
            if (nota.atividade_id !== atividadeId) return nota;
            return { ...nota, valor: floatVal };
          });
          
          let soma = 0;
          let pesos = 0;
          newNotas.forEach(nota => {
            if (nota.valor !== null) {
              soma += Number(nota.valor);
              pesos += 1;
            }
          });
          const media = pesos > 0 ? (soma / pesos).toFixed(1) : '-';
          
          return { ...linha, notas: newNotas, media };
        });
        
        return { ...prev, tabelaNotas: newTabela };
      });
      
      toast.success("Nota atualizada com sucesso!");
    } catch (e: unknown) {
      toast.error("Falha ao registrar nota.");
    } finally {
      setSavingCell(null);
    }
  };

  const handleAtribuirMassa = async () => {
    if (!selectedAtivMassa) {
      toast.error("Selecione uma avaliação.");
      return;
    }
    if (notaMassa.trim() === "") {
      toast.error("Digite o valor da nota.");
      return;
    }

    const val = Number(notaMassa.replace(",", "."));
    if (isNaN(val) || val < 0) {
      toast.error("Digite uma nota numérica válida.");
      return;
    }

    const ativ = gradebookData?.atividades.find(a => a.id === selectedAtivMassa);
    if (ativ && val > ativ.valor_maximo) {
      toast.error(`A nota excede o valor máximo da avaliação (${ativ.valor_maximo} pts).`);
      return;
    }

    setSavingMassa(true);
    try {
      const alunosList = gradebookData?.tabelaNotas.map(l => l.aluno) || [];
      const promises = alunosList.map(aluno => 
        pedagogicoService.registrarNota(aluno.id, selectedAtivMassa, val)
      );
      await Promise.all(promises);

      setGradebookData(prev => {
        if (!prev) return null;
        
        const newTabela = prev.tabelaNotas.map(linha => {
          const newNotas = [...linha.notas];
          const index = newNotas.findIndex(n => n.atividade_id === selectedAtivMassa);
          if (index !== -1) {
            newNotas[index] = { ...newNotas[index], valor: val };
          } else {
            newNotas.push({ atividade_id: selectedAtivMassa, valor: val });
          }

          let soma = 0;
          let pesos = 0;
          newNotas.forEach(n => {
            if (n.valor !== null) {
              soma += Number(n.valor);
              pesos += 1;
            }
          });
          const media = pesos > 0 ? (soma / pesos).toFixed(1) : '-';

          return { ...linha, notas: newNotas, media };
        });

        return { ...prev, tabelaNotas: newTabela };
      });

      toast.success("Notas atribuídas em massa para todos os alunos!");
      setNotaMassa("");
      setSelectedAtivMassa("");
    } catch (e) {
      toast.error("Falha ao registrar notas em massa.");
    } finally {
      setSavingMassa(false);
    }
  };

  const selectedTurma = turmas.find((t) => t.id === id);
  const filteredAtividades = gradebookData?.atividades.filter(a => matchesUnitFilter(a, selectedUnidade)) || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
        <p>Carregando matriz de notas...</p>
      </div>
    );
  }

  if (!id || !selectedTurma) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-6 text-left">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 font-display">Gradebook (Lançamento de Notas)</h1>
        <p className="text-slate-500 mb-6 font-medium">Selecione uma de suas turmas para gerenciar a caderneta e boletins.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {turmas.map(t => (
            <Link key={t.id} to={`/professor/gradebook/turma/${t.id}`}>
              <Card className="hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">{t.nome}</CardTitle>
                  <p className="text-sm text-slate-500 font-semibold">{t.ano_letivo} - {t.periodo}</p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 text-left animate-fade-in-down">
      
      {/* Header Area */}
      <div className="flex items-center gap-4 mb-8 pt-6">
        <Link to="/professor/gradebook" className="text-slate-400 hover:text-slate-700 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Gradebook Interativo</h1>
          <p className="text-sm text-slate-500 font-bold">Turma: {selectedTurma.nome} ({selectedTurma.periodo})</p>
        </div>
      </div>

      {/* Toolbox Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Unit Selector Filter Card */}
        <Card className="border-slate-200 shadow-sm md:col-span-1">
          <CardContent className="pt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-400">
              <Filter className="w-4 h-4 text-indigo-500" />
              Filtrar por Unidade
            </div>
            <select
              value={selectedUnidade}
              onChange={e => setSelectedUnidade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {UNIDADES.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 font-semibold">Filtra as avaliações no boletim do ano letivo de acordo com a unidade da atividade.</p>
          </CardContent>
        </Card>

        {/* Mass Grading Card */}
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardContent className="pt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-400">
              <Users className="w-4 h-4 text-indigo-500" />
              Lançamento de Notas em Massa (Cortex Backport)
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedAtivMassa}
                onChange={e => setSelectedAtivMassa(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="">-- Selecione a Avaliação --</option>
                {gradebookData?.atividades.map(a => (
                  <option key={a.id} value={a.id}>{a.titulo} (Máx: {a.valor_maximo} pts)</option>
                ))}
              </select>

              <input 
                type="number"
                placeholder="Nota (Ex: 8.5)"
                value={notaMassa}
                onChange={e => setNotaMassa(e.target.value)}
                className="w-full sm:w-32 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />

              <Button 
                onClick={handleAtribuirMassa}
                disabled={savingMassa}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-xl text-xs"
              >
                {savingMassa ? "Atribuindo..." : "Atribuir a Todos"}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Atribui a nota especificada instantaneamente para todos os alunos matriculados nesta turma para a avaliação selecionada.</p>
          </CardContent>
        </Card>

      </div>

      {/* Gradebook Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[280px] font-extrabold text-slate-700">Aluno</TableHead>
                {filteredAtividades.map(ativ => (
                  <TableHead key={ativ.id} className="text-center font-extrabold text-slate-700 min-w-[120px]">
                    <div className="truncate" title={ativ.titulo}>{ativ.titulo}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      Máx: {ativ.valor_maximo} pts
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-extrabold text-indigo-600 bg-indigo-50/50 min-w-[100px]">Média Geral</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradebookData?.tabelaNotas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={filteredAtividades.length + 2} className="text-center text-slate-500 py-12 font-bold">
                    Nenhum aluno matriculado nesta turma ou sem registros cadastrados.
                  </TableCell>
                </TableRow>
              ) : (
                gradebookData?.tabelaNotas.map((linha) => (
                  <TableRow key={linha.aluno.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-semibold text-slate-800">
                      <div className="truncate" title={linha.aluno.nome}>{linha.aluno.nome}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">{linha.aluno.matricula || "Sem matrícula"}</div>
                    </TableCell>
                    
                    {/* Filtered grades */}
                    {linha.notas
                      .filter(n => filteredAtividades.some(fa => fa.id === n.atividade_id))
                      .map((n) => {
                        const isSaving = savingCell?.alunoId === linha.aluno.id && savingCell?.atividadeId === n.atividade_id;
                        const isEditing = editingCell?.alunoId === linha.aluno.id && editingCell?.atividadeId === n.atividade_id;

                        return (
                          <TableCell key={n.atividade_id} className="text-center">
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-500 mx-auto" />
                            ) : isEditing ? (
                              <input 
                                type="text"
                                value={tempValue}
                                onChange={e => setTempValue(e.target.value)}
                                onBlur={() => handleSaveNota(linha.aluno.id, n.atividade_id, n.valor)}
                                onKeyDown={e => e.key === "Enter" && handleSaveNota(linha.aluno.id, n.atividade_id, n.valor)}
                                className="w-16 bg-white border border-indigo-500 text-center font-extrabold text-slate-800 text-xs py-1 rounded focus:ring-1 focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <span 
                                onClick={() => {
                                  setEditingCell({ alunoId: linha.aluno.id, atividadeId: n.atividade_id });
                                  setTempValue(n.valor !== null ? n.valor.toString() : "");
                                }}
                                className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer transition select-none ${
                                  n.valor === null 
                                    ? 'text-slate-350 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent border-dashed hover:border-indigo-300' 
                                    : 'text-indigo-950 bg-indigo-50/70 hover:bg-indigo-100/70'
                                }`}
                              >
                                {n.valor !== null ? n.valor.toFixed(1) : '-'}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}

                    {/* Student Average */}
                    <TableCell className="text-center font-extrabold text-indigo-700 bg-indigo-50/20">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        linha.media !== '-' && Number(linha.media) >= 6.0 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : linha.media !== '-' ? 'bg-red-50 text-red-700' : 'text-slate-400'
                      }`}>
                        {linha.media}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Informative Footer */}
      <div className="flex gap-2 items-center bg-slate-50 p-4 border rounded-2xl border-slate-200 mt-6 text-slate-500 font-semibold text-xs leading-relaxed">
        <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
        <p>
          <strong>Dica do Professor:</strong> Clique em qualquer nota acima para abrir o campo de edição. Ao digitar o valor e apertar <em>Enter</em> ou clicar fora, a nota será sincronizada automaticamente com o Supabase e as médias recalculadas.
        </p>
      </div>

    </div>
  );
}
