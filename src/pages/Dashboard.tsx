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
  Legend,
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
  Activity,
  Zap,
  Globe,
  ShieldCheck,
} from "lucide-react";
import noticiasEmbutidas, { type Noticia } from "@/data/noticias";
import { dadosEmbutidosLicitacoes } from "@/data/licitacoes";
import type { Licitacao } from "@/types/database";
import { urlSegura } from "@/lib/utils";

// ── Indicadores do setor ──
const indicadores = [
  { icon: Droplets, label: "Cobertura Água", valor: "84,2%", variacao: "+1,3%", positivo: true, cor: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Waves, label: "Coleta Esgoto", valor: "55,8%", variacao: "+2,1%", positivo: true, cor: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: DollarSign, label: "Investimento 2025", valor: "R$ 23,1 bi", variacao: "+15%", positivo: true, cor: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Users, label: "Sem Saneamento", valor: "100 mi", variacao: "-2,4%", positivo: true, cor: "text-red-500", bg: "bg-red-500/10" },
];

// ── Dados do gráfico de barras - Investimento por região ──
const investimentoPorRegiao = [
  { regiao: "Sudeste", valor: 9.2, fill: "#3b82f6" },
  { regiao: "Nordeste", valor: 5.8, fill: "#f59e0b" },
  { regiao: "Sul", valor: 3.4, fill: "#8b5cf6" },
  { regiao: "Norte", valor: 2.8, fill: "#10b981" },
  { regiao: "Centro-Oeste", valor: 1.9, fill: "#f97316" },
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

// ── Licitações por categoria ──
const CORES_CATEGORIAS = {
  Saneamento: "#3b82f6",
  Infraestrutura: "#8b5cf6",
  "Construção Civil": "#f59e0b",
  Engenharia: "#10b981",
  Outros: "#94a3b8",
};

// ── Alertas recentes ──
const alertasRecentes = [
  {
    tipo: "critico",
    titulo: "Rompimento de adutora em Manaus — 120 mil afetados",
    tempo: "2h atrás",
    icone: AlertTriangle,
  },
  {
    tipo: "mercado",
    titulo: "Cimento Portland CP-II: +4,2% no mês — acima do limiar SINAPI",
    tempo: "5h atrás",
    icone: TrendingUp,
  },
  {
    tipo: "licitacao",
    titulo: "Nova licitação R$ 125M — ETA Recife (COMPESA)",
    tempo: "8h atrás",
    icone: FileSearch,
  },
  {
    tipo: "mercado",
    titulo: "Aço CA-50: queda de -3,1% esta semana — oportunidade de compra",
    tempo: "12h atrás",
    icone: TrendingUp,
  },
  {
    tipo: "regulatorio",
    titulo: "ANA publica nova resolução sobre outorga de recursos hídricos",
    tempo: "1d atrás",
    icone: ShieldCheck,
  },
];

const alertaStyles: Record<string, string> = {
  critico: "border-l-red-500 bg-red-50",
  mercado: "border-l-amber-500 bg-amber-50",
  licitacao: "border-l-blue-500 bg-blue-50",
  regulatorio: "border-l-violet-500 bg-violet-50",
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

function formatarValor(valor: number): string {
  if (valor >= 1e9) return `R$ ${(valor / 1e9).toFixed(1)}B`;
  if (valor >= 1e6) return `R$ ${(valor / 1e6).toFixed(0)}M`;
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

const Dashboard = () => {
  const [noticias, setNoticias] = useState<Noticia[]>(noticiasEmbutidas);
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(dadosEmbutidosLicitacoes);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resN, resL] = await Promise.allSettled([
          fetch("./noticias.json").then((r) => (r.ok ? r.json() : null)),
          fetch("./licitacoes.json").then((r) => (r.ok ? r.json() : null)),
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
    return formatarValor(soma);
  }, [licitacoes]);

  const estadosAtivos = useMemo(
    () => new Set(licitacoes.map((l) => l.estado)).size,
    [licitacoes]
  );

  const licitacoesPorCategoria = useMemo(() => {
    const contagem: Record<string, number> = {};
    licitacoes.forEach((l) => {
      contagem[l.categoria] = (contagem[l.categoria] || 0) + 1;
    });
    return Object.entries(contagem)
      .map(([nome, valor]) => ({
        nome,
        valor: Math.round((valor / licitacoes.length) * 100),
        cor: CORES_CATEGORIAS[nome as keyof typeof CORES_CATEGORIAS] || "#94a3b8",
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [licitacoes]);

  const licitacoesPorRegiao = useMemo(() => {
    const regiaoMap: Record<string, string[]> = {
      Norte: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
      Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
      "Centro-Oeste": ["DF", "GO", "MS", "MT"],
      Sudeste: ["ES", "MG", "RJ", "SP"],
      Sul: ["PR", "RS", "SC"],
    };
    const contagem: Record<string, number> = {};
    licitacoes.forEach((l) => {
      for (const [regiao, estados] of Object.entries(regiaoMap)) {
        if (estados.includes(l.estado)) {
          contagem[regiao] = (contagem[regiao] || 0) + 1;
          break;
        }
      }
    });
    return Object.entries(contagem)
      .map(([regiao, total]) => ({ regiao, total }))
      .sort((a, b) => b.total - a.total);
  }, [licitacoes]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Activity size={28} className="text-primary" />
            Painel de Inteligência
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoramento em tempo real do setor de engenharia, saneamento e infraestrutura
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[0.65rem] font-semibold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Dados atualizados
          </span>
        </div>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {indicadores.map((ind) => (
          <Card key={ind.label} className="hover:shadow-md transition-shadow border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${ind.bg}`}>
                  <ind.icon size={20} className={ind.cor} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                    {ind.label}
                  </p>
                  <p className="text-xl lg:text-2xl font-extrabold mt-0.5">{ind.valor}</p>
                  <span
                    className={`inline-block text-[0.6rem] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                      ind.positivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ind.variacao}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards (Plataforma) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/noticias">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Newspaper size={20} className="opacity-80" />
                <ArrowRight size={14} className="opacity-50" />
              </div>
              <p className="text-2xl font-extrabold">{noticias.length}</p>
              <p className="text-xs text-white/70">Notícias Coletadas</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/licitacoes">
          <Card className="bg-gradient-to-br from-violet-600 to-violet-700 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <FileSearch size={20} className="opacity-80" />
                <ArrowRight size={14} className="opacity-50" />
              </div>
              <p className="text-2xl font-extrabold">{totalLicitacoes}</p>
              <p className="text-xs text-white/70">Licitações Ativas</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={20} className="opacity-80" />
              <Zap size={14} className="opacity-50" />
            </div>
            <p className="text-2xl font-extrabold">{valorTotal}</p>
            <p className="text-xs text-white/70">Volume em Licitações</p>
          </CardContent>
        </Card>
        <Link to="/mapa">
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Globe size={20} className="opacity-80" />
                <ArrowRight size={14} className="opacity-50" />
              </div>
              <p className="text-2xl font-extrabold">{estadosAtivos}</p>
              <p className="text-xs text-white/70">Estados com Licitações</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Evolução da Cobertura */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              Evolução da Cobertura Nacional (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={evolucaoCobertura}>
                <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                <YAxis domain={[45, 90]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value) => [`${value}%`, ""]}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="agua"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5 }}
                  name="Água"
                />
                <Line
                  type="monotone"
                  dataKey="esgoto"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                  name="Esgoto"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investimento por Região */}
        <Card className="border-0 shadow-sm">
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
                <YAxis dataKey="regiao" type="category" tick={{ fontSize: 11 }} width={85} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value) => [`R$ ${value}B`, ""]}
                />
                <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={24}>
                  {investimentoPorRegiao.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Notícias + Licitações + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Últimas Notícias */}
        <Card className="border-0 shadow-sm">
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
                href={urlSegura(n.link)}
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
                  <ExternalLink
                    size={14}
                    className="text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                {i < 4 && <div className="border-b border-border mt-3" />}
              </a>
            ))}
          </CardContent>
        </Card>

        {/* Últimas Licitações */}
        <Card className="border-0 shadow-sm">
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
              <Link key={i} to="/licitacoes" className="block group">
                <div>
                  <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {l.titulo}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[0.65rem] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Building2 size={10} />
                      <span className="truncate max-w-[120px]">{l.orgao}</span>
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
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="border-0 shadow-sm">
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
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{alerta.titulo}</p>
                    <p className="text-[0.65rem] text-muted-foreground mt-0.5">{alerta.tempo}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Licitações por Categoria (Pie Chart) + Licitações por Região + Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileSearch size={16} className="text-primary" />
              Licitações por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={licitacoesPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="valor"
                  >
                    {licitacoesPorCategoria.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {licitacoesPorCategoria.map((cat) => (
                  <div key={cat.nome} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: cat.cor }}
                    />
                    <span className="text-muted-foreground truncate">{cat.nome}</span>
                    <span className="font-bold ml-auto">{cat.valor}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Licitações por Região */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapIcon size={16} className="text-primary" />
              Distribuição por Região
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {licitacoesPorRegiao.map((r) => {
                const max = Math.max(...licitacoesPorRegiao.map((x) => x.total));
                const pct = (r.total / max) * 100;
                const cores: Record<string, string> = {
                  Norte: "bg-emerald-500",
                  Nordeste: "bg-amber-500",
                  "Centro-Oeste": "bg-orange-500",
                  Sudeste: "bg-blue-500",
                  Sul: "bg-violet-500",
                };
                return (
                  <div key={r.regiao}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{r.regiao}</span>
                      <span className="font-bold">{r.total} licitações</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cores[r.regiao] || "bg-gray-400"} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CTA Mapa */}
        <Card className="bg-gradient-to-br from-[#0f172a] via-[#162a4a] to-[#1e3a5f] text-white overflow-hidden border-0">
          <CardContent className="p-5 flex flex-col justify-center h-full relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <MapIcon size={28} className="text-primary mb-3" />
            <h3 className="text-lg font-bold mb-1.5">Mapa Interativo</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Explore licitações e indicadores de cobertura por estado em um mapa interativo do Brasil.
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
