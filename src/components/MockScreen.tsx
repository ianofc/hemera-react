import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type Stat = { label: string; value: string; icon: string; tone?: string };
type Variant = "dashboard" | "list" | "form" | "detail" | "kanban" | "chat" | "calendar" | "report";
type Row = { id: string; cols: (string | number)[]; href?: string };

interface Props {
  title: string;
  subtitle?: string;
  icon: string;
  variant?: Variant;
  stats?: Stat[];
  rows?: Row[];
  columns?: string[];
  filters?: string[];
  /** Coluna usada para casar o filtro (índice). Default: tenta achar valor em qualquer coluna. */
  filterColumnIndex?: number;
  /** Colunas ordenáveis por índice. Default: todas. */
  sortableColumns?: number[];
  /** Tamanho de página. Default 10. */
  pageSize?: number;
  /** Base de URL para tornar cada linha clicável: `${rowHrefBase}/${row.id}` */
  rowHrefBase?: string;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyHint?: string;
  /** Força exibir estado vazio (ignora rows). */
  forceEmpty?: boolean;
  detail?: { fields?: { k: string; v: string }[]; resumo?: string; timeline?: { titulo: string; quando: string }[] };
  formFields?: { label: string; placeholder?: string; type?: string; options?: string[] }[];
  kanbanColumns?: { titulo: string; cards: { titulo: string; descricao?: string; tag?: string; href?: string }[] }[];
  chatItems?: { nome: string; previa: string }[];
  children?: ReactNode;
  accent?: "secondary" | "accent" | "primary";
  /** Identificador para isolar estado de busca/filtro/ordenação por tela. */
  storageKey?: string;
}

const tones = [
  "from-aurora-secondary to-aurora-accent",
  "from-aurora-accent to-aurora-primary",
  "from-emerald-400 to-cyan-500",
  "from-amber-400 to-orange-500",
];

function Empty({ title, hint, icon }: { title: string; hint?: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-4 text-slate-400 rounded-2xl bg-white/60 border border-white/70">
        <i className={`text-2xl fas ${icon}`} />
      </div>
      <p className="text-sm font-bold text-slate-600">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-400 max-w-xs">{hint}</p>}
    </div>
  );
}

export default function MockScreen({
  title, subtitle, icon, variant = "dashboard",
  stats, rows, columns, filters, filterColumnIndex, sortableColumns,
  pageSize = 10, rowHrefBase,
  searchPlaceholder = "Buscar...",
  emptyTitle = "Sem dados por aqui ainda",
  emptyHint = "Quando houver registros, eles aparecerão nesta tela.",
  forceEmpty = false,
  detail, formFields, kanbanColumns, chatItems,
  children, accent = "secondary", storageKey,
}: Props) {
  useEffect(() => { document.title = `${title} | Hemera`; }, [title]);

  const grad =
    accent === "accent" ? "from-aurora-accent to-aurora-primary" :
    accent === "primary" ? "from-aurora-primary to-aurora-secondary" :
    "from-aurora-secondary to-aurora-accent";

  // Estado persistido via URL (sobrevive navegação back/forward)
  const [params, setParams] = useSearchParams();
  const ns = storageKey || title.toLowerCase().replace(/\s+/g, "_");
  const k = (suffix: string) => `${ns}_${suffix}`;

  const query = params.get(k("q")) || "";
  const activeFilter = params.get(k("f")) || "Todos";
  const page = Math.max(1, parseInt(params.get(k("p")) || "1", 10) || 1);
  const sortIdx = parseInt(params.get(k("s")) || "-1", 10);
  const sortDir = (params.get(k("d")) || "asc") as "asc" | "desc";

  const update = (next: Record<string, string | null>) => {
    const np = new URLSearchParams(params);
    for (const [key, val] of Object.entries(next)) {
      if (val === null || val === "") np.delete(key);
      else np.set(key, val);
    }
    setParams(np, { replace: true });
  };

  const allRows = forceEmpty ? [] : rows || [];

  const filteredRows = useMemo(() => {
    let r = allRows;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((x) => x.cols.some((c) => String(c).toLowerCase().includes(q)));
    }
    if (filters && activeFilter !== "Todos") {
      if (typeof filterColumnIndex === "number") {
        r = r.filter((x) => String(x.cols[filterColumnIndex]) === activeFilter);
      } else {
        r = r.filter((x) => x.cols.some((c) => String(c) === activeFilter));
      }
    }
    if (sortIdx >= 0) {
      r = [...r].sort((a, b) => {
        const av = a.cols[sortIdx], bv = b.cols[sortIdx];
        const an = typeof av === "number" ? av : parseFloat(String(av).replace(",", "."));
        const bn = typeof bv === "number" ? bv : parseFloat(String(bv).replace(",", "."));
        const numeric = !isNaN(an) && !isNaN(bn);
        const cmp = numeric ? an - bn : String(av).localeCompare(String(bv), "pt-BR");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [allRows, query, activeFilter, filters, filterColumnIndex, sortIdx, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const defaultStats: Stat[] = stats || [
    { label: "Total", value: "—", icon: "fa-chart-bar" },
    { label: "Ativos", value: "—", icon: "fa-bolt" },
    { label: "Pendentes", value: "—", icon: "fa-clock" },
    { label: "Taxa", value: "—", icon: "fa-trophy" },
  ];

  const showListToolbar = variant === "list";
  const isSortable = (i: number) => !sortableColumns || sortableColumns.includes(i);

  const RowWrap = ({ id, href, children: c }: { id: string; href?: string; children: ReactNode }) => {
    const target = href || (rowHrefBase ? `${rowHrefBase}/${id}` : undefined);
    if (!target) return <tr className="border-t border-white/40 hover:bg-white/30 transition">{c}</tr>;
    return (
      <tr className="border-t border-white/40 hover:bg-white/40 transition cursor-pointer">
        {c}
        <td className="hidden">
          <Link to={target} aria-label={`Abrir ${id}`} />
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-island rounded-3xl">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-14 h-14 text-white shadow-neon rounded-2xl bg-gradient-to-br ${grad}`}>
            <i className={`text-xl fas ${icon}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-xs font-bold border bg-white/70 border-slate-200 rounded-xl text-slate-600 hover:bg-white"><i className="mr-2 fas fa-download" />Exportar</button>
          <button className={`px-4 py-2 text-xs font-bold text-white shadow-lg rounded-xl bg-gradient-to-r ${grad} hover:-translate-y-0.5 transition`}><i className="mr-2 fas fa-plus" />Novo</button>
        </div>
      </header>

      {(variant === "dashboard" || variant === "report") && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {defaultStats.map((s, i) => (
            <div key={i} className="p-5 glass-card rounded-2xl">
              <div className={`flex items-center justify-center w-10 h-10 mb-3 text-white rounded-xl bg-gradient-to-br ${tones[i % tones.length]}`}><i className={`fas ${s.icon}`} /></div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800 font-display">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {(variant === "dashboard" || variant === "report") && !stats && (
        <div className="p-8 glass-island rounded-3xl">
          <Empty title={emptyTitle} hint={emptyHint} icon={icon} />
        </div>
      )}

      {showListToolbar && (
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between glass-island rounded-2xl">
          <div className="relative flex-1 max-w-md">
            <i className="absolute -translate-y-1/2 left-4 top-1/2 fas fa-search text-slate-400 text-xs" />
            <input
              value={query}
              onChange={(e) => update({ [k("q")]: e.target.value, [k("p")]: "1" })}
              placeholder={searchPlaceholder}
              className="w-full py-2.5 pl-10 pr-4 text-sm border bg-white/70 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-aurora-secondary"
            />
          </div>
          {filters && filters.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {["Todos", ...filters].map((f) => (
                <button
                  key={f}
                  onClick={() => update({ [k("f")]: f === "Todos" ? null : f, [k("p")]: "1" })}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition border ${
                    activeFilter === f
                      ? `text-white border-transparent bg-gradient-to-r ${grad} shadow-sm`
                      : "bg-white/70 text-slate-600 border-slate-200 hover:bg-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {variant === "list" && (
        <div className="overflow-hidden glass-island rounded-3xl">
          {pagedRows.length === 0 ? (
            <Empty
              title={query ? `Nenhum resultado para "${query}"` : emptyTitle}
              hint={query ? "Tente outro termo ou limpe os filtros." : emptyHint}
              icon={query ? "fa-search" : icon}
            />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-white/40">
                  <tr>{(columns || ["Nome", "Status", "Data", "Ações"]).map((c, i) => (
                    <th
                      key={c}
                      onClick={() => {
                        if (!isSortable(i)) return;
                        const nextDir = sortIdx === i && sortDir === "asc" ? "desc" : "asc";
                        update({ [k("s")]: String(i), [k("d")]: nextDir, [k("p")]: "1" });
                      }}
                      className={`px-5 py-3 text-left text-[10px] font-bold tracking-wider uppercase text-slate-500 ${isSortable(i) ? "cursor-pointer select-none hover:text-slate-700" : ""}`}
                    >
                      {c}
                      {isSortable(i) && sortIdx === i && (
                        <i className={`ml-1 fas fa-arrow-${sortDir === "asc" ? "up" : "down"} text-[8px]`} />
                      )}
                    </th>
                  ))}</tr>
                </thead>
                <tbody>
                  {pagedRows.map((r) => {
                    const target = r.href || (rowHrefBase ? `${rowHrefBase}/${r.id}` : undefined);
                    const cells = r.cols.map((c, j) => <td key={j} className="px-5 py-4 text-slate-700">{c}</td>);
                    if (!target) return <tr key={r.id} className="border-t border-white/40 hover:bg-white/30 transition">{cells}</tr>;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => { window.location.assign(target); }}
                        className="border-t border-white/40 hover:bg-white/40 transition cursor-pointer"
                      >
                        {cells}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/50 bg-white/30">
                  <p className="text-[11px] text-slate-500 font-bold">
                    Página {safePage} de {totalPages} · {filteredRows.length} registro(s)
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => update({ [k("p")]: String(Math.max(1, safePage - 1)) })}
                      disabled={safePage === 1}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white/70 border border-slate-200 text-slate-600 disabled:opacity-40"
                    >
                      <i className="fas fa-chevron-left" />
                    </button>
                    {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => update({ [k("p")]: String(p) })}
                          className={`w-8 h-8 text-[11px] font-bold rounded-lg ${
                            p === safePage
                              ? `text-white bg-gradient-to-r ${grad}`
                              : "bg-white/70 border border-slate-200 text-slate-600"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => update({ [k("p")]: String(Math.min(totalPages, safePage + 1)) })}
                      disabled={safePage === totalPages}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white/70 border border-slate-200 text-slate-600 disabled:opacity-40"
                    >
                      <i className="fas fa-chevron-right" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {variant === "form" && (
        <div className="p-8 glass-island rounded-3xl">
          {(!formFields || formFields.length === 0) ? (
            <Empty title="Formulário em construção" hint="Os campos serão exibidos aqui assim que o módulo for configurado." icon="fa-pen-to-square" />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {formFields.map((f) => (
                  <div key={f.label} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                    <label className="block mb-2 text-xs font-bold text-slate-600">{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea rows={5} placeholder={f.placeholder || f.label} className="w-full px-4 py-3 text-sm border bg-white/70 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-aurora-secondary" />
                    ) : f.type === "select" ? (
                      <select className="w-full px-4 py-3 text-sm border bg-white/70 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-aurora-secondary">
                        {(f.options || []).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={f.type || "text"} placeholder={f.placeholder || f.label} className="w-full px-4 py-3 text-sm border bg-white/70 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-aurora-secondary" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button className="px-5 py-2 text-xs font-bold border bg-white/70 border-slate-200 rounded-xl text-slate-600">Cancelar</button>
                <button className={`px-5 py-2 text-xs font-bold text-white shadow-lg rounded-xl bg-gradient-to-r ${grad}`}>Salvar</button>
              </div>
            </>
          )}
        </div>
      )}

      {variant === "detail" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="p-6 lg:col-span-2 glass-island rounded-3xl">
            <h3 className="mb-4 text-lg font-bold text-slate-800 font-display">Visão geral</h3>
            {detail?.resumo ? (
              <p className="text-sm leading-relaxed text-slate-600">{detail.resumo}</p>
            ) : (
              <Empty title="Sem descrição" hint="Adicione uma descrição para exibir aqui." icon="fa-align-left" />
            )}
            {detail?.fields && detail.fields.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-3">
                {detail.fields.map((kk) => (
                  <div key={kk.k} className="p-3 border bg-white/40 border-white/60 rounded-xl">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{kk.k}</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">{kk.v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 glass-island rounded-3xl">
            <h3 className="mb-4 text-sm font-bold text-slate-800 font-display">Atividade recente</h3>
            {!detail?.timeline || detail.timeline.length === 0 ? (
              <Empty title="Sem atividade" hint="Eventos relacionados aparecerão aqui." icon="fa-clock-rotate-left" />
            ) : (
              <div className="space-y-3">
                {detail.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border bg-white/40 border-white/60 rounded-xl">
                    <div className={`flex items-center justify-center w-8 h-8 text-white rounded-lg bg-gradient-to-br ${tones[i % tones.length]} flex-shrink-0`}><i className="text-xs fas fa-bolt" /></div>
                    <div><p className="text-xs font-bold text-slate-700">{t.titulo}</p><p className="text-[10px] text-slate-400">{t.quando}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {variant === "kanban" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(kanbanColumns || [
            { titulo: "A fazer", cards: [] },
            { titulo: "Em andamento", cards: [] },
            { titulo: "Concluído", cards: [] },
          ]).map((col) => (
            <div key={col.titulo} className="p-4 glass-island rounded-2xl">
              <h4 className="mb-3 text-xs font-bold tracking-wider uppercase text-slate-500">{col.titulo} <span className="text-slate-400">· {col.cards.length}</span></h4>
              <div className="space-y-2">
                {col.cards.length === 0 ? (
                  <div className="p-4 text-center border border-dashed rounded-xl border-slate-200">
                    <p className="text-[11px] text-slate-400 font-bold">Sem itens</p>
                  </div>
                ) : col.cards.map((c, i) => {
                  const card = (
                    <>
                      <p className="text-xs font-bold text-slate-700">{c.titulo}</p>
                      {c.descricao && <p className="text-[10px] text-slate-500 mt-1">{c.descricao}</p>}
                      {c.tag && <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white rounded-full bg-gradient-to-r ${grad}`}>{c.tag}</span>}
                    </>
                  );
                  return c.href ? (
                    <Link key={i} to={c.href} className="block p-3 border bg-white/60 border-white/80 rounded-xl hover:bg-white/80 transition">{card}</Link>
                  ) : (
                    <div key={i} className="p-3 border bg-white/60 border-white/80 rounded-xl">{card}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "chat" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="p-4 glass-island rounded-2xl lg:col-span-1">
            {(!chatItems || chatItems.length === 0) ? (
              <Empty title="Nenhuma conversa" hint="Inicie uma nova mensagem." icon="fa-comments" />
            ) : chatItems.map((it, i) => (
              <div key={i} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/50">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tones[i % tones.length]} flex items-center justify-center text-white text-xs font-bold`}>{it.nome.split(" ").map(s=>s[0]).slice(0,2).join("")}</div>
                <div><p className="text-xs font-bold text-slate-700">{it.nome}</p><p className="text-[10px] text-slate-400 truncate max-w-[180px]">{it.previa}</p></div>
              </div>
            ))}
          </div>
          <div className="p-6 glass-island rounded-2xl lg:col-span-2 min-h-[400px] flex flex-col">
            <div className="flex-1 space-y-3">
              <div className="max-w-md p-3 text-sm bg-white/70 rounded-2xl rounded-tl-sm">Olá, professor! Posso entregar o trabalho amanhã?</div>
              <div className={`max-w-md p-3 text-sm text-white ml-auto bg-gradient-to-br ${grad} rounded-2xl rounded-tr-sm`}>Claro, sem problemas. Lembre-se de incluir as referências.</div>
            </div>
            <div className="flex gap-2 pt-4 mt-4 border-t border-white/50">
              <input className="flex-1 px-4 py-2 text-sm border bg-white/70 border-slate-200 rounded-xl" placeholder="Mensagem..." />
              <button className={`px-4 text-white rounded-xl bg-gradient-to-r ${grad}`}><i className="fas fa-paper-plane" /></button>
            </div>
          </div>
        </div>
      )}

      {variant === "calendar" && (
        <div className="p-6 glass-island rounded-3xl">
          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-bold tracking-wider uppercase text-slate-400">{d}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square p-2 border bg-white/40 border-white/60 rounded-xl text-xs text-slate-600 hover:bg-white/70 cursor-pointer">
                {i + 1 <= 31 ? i + 1 : ""}
                {[3, 8, 15, 22].includes(i) && <div className={`mt-1 h-1.5 rounded-full bg-gradient-to-r ${grad}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
