import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const categoryStyles: Record<string, string> = {
  "Legislação": "bg-amber-100 text-amber-800",
  "Licitações": "bg-blue-100 text-blue-800",
  "Tecnologia": "bg-emerald-100 text-emerald-800",
  "Investimentos": "bg-violet-100 text-violet-800",
  "Normas": "bg-pink-100 text-pink-800",
};

interface NewsItem {
  image: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime?: string;
}

const featuredNews: NewsItem = {
  image: "https://placehold.co/800x450/1a56db/ffffff?text=Not%C3%ADcia+Destaque",
  category: "Legislação",
  title: "Governo Federal anuncia novo marco regulatório para saneamento básico",
  excerpt:
    "As novas diretrizes prometem modernizar o setor de saneamento no Brasil, trazendo mais transparência para licitações e maior eficiência operacional. Especialistas avaliam impactos para municípios e concessionárias em todo o território nacional.",
  date: "10 Fev 2026",
  readTime: "8 min de leitura",
};

const secondaryNews: NewsItem[] = [
  {
    image: "https://placehold.co/400x250/0f172a/ffffff?text=Licita%C3%A7%C3%B5es",
    category: "Licitações",
    title: "Prefeituras abrem 340 novas licitações para obras de infraestrutura",
    excerpt:
      "O volume de licitações no primeiro trimestre de 2026 cresce 22% em relação ao mesmo período do ano anterior.",
    date: "08 Fev 2026",
  },
  {
    image: "https://placehold.co/400x250/16a34a/ffffff?text=Tecnologia",
    category: "Tecnologia",
    title: "IA e drones revolucionam monitoramento de redes de água no país",
    excerpt:
      "Concessionárias brasileiras adotam soluções de inteligência artificial para reduzir perdas hídricas.",
    date: "05 Fev 2026",
  },
  {
    image: "https://placehold.co/400x250/7c3aed/ffffff?text=Investimentos",
    category: "Investimentos",
    title: "BNDES libera R$ 12 bilhões para projetos de saneamento em 2026",
    excerpt:
      "Recursos serão direcionados para municípios com menor índice de cobertura de esgoto tratado.",
    date: "02 Fev 2026",
  },
  {
    image: "https://placehold.co/400x250/9d174d/ffffff?text=Normas",
    category: "Normas",
    title: "ABNT publica revisão da NBR 12.218 para sistemas de distribuição de água",
    excerpt:
      "A nova revisão traz atualizações importantes sobre dimensionamento e materiais permitidos.",
    date: "28 Jan 2026",
  },
];

const CategoryTag = ({ category }: { category: string }) => (
  <span
    className={`inline-block text-[0.7rem] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full mb-2 ${
      categoryStyles[category] || "bg-gray-100 text-gray-700"
    }`}
  >
    {category}
  </span>
);

const NewsSection = () => {
  return (
    <div>
      {/* Featured News Card */}
      <Card className="mb-8 overflow-hidden hover:shadow-md transition-shadow">
        <img
          src={featuredNews.image}
          alt={featuredNews.title}
          className="w-full h-[400px] object-cover"
        />
        <div className="p-6">
          <CategoryTag category={featuredNews.category} />
          <h2 className="text-xl md:text-2xl font-bold leading-tight mb-3">
            {featuredNews.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {featuredNews.excerpt}
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {featuredNews.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {featuredNews.readTime}
            </span>
          </div>
        </div>
      </Card>

      {/* Secondary News Grid (2x2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {secondaryNews.map((news, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-[180px] object-cover"
            />
            <div className="p-5">
              <CategoryTag category={news.category} />
              <h3 className="text-base font-semibold leading-snug mb-2">
                {news.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {news.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {news.date}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
