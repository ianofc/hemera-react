import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MockScreen from "@/components/MockScreen";
import { bibliotecaApi, cursosApi, areaEscolarApi } from "@/lib/mockApi";
import type { SeedLivro, SeedCurso, SeedModulo, SeedEvento } from "@/data/seed";
import { useToast } from "@/hooks/use-toast";
import { FileText, Check, Copy, Download, Printer, Landmark, DollarSign, Wallet, ShieldAlert, Award, FileSpreadsheet, Eye, FileDigit } from "lucide-react";

// ============ BIBLIOTECA ============

export const BibliotecaLista = ({ basePath = "/aluno/biblioteca", accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const [items, setItems] = useState<SeedLivro[] | null>(null);
  useEffect(() => { bibliotecaApi.list().then(setItems); }, []);
  const rows = (items || []).map((l) => ({
    id: l.id,
    cols: [l.titulo, l.autor, l.categoria, l.isbn, l.status, `${l.emprestimos}`],
  }));
  return (
    <MockScreen
      title="Biblioteca" subtitle="Acervo digital e físico" icon="fa-book-bookmark" variant="list" accent={accent}
      columns={["Título", "Autor", "Categoria", "ISBN", "Status", "Empréstimos"]}
      filters={["Disponível", "Emprestado", "Reservado"]}
      filterColumnIndex={4}
      searchPlaceholder="Buscar título, autor ou ISBN..."
      rows={rows}
      rowHrefBase={basePath}
      pageSize={8}
      storageKey="biblioteca"
      emptyTitle={items === null ? "Carregando acervo..." : "Acervo vazio"}
      emptyHint="Quando livros forem adicionados, aparecerão aqui."
    />
  );
};

export const BibliotecaDetalhe = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const { id } = useParams();
  const [livro, setLivro] = useState<SeedLivro | undefined | null>(null);
  useEffect(() => { if (id) bibliotecaApi.get(id).then((l) => setLivro(l ?? undefined)); }, [id]);
  if (livro === null) return <MockScreen title="Carregando..." icon="fa-book" variant="detail" accent={accent} />;
  if (!livro) return (
    <MockScreen title="Livro não encontrado" icon="fa-circle-exclamation" variant="detail" accent={accent}
      detail={{ resumo: "O livro solicitado não está mais disponível ou o link está incorreto." }} />
  );
  return (
    <MockScreen
      title={livro.titulo} subtitle={`${livro.autor} · ${livro.categoria}`} icon="fa-book" variant="detail" accent={accent}
      detail={{
        resumo: `Obra clássica disponibilizada pela Biblioteca Hemera. Status atual: ${livro.status}.`,
        fields: [
          { k: "Autor", v: livro.autor }, { k: "Categoria", v: livro.categoria }, { k: "ISBN", v: livro.isbn },
          { k: "Status", v: livro.status }, { k: "Empréstimos", v: String(livro.emprestimos) }, { k: "ID", v: livro.id },
        ],
        timeline: [
          { titulo: "Devolvido por aluno", quando: "ontem" },
          { titulo: "Reservado", quando: "há 3 dias" },
        ],
      }}
    />
  );
};

// ============ CURSOS / AVA ============

export const CursosLista = ({ basePath = "/aluno/cursos", accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const [items, setItems] = useState<SeedCurso[] | null>(null);
  useEffect(() => { cursosApi.list().then(setItems); }, []);
  const rows = (items || []).map((c) => ({
    id: c.id,
    cols: [c.titulo, c.categoria, c.nivel, `${c.cargaHoraria}h`, `${c.modulos} mód.`, c.alunosInscritos, c.status],
  }));
  return (
    <MockScreen
      title="Cursos · AVA" subtitle="Ambiente Virtual de Aprendizagem" icon="fa-graduation-cap" variant="list" accent={accent}
      columns={["Curso", "Categoria", "Nível", "Carga", "Módulos", "Inscritos", "Status"]}
      filters={["Aberto", "Em breve", "Encerrado"]}
      filterColumnIndex={6}
      searchPlaceholder="Buscar curso..."
      rows={rows}
      rowHrefBase={basePath}
      pageSize={8}
      storageKey="cursos"
      emptyTitle={items === null ? "Carregando catálogo..." : "Nenhum curso disponível"}
    />
  );
};

export const CursoDetalhe = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const { id } = useParams();
  const [curso, setCurso] = useState<SeedCurso | undefined | null>(null);
  const [mods, setMods] = useState<SeedModulo[]>([]);
  const [prog, setProg] = useState<{ percent: number; totalAulas: number } | null>(null);
  useEffect(() => {
    if (!id) return;
    cursosApi.get(id).then((c) => setCurso(c ?? undefined));
    cursosApi.modulos(id).then(setMods);
    cursosApi.progresso(id).then((p) => setProg({ percent: p.percent, totalAulas: p.totalAulas }));
  }, [id]);
  if (curso === null) return <MockScreen title="Carregando..." icon="fa-graduation-cap" variant="detail" accent={accent} />;
  if (!curso) return (
    <MockScreen title="Curso não encontrado" icon="fa-circle-exclamation" variant="detail" accent={accent}
      detail={{ resumo: "Este curso pode ter sido encerrado ou o link está incorreto." }} />
  );
  return (
    <MockScreen
      title={curso.titulo} subtitle={`${curso.categoria} · ${curso.nivel} · ${curso.cargaHoraria}h`}
      icon="fa-graduation-cap" variant="detail" accent={accent}
      detail={{
        resumo: `Curso ${curso.nivel.toLowerCase()} de ${curso.categoria}. ${curso.alunosInscritos} alunos inscritos. Progresso simulado: ${prog?.percent ?? 0}%.`,
        fields: [
          { k: "Instrutor", v: curso.instrutor }, { k: "Módulos", v: String(curso.modulos) },
          { k: "Carga horária", v: `${curso.cargaHoraria}h` }, { k: "Inscritos", v: String(curso.alunosInscritos) },
          { k: "Status", v: curso.status }, { k: "Total de aulas", v: String(prog?.totalAulas ?? "—") },
        ],
        timeline: mods.slice(0, 6).map((m) => ({ titulo: m.titulo, quando: `${m.aulas} aulas · ${m.duracao}` })),
      }}
    />
  );
};

// ============ ÁREA ESCOLAR ============

export const AreaEscolarPainel = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => (
  <MockScreen
    title="Área Escolar" subtitle="Secretaria, financeiro e calendário" icon="fa-school-flag" variant="dashboard" accent={accent}
    stats={[
      { label: "Eventos no mês", value: "5", icon: "fa-calendar" },
      { label: "Documentos", value: "3", icon: "fa-file-lines" },
      { label: "Mensalidade", value: "R$ 980", icon: "fa-coins" },
      { label: "Status financeiro", value: "Em aberto", icon: "fa-circle-check" },
    ]}
  />
);

export const AreaEscolarEventos = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const [items, setItems] = useState<SeedEvento[] | null>(null);
  useEffect(() => { areaEscolarApi.eventos().then(setItems); }, []);
  return (
    <MockScreen
      title="Calendário Escolar" icon="fa-calendar-days" variant="list" accent={accent}
      columns={["Evento", "Tipo", "Data", "Local"]}
      filters={["Reunião", "Evento", "Avaliação", "Calendário"]}
      filterColumnIndex={1}
      rows={(items || []).map((e) => ({ id: e.id, cols: [e.titulo, e.tipo, e.data, e.local] }))}
      pageSize={10}
      storageKey="ae_eventos"
      emptyTitle={items === null ? "Carregando..." : "Sem eventos cadastrados"}
    />
  );
};

export const AreaEscolarSecretaria = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<{ id: string; titulo: string; prazo: string }[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<{ id: string; titulo: string; prazo: string; data: string; status: string }[]>(() => {
    const saved = localStorage.getItem("hemera_secretaria_solicitacoes");
    return saved ? JSON.parse(saved) : [];
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; titulo: string; prazo: string } | null>(null);

  useEffect(() => {
    areaEscolarApi.secretaria().then((data) => setItems(data || []));
  }, []);

  const handleSolicitar = (doc: { id: string; titulo: string; prazo: string }) => {
    setSelectedDoc(doc);
    setConfirmModalOpen(true);
  };

  const confirmSolicitacao = () => {
    if (!selectedDoc) return;
    const novaSolicitacao = {
      id: "sol_" + Date.now(),
      titulo: selectedDoc.titulo,
      prazo: selectedDoc.prazo,
      data: new Date().toLocaleDateString("pt-BR"),
      status: "Pendente (2 dias)"
    };
    const nextSolicitacoes = [novaSolicitacao, ...solicitacoes];
    setSolicitacoes(nextSolicitacoes);
    localStorage.setItem("hemera_secretaria_solicitacoes", JSON.stringify(nextSolicitacoes));
    setConfirmModalOpen(false);
    
    toast({
      title: "Solicitação Recebida!",
      description: `Sua solicitação de "${selectedDoc.titulo}" está sendo processada pela secretaria.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-island rounded-3xl mb-8 text-left">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 text-white shadow-neon rounded-2xl bg-gradient-to-br from-aurora-primary to-aurora-secondary">
            <i className="text-xl fas fa-folder-open" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Secretaria Virtual</h1>
            <p className="text-sm text-slate-500">Solicite e acompanhe seus documentos escolares</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Lista de Documentos Disponíveis */}
        <div className="lg:col-span-2 p-6 glass-island rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-slate-800 font-display mb-2">Documentos Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((doc) => (
              <div key={doc.id} className="p-4 border bg-white/60 border-slate-200/50 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">{doc.titulo}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prazo: {doc.prazo}</p>
                </div>
                <button
                  onClick={() => handleSolicitar(doc)}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Solicitar Documento
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Minhas Solicitações */}
        <div className="p-6 glass-island rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-slate-800 font-display">Minhas Solicitações</h3>
          {solicitacoes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-250 rounded-2xl bg-white/30">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold">Nenhuma solicitação recente</p>
              <p className="text-[10px] text-slate-400 leading-normal mt-0.5 px-6">Os documentos solicitados aparecerão nesta lista.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitacoes.map((sol) => (
                <div key={sol.id} className="p-3 border bg-white/60 border-white/80 rounded-xl space-y-1.5 shadow-sm">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{sol.titulo}</h4>
                    <span className="shrink-0 bg-amber-100 text-amber-850 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-amber-250">{sol.status}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>Solicitado em: {sol.data}</span>
                    <span>Prazo: {sol.prazo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Confirmacao */}
      {confirmModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full space-y-4 relative border border-slate-100 animate-fade-in text-left">
            <h3 className="font-extrabold text-base text-slate-800 font-display">Confirmar Solicitação</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Você está solicitando o documento <strong>"{selectedDoc.titulo}"</strong>. O prazo estimado de entrega pela coordenação escolar é de <strong>{selectedDoc.prazo}</strong>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                onClick={confirmSolicitacao}
                className="flex-grow px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AreaEscolarFinanceiro = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => {
  const { toast } = useToast();
  const [faturas, setFaturas] = useState<{ id: string; descricao: string; venc: string; valor: string; status: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States de Modais
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedFaturaPix, setSelectedFaturaPix] = useState<{ id: string; descricao: string; valor: string } | null>(null);
  const [boletoModalOpen, setBoletoModalOpen] = useState(false);
  const [selectedFaturaBoleto, setSelectedFaturaBoleto] = useState<{ id: string; descricao: string; venc: string; valor: string } | null>(null);

  // Carregar/Persistir do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hemera_financeiro_faturas");
    if (saved) {
      setFaturas(JSON.parse(saved));
      setIsLoading(false);
    } else {
      areaEscolarApi.financeiro().then((data) => {
        const mapped = (data || []).map(item => ({
          id: item.id,
          descricao: item.descricao,
          venc: item.venc,
          valor: item.valor,
          status: item.status
        }));
        setFaturas(mapped);
        localStorage.setItem("hemera_financeiro_faturas", JSON.stringify(mapped));
        setIsLoading(false);
      });
    }
  }, []);

  const handleOpenPix = (fat: { id: string; descricao: string; valor: string }) => {
    setSelectedFaturaPix(fat);
    setPixModalOpen(true);
  };

  const handleOpenBoleto = (fat: { id: string; descricao: string; venc: string; valor: string }) => {
    setSelectedFaturaBoleto(fat);
    setBoletoModalOpen(true);
  };

  const confirmPayment = () => {
    if (!selectedFaturaPix) return;
    const nextFaturas = faturas.map(f => f.id === selectedFaturaPix.id ? { ...f, status: "Pago" } : f);
    setFaturas(nextFaturas);
    localStorage.setItem("hemera_financeiro_faturas", JSON.stringify(nextFaturas));
    setPixModalOpen(false);

    toast({
      title: "Pagamento Confirmado!",
      description: `A mensalidade "${selectedFaturaPix.descricao}" foi quitada via Pix simulado com sucesso.`,
    });
  };

  const handleDownloadBoleto = () => {
    toast({
      title: "Boleto Baixado!",
      description: "O PDF fictício do boleto foi baixado para o seu dispositivo.",
    });
    setBoletoModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 animate-fade-in-down">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-island rounded-3xl mb-8 text-left">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 text-white shadow-neon rounded-2xl bg-gradient-to-br from-aurora-primary to-aurora-secondary">
            <i className="text-xl fas fa-coins" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Financeiro</h1>
            <p className="text-sm text-slate-500">Acompanhe e efetue pagamentos de mensalidades</p>
          </div>
        </div>
      </header>

      {/* Lista de Faturas */}
      <div className="p-6 glass-island rounded-3xl text-left space-y-4">
        <h3 className="text-lg font-bold text-slate-800 font-display mb-2">Mensalidades</h3>
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Carregando financeiro...</div>
        ) : faturas.length === 0 ? (
          <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-2xl bg-white/40">
            Nenhum lançamento financeiro em sua ficha.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/30">
            <table className="w-full text-sm">
              <thead className="bg-white/40 border-b border-slate-150">
                <tr className="text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="px-5 py-3.5 text-left">Descrição</th>
                  <th className="px-5 py-3.5 text-left">Vencimento</th>
                  <th className="px-5 py-3.5 text-left">Valor</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/50">
                {faturas.map((fat) => (
                  <tr key={fat.id} className="hover:bg-white/40 transition">
                    <td className="px-5 py-4 font-bold text-slate-700">{fat.descricao}</td>
                    <td className="px-5 py-4 text-slate-550 font-semibold">{fat.venc}</td>
                    <td className="px-5 py-4 text-slate-850 font-bold">{fat.valor}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        fat.status === "Pago" 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {fat.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right flex justify-end gap-2 text-xs">
                      {fat.status !== "Pago" ? (
                        <>
                          <button
                            onClick={() => handleOpenBoleto(fat)}
                            className="px-3.5 py-2 font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1 shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" /> Boleto
                          </button>
                          <button
                            onClick={() => handleOpenPix(fat)}
                            className="px-3.5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition flex items-center gap-1 shadow-md"
                          >
                            <Wallet className="w-3.5 h-3.5" /> Pagar com Pix
                          </button>
                        </>
                      ) : (
                        <div className="text-slate-400 font-bold flex items-center gap-1 py-2 pr-2">
                          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Quitado
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal PIX */}
      {pixModalOpen && selectedFaturaPix && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full space-y-4 text-center relative border border-slate-100 animate-fade-in text-left">
            <h3 className="font-extrabold text-base text-slate-800 font-display text-center">Pagamento via Pix</h3>
            
            {/* SVG Simulado de QR Code */}
            <div className="w-44 h-44 mx-auto border-4 border-indigo-50 p-2 rounded-2xl bg-white flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="12" y="12" width="11" height="11" fill="currentColor" />
                <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="77" y="12" width="11" height="11" fill="currentColor" />
                <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="12" y="77" width="11" height="11" fill="currentColor" />
                {/* Random Pix patterns */}
                <rect x="40" y="15" width="12" height="6" fill="currentColor" />
                <rect x="55" y="20" width="6" height="12" fill="currentColor" />
                <rect x="45" y="45" width="20" height="20" fill="currentColor" />
                <rect x="15" y="45" width="12" height="12" fill="currentColor" />
                <rect x="45" y="75" width="15" height="8" fill="currentColor" />
                <rect x="75" y="45" width="8" height="20" fill="currentColor" />
                <rect x="75" y="75" width="12" height="12" fill="currentColor" />
              </svg>
            </div>

            <div className="space-y-1 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Valor a pagar</p>
              <p className="text-xl font-black text-indigo-600">{selectedFaturaPix.valor}</p>
              <p className="text-[10px] text-slate-500 font-bold">{selectedFaturaPix.descricao}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pix Copia e Cola</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  readOnly
                  value="00020101021226870014br.gov.bcb.pix2565qrhemera-instituicao-ensino"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-slate-500 outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("00020101021226870014br.gov.bcb.pix2565qrhemera-instituicao-ensino");
                    toast({ title: "Copiado!", description: "Chave Pix copiada com sucesso." });
                  }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-xl transition"
                  title="Copiar Código"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPixModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                onClick={confirmPayment}
                className="flex-grow px-4 py-2.5 text-xs font-bold text-white bg-[#4A76A8] hover:bg-indigo-650 rounded-xl transition shadow-md"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal BOLETO */}
      {boletoModalOpen && selectedFaturaBoleto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-4 text-left relative border border-slate-100 animate-fade-in">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 font-display flex items-center gap-1">
                <Landmark className="w-5 h-5 text-indigo-600" /> Ficha de Boleto Fictício
              </h3>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500 uppercase tracking-wider">Simulado</span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Beneficiário</span>
                  <strong className="text-slate-850">HEMERA OS EDUCACAO S.A.</strong>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CNPJ Beneficiário</span>
                  <strong className="text-slate-700">12.345.678/0001-90</strong>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vencimento</span>
                  <strong className="text-slate-800">{selectedFaturaBoleto.venc}</strong>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Valor do Documento</span>
                  <strong className="text-indigo-650 font-black">{selectedFaturaBoleto.valor}</strong>
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Descrição do lançamento</span>
                <p className="font-semibold text-slate-750">{selectedFaturaBoleto.descricao}</p>
              </div>

              {/* Código de barras simulado em SVG */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center justify-center space-y-2 select-none mt-2">
                <svg viewBox="0 0 100 12" className="w-full h-8 text-slate-850">
                  <rect x="0" width="1.5" height="12" fill="currentColor" />
                  <rect x="2" width="0.8" height="12" fill="currentColor" />
                  <rect x="3.5" width="2" height="12" fill="currentColor" />
                  <rect x="6" width="0.5" height="12" fill="currentColor" />
                  <rect x="7.5" width="1.2" height="12" fill="currentColor" />
                  <rect x="9.5" width="3" height="12" fill="currentColor" />
                  <rect x="13" width="0.8" height="12" fill="currentColor" />
                  <rect x="14.5" width="2.2" height="12" fill="currentColor" />
                  <rect x="17.5" width="1.5" height="12" fill="currentColor" />
                  <rect x="20" width="0.5" height="12" fill="currentColor" />
                  <rect x="21" width="3" height="12" fill="currentColor" />
                  <rect x="24.5" width="1.8" height="12" fill="currentColor" />
                  <rect x="27" width="0.8" height="12" fill="currentColor" />
                  <rect x="28.5" width="2" height="12" fill="currentColor" />
                  <rect x="31" width="1.5" height="12" fill="currentColor" />
                  <rect x="33" width="0.5" height="12" fill="currentColor" />
                  <rect x="34" width="2" height="12" fill="currentColor" />
                  <rect x="36.5" width="1.2" height="12" fill="currentColor" />
                  <rect x="38.5" width="3.5" height="12" fill="currentColor" />
                  <rect x="42.5" width="0.8" height="12" fill="currentColor" />
                  <rect x="44" width="2" height="12" fill="currentColor" />
                  <rect x="46.5" width="1" height="12" fill="currentColor" />
                  <rect x="48" width="0.5" height="12" fill="currentColor" />
                  <rect x="49" width="3" height="12" fill="currentColor" />
                  <rect x="52.5" width="1.5" height="12" fill="currentColor" />
                  <rect x="54.5" width="2" height="12" fill="currentColor" />
                  <rect x="57" width="0.8" height="12" fill="currentColor" />
                  <rect x="58" width="3.2" height="12" fill="currentColor" />
                  <rect x="62" width="1.5" height="12" fill="currentColor" />
                  <rect x="64" width="0.5" height="12" fill="currentColor" />
                  <rect x="65" width="2.5" height="12" fill="currentColor" />
                  <rect x="68" width="1.8" height="12" fill="currentColor" />
                  <rect x="70.5" width="0.8" height="12" fill="currentColor" />
                  <rect x="72" width="2" height="12" fill="currentColor" />
                  <rect x="74.5" width="1.5" height="12" fill="currentColor" />
                  <rect x="76.5" width="0.5" height="12" fill="currentColor" />
                  <rect x="77.5" width="3.5" height="12" fill="currentColor" />
                  <rect x="81.5" width="1.8" height="12" fill="currentColor" />
                  <rect x="84" width="0.8" height="12" fill="currentColor" />
                  <rect x="85.5" width="2" height="12" fill="currentColor" />
                  <rect x="88" width="1.5" height="12" fill="currentColor" />
                  <rect x="90" width="0.5" height="12" fill="currentColor" />
                  <rect x="91" width="3" height="12" fill="currentColor" />
                  <rect x="94.5" width="1" height="12" fill="currentColor" />
                  <rect x="96" width="4" height="12" fill="currentColor" />
                </svg>
                <span className="font-mono text-[9px] font-bold text-slate-400">34191.79001 01043.513184 91020.150008 7 98220000098000</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setBoletoModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-xl transition"
              >
                Fechar
              </button>
              <button
                onClick={handleDownloadBoleto}
                className="flex-grow px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
              >
                <Download className="w-4 h-4" /> Baixar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ Cenários propositadamente VAZIOS ============

export const VazioTurmas = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => (
  <MockScreen
    title="Minhas Turmas (vazio)" icon="fa-book-open" variant="list" accent={accent}
    columns={["Turma", "Disciplinas", "Período", "Professor"]}
    rows={[]} forceEmpty
    emptyTitle="Você ainda não está matriculado em nenhuma turma"
    emptyHint="Procure a secretaria para concluir sua matrícula."
  />
);

export const VazioAvaliacoes = ({ accent = "secondary" as "primary" | "secondary" | "accent" }) => (
  <MockScreen
    title="Avaliações (vazio)" icon="fa-clipboard-check" variant="list" accent={accent}
    columns={["Título", "Disciplina", "Data", "Peso"]}
    rows={[]} forceEmpty
    emptyTitle="Sem avaliações cadastradas"
    emptyHint="Crie a primeira avaliação clicando em Novo."
  />
);

export const VazioMateriais = ({ accent = "primary" as "primary" | "secondary" | "accent" }) => (
  <MockScreen
    title="Materiais (vazio)" icon="fa-folder-open" variant="list" accent={accent}
    columns={["Arquivo", "Disciplina", "Tipo", "Tamanho"]}
    rows={[]} forceEmpty
    emptyTitle="Nenhum material publicado"
    emptyHint="Os materiais enviados pelos professores aparecerão aqui."
  />
);
