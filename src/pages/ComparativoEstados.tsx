import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import {
  Droplets,
  Waves,
  DollarSign,
  Building2,
  FolderKanban,
  TrendingUp,
  Info,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";
import { useLicitacoes } from "@/hooks/useLicitacoes";
import { snisEstados } from "@/data/snis";

// ── Mapeamento UF → Região e cores ──
const regiaoMap: Record<string, { regiao: string; cor: string; corHex: string }> = {
  AC: { regiao: "Norte", cor: "text-emerald-600", corHex: "#059669" },
  AM: { regiao: "Norte", cor: "text-emerald-600", corHex: "#059669" },
  AP: { regiao: "Norte", cor: "text-emerald-600", corHex: "#059669" },
  PA: { regiao: "Norte", cor: "text-emerald-600", corHex: "#059669" },
  RO: { regiao: "Norte", cor: "text-emerald-600", corHex: "#059669" },
  RR: { regiao: "Norte", cor: "text-emerald-600", corHex: "#059669" },
  TO: { regiao: "Norte", cor: "text-emerald-600", corHex: "#059669" },
  AL: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  BA: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  CE: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  MA: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  PB: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  PE: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  PI: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  RN: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  SE: { regiao: "Nordeste", cor: "text-amber-600", corHex: "#d97706" },
  DF: { regiao: "Centro-Oeste", cor: "text-orange-600", corHex: "#ea580c" },
  GO: { regiao: "Centro-Oeste", cor: "text-orange-600", corHex: "#ea580c" },
  MS: { regiao: "Centro-Oeste", cor: "text-orange-600", corHex: "#ea580c" },
  MT: { regiao: "Centro-Oeste", cor: "text-orange-600", corHex: "#ea580c" },
  ES: { regiao: "Sudeste", cor: "text-blue-600", corHex: "#2563eb" },
  MG: { regiao: "Sudeste", cor: "text-blue-600", corHex: "#2563eb" },
  RJ: { regiao: "Sudeste", cor: "text-blue-600", corHex: "#2563eb" },
  SP: { regiao: "Sudeste", cor: "text-blue-600", corHex: "#2563eb" },
  PR: { regiao: "Sul", cor: "text-purple-600", corHex: "#9333ea" },
  RS: { regiao: "Sul", cor: "text-purple-600", corHex: "#9333ea" },
  SC: { regiao: "Sul", cor: "text-purple-600", corHex: "#9333ea" },
};

const ESTADOS_LISTA = Object.keys(regiaoMap).sort();

// Cores fixas para cada slot de comparação
const slotColors = ["#3b82f6", "#f59e0b", "#8b5cf6"];

// ── SINAPI CUB/m² por estado (valores referenciais Fev/2026, SINDUSCON) ──
const cubPorEstado: Record<string, number> = {
  AC: 1685, AL: 1548, AM: 1720, AP: 1752, BA: 1612, CE: 1565,
  DF: 1845, ES: 1698, GO: 1635, MA: 1510, MG: 1725, MS: 1672,
  MT: 1658, PA: 1695, PB: 1542, PE: 1588, PI: 1498, PR: 1812,
  RJ: 1895, RN: 1558, RO: 1645, RR: 1710, RS: 1788, SC: 1835,
  SE: 1538, SP: 1920, TO: 1618,
};

function parseInvestimento(str: string): number {
  const clean = str.replace("R$", "").trim();
  if (clean.endsWith("B")) return parseFloat(clean) * 1000;
  if (clean.endsWith("M")) return parseFloat(clean);
  return parseFloat(clean);
}

const ComparativoEstados = () => {
  const [estado1, setEstado1] = useState("SP");
  const [estado2, setEstado2] = useState("RJ");
  const [estado3, setEstado3] = useState("MG");

  const { dados: licitacoes } = useLicitacoes();

  const selectedEstados = useMemo(
    () => [estado1, estado2, estado3].filter(Boolean),
    [estado1, estado2, estado3],
  );

  // ── Dados agregados por estado ──
  const dadosComparativos = useMemo(() => {
    return selectedEstados.map((uf) => {
      const snis = snisEstados[uf] || { agua: 0, esgoto: 0, tratamento: 0, perdas: 0, investimento: "R$ 0" };
      const nEmpresas = empresas.filter((e) => e.estado_sede === uf).length;
      const nProjetos = projetos.filter((p) => p.estado === uf).length;
      const nLicitacoes = licitacoes.filter((l: { uf?: string; estado?: string }) =>
        (l.uf || l.estado || "") === uf,
      ).length;
      const investimentoMM = parseInvestimento(snis.investimento);
      const cub = cubPorEstado[uf] || 0;

      return {
        uf,
        regiao: regiaoMap[uf]?.regiao ?? "—",
        cor: regiaoMap[uf]?.cor ?? "text-gray-600",
        corHex: regiaoMap[uf]?.corHex ?? "#6b7280",
        agua: snis.agua,
        esgoto: snis.esgoto,
        tratamento: snis.tratamento,
        perdas: snis.perdas,
        investimento: snis.investimento,
        investimentoMM: investimentoMM,
        nEmpresas,
        nProjetos,
        nLicitacoes,
        cub,
      };
    });
  }, [selectedEstados, licitacoes]);

  // ── Dados para gráfico de barras ──
  const barChartData = useMemo(() => {
    const metrics = [
      { key: "agua", label: "Cobertura Agua (%)" },
      { key: "esgoto", label: "Cobertura Esgoto (%)" },
      { key: "tratamento", label: "Tratamento Esgoto (%)" },
      { key: "nEmpresas", label: "Empresas (qtd)" },
      { key: "nProjetos", label: "Projetos (qtd)" },
    ];
    return metrics.map((m) => {
      const row: Record<string, string | number> = { indicador: m.label };
      dadosComparativos.forEach((d) => {
        row[d.uf] = d[m.key as keyof typeof d] as number;
      });
      return row;
    });
  }, [dadosComparativos]);

  // ── Dados para radar chart (normalizado 0-100) ──
  const radarData = useMemo(() => {
    const maxInv = Math.max(...dadosComparativos.map((d) => d.investimentoMM), 1);
    const maxEmpresas = Math.max(...dadosComparativos.map((d) => d.nEmpresas), 1);
    const maxProjetos = Math.max(...dadosComparativos.map((d) => d.nProjetos), 1);
    const maxCub = Math.max(...dadosComparativos.map((d) => d.cub), 1);

    const dims = [
      { key: "agua", label: "Agua", norm: (v: typeof dadosComparativos[0]) => v.agua },
      { key: "esgoto", label: "Esgoto", norm: (v: typeof dadosComparativos[0]) => v.esgoto },
      { key: "tratamento", label: "Tratamento", norm: (v: typeof dadosComparativos[0]) => v.tratamento },
      { key: "investimento", label: "Investimento", norm: (v: typeof dadosComparativos[0]) => (v.investimentoMM / maxInv) * 100 },
      { key: "empresas", label: "Empresas", norm: (v: typeof dadosComparativos[0]) => (v.nEmpresas / maxEmpresas) * 100 },
      { key: "projetos", label: "Projetos", norm: (v: typeof dadosComparativos[0]) => (v.nProjetos / maxProjetos) * 100 },
      { key: "cub", label: "CUB/m2", norm: (v: typeof dadosComparativos[0]) => (v.cub / maxCub) * 100 },
    ];

    return dims.map((dim) => {
      const row: Record<string, string | number> = { subject: dim.label };
      dadosComparativos.forEach((d) => {
        row[d.uf] = Math.round(dim.norm(d) * 10) / 10;
      });
      return row;
    });
  }, [dadosComparativos]);

  // ── Resumo: quem lidera em cada indicador ──
  const resumo = useMemo(() => {
    if (dadosComparativos.length < 2) return [];

    const items: { label: string; icon: typeof Droplets; lider: string; valor: string }[] = [];

    const best = (key: keyof typeof dadosComparativos[0], label: string, icon: typeof Droplets, fmt: (v: number) => string, inverse?: boolean) => {
      const sorted = [...dadosComparativos].sort((a, b) => {
        const va = a[key] as number;
        const vb = b[key] as number;
        return inverse ? va - vb : vb - va;
      });
      items.push({ label, icon, lider: sorted[0].uf, valor: fmt(sorted[0][key] as number) });
    };

    best("agua", "Cobertura de Agua", Droplets, (v) => `${v}%`);
    best("esgoto", "Cobertura de Esgoto", Waves, (v) => `${v}%`);
    best("investimentoMM", "Investimento", DollarSign, (v) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}B` : `R$ ${v}M`);
    best("nEmpresas", "Qtd. Empresas", Building2, (v) => String(v));
    best("nProjetos", "Qtd. Projetos", FolderKanban, (v) => String(v));
    best("cub", "CUB/m2", TrendingUp, (v) => `R$ ${v.toLocaleString("pt-BR")}`);
    best("perdas", "Menores Perdas", Droplets, (v) => `${v}%`, true);

    return items;
  }, [dadosComparativos]);

  // ── Seletor de estado ──
  const EstadoSelect = ({ value, onChange, label, slot }: { value: string; onChange: (v: string) => void; label: string; slot: number }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
          style={{ borderLeftColor: slotColors[slot], borderLeftWidth: 4 }}
        >
          {ESTADOS_LISTA.map((uf) => (
            <option key={uf} value={uf}>
              {uf} — {regiaoMap[uf]?.regiao}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // ── Barra de porcentagem ──
  const PercentBar = ({ value, color, label }: { value: number; color: string; label: string }) => (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 truncate text-muted-foreground">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="w-12 text-right font-semibold">{value.toFixed(1)}%</span>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Cabecalho ── */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
          Comparativo entre Estados
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare indicadores de saneamento, infraestrutura e mercado entre ate 3 estados brasileiros
        </p>
      </div>

      {/* ── Seletores ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Selecione os Estados para Comparacao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EstadoSelect value={estado1} onChange={setEstado1} label="Estado 1" slot={0} />
            <EstadoSelect value={estado2} onChange={setEstado2} label="Estado 2" slot={1} />
            <EstadoSelect value={estado3} onChange={setEstado3} label="Estado 3" slot={2} />
          </div>
        </CardContent>
      </Card>

      {/* ── Barras de Cobertura ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            Cobertura de Saneamento (%)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {dadosComparativos.map((d, idx) => (
            <div key={d.uf} className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: slotColors[idx] }}
                />
                <span className="font-bold text-sm">{d.uf}</span>
                <span className={`text-xs ${d.cor}`}>({d.regiao})</span>
              </div>
              <PercentBar value={d.agua} color={slotColors[idx]} label="Agua" />
              <PercentBar value={d.esgoto} color={slotColors[idx]} label="Esgoto" />
              <PercentBar value={d.tratamento} color={slotColors[idx]} label="Tratamento" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Graficos lado a lado ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico de Barras */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Comparacao por Indicador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barChartData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="indicador" width={140} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {dadosComparativos.map((d, idx) => (
                  <Bar key={d.uf} dataKey={d.uf} fill={slotColors[idx]} radius={[0, 4, 4, 0]} barSize={14} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              Perfil Multidimensional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                {dadosComparativos.map((d, idx) => (
                  <Radar
                    key={d.uf}
                    name={d.uf}
                    dataKey={d.uf}
                    stroke={slotColors[idx]}
                    fill={slotColors[idx]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabela Completa ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Tabela Comparativa Completa
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">Indicador</th>
                {dadosComparativos.map((d, idx) => (
                  <th key={d.uf} className="py-2 px-3 text-center font-bold" style={{ color: slotColors[idx] }}>
                    {d.uf}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Regiao</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className={`py-2 px-3 text-center font-medium ${d.cor}`}>{d.regiao}</td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Cobertura Agua (%)</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">{d.agua.toFixed(1)}%</td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Cobertura Esgoto (%)</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">{d.esgoto.toFixed(1)}%</td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Tratamento Esgoto (%)</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">{d.tratamento.toFixed(1)}%</td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Perdas na Distribuicao (%)</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">{d.perdas.toFixed(1)}%</td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Investimento (SNIS)</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">{d.investimento}</td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">SINAPI CUB/m2</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">
                    R$ {d.cub.toLocaleString("pt-BR")}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Empresas (sede no estado)</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">{d.nEmpresas}</td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Projetos (no estado)</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">{d.nProjetos}</td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">Licitacoes (no estado)</td>
                {dadosComparativos.map((d) => (
                  <td key={d.uf} className="py-2 px-3 text-center font-semibold">{d.nLicitacoes}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Resumo ── */}
      {resumo.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-sky-500" />
              Resumo — Principais Diferencas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {resumo.map((item) => {
                const Icon = item.icon;
                const estIdx = selectedEstados.indexOf(item.lider);
                const liderColor = estIdx >= 0 ? slotColors[estIdx] : "#6b7280";
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${liderColor}15` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: liderColor }} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: liderColor }}>
                        {item.lider} — {item.valor}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Investimento (barras horizontais comparativas) ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            Investimento e CUB/m2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={dadosComparativos.map((d) => ({
                uf: d.uf,
                "Investimento (R$ MM)": d.investimentoMM,
                "CUB/m2 (R$)": d.cub,
              }))}
              margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
            >
              <XAxis dataKey="uf" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Investimento (R$ MM)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="CUB/m2 (R$)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── LGPD Notice ── */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
        <div>
          <p className="font-semibold text-foreground mb-1">Aviso LGPD — Lei Geral de Protecao de Dados</p>
          <p>
            Os dados apresentados nesta pagina sao de fontes publicas oficiais (SNIS, IBGE, ANA, PNCP, SINAPI/SINDUSCON).
            Nenhuma informacao pessoal e coletada ou armazenada. Os indicadores sao aproximacoes baseadas nos ultimos dados
            consolidados disponiveis. Para dados oficiais, consulte{" "}
            <a href="https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/snis" target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-600">
              SNIS
            </a>{" "}
            e{" "}
            <a href="https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi" target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-600">
              SINAPI/CAIXA
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparativoEstados;
