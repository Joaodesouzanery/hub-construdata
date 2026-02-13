import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ExternalLink,
  Newspaper,
  Loader2,
  Search,
  Star,
  Filter,
  X,
} from "lucide-react";
import noticiasEmbutidas, { type Noticia } from "@/data/noticias";
import { urlSegura } from "@/lib/utils";

// Estilos por fonte (cada site de notícia tem uma cor)
const fonteStyles: Record<string, string> = {
  // Engenharia (foco principal)
  "CONFEA": "bg-rose-100 text-rose-800",
  "CREA-SP": "bg-red-100 text-red-800",
  "Revista AdNormas": "bg-pink-100 text-pink-800",
  "AECweb": "bg-indigo-100 text-indigo-800",
  "Engenharia 360": "bg-purple-100 text-purple-800",
  "Portal Eng. Civil": "bg-fuchsia-100 text-fuchsia-800",
  // Construção & Infraestrutura
  "CBIC": "bg-amber-100 text-amber-800",
  "SindusCon-SP": "bg-orange-100 text-orange-800",
  "Buildin": "bg-yellow-100 text-yellow-800",
  "Sienge": "bg-stone-100 text-stone-800",
  // Saneamento
  "Saneamento Básico": "bg-blue-100 text-blue-800",
  "Tratamento de Água": "bg-emerald-100 text-emerald-800",
  "ABES": "bg-violet-100 text-violet-800",
  "Trata Brasil": "bg-cyan-100 text-cyan-800",
  // Meio Ambiente
  "Canal Meio Ambiente": "bg-teal-100 text-teal-800",
  "O Eco": "bg-lime-100 text-lime-800",
  // Governo
  "Agência Brasil": "bg-sky-100 text-sky-800",
};

// ----------- Favoritos (localStorage) -----------
const FAVORITOS_KEY = "hub-construdata-favoritos";

function carregarFavoritos(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITOS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* localStorage indisponível */ }
  return new Set();
}

function salvarFavoritos(favs: Set<string>) {
  try {
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify([...favs]));
  } catch { /* localStorage indisponível */ }
}

// ----------- Helpers -----------

function formatarData(dataStr: string): string {
  try {
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return "";
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${data.getDate().toString().padStart(2, "0")} ${meses[data.getMonth()]} ${data.getFullYear()}`;
  } catch { return ""; }
}

const FonteTag = ({ fonte }: { fonte: string }) => (
  <span
    className={`inline-block text-[0.7rem] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full ${
      fonteStyles[fonte] || "bg-gray-100 text-gray-700"
    }`}
  >
    {fonte}
  </span>
);

// ----------- Componente principal -----------

const NewsSection = () => {
  const [noticias, setNoticias] = useState<Noticia[]>(noticiasEmbutidas);
  const [carregando, setCarregando] = useState(true);
  const [fonteDados, setFonteDados] = useState<"embutido" | "json">("embutido");

  // Filtros
  const [busca, setBusca] = useState("");
  const [fonteAtiva, setFonteAtiva] = useState("Todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [apenasFavoritos, setApenasFavoritos] = useState(false);

  // Favoritos
  const [favoritos, setFavoritos] = useState<Set<string>>(carregarFavoritos);

  const toggleFavorito = useCallback((link: string) => {
    setFavoritos((prev) => {
      const next = new Set(prev);
      if (next.has(link)) next.delete(link);
      else next.add(link);
      salvarFavoritos(next);
      return next;
    });
  }, []);

  // Carregar dados
  useEffect(() => {
    fetch("./noticias.json")
      .then((res) => {
        if (!res.ok) throw new Error("JSON não encontrado");
        return res.json();
      })
      .then((dados: Noticia[]) => {
        if (dados.length > 0) {
          setNoticias(dados);
          setFonteDados("json");
        }
      })
      .catch(() => { /* Mantém embutidos */ })
      .finally(() => setCarregando(false));
  }, []);

  // Lista de fontes disponíveis
  const fontesDisponiveis = useMemo(() => {
    const set = new Set(noticias.map((n) => n.fonte));
    return ["Todas", ...Array.from(set).sort()];
  }, [noticias]);

  // Filtragem
  const noticiasFiltradas = useMemo(() => {
    return noticias.filter((n) => {
      // Busca full-text
      if (busca) {
        const q = busca.toLowerCase();
        if (!n.titulo.toLowerCase().includes(q) && !n.fonte.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Filtro por fonte
      if (fonteAtiva !== "Todas" && n.fonte !== fonteAtiva) return false;
      // Filtro por data
      if (dataInicio) {
        const d = new Date(n.data_publicacao);
        if (d < new Date(dataInicio)) return false;
      }
      if (dataFim) {
        const d = new Date(n.data_publicacao);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        if (d > fim) return false;
      }
      // Apenas favoritos
      if (apenasFavoritos && !favoritos.has(n.link)) return false;
      return true;
    });
  }, [noticias, busca, fonteAtiva, dataInicio, dataFim, apenasFavoritos, favoritos]);

  const temFiltroAtivo = busca || fonteAtiva !== "Todas" || dataInicio || dataFim || apenasFavoritos;

  const limparFiltros = () => {
    setBusca("");
    setFonteAtiva("Todas");
    setDataInicio("");
    setDataFim("");
    setApenasFavoritos(false);
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Carregando notícias...
      </div>
    );
  }

  const [destaque, ...restante] = noticiasFiltradas;

  return (
    <div>
      {/* Barra de Busca + Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Buscar notícias..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={apenasFavoritos ? "default" : "outline"}
              onClick={() => setApenasFavoritos(!apenasFavoritos)}
              className="flex items-center gap-1.5"
              title="Apenas favoritos"
            >
              <Star size={15} className={apenasFavoritos ? "fill-current" : ""} />
              <span className="hidden sm:inline">Favoritos</span>
              {favoritos.size > 0 && (
                <span className="text-[0.65rem] bg-white/20 px-1.5 rounded-full">{favoritos.size}</span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-1.5"
            >
              <Filter size={15} />
              Filtros
            </Button>
          </div>
        </div>

        {/* Filtros expandíveis */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Fonte
              </label>
              <select
                value={fonteAtiva}
                onChange={(e) => setFonteAtiva(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {fontesDisponiveis.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Data inicial
              </label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Data final
              </label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Contagem + limpar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {noticiasFiltradas.length} de {noticias.length} notícia(s)
          {fonteDados === "embutido" && " (dados do build)"}
        </p>
        {temFiltroAtivo && (
          <button
            onClick={limparFiltros}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X size={12} /> Limpar filtros
          </button>
        )}
      </div>

      {/* Estado vazio */}
      {noticiasFiltradas.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhuma notícia encontrada</p>
          <p className="text-sm mt-1">Ajuste os filtros ou a busca.</p>
        </div>
      ) : (
        <>
          {/* Notícia Destaque */}
          {destaque && (
            <div className="relative mb-8">
              <Card className="overflow-hidden hover:shadow-md transition-shadow group">
                <a href={urlSegura(destaque.link)} target="_blank" rel="noopener noreferrer">
                  <div className="w-full h-[280px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Newspaper className="text-primary/30" size={80} />
                  </div>
                  <div className="p-6">
                    <FonteTag fonte={destaque.fonte} />
                    <h2 className="text-xl md:text-2xl font-bold leading-tight mb-3 mt-2 group-hover:text-primary transition-colors">
                      {destaque.titulo}
                    </h2>
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      {formatarData(destaque.data_publicacao) && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatarData(destaque.data_publicacao)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <ExternalLink size={14} />
                        Ler no site original
                      </span>
                    </div>
                  </div>
                </a>
              </Card>
              <button
                onClick={() => toggleFavorito(destaque.link)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow transition-colors"
                title={favoritos.has(destaque.link) ? "Remover dos favoritos" : "Salvar como favorito"}
              >
                <Star
                  size={18}
                  className={favoritos.has(destaque.link) ? "text-amber-500 fill-amber-500" : "text-gray-400"}
                />
              </button>
            </div>
          )}

          {/* Grid de Notícias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {restante.map((noticia, index) => (
              <div key={index} className="relative">
                <a href={urlSegura(noticia.link)} target="_blank" rel="noopener noreferrer">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full">
                    <div className="w-full h-[140px] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                      <Newspaper className="text-slate-300" size={48} />
                    </div>
                    <div className="p-5">
                      <FonteTag fonte={noticia.fonte} />
                      <h3 className="text-base font-semibold leading-snug mb-2 mt-2 group-hover:text-primary transition-colors line-clamp-3">
                        {noticia.titulo}
                      </h3>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        {formatarData(noticia.data_publicacao) && (
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {formatarData(noticia.data_publicacao)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ExternalLink size={13} />
                          Abrir
                        </span>
                      </div>
                    </div>
                  </Card>
                </a>
                <button
                  onClick={() => toggleFavorito(noticia.link)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
                  title={favoritos.has(noticia.link) ? "Remover dos favoritos" : "Salvar como favorito"}
                >
                  <Star
                    size={14}
                    className={favoritos.has(noticia.link) ? "text-amber-500 fill-amber-500" : "text-gray-400"}
                  />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NewsSection;
