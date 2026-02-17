import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BellRing,
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
  Mail,
  MailCheck,
  Send,
  Settings,
  CheckCircle2,
  Calendar,
  Target,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useLicitacoes } from "@/hooks/useLicitacoes";

// ── SINAPI Watch — Monitoramento de preços ──
interface InsumoSINAPI {
  nome: string;
  precoAtual: number;
  precoAnterior: number;
  precoMesAnterior2: number;
  unidade: string;
  variacao: number;
  tendencia: "alta" | "estavel" | "queda";
}

const insumosSINAPI: InsumoSINAPI[] = [
  { nome: "Cimento CP II-E-32 (50kg)", precoAtual: 34.50, precoAnterior: 33.12, precoMesAnterior2: 32.5, unidade: "sc", variacao: 4.2, tendencia: "alta" },
  { nome: "Aço CA-50 Ø 10mm", precoAtual: 7.85, precoAnterior: 7.95, precoMesAnterior2: 8.0, unidade: "kg", variacao: -1.3, tendencia: "queda" },
  { nome: "Tubo PVC DN 100mm (6m)", precoAtual: 42.90, precoAnterior: 38.50, precoMesAnterior2: 37.2, unidade: "un", variacao: 11.4, tendencia: "alta" },
  { nome: "Areia Média Lavada", precoAtual: 125.00, precoAnterior: 120.00, precoMesAnterior2: 118.0, unidade: "m³", variacao: 4.2, tendencia: "alta" },
  { nome: "Brita nº 1", precoAtual: 98.00, precoAnterior: 96.27, precoMesAnterior2: 95.5, unidade: "m³", variacao: 1.8, tendencia: "estavel" },
  { nome: "Concreto Usinado fck 25 MPa", precoAtual: 485.00, precoAnterior: 472.00, precoMesAnterior2: 468.0, unidade: "m³", variacao: 2.8, tendencia: "alta" },
  { nome: "Tubo PEAD DN 200mm", precoAtual: 89.50, precoAnterior: 76.20, precoMesAnterior2: 74.0, unidade: "m", variacao: 17.5, tendencia: "alta" },
  { nome: "Impermeabilizante Asfáltico", precoAtual: 22.40, precoAnterior: 21.12, precoMesAnterior2: 20.8, unidade: "l", variacao: 6.1, tendencia: "alta" },
  { nome: "Bomba Submersível 2CV", precoAtual: 3250.00, precoAnterior: 3276.00, precoMesAnterior2: 3290.0, unidade: "un", variacao: -0.8, tendencia: "queda" },
  { nome: "Telha Fibrocimento 6mm", precoAtual: 38.90, precoAnterior: 38.51, precoMesAnterior2: 38.3, unidade: "un", variacao: 1.0, tendencia: "estavel" },
];

// ── Alertas do sistema (enhanced) ──
type TipoAlerta = "critico" | "mercado" | "licitacao" | "regulatorio" | "ambiental" | "prazo" | "empresa" | "vinculo";

interface AlertaItem {
  tipo: TipoAlerta;
  titulo: string;
  descricao: string;
  tempo: string;
  fonte: string;
  prioridade: number; // 1-5
  acao?: string;
}

const alertas: AlertaItem[] = [
  {
    tipo: "critico",
    titulo: "Rompimento de adutora em Manaus/AM",
    descricao: "Barragem de captação na zona leste apresentou fissuras. SAAE mobilizou equipe de emergência. Impacto potencial em 120 mil habitantes.",
    tempo: "2h atrás",
    fonte: "Portal Saneamento Básico",
    prioridade: 5,
    acao: "Monitorar desdobramentos — pode gerar licitação emergencial.",
  },
  {
    tipo: "mercado",
    titulo: "Tubo PEAD DN 200: +17,5% — ALERTA VERMELHO",
    descricao: "Polietileno de alta densidade disparou por escassez de matéria-prima. Maior variação dos últimos 12 meses.",
    tempo: "5h atrás",
    fonte: "SINAPI Watch",
    prioridade: 5,
    acao: "Revisar orçamentos com PEAD imediatamente. Considerar alternativas (PVC, FoFo).",
  },
  {
    tipo: "prazo",
    titulo: "3 licitações vencem nos próximos 7 dias",
    descricao: "ETA Recife (R$ 45M, vence 20/02), Rede esgoto Salvador (R$ 78M, vence 21/02), Sistema abastecimento Belém (R$ 32M, vence 22/02).",
    tempo: "Hoje",
    fonte: "PNCP Radar",
    prioridade: 4,
    acao: "Verificar documentação e propostas antes do prazo.",
  },
  {
    tipo: "mercado",
    titulo: "Tubo PVC DN 100: +11,4% no mês",
    descricao: "Preço subiu de R$ 38,50 para R$ 42,90 no SINAPI de fevereiro. Segunda maior variação do período.",
    tempo: "5h atrás",
    fonte: "SINAPI Watch",
    prioridade: 4,
    acao: "Avaliar estoque e antecipar compras se possível.",
  },
  {
    tipo: "licitacao",
    titulo: "Nova licitação R$ 45M — ETA Recife/PE",
    descricao: "Edital de concorrência para construção de ETA no bairro Várzea. Prazo de execução: 36 meses. COMPESA.",
    tempo: "8h atrás",
    fonte: "PNCP",
    prioridade: 3,
  },
  {
    tipo: "regulatorio",
    titulo: "ANA publica nova resolução sobre outorga",
    descricao: "Resolução nº 15/2026 atualiza critérios de outorga de direito de uso de recursos hídricos para fins de saneamento.",
    tempo: "1d atrás",
    fonte: "Diário Oficial",
    prioridade: 3,
  },
  {
    tipo: "ambiental",
    titulo: "CEMADEN: alerta de chuvas intensas no RJ",
    descricao: "Previsão de acumulados superiores a 150mm nas próximas 48h na Região Serrana. Risco de deslizamentos em áreas de obra.",
    tempo: "1d atrás",
    fonte: "CEMADEN/INMET",
    prioridade: 3,
  },
  {
    tipo: "licitacao",
    titulo: "Licitação R$ 78M — Rede de esgoto Salvador/BA",
    descricao: "Pregão eletrônico para implantação de rede coletora nos bairros Cajazeiras e Fazenda Grande. EMBASA.",
    tempo: "2d atrás",
    fonte: "PNCP",
    prioridade: 2,
  },
  {
    tipo: "mercado",
    titulo: "Aço CA-50: queda de -1,3% — oportunidade de compra",
    descricao: "Tendência de queda no aço por 3 meses consecutivos. Bom momento para antecipar compras em projetos futuros.",
    tempo: "3d atrás",
    fonte: "SINAPI Watch",
    prioridade: 2,
    acao: "Considerar compra antecipada para projetos do 1º semestre.",
  },
  {
    tipo: "empresa",
    titulo: "Alteração societária — Nordeste Construções",
    descricao: "Mudança de quadro societário detectada na Receita Federal. Novo sócio com participação em 3 outras empresas do setor.",
    tempo: "1d atrás",
    fonte: "Receita Federal / ConstruData IA",
    prioridade: 4,
    acao: "Investigar vínculos do novo sócio no Grafo de Vínculos. Verificar se participa de licitações concorrentes.",
  },
  {
    tipo: "vinculo",
    titulo: "Vínculo recorrente detectado entre Aquaverde e Mineira",
    descricao: "As empresas Aquaverde Engenharia e Mineira Engenharia participam juntas em 2+ projetos. Possível relação comercial sistemática.",
    tempo: "2d atrás",
    fonte: "ConstruData IA — Análise de Grafos",
    prioridade: 3,
    acao: "Acessar o Grafo de Vínculos para visualizar conexões e verificar se há sobreposição em licitações.",
  },
  {
    tipo: "empresa",
    titulo: "Score de risco alterado — Catarinense Saneamento",
    descricao: "O score de risco caiu de 78 para 62 após detecção de atraso em projeto e baixa diversificação geográfica.",
    tempo: "3d atrás",
    fonte: "ConstruData IA — Risk Engine",
    prioridade: 3,
    acao: "Revisar dossiê da empresa e monitorar projetos em andamento.",
  },
  {
    tipo: "vinculo",
    titulo: "Empresa recente com alto volume — Possível anomalia",
    descricao: "Empresa fundada há menos de 5 anos detectada com volume de contratos acima de R$ 500M. Padrão atípico para o tempo de mercado.",
    tempo: "5d atrás",
    fonte: "ConstruData IA — Anomaly Detection",
    prioridade: 4,
    acao: "Verificar histórico completo no dossiê e red flags no score de risco multidimensional.",
  },
];

const tipoStyles: Record<TipoAlerta, { border: string; bg: string; icon: typeof AlertTriangle; label: string }> = {
  critico: { border: "border-l-red-500", bg: "bg-red-50", icon: AlertTriangle, label: "Crítico" },
  mercado: { border: "border-l-amber-500", bg: "bg-amber-50", icon: TrendingUp, label: "Mercado" },
  licitacao: { border: "border-l-blue-500", bg: "bg-blue-50", icon: FileSearch, label: "Licitação" },
  regulatorio: { border: "border-l-violet-500", bg: "bg-violet-50", icon: Info, label: "Regulatório" },
  ambiental: { border: "border-l-emerald-500", bg: "bg-emerald-50", icon: Droplets, label: "Ambiental" },
  prazo: { border: "border-l-orange-500", bg: "bg-orange-50", icon: Calendar, label: "Prazo" },
  empresa: { border: "border-l-pink-500", bg: "bg-pink-50", icon: AlertTriangle, label: "Empresa" },
  vinculo: { border: "border-l-cyan-500", bg: "bg-cyan-50", icon: Zap, label: "Vínculo" },
};

const AlertasInteligentes = () => {
  const [filtroTipo, setFiltroTipo] = useState<TipoAlerta | "todos">("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<number>(0);
  const [palavrasChave, setPalavrasChave] = useState<string[]>([
    "rompimento",
    "contaminação",
    "interdição",
    "licitação acima de R$ 10M",
  ]);
  const [novaPalavra, setNovaPalavra] = useState("");
  const [limiarSINAPI, setLimiarSINAPI] = useState(5);
  const [emailAlerta, setEmailAlerta] = useState("");
  const [emailAtivo, setEmailAtivo] = useState(false);
  const [frequencia, setFrequencia] = useState<"tempo_real" | "diario" | "semanal">("diario");
  const { dados: licitacoes } = useLicitacoes();

  const alertasFiltrados = useMemo(() => {
    return alertas
      .filter((a) => filtroTipo === "todos" || a.tipo === filtroTipo)
      .filter((a) => a.prioridade >= filtroPrioridade)
      .sort((a, b) => b.prioridade - a.prioridade);
  }, [filtroTipo, filtroPrioridade]);

  const insumosComAlerta = insumosSINAPI.filter((i) => Math.abs(i.variacao) >= limiarSINAPI);

  const prazosProximos = useMemo(() => {
    const hoje = new Date();
    const em7dias = new Date(hoje);
    em7dias.setDate(em7dias.getDate() + 7);
    return licitacoes.filter((l) => {
      if (!l.data_abertura) return false;
      const data = new Date(l.data_abertura + "T00:00:00");
      return data >= hoje && data <= em7dias;
    }).length;
  }, [licitacoes]);

  const adicionarPalavra = () => {
    const palavra = novaPalavra.trim();
    if (palavra && !palavrasChave.includes(palavra)) {
      setPalavrasChave([...palavrasChave, palavra]);
      setNovaPalavra("");
    }
  };

  const ativarEmail = () => {
    if (!emailAlerta.includes("@")) {
      toast.error("Informe um email válido");
      return;
    }
    setEmailAtivo(true);
    toast.success(`Alertas serão enviados para ${emailAlerta} (${frequencia})`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <BellRing size={28} className="text-primary" />
            Alertas Inteligentes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoramento avançado com priorização, prazos e notificações por email
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[0.65rem] font-semibold">
            <AlertTriangle size={12} />
            {insumosComAlerta.length} insumos em alerta
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[0.65rem] font-semibold">
            <Calendar size={12} />
            {prazosProximos} prazos em 7 dias
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Alertas Críticos", valor: alertas.filter((a) => a.prioridade >= 5).length, cor: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle },
          { label: "Alertas Mercado", valor: alertas.filter((a) => a.tipo === "mercado").length, cor: "text-amber-500", bg: "bg-amber-500/10", icon: TrendingUp },
          { label: "Novas Licitações", valor: alertas.filter((a) => a.tipo === "licitacao").length, cor: "text-blue-500", bg: "bg-blue-500/10", icon: FileSearch },
          { label: "Insumos em Alta", valor: insumosComAlerta.length, cor: "text-red-500", bg: "bg-red-500/10", icon: DollarSign },
          { label: "Prazos Próximos", valor: prazosProximos, cor: "text-orange-500", bg: "bg-orange-500/10", icon: Calendar },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={16} className={stat.cor} />
                </div>
                <div>
                  <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase">{stat.label}</p>
                  <p className="text-xl font-extrabold">{stat.valor}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Coluna Principal */}
        <div className="space-y-5">
          {/* SINAPI Watch Enhanced */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <DollarSign size={18} className="text-primary" />
                  SINAPI Watch — Monitoramento de Preços
                </CardTitle>
                <span className="text-[0.65rem] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Fev/2026 — São Paulo
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs">
                      <th className="text-left px-3 py-2.5 font-semibold">Insumo</th>
                      <th className="text-right px-3 py-2.5 font-semibold">Preço Atual</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Var. Mensal</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Tendência</th>
                      <th className="text-center px-3 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumosSINAPI.map((insumo) => {
                      const emAlerta = Math.abs(insumo.variacao) >= limiarSINAPI;
                      return (
                        <tr
                          key={insumo.nome}
                          className={`border-b last:border-0 transition-colors ${emAlerta ? "bg-red-50/50" : "hover:bg-muted/30"}`}
                        >
                          <td className="px-3 py-2.5">
                            <span className="font-medium">{insumo.nome}</span>
                            <span className="text-xs text-muted-foreground ml-1">/{insumo.unidade}</span>
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
                              {insumo.variacao > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {insumo.variacao > 0 ? "+" : ""}
                              {insumo.variacao.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-center px-3 py-2.5">
                            <span
                              className={`text-[0.65rem] font-semibold ${
                                insumo.tendencia === "alta"
                                  ? "text-red-600"
                                  : insumo.tendencia === "queda"
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {insumo.tendencia === "alta" ? "Alta" : insumo.tendencia === "queda" ? "Queda" : "Estável"}
                            </span>
                          </td>
                          <td className="text-center px-3 py-2.5">
                            {emAlerta ? (
                              <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-red-600">
                                <AlertTriangle size={12} /> ALERTA
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
            </CardContent>
          </Card>

          {/* Feed de Alertas com Prioridade */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                Feed de Alertas — Priorizados
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["todos", "critico", "mercado", "licitacao", "prazo", "regulatorio", "ambiental", "empresa", "vinculo"] as const).map(
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
                      {tipo === "todos" ? "Todos" : tipoStyles[tipo]?.label || tipo}
                    </button>
                  )
                )}
                {/* Filtro de prioridade */}
                <select
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(Number(e.target.value))}
                  className="text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border border-border bg-white text-muted-foreground"
                >
                  <option value={0}>Todas prioridades</option>
                  <option value={3}>Prioridade 3+</option>
                  <option value={4}>Prioridade 4+</option>
                  <option value={5}>Apenas críticos</option>
                </select>
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
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold leading-snug">{alerta.titulo}</h4>
                            <span
                              className={`text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full ${
                                alerta.prioridade >= 5
                                  ? "bg-red-200 text-red-800"
                                  : alerta.prioridade >= 4
                                  ? "bg-orange-200 text-orange-800"
                                  : alerta.prioridade >= 3
                                  ? "bg-amber-200 text-amber-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              P{alerta.prioridade}
                            </span>
                          </div>
                          <span className="text-[0.6rem] text-muted-foreground flex-shrink-0 flex items-center gap-0.5">
                            <Clock size={9} /> {alerta.tempo}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {alerta.descricao}
                        </p>
                        {alerta.acao && (
                          <div className="mt-2 p-2 bg-white/60 rounded-md border border-black/5">
                            <p className="text-xs font-medium flex items-center gap-1">
                              <Target size={11} className="text-primary" />
                              <span className="text-primary font-semibold">Ação recomendada:</span>{" "}
                              {alerta.acao}
                            </p>
                          </div>
                        )}
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

        {/* Coluna Lateral — Configurações avançadas */}
        <div className="space-y-4">
          {/* Notificações Email */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                Notificações por Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Receba alertas diretamente no seu email:
              </p>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={emailAlerta}
                onChange={(e) => setEmailAlerta(e.target.value)}
                className="text-sm"
              />
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Frequência:</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["tempo_real", "diario", "semanal"] as const).map((f) => {
                    const labels = { tempo_real: "Real-time", diario: "Diário", semanal: "Semanal" };
                    return (
                      <button
                        key={f}
                        onClick={() => setFrequencia(f)}
                        className={`text-[0.65rem] font-semibold py-1.5 rounded-lg border transition-colors ${
                          frequencia === f
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-muted-foreground border-border"
                        }`}
                      >
                        {labels[f]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button
                size="sm"
                className="w-full gap-1.5"
                onClick={ativarEmail}
                disabled={emailAtivo}
              >
                {emailAtivo ? (
                  <>
                    <MailCheck size={14} /> Ativo
                  </>
                ) : (
                  <>
                    <Send size={14} /> Ativar Alertas por Email
                  </>
                )}
              </Button>
              {emailAtivo && (
                <p className="text-[0.6rem] text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={10} /> Alertas configurados para {emailAlerta}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Limiar SINAPI */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings size={16} className="text-primary" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  Limiar SINAPI (variação %)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    step={0.5}
                    value={limiarSINAPI}
                    onChange={(e) => setLimiarSINAPI(Number(e.target.value))}
                    className="w-20 tabular-nums"
                  />
                  <span className="text-sm font-semibold">%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palavras-chave */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Filter size={16} className="text-primary" />
                Palavras-chave Monitoradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {palavrasChave.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full"
                  >
                    {p}
                    <button onClick={() => setPalavrasChave(palavrasChave.filter((x) => x !== p))} className="hover:text-red-900">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nova palavra..."
                  value={novaPalavra}
                  onChange={(e) => setNovaPalavra(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionarPalavra()}
                  className="text-sm"
                />
                <Button size="sm" onClick={adicionarPalavra} disabled={!novaPalavra.trim()}>
                  <Plus size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white border-0">
            <CardContent className="p-5">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
                Resumo de Alertas
              </h4>
              <div className="space-y-2">
                {[
                  { label: "Prioridade 5 (Crítico)", value: alertas.filter((a) => a.prioridade >= 5).length, color: "text-red-400" },
                  { label: "Prioridade 4 (Alto)", value: alertas.filter((a) => a.prioridade === 4).length, color: "text-orange-400" },
                  { label: "Prioridade 3 (Médio)", value: alertas.filter((a) => a.prioridade === 3).length, color: "text-amber-400" },
                  { label: "Prioridade 1-2 (Baixo)", value: alertas.filter((a) => a.prioridade <= 2).length, color: "text-blue-400" },
                  { label: "Insumos em alerta", value: insumosComAlerta.length, color: "text-red-400" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-sm text-white/70">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlertasInteligentes;
