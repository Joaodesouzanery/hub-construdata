import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Newspaper, FileSearch, X, ArrowRight } from "lucide-react";
import noticiasEmbutidas from "@/data/noticias";
import { dadosEmbutidosLicitacoes } from "@/data/licitacoes";

interface SearchResult {
  type: "noticia" | "licitacao";
  titulo: string;
  subtitulo: string;
  link?: string;
  rota?: string;
}

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo<SearchResult[]>(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    noticiasEmbutidas
      .filter((n) => n.titulo.toLowerCase().includes(q) || n.fonte.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach((n) =>
        items.push({ type: "noticia", titulo: n.titulo, subtitulo: n.fonte, link: n.link })
      );

    dadosEmbutidosLicitacoes
      .filter(
        (l) =>
          l.titulo.toLowerCase().includes(q) ||
          l.orgao.toLowerCase().includes(q) ||
          l.estado.toLowerCase().includes(q) ||
          l.categoria.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .forEach((l) =>
        items.push({
          type: "licitacao",
          titulo: l.titulo,
          subtitulo: `${l.orgao} · ${l.valor_estimado_fmt}`,
          rota: "/licitacoes",
        })
      );

    return items;
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (r: SearchResult) => {
    setOpen(false);
    setQuery("");
    if (r.link) {
      window.open(r.link, "_blank", "noopener,noreferrer");
    } else if (r.rota) {
      navigate(r.rota);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar notícias, licitações, leis... (Ctrl+K)"
          className="w-full pl-9 pr-8 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-border z-50 max-h-[400px] overflow-y-auto">
          {results.some((r) => r.type === "noticia") && (
            <div>
              <div className="px-3 py-2 text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b">
                <Newspaper size={12} /> Notícias
              </div>
              {results
                .filter((r) => r.type === "noticia")
                .map((r, i) => (
                  <button
                    key={`n-${i}`}
                    onClick={() => handleSelect(r)}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-start gap-2 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary">{r.titulo}</p>
                      <p className="text-[0.65rem] text-muted-foreground">{r.subtitulo}</p>
                    </div>
                    <ArrowRight size={14} className="mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                  </button>
                ))}
            </div>
          )}
          {results.some((r) => r.type === "licitacao") && (
            <div>
              <div className="px-3 py-2 text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-t">
                <FileSearch size={12} /> Licitações
              </div>
              {results
                .filter((r) => r.type === "licitacao")
                .map((r, i) => (
                  <button
                    key={`l-${i}`}
                    onClick={() => handleSelect(r)}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-start gap-2 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary">{r.titulo}</p>
                      <p className="text-[0.65rem] text-muted-foreground">{r.subtitulo}</p>
                    </div>
                    <ArrowRight size={14} className="mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-border z-50 p-6 text-center">
          <Search size={24} className="mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum resultado para "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
