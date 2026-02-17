import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  DollarSign,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Award,
  AlertTriangle,
  Activity,
  Users,
  Trophy,
  Building2,
} from "lucide-react";
import { dadosEmbutidosLicitacoes } from "@/data/licitacoes";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";
import type { Licitacao } from "@/types/database";

// ── Dados SINAPI vs SICRO ──
const comparacaoTabelas = [
  { insumo: "Cimento CP II (50kg)", sinapi: 34.5, sicro: 36.2, diferenca: 4.9 },
  { insumo: "Aço CA-50 Ø 10mm (kg)", sinapi: 7.85, sicro: 8.1, diferenca: 3.2 },
  { insumo: "Areia Média (m³)", sinapi: 125.0, sicro: 130.0, diferenca: 4.0 },
  { insumo: "Brita nº 1 (m³)", sinapi: 98.0, sicro: 102.0, diferenca: 4.1 },
  { insumo: "Concreto fck 25 (m³)", sinapi: 485.0, sicro: 510.0, diferenca: 5.2 },
  { insumo: "Tubo PVC 100mm (un)", sinapi: 42.9, sicro: 45.5, diferenca: 6.1 },
  { insumo: "Tubo PEAD 200mm (m)", sinapi: 89.5, sicro: 95.0, diferenca: 6.1 },
  { insumo: "Impermeabilizante (l)", sinapi: 22.4, sicro: 24.8, diferenca: 10.7 },
  { insumo: "Bomba 2CV (un)", sinapi: 3250.0, sicro: 3380.0, diferenca: 4.0 },
  { insumo: "Telha Fibroc. 6mm (un)", sinapi: 38.9, sicro: 40.2, diferenca: 3.3 },
];

// ── Evolução histórica de preços ──
const evolucaoPrecos = [
  { mes: "Set/25", cimento: 31.2, aco: 8.4, pvc: 35.8, concreto: 455 },
  { mes: "Out/25", cimento: 31.8, aco: 8.2, pvc: 36.5, concreto: 460 },
  { mes: "Nov/25", cimento: 32.5, aco: 8.0, pvc: 37.2, concreto: 468 },
  { mes: "Dez/25", cimento: 33.1, aco: 7.95, pvc: 38.5, concreto: 472 },
  { mes: "Jan/26", cimento: 33.8, aco: 7.9, pvc: 40.1, concreto: 478 },
  { mes: "Fev/26", cimento: 34.5, aco: 7.85, pvc: 42.9, concreto: 485 },
];

// ── Scoring por estado ──
const scoringEstados = [
  { estado: "SP", score: 92, licitacoes: 0, volume: 0, label: "Excelente" },
  { estado: "RJ", score: 85, licitacoes: 0, volume: 0, label: "Muito Bom" },
  { estado: "MG", score: 78, licitacoes: 0, volume: 0, label: "Bom" },
  { estado: "BA", score: 74, licitacoes: 0, volume: 0, label: "Bom" },
  { estado: "PE", score: 71, licitacoes: 0, volume: 0, label: "Bom" },
  { estado: "PR", score: 70, licitacoes: 0, volume: 0, label: "Bom" },
  { estado: "RS", score: 68, licitacoes: 0, volume: 0, label: "Regular" },
  { estado: "CE", score: 65, licitacoes: 0, volume: 0, label: "Regular" },
  { estado: "PA", score: 62, licitacoes: 0, volume: 0, label: "Regular" },
  { estado: "GO", score: 60, licitacoes: 0, volume: 0, label: "Regular" },
];

// ── Radar de oportunidade ──
const radarData = [
  { eixo: "Volume", saneamento: 85, infraestrutura: 70, construcao: 60 },
  { eixo: "Crescimento", saneamento: 90, infraestrutura: 55, construcao: 45 },
  { eixo: "Valor Médio", saneamento: 75, infraestrutura: 80, construcao: 65 },
  { eixo: "Concorrência", saneamento: 60, infraestrutura: 70, construcao: 80 },
  { eixo: "Prazo", saneamento: 70, infraestrutura: 65, construcao: 75 },
  { eixo: "Recorrência", saneamento: 80, infraestrutura: 60, construcao: 50 },
];

const CORES = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#f97316", "#ec4899"];

type TabAnalitico = "tendencias" | "comparacao" | "scoring" | "concorrencia";

function formatarValor(valor: number): string {
  if (valor >= 1e9) return `R$ ${(valor / 1e9).toFixed(1)}B`;
  if (valor >= 1e6) return `R$ ${(valor / 1e6).toFixed(1)}M`;
  if (valor >= 1e3) return `R$ ${(valor / 1e3).toFixed(0)}K`;
  return `R$ ${valor.toFixed(0)}`;
}

const Analitico = () => {
  const [tab, setTab] = useState<TabAnalitico>("tendencias");
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(dadosEmbutidosLicitacoes);

  useEffect(() => {
    fetch("./licitacoes.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setLicitacoes(data);
      })
      .catch(() => {});
  }, []);

  // ── Métricas computadas ──
  const metricas = useMemo(() => {
    const total = licitacoes.length;
    const volumeTotal = licitacoes.reduce((s, l) => s + (l.valor_estimado || 0), 0);
    const valorMedio = total > 0 ? volumeTotal / total : 0;

    const porCategoria: Record<string, { count: number; volume: number }> = {};
    licitacoes.forEach((l) => {
      if (!porCategoria[l.categoria]) porCategoria[l.categoria] = { count: 0, volume: 0 };
      porCategoria[l.categoria].count++;
      porCategoria[l.categoria].volume += l.valor_estimado || 0;
    });

    const porEstado: Record<string, { count: number; volume: number }> = {};
    licitacoes.forEach((l) => {
      if (!porEstado[l.estado]) porEstado[l.estado] = { count: 0, volume: 0 };
      porEstado[l.estado].count++;
      porEstado[l.estado].volume += l.valor_estimado || 0;
    });

    // Update scoring with real data
    const scoringAtualizado = scoringEstados.map((s) => ({
      ...s,
      licitacoes: porEstado[s.estado]?.count || 0,
      volume: porEstado[s.estado]?.volume || 0,
    }));

    // Volume by month
    const porMes: Record<string, { count: number; volume: number }> = {};
    licitacoes.forEach((l) => {
      if (l.data_abertura) {
        const [ano, mes] = l.data_abertura.split("-");
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const key = `${meses[parseInt(mes) - 1]}/${ano.slice(2)}`;
        if (!porMes[key]) porMes[key] = { count: 0, volume: 0 };
        porMes[key].count++;
        porMes[key].volume += l.valor_estimado || 0;
      }
    });

    const volumePorMes = Object.entries(porMes)
      .map(([mes, data]) => ({ mes, ...data }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    const categoriaPie = Object.entries(porCategoria)
      .map(([nome, data], i) => ({
        nome,
        valor: data.count,
        volume: data.volume,
        cor: CORES[i % CORES.length],
      }))
      .sort((a, b) => b.valor - a.valor);

    return {
      total,
      volumeTotal,
      valorMedio,
      scoringAtualizado,
      volumePorMes,
      categoriaPie,
    };
  }, [licitacoes]);

  // ── Dados de concorrência entre empresas ──
  const dadosConcorrencia = useMemo(() => {
    // Ranking por volume
    const rankingVolume = empresas
      .map((e) => ({
        nome: e.nome_fantasia,
        volume: e.volume_total_contratos,
        vitorias: e.licitacoes_vencidas,
        participacoes: e.licitacoes_participadas,
        taxa: e.taxa_vitoria,
        score: e.nota_score,
        porte: e.porte,
      }))
      .sort((a, b) => b.volume - a.volume);

    // Market share (pie)
    const totalVolume = empresas.reduce((s, e) => s + e.volume_total_contratos, 0);
    const marketShare = empresas
      .map((e, i) => ({
        nome: e.nome_fantasia,
        valor: e.volume_total_contratos,
        pct: totalVolume > 0 ? ((e.volume_total_contratos / totalVolume) * 100) : 0,
        cor: CORES[i % CORES.length],
      }))
      .sort((a, b) => b.valor - a.valor);

    // Concorrência por segmento — quem atua em cada segmento
    const segmentos: Record<string, { empresas: string[]; projetos: number; volume: number }> = {};
    empresas.forEach((e) => {
      e.segmentos.forEach((seg) => {
        if (!segmentos[seg]) segmentos[seg] = { empresas: [], projetos: 0, volume: 0 };
        segmentos[seg].empresas.push(e.nome_fantasia);
      });
    });
    projetos.forEach((p) => {
      if (segmentos[p.categoria]) {
        segmentos[p.categoria].projetos++;
        segmentos[p.categoria].volume += p.valor_contrato;
      }
    });
    const segmentosData = Object.entries(segmentos)
      .map(([nome, data]) => ({ nome, ...data }))
      .sort((a, b) => b.volume - a.volume);

    // Head-to-head: empresas que competem nos mesmos projetos
    const encontros: Record<string, { rivais: Record<string, number> }> = {};
    projetos.forEach((p) => {
      const ids = p.participantes.map((part) => part.empresa_id);
      ids.forEach((id1) => {
        if (!encontros[id1]) encontros[id1] = { rivais: {} };
        ids.forEach((id2) => {
          if (id1 !== id2) {
            encontros[id1].rivais[id2] = (encontros[id1].rivais[id2] || 0) + 1;
          }
        });
      });
    });

    const rivalidades = Object.entries(encontros)
      .flatMap(([empId, data]) =>
        Object.entries(data.rivais).map(([rivalId, count]) => ({
          empresa1: empresas.find((e) => e.id === empId)?.nome_fantasia || empId,
          empresa2: empresas.find((e) => e.id === rivalId)?.nome_fantasia || rivalId,
          encontros: count,
          key: [empId, rivalId].sort().join("-"),
        }))
      )
      .filter((r, i, arr) => arr.findIndex((x) => x.key === r.key) === i)
      .sort((a, b) => b.encontros - a.encontros);

    return { rankingVolume, marketShare, segmentosData, rivalidades, totalVolume };
  }, []);

  const tabs: { key: TabAnalitico; label: string; icon: typeof BarChart3 }[] = [
    { key: "tendencias", label: "Tendências", icon: TrendingUp },
    { key: "concorrencia", label: "Concorrência", icon: Users },
    { key: "comparacao", label: "SINAPI vs SICRO", icon: BarChart3 },
    { key: "scoring", label: "Scoring", icon: Target },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Activity size={28} className="text-primary" />
            Análises Avançadas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tendências históricas, comparação de tabelas e scoring de oportunidades
          </p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <BarChart3 size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase">
                  Licitações Rastreadas
                </p>
                <p className="text-xl font-extrabold">{metricas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <DollarSign size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase">
                  Volume Total
                </p>
                <p className="text-xl font-extrabold">{formatarValor(metricas.volumeTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <TrendingUp size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase">
                  Ticket Médio
                </p>
                <p className="text-xl font-extrabold">{formatarValor(metricas.valorMedio)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <MapPin size={20} className="text-violet-500" />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase">
                  Estados Ativos
                </p>
                <p className="text-xl font-extrabold">
                  {new Set(licitacoes.map((l) => l.estado)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
              tab === t.key
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-white text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Tendências ── */}
      {tab === "tendencias" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Evolução de Preços */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  Evolução de Preços — Últimos 6 Meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={evolucaoPrecos}>
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="cimento" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Cimento (sc)" />
                    <Line type="monotone" dataKey="aco" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Aço CA-50 (kg)" />
                    <Line type="monotone" dataKey="pvc" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Tubo PVC (un)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Volume de Licitações por Mês */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Volume de Licitações por Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={metricas.volumePorMes}>
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value) => [
                        String(value),
                        "Qtde",
                      ]}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Quantidade"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Distribuição por Categoria + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" />
                  Volume por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={220}>
                    <PieChart>
                      <Pie
                        data={metricas.categoriaPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="valor"
                      >
                        {metricas.categoriaPie.map((entry, i) => (
                          <Cell key={i} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "none" }}
                        formatter={(v) => [`${v} licitações`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 flex-1">
                    {metricas.categoriaPie.map((cat) => (
                      <div key={cat.nome} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.cor }} />
                        <span className="text-muted-foreground truncate flex-1">{cat.nome}</span>
                        <span className="font-bold">{cat.valor}</span>
                        <span className="text-muted-foreground">({formatarValor(cat.volume)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radar de Oportunidade */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Target size={16} className="text-primary" />
                  Radar de Oportunidade por Setor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="eixo" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                    <Radar name="Saneamento" dataKey="saneamento" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Infraestrutura" dataKey="infraestrutura" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                    <Radar name="Construção" dataKey="construcao" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "none" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Tab: Comparação SINAPI vs SICRO ── */}
      {tab === "comparacao" && (
        <div className="space-y-5">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" />
                  Comparativo SINAPI vs SICRO — Fev/2026
                </CardTitle>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-blue-500" /> SINAPI
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-violet-500" /> SICRO
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparacaoTabelas} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="insumo" type="category" tick={{ fontSize: 10 }} width={160} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(v) => [`R$ ${Number(v).toFixed(2)}`, ""]}
                  />
                  <Bar dataKey="sinapi" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} name="SINAPI" />
                  <Bar dataKey="sicro" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} name="SICRO" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela detalhada */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                Detalhamento por Insumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs">
                      <th className="text-left px-3 py-2.5 font-semibold">Insumo</th>
                      <th className="text-right px-3 py-2.5 font-semibold">SINAPI (R$)</th>
                      <th className="text-right px-3 py-2.5 font-semibold">SICRO (R$)</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Diferença</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Recomendação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparacaoTabelas.map((item) => (
                      <tr key={item.insumo} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2.5 font-medium">{item.insumo}</td>
                        <td className="text-right px-3 py-2.5 tabular-nums text-blue-600 font-semibold">
                          {item.sinapi.toFixed(2)}
                        </td>
                        <td className="text-right px-3 py-2.5 tabular-nums text-violet-600 font-semibold">
                          {item.sicro.toFixed(2)}
                        </td>
                        <td className="text-center px-3 py-2.5">
                          <span
                            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              item.diferenca > 5
                                ? "bg-red-100 text-red-700"
                                : item.diferenca > 3
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.diferenca > 0 ? <ArrowUpRight size={11} /> : item.diferenca < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                            {item.diferenca.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center px-3 py-2.5">
                          <span className="text-xs font-medium text-blue-600">
                            {item.sinapi < item.sicro ? "Usar SINAPI" : "Usar SICRO"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
                <Zap size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  Em média, a tabela SINAPI é <strong>5,1% mais econômica</strong> que a SICRO para insumos de
                  saneamento. Recomenda-se usar SINAPI como referência principal e SICRO para itens rodoviários.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Concorrência ── */}
      {tab === "concorrencia" && (
        <div className="space-y-5">
          {/* Market Share Pie + Ranking Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Market Share */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <DollarSign size={16} className="text-primary" />
                  Market Share por Volume de Contratos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie
                        data={dadosConcorrencia.marketShare.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="valor"
                      >
                        {dadosConcorrencia.marketShare.slice(0, 6).map((entry, i) => (
                          <Cell key={i} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "none" }}
                        formatter={(v) => [formatarValor(Number(v)), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {dadosConcorrencia.marketShare.slice(0, 6).map((emp) => (
                      <div key={emp.nome} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: emp.cor }} />
                        <span className="text-muted-foreground truncate flex-1">{emp.nome}</span>
                        <span className="font-bold">{emp.pct.toFixed(1)}%</span>
                      </div>
                    ))}
                    {dadosConcorrencia.marketShare.length > 6 && (
                      <p className="text-[0.6rem] text-muted-foreground">
                        + {dadosConcorrencia.marketShare.length - 6} empresas
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranking por Taxa de Vitória */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  Ranking — Taxa de Vitória em Licitações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={dadosConcorrencia.rankingVolume
                      .sort((a, b) => b.taxa - a.taxa)
                      .slice(0, 8)
                      .map((e) => ({ ...e, nome: e.nome.length > 18 ? e.nome.slice(0, 16) + "..." : e.nome }))}
                    layout="vertical"
                  >
                    <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 50]} unit="%" />
                    <YAxis dataKey="nome" type="category" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(v) => [`${Number(v).toFixed(1)}%`, "Taxa de Vitória"]}
                    />
                    <Bar dataKey="taxa" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ranking Geral — Tabela */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 size={16} className="text-primary" />
                Ranking Geral de Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs">
                      <th className="text-center px-3 py-2.5 font-semibold w-10">#</th>
                      <th className="text-left px-3 py-2.5 font-semibold">Empresa</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Porte</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Score</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Participações</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Vitórias</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Taxa</th>
                      <th className="text-right px-3 py-2.5 font-semibold">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosConcorrencia.rankingVolume.map((emp, i) => (
                      <tr key={emp.nome} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="text-center px-3 py-2.5 font-bold text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2.5 font-semibold">{emp.nome}</td>
                        <td className="text-center px-3 py-2.5">
                          <span className="text-[0.6rem] font-semibold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {emp.porte}
                          </span>
                        </td>
                        <td className="text-center px-3 py-2.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            emp.score >= 85 ? "bg-emerald-50 text-emerald-700" :
                            emp.score >= 70 ? "bg-blue-50 text-blue-700" :
                            emp.score >= 50 ? "bg-amber-50 text-amber-700" :
                            "bg-red-50 text-red-700"
                          }`}>
                            {emp.score}
                          </span>
                        </td>
                        <td className="text-center px-3 py-2.5 tabular-nums">{emp.participacoes}</td>
                        <td className="text-center px-3 py-2.5 tabular-nums font-semibold text-emerald-600">{emp.vitorias}</td>
                        <td className="text-center px-3 py-2.5">
                          <span className={`text-xs font-bold ${emp.taxa >= 40 ? "text-emerald-600" : emp.taxa >= 30 ? "text-blue-600" : "text-amber-600"}`}>
                            {emp.taxa.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right px-3 py-2.5 font-bold text-primary tabular-nums">
                          {formatarValor(emp.volume)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Concorrência por Segmento + Rivalidades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Concorrência por Segmento */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Target size={16} className="text-primary" />
                  Densidade Competitiva por Segmento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dadosConcorrencia.segmentosData.map((seg) => (
                    <div key={seg.nome}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{seg.nome}</span>
                        <span className="text-xs text-muted-foreground">
                          {seg.empresas.length} empresas · {seg.projetos} projetos
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min((seg.empresas.length / empresas.length) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {seg.empresas.slice(0, 5).map((nome) => (
                          <span key={nome} className="text-[0.55rem] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {nome}
                          </span>
                        ))}
                        {seg.empresas.length > 5 && (
                          <span className="text-[0.55rem] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            +{seg.empresas.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rivalidades (Head-to-Head) */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  Encontros em Projetos (Head-to-Head)
                </CardTitle>
                <p className="text-[0.65rem] text-muted-foreground mt-1">
                  Empresas que atuam juntas ou competem nos mesmos projetos
                </p>
              </CardHeader>
              <CardContent>
                {dadosConcorrencia.rivalidades.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum encontro registrado.</p>
                ) : (
                  <div className="space-y-3">
                    {dadosConcorrencia.rivalidades.map((r) => (
                      <div key={r.key} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{r.empresa1}</span>
                            <span className="text-xs text-muted-foreground">vs</span>
                            <span className="text-sm font-semibold">{r.empresa2}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                          {r.encontros} projeto{r.encontros > 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights de Concorrência */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm border-l-4 border-l-violet-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Award size={20} className="text-violet-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Líder de Mercado</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dadosConcorrencia.rankingVolume[0]?.nome} lidera com{" "}
                      {formatarValor(dadosConcorrencia.rankingVolume[0]?.volume || 0)} em contratos,
                      representando{" "}
                      {dadosConcorrencia.marketShare[0]?.pct.toFixed(1)}% do mercado mapeado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Trophy size={20} className="text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Melhor Taxa de Vitória</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {[...dadosConcorrencia.rankingVolume].sort((a, b) => b.taxa - a.taxa)[0]?.nome} tem a
                      maior taxa ({[...dadosConcorrencia.rankingVolume].sort((a, b) => b.taxa - a.taxa)[0]?.taxa.toFixed(1)}%),
                      indicando alta competitividade em processos licitatórios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Zap size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Segmento Mais Disputado</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dadosConcorrencia.segmentosData[0]?.nome} concentra{" "}
                      {dadosConcorrencia.segmentosData[0]?.empresas.length} empresas competindo,
                      com {formatarValor(dadosConcorrencia.segmentosData[0]?.volume || 0)} em projetos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Tab: Scoring de Oportunidades ── */}
      {tab === "scoring" && (
        <div className="space-y-5">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award size={18} className="text-primary" />
                Scoring de Oportunidades por Estado
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Score baseado em: volume de licitações, crescimento, valor médio, concorrência e recorrência
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metricas.scoringAtualizado.map((estado, i) => {
                  const color =
                    estado.score >= 80
                      ? "bg-emerald-500"
                      : estado.score >= 70
                      ? "bg-blue-500"
                      : estado.score >= 60
                      ? "bg-amber-500"
                      : "bg-red-500";
                  const textColor =
                    estado.score >= 80
                      ? "text-emerald-700"
                      : estado.score >= 70
                      ? "text-blue-700"
                      : estado.score >= 60
                      ? "text-amber-700"
                      : "text-red-700";
                  return (
                    <div key={estado.estado} className="flex items-center gap-4">
                      <span className="text-sm font-bold w-6 text-right text-muted-foreground">
                        {i + 1}.
                      </span>
                      <span className="text-sm font-bold w-8">{estado.estado}</span>
                      <div className="flex-1">
                        <div className="h-6 bg-muted rounded-full overflow-hidden relative">
                          <div
                            className={`h-full ${color} rounded-full transition-all flex items-center justify-end pr-2`}
                            style={{ width: `${estado.score}%` }}
                          >
                            <span className="text-[0.6rem] font-bold text-white">
                              {estado.score}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold w-20 text-right ${textColor}`}>
                        {estado.label}
                      </span>
                      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground w-40 justify-end">
                        <span>{estado.licitacoes} licit.</span>
                        <span>{estado.volume > 0 ? formatarValor(estado.volume) : "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp size={20} className="text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Oportunidade Alta</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      SP e RJ concentram maior volume e valor de licitações.
                      Ideal para empresas com capacidade de execução em larga escala.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Zap size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Mercado em Crescimento</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nordeste apresenta crescimento acelerado em licitações de saneamento,
                      impulsionado pelo Marco Legal (Lei 14.026).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Atenção</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Região Norte tem menor concorrência mas exige logística especializada.
                      Avalie custos de mobilização antes de participar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analitico;
