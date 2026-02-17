import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, ComposedChart,
} from "recharts";
import {
  Brain, TrendingUp, AlertTriangle, Lightbulb,
  Target, Zap, ArrowUpRight, ArrowDownRight,
  BarChart3, Activity, Shield, Droplets, Building2,
} from "lucide-react";
import { useLicitacoes } from "@/hooks/useLicitacoes";

// ── Dados simulados para previsões ML ──

const evolucaoPrecos = [
  { mes: "Set/25", cimento: 32.5, aco: 4850, pvc: 28.3 },
  { mes: "Out/25", cimento: 33.1, aco: 4920, pvc: 28.8 },
  { mes: "Nov/25", cimento: 33.8, aco: 5010, pvc: 29.5 },
  { mes: "Dez/25", cimento: 34.2, aco: 5100, pvc: 30.1 },
  { mes: "Jan/26", cimento: 34.9, aco: 5180, pvc: 30.8 },
  { mes: "Fev/26", cimento: 35.5, aco: 5250, pvc: 31.2 },
  // Previsões ML
  { mes: "Mar/26", cimento: 36.1, aco: 5340, pvc: 31.8, previsto: true },
  { mes: "Abr/26", cimento: 36.8, aco: 5420, pvc: 32.3, previsto: true },
  { mes: "Mai/26", cimento: 37.2, aco: 5510, pvc: 32.9, previsto: true },
  { mes: "Jun/26", cimento: 37.8, aco: 5600, pvc: 33.4, previsto: true },
];

// Tendência de volume de licitações com previsão
const volumeTendencia = [
  { mes: "Set/25", volume: 42, mediaMovel: 38 },
  { mes: "Out/25", volume: 48, mediaMovel: 41 },
  { mes: "Nov/25", volume: 55, mediaMovel: 45 },
  { mes: "Dez/25", volume: 38, mediaMovel: 44 },
  { mes: "Jan/26", volume: 62, mediaMovel: 49 },
  { mes: "Fev/26", volume: 58, mediaMovel: 52 },
  { mes: "Mar/26", volume: null, mediaMovel: null, previsao: 65, prevMin: 58, prevMax: 72 },
  { mes: "Abr/26", volume: null, mediaMovel: null, previsao: 70, prevMin: 61, prevMax: 79 },
  { mes: "Mai/26", volume: null, mediaMovel: null, previsao: 68, prevMin: 59, prevMax: 77 },
  { mes: "Jun/26", volume: null, mediaMovel: null, previsao: 73, prevMin: 63, prevMax: 83 },
];

// Anomalias detectadas
const anomalias = [
  {
    id: 1,
    tipo: "preco" as const,
    titulo: "Aumento atípico no aço CA-50",
    descricao: "Preço subiu 8.2% em uma semana, acima do desvio padrão histórico de 3.5%",
    severidade: "alta" as const,
    data: "12/02/2026",
    impacto: "Custos de obras com estrutura metálica podem subir 4-6%",
    recomendacao: "Considere antecipar compras ou buscar fornecedores alternativos",
    confianca: 94,
  },
  {
    id: 2,
    tipo: "volume" as const,
    titulo: "Queda repentina de licitações no Nordeste",
    descricao: "Volume de novas licitações caiu 35% no Nordeste vs. média dos últimos 3 meses",
    severidade: "media" as const,
    data: "10/02/2026",
    impacto: "Possível contenção orçamentária nos governos estaduais",
    recomendacao: "Monitore editais federais que podem compensar a queda regional",
    confianca: 87,
  },
  {
    id: 3,
    tipo: "concorrencia" as const,
    titulo: "Nova empresa dominando licitações em SP",
    descricao: "Construtora EcoUrbes venceu 4 das últimas 6 licitações acima de R$ 10M em São Paulo",
    severidade: "baixa" as const,
    data: "08/02/2026",
    impacto: "Aumento de concentração no mercado paulista de saneamento",
    recomendacao: "Analise estratégias de precificação e parcerias para competir",
    confianca: 78,
  },
  {
    id: 4,
    tipo: "regulatorio" as const,
    titulo: "Padrão incomum em aditivos contratuais",
    descricao: "Frequência de aditivos acima de 25% do valor original triplicou nos últimos 2 meses",
    severidade: "alta" as const,
    data: "05/02/2026",
    impacto: "Risco de fiscalização mais rigorosa pelo TCU nos próximos editais",
    recomendacao: "Revisar orçamentos para minimizar necessidade de aditivos",
    confianca: 91,
  },
];

// Recomendações inteligentes
const recomendacoes = [
  {
    id: 1,
    titulo: "Expandir atuação no Pará",
    descricao: "Modelo prevê crescimento de 45% em licitações de saneamento no PA em 2026, impulsionado pelo novo marco regulatório estadual.",
    prioridade: "alta" as const,
    potencial: "R$ 280M",
    probabilidade: 82,
    setor: "Saneamento",
  },
  {
    id: 2,
    titulo: "Investir em tecnologia de reúso de água",
    descricao: "Análise de tendências indica que 30% dos editais em 2027 exigirão soluções de reúso. Empresas com essa capacidade terão vantagem competitiva.",
    prioridade: "alta" as const,
    potencial: "R$ 150M",
    probabilidade: 75,
    setor: "Saneamento",
  },
  {
    id: 3,
    titulo: "Monitorar preços de PVC no 2o trimestre",
    descricao: "Sazonalidade histórica combinada com aumento de demanda prevista sugere pico de preços em Abr-Mai/2026.",
    prioridade: "media" as const,
    potencial: "Economia de 8-12%",
    probabilidade: 70,
    setor: "Materiais",
  },
  {
    id: 4,
    titulo: "Formar consórcio para megaprojetos no RJ",
    descricao: "Licitações acima de R$ 500M no RJ exigem capacidade que favorece consórcios. 3 editais previstos para o 2o semestre de 2026.",
    prioridade: "media" as const,
    potencial: "R$ 1.8B",
    probabilidade: 65,
    setor: "Infraestrutura",
  },
  {
    id: 5,
    titulo: "Certificação ISO 14001 como diferencial",
    descricao: "Análise mostra que 60% dos editais recentes dão pontuação extra para certificações ambientais. Tendência crescente.",
    prioridade: "baixa" as const,
    potencial: "+15% taxa vitória",
    probabilidade: 88,
    setor: "Gestão",
  },
];

// Saúde do mercado (radar)
const saudeDoMercado = [
  { indicador: "Volume Licitações", valor: 78, benchmark: 65 },
  { indicador: "Liquidez", valor: 65, benchmark: 70 },
  { indicador: "Competitividade", valor: 82, benchmark: 75 },
  { indicador: "Investimento Gov.", valor: 71, benchmark: 60 },
  { indicador: "Inovação", valor: 55, benchmark: 50 },
  { indicador: "Regulação", valor: 88, benchmark: 80 },
];

// Previsão de demanda por setor
const previsaoDemanda = [
  { setor: "Saneamento Básico", atual: 85, previsao3m: 92, previsao6m: 98, tendencia: "alta" as const },
  { setor: "Drenagem Urbana", atual: 62, previsao3m: 70, previsao6m: 78, tendencia: "alta" as const },
  { setor: "Pavimentação", atual: 75, previsao3m: 72, previsao6m: 68, tendencia: "baixa" as const },
  { setor: "Edificações", atual: 58, previsao3m: 55, previsao6m: 52, tendencia: "baixa" as const },
  { setor: "Obras Hídricas", atual: 70, previsao3m: 80, previsao6m: 95, tendencia: "alta" as const },
  { setor: "Resíduos Sólidos", atual: 45, previsao3m: 55, previsao6m: 65, tendencia: "alta" as const },
];

const sevCores = { alta: "#ef4444", media: "#f59e0b", baixa: "#3b82f6" };
const priCores = { alta: "#ef4444", media: "#f59e0b", baixa: "#10b981" };
const InsightsIA = () => {
  const { dados: licitacoes } = useLicitacoes();
  const [tab, setTab] = useState<"previsoes" | "anomalias" | "recomendacoes" | "mercado">("previsoes");

  // KPIs calculados
  const kpis = useMemo(() => {
    const total = licitacoes.length;
    const volume = licitacoes.reduce((s, l) => s + (l.valor_estimado || 0), 0);
    const estados = new Set(licitacoes.map((l) => l.estado)).size;
    return {
      total,
      volume,
      estados,
      ticketMedio: total > 0 ? volume / total : 0,
      anomaliasAtivas: anomalias.filter((a) => a.severidade === "alta").length,
      recomendacoesAlta: recomendacoes.filter((r) => r.prioridade === "alta").length,
    };
  }, [licitacoes]);

  const tabs = [
    { key: "previsoes" as const, label: "Previsões", icon: TrendingUp },
    { key: "anomalias" as const, label: "Anomalias", icon: AlertTriangle },
    { key: "recomendacoes" as const, label: "Recomendações", icon: Lightbulb },
    { key: "mercado" as const, label: "Saúde do Mercado", icon: Activity },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Brain size={28} className="text-violet-500" />
            Insights com IA
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Previsões, detecção de anomalias e recomendações inteligentes para Engenharia e Saneamento
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-full text-xs text-violet-600 font-medium">
          <Zap size={13} />
          Modelo atualizado em 17/02/2026
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-500/5 to-violet-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain size={14} className="text-violet-500" />
              <span className="text-xs text-muted-foreground">Previsão Volume</span>
            </div>
            <p className="text-2xl font-extrabold">+18%</p>
            <p className="text-xs text-violet-500 flex items-center gap-1 mt-1">
              <ArrowUpRight size={12} /> Próximos 3 meses
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-500/5 to-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-xs text-muted-foreground">Anomalias Ativas</span>
            </div>
            <p className="text-2xl font-extrabold">{kpis.anomaliasAtivas}</p>
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <Shield size={12} /> Severidade alta
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-emerald-500" />
              <span className="text-xs text-muted-foreground">Oportunidades</span>
            </div>
            <p className="text-2xl font-extrabold">{kpis.recomendacoesAlta}</p>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
              <ArrowUpRight size={12} /> Prioridade alta
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={14} className="text-blue-500" />
              <span className="text-xs text-muted-foreground">Confiança Modelo</span>
            </div>
            <p className="text-2xl font-extrabold">87%</p>
            <p className="text-xs text-blue-500 flex items-center gap-1 mt-1">
              <Activity size={12} /> R² = 0.87
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Previsões ── */}
      {tab === "previsoes" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Previsão de preços de materiais */}
          <Card className="border-0 shadow-sm xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-500" />
                Previsão de Preços — Materiais Chave
                <span className="ml-auto text-[0.6rem] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
                  ML · Regressão Linear + Sazonalidade
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">
                Linha sólida = dados reais · Linha tracejada = previsão do modelo
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={evolucaoPrecos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="cimento" tick={{ fontSize: 11 }} domain={[30, 40]} label={{ value: "Cimento (R$/sc)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                  <YAxis yAxisId="aco" orientation="right" tick={{ fontSize: 11 }} domain={[4600, 5800]} label={{ value: "Aço (R$/t)", angle: 90, position: "insideRight", style: { fontSize: 10 } }} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    formatter={(val, name) => {
                      const labels: Record<string, string> = { cimento: "Cimento (R$/sc)", aco: "Aço (R$/t)", pvc: "PVC (R$/m)" };
                      return [typeof val === "number" ? val.toFixed(1) : String(val ?? ""), labels[String(name)] || String(name)];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine x="Fev/26" stroke="#94a3b8" strokeDasharray="5 5" label={{ value: "Hoje", position: "top", fontSize: 10 }} yAxisId="cimento" />
                  <Line yAxisId="cimento" type="monotone" dataKey="cimento" stroke="#3b82f6" strokeWidth={2} dot={false} name="Cimento" strokeDasharray="0" connectNulls />
                  <Line yAxisId="aco" type="monotone" dataKey="aco" stroke="#ef4444" strokeWidth={2} dot={false} name="Aço" connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Previsão de volume */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" />
                Previsão de Volume de Licitações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={volumeTendencia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine x="Fev/26" stroke="#94a3b8" strokeDasharray="5 5" />
                  <Bar dataKey="volume" fill="#3b82f6" name="Real" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="previsao" fill="#8b5cf6" opacity={0.6} name="Previsão" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="mediaMovel" stroke="#f59e0b" strokeWidth={2} dot={false} name="Média Móvel" />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-100 text-xs text-violet-700">
                <strong>Previsão:</strong> O modelo prevê aumento de 18-25% no volume de licitações nos próximos 3 meses,
                impulsionado pelo novo ciclo de investimentos do Marco do Saneamento e liberação de recursos federais.
              </div>
            </CardContent>
          </Card>

          {/* Previsão de demanda por setor */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target size={16} className="text-emerald-500" />
                Previsão de Demanda por Setor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {previsaoDemanda.map((s) => (
                  <div key={s.setor}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{s.setor}</span>
                      <span className="flex items-center gap-1">
                        {s.tendencia === "alta" ? (
                          <ArrowUpRight size={12} className="text-emerald-500" />
                        ) : (
                          <ArrowDownRight size={12} className="text-red-500" />
                        )}
                        <span className="text-muted-foreground">
                          {s.atual} → {s.previsao6m}
                        </span>
                      </span>
                    </div>
                    <div className="flex gap-1 h-4">
                      <div
                        className="h-full bg-blue-500 rounded-l-md transition-all"
                        style={{ width: `${(s.atual / 100) * 100}%` }}
                        title={`Atual: ${s.atual}`}
                      />
                      <div
                        className="h-full rounded-r-md transition-all"
                        style={{
                          width: `${((s.previsao6m - s.atual) / 100) * 100}%`,
                          backgroundColor: s.tendencia === "alta" ? "#10b981" : "#ef4444",
                          opacity: 0.4,
                        }}
                        title={`Previsão 6m: ${s.previsao6m}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[0.65rem] text-muted-foreground">
                Escala 0-100 baseada em índice normalizado de demanda. Barras coloridas mostram crescimento (verde) ou queda (vermelho) prevista.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Anomalias ── */}
      {tab === "anomalias" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-2">
            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-extrabold text-red-500">{anomalias.filter((a) => a.severidade === "alta").length}</p>
                <p className="text-xs text-muted-foreground mt-1">Severidade Alta</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-extrabold text-amber-500">{anomalias.filter((a) => a.severidade === "media").length}</p>
                <p className="text-xs text-muted-foreground mt-1">Severidade Média</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-extrabold text-blue-500">{anomalias.filter((a) => a.severidade === "baixa").length}</p>
                <p className="text-xs text-muted-foreground mt-1">Severidade Baixa</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {anomalias.map((a) => (
              <Card key={a.id} className="border-0 shadow-sm overflow-hidden">
                <div className="flex">
                  <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: sevCores[a.severidade] }} />
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase text-white"
                            style={{ backgroundColor: sevCores[a.severidade] }}
                          >
                            {a.severidade}
                          </span>
                          <span className="text-[0.6rem] text-muted-foreground">{a.data}</span>
                          <span className="text-[0.6rem] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded">
                            {a.tipo}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold mb-1">{a.titulo}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{a.descricao}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-[0.6rem] font-semibold text-red-700 uppercase tracking-wide">Impacto</p>
                            <p className="text-xs text-red-600 mt-0.5">{a.impacto}</p>
                          </div>
                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                            <p className="text-[0.6rem] font-semibold text-emerald-700 uppercase tracking-wide">Recomendação</p>
                            <p className="text-xs text-emerald-600 mt-0.5">{a.recomendacao}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <div className="w-14 h-14 rounded-full border-4 flex items-center justify-center" style={{ borderColor: sevCores[a.severidade] }}>
                          <span className="text-sm font-extrabold">{a.confianca}%</span>
                        </div>
                        <p className="text-[0.55rem] text-muted-foreground mt-1">Confiança</p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Recomendações ── */}
      {tab === "recomendacoes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recomendacoes.map((r) => (
              <Card key={r.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: priCores[r.prioridade] + "15" }}
                    >
                      <Lightbulb size={20} style={{ color: priCores[r.prioridade] }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded uppercase text-white"
                          style={{ backgroundColor: priCores[r.prioridade] }}
                        >
                          {r.prioridade}
                        </span>
                        <span className="text-[0.6rem] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {r.setor}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold mb-1">{r.titulo}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{r.descricao}</p>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[0.6rem] text-muted-foreground uppercase">Potencial</p>
                          <p className="text-sm font-extrabold text-primary">{r.potencial}</p>
                        </div>
                        <div>
                          <p className="text-[0.6rem] text-muted-foreground uppercase">Probabilidade</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${r.probabilidade}%`, backgroundColor: priCores[r.prioridade] }}
                              />
                            </div>
                            <span className="text-xs font-bold">{r.probabilidade}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Insights Box */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-violet-50 to-blue-50">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                <Brain size={16} className="text-violet-500" />
                Resumo Executivo da IA
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg">
                  <p className="font-bold text-emerald-600 mb-1 flex items-center gap-1">
                    <Droplets size={13} /> Saneamento
                  </p>
                  <p className="text-muted-foreground">
                    Setor com maior potencial de crescimento. Marco Legal impulsiona R$ 500B+ em investimentos até 2033.
                    Foco em universalização de água e esgoto.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="font-bold text-blue-600 mb-1 flex items-center gap-1">
                    <Building2 size={13} /> Engenharia
                  </p>
                  <p className="text-muted-foreground">
                    Infraestrutura urbana e drenagem em ascensão com eventos climáticos mais frequentes.
                    Tecnologias sustentáveis são diferencial competitivo.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="font-bold text-violet-600 mb-1 flex items-center gap-1">
                    <TrendingUp size={13} /> Tendência
                  </p>
                  <p className="text-muted-foreground">
                    Modelo aponta janela de oportunidade nos próximos 6-12 meses.
                    Regiões Norte e Nordeste com maior taxa de crescimento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Saúde do Mercado ── */}
      {tab === "mercado" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Radar */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity size={16} className="text-blue-500" />
                Radar de Saúde do Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={saudeDoMercado}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="indicador" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Atual" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Benchmark" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeDasharray="5 5" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                <strong>Análise:</strong> O mercado de construção civil apresenta saúde acima do benchmark em 5 de 6 indicadores.
                A liquidez está levemente abaixo, sugerindo maior seletividade nas contratações.
              </div>
            </CardContent>
          </Card>

          {/* Índice de Oportunidade por Estado */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target size={16} className="text-emerald-500" />
                Índice de Oportunidade por Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={[
                    { estado: "SP", score: 95 }, { estado: "RJ", score: 88 },
                    { estado: "MG", score: 82 }, { estado: "BA", score: 78 },
                    { estado: "PA", score: 75 }, { estado: "PE", score: 72 },
                    { estado: "CE", score: 68 }, { estado: "PR", score: 65 },
                    { estado: "AM", score: 62 }, { estado: "GO", score: 58 },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="estado" tick={{ fontSize: 11 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]}>
                    {[95, 88, 82, 78, 75, 72, 68, 65, 62, 58].map((_, i) => {
                      const colors = ["#3b82f6", "#3b82f6", "#3b82f6", "#10b981", "#10b981", "#10b981", "#f59e0b", "#f59e0b", "#f59e0b", "#94a3b8"];
                      return <rect key={i} fill={colors[i]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ciclo de Mercado */}
          <Card className="border-0 shadow-sm xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap size={16} className="text-violet-500" />
                Análise de Ciclo do Mercado — Saneamento & Engenharia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    fase: "Expansão",
                    status: "ativo",
                    desc: "Volume de licitações crescente, preços em alta moderada. Marco Legal impulsiona investimentos.",
                    cor: "#10b981",
                    indicador: "78%",
                  },
                  {
                    fase: "Pico",
                    status: "proximo",
                    desc: "Previsto para Q3-Q4 2026. Capacidade instalada das construtoras pode limitar crescimento.",
                    cor: "#f59e0b",
                    indicador: "45%",
                  },
                  {
                    fase: "Contração",
                    status: "distante",
                    desc: "Sem sinais de desaceleração no curto prazo. Monitorar taxa de juros e câmbio.",
                    cor: "#ef4444",
                    indicador: "15%",
                  },
                  {
                    fase: "Recuperação",
                    status: "n/a",
                    desc: "Fase anterior à expansão atual. O mercado saiu desta fase em meados de 2025.",
                    cor: "#94a3b8",
                    indicador: "—",
                  },
                ].map((ciclo) => (
                  <div
                    key={ciclo.fase}
                    className="p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: ciclo.status === "ativo" ? ciclo.cor : "#e2e8f0",
                      backgroundColor: ciclo.status === "ativo" ? ciclo.cor + "08" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ciclo.cor }} />
                      <span className="text-xs font-bold">{ciclo.fase}</span>
                    </div>
                    <p className="text-2xl font-extrabold mb-2" style={{ color: ciclo.cor }}>
                      {ciclo.indicador}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">{ciclo.desc}</p>
                    {ciclo.status === "ativo" && (
                      <span className="inline-block mt-2 text-[0.55rem] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: ciclo.cor }}>
                        Fase Atual
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InsightsIA;
