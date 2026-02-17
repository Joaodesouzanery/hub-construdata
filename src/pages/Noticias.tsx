import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Newspaper,
  BookOpen,
  BarChart3,
  Calendar,
  ExternalLink,
  Star,
  Filter,
  X,
  TrendingUp,
  Users,
  Tag,
  ArrowUpDown,
  Rss,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useNoticias } from "@/hooks/useNoticias";
import { useArtigos } from "@/hooks/useArtigos";
import { urlSegura } from "@/lib/utils";
import type { Artigo, Noticia } from "@/types/database";

// ─── Constantes ────────────────────────────────────────
type TabHub = "noticias" | "artigos" | "panorama";

const CORES_CHART = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
  "#14b8a6", "#e11d48", "#a855f7", "#0ea5e9", "#eab308",
  "#64748b", "#d946ef",
];

const fonteStyles: Record<string, string> = {
  "CONFEA": "bg-rose-100 text-rose-800",
  "CREA-SP": "bg-red-100 text-red-800",
  "Revista AdNormas": "bg-pink-100 text-pink-800",
  "AECweb": "bg-indigo-100 text-indigo-800",
  "Engenharia 360": "bg-purple-100 text-purple-800",
  "CBIC": "bg-amber-100 text-amber-800",
  "SindusCon-SP": "bg-orange-100 text-orange-800",
  "Buildin": "bg-yellow-100 text-yellow-800",
  "Sienge": "bg-stone-100 text-stone-800",
  "Saneamento Basico": "bg-blue-100 text-blue-800",
  "Tratamento de Agua": "bg-emerald-100 text-emerald-800",
  "ABES": "bg-violet-100 text-violet-800",
  "Trata Brasil": "bg-cyan-100 text-cyan-800",
  "Canal Meio Ambiente": "bg-teal-100 text-teal-800",
  "O Eco": "bg-lime-100 text-lime-800",
  "Agencia Brasil": "bg-sky-100 text-sky-800",
};

const categoryStyles: Record<string, string> = {
  "BIM": "bg-purple-100 text-purple-800",
  "Saneamento": "bg-cyan-100 text-cyan-800",
  "Tecnologia": "bg-emerald-100 text-emerald-800",
  "Custos": "bg-orange-100 text-orange-800",
  "Infraestrutura": "bg-indigo-100 text-indigo-800",
  "Normas Tecnicas": "bg-pink-100 text-pink-800",
  "Legislacao": "bg-amber-100 text-amber-800",
  "Construcao Civil": "bg-violet-100 text-violet-800",
  "Engenharia": "bg-teal-100 text-teal-800",
  "Regulamentacao": "bg-red-100 text-red-800",
  "Governo": "bg-muted text-muted-foreground",
  "Estruturas": "bg-rose-100 text-rose-800",
  "Indicadores": "bg-yellow-100 text-yellow-800",
  "Licitacoes": "bg-blue-100 text-blue-800",
  "Sustentabilidade": "bg-green-100 text-green-800",
  "Meio Ambiente": "bg-lime-100 text-lime-800",
  "Recursos Hidricos": "bg-sky-100 text-sky-800",
  "Gestao de Obras": "bg-stone-100 text-stone-800",
};

const FAVORITOS_KEY = "hub-construdata-favoritos";

function carregarFavoritos(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITOS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* */ }
  return new Set();
}

function salvarFavoritos(favs: Set<string>) {
  try {
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify([...favs]));
  } catch { /* */ }
}

function formatarData(dataStr: string): string {
  try {
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return "";
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${data.getDate().toString().padStart(2, "0")} ${meses[data.getMonth()]} ${data.getFullYear()}`;
  } catch { return ""; }
}

function diasAtras(dataStr: string): string {
  const agora = new Date();
  const pub = new Date(dataStr);
  const diff = Math.floor((agora.getTime() - pub.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff < 7) return `${diff} dias atras`;
  if (diff < 30) return `${Math.floor(diff / 7)} sem. atras`;
  return formatarData(dataStr);
}

function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

// ─── Tab: Noticias ─────────────────────────────────────
const TabNoticias = ({ noticias }: { noticias: Noticia[] }) => {
  const [busca, setBusca] = useState("");
  const [fonteAtiva, setFonteAtiva] = useState("Todas");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [apenasFavoritos, setApenasFavoritos] = useState(false);
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

  const fontesDisponiveis = useMemo(() => {
    const set = new Set(noticias.map((n) => n.fonte));
    return ["Todas", ...Array.from(set).sort()];
  }, [noticias]);

  const noticiasFiltradas = useMemo(() => {
    return noticias.filter((n) => {
      if (busca) {
        const q = busca.toLowerCase();
        if (!n.titulo.toLowerCase().includes(q) && !n.fonte.toLowerCase().includes(q)) return false;
      }
      if (fonteAtiva !== "Todas" && n.fonte !== fonteAtiva) return false;
      if (apenasFavoritos && !favoritos.has(n.link)) return false;
      return true;
    });
  }, [noticias, busca, fonteAtiva, apenasFavoritos, favoritos]);

  const temFiltro = busca || fonteAtiva !== "Todas" || apenasFavoritos;

  const [destaque, ...restante] = noticiasFiltradas;

  return (
    <div>
      {/* Search + Filters */}
      <Card className="p-4 mb-5 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Buscar noticias por titulo ou fonte..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={apenasFavoritos ? "default" : "outline"}
              size="sm"
              onClick={() => setApenasFavoritos(!apenasFavoritos)}
              className="flex items-center gap-1.5"
            >
              <Star size={14} className={apenasFavoritos ? "fill-current" : ""} />
              Favoritos
              {favoritos.size > 0 && (
                <span className="text-[0.6rem] bg-white/20 px-1.5 rounded-full">{favoritos.size}</span>
              )}
            </Button>
            <Button
              variant={mostrarFiltros ? "default" : "outline"}
              size="sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-1.5"
            >
              <Filter size={14} />
              Fonte
            </Button>
          </div>
        </div>
        {mostrarFiltros && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1.5">
              {fontesDisponiveis.map((f) => (
                <button
                  key={f}
                  onClick={() => setFonteAtiva(f)}
                  className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full transition-all ${
                    fonteAtiva === f
                      ? "bg-primary text-white"
                      : fonteStyles[f] || "bg-muted text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{noticiasFiltradas.length}</span> de {noticias.length} noticia(s)
        </p>
        {temFiltro && (
          <button
            onClick={() => { setBusca(""); setFonteAtiva("Todas"); setApenasFavoritos(false); }}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {noticiasFiltradas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhuma noticia encontrada</p>
          <p className="text-sm mt-1">Ajuste os filtros ou a busca.</p>
        </div>
      ) : (
        <>
          {/* Featured */}
          {destaque && (
            <div className="relative mb-6">
              <Card className="overflow-hidden hover:shadow-md transition-shadow group border-0 shadow-sm">
                <a href={urlSegura(destaque.link)} target="_blank" rel="noopener noreferrer">
                  {destaque.imagem ? (
                    <img
                      src={urlSegura(destaque.imagem)}
                      alt={destaque.titulo}
                      className="w-full h-[220px] object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }}
                    />
                  ) : null}
                  <div className={`w-full h-[220px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ${destaque.imagem ? "hidden" : ""}`}>
                    <Newspaper className="text-primary/30" size={64} />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded-full ${fonteStyles[destaque.fonte] || "bg-muted text-muted-foreground"}`}>
                        {destaque.fonte}
                      </span>
                      <span className="text-[0.6rem] text-muted-foreground">{diasAtras(destaque.data_publicacao)}</span>
                    </div>
                    <h2 className="text-lg font-bold leading-snug mb-2 group-hover:text-primary transition-colors">
                      {destaque.titulo}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar size={12} />{formatarData(destaque.data_publicacao)}</span>
                      <span className="flex items-center gap-1"><ExternalLink size={12} />Ler no site original</span>
                    </div>
                  </div>
                </a>
              </Card>
              <button
                onClick={() => toggleFavorito(destaque.link)}
                className="absolute top-3 right-3 p-2 rounded-full bg-card/80 hover:bg-card shadow transition-colors"
              >
                <Star size={16} className={favoritos.has(destaque.link) ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restante.map((noticia, index) => (
              <div key={index} className="relative">
                <a href={urlSegura(noticia.link)} target="_blank" rel="noopener noreferrer">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full border-0 shadow-sm">
                    {noticia.imagem ? (
                      <img
                        src={urlSegura(noticia.imagem)}
                        alt={noticia.titulo}
                        className="w-full h-[140px] object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }}
                      />
                    ) : null}
                    <div className={`w-full h-[140px] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center ${noticia.imagem ? "hidden" : ""}`}>
                      <Newspaper className="text-slate-300" size={36} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[0.55rem] font-bold uppercase px-2 py-0.5 rounded-full ${fonteStyles[noticia.fonte] || "bg-muted text-muted-foreground"}`}>
                          {noticia.fonte}
                        </span>
                        <span className="text-[0.55rem] text-muted-foreground">{diasAtras(noticia.data_publicacao)}</span>
                      </div>
                      <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-3">
                        {noticia.titulo}
                      </h3>
                    </div>
                  </Card>
                </a>
                <button
                  onClick={() => toggleFavorito(noticia.link)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 hover:bg-card shadow-sm transition-colors"
                >
                  <Star size={12} className={favoritos.has(noticia.link) ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Tab: Artigos ──────────────────────────────────────
const TabArtigos = ({ artigos }: { artigos: Artigo[] }) => {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState<"recente" | "autor">("recente");

  const categoriasDisponiveis = useMemo(() => {
    const map = new Map<string, number>();
    artigos.forEach((a) => a.categorias.forEach((c) => map.set(c, (map.get(c) || 0) + 1)));
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return ["Todas", ...sorted.map(([c]) => c)];
  }, [artigos]);

  const artigosFiltrados = useMemo(() => {
    let filtered = artigos.filter((a) => {
      if (busca) {
        const q = busca.toLowerCase();
        if (
          !a.titulo.toLowerCase().includes(q) &&
          !a.resumo.toLowerCase().includes(q) &&
          !a.autor.toLowerCase().includes(q) &&
          !a.categorias.some((c) => c.toLowerCase().includes(q))
        ) return false;
      }
      if (categoriaAtiva !== "Todas" && !a.categorias.includes(categoriaAtiva)) return false;
      return true;
    });
    if (ordenacao === "autor") {
      filtered = [...filtered].sort((a, b) => a.autor.localeCompare(b.autor));
    }
    return filtered;
  }, [artigos, busca, categoriaAtiva, ordenacao]);

  return (
    <div>
      {/* Search */}
      <Card className="p-4 mb-5 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Buscar artigos por titulo, autor ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={13} className="text-muted-foreground" />
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as "recente" | "autor")}
              className="h-8 px-2 rounded-md border border-input bg-background text-xs"
            >
              <option value="recente">Mais recentes</option>
              <option value="autor">Por autor</option>
            </select>
          </div>
        </div>
        {/* Category pills */}
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-1.5">
          {categoriasDisponiveis.map((c) => (
            <button
              key={c}
              onClick={() => setCategoriaAtiva(c)}
              className={`text-[0.6rem] font-semibold px-2.5 py-1 rounded-full transition-all ${
                categoriaAtiva === c
                  ? "bg-primary text-white"
                  : categoryStyles[c] || "bg-muted text-muted-foreground hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <p className="text-sm text-muted-foreground mb-4">
        <span className="font-bold text-foreground">{artigosFiltrados.length}</span> artigo(s)
        {categoriaAtiva !== "Todas" && <> em <span className="font-semibold">{categoriaAtiva}</span></>}
      </p>

      {artigosFiltrados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhum artigo encontrado</p>
          <p className="text-sm mt-1">Ajuste a busca ou categoria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {artigosFiltrados.map((artigo: Artigo, i: number) => (
            <a key={i} href={urlSegura(artigo.link)} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="p-5 hover:shadow-md transition-shadow group border-0 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {artigo.categorias.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className={`text-[0.55rem] font-bold uppercase px-2 py-0.5 rounded-full ${categoryStyles[cat] || "bg-muted text-muted-foreground"}`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-sm font-bold leading-snug mb-1.5 group-hover:text-primary transition-colors">
                      {artigo.titulo}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {artigo.resumo}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[0.55rem] font-bold text-primary">
                        {iniciais(artigo.autor)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{artigo.autor}</p>
                        <div className="flex items-center gap-2 text-[0.6rem] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Clock size={10} />{diasAtras(artigo.data_publicacao)}</span>
                          <span className={`px-1.5 py-0 rounded-full ${fonteStyles[artigo.fonte] || "bg-muted text-muted-foreground"}`}>
                            {artigo.fonte}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center">
                    {artigo.imagem ? (
                      <img
                        src={urlSegura(artigo.imagem)}
                        alt={artigo.titulo}
                        className="w-[140px] h-[90px] object-cover rounded-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }}
                      />
                    ) : null}
                    <div className={`w-[140px] h-[90px] bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center ${artigo.imagem ? "hidden" : ""}`}>
                      <BookOpen className="text-primary/30" size={28} />
                    </div>
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

// ─── Tab: Panorama (Analytics) ─────────────────────────
const TabPanorama = ({ noticias, artigos }: { noticias: Noticia[]; artigos: Artigo[] }) => {
  const dadosPanorama = useMemo(() => {
    // Source distribution - noticias
    const fontesNoticias = new Map<string, number>();
    noticias.forEach((n) => fontesNoticias.set(n.fonte, (fontesNoticias.get(n.fonte) || 0) + 1));
    const distribuicaoFontes = Array.from(fontesNoticias.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({ nome, valor }));

    // Category distribution - artigos
    const categoriasMap = new Map<string, number>();
    artigos.forEach((a) => a.categorias.forEach((c) => categoriasMap.set(c, (categoriasMap.get(c) || 0) + 1)));
    const distribuicaoCategorias = Array.from(categoriasMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nome, valor]) => ({ nome, valor }));

    // Timeline - combine noticias+artigos by week
    const todasDatas = [
      ...noticias.map((n) => ({ data: n.data_publicacao, tipo: "noticia" as const })),
      ...artigos.map((a) => ({ data: a.data_publicacao, tipo: "artigo" as const })),
    ];
    const semanaMap = new Map<string, { semana: string; noticias: number; artigos: number }>();
    todasDatas.forEach(({ data, tipo }) => {
      const d = new Date(data);
      const inicio = new Date(d);
      inicio.setDate(d.getDate() - d.getDay());
      const key = inicio.toISOString().slice(0, 10);
      const label = `${inicio.getDate().toString().padStart(2, "0")}/${(inicio.getMonth() + 1).toString().padStart(2, "0")}`;
      if (!semanaMap.has(key)) semanaMap.set(key, { semana: label, noticias: 0, artigos: 0 });
      const entry = semanaMap.get(key)!;
      if (tipo === "noticia") entry.noticias++;
      else entry.artigos++;
    });
    const timeline = Array.from(semanaMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);

    // Author distribution
    const autoresMap = new Map<string, number>();
    artigos.forEach((a) => autoresMap.set(a.autor, (autoresMap.get(a.autor) || 0) + 1));
    const autores = Array.from(autoresMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nome, count]) => ({ nome: nome.length > 20 ? nome.slice(0, 18) + "..." : nome, artigos: count }));

    // Top topics
    const topTopicos = distribuicaoCategorias.slice(0, 5);

    return { distribuicaoFontes, distribuicaoCategorias, timeline, autores, topTopicos };
  }, [noticias, artigos]);

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wide">Total Noticias</p>
          <p className="text-2xl font-bold">{noticias.length}</p>
          <p className="text-[0.6rem] text-muted-foreground">{new Set(noticias.map((n) => n.fonte)).size} fontes</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wide">Total Artigos</p>
          <p className="text-2xl font-bold text-primary">{artigos.length}</p>
          <p className="text-[0.6rem] text-muted-foreground">{new Set(artigos.map((a) => a.autor)).size} autores</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wide">Categorias</p>
          <p className="text-2xl font-bold text-emerald-600">
            {new Set(artigos.flatMap((a) => a.categorias)).size}
          </p>
          <p className="text-[0.6rem] text-muted-foreground">topicos cobertos</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wide">Conteudo Total</p>
          <p className="text-2xl font-bold text-amber-600">{noticias.length + artigos.length}</p>
          <p className="text-[0.6rem] text-muted-foreground">noticias + artigos</p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Source Distribution Pie */}
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
            <Rss size={15} className="text-primary" />
            Distribuicao por Fonte
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Noticias por veiculo de origem</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPanorama.distribuicaoFontes}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  label={(props) => `${String((props as { name?: string }).name ?? "").split(" ")[0]} (${(props as { value?: number }).value})`}
                  labelLine={false}
                >
                  {dadosPanorama.distribuicaoFontes.map((_entry, index) => (
                    <Cell key={index} fill={CORES_CHART[index % CORES_CHART.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution Bar */}
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
            <Tag size={15} className="text-emerald-600" />
            Topicos Mais Abordados
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Categorias com mais artigos</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPanorama.distribuicaoCategorias} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="valor" name="Artigos" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {dadosPanorama.distribuicaoCategorias.map((_entry, index) => (
                    <Cell key={index} fill={CORES_CHART[index % CORES_CHART.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-5 border-0 shadow-sm">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <TrendingUp size={15} className="text-primary" />
          Timeline de Publicacoes
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Volume semanal de noticias e artigos</p>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dadosPanorama.timeline}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              <Area type="monotone" dataKey="noticias" name="Noticias" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="artigos" name="Artigos" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Authors */}
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
            <Users size={15} className="text-violet-600" />
            Autores Mais Ativos
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Contribuidores com mais artigos</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPanorama.autores}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="nome" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="artigos" name="Artigos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Trending Topics / Insights */}
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
            <TrendingUp size={15} className="text-amber-600" />
            Insights do Setor
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Tendencias e destaques</p>
          <div className="space-y-3">
            {dadosPanorama.topTopicos.map((topico, i) => (
              <div key={topico.nome} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{topico.nome}</span>
                    <span className="text-[0.6rem] text-muted-foreground">{topico.valor} mencoes</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(topico.valor / dadosPanorama.topTopicos[0].valor) * 100}%`,
                        backgroundColor: CORES_CHART[i],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-800">Saneamento lidera a cobertura</p>
              <p className="text-[0.6rem] text-blue-600">
                Tema mais frequente tanto em noticias quanto artigos tecnicos, refletindo os investimentos do Marco Legal.
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs font-semibold text-emerald-800">Tecnologia em alta</p>
              <p className="text-[0.6rem] text-emerald-600">
                IA, BIM, drones e gemeos digitais dominam os artigos tecnicos, sinalizando a transformacao digital do setor.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Pagina Principal ──────────────────────────────────
const Noticias = () => {
  const { dados: noticias } = useNoticias();
  const { dados: artigos } = useArtigos();
  const [tab, setTab] = useState<TabHub>("noticias");

  const tabs: { id: TabHub; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "noticias", label: "Noticias", icon: <Newspaper size={16} />, count: noticias.length },
    { id: "artigos", label: "Artigos", icon: <BookOpen size={16} />, count: artigos.length },
    { id: "panorama", label: "Panorama", icon: <BarChart3 size={16} />, count: 0 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Newspaper size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Hub de Noticias</h1>
            <p className="text-sm text-muted-foreground">
              Central de inteligencia — noticias, artigos tecnicos e panorama do setor
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
            {t.count > 0 && (
              <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full ${
                tab === t.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "noticias" && <TabNoticias noticias={noticias} />}
      {tab === "artigos" && <TabArtigos artigos={artigos} />}
      {tab === "panorama" && <TabPanorama noticias={noticias} artigos={artigos} />}
    </div>
  );
};

export default Noticias;
