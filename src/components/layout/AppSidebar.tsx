import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  FileSearch,
  Map,
  BellRing,
  BarChart3,
  Scale,
  Wrench,
  CalendarDays,
  Mail,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  TrendingUp,
  Download,
  Briefcase,
  Brain,
  Network,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", group: "principal" },
  { to: "/noticias", icon: Newspaper, label: "Notícias", badge: "Fase 5", group: "principal" },
  { to: "/licitacoes", icon: FileSearch, label: "Licitações", group: "principal" },
  { to: "/mapa", icon: Map, label: "Mapa do Brasil", group: "principal" },
  { to: "/alertas", icon: BellRing, label: "Alertas", group: "principal" },
  { to: "/empresas", icon: Briefcase, label: "Dossiês", badge: "Fase 4", group: "fase2" },
  { to: "/vinculos", icon: Network, label: "Grafo Vínculos", badge: "Novo", group: "fase2" },
  { to: "/busca", icon: Search, label: "Busca IA", badge: "IA", group: "fase2" },
  { to: "/analitico", icon: TrendingUp, label: "Análises", badge: "Novo", group: "fase2" },
  { to: "/insights-ia", icon: Brain, label: "Insights IA", badge: "IA", group: "fase2" },
  { to: "/relatorios", icon: Download, label: "Relatórios", badge: "Novo", group: "fase2" },
  { to: "/indicadores", icon: BarChart3, label: "Indicadores", group: "dados" },
  { to: "/legislacao", icon: Scale, label: "Legislação", group: "dados" },
  { to: "/ferramentas", icon: Wrench, label: "Ferramentas", group: "dados" },
  { to: "/eventos", icon: CalendarDays, label: "Eventos", group: "dados" },
  { to: "/contato", icon: Mail, label: "Contato", group: "dados" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#0f172a] text-white z-50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-base font-extrabold tracking-tight">
              Constru<span className="text-primary/80">Data</span>
            </span>
            <span className="block text-[0.6rem] text-white/40 uppercase tracking-widest">
              Inteligência
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item, index) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === "/" && location.pathname === "/dashboard");

            // Add separator before "fase2" group
            const prevItem = navItems[index - 1];
            const showSeparator = prevItem && prevItem.group !== item.group;

            return (
              <li key={item.to}>
                {showSeparator && (
                  <div className="border-t border-white/10 my-2 mx-1" />
                )}
                <NavLink
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="text-[0.55rem] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile button */}
      <NavLink
        to="/perfil"
        className={`flex items-center gap-3 mx-2 mb-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          location.pathname === "/perfil"
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "text-white/60 hover:text-white hover:bg-white/10"
        } ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? "Perfil" : undefined}
      >
        <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={14} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <span className="block text-sm font-medium truncate">
              {isAuthenticated ? user?.nome : "Entrar"}
            </span>
            {isAuthenticated && (
              <span className="block text-[0.6rem] text-white/40 truncate">
                {user?.email}
              </span>
            )}
          </div>
        )}
      </NavLink>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-white/10 text-white/40 hover:text-white transition-colors"
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default AppSidebar;
