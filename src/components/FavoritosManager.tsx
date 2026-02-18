import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────

interface Favorito {
  tipo: "empresa" | "projeto";
  id: string;
}

// ── Hook: useFavoritos ────────────────────────────────────

const STORAGE_KEY = "hub-construdata-favoritos";

function loadFavoritos(): Favorito[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        "tipo" in item &&
        "id" in item &&
        (item as Favorito).tipo in { empresa: 1, projeto: 1 } &&
        typeof (item as Favorito).id === "string"
    );
  } catch {
    return [];
  }
}

function saveFavoritos(favoritos: Favorito[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<Favorito[]>(loadFavoritos);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavoritos(loadFavoritos());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const isFavorito = useCallback(
    (tipo: Favorito["tipo"], id: string): boolean => {
      return favoritos.some((f) => f.tipo === tipo && f.id === id);
    },
    [favoritos]
  );

  const toggleFavorito = useCallback(
    (tipo: Favorito["tipo"], id: string) => {
      setFavoritos((prev) => {
        const exists = prev.some((f) => f.tipo === tipo && f.id === id);
        const next = exists
          ? prev.filter((f) => !(f.tipo === tipo && f.id === id))
          : [...prev, { tipo, id }];
        saveFavoritos(next);
        return next;
      });
    },
    []
  );

  return { favoritos, toggleFavorito, isFavorito };
}

// ── Component: BotaoFavorito ──────────────────────────────

interface BotaoFavoritoProps {
  tipo: Favorito["tipo"];
  id: string;
  nome: string;
  className?: string;
}

export function BotaoFavorito({ tipo, id, nome, className }: BotaoFavoritoProps) {
  const { toggleFavorito, isFavorito } = useFavoritos();
  const ativo = isFavorito(tipo, id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorito(tipo, id);
      }}
      title={ativo ? `Remover ${nome} dos favoritos` : `Adicionar ${nome} aos favoritos`}
      aria-label={
        ativo ? `Remover ${nome} dos favoritos` : `Adicionar ${nome} aos favoritos`
      }
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      <Star
        className={cn(
          "w-4 h-4 transition-all duration-200",
          ativo
            ? "fill-amber-400 text-amber-400 scale-110"
            : "text-muted-foreground hover:text-amber-400"
        )}
      />
    </button>
  );
}

export type { Favorito };
