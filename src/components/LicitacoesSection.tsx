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
  AlertCircle,
} from "lucide-react";

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

interface Licitacao {
  titulo: string;
  orgao: string;
  estado: string;
  categoria: string;
  dataAbertura: string;
  valorEstimado: string;
  link: string;
  modalidade: string;
}

// Dados de demonstração — em produção, viria de um JSON ou API (PNCP, ComprasNet)
const licitacoesMock: Licitacao[] = [
  {
    titulo: "Implantação do Sistema de Esgotamento Sanitário - Bacia Sul",
    orgao: "SABESP - Cia de Saneamento Básico do Estado de SP",
    estado: "SP",
    categoria: "Saneamento",
    dataAbertura: "2026-02-20",
    valorEstimado: "R$ 45.200.000,00",
    link: "https://pncp.gov.br",
    modalidade: "Concorrência",
  },
  {
    titulo: "Construção de ETA - Estação de Tratamento de Água - Capacidade 500 L/s",
    orgao: "COPASA - Cia de Saneamento de Minas Gerais",
    estado: "MG",
    categoria: "Saneamento",
    dataAbertura: "2026-02-25",
    valorEstimado: "R$ 28.750.000,00",
    link: "https://pncp.gov.br",
    modalidade: "Concorrência",
  },
  {
    titulo: "Pavimentação e Drenagem Pluvial - Distrito Industrial Norte",
    orgao: "Prefeitura Municipal de Manaus",
    estado: "AM",
    categoria: "Infraestrutura",
    dataAbertura: "2026-02-18",
    valorEstimado: "R$ 12.400.000,00",
    link: "https://pncp.gov.br",
    modalidade: "Tomada de Preços",
  },
  {
    titulo: "Recuperação de Barragem e Sistema de Adução - Rio Jaguaribe",
    orgao: "DNOCS - Departamento Nacional de Obras Contra as Secas",
    estado: "CE",
    categoria: "Recursos Hídricos",
    dataAbertura: "2026-03-01",
    valorEstimado: "R$ 67.300.000,00",
    link: "https://pncp.gov.br",
    modalidade: "Concorrência",
  },
  {
    titulo: "Elaboração de EIA/RIMA para Aterro Sanitário Regional",
    orgao: "Consórcio Intermunicipal do Vale do Paraíba",
    estado: "RJ",
    categoria: "Meio Ambiente",
    dataAbertura: "2026-02-28",
    valorEstimado: "R$ 1.850.000,00",
    link: "https://pncp.gov.br",
    modalidade: "Pregão Eletrônico",
  },
  {
    titulo: "Construção de 240 Unidades Habitacionais - MCMV Faixa 1",
    orgao: "CAIXA / Prefeitura de Feira de Santana",
    estado: "BA",
    categoria: "Construção Civil",
    dataAbertura: "2026-03-05",
    valorEstimado: "R$ 38.600.000,00",
    link: "https://pncp.gov.br",
    modalidade: "Concorrência",
  },
  {
    titulo: "Ampliação da Rede de Distribuição de Água - Zona Rural",
    orgao: "SANEPAR - Cia de Saneamento do Paraná",
    estado: "PR",
    categoria: "Saneamento",
    dataAbertura: "2026-03-10",
    valorEstimado: "R$ 8.900.000,00",
    link: "https://pncp.gov.br",
    modalidade: "Pregão Eletrônico",
  },
  {
    titulo: "Revitalização do Rio Pinheiros - Trecho 3",
    orgao: "Governo do Estado de São Paulo",
    estado: "SP",
    categoria: "Recursos Hídricos",
    dataAbertura: "2026-03-15",
    valorEstimado: "R$ 120.000.000,00",
    link: "https://pncp.gov.br",
    modalidade: "Concorrência",
  },
];

const modalidadeStyles: Record<string, string> = {
  "Concorrência": "bg-blue-100 text-blue-800",
  "Pregão Eletrônico": "bg-emerald-100 text-emerald-800",
  "Tomada de Preços": "bg-amber-100 text-amber-800",
};

function formatarDataBR(dataStr: string): string {
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

const LicitacoesSection = () => {
  const [busca, setBusca] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const resultados = useMemo(() => {
    return licitacoesMock.filter((lic) => {
      const buscaLower = busca.toLowerCase();
      const matchBusca =
        !busca ||
        lic.titulo.toLowerCase().includes(buscaLower) ||
        lic.orgao.toLowerCase().includes(buscaLower);
      const matchEstado = estadoFiltro === "Todos" || lic.estado === estadoFiltro;
      const matchCategoria = categoriaFiltro === "Todas" || lic.categoria === categoriaFiltro;
      return matchBusca && matchEstado && matchCategoria;
    });
  }, [busca, estadoFiltro, categoriaFiltro]);

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
          Dados de demonstração. Em produção, integra com o{" "}
          <a href="https://pncp.gov.br" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
            PNCP
          </a>{" "}
          (Portal Nacional de Contratações Públicas) para licitações em tempo real.
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
            <a
              key={index}
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
                        Abertura: {formatarDataBR(lic.dataAbertura)}
                      </span>
                    </div>
                  </div>

                  {/* Valor + Link */}
                  <div className="text-right flex-shrink-0">
                    <span className="block text-sm font-bold text-primary">
                      {lic.valorEstimado}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1 justify-end">
                      <ExternalLink size={12} />
                      Ver edital
                    </span>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default LicitacoesSection;
