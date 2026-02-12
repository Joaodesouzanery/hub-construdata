import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TabNavigation from "@/components/TabNavigation";
import NewsSection from "@/components/NewsSection";
import UpdatesSection from "@/components/UpdatesSection";
import BlogSection from "@/components/BlogSection";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const Hub = () => {
  const [activeTab, setActiveTab] = useState("noticias");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
            {/* Left Column — Tab Content */}
            <div>
              {activeTab === "noticias" && <NewsSection />}
              {activeTab === "atualizacoes" && <UpdatesSection />}
              {activeTab === "blog" && <BlogSection />}
            </div>

            {/* Right Column — Sidebar */}
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hub;
