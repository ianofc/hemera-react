import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { pedagogicoService, Turma, Atividade, Aluno } from "@/services/pedagogicoService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft } from "lucide-react";

export default function GradebookReal() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [gradebookData, setGradebookData] = useState<{
    atividades: Atividade[];
    tabelaNotas: { aluno: Aluno; notas: { atividade_id: string; valor: number | null }[]; media: string }[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carrega turmas para o seletor (caso precise)
      const myTurmas = await pedagogicoService.getTurmasProfessor();
      setTurmas(myTurmas);

      if (id) {
        const matrix = await pedagogicoService.getGradebookMatrix(id);
        setGradebookData(matrix);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar Gradebook");
    } finally {
      setLoading(false);
    }
  };

  const selectedTurma = turmas.find((t) => t.id === id);

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
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gradebook</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {turmas.map(t => (
            <Link key={t.id} to={`/professor/gradebook/turma/${t.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">{t.nome}</CardTitle>
                  <p className="text-sm text-slate-500">{t.ano_letivo} - {t.periodo}</p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-down">
      <div className="flex items-center gap-4 mb-8 pt-6">
        <Link to="/professor/gradebook" className="text-slate-400 hover:text-slate-700 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gradebook</h1>
          <p className="text-sm text-slate-500">Turma: {selectedTurma.nome} ({selectedTurma.periodo})</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[250px] font-bold text-slate-700">Aluno</TableHead>
                {gradebookData?.atividades.map(ativ => (
                  <TableHead key={ativ.id} className="text-center font-bold text-slate-700 min-w-[100px]">
                    <div className="truncate" title={ativ.titulo}>{ativ.titulo}</div>
                    <div className="text-xs text-slate-400 font-normal">
                      {new Date(ativ.data_entrega).toLocaleDateString('pt-BR')}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-indigo-600 bg-indigo-50/50">Média</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradebookData?.tabelaNotas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={(gradebookData?.atividades.length || 0) + 2} className="text-center text-slate-500 py-8">
                    Nenhum aluno matriculado nesta turma ou sem registros.
                  </TableCell>
                </TableRow>
              )}
              {gradebookData?.tabelaNotas.map((linha) => (
                <TableRow key={linha.aluno.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-800">
                    <div className="truncate" title={linha.aluno.nome}>{linha.aluno.nome}</div>
                    <div className="text-xs text-slate-400">{linha.aluno.matricula || "Sem matrícula"}</div>
                  </TableCell>
                  {linha.notas.map((n, i) => (
                    <TableCell key={i} className="text-center">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${n.valor === null ? 'text-slate-300' : 'text-slate-700 bg-slate-100'}`}>
                        {n.valor !== null ? n.valor.toFixed(1) : '-'}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-indigo-700 bg-indigo-50/30">
                    {linha.media}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
