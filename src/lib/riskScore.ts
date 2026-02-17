/**
 * Sistema de Score de Risco — Análise multidimensional de empresas
 * Inspirado em plataformas de investigação empresarial (Sherlocker-style)
 */

import type { Empresa, Projeto } from "@/types/database";

export interface RiskDimension {
  nome: string;
  valor: number;       // 0-100
  peso: number;        // peso no score final
  descricao: string;
  status: "excelente" | "bom" | "regular" | "atencao" | "critico";
  redFlags: string[];
}

export interface RiskAnalysis {
  scoreGeral: number;
  classificacao: "baixo" | "moderado" | "elevado" | "critico";
  dimensoes: RiskDimension[];
  redFlags: RedFlag[];
  resumo: string;
}

export interface RedFlag {
  titulo: string;
  descricao: string;
  severidade: "alta" | "media" | "baixa";
  categoria: string;
}

function statusFromScore(score: number): RiskDimension["status"] {
  if (score >= 85) return "excelente";
  if (score >= 70) return "bom";
  if (score >= 50) return "regular";
  if (score >= 30) return "atencao";
  return "critico";
}

export function calcularRiskScore(
  empresa: Empresa,
  projetosEmpresa: Projeto[],
  todasEmpresas: Empresa[]
): RiskAnalysis {
  const redFlags: RedFlag[] = [];

  // ── 1. Maturidade (tempo de mercado) ──
  const anosAtividade = new Date().getFullYear() - empresa.ano_fundacao;
  let maturidade = Math.min(100, anosAtividade * 5);
  const maturidadeFlags: string[] = [];
  if (anosAtividade < 3) {
    maturidade = Math.max(20, maturidade);
    maturidadeFlags.push("Empresa com menos de 3 anos de mercado");
    redFlags.push({
      titulo: "Empresa recente",
      descricao: `Fundada em ${empresa.ano_fundacao} (${anosAtividade} anos). Empresas jovens têm maior risco de descontinuidade.`,
      severidade: "media",
      categoria: "Maturidade",
    });
  }
  if (anosAtividade >= 20) maturidade = 100;

  // ── 2. Performance em Licitações ──
  let performance = 0;
  const performanceFlags: string[] = [];
  if (empresa.licitacoes_participadas > 0) {
    const taxaNorm = Math.min(100, (empresa.taxa_vitoria / 50) * 100);
    const volumeNorm = Math.min(100, (empresa.licitacoes_participadas / 200) * 100);
    performance = taxaNorm * 0.6 + volumeNorm * 0.4;
  }
  if (empresa.taxa_vitoria < 20) {
    performanceFlags.push("Taxa de vitória abaixo de 20%");
    redFlags.push({
      titulo: "Baixa taxa de vitória",
      descricao: `Taxa de ${empresa.taxa_vitoria}% está abaixo da média do setor (~33%).`,
      severidade: "baixa",
      categoria: "Performance",
    });
  }
  if (empresa.licitacoes_participadas < 20) {
    performanceFlags.push("Poucas licitações participadas");
  }

  // ── 3. Saúde Financeira (proxy via volume de contratos) ──
  const mediaVolume = todasEmpresas.reduce((s, e) => s + e.volume_total_contratos, 0) / todasEmpresas.length;
  let financeiro = Math.min(100, (empresa.volume_total_contratos / mediaVolume) * 70);
  const financeiroFlags: string[] = [];
  if (empresa.volume_total_contratos < mediaVolume * 0.2) {
    financeiroFlags.push("Volume muito abaixo da média do setor");
    redFlags.push({
      titulo: "Volume financeiro reduzido",
      descricao: `Volume de ${empresa.volume_total_fmt} está muito abaixo da média do setor.`,
      severidade: "baixa",
      categoria: "Financeiro",
    });
  }
  if (empresa.porte === "Grande" && empresa.volume_total_contratos > mediaVolume * 2) {
    financeiro = Math.min(100, financeiro + 15);
  }

  // ── 4. Execução de Projetos ──
  let execucao = 70; // baseline
  const execucaoFlags: string[] = [];
  const projAtrasados = projetosEmpresa.filter((p) => p.status === "Atrasado");
  const projParalisados = projetosEmpresa.filter((p) => p.status === "Paralisado");
  const projConcluidos = projetosEmpresa.filter((p) => p.status === "Concluido");

  if (projetosEmpresa.length > 0) {
    const taxaConclusao = projConcluidos.length / projetosEmpresa.length;
    execucao = taxaConclusao * 100;

    if (projAtrasados.length > 0) {
      execucao -= projAtrasados.length * 15;
      execucaoFlags.push(`${projAtrasados.length} projeto(s) atrasado(s)`);
      redFlags.push({
        titulo: "Projetos em atraso",
        descricao: `${projAtrasados.length} projeto(s) com status "Atrasado". Indica possíveis problemas operacionais.`,
        severidade: projAtrasados.length >= 2 ? "alta" : "media",
        categoria: "Execução",
      });
    }
    if (projParalisados.length > 0) {
      execucao -= projParalisados.length * 20;
      execucaoFlags.push(`${projParalisados.length} projeto(s) paralisado(s)`);
      redFlags.push({
        titulo: "Projetos paralisados",
        descricao: `${projParalisados.length} projeto(s) paralisado(s). Risco de inadimplência contratual.`,
        severidade: "alta",
        categoria: "Execução",
      });
    }

    // Bonus for active projects
    const projAtivos = projetosEmpresa.filter((p) => p.status === "Em Andamento");
    if (projAtivos.length > 0 && projAtrasados.length === 0) {
      execucao = Math.min(100, execucao + 20);
    }
  } else {
    execucaoFlags.push("Nenhum projeto vinculado");
  }
  execucao = Math.max(0, Math.min(100, execucao));

  // ── 5. Diversificação ──
  const estadosAtuacao = new Set<string>();
  projetosEmpresa.forEach((p) => estadosAtuacao.add(p.estado));
  estadosAtuacao.add(empresa.estado_sede);
  const numSegmentos = empresa.segmentos.length;
  let diversificacao = Math.min(100, estadosAtuacao.size * 15 + numSegmentos * 20);
  const diversificacaoFlags: string[] = [];
  if (estadosAtuacao.size <= 1 && numSegmentos <= 1) {
    diversificacaoFlags.push("Concentração geográfica e setorial");
    redFlags.push({
      titulo: "Baixa diversificação",
      descricao: "Opera em apenas 1 estado e 1 segmento. Alto risco de dependência regional/setorial.",
      severidade: "baixa",
      categoria: "Diversificação",
    });
  }

  // ── 6. Reputação (proxy via score base) ──
  const reputacao = empresa.nota_score;
  const reputacaoFlags: string[] = [];
  if (reputacao < 50) {
    reputacaoFlags.push("Score de confiabilidade abaixo de 50");
    redFlags.push({
      titulo: "Score de confiabilidade baixo",
      descricao: `Score ${reputacao}/100 indica problemas de reputação ou histórico negativo.`,
      severidade: "alta",
      categoria: "Reputação",
    });
  }

  // ── Montar dimensões ──
  const dimensoes: RiskDimension[] = [
    {
      nome: "Maturidade",
      valor: Math.round(maturidade),
      peso: 0.15,
      descricao: `${anosAtividade} anos de mercado`,
      status: statusFromScore(maturidade),
      redFlags: maturidadeFlags,
    },
    {
      nome: "Performance",
      valor: Math.round(performance),
      peso: 0.20,
      descricao: `${empresa.taxa_vitoria}% taxa de vitória`,
      status: statusFromScore(performance),
      redFlags: performanceFlags,
    },
    {
      nome: "Financeiro",
      valor: Math.round(financeiro),
      peso: 0.20,
      descricao: empresa.volume_total_fmt,
      status: statusFromScore(financeiro),
      redFlags: financeiroFlags,
    },
    {
      nome: "Execução",
      valor: Math.round(execucao),
      peso: 0.20,
      descricao: `${projetosEmpresa.length} projetos vinculados`,
      status: statusFromScore(execucao),
      redFlags: execucaoFlags,
    },
    {
      nome: "Diversificação",
      valor: Math.round(diversificacao),
      peso: 0.10,
      descricao: `${estadosAtuacao.size} estado(s), ${numSegmentos} segmento(s)`,
      status: statusFromScore(diversificacao),
      redFlags: diversificacaoFlags,
    },
    {
      nome: "Reputação",
      valor: Math.round(reputacao),
      peso: 0.15,
      descricao: `Score base ${reputacao}/100`,
      status: statusFromScore(reputacao),
      redFlags: reputacaoFlags,
    },
  ];

  // ── Score geral ponderado ──
  const scoreGeral = Math.round(
    dimensoes.reduce((acc, d) => acc + d.valor * d.peso, 0)
  );

  const classificacao: RiskAnalysis["classificacao"] =
    scoreGeral >= 75 ? "baixo" :
    scoreGeral >= 55 ? "moderado" :
    scoreGeral >= 35 ? "elevado" : "critico";

  // ── Resumo textual ──
  const pontosFracos = dimensoes.filter((d) => d.valor < 50).map((d) => d.nome);
  const pontosFortes = dimensoes.filter((d) => d.valor >= 80).map((d) => d.nome);
  let resumo = `${empresa.nome_fantasia} apresenta risco ${classificacao}.`;
  if (pontosFortes.length > 0) {
    resumo += ` Destaque positivo em: ${pontosFortes.join(", ")}.`;
  }
  if (pontosFracos.length > 0) {
    resumo += ` Atenção necessária em: ${pontosFracos.join(", ")}.`;
  }
  if (redFlags.length > 0) {
    resumo += ` ${redFlags.length} alerta(s) identificado(s).`;
  }

  return { scoreGeral, classificacao, dimensoes, redFlags, resumo };
}
