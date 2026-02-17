import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database, Shield, Building2, CheckCircle2, XCircle, Clock,
  Lock, BarChart3, RefreshCw,
  Eye, ChevronRight, Info,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";

// ── Tipos ──
interface FonteDados {
  id: string;
  nome: string;
  descricao: string;
  tipo: "publica" | "parceiro" | "calculado";
  status: "ativo" | "manutencao" | "planejado";
  cobertura: number; // percentual
  ultimaAtualizacao: string;
  lgpdBase: string;
  campos: string[];
}

interface EnriquecimentoEmpresa {
  empresaId: string;
  nomeFantasia: string;
  fontesCruzadas: number;
  completude: number;
  ultimoEnriquecimento: string;
  dadosDisponiveis: {
    fonte: string;
    status: "ok" | "pendente" | "indisponivel";
    campos: string[];
  }[];
}

// ── Fontes de dados ──
const fontes: FonteDados[] = [
  {
    id: "pncp",
    nome: "PNCP (Portal Nacional de Contratações Públicas)",
    descricao: "Licitações, contratos e atas de registro de preços publicados por órgãos públicos.",
    tipo: "publica",
    status: "ativo",
    cobertura: 85,
    ultimaAtualizacao: "2026-02-17",
    lgpdBase: "Art. 7°, II - Cumprimento de obrigação legal",
    campos: ["Licitações", "Contratos", "Valores", "Órgãos"],
  },
  {
    id: "rfb",
    nome: "Receita Federal (Dados Abertos CNPJ)",
    descricao: "Dados cadastrais de empresas: CNPJ, razão social, situação cadastral, atividades econômicas.",
    tipo: "publica",
    status: "ativo",
    cobertura: 100,
    ultimaAtualizacao: "2026-02-15",
    lgpdBase: "Art. 7°, II - Dados públicos",
    campos: ["CNPJ", "Razão Social", "CNAE", "Situação Cadastral", "Endereço"],
  },
  {
    id: "tce",
    nome: "Tribunais de Contas (TCU/TCEs)",
    descricao: "Pareceres, auditorias e julgamentos de contas de contratos públicos.",
    tipo: "publica",
    status: "ativo",
    cobertura: 60,
    ultimaAtualizacao: "2026-02-10",
    lgpdBase: "Art. 7°, III - Execução de políticas públicas",
    campos: ["Pareceres", "Auditorias", "Sanções", "Julgamentos"],
  },
  {
    id: "ceis",
    nome: "CEIS/CNEP (Cadastro de Sanções)",
    descricao: "Empresas e pessoas sancionadas, impedidas de licitar e contratar com o poder público.",
    tipo: "publica",
    status: "ativo",
    cobertura: 95,
    ultimaAtualizacao: "2026-02-16",
    lgpdBase: "Art. 7°, II - Cumprimento de obrigação legal",
    campos: ["Sanções Ativas", "Tipo Sanção", "Órgão Sancionador", "Prazo"],
  },
  {
    id: "diarios",
    nome: "Diários Oficiais (DOU/DOEs)",
    descricao: "Publicações oficiais com extratos de contratos, nomeações e alterações empresariais.",
    tipo: "publica",
    status: "ativo",
    cobertura: 70,
    ultimaAtualizacao: "2026-02-17",
    lgpdBase: "Art. 7°, II - Dados de domínio público",
    campos: ["Extratos", "Publicações", "Alterações Contratuais"],
  },
  {
    id: "geo",
    nome: "Geolocalização de Projetos (IBGE/OSM)",
    descricao: "Dados georreferenciados de projetos com coordenadas, regiões e indicadores locais.",
    tipo: "parceiro",
    status: "ativo",
    cobertura: 75,
    ultimaAtualizacao: "2026-01-20",
    lgpdBase: "Art. 7°, IX - Legítimo interesse",
    campos: ["Coordenadas", "Município", "IDH Local", "População"],
  },
  {
    id: "risk",
    nome: "Score de Risco Proprietário",
    descricao: "Análise multidimensional calculada pelo Hub: maturidade, performance, financeiro, execução.",
    tipo: "calculado",
    status: "ativo",
    cobertura: 100,
    ultimaAtualizacao: "2026-02-17",
    lgpdBase: "Art. 7°, IX - Legítimo interesse (dados PJ)",
    campos: ["Score Geral", "6 Dimensões", "Red Flags", "Classificação"],
  },
  {
    id: "snis",
    nome: "SNIS (Sistema Nacional de Informações sobre Saneamento)",
    descricao: "Indicadores operacionais, financeiros e de qualidade do setor de saneamento.",
    tipo: "publica",
    status: "planejado",
    cobertura: 0,
    ultimaAtualizacao: "-",
    lgpdBase: "Art. 7°, II - Dados públicos",
    campos: ["Índice de Atendimento", "Perdas", "Investimentos", "Tarifas"],
  },
];

// ── Simular enriquecimento por empresa ──
function gerarEnriquecimento(): EnriquecimentoEmpresa[] {
  return empresas.map((emp) => {
    const projsEmp = projetos.filter((p) => p.participantes.some((pp) => pp.empresa_id === emp.id));
    const dadosDisp = [
      { fonte: "PNCP", status: (emp.licitacoes_participadas > 0 ? "ok" : "pendente") as "ok" | "pendente" | "indisponivel", campos: ["Licitações", "Contratos"] },
      { fonte: "Receita Federal", status: "ok" as const, campos: ["CNPJ", "CNAE", "Situação"] },
      { fonte: "CEIS/CNEP", status: "ok" as const, campos: ["Status: Sem sanções"] },
      { fonte: "TCE", status: (emp.nota_score > 70 ? "ok" : "pendente") as "ok" | "pendente" | "indisponivel", campos: ["Pareceres"] },
      { fonte: "Diários Oficiais", status: (projsEmp.length > 0 ? "ok" : "indisponivel") as "ok" | "pendente" | "indisponivel", campos: ["Extratos de Contrato"] },
      { fonte: "Geolocalização", status: (projsEmp.length > 0 ? "ok" : "indisponivel") as "ok" | "pendente" | "indisponivel", campos: ["Coordenadas Projetos"] },
      { fonte: "Score de Risco", status: "ok" as const, campos: ["Score", "6 Dimensões", "Red Flags"] },
    ];
    const fontesCruzadas = dadosDisp.filter((d) => d.status === "ok").length;
    const completude = Math.round((fontesCruzadas / dadosDisp.length) * 100);

    return {
      empresaId: emp.id,
      nomeFantasia: emp.nome_fantasia,
      fontesCruzadas,
      completude,
      ultimoEnriquecimento: "2026-02-17",
      dadosDisponiveis: dadosDisp,
    };
  });
}

// ── Status config ──
const statusConfig = {
  ativo: { icon: CheckCircle2, cor: "text-emerald-600", bg: "bg-emerald-50", label: "Ativo" },
  manutencao: { icon: RefreshCw, cor: "text-amber-600", bg: "bg-amber-50", label: "Manutenção" },
  planejado: { icon: Clock, cor: "text-blue-600", bg: "bg-blue-50", label: "Planejado" },
};

const tipoConfig = {
  publica: { label: "Fonte Pública", bg: "bg-emerald-100 text-emerald-700" },
  parceiro: { label: "Parceiro", bg: "bg-blue-100 text-blue-700" },
  calculado: { label: "Calculado IA", bg: "bg-violet-100 text-violet-700" },
};

const EnriquecimentoDados = () => {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<"fontes" | "empresas">("fontes");
  const [expandedFonte, setExpandedFonte] = useState<string | null>(null);

  const enriquecimentos = useMemo(() => gerarEnriquecimento(), []);

  // Stats
  const stats = useMemo(() => ({
    fontesAtivas: fontes.filter((f) => f.status === "ativo").length,
    totalFontes: fontes.length,
    coberturaMedia: Math.round(fontes.filter((f) => f.status === "ativo").reduce((s, f) => s + f.cobertura, 0) / fontes.filter((f) => f.status === "ativo").length),
    empresasEnriquecidas: enriquecimentos.filter((e) => e.completude >= 70).length,
  }), [enriquecimentos]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Database size={28} className="text-emerald-500" />
            Enriquecimento de Dados
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cruzamento de fontes públicas para enriquecer dossiês — em conformidade com a LGPD
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock size={14} className="text-emerald-500" />
          <span>100% LGPD Compliant · Dados PJ</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Fontes Ativas", valor: `${stats.fontesAtivas}/${stats.totalFontes}`, icon: Database, cor: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Cobertura Média", valor: `${stats.coberturaMedia}%`, icon: BarChart3, cor: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Empresas Enriquecidas", valor: stats.empresasEnriquecidas, icon: Building2, cor: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Conformidade LGPD", valor: "100%", icon: Shield, cor: "text-emerald-600", bg: "bg-emerald-600/10" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={16} className={s.cor} />
              </div>
              <div>
                <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase">{s.label}</p>
                <p className="text-xl font-extrabold">{s.valor}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Abas */}
      <div className="flex items-center gap-2 border-b pb-0.5">
        {[
          { key: "fontes" as const, label: "Fontes de Dados", icon: Database },
          { key: "empresas" as const, label: "Status por Empresa", icon: Building2 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAbaAtiva(tab.key)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-t-lg transition-all ${
              abaAtiva === tab.key
                ? "bg-white shadow-sm border border-b-0 text-foreground -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo Fontes */}
      {abaAtiva === "fontes" && (
        <div className="space-y-3">
          {fontes.map((fonte) => {
            const status = statusConfig[fonte.status];
            const tipo = tipoConfig[fonte.tipo];
            const isExpanded = expandedFonte === fonte.id;

            return (
              <Card
                key={fonte.id}
                className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                  fonte.status === "planejado" ? "opacity-60" : ""
                }`}
                onClick={() => setExpandedFonte(isExpanded ? null : fonte.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${status.bg} flex-shrink-0`}>
                      <status.icon size={18} className={status.cor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded ${tipo.bg}`}>
                          {tipo.label}
                        </span>
                        <span className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded ${status.bg} ${status.cor}`}>
                          {status.label}
                        </span>
                        {fonte.cobertura > 0 && (
                          <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Cobertura: {fonte.cobertura}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold leading-snug">{fonte.nome}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{fonte.descricao}</p>

                      {/* Barra de cobertura */}
                      {fonte.cobertura > 0 && (
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${fonte.cobertura}%` }}
                          />
                        </div>
                      )}

                      {/* Campos */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {fonte.campos.map((campo) => (
                          <span key={campo} className="text-[0.6rem] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {campo}
                          </span>
                        ))}
                      </div>

                      {/* Expandido */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground block text-[0.6rem] font-semibold">Base Legal LGPD</span>
                              <p className="font-medium text-emerald-700">{fonte.lgpdBase}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[0.6rem] font-semibold">Última Atualização</span>
                              <p className="font-medium">{fonte.ultimaAtualizacao}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-muted-foreground flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Conteúdo Empresas */}
      {abaAtiva === "empresas" && (
        <div className="space-y-3">
          {enriquecimentos.map((enr) => (
            <Card
              key={enr.empresaId}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                    <Building2 size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold">{enr.nomeFantasia}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        enr.completude >= 80 ? "bg-emerald-100 text-emerald-700" :
                        enr.completude >= 50 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {enr.completude}% completo
                      </span>
                    </div>

                    {/* Barra de completude */}
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          enr.completude >= 80 ? "bg-emerald-500" :
                          enr.completude >= 50 ? "bg-amber-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${enr.completude}%` }}
                      />
                    </div>

                    {/* Fontes status */}
                    <div className="flex flex-wrap gap-1.5">
                      {enr.dadosDisponiveis.map((d) => (
                        <span
                          key={d.fonte}
                          className={`text-[0.6rem] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            d.status === "ok" ? "bg-emerald-50 text-emerald-700" :
                            d.status === "pendente" ? "bg-amber-50 text-amber-700" :
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {d.status === "ok" ? <CheckCircle2 size={9} /> :
                           d.status === "pendente" ? <Clock size={9} /> :
                           <XCircle size={9} />}
                          {d.fonte}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => navigate(`/empresas/${enr.empresaId}`)}
                  >
                    <Eye size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* LGPD Policy Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Lock size={16} className="text-emerald-600" />
            Política de Enriquecimento — Conformidade LGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Shield size={13} className="text-emerald-500" />
                Princípios Aplicados
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Finalidade:</strong> Análise de compliance e inteligência de mercado no setor de construção civil e saneamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Necessidade:</strong> Apenas dados essenciais para a análise são coletados e tratados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Transparência:</strong> Fontes e bases legais são documentadas e exibidas ao usuário</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Lock size={13} className="text-emerald-500" />
                Garantias de Proteção
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <Shield size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Exclusivamente dados de <strong>Pessoa Jurídica</strong> — sem dados pessoais sensíveis (Art. 5°, II LGPD)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Fontes oficiais e públicas: PNCP, Receita Federal, Diários Oficiais, TCU</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Direito de retificação e exclusão conforme Art. 18 da LGPD</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-2 border-t flex items-center gap-2">
            <Info size={12} className="text-emerald-500 flex-shrink-0" />
            <span className="text-[0.65rem]">
              Para exercer seus direitos previstos na LGPD (acesso, retificação, exclusão), utilize a página de Contato ou envie email para o DPO.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnriquecimentoDados;
