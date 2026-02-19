import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search, Building2, FileText, Shield, TrendingUp, Globe, MapPin,
  BarChart3, Network, Zap, Database, ArrowRight, CheckCircle2,
  Eye, Scale, Activity, Wifi, Lock,
} from "lucide-react";

/* ─── Dados de Features ───────────────────────────────────── */
const FEATURES = [
  {
    icon: Globe,
    titulo: "PNCP Tempo Real",
    desc: "Busca ao vivo no Portal Nacional de Contratações Públicas. Milhares de licitações de saneamento e engenharia atualizadas diariamente.",
    cor: "text-green-600 bg-green-50",
  },
  {
    icon: Building2,
    titulo: "Dossiê de Empresas",
    desc: "Perfil completo com score de confiabilidade, taxa de vitória, volume de contratos e histórico de licitações.",
    cor: "text-blue-600 bg-blue-50",
  },
  {
    icon: Shield,
    titulo: "Due Diligence Automática",
    desc: "Consulta CEIS, CNEP, TCU e Receita Federal. Identifica sanções, impedimentos e red flags automaticamente.",
    cor: "text-violet-600 bg-violet-50",
  },
  {
    icon: Network,
    titulo: "Grafo de Vínculos",
    desc: "Mapeamento visual de relações entre empresas, consórcios, subcontratadas e sócios em projetos públicos.",
    cor: "text-amber-600 bg-amber-50",
  },
  {
    icon: Activity,
    titulo: "Detecção de Anomalias",
    desc: "Algoritmos que identificam padrões suspeitos: preços fora do mercado, concentração de vencedores, prazos atípicos.",
    cor: "text-red-600 bg-red-50",
  },
  {
    icon: Search,
    titulo: "Busca Inteligente com IA",
    desc: "Pesquise em linguagem natural. A IA cruza dados de licitações, empresas, projetos e legislação simultaneamente.",
    cor: "text-primary bg-primary/10",
  },
  {
    icon: MapPin,
    titulo: "Mapa Interativo do Brasil",
    desc: "Visualize investimentos por estado, compare regiões e identifique oportunidades geográficas de saneamento.",
    cor: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Scale,
    titulo: "Legislação Consolidada",
    desc: "Marco Legal do Saneamento, Lei de Licitações, regulamentos setoriais — tudo indexado e pesquisável.",
    cor: "text-cyan-600 bg-cyan-50",
  },
];

const NUMEROS = [
  { valor: "83+", label: "Empresas Cadastradas", icon: Building2 },
  { valor: "360+", label: "Licitações Monitoradas", icon: FileText },
  { valor: "40+", label: "Projetos Rastreados", icon: TrendingUp },
  { valor: "R$ 85B+", label: "Volume Total Mapeado", icon: BarChart3 },
  { valor: "27", label: "Estados Cobertos", icon: MapPin },
  { valor: "5+", label: "APIs Gov. Conectadas", icon: Wifi },
];

const FONTES = [
  { nome: "PNCP", desc: "Portal Nacional de Contratações Públicas", status: "online" },
  { nome: "Receita Federal", desc: "Consulta CNPJ e QSA", status: "online" },
  { nome: "CEIS", desc: "Cadastro de Empresas Inidôneas", status: "online" },
  { nome: "CNEP", desc: "Cadastro Nacional de Empresas Punidas", status: "online" },
  { nome: "TCU", desc: "Tribunal de Contas da União", status: "online" },
  { nome: "IBGE", desc: "Dados Municipais e Demográficos", status: "online" },
  { nome: "SNIS", desc: "Sistema Nacional de Informações de Saneamento", status: "online" },
  { nome: "ANA", desc: "Agência Nacional de Águas", status: "online" },
];

const DEPOIMENTOS = [
  {
    texto: "Reduziu em 70% o tempo que gastávamos buscando licitações manualmente no PNCP.",
    autor: "Diretor de Novos Negócios",
    empresa: "Construtora de Grande Porte — SP",
  },
  {
    texto: "O dossiê de empresas é essencial para nossa due diligence antes de formar consórcios.",
    autor: "Gerente de Compliance",
    empresa: "Concessionária de Saneamento — RJ",
  },
  {
    texto: "A detecção de anomalias nos ajudou a identificar padrões que não veríamos manualmente.",
    autor: "Auditor de Contratos",
    empresa: "Autarquia Municipal — MG",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ Navbar ═══ */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight">Hub ConstruData</span>
              <span className="hidden sm:inline text-[0.6rem] ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase">
                Beta
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Entrar
            </Button>
            <Button size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5">
              Acessar Plataforma <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Zap size={12} />
            APIs Governamentais Conectadas em Tempo Real
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            A maior base de
            <span className="text-primary"> inteligência em saneamento</span> e engenharia do Brasil
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Licitações ao vivo do PNCP, dossiês de empresas, análise de risco,
            grafo de vínculos e due diligence automática — tudo em uma plataforma.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="gap-2 px-8 text-base">
              Acessar Plataforma Gratuita <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/licitacoes")} className="gap-2 px-8 text-base">
              <Globe size={16} /> Ver Licitações ao Vivo
            </Button>
          </div>

          {/* Preview mockup */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="h-10 bg-muted/50 flex items-center gap-2 px-4 border-b border-border/50">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-[0.6rem] text-muted-foreground ml-3 font-mono">hub-construdata.vercel.app</span>
              </div>
              <div className="p-6 lg:p-8 bg-gradient-to-b from-card to-muted/20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {NUMEROS.slice(0, 4).map((n) => (
                    <div key={n.label} className="text-center p-4 bg-background rounded-xl border border-border/50">
                      <n.icon size={20} className="mx-auto text-primary mb-2" />
                      <p className="text-2xl font-extrabold">{n.valor}</p>
                      <p className="text-[0.6rem] text-muted-foreground uppercase font-semibold">{n.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Números ═══ */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {NUMEROS.map((n) => (
              <div key={n.label} className="text-center">
                <n.icon size={20} className="mx-auto text-primary mb-2" />
                <p className="text-2xl font-extrabold">{n.valor}</p>
                <p className="text-[0.65rem] text-muted-foreground uppercase font-semibold tracking-wide">{n.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Tudo que você precisa para <span className="text-primary">vencer licitações</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Da busca de oportunidades à análise de concorrentes — inteligência competitiva real para o setor de saneamento e engenharia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <Card key={f.titulo} className="p-6 border-0 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.cor}`}>
                <f.icon size={22} />
              </div>
              <h3 className="text-sm font-bold mb-2 group-hover:text-primary transition-colors">{f.titulo}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ PNCP Tempo Real — Destaque ═══ */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase mb-4">
                <Wifi size={12} /> Conexão ao Vivo
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Licitações direto do <span className="text-primary">PNCP</span> em tempo real
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Não dependemos de dados estáticos. Nossa plataforma consulta a API oficial do
                Portal Nacional de Contratações Públicas (pncp.gov.br) em tempo real.
                Busque por saneamento, ETA, esgoto, adutora — e veja resultados ao vivo.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Busca por palavra-chave, UF e categoria",
                  "Filtros por valor, modalidade e região",
                  "Link direto para o edital no portal oficial",
                  "Chips de busca rápida para termos do setor",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate("/licitacoes")} className="gap-2">
                Buscar Licitações Agora <ArrowRight size={14} />
              </Button>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-green-600">PNCP API — Online</span>
              </div>
              <div className="space-y-3">
                {[
                  { titulo: "ETA Capacidade 500 L/s — Ampliação", orgao: "SABESP", uf: "SP", valor: "R$ 85,2M" },
                  { titulo: "Rede Coletora de Esgoto — Etapa 3", orgao: "BRK Ambiental", uf: "AL", valor: "R$ 42,7M" },
                  { titulo: "Adutora DN 800 — 18km", orgao: "COPASA", uf: "MG", valor: "R$ 67,3M" },
                  { titulo: "ETE Compacta — Tratamento Terciário", orgao: "CAESB", uf: "DF", valor: "R$ 23,1M" },
                ].map((l, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Concorrência</span>
                      <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800 flex items-center gap-0.5">
                        <Wifi size={7} /> PNCP
                      </span>
                    </div>
                    <p className="text-xs font-semibold mb-1">{l.titulo}</p>
                    <div className="flex items-center justify-between text-[0.6rem] text-muted-foreground">
                      <span>{l.orgao} · {l.uf}</span>
                      <span className="font-bold text-primary">{l.valor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Due Diligence + Receita Federal ═══ */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 rounded-2xl border border-border/50 bg-card shadow-lg p-6">
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <Shield size={14} className="text-blue-600" />
              Due Diligence Automatizada
            </h4>
            <div className="space-y-2">
              {FONTES.map((f) => (
                <div key={f.nome} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-bold">{f.nome}</span>
                  </div>
                  <span className="text-muted-foreground text-[0.6rem]">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase mb-4">
              <Lock size={12} /> Compliance
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Due diligence em <span className="text-primary">8 bases oficiais</span> com um clique
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Consulte CEIS, CNEP, TCU, Receita Federal e outras bases públicas automaticamente.
              Identifique sanções ativas, impedimentos e red flags antes de fechar contratos.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Consulta CNPJ com QSA (quadro societário) da Receita Federal",
                "Verificação automática em bases de sanções (CEIS/CNEP)",
                "Score de risco multidimensional com radar chart",
                "Alertas de red flags com severidade (alta/média/baixa)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-violet-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" onClick={() => navigate("/empresas")} className="gap-2">
              <Eye size={14} /> Ver Dossiês de Empresas
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ Depoimentos ═══ */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-extrabold text-center mb-12">
            Quem usa, <span className="text-primary">recomenda</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((d, i) => (
              <Card key={i} className="p-6 border-0 shadow-sm">
                <p className="text-sm text-muted-foreground italic mb-4 leading-relaxed">"{d.texto}"</p>
                <div>
                  <p className="text-xs font-bold">{d.autor}</p>
                  <p className="text-[0.65rem] text-muted-foreground">{d.empresa}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Final ═══ */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Pronto para ter <span className="text-primary">vantagem competitiva</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Acesse agora a maior plataforma de inteligência em saneamento e engenharia do Brasil. Gratuito.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="gap-2 px-10 text-base">
              Acessar Plataforma <ArrowRight size={16} />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate("/licitacoes")} className="gap-2 text-base">
              <Globe size={16} /> Explorar Licitações
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Database size={16} className="text-white" />
                </div>
                <span className="font-extrabold">Hub ConstruData</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plataforma de inteligência em saneamento e engenharia.
                Dados abertos do governo brasileiro processados com tecnologia.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3">Plataforma</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/dashboard")}>Dashboard</li>
                <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/licitacoes")}>Licitações</li>
                <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/empresas")}>Empresas</li>
                <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/mapa")}>Mapa do Brasil</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3">Inteligência</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/busca")}>Busca IA</li>
                <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/vinculos")}>Grafo de Vínculos</li>
                <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/anomalias")}>Detecção de Anomalias</li>
                <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/comparativo")}>Comparativo Estados</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3">Fontes de Dados</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>PNCP — pncp.gov.br</li>
                <li>Receita Federal</li>
                <li>CEIS / CNEP / TCU</li>
                <li>IBGE / SNIS / ANA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[0.65rem] text-muted-foreground">
              Hub ConstruData — Plataforma de dados abertos para saneamento e engenharia.
            </p>
            <div className="flex items-center gap-4 text-[0.65rem] text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/privacidade")}>Política de Privacidade</span>
              <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate("/contato")}>Contato</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
