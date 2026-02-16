import QuickToolsSection from "@/components/QuickToolsSection";
import CalculadoraSection from "@/components/CalculadoraSection";
import MaterialPricesSection from "@/components/MaterialPricesSection";

const Ferramentas = () => {
  return (
    <div>
      <div className="p-6 lg:p-8 pb-0">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
          Ferramentas & Recursos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calculadoras, tabelas de preços e ferramentas técnicas para engenharia
        </p>
      </div>

      <QuickToolsSection />
      <CalculadoraSection />
      <MaterialPricesSection />
    </div>
  );
};

export default Ferramentas;
