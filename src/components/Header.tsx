import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Hub", href: "/hub" },
  { label: "Contato", href: "/contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <a href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-primary">Constru</span>
          <span className="text-foreground">Data</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href ||
              (link.href === "/" && location.pathname === "/hub");
            return (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors relative pb-1 ${
                  isActive
                    ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* CTA Button */}
        <Button className="hidden md:inline-flex">Teste Grátis</Button>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-border px-6 pb-4 shadow-lg">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium py-2 ${
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <Button className="mt-2 w-full">Teste Grátis</Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
