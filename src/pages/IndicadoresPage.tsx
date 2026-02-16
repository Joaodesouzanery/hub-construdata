import IndicadoresSection from "@/components/IndicadoresSection";

const IndicadoresPage = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
          Indicadores do Setor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Dados de saneamento, infraestrutura e fontes oficiais do governo
        </p>
      </div>

      <IndicadoresSection />
    </div>
  );
};

export default IndicadoresPage;
