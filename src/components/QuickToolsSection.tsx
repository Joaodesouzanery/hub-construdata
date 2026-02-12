import {
  Calculator,
  Search,
  FileText,
  BookOpen,
  Scale,
  Ruler,
  Database,
  PieChart,
  Shield,
  Landmark,
  Truck,
  ClipboardList,
} from "lucide-react";

const tools = [
  {
    icon: Calculator,
    title: "Calculadora BDI",
    description: "Calcule o BDI para obras públicas e privadas",
    color: "bg-blue-500/10 text-blue-600",
    tag: "Popular",
  },
  {
    icon: Search,
    title: "Buscar Licitações",
    description: "Pesquise licitações em todo o Brasil",
    color: "bg-green-500/10 text-green-600",
    tag: "Novo",
  },
  {
    icon: Database,
    title: "Tabela SINAPI",
    description: "Consulte preços de referência SINAPI/Caixa",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    icon: Ruler,
    title: "Conversor de Unidades",
    description: "Converta unidades de engenharia facilmente",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: FileText,
    title: "Normas ABNT",
    description: "Acesse normas técnicas do setor",
    color: "bg-red-500/10 text-red-600",
  },
  {
    icon: PieChart,
    title: "Composição de Custos",
    description: "Monte composições de custo unitário",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: Scale,
    title: "Legislação",
    description: "Marco Legal do Saneamento e NBRs",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: ClipboardList,
    title: "Cronograma Físico",
    description: "Simule cronogramas de obra",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: Truck,
    title: "Cotação de Materiais",
    description: "Compare preços de materiais de construção",
    color: "bg-pink-500/10 text-pink-600",
    tag: "Novo",
  },
  {
    icon: BookOpen,
    title: "Glossário Técnico",
    description: "Termos de saneamento e infraestrutura",
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    icon: Shield,
    title: "Segurança do Trabalho",
    description: "NRs e check-lists de segurança",
    color: "bg-yellow-500/10 text-yellow-700",
  },
  {
    icon: Landmark,
    title: "Órgãos Reguladores",
    description: "Links para ANA, ANVISA, IBAMA e mais",
    color: "bg-slate-500/10 text-slate-600",
  },
];

const QuickToolsSection = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Ferramentas & Recursos
          </h2>
          <p className="text-muted-foreground mt-2">
            Tudo que você precisa para gerenciar projetos de saneamento e infraestrutura
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {tools.map((tool, index) => (
            <button
              key={index}
              className="group relative flex flex-col items-center text-center p-5 rounded-xl bg-white border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              {tool.tag && (
                <span className="absolute top-2 right-2 text-[0.6rem] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full">
                  {tool.tag}
                </span>
              )}
              <div className={`p-3 rounded-xl ${tool.color} mb-3`}>
                <tool.icon size={24} />
              </div>
              <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickToolsSection;
