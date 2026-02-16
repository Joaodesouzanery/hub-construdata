import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useLicitacoes } from "@/hooks/useLicitacoes";
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

type Ordenacao = "recente" | "valor_desc" | "valor_asc";

const modalidadeStyles: Record<string, string> = {
  "Concorrência": "bg-blue-100 text-blue-800",
  "Pregão Eletrônico": "bg-emerald-100 text-emerald-800",
  "Tomada de Preços": "bg-amber-100 text-amber-800",
  "Dispensa de Licitação": "bg-gray-100 text-gray-700",
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

const LicitacaoCard = ({ lic }: { lic: Licitacao }) => (
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
              modalidadeStyles[lic.modalidade] || "bg-gray-100 text-gray-700"
            }`}>
              {lic.modalidade}
            </span>
            <span className={`text-[0.6rem] font-semibold uppercase px-2 py-0.5 rounded-full ${
              categoriaStyles[lic.categoria] || "bg-gray-100 text-gray-700"
            }`}>
              {lic.categoria}
            </span>
          </div>

          <h3 className="text-sm font-semibold leading-snug mb-2 group-hover:text-primary transition-colors">
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
  const [busca, setBusca] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [regiaoFiltro, setRegiaoFiltro] = useState("Todas");
  const [faixaValor, setFaixaValor] = useState(0);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recente");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

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
    const soma = resultados.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);
    if (soma >= 1e9) return `R$ ${(soma / 1e9).toFixed(1)}B`;
    if (soma >= 1e6) return `R$ ${(soma / 1e6).toFixed(0)}M`;
    return `R$ ${soma.toLocaleString("pt-BR")}`;
  }, [resultados]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Carregando licitações...
      </div>
    );
  }

  return (
    <div>
      {/* Search + Filter Bar */}
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

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{resultados.length}</span> licitações encontradas
          </p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <DollarSign size={13} />
            Total: <span className="font-bold text-foreground">{valorTotalFiltrado}</span>
          </p>
        </div>
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
      </div>

      {/* Results List */}
      {resultados.length === 0 ? (
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
          {resultados.map((lic, index) => (
            <LicitacaoCard key={lic.numero_controle || lic.link + index} lic={lic} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LicitacoesSection;
