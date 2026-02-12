import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, ExternalLink, Calendar, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

const leis = [
  {
    numero: "Lei nº 14.026/2020",
    nome: "Novo Marco Legal do Saneamento Básico",
    descricao: "Atualiza o marco legal e estabelece metas de universalização até 2033: 99% de cobertura de água e 90% de coleta/tratamento de esgoto.",
    status: "Em vigor",
    statusColor: "text-green-600 bg-green-50 border-green-200",
    data: "15/07/2020",
    categoria: "Saneamento",
  },
  {
    numero: "Lei nº 14.133/2021",
    nome: "Nova Lei de Licitações e Contratos",
    descricao: "Substitui a Lei 8.666/93, modernizando os processos licitatórios com ênfase em transparência, eficiência e combate à corrupção.",
    status: "Em vigor",
    statusColor: "text-green-600 bg-green-50 border-green-200",
    data: "01/04/2021",
    categoria: "Licitações",
  },
  {
    numero: "Decreto nº 12.303/2024",
    nome: "Regulamentação do Marco do Saneamento",
    descricao: "Define critérios de comprovação de capacidade econômico-financeira para contratos de saneamento e metodologias de prestação regionalizada.",
    status: "Em vigor",
    statusColor: "text-green-600 bg-green-50 border-green-200",
    data: "05/12/2024",
    categoria: "Saneamento",
  },
  {
    numero: "NR-18",
    nome: "Segurança e Saúde no Trabalho na Construção",
    descricao: "Estabelece diretrizes de segurança para atividades na indústria da construção, incluindo demolição, escavações e obras de saneamento.",
    status: "Atualizada 2024",
    statusColor: "text-blue-600 bg-blue-50 border-blue-200",
    data: "Atualizada",
    categoria: "Segurança",
  },
  {
    numero: "NBR 12.211:2024",
    nome: "Estudos de Concepção de Sistemas de Abastecimento de Água",
    descricao: "Define procedimentos para elaboração de estudos de concepção de sistemas públicos de abastecimento de água para consumo humano.",
    status: "Vigente",
    statusColor: "text-green-600 bg-green-50 border-green-200",
    data: "2024",
    categoria: "Norma ABNT",
  },
  {
    numero: "Resolução ANA nº 122/2023",
    nome: "Normas de Referência para Regulação de Saneamento",
    descricao: "Estabelece normas de referência para a regulação dos serviços públicos de saneamento básico, incluindo padrões de qualidade e eficiência.",
    status: "Em vigor",
    statusColor: "text-green-600 bg-green-50 border-green-200",
    data: "2023",
    categoria: "Regulação",
  },
];

const categoriaColors: Record<string, string> = {
  Saneamento: "bg-blue-100 text-blue-700",
  Licitações: "bg-violet-100 text-violet-700",
  Segurança: "bg-amber-100 text-amber-700",
  "Norma ABNT": "bg-emerald-100 text-emerald-700",
  Regulação: "bg-pink-100 text-pink-700",
};

const LegislacaoSection = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            <Scale size={24} className="text-primary" />
            Legislação & Normas
          </h2>
          <p className="text-muted-foreground mt-2">
            Leis, decretos e normas técnicas essenciais para o setor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {leis.map((lei, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`text-[0.65rem] ${categoriaColors[lei.categoria] || ""}`}>
                    {lei.categoria}
                  </Badge>
                  <Badge variant="outline" className={`text-[0.65rem] ${lei.statusColor}`}>
                    {lei.status === "Em vigor" || lei.status === "Vigente" ? (
                      <CheckCircle2 size={10} className="mr-1" />
                    ) : lei.status.includes("Atualizada") ? (
                      <AlertTriangle size={10} className="mr-1" />
                    ) : null}
                    {lei.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                  {lei.numero}
                </h3>
                <h4 className="font-semibold text-xs text-primary mb-2">
                  {lei.nome}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {lei.descricao}
                </p>
                <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {lei.data}
                  </span>
                  <a href="#" className="flex items-center gap-1 text-primary hover:underline font-medium">
                    <FileText size={10} />
                    Ler mais
                    <ExternalLink size={10} />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LegislacaoSection;
