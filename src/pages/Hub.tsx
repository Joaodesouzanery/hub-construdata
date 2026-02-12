import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TabNavigation from "@/components/TabNavigation";
import NewsSection from "@/components/NewsSection";
import LicitacoesSection from "@/components/LicitacoesSection";
import IndicadoresSection from "@/components/IndicadoresSection";
import UpdatesSection from "@/components/UpdatesSection";
import BlogSection from "@/components/BlogSection";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const Hub = () => {
  const [activeTab, setActiveTab] = useState("noticias");

  // Abas com conteúdo largo usam layout full-width (sem sidebar)
  const fullWidthTabs = ["licitacoes", "indicadores"];
  const isFullWidth = fullWidthTabs.includes(activeTab);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 py-10">
        <div className="container mx-auto px-6">
          {isFullWidth ? (
            /* Full-width layout para Licitações e Indicadores */
            <div>
              {activeTab === "licitacoes" && <LicitacoesSection />}
              {activeTab === "indicadores" && <IndicadoresSection />}
            </div>
          ) : (
            /* Layout com sidebar para Notícias, Updates e Blog */
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
              <div>
                {activeTab === "noticias" && <NewsSection />}
                {activeTab === "atualizacoes" && <UpdatesSection />}
                {activeTab === "blog" && <BlogSection />}
              </div>
              <Sidebar />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hub;
