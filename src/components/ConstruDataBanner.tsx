import { Button } from "@/components/ui/button";
import { ExternalLink, BarChart3, FileText, Calculator, Shield, ArrowRight } from "lucide-react";

const ConstruDataBanner = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <a
          href="https://construdata.software/"
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-0">
              {/* Left side - Text Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 w-fit">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  Software Profissional
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                  Constru<span className="text-blue-400">Data</span>
                </h2>

                <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">
                  A plataforma completa para orçamentação, gestão de obras e
                  engenharia de custos. Tabelas SINAPI, SICRO, composições,
                  BDI e muito mais — tudo em um só lugar.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <BarChart3 size={16} className="text-blue-400" />
                    Orçamentos
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <FileText size={16} className="text-green-400" />
                    SINAPI & SICRO
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calculator size={16} className="text-amber-400" />
                    Composições
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Shield size={16} className="text-violet-400" />
                    Cálculo de BDI
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl group-hover:bg-blue-400 transition-colors">
                    Acessar Plataforma
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <span className="text-white/40 text-sm flex items-center gap-1">
                    construdata.software
                    <ExternalLink size={12} />
                  </span>
                </div>
              </div>

              {/* Right side - Platform Preview */}
              <div className="hidden lg:flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#1a2332]">
                  {/* Simulated App Header */}
                  <div className="bg-[#0d1520] px-4 py-3 flex items-center gap-2 border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-white/40 text-xs ml-2 font-mono">construdata.software</span>
                  </div>

                  {/* Simulated App Content */}
                  <div className="flex">
                    {/* Sidebar */}
                    <div className="w-16 bg-[#0f1923] p-2 space-y-3 border-r border-white/5">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg mx-auto flex items-center justify-center">
                        <span className="text-blue-400 text-xs font-bold">CD</span>
                      </div>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`w-10 h-10 ${i === 1 ? 'bg-blue-500/20' : 'bg-white/5'} rounded-lg mx-auto`} />
                      ))}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-4 space-y-3">
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                          <div className="text-blue-400 text-xs font-bold">R$ 2.4M</div>
                          <div className="text-white/30 text-[0.55rem]">Orçamento</div>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-2 text-center">
                          <div className="text-green-400 text-xs font-bold">847</div>
                          <div className="text-white/30 text-[0.55rem]">Composições</div>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-2 text-center">
                          <div className="text-amber-400 text-xs font-bold">24.8%</div>
                          <div className="text-white/30 text-[0.55rem]">BDI</div>
                        </div>
                      </div>

                      {/* Table Rows */}
                      <div className="space-y-1.5">
                        <div className="bg-white/5 rounded p-2 flex justify-between">
                          <div className="text-white/50 text-[0.6rem]">Cimento CP II</div>
                          <div className="text-white/70 text-[0.6rem] font-mono">R$ 34,50</div>
                        </div>
                        <div className="bg-white/5 rounded p-2 flex justify-between">
                          <div className="text-white/50 text-[0.6rem]">Aço CA-50</div>
                          <div className="text-white/70 text-[0.6rem] font-mono">R$ 7,85</div>
                        </div>
                        <div className="bg-blue-500/10 rounded p-2 flex justify-between">
                          <div className="text-blue-300 text-[0.6rem]">Concreto fck 25</div>
                          <div className="text-blue-300 text-[0.6rem] font-mono">R$ 485,00</div>
                        </div>
                        <div className="bg-white/5 rounded p-2 flex justify-between">
                          <div className="text-white/50 text-[0.6rem]">Tubo PVC DN100</div>
                          <div className="text-white/70 text-[0.6rem] font-mono">R$ 42,90</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="relative z-10 bg-white/5 border-t border-white/5 px-8 py-3 flex items-center justify-center gap-6 text-white/40 text-xs">
              <span>Orçamentação</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Engenharia de Custos</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Gestão de Obras</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>SINAPI & SICRO</span>
            </div>
          </div>
        </a>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          Acesse{" "}
          <a
            href="https://construdata.software/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            construdata.software
          </a>
          {" "}— A plataforma de orçamentação e engenharia de custos para construção civil.
        </p>
      </div>
    </section>
  );
};

export default ConstruDataBanner;
