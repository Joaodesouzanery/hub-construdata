import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Brain, Building2, FileSearch, Zap, Clock,
  TrendingUp, ArrowRight, Lightbulb, Target, X, Shield,
  BarChart3, MapPin, Filter, Loader2,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";
import { useLicitacoes } from "@/hooks/useLicitacoes";

// ── Tipos ──
interface SearchResult {
  tipo: "empresa" | "licitacao" | "projeto" | "insight";
  titulo: string;
  descricao: string;
  link?: string;
  score?: number;
  destaque?: string;
  dados?: Record<string, string>;
  relevancia?: number;
}

// ── Sugestões ──
const sugestoes = [
  { texto: "Quais empresas têm maior taxa de vitória?", categoria: "Ranking" },
  { texto: "Licitações acima de R$ 50M em SP", categoria: "Licitação" },
  { texto: "Empresas de saneamento no Nordeste", categoria: "Empresa" },
  { texto: "Projetos atrasados atualmente", categoria: "Projeto" },
  { texto: "Empresas com score acima de 90", categoria: "Score" },
  { texto: "Comparar empresas SP vs RJ", categoria: "Análise" },
  { texto: "Top 5 maiores contratos", categoria: "Ranking" },
  { texto: "Empresas fundadas após 2015", categoria: "Empresa" },
];

const categoriaCor: Record<string, string> = {
  Ranking: "bg-amber-50 text-amber-700",
  Licitação: "bg-emerald-50 text-emerald-700",
  Empresa: "bg-blue-50 text-blue-700",
  Projeto: "bg-orange-50 text-orange-700",
  Score: "bg-violet-50 text-violet-700",
  Análise: "bg-pink-50 text-pink-700",
};

// ── Motor de busca inteligente ──
type LicitacaoData = { titulo: string; orgao: string; estado: string; categoria: string; valor_estimado: number; valor_estimado_fmt: string; data_abertura: string; link: string };

function buscar(query: string, licitacoes: LicitacaoData[]): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  // ── "maior taxa de vitória" / "quem mais vence" ──
  if (q.includes("taxa") || q.includes("vitória") || q.includes("vitoria") || q.includes("mais vence")) {
    const sorted = [...empresas].sort((a, b) => b.taxa_vitoria - a.taxa_vitoria);
    sorted.slice(0, 5).forEach((emp, i) => {
      results.push({
        tipo: "empresa",
        titulo: emp.nome_fantasia,
        descricao: `Taxa de vitória: ${emp.taxa_vitoria}% (${emp.licitacoes_vencidas}/${emp.licitacoes_participadas})`,
        link: `/empresas/${emp.id}`,
        score: emp.nota_score,
        destaque: `${emp.taxa_vitoria}% vitória`,
        dados: { Porte: emp.porte, Sede: `${emp.cidade_sede}/${emp.estado_sede}`, Volume: emp.volume_total_fmt },
        relevancia: 100 - i,
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

  // ── "score acima de X" ──
  const scoreMatch = q.match(/score\s*(?:acima|maior|>|>=)\s*(?:de|que)?\s*(\d+)/);
  if (scoreMatch) {
    const minScore = parseInt(scoreMatch[1]);
    const filtered = empresas.filter((e) => e.nota_score >= minScore).sort((a, b) => b.nota_score - a.nota_score);
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
      descricao: `Representam ${((filtered.length / empresas.length) * 100).toFixed(0)}% do total. Score médio do grupo: ${filtered.length > 0 ? (filtered.reduce((s, e) => s + e.nota_score, 0) / filtered.length).toFixed(0) : 0}.`,
      destaque: "Análise IA",
    });
    return results;
  }

  // ── "licitações acima de XM" ──
  const valorMatch = q.match(/(?:licitaç|acima|maior|valor)\S*\s*(?:de|que)?\s*(?:r\$\s*)?(\d+)\s*m/i);
  if (valorMatch) {
    const minValor = parseFloat(valorMatch[1]) * 1e6;
    const filtered = licitacoes.filter((l) => (l.valor_estimado || 0) >= minValor);
    // Check for state filter
    const ufMatch = q.match(/\b([A-Z]{2})\b/) || q.match(/\bem\s+(\w{2})\b/i);
    const uf = ufMatch ? ufMatch[1].toUpperCase() : null;
    const finalFiltered = uf ? filtered.filter((l) => l.estado === uf) : filtered;

    finalFiltered.slice(0, 10).forEach((lic) => {
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
      titulo: `${finalFiltered.length} licitações acima de R$ ${valorMatch[1]}M${uf ? ` em ${uf}` : ""}`,
      descricao: `Volume total: R$ ${(finalFiltered.reduce((s, l) => s + (l.valor_estimado || 0), 0) / 1e6).toFixed(0)}M em ${new Set(finalFiltered.map((l) => l.estado)).size} estado(s).`,
      destaque: "Análise IA",
    });
    return results;
  }

  // ── "top X maiores contratos" ──
  const topMatch = q.match(/top\s*(\d+)?\s*(?:maior|grande|maior|caro)/i);
  if (topMatch) {
    const n = parseInt(topMatch[1] || "5");
    const sorted = [...projetos].sort((a, b) => b.valor_contrato - a.valor_contrato);
    sorted.slice(0, n).forEach((proj) => {
      results.push({
        tipo: "projeto",
        titulo: proj.titulo,
        descricao: `${proj.empresa_responsavel_nome} — ${proj.cidade}/${proj.estado}`,
        link: `/projetos/${proj.id}`,
        destaque: proj.valor_contrato_fmt,
        dados: { Status: proj.status, Execução: `${proj.percentual_execucao}%` },
      });
    });
    results.unshift({
      tipo: "insight",
      titulo: `Top ${n} maiores contratos`,
      descricao: `Volume total: R$ ${(sorted.slice(0, n).reduce((s, p) => s + p.valor_contrato, 0) / 1e6).toFixed(0)}M. Maior: ${sorted[0].valor_contrato_fmt}.`,
      destaque: "Análise IA",
    });
    return results;
  }

  // ── "comparar empresas" / "SP vs RJ" ──
  const compareMatch = q.match(/(?:compar|vs|versus)\S*\s*.*(sp|rj|mg|pr|ba|pe|sc|ce|go|rs|pa|am|ma|mt|ms|to|ro|se|al|rn|pb|pi|ac|ap|rr|df)/i);
  if (compareMatch) {
    const states = q.match(/\b([a-z]{2})\b/gi)?.map((s) => s.toUpperCase()).filter((s) => empresas.some((e) => e.estado_sede === s)) || [];
    if (states.length >= 2) {
      states.forEach((uf) => {
        const emps = empresas.filter((e) => e.estado_sede === uf);
        const avg = emps.length > 0 ? (emps.reduce((s, e) => s + e.nota_score, 0) / emps.length).toFixed(0) : "0";
        const vol = emps.reduce((s, e) => s + e.volume_total_contratos, 0);
        results.push({
          tipo: "insight",
          titulo: `Empresas em ${uf}: ${emps.length}`,
          descricao: `Score médio: ${avg}. Volume total: R$ ${(vol / 1e9).toFixed(2)}B. Taxa vitória média: ${emps.length > 0 ? (emps.reduce((s, e) => s + e.taxa_vitoria, 0) / emps.length).toFixed(1) : 0}%.`,
          destaque: uf,
          dados: { "N° empresas": `${emps.length}`, "Score médio": avg },
        });
      });
    }
    return results;
  }

  // ── "empresas fundadas após XXXX" / "empresas novas" ──
  const fundadaMatch = q.match(/(?:fundad|criada|nova|recente)\S*\s*(?:após|depois|desde|em|a partir)?\s*(\d{4})?/i);
  if (fundadaMatch && (q.includes("fundad") || q.includes("nova") || q.includes("recente") || q.includes("criada"))) {
    const ano = fundadaMatch[1] ? parseInt(fundadaMatch[1]) : new Date().getFullYear() - 10;
    const filtered = empresas.filter((e) => e.ano_fundacao >= ano).sort((a, b) => b.ano_fundacao - a.ano_fundacao);
    filtered.forEach((emp) => {
      results.push({
        tipo: "empresa",
        titulo: emp.nome_fantasia,
        descricao: `Fundada em ${emp.ano_fundacao} — ${emp.segmentos.join(", ")}`,
        link: `/empresas/${emp.id}`,
        score: emp.nota_score,
        dados: { Porte: emp.porte, "Ano fundação": `${emp.ano_fundacao}`, Volume: emp.volume_total_fmt },
      });
    });
    results.unshift({
      tipo: "insight",
      titulo: `${filtered.length} empresa(s) fundada(s) a partir de ${ano}`,
      descricao: `Volume médio: R$ ${filtered.length > 0 ? (filtered.reduce((s, e) => s + e.volume_total_contratos, 0) / filtered.length / 1e6).toFixed(0) : 0}M. Score médio: ${filtered.length > 0 ? (filtered.reduce((s, e) => s + e.nota_score, 0) / filtered.length).toFixed(0) : 0}.`,
      destaque: "Análise IA",
    });
    return results;
  }

  // ── "projetos atrasados" / "projetos paralisados" ──
  if (q.includes("atrasado") || q.includes("paralisado")) {
    const filtered = projetos.filter((p) =>
      (q.includes("paralisado") && p.status === "Paralisado") ||
      (q.includes("atrasado") && p.status === "Atrasado") ||
      p.status === "Atrasado"
    );
    if (filtered.length === 0) {
      results.push({
        tipo: "insight",
        titulo: "Nenhum projeto atrasado ou paralisado",
        descricao: "Todos os projetos cadastrados estão em dia. Boa gestão operacional.",
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
    const lowProgress = projetos.filter((p) => p.status === "Em Andamento" && p.percentual_execucao < 15);
    if (lowProgress.length > 0) {
      results.push({
        tipo: "insight",
        titulo: `${lowProgress.length} projetos em risco de atraso (<15% execução)`,
        descricao: `Projetos: ${lowProgress.map((p) => p.empresa_responsavel_nome).join(", ")}.`,
        destaque: "Atenção",
      });
    }
    return results;
  }

  // ── "projetos em andamento em [UF]" ──
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
        descricao: `Volume: R$ ${(filtered.reduce((s, p) => s + p.valor_contrato, 0) / 1e6).toFixed(1)}M.`,
        destaque: "Análise IA",
      });
    }
    return results;
  }

  // ── "empresas [segmento] no/em [região]" ──
  const regionLabels: Record<string, string[]> = {
    nordeste: ["BA", "PE", "CE", "MA", "RN", "PB", "SE", "AL", "PI"],
    sudeste: ["SP", "RJ", "MG", "ES"],
    sul: ["PR", "SC", "RS"],
    norte: ["AM", "PA", "RO", "AC", "AP", "RR", "TO"],
    "centro-oeste": ["GO", "MT", "MS", "DF"],
  };
  for (const [regiao, ufs] of Object.entries(regionLabels)) {
    if (q.includes(regiao)) {
      const filtered = empresas.filter((e) => ufs.includes(e.estado_sede));
      // Also filter by segment if present
      const segKeywords = ["saneamento", "infraestrutura", "construção", "construcao", "pavimentação", "pavimentacao"];
      const segFilter = segKeywords.find((s) => q.includes(s));
      const finalFiltered = segFilter
        ? filtered.filter((e) => e.segmentos.some((s) => s.toLowerCase().includes(segFilter)))
        : filtered;

      finalFiltered.forEach((emp) => {
        results.push({
          tipo: "empresa",
          titulo: emp.nome_fantasia,
          descricao: `${emp.segmentos.join(", ")} — ${emp.cidade_sede}/${emp.estado_sede}`,
          link: `/empresas/${emp.id}`,
          score: emp.nota_score,
          dados: { Score: `${emp.nota_score}`, "Taxa Vitória": `${emp.taxa_vitoria}%`, Volume: emp.volume_total_fmt },
        });
      });
      if (results.length > 0) {
        results.unshift({
          tipo: "insight",
          titulo: `${finalFiltered.length} empresa(s) no ${regiao.charAt(0).toUpperCase() + regiao.slice(1)}${segFilter ? ` (${segFilter})` : ""}`,
          descricao: `Score médio: ${(finalFiltered.reduce((s, e) => s + e.nota_score, 0) / (finalFiltered.length || 1)).toFixed(0)}. Volume total: R$ ${(finalFiltered.reduce((s, e) => s + e.volume_total_contratos, 0) / 1e9).toFixed(2)}B.`,
          destaque: "Análise IA",
        });
      }
      return results;
    }
  }

  // ── "CNPJ XX.XXX.XXX/XXXX-XX" ──
  const cnpjMatch = q.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
  if (cnpjMatch) {
    const cnpj = cnpjMatch[0];
    const emp = empresas.find((e) => e.cnpj.replace(/\D/g, "").includes(cnpj.replace(/\D/g, "")));
    if (emp) {
      results.push({
        tipo: "empresa",
        titulo: emp.nome_fantasia,
        descricao: `CNPJ: ${emp.cnpj} — ${emp.razao_social}`,
        link: `/empresas/${emp.id}`,
        score: emp.nota_score,
        dados: { Porte: emp.porte, Status: emp.status, Volume: emp.volume_total_fmt },
      });
      results.unshift({
        tipo: "insight",
        titulo: `Empresa encontrada: ${emp.nome_fantasia}`,
        descricao: `Score ${emp.nota_score}/100. ${emp.segmentos.join(", ")}. Fundada em ${emp.ano_fundacao}.`,
        destaque: "CNPJ Localizado",
      });
    }
    return results;
  }

  // ── Busca genérica por palavra-chave ──
  const palavras = q.split(/\s+/).filter((p) => p.length > 2);

  empresas.forEach((emp) => {
    const texto = `${emp.nome_fantasia} ${emp.razao_social} ${emp.segmentos.join(" ")} ${emp.especialidades.join(" ")} ${emp.estado_sede} ${emp.cidade_sede} ${emp.porte}`.toLowerCase();
    const matchCount = palavras.filter((p) => texto.includes(p)).length;
    if (matchCount > 0) {
      results.push({
        tipo: "empresa",
        titulo: emp.nome_fantasia,
        descricao: `${emp.segmentos.join(", ")} — ${emp.cidade_sede}/${emp.estado_sede}`,
        link: `/empresas/${emp.id}`,
        score: emp.nota_score,
        dados: { Score: `${emp.nota_score}`, "Taxa Vitória": `${emp.taxa_vitoria}%`, Volume: emp.volume_total_fmt },
        relevancia: matchCount,
      });
    }
  });

  licitacoes.forEach((lic) => {
    const texto = `${lic.titulo} ${lic.orgao} ${lic.categoria} ${lic.estado}`.toLowerCase();
    const matchCount = palavras.filter((p) => texto.includes(p)).length;
    if (matchCount > 0) {
      results.push({
        tipo: "licitacao",
        titulo: lic.titulo.slice(0, 80),
        descricao: `${lic.orgao} — ${lic.estado}`,
        link: lic.link,
        destaque: lic.valor_estimado_fmt,
        relevancia: matchCount,
      });
    }
  });

  projetos.forEach((proj) => {
    const texto = `${proj.titulo} ${proj.descricao} ${proj.categoria} ${proj.cidade} ${proj.estado} ${proj.empresa_responsavel_nome}`.toLowerCase();
    const matchCount = palavras.filter((p) => texto.includes(p)).length;
    if (matchCount > 0) {
      results.push({
        tipo: "projeto",
        titulo: proj.titulo,
        descricao: `${proj.empresa_responsavel_nome} — ${proj.cidade}/${proj.estado}`,
        link: `/projetos/${proj.id}`,
        destaque: proj.valor_contrato_fmt,
        relevancia: matchCount,
      });
    }
  });

  // Sort by relevância
  results.sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0));

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

  return results.slice(0, 25);
}

// ── Ícones por tipo ──
const tipoConfig = {
  empresa: { icon: Building2, cor: "text-blue-500", bg: "bg-blue-50", border: "border-l-blue-400", label: "Empresa" },
  licitacao: { icon: FileSearch, cor: "text-emerald-500", bg: "bg-emerald-50", border: "border-l-emerald-400", label: "Licitação" },
  projeto: { icon: Target, cor: "text-amber-500", bg: "bg-amber-50", border: "border-l-amber-400", label: "Projeto" },
  insight: { icon: Brain, cor: "text-violet-500", bg: "bg-violet-50", border: "border-l-violet-400", label: "Insight IA" },
};

const BuscaInteligente = () => {
  const navigate = useNavigate();
  const { dados: licitacoes } = useLicitacoes();
  const [query, setQuery] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [historico, setHistorico] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hub_busca_historico") || "[]");
    } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search
  const debouncedSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setBuscaAtiva(""); setIsSearching(false); return; }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      setBuscaAtiva(q.trim());
      setIsSearching(false);
    }, 400);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const resultados = useMemo(() => buscar(buscaAtiva, licitacoes), [buscaAtiva, licitacoes]);

  const resultadosFiltrados = useMemo(() => {
    if (filtroTipo === "todos") return resultados;
    return resultados.filter((r) => r.tipo === filtroTipo || r.tipo === "insight");
  }, [resultados, filtroTipo]);

  const executarBusca = useCallback((q?: string) => {
    const searchQuery = (q || query).trim();
    if (!searchQuery) return;
    setBuscaAtiva(searchQuery);
    setIsSearching(false);
    if (q) setQuery(q);
    // Save to history
    setHistorico((prev) => {
      const updated = [searchQuery, ...prev.filter((h) => h !== searchQuery)].slice(0, 10);
      localStorage.setItem("hub_busca_historico", JSON.stringify(updated));
      return updated;
    });
  }, [query]);

  const limparBusca = useCallback(() => {
    setQuery("");
    setBuscaAtiva("");
    setFiltroTipo("todos");
    inputRef.current?.focus();
  }, []);

  // Count by type
  const contagem = useMemo(() => {
    const c = { empresa: 0, licitacao: 0, projeto: 0, insight: 0 };
    resultados.forEach((r) => { c[r.tipo]++; });
    return c;
  }, [resultados]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Brain size={28} className="text-violet-500" />
            Busca Inteligente
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pesquise com linguagem natural — a IA interpreta sua pergunta e cruza dados automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield size={14} className="text-emerald-500" />
          <span>Dados públicos · LGPD</span>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-md overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ex: 'Quais empresas têm maior taxa de vitória?' ou 'CNPJ 12.345.678/0001-90'"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && executarBusca()}
                className="pl-11 pr-10 text-sm h-12 rounded-xl border-2 focus:border-violet-400 transition-colors"
              />
              {query && (
                <button
                  onClick={limparBusca}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button
              onClick={() => executarBusca()}
              disabled={!query.trim()}
              className="gap-1.5 h-12 px-6 rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Buscar
            </Button>
          </div>

          {/* Sugestões */}
          {!buscaAtiva && (
            <div className="px-4 pb-4 border-t border-dashed">
              <p className="text-xs font-semibold text-muted-foreground mb-2.5 mt-3 flex items-center gap-1.5">
                <Lightbulb size={13} className="text-amber-500" />
                Sugestões de busca:
              </p>
              <div className="flex flex-wrap gap-2">
                {sugestoes.map((s) => (
                  <button
                    key={s.texto}
                    onClick={() => executarBusca(s.texto)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:shadow-sm hover:scale-105 ${categoriaCor[s.categoria] || "bg-muted text-foreground"}`}
                  >
                    {s.texto}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros de tipo (quando há resultados) */}
      {buscaAtiva && resultados.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-muted-foreground" />
          {[
            { key: "todos", label: "Todos", count: resultados.length },
            { key: "empresa", label: "Empresas", count: contagem.empresa },
            { key: "licitacao", label: "Licitações", count: contagem.licitacao },
            { key: "projeto", label: "Projetos", count: contagem.projeto },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltroTipo(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                filtroTipo === f.key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      )}

      {/* Resultados */}
      {buscaAtiva && (
        <div className="space-y-3">
          {resultadosFiltrados.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-10 text-center text-muted-foreground">
                <Search size={44} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-lg">Nenhum resultado encontrado</p>
                <p className="text-sm mt-1.5">Tente reformular sua pergunta ou use termos mais específicos.</p>
                <p className="text-xs mt-3 text-muted-foreground/60">
                  Dica: tente "empresas de saneamento", "licitações acima de 10M" ou "projetos atrasados"
                </p>
              </CardContent>
            </Card>
          ) : (
            resultadosFiltrados.map((r, i) => {
              const config = tipoConfig[r.tipo];
              return (
                <Card
                  key={i}
                  className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 ${r.link ? "cursor-pointer" : ""} ${
                    r.tipo === "insight"
                      ? "bg-gradient-to-r from-violet-50/80 to-blue-50/80 border-l-4 border-l-violet-400"
                      : `border-l-4 ${config.border} hover:translate-x-0.5`
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                  onClick={() => {
                    if (r.link) {
                      if (r.link.startsWith("http")) {
                        window.open(r.link, "_blank", "noopener,noreferrer");
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
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded ${config.bg} ${config.cor}`}>
                            {config.label}
                          </span>
                          {r.score !== undefined && r.score > 0 && (
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
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.descricao}</p>
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
                        <ArrowRight size={16} className="text-muted-foreground/40 flex-shrink-0 mt-1" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Histórico */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                Buscas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {historico.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">Nenhuma busca realizada ainda</p>
              ) : (
                historico.slice(0, 8).map((h) => (
                  <button
                    key={h}
                    onClick={() => executarBusca(h)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Clock size={11} className="flex-shrink-0 opacity-50" />
                    <span className="truncate">{h}</span>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* O que posso perguntar */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Brain size={16} className="text-violet-500" />
                O que posso perguntar?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              {[
                { icon: Building2, cor: "text-blue-500", titulo: "Empresas", ex: '"empresas de saneamento no Nordeste", "CNPJ 12.345..."' },
                { icon: FileSearch, cor: "text-emerald-500", titulo: "Licitações", ex: '"licitações acima de R$ 50M em SP"' },
                { icon: Target, cor: "text-amber-500", titulo: "Projetos", ex: '"projetos atrasados", "top 5 maiores contratos"' },
                { icon: TrendingUp, cor: "text-violet-500", titulo: "Análises", ex: '"comparar SP vs RJ", "empresas fundadas após 2015"' },
              ].map((item) => (
                <p key={item.titulo} className="flex items-start gap-2">
                  <item.icon size={13} className={`${item.cor} mt-0.5 flex-shrink-0`} />
                  <span><strong>{item.titulo}:</strong> {item.ex}</span>
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Stats rápidos */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-500" />
                Base de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Empresas cadastradas", valor: empresas.length, icon: Building2 },
                { label: "Projetos monitorados", valor: projetos.length, icon: Target },
                { label: "Licitações indexadas", valor: licitacoes.length, icon: FileSearch },
                { label: "Estados cobertos", valor: new Set(empresas.map((e) => e.estado_sede)).size, icon: MapPin },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <s.icon size={12} />
                    {s.label}
                  </span>
                  <span className="font-bold">{s.valor}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BuscaInteligente;
