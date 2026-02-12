import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, ExternalLink, Newspaper, Loader2 } from "lucide-react";
import noticiasEmbutidas, { type Noticia } from "@/data/noticias";

// Estilos por fonte (cada site de notícia tem uma cor)
const fonteStyles: Record<string, string> = {
  "Saneamento Básico": "bg-blue-100 text-blue-800",
  "Tratamento de Água": "bg-emerald-100 text-emerald-800",
  "ABES": "bg-violet-100 text-violet-800",
  "CBIC": "bg-amber-100 text-amber-800",
  "Canal Meio Ambiente": "bg-teal-100 text-teal-800",
};

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
  const [noticias, setNoticias] = useState<Noticia[]>(noticiasEmbutidas);
  const [carregando, setCarregando] = useState(true);
  const [fonteDados, setFonteDados] = useState<"embutido" | "json">("embutido");

  useEffect(() => {
    // Tenta buscar o JSON atualizado (funciona no dev server)
    // Se falhar (ex: file://), usa os dados embutidos no bundle
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
      .catch(() => {
        // Mantém os dados embutidos — já carregados no estado inicial
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
      {/* Info da fonte de dados */}
      {fonteDados === "embutido" && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          Notícias incluídas no build. Para atualizar com dados em tempo real, execute{" "}
          <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">node coletor.js</code>{" "}
          e depois <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">npm run build</code>.
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
