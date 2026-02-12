interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "noticias", label: "📰 Notícias do Setor" },
  { id: "atualizacoes", label: "🚀 Atualizações do Sistema" },
  { id: "blog", label: "📝 Blog & Artigos" },
];

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="bg-white border-b border-border sticky top-[72px] z-40">
      <div className="container mx-auto px-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-[3px] transition-all ${
              activeTab === tab.id
                ? "text-primary border-primary font-semibold"
                : "text-muted-foreground border-transparent hover:text-primary hover:bg-muted/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
