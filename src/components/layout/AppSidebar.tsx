import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  FileSearch,
  Map,
  Bell,
  BarChart3,
  Scale,
  Wrench,
  CalendarDays,
  Mail,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/noticias", icon: Newspaper, label: "Notícias" },
  { to: "/licitacoes", icon: FileSearch, label: "Licitações" },
  { to: "/mapa", icon: Map, label: "Mapa do Brasil" },
  { to: "/alertas", icon: Bell, label: "Alertas" },
  { to: "/indicadores", icon: BarChart3, label: "Indicadores" },
  { to: "/legislacao", icon: Scale, label: "Legislação" },
  { to: "/ferramentas", icon: Wrench, label: "Ferramentas" },
  { to: "/eventos", icon: CalendarDays, label: "Eventos" },
  { to: "/contato", icon: Mail, label: "Contato" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = useLocation();

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
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === "/" && location.pathname === "/dashboard");

            return (
              <li key={item.to}>
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
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

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
