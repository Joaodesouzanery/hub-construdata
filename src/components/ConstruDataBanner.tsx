import { ExternalLink, ArrowRight } from "lucide-react";

const ConstruDataBanner = () => {
  return (
    <section className="py-10">
      <div className="container mx-auto px-6">
        {/* Imagem da plataforma como link clicável */}
        <a
          href="https://construdata.software/"
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            <img
              src="./construdata-preview.svg"
              alt="ConstruData — Plataforma de Orçamentação e Engenharia de Custos"
              className="w-full h-auto"
            />
          </div>
        </a>

        {/* Link + botão abaixo da imagem */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          <a
            href="https://construdata.software/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-sm"
          >
            Acessar ConstruData
            <ArrowRight size={16} />
          </a>
          <a
            href="https://construdata.software/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            construdata.software
            <ExternalLink size={13} />
          </a>
        </div>

        <p className="text-center mt-3 text-xs text-muted-foreground">
          Plataforma completa de orçamentação, composições SINAPI/SICRO e engenharia de custos para construção civil.
        </p>
      </div>
    </section>
  );
};

export default ConstruDataBanner;
