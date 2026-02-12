import { Card, CardContent } from "@/components/ui/card";
import {
  Droplets,
  Waves,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  BarChart3,
  ExternalLink,
  Info,
} from "lucide-react";

interface Indicador {
  icone: typeof Droplets;
  titulo: string;
  valor: string;
  descricao: string;
  variacao?: string;
  positivo?: boolean;
}

const indicadores: Indicador[] = [
  {
    icone: Droplets,
    titulo: "Abastecimento de Água",
    valor: "84,2%",
    descricao: "da população urbana atendida",
    variacao: "+1,3% vs 2024",
    positivo: true,
  },
  {
    icone: Waves,
    titulo: "Coleta de Esgoto",
    valor: "55,8%",
    descricao: "da população com coleta",
    variacao: "+2,1% vs 2024",
    positivo: true,
  },
  {
    icone: Building,
    titulo: "Tratamento de Esgoto",
    valor: "51,2%",
    descricao: "do esgoto coletado tratado",
    variacao: "+1,8% vs 2024",
    positivo: true,
  },
  {
    icone: Users,
    titulo: "Sem Saneamento",
    valor: "100 mi",
    descricao: "brasileiros sem coleta de esgoto",
    variacao: "-2,4% vs 2024",
    positivo: true,
  },
  {
    icone: DollarSign,
    titulo: "Investimento em 2025",
    valor: "R$ 23,1 bi",
    descricao: "investidos no setor",
    variacao: "+15% vs 2024",
    positivo: true,
  },
  {
    icone: TrendingUp,
    titulo: "Perdas na Distribuição",
    valor: "37,8%",
    descricao: "de água tratada perdida",
    variacao: "-0,6% vs 2024",
    positivo: true,
  },
];

interface FonteUtil {
  nome: string;
  descricao: string;
  url: string;
}

const fontesUteis: FonteUtil[] = [
  {
    nome: "SNIS",
    descricao: "Sistema Nacional de Informações sobre Saneamento — dados oficiais do Governo Federal",
    url: "https://www.gov.br/cidades/pt-br/assuntos/saneamento/snis",
  },
  {
    nome: "ANA",
    descricao: "Agência Nacional de Águas — monitoramento de recursos hídricos e regulação",
    url: "https://www.gov.br/ana",
  },
  {
    nome: "ABES",
    descricao: "Associação Brasileira de Engenharia Sanitária e Ambiental",
    url: "https://abes-dn.org.br",
  },
  {
    nome: "PNCP",
    descricao: "Portal Nacional de Contratações Públicas — licitações do governo",
    url: "https://pncp.gov.br",
  },
  {
    nome: "CBIC",
    descricao: "Câmara Brasileira da Indústria da Construção — indicadores econômicos",
    url: "https://cbic.org.br",
  },
  {
    nome: "IBGE - Saneamento",
    descricao: "Pesquisa Nacional de Saneamento Básico com dados municipais",
    url: "https://www.ibge.gov.br",
  },
];

/** Valida que a URL é segura */
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

const IndicadoresSection = () => {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Indicadores do Setor</h2>
        <p className="text-sm text-muted-foreground">
          Principais números do saneamento e infraestrutura no Brasil (fonte: SNIS 2025)
        </p>
      </div>

      {/* Grid de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {indicadores.map((ind, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <ind.icone size={22} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {ind.titulo}
                  </p>
                  <p className="text-2xl font-extrabold mt-1">{ind.valor}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ind.descricao}</p>
                  {ind.variacao && (
                    <span className={`inline-block text-[0.65rem] font-semibold mt-2 px-2 py-0.5 rounded-full ${
                      ind.positivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {ind.variacao}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meta do Marco Legal */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">Meta do Marco Legal do Saneamento (Lei 14.026/2020)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Até <strong>31 de dezembro de 2033</strong>, o Brasil deve atingir{" "}
                <strong>99% da população com água potável</strong> e{" "}
                <strong>90% com coleta e tratamento de esgoto</strong>. O setor precisa investir
                cerca de <strong>R$ 700 bilhões</strong> para cumprir essas metas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fontes Úteis */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          Fontes de Dados e Portais Úteis
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fontesUteis.map((fonte, index) => (
            <a
              key={index}
              href={urlSegura(fonte.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-4 hover:shadow-md transition-shadow group h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors">
                      {fonte.nome}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {fonte.descricao}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndicadoresSection;
