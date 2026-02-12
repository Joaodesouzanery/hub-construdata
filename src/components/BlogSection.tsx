const categoryStyles: Record<string, string> = {
  "Engenharia": "bg-teal-100 text-teal-800",
  "Legislação": "bg-amber-100 text-amber-800",
  "Infraestrutura": "bg-indigo-100 text-indigo-800",
  "Tecnologia": "bg-emerald-100 text-emerald-800",
  "Normas": "bg-pink-100 text-pink-800",
  "Opinião": "bg-orange-100 text-orange-800",
  "Licitações": "bg-blue-100 text-blue-800",
};

interface Article {
  image: string;
  categories: string[];
  title: string;
  excerpt: string;
  authorAvatar: string;
  authorName: string;
  date: string;
}

const articles: Article[] = [
  {
    image: "https://placehold.co/400x280/1e3a5f/ffffff?text=Artigo+01",
    categories: ["Engenharia", "Legislação"],
    title: "Guia Completo: Como Calcular o BDI para Obras Públicas em 2026",
    excerpt:
      "Entenda os componentes do BDI, os percentuais recomendados pelo TCU e como aplicar corretamente em suas propostas para licitações de obras públicas.",
    authorAvatar: "https://placehold.co/80x80/64748b/ffffff?text=RC",
    authorName: "Ricardo Campos",
    date: "07 Fev 2026 · 12 min de leitura",
  },
  {
    image: "https://placehold.co/400x280/0f172a/ffffff?text=Artigo+02",
    categories: ["Infraestrutura"],
    title: "SINAPI vs SICRO: Quando Usar Cada Tabela de Referência",
    excerpt:
      "Uma análise detalhada das diferenças entre as duas principais tabelas de referência de preços utilizadas em obras públicas no Brasil.",
    authorAvatar: "https://placehold.co/80x80/64748b/ffffff?text=ML",
    authorName: "Mariana Lima",
    date: "01 Fev 2026 · 9 min de leitura",
  },
  {
    image: "https://placehold.co/400x280/16a34a/ffffff?text=Artigo+03",
    categories: ["Tecnologia", "Normas"],
    title: "Sustentabilidade em Projetos de Saneamento: Normas e Boas Práticas",
    excerpt:
      "Conheça as normas ambientais aplicáveis e as práticas sustentáveis que estão transformando projetos de saneamento básico no Brasil.",
    authorAvatar: "https://placehold.co/80x80/64748b/ffffff?text=FS",
    authorName: "Fernando Santos",
    date: "25 Jan 2026 · 15 min de leitura",
  },
  {
    image: "https://placehold.co/400x280/7c3aed/ffffff?text=Artigo+04",
    categories: ["Opinião", "Licitações"],
    title: "O Futuro das Licitações Digitais: Tendências para 2026 e Além",
    excerpt:
      "Como a digitalização dos processos licitatórios está aumentando a transparência e reduzindo prazos para empresas de engenharia e construção.",
    authorAvatar: "https://placehold.co/80x80/64748b/ffffff?text=AP",
    authorName: "Ana Paula Ribeiro",
    date: "18 Jan 2026 · 10 min de leitura",
  },
];

const BlogSection = () => {
  return (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <article
          key={index}
          className="flex flex-col md:flex-row bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
          {/* Article Image */}
          <img
            src={article.image}
            alt={article.title}
            className="w-full md:w-[260px] h-[200px] md:h-auto object-cover flex-shrink-0"
          />

          {/* Article Content */}
          <div className="p-6 flex flex-col justify-center">
            {/* Category Tags */}
            <div className="flex gap-1.5 mb-2.5">
              {article.categories.map((cat) => (
                <span
                  key={cat}
                  className={`inline-block text-[0.65rem] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${
                    categoryStyles[cat] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>

            <h3 className="text-lg font-bold leading-snug mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {article.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-3 mt-4">
              <img
                src={article.authorAvatar}
                alt={article.authorName}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="text-sm">
                <div className="font-semibold">{article.authorName}</div>
                <div className="text-muted-foreground text-xs">
                  {article.date}
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default BlogSection;
