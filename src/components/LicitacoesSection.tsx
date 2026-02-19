import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ExternalLink,
  MapPin,
  Calendar,
  Building2,
  Loader2,
  ArrowUpDown,
  DollarSign,
  X,
  SlidersHorizontal,
  Wifi,
  Database,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useLicitacoes } from "@/hooks/useLicitacoes";
import { usePNCP } from "@/hooks/usePNCP";
import { urlSegura } from "@/lib/utils";
import type { Licitacao } from "@/types/database";

const ESTADOS = [
  "Todos", "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
  "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ",
  "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

const CATEGORIAS = [
  "Todas",
  "Saneamento",
  "Infraestrutura",
  "Construção Civil",
  "Engenharia",
];

const FAIXAS_VALOR = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Até R$ 10M", min: 0, max: 10_000_000 },
  { label: "R$ 10M - 50M", min: 10_000_000, max: 50_000_000 },
  { label: "R$ 50M - 100M", min: 50_000_000, max: 100_000_000 },
  { label: "Acima de R$ 100M", min: 100_000_000, max: Infinity },
];

const REGIOES: Record<string, string[]> = {
  Norte: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MS", "MT"],
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
};

const TERMOS_RAPIDOS = [
  "saneamento", "ETA tratamento água", "ETE esgoto", "adutora",
  "rede de esgoto", "drenagem", "barragem", "reservatório",
];

type Ordenacao = "recente" | "valor_desc" | "valor_asc";
type AbaAtiva = "local" | "pncp";

const modalidadeStyles: Record<string, string> = {
  "Concorrência": "bg-blue-100 text-blue-800",
  "Pregão Eletrônico": "bg-emerald-100 text-emerald-800",
  "Tomada de Preços": "bg-amber-100 text-amber-800",
  "Dispensa de Licitação": "bg-muted text-muted-foreground",
};

const categoriaStyles: Record<string, string> = {
  Saneamento: "bg-blue-100 text-blue-800",
  Infraestrutura: "bg-violet-100 text-violet-800",
  "Construção Civil": "bg-amber-100 text-amber-800",
  Engenharia: "bg-emerald-100 text-emerald-800",
};

function formatarDataBR(dataStr: string): string {
  if (!dataStr) return "—";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

const LicitacaoCard = ({ lic, isPNCP }: { lic: Licitacao; isPNCP?: boolean }) => (
  <a
    href={urlSegura(lic.link)}
    target="_blank"
    rel="noopener noreferrer"
    className="block"
  >
    <Card className="p-5 hover:shadow-md transition-all group border-0 shadow-sm hover:border-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-[0.6rem] font-semibold uppercase px-2 py-0.5 rounded-full ${
              modalidadeStyles[lic.modalidade] || "bg-muted text-muted-foreground"
            }`}>
              {lic.modalidade}
            </span>
            <span className={`text-[0.6rem] font-semibold uppercase px-2 py-0.5 rounded-full ${
              categoriaStyles[lic.categoria] || "bg-muted text-muted-foreground"
            }`}>
              {lic.categoria}
            </span>
            {isPNCP && (
              <span className="text-[0.6rem] font-semibold uppercase px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                <Wifi size={8} />
                PNCP
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {lic.titulo}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 size={12} />
              <span className="truncate max-w-[200px]">{lic.orgao}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {lic.estado}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatarDataBR(lic.data_abertura)}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="block text-sm font-bold text-primary">
            {lic.valor_estimado_fmt}
          </span>
          <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={11} />
            Ver edital
          </span>
        </div>
      </div>
    </Card>
  </a>
);

const LicitacoesSection = () => {
  const { dados: licitacoes, carregando } = useLicitacoes();
  const pncp = usePNCP();

  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("local");
  const [busca, setBusca] = useState("");
  const [buscaPNCP, setBuscaPNCP] = useState("");
  const [ufPNCP, setUfPNCP] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [regiaoFiltro, setRegiaoFiltro] = useState("Todas");
  const [faixaValor, setFaixaValor] = useState(0);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recente");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const handleBuscarPNCP = useCallback(() => {
    if (!buscaPNCP.trim()) return;
    pncp.buscar(buscaPNCP, ufPNCP === "Todos" ? undefined : ufPNCP);
  }, [buscaPNCP, ufPNCP, pncp]);

  const filtrosAtivos = useMemo(() => {
    let count = 0;
    if (estadoFiltro !== "Todos") count++;
    if (categoriaFiltro !== "Todas") count++;
    if (regiaoFiltro !== "Todas") count++;
    if (faixaValor !== 0) count++;
    if (busca) count++;
    return count;
  }, [estadoFiltro, categoriaFiltro, regiaoFiltro, faixaValor, busca]);

  const limparFiltros = () => {
    setBusca("");
    setEstadoFiltro("Todos");
    setCategoriaFiltro("Todas");
    setRegiaoFiltro("Todas");
    setFaixaValor(0);
  };

  const resultados = useMemo(() => {
    const faixa = FAIXAS_VALOR[faixaValor];
    const estadosRegiao = regiaoFiltro !== "Todas" ? REGIOES[regiaoFiltro] : null;

    let filtered = licitacoes.filter((lic) => {
      const buscaLower = busca.toLowerCase();
      const matchBusca =
        !busca ||
        lic.titulo.toLowerCase().includes(buscaLower) ||
        lic.orgao.toLowerCase().includes(buscaLower) ||
        lic.estado.toLowerCase().includes(buscaLower);
      const matchEstado = estadoFiltro === "Todos" || lic.estado === estadoFiltro;
      const matchCategoria = categoriaFiltro === "Todas" || lic.categoria === categoriaFiltro;
      const matchValor = lic.valor_estimado >= faixa.min && lic.valor_estimado <= faixa.max;
      const matchRegiao = !estadosRegiao || estadosRegiao.includes(lic.estado);
      return matchBusca && matchEstado && matchCategoria && matchValor && matchRegiao;
    });

    filtered.sort((a, b) => {
      if (ordenacao === "valor_desc") return b.valor_estimado - a.valor_estimado;
      if (ordenacao === "valor_asc") return a.valor_estimado - b.valor_estimado;
      return new Date(b.data_abertura).getTime() - new Date(a.data_abertura).getTime();
    });

    return filtered;
  }, [licitacoes, busca, estadoFiltro, categoriaFiltro, faixaValor, regiaoFiltro, ordenacao]);

  const valorTotalFiltrado = useMemo(() => {
    const lista = abaAtiva === "local" ? resultados : pncp.resultados;
    const soma = lista.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);
    if (soma >= 1e9) return `R$ ${(soma / 1e9).toFixed(1)}B`;
    if (soma >= 1e6) return `R$ ${(soma / 1e6).toFixed(0)}M`;
    return `R$ ${soma.toLocaleString("pt-BR")}`;
  }, [abaAtiva, resultados, pncp.resultados]);

  if (carregando && abaAtiva === "local") {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Carregando licitações...
      </div>
    );
  }

  const listaAtual = abaAtiva === "local" ? resultados : pncp.resultados;

  return (
    <div>
      {/* Tabs: Local vs PNCP */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={abaAtiva === "local" ? "default" : "outline"}
          size="sm"
          onClick={() => setAbaAtiva("local")}
          className="flex items-center gap-1.5"
        >
          <Database size={14} />
          Base Local
          <span className="ml-1 text-[0.6rem] opacity-70">({licitacoes.length})</span>
        </Button>
        <Button
          variant={abaAtiva === "pncp" ? "default" : "outline"}
          size="sm"
          onClick={() => setAbaAtiva("pncp")}
          className="flex items-center gap-1.5"
        >
          <Globe size={14} />
          PNCP Tempo Real
          {pncp.resultados.length > 0 && (
            <span className="ml-1 text-[0.6rem] opacity-70">({pncp.totalRegistros})</span>
          )}
        </Button>
      </div>

      {/* PNCP Search Bar */}
      {abaAtiva === "pncp" && (
        <Card className="p-4 mb-5 border-0 shadow-sm border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 mb-3">
            <Wifi size={14} className="text-green-500" />
            <span className="text-xs font-semibold text-green-700">
              Busca em tempo real no Portal Nacional de Contratações Públicas
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Ex: saneamento, ETA, esgoto, adutora..."
                value={buscaPNCP}
                onChange={(e) => setBuscaPNCP(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscarPNCP()}
                className="pl-9 text-sm"
              />
            </div>
            <select
              value={ufPNCP}
              onChange={(e) => setUfPNCP(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm w-full sm:w-28"
            >
              {ESTADOS.map((uf) => (
                <option key={uf} value={uf}>{uf === "Todos" ? "Todos UFs" : uf}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={handleBuscarPNCP}
              disabled={pncp.buscando || !buscaPNCP.trim()}
              className="flex items-center gap-1.5"
            >
              {pncp.buscando ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Buscar PNCP
            </Button>
          </div>

          {/* Quick search chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[0.6rem] text-muted-foreground mr-1 self-center">Busca rápida:</span>
            {TERMOS_RAPIDOS.map((t) => (
              <button
                key={t}
                onClick={() => { setBuscaPNCP(t); pncp.buscar(t, ufPNCP === "Todos" ? undefined : ufPNCP); }}
                className="text-[0.6rem] px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>

          {pncp.erro && (
            <div className="flex items-center gap-2 mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded">
              <AlertCircle size={14} />
              <span>API PNCP indisponível no momento. Tente novamente em alguns minutos.</span>
            </div>
          )}

          {pncp.totalRegistros > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Mostrando {pncp.resultados.length} de {pncp.totalRegistros.toLocaleString("pt-BR")} resultados no PNCP
            </p>
          )}
        </Card>
      )}

      {/* Local Search + Filter Bar */}
      {abaAtiva === "local" && (
        <Card className="p-4 mb-5 border-0 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Buscar por palavra-chave, órgão, estado..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={mostrarFiltros ? "default" : "outline"}
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-1.5"
              >
                <SlidersHorizontal size={14} />
                Filtros
                {filtrosAtivos > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-[0.6rem] font-bold flex items-center justify-center">
                    {filtrosAtivos}
                  </span>
                )}
              </Button>
              {filtrosAtivos > 0 && (
                <Button variant="ghost" size="sm" onClick={limparFiltros} className="text-xs">
                  <X size={14} className="mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Smart Filters */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Região
                </label>
                <select
                  value={regiaoFiltro}
                  onChange={(e) => { setRegiaoFiltro(e.target.value); setEstadoFiltro("Todos"); }}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="Todas">Todas as regiões</option>
                  {Object.keys(REGIOES).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Estado
                </label>
                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {ESTADOS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Categoria
                </label>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Faixa de Valor
                </label>
                <select
                  value={faixaValor}
                  onChange={(e) => setFaixaValor(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {FAIXAS_VALOR.map((f, i) => (
                    <option key={i} value={i}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{listaAtual.length}</span> licitações
            {abaAtiva === "pncp" && pncp.totalRegistros > 0 && (
              <span className="text-xs"> de {pncp.totalRegistros.toLocaleString("pt-BR")}</span>
            )}
          </p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <DollarSign size={13} />
            Total: <span className="font-bold text-foreground">{valorTotalFiltrado}</span>
          </p>
        </div>
        {abaAtiva === "local" && (
          <div className="flex items-center gap-2">
            <ArrowUpDown size={13} className="text-muted-foreground" />
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
              className="h-8 px-2 rounded-md border border-input bg-background text-xs"
            >
              <option value="recente">Mais recentes</option>
              <option value="valor_desc">Maior valor</option>
              <option value="valor_asc">Menor valor</option>
            </select>
          </div>
        )}
      </div>

      {/* Results List */}
      {abaAtiva === "pncp" && pncp.buscando ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" size={20} />
          Buscando no PNCP...
        </div>
      ) : abaAtiva === "pncp" && pncp.resultados.length === 0 && !pncp.buscando ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Busque licitações em tempo real</p>
          <p className="text-sm mt-1">
            Digite um termo acima e clique em "Buscar PNCP" para consultar o portal oficial.
          </p>
          <p className="text-xs mt-3 text-muted-foreground/60">
            Fonte: pncp.gov.br — Portal Nacional de Contratações Públicas
          </p>
        </div>
      ) : listaAtual.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhuma licitação encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou a palavra-chave.</p>
          {filtrosAtivos > 0 && (
            <Button variant="outline" size="sm" onClick={limparFiltros} className="mt-3">
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {listaAtual.map((lic, index) => (
            <LicitacaoCard
              key={lic.numero_controle || lic.link + index}
              lic={lic}
              isPNCP={abaAtiva === "pncp"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LicitacoesSection;
