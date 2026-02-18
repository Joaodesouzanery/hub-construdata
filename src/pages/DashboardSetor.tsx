import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Layers,
  Building2,
  Activity,
  TrendingUp,
  FileSearch,
  Newspaper,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";
import licitacoes from "@/data/licitacoes";
import noticias from "@/data/noticias";

// ── Definicao dos setores ───────────────────────────────────────────────────

interface SetorDefinicao {
  id: string;
  label: string;
  cor: string;
  corTailwind: string;
  bgBadge: string;
  segmentoKeywords: string[];
  projetoKeywords: string[];
  licitacaoKeywords: string[];
  noticiaKeywords: string[];
}

const SETORES: SetorDefinicao[] = [
  {
    id: "agua",
    label: "Água & Abastecimento",
    cor: "#3b82f6",
    corTailwind: "text-blue-500",
    bgBadge: "bg-blue-500/10",
    segmentoKeywords: [
      "Saneamento",
      "Tratamento de Água",
      "Infraestrutura Hídrica",
      "Dessalinização",
      "Reúso de Água",
    ],
    projetoKeywords: ["Saneamento", "Água", "Abastecimento"],
    licitacaoKeywords: ["água", "abastecimento", "ETA", "adutora", "reservatório", "captação", "manancial", "poço"],
    noticiaKeywords: ["água", "abastecimento", "sabesp", "copasa", "sanepar", "adutora", "eta", "manancial"],
  },
  {
    id: "esgoto",
    label: "Esgoto & Tratamento",
    cor: "#10b981",
    corTailwind: "text-emerald-500",
    bgBadge: "bg-emerald-500/10",
    segmentoKeywords: [
      "Saneamento",
      "Tratamento de Esgoto",
      "Infraestrutura Hídrica",
    ],
    projetoKeywords: ["Saneamento", "Esgoto"],
    licitacaoKeywords: ["esgoto", "ETE", "rede coletora", "interceptor", "emissário", "lodo", "efluente", "saneamento"],
    noticiaKeywords: ["esgoto", "ete", "tratamento", "aegea", "brk", "iguá", "rede coletora", "universalização"],
  },
  {
    id: "hidrica",
    label: "Infraestrutura Hídrica",
    cor: "#06b6d4",
    corTailwind: "text-cyan-500",
    bgBadge: "bg-cyan-500/10",
    segmentoKeywords: [
      "Infraestrutura Hídrica",
      "Saneamento",
      "Geração Hidrelétrica",
    ],
    projetoKeywords: ["Barragem", "Hídrica", "Hidrelétrica", "Irrigação"],
    licitacaoKeywords: ["barragem", "represa", "canal", "irrigação", "comporta", "vertedouro", "dique", "açude"],
    noticiaKeywords: ["barragem", "represa", "segurança hídrica", "ANA", "SNISB", "açude", "transposição"],
  },
  {
    id: "drenagem",
    label: "Drenagem & Meio Ambiente",
    cor: "#8b5cf6",
    corTailwind: "text-violet-500",
    bgBadge: "bg-violet-500/10",
    segmentoKeywords: [
      "Drenagem",
      "Resíduos Sólidos",
      "Logística Ambiental",
      "Saneamento",
    ],
    projetoKeywords: ["Drenagem", "Resíduos", "Ambiental"],
    licitacaoKeywords: ["drenagem", "galeria", "águas pluviais", "macrodrenagem", "resíduos", "aterro", "erosão"],
    noticiaKeywords: ["drenagem", "enchente", "alagamento", "resíduos", "aterro", "pluvial", "erosão"],
  },
  {
    id: "engenharia",
    label: "Engenharia & Construção",
    cor: "#f59e0b",
    corTailwind: "text-amber-500",
    bgBadge: "bg-amber-500/10",
    segmentoKeywords: [
      "Construção Civil",
      "Engenharia",
      "Construção Pesada",
      "Infraestrutura Rodoviária",
      "Pavimentação",
    ],
    projetoKeywords: ["Infraestrutura", "Construção", "Engenharia"],
    licitacaoKeywords: ["Infraestrutura", "construção", "obra", "pavimentação", "ponte", "viaduto", "fundação", "estrutura"],
    noticiaKeywords: ["construção", "infraestrutura", "SINAPI", "CBIC", "engenharia", "obra", "cimento", "aço"],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return `R$ ${value.toFixed(0)}`;
}

function matchesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

// ── Componente principal ────────────────────────────────────────────────────

const DashboardSetor = () => {
  const [setorAtivo, setSetorAtivo] = useState("saneamento");

  const setor = SETORES.find((s) => s.id === setorAtivo) ?? SETORES[0];

  // ── Empresas filtradas pelo segmento (includes no array segmentos) ──
  const empresasDoSetor = useMemo(() => {
    return empresas
      .filter((e) =>
        e.segmentos.some((seg) => setor.segmentoKeywords.includes(seg)),
      )
      .sort((a, b) => b.nota_score - a.nota_score);
  }, [setor]);

  // ── Projetos filtrados pelo campo categoria ──
  const projetosDoSetor = useMemo(() => {
    return projetos
      .filter((p) =>
        setor.projetoKeywords.some((kw) =>
          p.categoria.toLowerCase().includes(kw.toLowerCase()),
        ),
      )
      .sort(
        (a, b) =>
          new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime(),
      );
  }, [setor]);

  // ── Licitacoes filtradas por categoria ou texto do titulo/objeto ──
  const licitacoesDoSetor = useMemo(() => {
    return licitacoes.filter((l) => {
      const categoriaMatch = setor.licitacaoKeywords.some(
        (kw) => l.categoria?.toLowerCase() === kw.toLowerCase(),
      );
      const objetoMatch = matchesAny(l.titulo ?? "", setor.licitacaoKeywords);
      return categoriaMatch || objetoMatch;
    });
  }, [setor]);

  const licitacoesAbertas = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    return licitacoesDoSetor.filter((l) => {
      if (!l.data_abertura) return true;
      return l.data_abertura >= hoje;
    });
  }, [licitacoesDoSetor]);

  // ── Noticias filtradas por palavras-chave no titulo ──
  const noticiasDoSetor = useMemo(() => {
    return noticias
      .filter((n) => matchesAny(n.titulo, setor.noticiaKeywords))
      .slice(0, 6);
  }, [setor]);

  // ── KPIs calculados ──
  const totalEmpresas = empresasDoSetor.length;
  const totalProjetos = projetosDoSetor.length;
  const valorTotalInvestido = useMemo(
    () => projetosDoSetor.reduce((sum, p) => sum + p.valor_contrato, 0),
    [projetosDoSetor],
  );
  const totalLicitacoesAbertas = licitacoesAbertas.length;

  // ── Dados para grafico de barras: top empresas por score ──
  const chartData = useMemo(() => {
    return empresasDoSetor.slice(0, 10).map((e) => ({
      nome:
        e.nome_fantasia.length > 14
          ? e.nome_fantasia.slice(0, 12) + "..."
          : e.nome_fantasia,
      nomeCompleto: e.nome_fantasia,
      score: e.nota_score,
      volume: e.volume_total_contratos / 1_000_000_000,
    }));
  }, [empresasDoSetor]);

  // ── Projetos recentes (ultimos 8) ──
  const projetosRecentes = projetosDoSetor.slice(0, 8);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Cabecalho ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Layers className="h-7 w-7 text-gray-700 dark:text-gray-300" />
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Dashboard por Setor
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-10">
          Dados de empresas, projetos, licitacoes e noticias filtrados por
          segmento de infraestrutura
        </p>
      </div>

      {/* ── Tabs de setor ── */}
      <div className="flex flex-wrap gap-2">
        {SETORES.map((s) => {
          const isActive = s.id === setorAtivo;
          return (
            <button
              key={s.id}
              onClick={() => setSetorAtivo(s.id)}
              className={`
                rounded-lg px-4 py-2.5 text-sm font-semibold transition-all border
                ${
                  isActive
                    ? `${s.bgBadge} ${s.corTailwind} border-current shadow-sm`
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
                }
              `}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Empresas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${setor.cor}18` }}
          >
            <Building2 className="h-6 w-6" style={{ color: setor.cor }} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Empresas
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalEmpresas}
            </p>
          </div>
        </div>

        {/* Total Projetos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${setor.cor}18` }}
          >
            <Activity className="h-6 w-6" style={{ color: setor.cor }} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Projetos
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalProjetos}
            </p>
          </div>
        </div>

        {/* Valor Total Investido */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${setor.cor}18` }}
          >
            <TrendingUp className="h-6 w-6" style={{ color: setor.cor }} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Valor Total Investido
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(valorTotalInvestido)}
            </p>
          </div>
        </div>

        {/* Licitacoes Abertas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${setor.cor}18` }}
          >
            <FileSearch className="h-6 w-6" style={{ color: setor.cor }} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Licitacoes Abertas
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalLicitacoesAbertas}
            </p>
          </div>
        </div>
      </div>

      {/* ── Grafico de barras: top empresas por score ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5" style={{ color: setor.cor }} />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Top Empresas por Score — {setor.label}
          </h2>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            {chartData.length} empresas
          </span>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
            >
              <XAxis
                dataKey="nome"
                tick={{ fontSize: 11, fontWeight: 600 }}
              />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid #e5e7eb",
                }}
                formatter={(value) => [`Score: ${value}`, "Empresa"]}
              />
              <Bar
                dataKey="score"
                fill={setor.cor}
                radius={[6, 6, 0, 0]}
                barSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
            Nenhuma empresa encontrada neste setor
          </div>
        )}
      </div>

      {/* ── Grid: Projetos recentes + Noticias ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projetos recentes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5" style={{ color: setor.cor }} />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Projetos Recentes — {setor.label}
            </h2>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              {projetosDoSetor.length} total
            </span>
          </div>

          {projetosRecentes.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {projetosRecentes.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-medium text-gray-900 dark:text-white truncate"
                        title={p.titulo}
                      >
                        {p.titulo}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{p.empresa_responsavel_nome}</span>
                        <span className="text-gray-300 dark:text-gray-600">
                          |
                        </span>
                        <span>{p.estado}</span>
                        <span className="text-gray-300 dark:text-gray-600">
                          |
                        </span>
                        <span>{p.valor_contrato_fmt}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.status === "Em Andamento"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : p.status === "Concluido"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {p.status}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${p.percentual_execucao}%`,
                              backgroundColor: setor.cor,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                          {p.percentual_execucao}%
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              Nenhum projeto encontrado neste setor
            </p>
          )}
        </div>

        {/* Noticias recentes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-5 w-5" style={{ color: setor.cor }} />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Noticias Recentes — {setor.label}
            </h2>
          </div>

          {noticiasDoSetor.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {noticiasDoSetor.map((n, idx) => (
                <li key={idx} className="py-3 first:pt-0 last:pb-0">
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {n.titulo}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date(n.data_publicacao).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">
                        |
                      </span>
                      <span>{n.fonte}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              Nenhuma noticia encontrada para este setor. As noticias sao
              filtradas por palavras-chave nos titulos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSetor;
