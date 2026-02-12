import { GitBranch } from "lucide-react";

type UpdateType = "feature" | "improvement" | "fix" | "announcement";

interface UpdateItem {
  type: UpdateType;
  typeLabel: string;
  title: string;
  description: string;
  version: string;
}

const indicatorColors: Record<UpdateType, string> = {
  feature: "bg-primary",
  improvement: "bg-green-500",
  fix: "bg-yellow-400",
  announcement: "bg-violet-500",
};

const typeBadgeStyles: Record<UpdateType, string> = {
  feature: "bg-blue-100 text-primary",
  improvement: "bg-green-100 text-green-700",
  fix: "bg-yellow-100 text-yellow-700",
  announcement: "bg-violet-100 text-violet-700",
};

const updates: UpdateItem[] = [
  {
    type: "feature",
    typeLabel: "Nova Funcionalidade",
    title: "Módulo de Comparação de Preços entre Tabelas",
    description:
      "Agora é possível comparar composições de custos entre SINAPI, SICRO e tabelas estaduais lado a lado, com destaque automático para as maiores diferenças percentuais.",
    version: "v2.5 - 12/02/2026",
  },
  {
    type: "improvement",
    typeLabel: "Melhoria",
    title: "Performance da Busca de Insumos Otimizada",
    description:
      "A busca por insumos e composições ficou 3x mais rápida. Implementamos cache inteligente e indexação aprimorada para resultados instantâneos.",
    version: "v2.5 - 10/02/2026",
  },
  {
    type: "fix",
    typeLabel: "Correção",
    title: "Correção no Cálculo de BDI para Obras Públicas",
    description:
      "Corrigido um erro no arredondamento do BDI diferenciado que afetava orçamentos com fornecimento de materiais acima de R$ 500 mil.",
    version: "v2.4.3 - 05/02/2026",
  },
  {
    type: "announcement",
    typeLabel: "Comunicado",
    title: "Manutenção Programada — 15/02/2026",
    description:
      "Informamos que no dia 15 de fevereiro realizaremos uma manutenção programada das 02h às 06h (horário de Brasília) para migração de infraestrutura.",
    version: "v2.5 - 01/02/2026",
  },
  {
    type: "feature",
    typeLabel: "Nova Funcionalidade",
    title: "Exportação de Orçamentos em Formato XLSX",
    description:
      "Além do PDF, agora é possível exportar orçamentos completos no formato XLSX com formatação profissional e fórmulas preservadas.",
    version: "v2.4 - 20/01/2026",
  },
  {
    type: "improvement",
    typeLabel: "Melhoria",
    title: "Novo Layout Responsivo para Dispositivos Móveis",
    description:
      "Redesenhamos a experiência mobile da plataforma para facilitar consultas rápidas de campo, com navegação otimizada e carregamento mais ágil.",
    version: "v2.4 - 15/01/2026",
  },
];

const UpdatesSection = () => {
  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <div
          key={index}
          className="flex bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Colored left border indicator */}
          <div className={`w-1.5 flex-shrink-0 ${indicatorColors[update.type]}`} />

          {/* Content */}
          <div className="p-5 flex-1">
            <span
              className={`inline-block text-[0.7rem] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full mb-2 ${typeBadgeStyles[update.type]}`}
            >
              {update.typeLabel}
            </span>
            <h3 className="text-base font-semibold mb-1.5">{update.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {update.description}
            </p>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <GitBranch size={14} />
              {update.version}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpdatesSection;
