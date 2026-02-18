import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────

interface FiltrosState {
  estados: string[];
  segmentos: string[];
  scoreMin: number;
  scoreMax: number;
  portes: string[];
}

interface FiltrosAvancadosProps {
  onFilter: (filtros: FiltrosState) => void;
  segmentosDisponiveis?: string[];
  className?: string;
}

// ── Constants ─────────────────────────────────────────────

const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
  "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
  "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

const PORTES = ["Grande", "Medio", "Pequeno"] as const;

const FILTROS_INICIAIS: FiltrosState = {
  estados: [],
  segmentos: [],
  scoreMin: 0,
  scoreMax: 100,
  portes: [],
};

// ── Component ─────────────────────────────────────────────

const FiltrosAvancados = ({
  onFilter,
  segmentosDisponiveis = [],
  className,
}: FiltrosAvancadosProps) => {
  const [aberto, setAberto] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>({ ...FILTROS_INICIAIS });

  const totalAtivos =
    filtros.estados.length +
    filtros.segmentos.length +
    filtros.portes.length +
    (filtros.scoreMin > 0 || filtros.scoreMax < 100 ? 1 : 0);

  const toggleArray = (
    campo: "estados" | "segmentos" | "portes",
    valor: string
  ) => {
    setFiltros((prev) => {
      const arr = prev[campo];
      const next = arr.includes(valor)
        ? arr.filter((v) => v !== valor)
        : [...arr, valor];
      return { ...prev, [campo]: next };
    });
  };

  const limparTodos = () => {
    setFiltros({ ...FILTROS_INICIAIS });
  };

  const aplicar = () => {
    onFilter(filtros);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros avancados
        {totalAtivos > 0 && (
          <Badge variant="secondary" className="ml-1 text-[0.65rem] px-1.5 py-0">
            {totalAtivos}
          </Badge>
        )}
        {aberto ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Collapsible panel */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          aberto ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0"
        )}
      >
        <div className="rounded-lg border bg-card p-4 space-y-5">
          {/* ── Estados ──────────────────────────────── */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Estados (UF)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {UFS.map((uf) => {
                const selected = filtros.estados.includes(uf);
                return (
                  <button
                    key={uf}
                    type="button"
                    onClick={() => toggleArray("estados", uf)}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md border transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {uf}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Segmentos ────────────────────────────── */}
          {segmentosDisponiveis.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Segmentos
              </label>
              <div className="flex flex-wrap gap-1.5">
                {segmentosDisponiveis.map((seg) => {
                  const selected = filtros.segmentos.includes(seg);
                  return (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => toggleArray("segmentos", seg)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      {seg}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Score Range ──────────────────────────── */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Score ({filtros.scoreMin} &ndash; {filtros.scoreMax})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={filtros.scoreMin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFiltros((prev) => ({
                    ...prev,
                    scoreMin: Math.min(val, prev.scoreMax),
                  }));
                }}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs text-muted-foreground font-mono w-6 text-center">
                {filtros.scoreMin}
              </span>
              <span className="text-xs text-muted-foreground">&ndash;</span>
              <span className="text-xs text-muted-foreground font-mono w-6 text-center">
                {filtros.scoreMax}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={filtros.scoreMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFiltros((prev) => ({
                    ...prev,
                    scoreMax: Math.max(val, prev.scoreMin),
                  }));
                }}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* ── Porte ────────────────────────────────── */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Porte
            </label>
            <div className="flex flex-wrap gap-2">
              {PORTES.map((porte) => {
                const selected = filtros.portes.includes(porte);
                return (
                  <button
                    key={porte}
                    type="button"
                    onClick={() => toggleArray("portes", porte)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md border transition-colors font-medium",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {porte}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Actions ──────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 border-t">
            <button
              type="button"
              onClick={limparTodos}
              disabled={totalAtivos === 0}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>

            <Button size="sm" onClick={aplicar}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosAvancados;
export type { FiltrosState };
