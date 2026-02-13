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
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLicitacoes } from "@/hooks/useLicitacoes";
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
  "Recursos Hídricos",
  "Meio Ambiente",
];

const modalidadeStyles: Record<string, string> = {
  "Concorrência Eletrônica": "bg-blue-100 text-blue-800",
  "Concorrência Presencial": "bg-blue-100 text-blue-800",
  "Concorrência": "bg-blue-100 text-blue-800",
  "Pregão Eletrônico": "bg-emerald-100 text-emerald-800",
  "Pregão Presencial": "bg-emerald-100 text-emerald-800",
  "Tomada de Preços": "bg-amber-100 text-amber-800",
  "Dispensa de Licitação": "bg-gray-100 text-gray-700",
  "Inexigibilidade": "bg-gray-100 text-gray-700",
  "Leilão Eletrônico": "bg-purple-100 text-purple-800",
  "Leilão Presencial": "bg-purple-100 text-purple-800",
  "Credenciamento": "bg-orange-100 text-orange-800",
};

function formatarDataBR(dataStr: string): string {
  if (!dataStr) return "—";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Valida que a URL é segura (só http/https) */
function urlSegura(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    // URL inválida
  }
  return "#";
}

const LicitacaoCard = ({ lic }: { lic: Licitacao }) => (
  <a
    href={urlSegura(lic.link)}
    target="_blank"
    rel="noopener noreferrer"
    className="block"
  >
    <Card className="p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-[0.65rem] font-semibold uppercase px-2 py-0.5 rounded-full ${
              modalidadeStyles[lic.modalidade] || "bg-gray-100 text-gray-700"
            }`}>
              {lic.modalidade}
            </span>
            <span className="text-[0.65rem] font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
              {lic.categoria}
            </span>
          </div>

          {/* Título */}
          <h3 className="text-base font-semibold leading-snug mb-2 group-hover:text-primary transition-colors">
            {lic.titulo}
          </h3>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 size={13} />
              {lic.orgao}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {lic.estado}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              Abertura: {formatarDataBR(lic.data_abertura)}
            </span>
          </div>
        </div>

        {/* Valor + Link */}
        <div className="text-right flex-shrink-0">
          <span className="block text-sm font-bold text-primary">
            {lic.valor_estimado_fmt}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1 justify-end">
            <ExternalLink size={12} />
            Ver edital
          </span>
        </div>
      </div>
    </Card>
  </a>
);

const LicitacoesSection = () => {
  const { dados: licitacoes, carregando, fonteDados } = useLicitacoes();
  const [busca, setBusca] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const resultados = useMemo(() => {
    return licitacoes.filter((lic) => {
      const buscaLower = busca.toLowerCase();
      const matchBusca =
        !busca ||
        lic.titulo.toLowerCase().includes(buscaLower) ||
        lic.orgao.toLowerCase().includes(buscaLower);
      const matchEstado = estadoFiltro === "Todos" || lic.estado === estadoFiltro;
      const matchCategoria = categoriaFiltro === "Todas" || lic.categoria === categoriaFiltro;
      return matchBusca && matchEstado && matchCategoria;
    });
  }, [licitacoes, busca, estadoFiltro, categoriaFiltro]);

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
      {/* Barra de Busca */}
      <Card className="p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Buscar licitações por palavra-chave, órgão..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filtros
          </Button>
        </div>

        {/* Filtros Expandíveis */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Estado
              </label>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Categoria
              </label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Info sobre fontes */}
      <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        <span>
          {fonteDados === "api" ? (
            <>
              Dados reais do{" "}
              <a href="https://pncp.gov.br" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                PNCP
              </a>{" "}
              (Portal Nacional de Contratações Públicas) — últimos 30 dias.
            </>
          ) : licitacoes.length > 0 ? (
            <>
              Dados do último build. Execute{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">node coletor.js</code>{" "}
              para atualizar com licitações em tempo real do{" "}
              <a href="https://pncp.gov.br" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                PNCP
              </a>.
            </>
          ) : (
            <>
              Execute{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">node coletor.js</code>{" "}
              para coletar licitações reais do{" "}
              <a href="https://pncp.gov.br" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                PNCP
              </a>{" "}
              (Portal Nacional de Contratações Públicas).
            </>
          )}
        </span>
      </div>

      {/* Contador de resultados */}
      <p className="text-sm text-muted-foreground mb-4">
        {resultados.length} licitação(ões) encontrada(s)
      </p>

      {/* Lista de Resultados */}
      {resultados.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhuma licitação encontrada</p>
          <p className="text-sm">Tente ajustar os filtros ou a palavra-chave.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resultados.map((lic, index) => (
            <LicitacaoCard key={lic.numero_controle || lic.link + index} lic={lic} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LicitacoesSection;
