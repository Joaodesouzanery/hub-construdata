import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";

const HeroSection = () => {
  const [busca, setBusca] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Scroll to ferramentas section
    document.getElementById("ferramentas")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-gradient-to-br from-[#0f172a] via-[#162a4a] to-[#1e3a5f] text-white py-16 md:py-24 text-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <Badge className="bg-white/15 text-white border-0 text-xs font-semibold tracking-widest uppercase px-5 py-1.5 mb-5">
          Central de Conteúdo
        </Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          Hub ConstruData
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-8">
          Sua fonte central de notícias, legislação, artigos técnicos, licitações
          e ferramentas para o setor de saneamento e infraestrutura no Brasil.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-1.5">
            <Search size={20} className="ml-3 text-white/50" />
            <input
              type="text"
              placeholder="Buscar licitações, normas, materiais, artigos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder:text-white/40 px-4 py-3 outline-none text-sm"
            />
            <Button type="submit" size="sm" className="px-6 rounded-lg">
              Buscar
            </Button>
          </div>
        </form>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <a href="#ferramentas" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
            <Zap size={14} className="text-amber-400" />
            12 Ferramentas
          </a>
          <a href="#materiais" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
            <span className="text-green-400 text-xs font-bold">R$</span>
            Preços de Materiais
          </a>
          <a href="#calculadora" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
            <span className="text-cyan-400 text-xs font-bold">%</span>
            Calculadora BDI
          </a>
          <a href="#conteudo" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-semibold transition-colors">
            Explorar Conteúdo
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
