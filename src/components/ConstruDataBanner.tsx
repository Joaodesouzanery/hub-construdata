import { ExternalLink } from "lucide-react";

const ConstruDataBanner = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-6 flex justify-center">
        <a
          href="https://construdata.software/"
          target="_blank"
          rel="noopener noreferrer"
          className="group block relative max-w-2xl w-full overflow-hidden rounded-xl border border-border/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          {/* Label Publicidade */}
          <span className="absolute top-2 right-2 z-10 text-[0.6rem] uppercase tracking-wider font-medium text-white/70 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
            Publicidade
          </span>

          {/* Banner Content */}
          <div className="relative bg-gradient-to-r from-[#0a1628] via-[#122a4e] to-[#1a3a6a] px-6 py-4 flex items-center gap-5">
            {/* Logo / Ícone */}
            <div className="flex-shrink-0 hidden sm:flex items-center justify-center w-14 h-14 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-2xl font-extrabold text-white tracking-tighter">
                C<span className="text-primary">D</span>
              </span>
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                  Constru<span className="text-primary">Data</span>
                </h3>
                <span className="text-[0.6rem] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Software
                </span>
              </div>
              <p className="text-white/60 text-xs sm:text-sm leading-snug truncate">
                Orçamentação, composições SINAPI/SICRO e engenharia de custos
              </p>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors group-hover:bg-primary/90">
              Acessar
              <ExternalLink size={13} />
            </div>
          </div>
        </a>
      </div>
    </section>
  );
};

export default ConstruDataBanner;
