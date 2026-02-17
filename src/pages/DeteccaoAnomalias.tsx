import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Shield, Building2, TrendingUp, Target,
  Network, DollarSign, Calendar, MapPin,
  ChevronRight, Lock, BarChart3, Activity,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";
import { calcularRiskScore } from "@/lib/riskScore";

// ── Tipos ──
interface Anomalia {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "financeiro" | "vinculo" | "temporal" | "operacional" | "concentracao";
  severidade: "critica" | "alta" | "media" | "baixa";
  empresas: string[];
  indicadores: Record<string, string>;
  recomendacao: string;
}

// ── Motor de detecção ──
function detectarAnomalias(): Anomalia[] {
  const anomalias: Anomalia[] = [];
  const anoAtual = new Date().getFullYear();

  // Volume médio e desvio padrão para detecção de outliers
  const volumes = empresas.map((e) => e.volume_total_contratos);
  const mediaVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const stdVol = Math.sqrt(volumes.reduce((a, b) => a + (b - mediaVol) ** 2, 0) / volumes.length);

  // 1. Empresas recentes com volume desproporcional
  empresas.forEach((emp) => {
    const anos = anoAtual - emp.ano_fundacao;
    if (anos <= 5 && emp.volume_total_contratos > mediaVol) {
      anomalias.push({
        id: `fin-${emp.id}`,
        titulo: `Volume desproporcional: ${emp.nome_fantasia}`,
        descricao: `Empresa com apenas ${anos} anos possui volume de contratos acima da média do setor (${emp.volume_total_fmt}). Padrão requer investigação.`,
        categoria: "financeiro",
        severidade: emp.volume_total_contratos > mediaVol * 2 ? "critica" : "alta",
        empresas: [emp.id],
        indicadores: {
          "Anos atividade": `${anos}`,
          Volume: emp.volume_total_fmt,
          "Média setor": `R$ ${(mediaVol / 1e9).toFixed(2)}B`,
          Desvio: `${((emp.volume_total_contratos - mediaVol) / stdVol).toFixed(1)}σ`,
        },
        recomendacao: "Verificar origem dos contratos, quadro societário e possíveis ligações com empresas estabelecidas.",
      });
    }
  });

  // 2. Taxa de vitória anormalmente alta
  const taxas = empresas.map((e) => e.taxa_vitoria);
  const mediaTaxa = taxas.reduce((a, b) => a + b, 0) / taxas.length;
  const stdTaxa = Math.sqrt(taxas.reduce((a, b) => a + (b - mediaTaxa) ** 2, 0) / taxas.length);

  empresas.forEach((emp) => {
    if (emp.taxa_vitoria > mediaTaxa + 2 * stdTaxa && emp.licitacoes_participadas >= 20) {
      anomalias.push({
        id: `taxa-${emp.id}`,
        titulo: `Taxa de vitória atípica: ${emp.nome_fantasia}`,
        descricao: `Taxa de ${emp.taxa_vitoria}% está ${((emp.taxa_vitoria - mediaTaxa) / stdTaxa).toFixed(1)} desvios-padrão acima da média (${mediaTaxa.toFixed(1)}%). Possível padrão de direcionamento.`,
        categoria: "operacional",
        severidade: "alta",
        empresas: [emp.id],
        indicadores: {
          "Taxa vitória": `${emp.taxa_vitoria}%`,
          "Média setor": `${mediaTaxa.toFixed(1)}%`,
          Participações: `${emp.licitacoes_participadas}`,
          Vitórias: `${emp.licitacoes_vencidas}`,
        },
        recomendacao: "Analisar editais vencidos para identificar possíveis cláusulas direcionadoras ou restrições técnicas.",
      });
    }
  });

  // 3. Concentração geográfica por empresa
  empresas.forEach((emp) => {
    const projsEmp = projetos.filter((p) =>
      p.participantes.some((pp) => pp.empresa_id === emp.id)
    );
    const estados = new Set(projsEmp.map((p) => p.estado));
    if (projsEmp.length >= 3 && estados.size <= 1) {
      anomalias.push({
        id: `geo-${emp.id}`,
        titulo: `Concentração geográfica: ${emp.nome_fantasia}`,
        descricao: `Todos os ${projsEmp.length} projetos da empresa estão em ${estados.values().next().value || emp.estado_sede}. Alta dependência regional.`,
        categoria: "concentracao",
        severidade: "media",
        empresas: [emp.id],
        indicadores: {
          Projetos: `${projsEmp.length}`,
          Estados: `${estados.size}`,
          Região: estados.values().next().value || emp.estado_sede,
        },
        recomendacao: "Monitorar diversificação geográfica para reduzir risco de dependência de um único mercado.",
      });
    }
  });

  // 4. Vínculos repetidos entre empresas (possível conluio)
  const pairCount: Record<string, number> = {};
  const pairProjects: Record<string, string[]> = {};
  projetos.forEach((proj) => {
    const ids = proj.participantes.map((p) => p.empresa_id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join("|");
        pairCount[key] = (pairCount[key] || 0) + 1;
        if (!pairProjects[key]) pairProjects[key] = [];
        pairProjects[key].push(proj.titulo.slice(0, 50));
      }
    }
  });

  Object.entries(pairCount).forEach(([pair, count]) => {
    if (count >= 2) {
      const [id1, id2] = pair.split("|");
      const emp1 = empresas.find((e) => e.id === id1);
      const emp2 = empresas.find((e) => e.id === id2);
      if (emp1 && emp2) {
        anomalias.push({
          id: `vinc-${id1}-${id2}`,
          titulo: `Vínculo recorrente: ${emp1.nome_fantasia} + ${emp2.nome_fantasia}`,
          descricao: `Estas empresas participaram juntas em ${count} projetos. Padrão pode indicar relação societária não declarada ou cartel.`,
          categoria: "vinculo",
          severidade: count >= 3 ? "critica" : "alta",
          empresas: [id1, id2],
          indicadores: {
            "Projetos conjuntos": `${count}`,
            Empresa1: emp1.nome_fantasia,
            Empresa2: emp2.nome_fantasia,
          },
          recomendacao: "Investigar quadro societário cruzado, endereço fiscal comum e padrão de lances em licitações.",
        });
      }
    }
  });

  // 5. Projetos com execução muito baixa após período longo
  projetos.forEach((proj) => {
    if (proj.status === "Em Andamento") {
      const inicio = new Date(proj.data_inicio);
      const previsao = new Date(proj.data_previsao_termino);
      const hoje = new Date();
      const duracaoTotal = previsao.getTime() - inicio.getTime();
      const decorrido = hoje.getTime() - inicio.getTime();
      const percentTempo = duracaoTotal > 0 ? (decorrido / duracaoTotal) * 100 : 0;

      if (percentTempo > 50 && proj.percentual_execucao < 20) {
        const emp = empresas.find((e) => e.id === proj.empresa_responsavel_id);
        anomalias.push({
          id: `exec-${proj.id}`,
          titulo: `Execução crítica: ${proj.titulo.slice(0, 60)}`,
          descricao: `Projeto com ${percentTempo.toFixed(0)}% do prazo decorrido mas apenas ${proj.percentual_execucao}% de execução. Risco de atraso severo.`,
          categoria: "temporal",
          severidade: "critica",
          empresas: emp ? [emp.id] : [],
          indicadores: {
            "% Prazo": `${percentTempo.toFixed(0)}%`,
            "% Execução": `${proj.percentual_execucao}%`,
            Valor: proj.valor_contrato_fmt,
            Empresa: proj.empresa_responsavel_nome,
          },
          recomendacao: "Solicitar relatório de progresso atualizado e avaliar necessidade de intervenção contratual.",
        });
      }
    }
  });

  // 6. Score muito baixo com contratos ativos
  empresas.forEach((emp) => {
    const risk = calcularRiskScore(emp, projetos.filter((p) => p.participantes.some((pp) => pp.empresa_id === emp.id)), empresas);
    if (risk.classificacao === "critico" || (risk.scoreGeral < 40 && projetos.some((p) => p.empresa_responsavel_id === emp.id && p.status === "Em Andamento"))) {
      anomalias.push({
        id: `risk-${emp.id}`,
        titulo: `Risco crítico com contratos ativos: ${emp.nome_fantasia}`,
        descricao: `Score de risco ${risk.scoreGeral}/100 (${risk.classificacao}). Empresa possui contratos em andamento. ${risk.redFlags.length} alertas de risco identificados.`,
        categoria: "operacional",
        severidade: "critica",
        empresas: [emp.id],
        indicadores: {
          "Score risco": `${risk.scoreGeral}`,
          Classificação: risk.classificacao,
          "Red Flags": `${risk.redFlags.length}`,
          Contratos: `${projetos.filter((p) => p.empresa_responsavel_id === emp.id && p.status === "Em Andamento").length} ativos`,
        },
        recomendacao: risk.resumo,
      });
    }
  });

  // Sort by severity
  const sevOrder = { critica: 0, alta: 1, media: 2, baixa: 3 };
  anomalias.sort((a, b) => sevOrder[a.severidade] - sevOrder[b.severidade]);

  return anomalias;
}

// ── Cores e ícones ──
const sevConfig = {
  critica: { cor: "text-red-700", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-600 text-white", label: "Crítica" },
  alta: { cor: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-500 text-white", label: "Alta" },
  media: { cor: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500 text-white", label: "Média" },
  baixa: { cor: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-500 text-white", label: "Baixa" },
};

const catConfig = {
  financeiro: { icon: DollarSign, cor: "text-emerald-600", label: "Financeiro" },
  vinculo: { icon: Network, cor: "text-violet-600", label: "Vínculo" },
  temporal: { icon: Calendar, cor: "text-blue-600", label: "Temporal" },
  operacional: { icon: Activity, cor: "text-orange-600", label: "Operacional" },
  concentracao: { icon: MapPin, cor: "text-pink-600", label: "Concentração" },
};

const DeteccaoAnomalias = () => {
  const navigate = useNavigate();
  const [filtroSev, setFiltroSev] = useState<string>("todas");
  const [filtroCat, setFiltroCat] = useState<string>("todas");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const anomalias = useMemo(() => detectarAnomalias(), []);

  const filtradas = useMemo(() => {
    return anomalias.filter((a) => {
      if (filtroSev !== "todas" && a.severidade !== filtroSev) return false;
      if (filtroCat !== "todas" && a.categoria !== filtroCat) return false;
      return true;
    });
  }, [anomalias, filtroSev, filtroCat]);

  // Stats
  const stats = useMemo(() => ({
    total: anomalias.length,
    criticas: anomalias.filter((a) => a.severidade === "critica").length,
    altas: anomalias.filter((a) => a.severidade === "alta").length,
    empresasAfetadas: new Set(anomalias.flatMap((a) => a.empresas)).size,
  }), [anomalias]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <AlertTriangle size={28} className="text-red-500" />
            Detecção de Anomalias
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoramento inteligente de padrões atípicos — análise estatística e cruzamento de dados
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield size={14} className="text-emerald-500" />
          <span>Dados públicos · LGPD Art. 7°, II</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Anomalias Detectadas", valor: stats.total, icon: AlertTriangle, cor: "text-red-500", bg: "bg-red-500/10" },
          { label: "Severidade Crítica", valor: stats.criticas, icon: Activity, cor: "text-red-600", bg: "bg-red-600/10" },
          { label: "Severidade Alta", valor: stats.altas, icon: TrendingUp, cor: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Empresas Afetadas", valor: stats.empresasAfetadas, icon: Building2, cor: "text-blue-500", bg: "bg-blue-500/10" },
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

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Severidade:</span>
          {[
            { key: "todas", label: "Todas" },
            { key: "critica", label: "Crítica" },
            { key: "alta", label: "Alta" },
            { key: "media", label: "Média" },
            { key: "baixa", label: "Baixa" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltroSev(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                filtroSev === f.key
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Categoria:</span>
          {[
            { key: "todas", label: "Todas" },
            { key: "financeiro", label: "Financeiro" },
            { key: "vinculo", label: "Vínculo" },
            { key: "temporal", label: "Temporal" },
            { key: "operacional", label: "Operacional" },
            { key: "concentracao", label: "Concentração" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltroCat(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                filtroCat === f.key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Anomalias */}
      <div className="space-y-3">
        {filtradas.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-10 text-center text-muted-foreground">
              <Shield size={44} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-lg">Nenhuma anomalia encontrada</p>
              <p className="text-sm mt-1.5">Ajuste os filtros para visualizar anomalias detectadas.</p>
            </CardContent>
          </Card>
        ) : (
          filtradas.map((anomalia) => {
            const sev = sevConfig[anomalia.severidade];
            const cat = catConfig[anomalia.categoria];
            const isExpanded = expandedId === anomalia.id;

            return (
              <Card
                key={anomalia.id}
                className={`border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${sev.border} ${isExpanded ? sev.bg : ""}`}
                onClick={() => setExpandedId(isExpanded ? null : anomalia.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${sev.bg} flex-shrink-0`}>
                      <cat.icon size={18} className={cat.cor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded ${sev.badge}`}>
                          {sev.label}
                        </span>
                        <span className="text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {cat.label}
                        </span>
                      </div>
                      <h3 className={`text-sm font-bold leading-snug ${sev.cor}`}>{anomalia.titulo}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{anomalia.descricao}</p>

                      {/* Indicadores */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {Object.entries(anomalia.indicadores).map(([key, val]) => (
                          <span key={key} className="text-[0.65rem] text-muted-foreground">
                            <span className="font-semibold">{key}:</span> {val}
                          </span>
                        ))}
                      </div>

                      {/* Expandido */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t space-y-3">
                          <div>
                            <p className="text-xs font-bold flex items-center gap-1.5 mb-1">
                              <Target size={12} />
                              Recomendação
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed bg-white/70 p-2.5 rounded-lg">
                              {anomalia.recomendacao}
                            </p>
                          </div>
                          {anomalia.empresas.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {anomalia.empresas.map((empId) => {
                                const emp = empresas.find((e) => e.id === empId);
                                if (!emp) return null;
                                return (
                                  <Button
                                    key={empId}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs gap-1.5 h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/empresas/${empId}`);
                                    }}
                                  >
                                    <Building2 size={12} />
                                    {emp.nome_fantasia}
                                    <ChevronRight size={12} />
                                  </Button>
                                );
                              })}
                            </div>
                          )}
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
          })
        )}
      </div>

      {/* Metodologia e LGPD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 size={16} className="text-violet-500" />
              Metodologia de Detecção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p className="leading-relaxed">O sistema utiliza análise estatística para identificar desvios significativos dos padrões normais:</p>
            <ul className="space-y-1.5 ml-1">
              <li className="flex items-start gap-2"><span className="text-violet-500 font-bold">1.</span> Análise de outliers por desvio-padrão (Z-score)</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 font-bold">2.</span> Cruzamento de vínculos entre empresas via grafos</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 font-bold">3.</span> Análise temporal de execução vs. planejamento</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 font-bold">4.</span> Score de risco multidimensional ponderado</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 font-bold">5.</span> Detecção de concentração geográfica e setorial</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lock size={16} className="text-emerald-600" />
              Conformidade LGPD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <Shield size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Análise baseada exclusivamente em dados públicos de licitações, contratos e editais (PNCP, diários oficiais)</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Dados de Pessoa Jurídica — sem tratamento de dados pessoais sensíveis</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Base legal: Art. 7°, II e III da LGPD (obrigação legal e execução de políticas públicas)</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Anomalias são indicativos para análise humana — não constituem prova de irregularidade</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeteccaoAnomalias;
