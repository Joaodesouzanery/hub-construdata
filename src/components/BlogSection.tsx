import { Calendar, ExternalLink, Newspaper, Loader2 } from "lucide-react";
import { useArtigos } from "@/hooks/useArtigos";
import { urlSegura } from "@/lib/utils";
import type { Artigo } from "@/types/database";

const categoryStyles: Record<string, string> = {
  // Engenharia (principal)
  "Engenharia": "bg-teal-100 text-teal-800",
  "Engenharia Civil": "bg-teal-100 text-teal-800",
  "Eng. Estrutural": "bg-rose-100 text-rose-800",
  "Eng. Elétrica": "bg-yellow-100 text-yellow-800",
  "Eng. Ambiental": "bg-lime-100 text-lime-800",
  "Estruturas": "bg-rose-100 text-rose-800",
  "BIM": "bg-purple-100 text-purple-800",
  "Gestão de Obras": "bg-stone-100 text-stone-800",
  "Regulamentação": "bg-red-100 text-red-800",
  "Normas Técnicas": "bg-pink-100 text-pink-800",
  "Tecnologia": "bg-emerald-100 text-emerald-800",
  // Construção & Infraestrutura
  "Construção Civil": "bg-violet-100 text-violet-800",
  "Infraestrutura": "bg-indigo-100 text-indigo-800",
  "Custos": "bg-orange-100 text-orange-800",
  // Saneamento & Hídrico
  "Saneamento": "bg-cyan-100 text-cyan-800",
  "Recursos Hídricos": "bg-sky-100 text-sky-800",
  // Outros
  "Legislação": "bg-amber-100 text-amber-800",
  "Normas": "bg-pink-100 text-pink-800",
  "Licitações": "bg-blue-100 text-blue-800",
  "Sustentabilidade": "bg-green-100 text-green-800",
  "Governo": "bg-muted text-muted-foreground",
  "Indicadores": "bg-yellow-100 text-yellow-800",
  "Opinião": "bg-orange-100 text-orange-800",
  "Meio Ambiente": "bg-lime-100 text-lime-800",
};

function formatarData(dataStr: string): string {
  try {
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return "";
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${data.getDate().toString().padStart(2, "0")} ${meses[data.getMonth()]} ${data.getFullYear()}`;
  } catch { return ""; }
}

function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

const ArtigoCard = ({ artigo }: { artigo: Artigo }) => (
  <a
    href={urlSegura(artigo.link)}
    target="_blank"
    rel="noopener noreferrer"
    className="block"
  >
    <article className="flex flex-col md:flex-row bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Article Image — URL validada */}
      {artigo.imagem && urlSegura(artigo.imagem) !== "#" ? (
        <img
          src={urlSegura(artigo.imagem)}
          alt={artigo.titulo}
          className="w-full md:w-[260px] h-[200px] md:h-auto object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-full md:w-[260px] h-[200px] md:h-auto bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
          <Newspaper className="text-primary/30" size={48} />
        </div>
      )}

      {/* Article Content */}
      <div className="p-6 flex flex-col justify-center">
        {/* Category Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {artigo.categorias.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className={`inline-block text-[0.65rem] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${
                categoryStyles[cat] || "bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-bold leading-snug mb-2">{artigo.titulo}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {artigo.resumo}
        </p>

        {/* Author + Date Info */}
        <div className="flex items-center gap-3 mt-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {iniciais(artigo.autor)}
          </div>
          <div className="text-sm">
            <div className="font-semibold">{artigo.autor}</div>
            <div className="text-muted-foreground text-xs flex items-center gap-2">
              {formatarData(artigo.data_publicacao) && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatarData(artigo.data_publicacao)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <ExternalLink size={12} />
                Ler artigo
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  </a>
);

const BlogSection = () => {
  const { dados: artigos, carregando, fonteDados } = useArtigos();

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Carregando artigos...
      </div>
    );
  }

  if (artigos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-semibold">Nenhum artigo disponível</p>
        <p className="text-sm mt-1">
          Execute <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">node coletor.js</code> para coletar artigos dos sites do setor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador de fonte */}
      {fonteDados === "embutido" && artigos.length > 0 && (
        <p className="text-xs text-muted-foreground">Dados do build</p>
      )}

      {artigos.map((artigo, index) => (
        <ArtigoCard key={artigo.link || index} artigo={artigo} />
      ))}
    </div>
  );
};

export default BlogSection;
