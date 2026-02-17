import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Brain, Building2, FileSearch, Zap, Clock,
  TrendingUp, ArrowRight, Lightbulb, Target,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";
import { useLicitacoes } from "@/hooks/useLicitacoes";

// ── Tipos de resultado ──
interface SearchResult {
  tipo: "empresa" | "licitacao" | "projeto" | "insight";
  titulo: string;
  descricao: string;
  link?: string;
  score?: number;
  destaque?: string;
  dados?: Record<string, string>;
}

// ── Sugestões pré-definidas ──
const sugestoes = [
  "Quais empresas têm maior taxa de vitória?",
  "Licitações acima de R$ 50M em SP",
  "Empresas de saneamento no Nordeste",
  "Projetos atrasados atualmente",
  "Quem mais vence licitações de infraestrutura?",
  "Empresas com score acima de 90",
  "Licitações de esgotamento sanitário",
  "Projetos em andamento no PR",
];

const historico = [
  "empresas saneamento SP",
  "licitações acima 10M",
  "projetos atrasados",
];

// ── Motor de busca inteligente ──
function buscar(query: string, licitacoes: Array<{ titulo: string; orgao: string; estado: string; categoria: string; valor_estimado: number; valor_estimado_fmt: string; data_abertura: string; link: string }>): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  // ── Padrões de consulta natural ──

  // "maior taxa de vitória" / "quem mais vence"
  if (q.includes("taxa") || q.includes("vitória") || q.includes("mais vence")) {
    const sorted = [...empresas].sort((a, b) => b.taxa_vitoria - a.taxa_vitoria);
    sorted.slice(0, 5).forEach((emp) => {
      results.push({
        tipo: "empresa",
        titulo: emp.nome_fantasia,
        descricao: `Taxa de vitória: ${emp.taxa_vitoria}% (${emp.licitacoes_vencidas}/${emp.licitacoes_participadas})`,
        link: `/empresas/${emp.id}`,
        score: emp.nota_score,
        destaque: `${emp.taxa_vitoria}% de vitória`,
        dados: { Porte: emp.porte, Sede: `${emp.cidade_sede}/${emp.estado_sede}`, Volume: emp.volume_total_fmt },
      });
    });
    results.unshift({
      tipo: "insight",
      titulo: "Ranking de Taxa de Vitória",
      descricao: `As top 5 empresas possuem taxa média de ${(sorted.slice(0, 5).reduce((s, e) => s + e.taxa_vitoria, 0) / 5).toFixed(1)}%. A líder é ${sorted[0].nome_fantasia} com ${sorted[0].taxa_vitoria}%.`,
      destaque: "Análise IA",
    });
    return results;
  }

  // "score acima de X"
  const scoreMatch = q.match(/score\s*(?:acima|maior|>)\s*(?:de|que)?\s*(\d+)/);
  if (scoreMatch) {
    const minScore = parseInt(scoreMatch[1]);
    const filtered = empresas.filter((e) => e.nota_score >= minScore);
    filtered.forEach((emp) => {
      results.push({
        tipo: "empresa",
        titulo: emp.nome_fantasia,
        descricao: `Score ${emp.nota_score}/100 — ${emp.segmentos.join(", ")}`,
        link: `/empresas/${emp.id}`,
        score: emp.nota_score,
        dados: { Porte: emp.porte, Sede: `${emp.cidade_sede}/${emp.estado_sede}` },
      });
    });
    results.unshift({
      tipo: "insight",
      titulo: `${filtered.length} empresas com score acima de ${minScore}`,
      descricao: `Empresas com score acima de ${minScore} representam ${((filtered.length / empresas.length) * 100).toFixed(0)}% do total cadastrado.`,
      destaque: "Análise IA",
    });
    return results;
  }

  // "licitações acima de X" / "licitações > XM"
  const valorMatch = q.match(/(?:licitaç|acima|maior|valor)\S*\s*(?:de|que)?\s*(?:r\$\s*)?(\d+)\s*m/i);
  if (valorMatch) {
    const minValor = parseFloat(valorMatch[1]) * 1e6;
    const filtered = licitacoes.filter((l) => (l.valor_estimado || 0) >= minValor);
    filtered.slice(0, 8).forEach((lic) => {
      results.push({
        tipo: "licitacao",
        titulo: lic.titulo.slice(0, 80),
        descricao: `${lic.orgao} — ${lic.estado}`,
        link: lic.link,
        destaque: lic.valor_estimado_fmt,
        dados: { Categoria: lic.categoria, Data: lic.data_abertura },
      });
    });
    results.unshift({
      tipo: "insight",
      titulo: `${filtered.length} licitações acima de R$ ${valorMatch[1]}M`,
      descricao: `Volume total: R$ ${(filtered.reduce((s, l) => s + (l.valor_estimado || 0), 0) / 1e6).toFixed(0)}M em ${new Set(filtered.map((l) => l.estado)).size} estados.`,
      destaque: "Análise IA",
    });
    return results;
  }

  // "projetos atrasados" / "projetos paralisados"
  if (q.includes("atrasado") || q.includes("paralisado")) {
    const status = q.includes("paralisado") ? "Paralisado" : "Atrasado";
    const filtered = projetos.filter((p) => p.status === status || (q.includes("atrasado") && p.status === "Atrasado"));
    if (filtered.length === 0) {
      results.push({
        tipo: "insight",
        titulo: "Nenhum projeto atrasado ou paralisado",
        descricao: "Todos os projetos cadastrados estão em dia. Boa gestão operacional do portfólio.",
        destaque: "Status OK",
      });
    } else {
      filtered.forEach((proj) => {
        results.push({
          tipo: "projeto",
          titulo: proj.titulo,
          descricao: `${proj.empresa_responsavel_nome} — ${proj.cidade}/${proj.estado}`,
          link: `/projetos/${proj.id}`,
          destaque: `${proj.percentual_execucao}% concluído`,
          dados: { Status: proj.status, Valor: proj.valor_contrato_fmt },
        });
      });
    }
    // Also find projects in "Em Andamento" with low progress
    const lowProgress = projetos.filter((p) => p.status === "Em Andamento" && p.percentual_execucao < 15);
    if (lowProgress.length > 0) {
      results.push({
        tipo: "insight",
        titulo: `${lowProgress.length} projetos em andamento com baixa execução (<15%)`,
        descricao: `Projetos que podem estar em risco de atraso: ${lowProgress.map((p) => p.empresa_responsavel_nome).join(", ")}.`,
        destaque: "Atenção",
      });
    }
    return results;
  }

  // "projetos em andamento em [UF]"
  const projetoUfMatch = q.match(/(?:projetos?)\s*(?:em\s+andamento|ativos?)\s*(?:em|no|na)?\s*([A-Z]{2}|\w+)/i);
  if (projetoUfMatch) {
    const uf = projetoUfMatch[1].toUpperCase();
    const filtered = projetos.filter((p) => p.status === "Em Andamento" && p.estado === uf);
    filtered.forEach((proj) => {
      results.push({
        tipo: "projeto",
        titulo: proj.titulo,
        descricao: `${proj.empresa_responsavel_nome} — ${proj.valor_contrato_fmt}`,
        link: `/projetos/${proj.id}`,
        destaque: `${proj.percentual_execucao}%`,
      });
    });
    if (results.length > 0) {
      results.unshift({
        tipo: "insight",
        titulo: `${filtered.length} projetos em andamento no ${uf}`,
        descricao: `Volume: R$ ${(filtered.reduce((s, p) => s + p.valor_contrato, 0) / 1e6).toFixed(1)}M envolvendo ${new Set(filtered.map((p) => p.empresa_responsavel_nome)).size} empresa(s).`,
        destaque: "Análise IA",
      });
    }
    return results;
  }

  // ── Busca genérica por palavra-chave ──
  const palavras = q.split(/\s+/).filter((p) => p.length > 2);

  // Buscar em empresas
  empresas.forEach((emp) => {
    const texto = `${emp.nome_fantasia} ${emp.razao_social} ${emp.segmentos.join(" ")} ${emp.especialidades.join(" ")} ${emp.estado_sede} ${emp.cidade_sede}`.toLowerCase();
    const match = palavras.some((p) => texto.includes(p));
    if (match) {
      results.push({
        tipo: "empresa",
        titulo: emp.nome_fantasia,
        descricao: `${emp.segmentos.join(", ")} — ${emp.cidade_sede}/${emp.estado_sede}`,
        link: `/empresas/${emp.id}`,
        score: emp.nota_score,
        dados: { Score: `${emp.nota_score}`, "Taxa Vitória": `${emp.taxa_vitoria}%`, Volume: emp.volume_total_fmt },
      });
    }
  });

  // Buscar em licitações
  licitacoes.forEach((lic) => {
    const texto = `${lic.titulo} ${lic.orgao} ${lic.categoria} ${lic.estado}`.toLowerCase();
    const match = palavras.some((p) => texto.includes(p));
    if (match) {
      results.push({
        tipo: "licitacao",
        titulo: lic.titulo.slice(0, 80),
        descricao: `${lic.orgao} — ${lic.estado}`,
        link: lic.link,
        destaque: lic.valor_estimado_fmt,
      });
    }
  });

  // Buscar em projetos
  projetos.forEach((proj) => {
    const texto = `${proj.titulo} ${proj.descricao} ${proj.categoria} ${proj.cidade} ${proj.estado} ${proj.empresa_responsavel_nome}`.toLowerCase();
    const match = palavras.some((p) => texto.includes(p));
    if (match) {
      results.push({
        tipo: "projeto",
        titulo: proj.titulo,
        descricao: `${proj.empresa_responsavel_nome} — ${proj.cidade}/${proj.estado}`,
        link: `/projetos/${proj.id}`,
        destaque: proj.valor_contrato_fmt,
      });
    }
  });

  // Insight se tem resultados
  if (results.length > 0) {
    const empCount = results.filter((r) => r.tipo === "empresa").length;
    const licCount = results.filter((r) => r.tipo === "licitacao").length;
    const projCount = results.filter((r) => r.tipo === "projeto").length;
    results.unshift({
      tipo: "insight",
      titulo: `${results.length} resultados para "${query}"`,
      descricao: `${empCount} empresa(s), ${licCount} licitação(ões), ${projCount} projeto(s) encontrados.`,
      destaque: "Resumo IA",
    });
  }

  return results.slice(0, 20);
}

// ── Ícones por tipo ──
const tipoConfig = {
  empresa: { icon: Building2, cor: "text-blue-500", bg: "bg-blue-50", label: "Empresa" },
  licitacao: { icon: FileSearch, cor: "text-emerald-500", bg: "bg-emerald-50", label: "Licitação" },
  projeto: { icon: Target, cor: "text-amber-500", bg: "bg-amber-50", label: "Projeto" },
  insight: { icon: Brain, cor: "text-violet-500", bg: "bg-violet-50", label: "Insight IA" },
};

const BuscaInteligente = () => {
  const navigate = useNavigate();
  const { dados: licitacoes } = useLicitacoes();
  const [query, setQuery] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");

  const resultados = useMemo(() => buscar(buscaAtiva, licitacoes), [buscaAtiva, licitacoes]);

  const executarBusca = useCallback((q?: string) => {
    const searchQuery = q || query;
    if (searchQuery.trim()) {
      setBuscaAtiva(searchQuery.trim());
      if (q) setQuery(q);
    }
  }, [query]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Brain size={28} className="text-violet-500" />
          Busca Inteligente
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pesquise com linguagem natural — a IA interpreta sua pergunta e cruza dados
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Ex: 'Quais empresas têm maior taxa de vitória?' ou 'Licitações acima de R$ 50M em SP'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executarBusca()}
                className="pl-10 text-sm h-11"
              />
            </div>
            <Button onClick={() => executarBusca()} disabled={!query.trim()} className="gap-1.5 h-11">
              <Zap size={16} />
              Buscar
            </Button>
          </div>

          {/* Sugestões */}
          {!buscaAtiva && (
            <div className="px-4 pb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Lightbulb size={12} />
                Sugestões de busca:
              </p>
              <div className="flex flex-wrap gap-2">
                {sugestoes.map((s) => (
                  <button
                    key={s}
                    onClick={() => executarBusca(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {buscaAtiva && (
        <div className="space-y-3">
          {resultados.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Search size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm mt-1">Tente reformular sua pergunta ou use termos mais específicos.</p>
              </CardContent>
            </Card>
          ) : (
            resultados.map((r, i) => {
              const config = tipoConfig[r.tipo];
              return (
                <Card
                  key={i}
                  className={`border-0 shadow-sm hover:shadow-md transition-all ${r.link ? "cursor-pointer" : ""} ${r.tipo === "insight" ? "bg-gradient-to-r from-violet-50 to-blue-50 border-l-4 border-l-violet-400" : ""}`}
                  onClick={() => {
                    if (r.link) {
                      if (r.link.startsWith("http")) {
                        window.open(r.link, "_blank");
                      } else {
                        navigate(r.link);
                      }
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                        <config.icon size={16} className={config.cor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded ${config.bg} ${config.cor}`}>
                            {config.label}
                          </span>
                          {r.score && (
                            <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              Score: {r.score}
                            </span>
                          )}
                          {r.destaque && (
                            <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {r.destaque}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold leading-snug">{r.titulo}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.descricao}</p>
                        {r.dados && (
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                            {Object.entries(r.dados).map(([key, val]) => (
                              <span key={key} className="text-[0.65rem] text-muted-foreground">
                                <span className="font-semibold">{key}:</span> {val}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {r.link && (
                        <ArrowRight size={16} className="text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Histórico e Dicas */}
      {!buscaAtiva && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                Buscas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {historico.map((h) => (
                <button
                  key={h}
                  onClick={() => executarBusca(h)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left p-2 rounded-lg hover:bg-muted/50"
                >
                  <Clock size={12} />
                  {h}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Brain size={16} className="text-violet-500" />
                O que posso perguntar?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-start gap-2">
                <Building2 size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Empresas:</strong> "empresas de saneamento no Nordeste", "score acima de 80"</span>
              </p>
              <p className="flex items-start gap-2">
                <FileSearch size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span><strong>Licitações:</strong> "licitações acima de R$ 50M", "esgotamento sanitário SP"</span>
              </p>
              <p className="flex items-start gap-2">
                <Target size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span><strong>Projetos:</strong> "projetos atrasados", "em andamento no PR"</span>
              </p>
              <p className="flex items-start gap-2">
                <TrendingUp size={13} className="text-violet-500 mt-0.5 flex-shrink-0" />
                <span><strong>Rankings:</strong> "maior taxa de vitória", "quem mais vence"</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BuscaInteligente;
