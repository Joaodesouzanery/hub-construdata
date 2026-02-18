import { useState, useMemo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import GlobalSearch from "../GlobalSearch";
import Breadcrumbs from "../Breadcrumbs";
import type { BreadcrumbItem } from "../Breadcrumbs";
import { Menu, Sun, Moon, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { TourGuiado } from "../TourGuiado";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/noticias": "Notícias",
  "/licitacoes": "Licitações",
  "/mapa": "Mapa do Brasil",
  "/alertas": "Alertas",
  "/legislacao": "Legislação",
  "/contato": "Contato",
  "/perfil": "Perfil",
  "/analitico": "Analítico",
  "/insights-ia": "Insights IA",
  "/relatorios": "Relatórios",
  "/empresas": "Dossiês",
  "/vinculos": "Grafo Vínculos",
  "/busca": "Busca IA",
  "/anomalias": "Anomalias",
  "/enriquecimento": "Enriquecimento",
  "/comparativo": "Comparativo UFs",
  "/setor": "Painel Setorial",
  "/privacidade": "Privacidade",
};

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return [{ label: "Dashboard" }];
    const parts = path.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/" }];
    let currentPath = "";
    for (const part of parts) {
      currentPath += `/${part}`;
      const label = routeLabels[currentPath] || decodeURIComponent(part);
      items.push(
        currentPath === path ? { label } : { label, href: currentPath }
      );
    }
    return items;
  }, [location.pathname]);

  return (
    <TourGuiado>
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 animate-slide-in-left">
            <AppSidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 lg:px-6 gap-3 transition-colors">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <span className="lg:hidden text-base font-extrabold tracking-tight">
            <span className="text-primary">Constru</span>Data
          </span>

          {/* Global Search */}
          <div className="hidden sm:flex flex-1 justify-center">
            <GlobalSearch />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* Date */}
            <span className="hidden md:block text-xs text-muted-foreground whitespace-nowrap">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Mobile Search */}
        <div className="sm:hidden px-4 py-2 border-b border-border bg-background transition-colors">
          <GlobalSearch />
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="px-4 lg:px-6 pt-3">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* Page Content */}
        <main className="animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-4 px-4 lg:px-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} ConstruData Hub</span>
            <Link
              to="/privacidade"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Shield size={12} />
              Política de Privacidade
            </Link>
          </div>
        </footer>
      </div>
    </div>
    </TourGuiado>
  );
};

export default AppLayout;
