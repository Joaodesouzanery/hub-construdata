import LicitacoesSection from "@/components/LicitacoesSection";

const LicitacoesPage = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
          Buscador de Licitações
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Licitações de engenharia e saneamento do Portal Nacional de Contratações Públicas (PNCP)
        </p>
      </div>

      <LicitacoesSection />
    </div>
  );
};

export default LicitacoesPage;
