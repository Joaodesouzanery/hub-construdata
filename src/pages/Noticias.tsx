import NewsSection from "@/components/NewsSection";
import Sidebar from "@/components/Sidebar";

const Noticias = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
          Notícias do Setor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Agregação de 17 fontes de engenharia, saneamento e infraestrutura
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <NewsSection />
        <Sidebar />
      </div>
    </div>
  );
};

export default Noticias;
