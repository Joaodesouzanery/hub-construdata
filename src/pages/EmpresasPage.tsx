import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Building2,
  MapPin,
  Trophy,
  TrendingUp,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  FileText,
  Briefcase,
} from "lucide-react";
import { useEmpresas } from "@/hooks/useEmpresas";
import { projetos } from "@/data/projetos";
import type { Empresa } from "@/types/database";

const SEGMENTOS = ["Todos", "Saneamento", "Infraestrutura", "Construcao Civil", "Engenharia"];
const PORTES = ["Todos", "MEI", "ME", "EPP", "Media", "Grande"];
const ESTADOS_UF = [
  "Todos", "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
  "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ",
  "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

type Ordenacao = "score" | "taxa_vitoria" | "volume" | "nome";

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600 bg-emerald-50";
  if (score >= 70) return "text-blue-600 bg-blue-50";
  if (score >= 50) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Regular";
  return "Atencao";
}

function porteLabel(porte: string): string {
  const map: Record<string, string> = {
    MEI: "Microempreendedor",
    ME: "Microempresa",
    EPP: "Peq. Porte",
    Media: "Medio Porte",
    Grande: "Grande Porte",
  };
  return map[porte] || porte;
}

const EmpresaCard = ({ empresa }: { empresa: Empresa }) => {
  const navigate = useNavigate();
  const projetosAtivos = projetos.filter(
    (p) => p.empresa_responsavel_id === empresa.id && p.status !== "Concluido"
  ).length;

  return (
    <Card
      className="p-5 hover:shadow-md transition-all cursor-pointer group border-0 shadow-sm hover:border-primary/20"
      onClick={() => navigate(`/empresas/${empresa.id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded-full ${scoreColor(empresa.nota_score)}`}>
              {scoreLabel(empresa.nota_score)} ({empresa.nota_score})
            </span>
            <span className="text-[0.6rem] font-semibold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {porteLabel(empresa.porte)}
            </span>
            {empresa.segmentos.map((seg) => (
              <span key={seg} className="text-[0.6rem] font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                {seg}
              </span>
            ))}
          </div>

          <h3 className="text-sm font-bold leading-snug mb-1 group-hover:text-primary transition-colors">
            {empresa.nome_fantasia}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{empresa.razao_social}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {empresa.cidade_sede}/{empresa.estado_sede}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              CNPJ: {empresa.cnpj}
            </span>
            <span className="flex items-center gap-1">
              <FileText size={12} />
              Desde {empresa.ano_fundacao}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0 space-y-1">
          <div className="flex items-center gap-1 justify-end">
            <Trophy size={13} className="text-amber-500" />
            <span className="text-sm font-bold text-foreground">{empresa.taxa_vitoria}%</span>
          </div>
          <p className="text-[0.6rem] text-muted-foreground">
            {empresa.licitacoes_vencidas}/{empresa.licitacoes_participadas} licitacoes
          </p>
          <p className="text-xs font-semibold text-primary">{empresa.volume_total_fmt}</p>
          {projetosAtivos > 0 && (
            <span className="inline-flex items-center gap-1 text-[0.6rem] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              <TrendingUp size={10} />
              {projetosAtivos} projeto{projetosAtivos > 1 ? "s" : ""} ativo{projetosAtivos > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

const EmpresasPage = () => {
  const { dados: empresas } = useEmpresas();
  const [busca, setBusca] = useState("");
  const [segmentoFiltro, setSegmentoFiltro] = useState("Todos");
  const [porteFiltro, setPorteFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("score");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const filtrosAtivos = useMemo(() => {
    let count = 0;
    if (segmentoFiltro !== "Todos") count++;
    if (porteFiltro !== "Todos") count++;
    if (estadoFiltro !== "Todos") count++;
    if (busca) count++;
    return count;
  }, [segmentoFiltro, porteFiltro, estadoFiltro, busca]);

  const limparFiltros = () => {
    setBusca("");
    setSegmentoFiltro("Todos");
    setPorteFiltro("Todos");
    setEstadoFiltro("Todos");
  };

  const resultados = useMemo(() => {
    let filtered = empresas.filter((emp) => {
      const buscaLower = busca.toLowerCase();
      const matchBusca =
        !busca ||
        emp.nome_fantasia.toLowerCase().includes(buscaLower) ||
        emp.razao_social.toLowerCase().includes(buscaLower) ||
        emp.cnpj.includes(busca) ||
        emp.especialidades.some((e) => e.toLowerCase().includes(buscaLower));
      const matchSegmento =
        segmentoFiltro === "Todos" ||
        emp.segmentos.some((s) => s === segmentoFiltro);
      const matchPorte = porteFiltro === "Todos" || emp.porte === porteFiltro;
      const matchEstado = estadoFiltro === "Todos" || emp.estado_sede === estadoFiltro;
      return matchBusca && matchSegmento && matchPorte && matchEstado;
    });

    filtered.sort((a, b) => {
      switch (ordenacao) {
        case "score": return b.nota_score - a.nota_score;
        case "taxa_vitoria": return b.taxa_vitoria - a.taxa_vitoria;
        case "volume": return b.volume_total_contratos - a.volume_total_contratos;
        case "nome": return a.nome_fantasia.localeCompare(b.nome_fantasia);
        default: return 0;
      }
    });

    return filtered;
  }, [busca, segmentoFiltro, porteFiltro, estadoFiltro, ordenacao]);

  const volumeTotal = useMemo(() => {
    const soma = resultados.reduce((acc, e) => acc + e.volume_total_contratos, 0);
    if (soma >= 1e9) return `R$ ${(soma / 1e9).toFixed(1)}B`;
    if (soma >= 1e6) return `R$ ${(soma / 1e6).toFixed(0)}M`;
    return `R$ ${soma.toLocaleString("pt-BR")}`;
  }, [resultados]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Building2 size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Dossie de Empresas</h1>
            <p className="text-sm text-muted-foreground">
              Inteligencia competitiva — perfil, historico e performance de empresas do setor
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide">Empresas Cadastradas</p>
          <p className="text-2xl font-bold">{empresas.length}</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide">Media Taxa Vitoria</p>
          <p className="text-2xl font-bold text-emerald-600">
            {(empresas.reduce((a, e) => a + e.taxa_vitoria, 0) / empresas.length).toFixed(1)}%
          </p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide">Volume Total</p>
          <p className="text-2xl font-bold text-primary">
            R$ {(empresas.reduce((a, e) => a + e.volume_total_contratos, 0) / 1e9).toFixed(1)}B
          </p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide">Projetos Ativos</p>
          <p className="text-2xl font-bold text-amber-600">
            {projetos.filter((p) => p.status === "Em Andamento").length}
          </p>
        </Card>
      </div>

      {/* Search + Filter Bar */}
      <Card className="p-4 mb-5 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Buscar por nome, CNPJ, especialidade..."
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

        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                Segmento
              </label>
              <select
                value={segmentoFiltro}
                onChange={(e) => setSegmentoFiltro(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                {SEGMENTOS.map((s) => (
                  <option key={s} value={s}>{s === "Todos" ? "Todos os segmentos" : s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                Porte
              </label>
              <select
                value={porteFiltro}
                onChange={(e) => setPorteFiltro(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                {PORTES.map((p) => (
                  <option key={p} value={p}>{p === "Todos" ? "Todos os portes" : porteLabel(p)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                Estado (Sede)
              </label>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                {ESTADOS_UF.map((uf) => (
                  <option key={uf} value={uf}>{uf === "Todos" ? "Todos os estados" : uf}</option>
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
            <span className="font-bold text-foreground">{resultados.length}</span> empresa{resultados.length !== 1 ? "s" : ""} encontrada{resultados.length !== 1 ? "s" : ""}
          </p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="text-sm text-muted-foreground">
            Volume: <span className="font-bold text-foreground">{volumeTotal}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={13} className="text-muted-foreground" />
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="score">Maior score</option>
            <option value="taxa_vitoria">Maior taxa vitoria</option>
            <option value="volume">Maior volume</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      {resultados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhuma empresa encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou a palavra-chave.</p>
          {filtrosAtivos > 0 && (
            <Button variant="outline" size="sm" onClick={limparFiltros} className="mt-3">
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {resultados.map((emp) => (
            <EmpresaCard key={emp.id} empresa={emp} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmpresasPage;
