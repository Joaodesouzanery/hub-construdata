import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  BarChart3,
  FileSearch,
  DollarSign,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { dadosEmbutidosLicitacoes } from "@/data/licitacoes";
import type { Licitacao } from "@/types/database";
import {
  exportarLicitacoesPDF,
  exportarLicitacoesXLSX,
  exportarRelatorioPDF,
  exportarComparativoXLSX,
} from "@/lib/exportar";

type FormatoExport = "pdf" | "xlsx";
type TipoRelatorio = "licitacoes" | "mercado" | "comparativo";

function formatarValor(valor: number): string {
  if (valor >= 1e9) return `R$ ${(valor / 1e9).toFixed(1)}B`;
  if (valor >= 1e6) return `R$ ${(valor / 1e6).toFixed(1)}M`;
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

const Relatorios = () => {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(dadosEmbutidosLicitacoes);
  const [exportando, setExportando] = useState<string | null>(null);

  // Filtros
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");

  useEffect(() => {
    fetch("./licitacoes.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setLicitacoes(data);
      })
      .catch(() => {});
  }, []);

  const estados = useMemo(
    () => [...new Set(licitacoes.map((l) => l.estado))].sort(),
    [licitacoes]
  );
  const categorias = useMemo(
    () => [...new Set(licitacoes.map((l) => l.categoria))].sort(),
    [licitacoes]
  );

  const licitacoesFiltradas = useMemo(() => {
    return licitacoes.filter((l) => {
      if (estadoFiltro !== "todos" && l.estado !== estadoFiltro) return false;
      if (categoriaFiltro !== "todos" && l.categoria !== categoriaFiltro) return false;
      return true;
    });
  }, [licitacoes, estadoFiltro, categoriaFiltro]);

  const metricas = useMemo(() => {
    const total = licitacoesFiltradas.length;
    const volume = licitacoesFiltradas.reduce((s, l) => s + (l.valor_estimado || 0), 0);
    const media = total > 0 ? volume / total : 0;
    return { total, volume, media };
  }, [licitacoesFiltradas]);

  // ── Export handlers ──
  const handleExport = async (tipo: TipoRelatorio, formato: FormatoExport) => {
    const key = `${tipo}-${formato}`;
    setExportando(key);
    try {
      if (tipo === "licitacoes") {
        if (formato === "pdf") {
          await exportarLicitacoesPDF(
            licitacoesFiltradas,
            `Relatório de Licitações — ${estadoFiltro !== "todos" ? estadoFiltro : "Brasil"} — ${categoriaFiltro !== "todos" ? categoriaFiltro : "Todas as categorias"}`
          );
        } else {
          await exportarLicitacoesXLSX(licitacoesFiltradas);
        }
      } else if (tipo === "mercado") {
        await exportarRelatorioPDF({
          titulo: "Relatório de Mercado — Engenharia e Saneamento",
          secoes: [
            {
              subtitulo: "Visão Geral",
              conteudo: `O mercado de engenharia e saneamento brasileiro conta atualmente com ${licitacoes.length} licitações ativas no PNCP, totalizando ${formatarValor(metricas.volume)} em volume estimado. O ticket médio é de ${formatarValor(metricas.media)}, com presença em ${estados.length} estados.`,
            },
            {
              subtitulo: "Distribuição por Categoria",
              conteudo: categorias
                .map((c) => {
                  const count = licitacoes.filter((l) => l.categoria === c).length;
                  const vol = licitacoes.filter((l) => l.categoria === c).reduce((s, l) => s + (l.valor_estimado || 0), 0);
                  return `${c}: ${count} licitações (${formatarValor(vol)})`;
                })
                .join("\n"),
            },
            {
              subtitulo: "Tendências de Preços (SINAPI Fev/2026)",
              conteudo:
                "Cimento CP II: R$ 34,50/sc (+4,2%)\nAço CA-50: R$ 7,85/kg (-1,3%)\nTubo PVC 100mm: R$ 42,90/un (+11,4%)\nTubo PEAD 200mm: R$ 89,50/m (+17,5%)\nConcreto fck 25: R$ 485,00/m³ (+2,8%)\n\nInsumos com variação acima de 5% merecem atenção especial em orçamentos em andamento.",
            },
            {
              subtitulo: "Recomendações",
              conteudo:
                "1. Revisar orçamentos que incluam tubos PVC e PEAD devido a altas expressivas.\n2. Aproveitar queda do aço CA-50 para antecipação de compras.\n3. Monitorar mercado de polietileno (PEAD) — escassez de matéria-prima pode se prolongar.\n4. Priorizar licitações em SP e RJ que concentram maior volume e melhor scoring.",
            },
          ],
        });
      } else if (tipo === "comparativo") {
        const dados = [
          { insumo: "Cimento CP II (50kg)", sinapi: 34.5, sicro: 36.2, diferenca: 4.9 },
          { insumo: "Aço CA-50 Ø 10mm (kg)", sinapi: 7.85, sicro: 8.1, diferenca: 3.2 },
          { insumo: "Areia Média (m³)", sinapi: 125.0, sicro: 130.0, diferenca: 4.0 },
          { insumo: "Brita nº 1 (m³)", sinapi: 98.0, sicro: 102.0, diferenca: 4.1 },
          { insumo: "Concreto fck 25 (m³)", sinapi: 485.0, sicro: 510.0, diferenca: 5.2 },
          { insumo: "Tubo PVC 100mm (un)", sinapi: 42.9, sicro: 45.5, diferenca: 6.1 },
          { insumo: "Tubo PEAD 200mm (m)", sinapi: 89.5, sicro: 95.0, diferenca: 6.1 },
          { insumo: "Impermeabilizante (l)", sinapi: 22.4, sicro: 24.8, diferenca: 10.7 },
          { insumo: "Bomba 2CV (un)", sinapi: 3250.0, sicro: 3380.0, diferenca: 4.0 },
          { insumo: "Telha Fibroc. 6mm (un)", sinapi: 38.9, sicro: 40.2, diferenca: 3.3 },
        ];
        await exportarComparativoXLSX(dados);
      }
      toast.success("Arquivo exportado com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar. Tente novamente.");
      console.error(err);
    } finally {
      setExportando(null);
    }
  };

  const isExporting = (key: string) => exportando === key;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Download size={28} className="text-primary" />
          Exportação & Relatórios
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Exporte licitações, análises de mercado e comparativos em PDF ou Excel
        </p>
      </div>

      {/* Filtros rápidos */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold">Filtros:</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">UF:</label>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="text-sm border border-border rounded-lg px-2.5 py-1.5 bg-white"
              >
                <option value="todos">Todos os estados</option>
                {estados.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Categoria:</label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="text-sm border border-border rounded-lg px-2.5 py-1.5 bg-white"
              >
                <option value="todos">Todas</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileSearch size={12} />
                {metricas.total} licitações
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                {formatarValor(metricas.volume)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Relatório de Licitações */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileSearch size={20} className="text-blue-500" />
              Relatório de Licitações
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Exporta todas as licitações com filtros aplicados, incluindo resumo estatístico.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Licitações</span>
                <p className="font-bold text-lg">{metricas.total}</p>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Volume</span>
                <p className="font-bold text-lg">{formatarValor(metricas.volume)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-1.5"
                onClick={() => handleExport("licitacoes", "pdf")}
                disabled={!!exportando}
              >
                {isExporting("licitacoes-pdf") ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileText size={14} />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => handleExport("licitacoes", "xlsx")}
                disabled={!!exportando}
              >
                {isExporting("licitacoes-xlsx") ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileSpreadsheet size={14} />
                )}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Relatório de Mercado */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Relatório de Mercado
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Visão geral do mercado, tendências de preços SINAPI e recomendações estratégicas.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Visão geral do setor</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Tendências de preços SINAPI</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Recomendações estratégicas</span>
              </div>
            </div>
            <Button
              className="w-full gap-1.5"
              onClick={() => handleExport("mercado", "pdf")}
              disabled={!!exportando}
            >
              {isExporting("mercado-pdf") ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              Exportar PDF
            </Button>
          </CardContent>
        </Card>

        {/* Comparativo SINAPI vs SICRO */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 size={20} className="text-violet-500" />
              Comparativo SINAPI vs SICRO
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Planilha comparativa de preços entre tabelas SINAPI e SICRO com recomendações.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <CheckCircle2 size={14} className="text-violet-500" />
                <span>10 insumos principais</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <CheckCircle2 size={14} className="text-violet-500" />
                <span>Diferença percentual</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <CheckCircle2 size={14} className="text-violet-500" />
                <span>Recomendação por insumo</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full gap-1.5"
              onClick={() => handleExport("comparativo", "xlsx")}
              disabled={!!exportando}
            >
              {isExporting("comparativo-xlsx") ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={14} />
              )}
              Exportar Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview das licitações filtradas */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileSearch size={16} className="text-primary" />
              Preview — {metricas.total} licitações selecionadas
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Mostrando as 10 primeiras
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs">
                  <th className="text-left px-3 py-2 font-semibold">Título</th>
                  <th className="text-left px-3 py-2 font-semibold">Órgão</th>
                  <th className="text-center px-3 py-2 font-semibold">UF</th>
                  <th className="text-left px-3 py-2 font-semibold">Categoria</th>
                  <th className="text-right px-3 py-2 font-semibold">Valor</th>
                  <th className="text-center px-3 py-2 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {licitacoesFiltradas.slice(0, 10).map((l, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 max-w-[250px] truncate font-medium">{l.titulo}</td>
                    <td className="px-3 py-2 max-w-[180px] truncate text-muted-foreground">
                      {l.orgao}
                    </td>
                    <td className="text-center px-3 py-2 font-semibold">{l.estado}</td>
                    <td className="px-3 py-2 text-muted-foreground">{l.categoria}</td>
                    <td className="text-right px-3 py-2 font-bold text-primary tabular-nums">
                      {l.valor_estimado_fmt || "N/I"}
                    </td>
                    <td className="text-center px-3 py-2 text-muted-foreground tabular-nums">
                      {l.data_abertura
                        ? new Date(l.data_abertura + "T00:00:00").toLocaleDateString("pt-BR")
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {licitacoesFiltradas.length > 10 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              + {licitacoesFiltradas.length - 10} licitações adicionais incluídas na exportação
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
