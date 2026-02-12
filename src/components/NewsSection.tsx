import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, ExternalLink, Newspaper, Loader2 } from "lucide-react";

// Estilos por fonte (cada site de notícia tem uma cor)
const fonteStyles: Record<string, string> = {
  "Saneamento Básico": "bg-blue-100 text-blue-800",
  "Tratamento de Água": "bg-emerald-100 text-emerald-800",
};

// Formato da notícia vinda do coletor.js
interface NoticiaColetada {
  titulo: string;
  link: string;
  data_publicacao: string;
  fonte: string;
}

// Dados de demonstração (exibidos enquanto o JSON real não existe)
const noticiasFallback: NoticiaColetada[] = [
  {
    titulo: "Governo Federal anuncia novo marco regulatório para saneamento básico",
    link: "#",
    data_publicacao: new Date().toISOString(),
    fonte: "Saneamento Básico",
  },
  {
    titulo: "Prefeituras abrem 340 novas licitações para obras de infraestrutura",
    link: "#",
    data_publicacao: new Date().toISOString(),
    fonte: "Saneamento Básico",
  },
  {
    titulo: "IA e drones revolucionam monitoramento de redes de água no país",
    link: "#",
    data_publicacao: new Date().toISOString(),
    fonte: "Tratamento de Água",
  },
  {
    titulo: "BNDES libera R$ 12 bilhões para projetos de saneamento em 2026",
    link: "#",
    data_publicacao: new Date().toISOString(),
    fonte: "Saneamento Básico",
  },
  {
    titulo: "ABNT publica revisão da NBR 12.218 para sistemas de distribuição de água",
    link: "#",
    data_publicacao: new Date().toISOString(),
    fonte: "Tratamento de Água",
  },
];

/** Valida que a URL é segura (só http/https) — previne XSS via javascript: */
function urlSegura(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    // URL inválida
  }
  return "#";
}

/** Formata data ISO para "10 Fev 2026" */
function formatarData(dataStr: string): string {
  try {
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return "";
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${data.getDate().toString().padStart(2, "0")} ${meses[data.getMonth()]} ${data.getFullYear()}`;
  } catch {
    return "";
  }
}

/** Badge com o nome da fonte */
const FonteTag = ({ fonte }: { fonte: string }) => (
  <span
    className={`inline-block text-[0.7rem] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full mb-2 ${
      fonteStyles[fonte] || "bg-gray-100 text-gray-700"
    }`}
  >
    {fonte}
  </span>
);

const NewsSection = () => {
  const [noticias, setNoticias] = useState<NoticiaColetada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [usandoFallback, setUsandoFallback] = useState(false);

  useEffect(() => {
    fetch("/noticias.json")
      .then((res) => {
        if (!res.ok) throw new Error("JSON não encontrado");
        return res.json();
      })
      .then((dados: NoticiaColetada[]) => {
        if (dados.length > 0) {
          setNoticias(dados);
        } else {
          setNoticias(noticiasFallback);
          setUsandoFallback(true);
        }
      })
      .catch(() => {
        setNoticias(noticiasFallback);
        setUsandoFallback(true);
      })
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Carregando notícias...
      </div>
    );
  }

  const [destaque, ...restante] = noticias;

  return (
    <div>
      {/* Aviso quando usando dados de demonstração */}
      {usandoFallback && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Dados de demonstração.</strong> Execute{" "}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">node coletor.js</code>{" "}
          para carregar notícias reais.
        </div>
      )}

      {/* Notícia Destaque */}
      {destaque && (
        <a href={urlSegura(destaque.link)} target="_blank" rel="noopener noreferrer">
          <Card className="mb-8 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="w-full h-[280px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Newspaper className="text-primary/30" size={80} />
            </div>
            <div className="p-6">
              <FonteTag fonte={destaque.fonte} />
              <h2 className="text-xl md:text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
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
          </Card>
        </a>
      )}

      {/* Grid de Notícias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {restante.map((noticia, index) => (
            <a
              key={index}
              href={urlSegura(noticia.link)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full">
                <div className="w-full h-[140px] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <Newspaper className="text-slate-300" size={48} />
                </div>
                <div className="p-5">
                  <FonteTag fonte={noticia.fonte} />
                  <h3 className="text-base font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-3">
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
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
