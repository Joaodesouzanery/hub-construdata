import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import ConstruDataBanner from "@/components/ConstruDataBanner";
import QuickToolsSection from "@/components/QuickToolsSection";
import CalculadoraSection from "@/components/CalculadoraSection";
import MaterialPricesSection from "@/components/MaterialPricesSection";
import TabNavigation from "@/components/TabNavigation";
import NewsSection from "@/components/NewsSection";
import LicitacoesSection from "@/components/LicitacoesSection";
import IndicadoresSection from "@/components/IndicadoresSection";
import UpdatesSection from "@/components/UpdatesSection";
import BlogSection from "@/components/BlogSection";
import LegislacaoSection from "@/components/LegislacaoSection";
import EventosSection from "@/components/EventosSection";
import PartnersSection from "@/components/PartnersSection";
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
      <StatsBar />

      {/* Banner ConstruData Software */}
      <ConstruDataBanner />

      {/* Quick Tools Section - sempre visível */}
      <div id="ferramentas">
        <QuickToolsSection />
      </div>

      {/* Calculadora BDI interativa */}
      <div id="calculadora">
        <CalculadoraSection />
      </div>

      {/* Preços de Materiais */}
      <div id="materiais">
        <MaterialPricesSection />
      </div>

      {/* Legislação & Normas */}
      <LegislacaoSection />

      {/* Conteúdo por Abas */}
      <div id="conteudo">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

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

      {/* Agenda de Eventos */}
      <EventosSection />

      {/* Parceiros */}
      <PartnersSection />

      <Footer />
    </div>
  );
};

export default Hub;
