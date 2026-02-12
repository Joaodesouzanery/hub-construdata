import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white py-20 text-center">
      <div className="container mx-auto px-6">
        <Badge className="bg-white/15 text-white border-0 text-xs font-semibold tracking-widest uppercase px-5 py-1.5 mb-5">
          Central de Conteúdo
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Hub ConstruData
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          Sua fonte central de notícias, legislação, artigos técnicos e
          atualizações do setor de saneamento e infraestrutura no Brasil.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
