import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Newspaper,
  FileSearch,
  TrendingUp,
  Droplets,
  Bell,
  ArrowRight,
  ExternalLink,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Waves,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Map as MapIcon,
} from "lucide-react";
import noticiasEmbutidas, { type Noticia } from "@/data/noticias";
import { dadosEmbutidosLicitacoes } from "@/data/licitacoes";
import type { Licitacao } from "@/types/database";

// ── Indicadores do setor ──
const indicadores = [
  { icon: Droplets, label: "Cobertura Água", valor: "84,2%", variacao: "+1,3%", cor: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Waves, label: "Coleta Esgoto", valor: "55,8%", variacao: "+2,1%", cor: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: DollarSign, label: "Investimento 2025", valor: "R$ 23,1 bi", variacao: "+15%", cor: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Users, label: "Sem Saneamento", valor: "100 mi", variacao: "-2,4%", cor: "text-red-500", bg: "bg-red-500/10" },
];

// ── Dados do gráfico de barras - Investimento por região ──
const investimentoPorRegiao = [
  { regiao: "Sudeste", valor: 9.2 },
  { regiao: "Nordeste", valor: 5.8 },
  { regiao: "Sul", valor: 3.4 },
  { regiao: "Norte", valor: 2.8 },
  { regiao: "Centro-Oeste", valor: 1.9 },
];

// ── Dados do gráfico de linha - Evolução cobertura ──
const evolucaoCobertura = [
  { ano: "2020", agua: 80.1, esgoto: 49.2 },
  { ano: "2021", agua: 81.0, esgoto: 50.8 },
  { ano: "2022", agua: 82.1, esgoto: 52.0 },
  { ano: "2023", agua: 82.9, esgoto: 53.4 },
  { ano: "2024", agua: 83.5, esgoto: 54.1 },
  { ano: "2025", agua: 84.2, esgoto: 55.8 },
];

// ── Dados do gráfico pizza - Licitações por categoria ──
const licitacoesPorCategoria = [
  { nome: "Saneamento", valor: 35, cor: "#3b82f6" },
  { nome: "Infraestrutura", valor: 25, cor: "#8b5cf6" },
  { nome: "Construção Civil", valor: 20, cor: "#f59e0b" },
  { nome: "Engenharia", valor: 12, cor: "#10b981" },
  { nome: "Outros", valor: 8, cor: "#94a3b8" },
];

// ── Alertas recentes ──
const alertasRecentes = [
  {
    tipo: "critico",
    titulo: "Rompimento de adutora em Manaus",
    tempo: "2h atrás",
    icone: AlertTriangle,
  },
  {
    tipo: "mercado",
    titulo: "Cimento: +4,2% no mês — acima do limiar",
    tempo: "5h atrás",
    icone: TrendingUp,
  },
  {
    tipo: "licitacao",
    titulo: "Nova licitação R$ 45M — ETA Recife",
    tempo: "8h atrás",
    icone: FileSearch,
  },
  {
    tipo: "mercado",
    titulo: "Aço CA-50: queda de -3,1% esta semana",
    tempo: "12h atrás",
    icone: TrendingUp,
  },
];

const alertaStyles: Record<string, string> = {
  critico: "border-l-red-500 bg-red-50",
  mercado: "border-l-amber-500 bg-amber-50",
  licitacao: "border-l-blue-500 bg-blue-50",
};

function formatarData(dataStr: string): string {
  try {
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return "";
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${data.getDate().toString().padStart(2, "0")} ${meses[data.getMonth()]}`;
  } catch {
    return "";
  }
}

const Dashboard = () => {
  const [noticias, setNoticias] = useState<Noticia[]>(noticiasEmbutidas);
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(dadosEmbutidosLicitacoes);
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resN, resL] = await Promise.allSettled([
          fetch("./noticias.json").then((r) => r.ok ? r.json() : null),
          fetch("./licitacoes.json").then((r) => r.ok ? r.json() : null),
        ]);
        if (resN.status === "fulfilled" && Array.isArray(resN.value) && resN.value.length > 0) {
          setNoticias(resN.value);
        }
        if (resL.status === "fulfilled" && Array.isArray(resL.value) && resL.value.length > 0) {
          setLicitacoes(resL.value);
        }
      } catch {
        /* mantém dados embutidos */
      }
    };
    carregarDados();
  }, []);

  const totalLicitacoes = licitacoes.length;
  const valorTotal = useMemo(() => {
    const soma = licitacoes.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);
    if (soma >= 1e9) return `R$ ${(soma / 1e9).toFixed(1)}B`;
    if (soma >= 1e6) return `R$ ${(soma / 1e6).toFixed(1)}M`;
    return `R$ ${soma.toLocaleString("pt-BR")}`;
  }, [licitacoes]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral do setor de engenharia e saneamento
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Atualizado em {new Date().toLocaleDateString("pt-BR")}
        </div>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {indicadores.map((ind) => (
          <Card key={ind.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${ind.bg}`}>
                  <ind.icon size={20} className={ind.cor} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                    {ind.label}
                  </p>
                  <p className="text-xl lg:text-2xl font-extrabold mt-0.5">{ind.valor}</p>
                  <span className="inline-block text-[0.65rem] font-semibold mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    {ind.variacao}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards (Plataforma) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-4">
            <Newspaper size={20} className="mb-2 opacity-80" />
            <p className="text-2xl font-extrabold">{noticias.length}</p>
            <p className="text-xs text-white/70">Notícias Coletadas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-600 to-violet-700 text-white">
          <CardContent className="p-4">
            <FileSearch size={20} className="mb-2 opacity-80" />
            <p className="text-2xl font-extrabold">{totalLicitacoes}</p>
            <p className="text-xs text-white/70">Licitações Ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <DollarSign size={20} className="mb-2 opacity-80" />
            <p className="text-2xl font-extrabold">{valorTotal}</p>
            <p className="text-xs text-white/70">Valor em Licitações</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <Bell size={20} className="mb-2 opacity-80" />
            <p className="text-2xl font-extrabold">{alertasRecentes.length}</p>
            <p className="text-xs text-white/70">Alertas Ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução da Cobertura */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              Evolução da Cobertura (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={evolucaoCobertura}>
                <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                <YAxis domain={[45, 90]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value) => [`${value}%`, ""]}
                />
                <Line
                  type="monotone"
                  dataKey="agua"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Água"
                />
                <Line
                  type="monotone"
                  dataKey="esgoto"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Esgoto"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 rounded" /> Água
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 rounded" /> Esgoto
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Investimento por Região */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <DollarSign size={16} className="text-primary" />
              Investimento por Região (R$ bi)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={investimentoPorRegiao} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="regiao" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value) => [`R$ ${value}B`, ""]}
                />
                <Bar dataKey="valor" fill="hsl(221, 83%, 49%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Notícias + Licitações + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Notícias */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Newspaper size={16} className="text-primary" />
                Últimas Notícias
              </CardTitle>
              <Link
                to="/noticias"
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                Ver todas <ChevronRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {noticias.slice(0, 5).map((n, i) => (
              <a
                key={i}
                href={n.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {n.titulo}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[0.65rem] text-muted-foreground">
                      <span className="font-semibold text-primary/80">{n.fonte}</span>
                      {formatarData(n.data_publicacao) && (
                        <>
                          <span>·</span>
                          <span>{formatarData(n.data_publicacao)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {i < 4 && <div className="border-b border-border mt-3" />}
              </a>
            ))}
          </CardContent>
        </Card>

        {/* Últimas Licitações */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileSearch size={16} className="text-primary" />
                Licitações Recentes
              </CardTitle>
              <Link
                to="/licitacoes"
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                Ver todas <ChevronRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {licitacoes.slice(0, 5).map((l, i) => (
              <a
                key={i}
                href={l.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div>
                  <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {l.titulo}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[0.65rem] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Building2 size={10} />
                      {l.orgao}
                    </span>
                    <span>·</span>
                    <span className="font-bold text-primary">{l.valor_estimado_fmt}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin size={10} />
                      {l.estado}
                    </span>
                  </div>
                </div>
                {i < 4 && <div className="border-b border-border mt-3" />}
              </a>
            ))}
            {licitacoes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Execute <code className="bg-muted px-1 rounded text-xs">node coletor.js</code> para coletar licitações
              </p>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                Alertas Recentes
              </CardTitle>
              <Link
                to="/alertas"
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertasRecentes.map((alerta, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border-l-[3px] ${alertaStyles[alerta.tipo]}`}
              >
                <div className="flex items-start gap-2">
                  <alerta.icone size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium leading-snug">{alerta.titulo}</p>
                    <p className="text-[0.65rem] text-muted-foreground mt-0.5">{alerta.tempo}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Licitações por Categoria (Pie Chart) + Mapa link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileSearch size={16} className="text-primary" />
              Licitações por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={licitacoesPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="valor"
                  >
                    {licitacoesPorCategoria.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {licitacoesPorCategoria.map((cat) => (
                  <div key={cat.nome} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: cat.cor }}
                    />
                    <span className="text-muted-foreground">{cat.nome}</span>
                    <span className="font-bold ml-auto">{cat.valor}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Mapa */}
        <Card className="bg-gradient-to-br from-[#0f172a] via-[#162a4a] to-[#1e3a5f] text-white overflow-hidden">
          <CardContent className="p-6 flex flex-col justify-center h-full relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <MapIcon size={32} className="text-primary mb-4" />
            <h3 className="text-lg font-bold mb-2">Mapa do Brasil</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Visualize licitações, indicadores e infraestrutura por estado em um mapa interativo.
            </p>
            <Link
              to="/mapa"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors w-fit"
            >
              Explorar Mapa
              <ArrowRight size={16} />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
