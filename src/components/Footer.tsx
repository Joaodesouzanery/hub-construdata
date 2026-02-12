import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white/70 pt-16">
      <div className="container mx-auto px-6">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-10">
          {/* Brand Column */}
          <div>
            <div className="text-xl font-extrabold mb-3">
              <span className="text-white">Constru</span>
              <span className="text-white/60">Data</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Plataforma completa para profissionais de engenharia, saneamento e
              infraestrutura. Dados, legislação e ferramentas técnicas em um só
              lugar.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              Links Rápidos
            </h4>
            <ul className="space-y-2.5">
              {[
                "Início",
                "Soluções",
                "Hub de Notícias",
                "Preços",
                "Termos de Uso",
                "Política de Privacidade",
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-primary flex-shrink-0" />
                contato@construdata.com.br
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-primary flex-shrink-0" />
                (11) 4002-8922
              </li>
              <li className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-primary flex-shrink-0" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
          &copy; 2026 ConstruData. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
