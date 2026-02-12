import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, Users, ExternalLink } from "lucide-react";

const eventos = [
  {
    titulo: "FENASAN 2026 — Feira Nacional de Saneamento",
    data: "18–20 Mar 2026",
    local: "São Paulo Expo, SP",
    tipo: "Feira",
    destaque: true,
    descricao: "Maior evento do setor de saneamento da América Latina, reunindo empresas, órgãos públicos e especialistas.",
    participantes: "15.000+",
  },
  {
    titulo: "Congresso ABES — Associação Brasileira de Engenharia Sanitária",
    data: "05–08 Mai 2026",
    local: "Centro de Convenções, Brasília",
    tipo: "Congresso",
    destaque: false,
    descricao: "Congresso técnico com apresentação de papers, workshops e painéis sobre o avanço do saneamento.",
    participantes: "3.500+",
  },
  {
    titulo: "Seminário Marco Legal do Saneamento — 6 Anos de Avanços",
    data: "15 Jul 2026",
    local: "Online (Zoom)",
    tipo: "Webinar",
    destaque: false,
    descricao: "Análise dos resultados e desafios seis anos após a aprovação do Novo Marco Legal do Saneamento.",
    participantes: "2.000+",
  },
  {
    titulo: "CONCRETE SHOW 2026",
    data: "26–28 Ago 2026",
    local: "São Paulo Expo, SP",
    tipo: "Feira",
    destaque: false,
    descricao: "Exposição internacional de concreto, construção e obras de infraestrutura pesada.",
    participantes: "30.000+",
  },
  {
    titulo: "Workshop SINAPI — Atualização de Preços e Composições",
    data: "10 Set 2026",
    local: "CAIXA, Brasília + Online",
    tipo: "Workshop",
    destaque: false,
    descricao: "Treinamento oficial sobre as atualizações da tabela SINAPI e novas composições de referência.",
    participantes: "800+",
  },
  {
    titulo: "EXPOSEC 2026 — Segurança no Trabalho na Construção",
    data: "14–16 Out 2026",
    local: "São Paulo Expo, SP",
    tipo: "Feira",
    destaque: false,
    descricao: "Evento focado em segurança do trabalho, EPIs, NRs e boas práticas em canteiros de obra.",
    participantes: "10.000+",
  },
];

const tipoColors: Record<string, string> = {
  Feira: "bg-blue-100 text-blue-700",
  Congresso: "bg-violet-100 text-violet-700",
  Webinar: "bg-green-100 text-green-700",
  Workshop: "bg-amber-100 text-amber-700",
};

const EventosSection = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            <CalendarDays size={24} className="text-primary" />
            Agenda de Eventos 2026
          </h2>
          <p className="text-muted-foreground mt-2">
            Feiras, congressos, webinars e workshops do setor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventos.map((evento, index) => (
            <Card
              key={index}
              className={`hover:shadow-md transition-shadow group ${
                evento.destaque ? "ring-2 ring-primary/30 bg-primary/[0.02]" : ""
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`text-[0.65rem] ${tipoColors[evento.tipo] || ""}`}>
                    {evento.tipo}
                  </Badge>
                  {evento.destaque && (
                    <Badge className="text-[0.65rem] bg-primary text-white">
                      Destaque
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors leading-snug">
                  {evento.titulo}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {evento.descricao}
                </p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-primary flex-shrink-0" />
                    {evento.data}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-primary flex-shrink-0" />
                    {evento.local}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-primary flex-shrink-0" />
                    {evento.participantes} participantes esperados
                  </div>
                </div>
                <a
                  href="#"
                  className="flex items-center gap-1 text-xs text-primary font-semibold mt-4 hover:underline"
                >
                  Saiba mais <ExternalLink size={11} />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventosSection;
