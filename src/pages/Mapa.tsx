import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Building2,
  DollarSign,
  FileSearch,
  ExternalLink,
  Droplets,
  Waves,
  Info,
} from "lucide-react";
import { dadosEmbutidosLicitacoes } from "@/data/licitacoes";
import type { Licitacao } from "@/types/database";
import { urlSegura } from "@/lib/utils";

// ── Tile Map Layout (Cartograma do Brasil) ──
// Cada estado posicionado em grid para aproximar a geografia real
// row/col baseados em layout padrão de cartogramas brasileiros

interface EstadoInfo {
  uf: string;
  nome: string;
  row: number;
  col: number;
  regiao: string;
}

const estados: EstadoInfo[] = [
  // Norte
  { uf: "RR", nome: "Roraima", row: 0, col: 2, regiao: "Norte" },
  { uf: "AP", nome: "Amapá", row: 0, col: 4, regiao: "Norte" },
  { uf: "AM", nome: "Amazonas", row: 1, col: 1, regiao: "Norte" },
  { uf: "PA", nome: "Pará", row: 1, col: 3, regiao: "Norte" },
  { uf: "AC", nome: "Acre", row: 2, col: 0, regiao: "Norte" },
  { uf: "RO", nome: "Rondônia", row: 2, col: 1, regiao: "Norte" },
  { uf: "TO", nome: "Tocantins", row: 2, col: 3, regiao: "Norte" },
  // Nordeste
  { uf: "MA", nome: "Maranhão", row: 1, col: 4, regiao: "Nordeste" },
  { uf: "PI", nome: "Piauí", row: 1, col: 5, regiao: "Nordeste" },
  { uf: "CE", nome: "Ceará", row: 1, col: 6, regiao: "Nordeste" },
  { uf: "RN", nome: "R. G. do Norte", row: 1, col: 7, regiao: "Nordeste" },
  { uf: "PB", nome: "Paraíba", row: 2, col: 7, regiao: "Nordeste" },
  { uf: "PE", nome: "Pernambuco", row: 2, col: 6, regiao: "Nordeste" },
  { uf: "AL", nome: "Alagoas", row: 2, col: 8, regiao: "Nordeste" },
  { uf: "SE", nome: "Sergipe", row: 3, col: 7, regiao: "Nordeste" },
  { uf: "BA", nome: "Bahia", row: 2, col: 5, regiao: "Nordeste" },
  // Centro-Oeste
  { uf: "MT", nome: "Mato Grosso", row: 3, col: 2, regiao: "Centro-Oeste" },
  { uf: "DF", nome: "Distrito Federal", row: 3, col: 4, regiao: "Centro-Oeste" },
  { uf: "GO", nome: "Goiás", row: 3, col: 3, regiao: "Centro-Oeste" },
  { uf: "MS", nome: "Mato G. do Sul", row: 4, col: 2, regiao: "Centro-Oeste" },
  // Sudeste
  { uf: "MG", nome: "Minas Gerais", row: 3, col: 5, regiao: "Sudeste" },
  { uf: "ES", nome: "Espírito Santo", row: 3, col: 6, regiao: "Sudeste" },
  { uf: "RJ", nome: "Rio de Janeiro", row: 4, col: 6, regiao: "Sudeste" },
  { uf: "SP", nome: "São Paulo", row: 4, col: 4, regiao: "Sudeste" },
  // Sul
  { uf: "PR", nome: "Paraná", row: 4, col: 3, regiao: "Sul" },
  { uf: "SC", nome: "Santa Catarina", row: 5, col: 3, regiao: "Sul" },
  { uf: "RS", nome: "Rio G. do Sul", row: 5, col: 2, regiao: "Sul" },
];

const regiaoColors: Record<string, { bg: string; text: string; hover: string }> = {
  Norte: { bg: "bg-emerald-100", text: "text-emerald-800", hover: "hover:bg-emerald-200" },
  Nordeste: { bg: "bg-amber-100", text: "text-amber-800", hover: "hover:bg-amber-200" },
  "Centro-Oeste": { bg: "bg-orange-100", text: "text-orange-800", hover: "hover:bg-orange-200" },
  Sudeste: { bg: "bg-blue-100", text: "text-blue-800", hover: "hover:bg-blue-200" },
  Sul: { bg: "bg-violet-100", text: "text-violet-800", hover: "hover:bg-violet-200" },
};

// ── Indicadores por estado (dados SNIS simplificados) ──
const indicadoresPorEstado: Record<string, { agua: number; esgoto: number; investimento: string }> = {
  AC: { agua: 55.7, esgoto: 19.8, investimento: "R$ 180M" },
  AL: { agua: 79.4, esgoto: 28.4, investimento: "R$ 420M" },
  AM: { agua: 68.2, esgoto: 15.3, investimento: "R$ 350M" },
  AP: { agua: 41.6, esgoto: 11.2, investimento: "R$ 95M" },
  BA: { agua: 82.1, esgoto: 38.5, investimento: "R$ 1.2B" },
  CE: { agua: 79.5, esgoto: 32.7, investimento: "R$ 890M" },
  DF: { agua: 98.8, esgoto: 89.5, investimento: "R$ 320M" },
  ES: { agua: 87.3, esgoto: 56.1, investimento: "R$ 510M" },
  GO: { agua: 88.2, esgoto: 52.6, investimento: "R$ 620M" },
  MA: { agua: 64.8, esgoto: 14.7, investimento: "R$ 380M" },
  MG: { agua: 88.5, esgoto: 59.2, investimento: "R$ 2.1B" },
  MS: { agua: 89.1, esgoto: 45.3, investimento: "R$ 290M" },
  MT: { agua: 86.4, esgoto: 35.2, investimento: "R$ 340M" },
  PA: { agua: 55.3, esgoto: 12.1, investimento: "R$ 480M" },
  PB: { agua: 78.2, esgoto: 35.8, investimento: "R$ 310M" },
  PE: { agua: 82.7, esgoto: 34.9, investimento: "R$ 780M" },
  PI: { agua: 75.1, esgoto: 17.2, investimento: "R$ 210M" },
  PR: { agua: 92.1, esgoto: 72.5, investimento: "R$ 1.5B" },
  RJ: { agua: 91.2, esgoto: 61.3, investimento: "R$ 2.8B" },
  RN: { agua: 81.6, esgoto: 28.9, investimento: "R$ 270M" },
  RO: { agua: 59.8, esgoto: 8.4, investimento: "R$ 150M" },
  RR: { agua: 72.5, esgoto: 20.1, investimento: "R$ 85M" },
  RS: { agua: 89.4, esgoto: 46.1, investimento: "R$ 1.1B" },
  SC: { agua: 91.8, esgoto: 35.6, investimento: "R$ 680M" },
  SE: { agua: 84.3, esgoto: 29.5, investimento: "R$ 190M" },
  SP: { agua: 96.1, esgoto: 85.2, investimento: "R$ 5.2B" },
  TO: { agua: 79.5, esgoto: 30.1, investimento: "R$ 160M" },
};

function getIntensidade(qtd: number, max: number): string {
  if (max === 0) return "opacity-30";
  const ratio = qtd / max;
  if (ratio > 0.6) return "opacity-100 ring-2 ring-primary/30";
  if (ratio > 0.3) return "opacity-80";
  if (ratio > 0) return "opacity-60";
  return "opacity-30";
}

const Mapa = () => {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(dadosEmbutidosLicitacoes);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null);
  const [hoveredEstado, setHoveredEstado] = useState<string | null>(null);

  useEffect(() => {
    fetch("./licitacoes.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setLicitacoes(data);
      })
      .catch(() => {});
  }, []);

  // Agrupar licitações por estado
  const porEstado = useMemo(() => {
    const map: Record<string, Licitacao[]> = {};
    for (const lic of licitacoes) {
      const uf = lic.estado || "N/A";
      if (!map[uf]) map[uf] = [];
      map[uf].push(lic);
    }
    return map;
  }, [licitacoes]);

  const maxLicitacoes = useMemo(() => {
    return Math.max(1, ...Object.values(porEstado).map((arr) => arr.length));
  }, [porEstado]);

  const estadoAtivo = estadoSelecionado || hoveredEstado;
  const licEstado = estadoAtivo ? (porEstado[estadoAtivo] || []) : [];
  const indEstado = estadoAtivo ? indicadoresPorEstado[estadoAtivo] : null;
  const infoEstado = estadoAtivo
    ? estados.find((e) => e.uf === estadoAtivo)
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <MapPin size={28} className="text-primary" />
          Mapa do Brasil
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visualize licitações e indicadores de saneamento por estado
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Mapa (Tile/Cartograma) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              Cartograma — Licitações por Estado
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Clique em um estado para ver detalhes. Intensidade = volume de licitações.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-9 gap-1 max-w-[600px] mx-auto">
              {Array.from({ length: 6 * 9 }, (_, i) => {
                const row = Math.floor(i / 9);
                const col = i % 9;
                const estado = estados.find((e) => e.row === row && e.col === col);

                if (!estado) {
                  return <div key={i} className="aspect-square" />;
                }

                const qtd = (porEstado[estado.uf] || []).length;
                const cores = regiaoColors[estado.regiao];
                const isActive = estadoAtivo === estado.uf;

                return (
                  <button
                    key={estado.uf}
                    onClick={() =>
                      setEstadoSelecionado(
                        estadoSelecionado === estado.uf ? null : estado.uf
                      )
                    }
                    onMouseEnter={() => setHoveredEstado(estado.uf)}
                    onMouseLeave={() => setHoveredEstado(null)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                      cores.bg
                    } ${cores.hover} ${getIntensidade(qtd, maxLicitacoes)} ${
                      isActive ? "ring-2 ring-primary scale-110 z-10 shadow-lg" : ""
                    }`}
                    title={`${estado.nome}: ${qtd} licitação(ões)`}
                  >
                    <span className={`text-xs font-bold ${cores.text}`}>
                      {estado.uf}
                    </span>
                    {qtd > 0 && (
                      <span className="text-[0.55rem] font-semibold text-muted-foreground mt-0.5">
                        {qtd}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda de regiões */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 pt-4 border-t border-border">
              {Object.entries(regiaoColors).map(([regiao, cores]) => (
                <span
                  key={regiao}
                  className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full ${cores.bg} ${cores.text}`}
                >
                  {regiao}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Painel de Detalhes */}
        <div className="space-y-4">
          {estadoAtivo && infoEstado ? (
            <>
              {/* Info do Estado */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    {infoEstado.nome} ({infoEstado.uf})
                  </CardTitle>
                  <span
                    className={`inline-block text-[0.65rem] font-semibold px-2 py-0.5 rounded-full w-fit ${
                      regiaoColors[infoEstado.regiao].bg
                    } ${regiaoColors[infoEstado.regiao].text}`}
                  >
                    {infoEstado.regiao}
                  </span>
                </CardHeader>
                <CardContent>
                  {indEstado && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Droplets size={16} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cobertura de Água</p>
                          <p className="text-lg font-extrabold">{indEstado.agua}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Waves size={16} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Coleta de Esgoto</p>
                          <p className="text-lg font-extrabold">{indEstado.esgoto}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <DollarSign size={16} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Investimento Previsto</p>
                          <p className="text-lg font-extrabold">{indEstado.investimento}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Licitações do Estado */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileSearch size={16} className="text-primary" />
                    Licitações em {infoEstado.uf}
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {licEstado.length} resultado(s)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {licEstado.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma licitação encontrada para este estado.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {licEstado.map((lic, i) => (
                        <a
                          key={i}
                          href={urlSegura(lic.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <div className="p-3 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all">
                            <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {lic.titulo}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-[0.65rem] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Building2 size={10} />
                                {lic.orgao}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs font-bold text-primary">
                                {lic.valor_estimado_fmt}
                              </span>
                              <span className="text-[0.6rem] text-muted-foreground flex items-center gap-0.5">
                                <ExternalLink size={9} /> Ver edital
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <Info size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">
                  Selecione um estado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em qualquer estado no mapa para ver indicadores e licitações.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Resumo Geral */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Resumo Nacional
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de licitações</span>
                  <span className="font-bold">{licitacoes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estados com licitações</span>
                  <span className="font-bold">{Object.keys(porEstado).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Maior concentração</span>
                  <span className="font-bold">
                    {Object.entries(porEstado).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Mapa;
