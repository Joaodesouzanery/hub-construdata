import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileSearch,
  DollarSign,
  Droplets,
  Zap,
  Plus,
  X,
  Info,
  Clock,
} from "lucide-react";

// ── SINAPI Watch — Monitoramento de preços ──
interface InsumoSINAPI {
  nome: string;
  precoAtual: number;
  precoAnterior: number;
  unidade: string;
  variacao: number;
  alerta: boolean;
}

const insumosSINAPI: InsumoSINAPI[] = [
  { nome: "Cimento CP II-E-32 (50kg)", precoAtual: 34.50, precoAnterior: 33.12, unidade: "sc", variacao: 4.2, alerta: false },
  { nome: "Aço CA-50 Ø 10mm", precoAtual: 7.85, precoAnterior: 7.95, unidade: "kg", variacao: -1.3, alerta: false },
  { nome: "Tubo PVC DN 100mm (6m)", precoAtual: 42.90, precoAnterior: 38.50, unidade: "un", variacao: 11.4, alerta: true },
  { nome: "Areia Média Lavada", precoAtual: 125.00, precoAnterior: 120.00, unidade: "m³", variacao: 4.2, alerta: false },
  { nome: "Brita nº 1", precoAtual: 98.00, precoAnterior: 96.27, unidade: "m³", variacao: 1.8, alerta: false },
  { nome: "Concreto Usinado fck 25 MPa", precoAtual: 485.00, precoAnterior: 472.00, unidade: "m³", variacao: 2.8, alerta: false },
  { nome: "Tubo PEAD DN 200mm", precoAtual: 89.50, precoAnterior: 76.20, unidade: "m", variacao: 17.5, alerta: true },
  { nome: "Impermeabilizante Asfáltico", precoAtual: 22.40, precoAnterior: 21.12, unidade: "l", variacao: 6.1, alerta: true },
  { nome: "Bomba Submersível 2CV", precoAtual: 3250.00, precoAnterior: 3276.00, unidade: "un", variacao: -0.8, alerta: false },
  { nome: "Telha Fibrocimento 6mm", precoAtual: 38.90, precoAnterior: 38.51, unidade: "un", variacao: 1.0, alerta: false },
];

// ── Alertas do sistema ──
type TipoAlerta = "critico" | "mercado" | "licitacao" | "regulatorio" | "ambiental";

interface AlertaItem {
  tipo: TipoAlerta;
  titulo: string;
  descricao: string;
  tempo: string;
  fonte: string;
}

const alertas: AlertaItem[] = [
  {
    tipo: "critico",
    titulo: "Rompimento de adutora em Manaus/AM",
    descricao: "Barragem de captação na zona leste apresentou fissuras. SAAE mobilizou equipe de emergência. Impacto potencial em 120 mil habitantes.",
    tempo: "2h atrás",
    fonte: "Portal Saneamento Básico",
  },
  {
    tipo: "mercado",
    titulo: "Tubo PVC DN 100: aumento de +11,4% no mês",
    descricao: "Preço do tubo PVC DN 100mm subiu de R$ 38,50 para R$ 42,90 no SINAPI de fevereiro. Maior variação nos últimos 6 meses.",
    tempo: "5h atrás",
    fonte: "SINAPI Watch",
  },
  {
    tipo: "mercado",
    titulo: "Tubo PEAD DN 200: aumento de +17,5% no mês",
    descricao: "Polietileno de alta densidade disparou por escassez de matéria-prima. Revisão de orçamentos em andamento recomendada.",
    tempo: "5h atrás",
    fonte: "SINAPI Watch",
  },
  {
    tipo: "licitacao",
    titulo: "Nova licitação R$ 45M — ETA Recife/PE",
    descricao: "Edital de concorrência para construção de Estação de Tratamento de Água no bairro Várzea. Prazo de execução: 36 meses.",
    tempo: "8h atrás",
    fonte: "PNCP",
  },
  {
    tipo: "regulatorio",
    titulo: "ANA publica nova resolução sobre outorga",
    descricao: "Resolução nº 15/2026 atualiza critérios de outorga de direito de uso de recursos hídricos para fins de saneamento.",
    tempo: "1d atrás",
    fonte: "Diário Oficial",
  },
  {
    tipo: "ambiental",
    titulo: "CEMADEN: alerta de chuvas intensas no RJ",
    descricao: "Previsão de acumulados superiores a 150mm nas próximas 48h na Região Serrana. Risco de deslizamentos em áreas de obra.",
    tempo: "1d atrás",
    fonte: "CEMADEN/INMET",
  },
  {
    tipo: "licitacao",
    titulo: "Licitação R$ 78M — Rede de esgoto Salvador/BA",
    descricao: "Pregão eletrônico para implantação de rede coletora de esgoto nos bairros Cajazeiras e Fazenda Grande. EMBASA.",
    tempo: "2d atrás",
    fonte: "PNCP",
  },
  {
    tipo: "critico",
    titulo: "Contaminação em manancial de Campinas/SP",
    descricao: "CETESB detectou níveis elevados de fósforo no Rio Atibaia. Investigação em andamento sobre descarte irregular.",
    tempo: "3d atrás",
    fonte: "CETESB",
  },
];

const tipoStyles: Record<TipoAlerta, { border: string; bg: string; icon: typeof AlertTriangle; label: string }> = {
  critico: { border: "border-l-red-500", bg: "bg-red-50", icon: AlertTriangle, label: "Crítico" },
  mercado: { border: "border-l-amber-500", bg: "bg-amber-50", icon: TrendingUp, label: "Mercado" },
  licitacao: { border: "border-l-blue-500", bg: "bg-blue-50", icon: FileSearch, label: "Licitação" },
  regulatorio: { border: "border-l-violet-500", bg: "bg-violet-50", icon: Info, label: "Regulatório" },
  ambiental: { border: "border-l-emerald-500", bg: "bg-emerald-50", icon: Droplets, label: "Ambiental" },
};

const LIMIAR_ALERTA = 5; // % de variação mensal para gerar alerta

const Alertas = () => {
  const [filtroTipo, setFiltroTipo] = useState<TipoAlerta | "todos">("todos");
  const [palavrasChave, setPalavrasChave] = useState<string[]>([
    "rompimento",
    "contaminação",
    "interdição",
    "licitação acima de R$ 10M",
  ]);
  const [novaPalavra, setNovaPalavra] = useState("");
  const [limiarSINAPI, setLimiarSINAPI] = useState(LIMIAR_ALERTA);

  const alertasFiltrados =
    filtroTipo === "todos"
      ? alertas
      : alertas.filter((a) => a.tipo === filtroTipo);

  const insumosComAlerta = insumosSINAPI.filter(
    (i) => Math.abs(i.variacao) >= limiarSINAPI
  );

  const adicionarPalavra = () => {
    const palavra = novaPalavra.trim();
    if (palavra && !palavrasChave.includes(palavra)) {
      setPalavrasChave([...palavrasChave, palavra]);
      setNovaPalavra("");
    }
  };

  const removerPalavra = (palavra: string) => {
    setPalavrasChave(palavrasChave.filter((p) => p !== palavra));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Bell size={28} className="text-primary" />
          Central de Alertas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitoramento de preços SINAPI, eventos críticos e oportunidades de licitação
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Coluna Principal */}
        <div className="space-y-6">
          {/* SINAPI Watch */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <DollarSign size={18} className="text-primary" />
                  SINAPI Watch — Monitoramento de Preços
                </CardTitle>
                <span className="text-[0.65rem] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Fev/2026 — São Paulo
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Insumos com variação acima de{" "}
                <span className="font-bold text-primary">{limiarSINAPI}%</span>{" "}
                são sinalizados em vermelho
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs">
                      <th className="text-left px-3 py-2.5 font-semibold">Insumo</th>
                      <th className="text-right px-3 py-2.5 font-semibold">Preço Anterior</th>
                      <th className="text-right px-3 py-2.5 font-semibold">Preço Atual</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Var. Mensal</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumosSINAPI.map((insumo) => {
                      const emAlerta = Math.abs(insumo.variacao) >= limiarSINAPI;
                      return (
                        <tr
                          key={insumo.nome}
                          className={`border-b last:border-0 transition-colors ${
                            emAlerta ? "bg-red-50/50" : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <span className="font-medium">{insumo.nome}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              /{insumo.unidade}
                            </span>
                          </td>
                          <td className="text-right px-3 py-2.5 text-muted-foreground tabular-nums">
                            R$ {insumo.precoAnterior.toFixed(2)}
                          </td>
                          <td className="text-right px-3 py-2.5 font-bold tabular-nums">
                            R$ {insumo.precoAtual.toFixed(2)}
                          </td>
                          <td className="text-center px-3 py-2.5">
                            <span
                              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                insumo.variacao > 0
                                  ? emAlerta
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                  : insumo.variacao < 0
                                  ? "bg-green-100 text-green-700"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {insumo.variacao > 0 ? (
                                <TrendingUp size={11} />
                              ) : insumo.variacao < 0 ? (
                                <TrendingDown size={11} />
                              ) : null}
                              {insumo.variacao > 0 ? "+" : ""}
                              {insumo.variacao.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-center px-3 py-2.5">
                            {emAlerta ? (
                              <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-red-600">
                                <AlertTriangle size={12} />
                                ALERTA
                              </span>
                            ) : (
                              <span className="text-[0.65rem] text-muted-foreground">Normal</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {insumosComAlerta.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>{insumosComAlerta.length} insumo(s)</strong> com variação acima de{" "}
                    {limiarSINAPI}% no mês. Recomenda-se revisar orçamentos em andamento.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feed de Alertas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                Feed de Alertas
              </CardTitle>
              {/* Filtros por tipo */}
              <div className="flex flex-wrap gap-2 mt-2">
                {(["todos", "critico", "mercado", "licitacao", "regulatorio", "ambiental"] as const).map(
                  (tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setFiltroTipo(tipo)}
                      className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                        filtroTipo === tipo
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {tipo === "todos"
                        ? "Todos"
                        : tipoStyles[tipo]?.label || tipo}
                    </button>
                  )
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertasFiltrados.map((alerta, i) => {
                const style = tipoStyles[alerta.tipo];
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-l-[3px] ${style.border} ${style.bg} transition-all hover:shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <style.icon size={18} className="mt-0.5 flex-shrink-0 opacity-70" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold leading-snug">
                            {alerta.titulo}
                          </h4>
                          <span className="text-[0.6rem] text-muted-foreground flex-shrink-0 flex items-center gap-0.5">
                            <Clock size={9} />
                            {alerta.tempo}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {alerta.descricao}
                        </p>
                        <span className="inline-block text-[0.6rem] text-muted-foreground mt-2 font-semibold">
                          Fonte: {alerta.fonte}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral — Configurações de alerta */}
        <div className="space-y-4">
          {/* Limiar SINAPI */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                Limiar SINAPI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Gerar alerta quando a variação mensal de um insumo ultrapassar:
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  value={limiarSINAPI}
                  onChange={(e) => setLimiarSINAPI(Number(e.target.value))}
                  className="w-24 tabular-nums"
                />
                <span className="text-sm font-semibold">%</span>
              </div>
              <p className="text-[0.65rem] text-muted-foreground mt-2">
                Valor padrão: 5%. Valores menores geram mais alertas.
              </p>
            </CardContent>
          </Card>

          {/* Palavras-chave monitoradas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-primary" />
                Palavras-chave Monitoradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Alertas são gerados quando estas palavras aparecem nas notícias:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {palavrasChave.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full"
                  >
                    {p}
                    <button
                      onClick={() => removerPalavra(p)}
                      className="hover:text-red-900 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nova palavra-chave..."
                  value={novaPalavra}
                  onChange={(e) => setNovaPalavra(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionarPalavra()}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={adicionarPalavra}
                  disabled={!novaPalavra.trim()}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Radar de Licitações */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileSearch size={16} className="text-primary" />
                Radar de Licitações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Monitoramento automático de editais relevantes do PNCP:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium">Valor mínimo</span>
                  <span className="text-xs font-bold text-primary">R$ 10M</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium">Categorias</span>
                  <span className="text-xs font-bold text-primary">Saneamento, Eng.</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium">Estados</span>
                  <span className="text-xs font-bold text-primary">Todos</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium">Frequência</span>
                  <span className="text-xs font-bold text-primary">Diário</span>
                </div>
              </div>
              <p className="text-[0.6rem] text-muted-foreground mt-3 flex items-center gap-1">
                <Info size={10} />
                Configuração será ativada com Supabase + Edge Functions
              </p>
            </CardContent>
          </Card>

          {/* Resumo de Alertas */}
          <Card className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white">
            <CardContent className="p-5">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
                Resumo Hoje
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Alertas críticos</span>
                  <span className="text-sm font-bold text-red-400">
                    {alertas.filter((a) => a.tipo === "critico").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Alertas mercado</span>
                  <span className="text-sm font-bold text-amber-400">
                    {alertas.filter((a) => a.tipo === "mercado").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Novas licitações</span>
                  <span className="text-sm font-bold text-blue-400">
                    {alertas.filter((a) => a.tipo === "licitacao").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Insumos em alerta</span>
                  <span className="text-sm font-bold text-red-400">
                    {insumosComAlerta.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Alertas;
