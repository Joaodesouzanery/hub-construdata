import { useState } from "react";
import {
  Building2,
  AlertTriangle,
  FolderKanban,
  Users,
  Gavel,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  data: string;
  tipo:
    | "fundacao"
    | "sancao"
    | "projeto"
    | "societario"
    | "licitacao"
    | "premio";
  titulo: string;
  descricao: string;
  cor?: string;
}

interface TimelineEmpresaProps {
  events: TimelineEvent[];
  empresaNome: string;
}

const tipoConfig: Record<
  TimelineEvent["tipo"],
  { color: string; bg: string; border: string; icon: React.ElementType }
> = {
  fundacao: {
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-400",
    icon: Building2,
  },
  sancao: {
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-400",
    icon: AlertTriangle,
  },
  projeto: {
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-400",
    icon: FolderKanban,
  },
  societario: {
    color: "text-amber-600",
    bg: "bg-amber-100",
    border: "border-amber-400",
    icon: Users,
  },
  licitacao: {
    color: "text-violet-600",
    bg: "bg-violet-100",
    border: "border-violet-400",
    icon: Gavel,
  },
  premio: {
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    border: "border-emerald-400",
    icon: Award,
  },
};

const tipoLabel: Record<TimelineEvent["tipo"], string> = {
  fundacao: "Fundacao",
  sancao: "Sancao",
  projeto: "Projeto",
  societario: "Societario",
  licitacao: "Licitacao",
  premio: "Premio",
};

const TimelineEmpresa = ({ events, empresaNome }: TimelineEmpresaProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-6">
        Linha do tempo &mdash; {empresaNome}
      </h3>

      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-0">
          {sortedEvents.map((event, index) => {
            const config = tipoConfig[event.tipo];
            const Icon = config.icon;
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={`${event.data}-${index}`}
                className="relative pl-12 md:pl-16 pb-8 last:pb-0 group"
                onMouseEnter={() => setExpandedIndex(index)}
                onMouseLeave={() => setExpandedIndex(null)}
              >
                {/* Dot on the timeline */}
                <div
                  className={cn(
                    "absolute left-2 md:left-4 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    config.bg,
                    config.border,
                    isExpanded && "scale-125 shadow-md"
                  )}
                >
                  <Icon className={cn("w-2.5 h-2.5", config.color)} />
                </div>

                {/* Content card */}
                <div
                  className={cn(
                    "rounded-lg border bg-card p-4 transition-all duration-200 cursor-default",
                    isExpanded
                      ? "shadow-md border-border/80"
                      : "shadow-sm hover:shadow-md"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {event.data}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-fit",
                        config.bg,
                        config.color
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {tipoLabel[event.tipo]}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-foreground">
                    {event.titulo}
                  </h4>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isExpanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.descricao}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sortedEvents.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum evento registrado para esta empresa.
        </p>
      )}
    </div>
  );
};

export default TimelineEmpresa;
export type { TimelineEvent };
