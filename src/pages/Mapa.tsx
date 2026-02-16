import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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
  Loader2,
  Layers,
} from "lucide-react";
import { dadosEmbutidosLicitacoes } from "@/data/licitacoes";
import type { Licitacao } from "@/types/database";
import { urlSegura } from "@/lib/utils";

// ── GeoJSON source for Brazil states (pinned to specific commit for security) ──
const GEOJSON_URL =
  "https://raw.githubusercontent.com/codeforamerica/click_that_hood/6f0e4bf05c53a349e14a3c52c5601e24e2d58982/public/data/brazil-states.geojson";

// ── Indicadores por estado (dados SNIS simplificados) ──
const indicadoresPorEstado: Record<
  string,
  { agua: number; esgoto: number; investimento: string }
> = {
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

// ── Region colors ──
const regiaoColors: Record<string, string> = {
  Norte: "#10b981",
  Nordeste: "#f59e0b",
  "Centro-Oeste": "#f97316",
  Sudeste: "#3b82f6",
  Sul: "#8b5cf6",
};

const ufToRegiao: Record<string, string> = {
  AC: "Norte", AM: "Norte", AP: "Norte", PA: "Norte", RO: "Norte", RR: "Norte", TO: "Norte",
  AL: "Nordeste", BA: "Nordeste", CE: "Nordeste", MA: "Nordeste", PB: "Nordeste",
  PE: "Nordeste", PI: "Nordeste", RN: "Nordeste", SE: "Nordeste",
  DF: "Centro-Oeste", GO: "Centro-Oeste", MS: "Centro-Oeste", MT: "Centro-Oeste",
  ES: "Sudeste", MG: "Sudeste", RJ: "Sudeste", SP: "Sudeste",
  PR: "Sul", RS: "Sul", SC: "Sul",
};

function formatarValor(v: number): string {
  if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(0)}M`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

const Mapa = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(dadosEmbutidosLicitacoes);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geoLoaded, setGeoLoaded] = useState(false);

  useEffect(() => {
    fetch("./licitacoes.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setLicitacoes(data);
      })
      .catch(() => {});
  }, []);

  const porEstado = useMemo(() => {
    const map: Record<string, Licitacao[]> = {};
    for (const lic of licitacoes) {
      const uf = lic.estado || "N/A";
      if (!map[uf]) map[uf] = [];
      map[uf].push(lic);
    }
    return map;
  }, [licitacoes]);

  const maxLicitacoes = useMemo(
    () => Math.max(1, ...Object.values(porEstado).map((arr) => arr.length)),
    [porEstado]
  );

  const valorPorEstado = useMemo(() => {
    const map: Record<string, number> = {};
    for (const lic of licitacoes) {
      map[lic.estado] = (map[lic.estado] || 0) + (lic.valor_estimado || 0);
    }
    return map;
  }, [licitacoes]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "carto-light": {
            type: "raster",
            tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com">CARTO</a>',
          },
        },
        layers: [
          {
            id: "carto-light-layer",
            type: "raster",
            source: "carto-light",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-52, -14],
      zoom: 3.5,
      minZoom: 3,
      maxZoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    map.on("load", () => {
      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Load GeoJSON and add layers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || geoLoaded) return;
    const map = mapRef.current;

    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((geojson: GeoJSON.FeatureCollection) => {
        // Enrich features with data
        for (const feature of geojson.features) {
          const props = feature.properties!;
          const sigla: string = props.sigla;
          const qtd = (porEstado[sigla] || []).length;
          const regiao = ufToRegiao[sigla] || "Norte";
          props.licitacoes_count = qtd;
          props.regiao = regiao;
          props.regiao_color = regiaoColors[regiao];
          props.fill_opacity = qtd > 0 ? 0.3 + (qtd / maxLicitacoes) * 0.5 : 0.15;
        }

        map.addSource("brazil-states", { type: "geojson", data: geojson });

        // Fill
        map.addLayer({
          id: "states-fill",
          type: "fill",
          source: "brazil-states",
          paint: {
            "fill-color": ["get", "regiao_color"],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.7,
              ["get", "fill_opacity"],
            ],
          },
        });

        // Borders
        map.addLayer({
          id: "states-border",
          type: "line",
          source: "brazil-states",
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#1e40af",
              "#ffffff",
            ],
            "line-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              3,
              1.5,
            ],
          },
        });

        // Labels
        map.addLayer({
          id: "states-labels",
          type: "symbol",
          source: "brazil-states",
          layout: {
            "text-field": ["get", "sigla"],
            "text-size": 11,
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#1e293b",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.5,
          },
        });

        // Hover
        let hoveredId: number | string | null = null;

        map.on("mousemove", "states-fill", (e) => {
          if (e.features && e.features.length > 0) {
            map.getCanvas().style.cursor = "pointer";
            if (hoveredId !== null) {
              map.setFeatureState({ source: "brazil-states", id: hoveredId }, { hover: false });
            }
            hoveredId = e.features[0].id ?? e.features[0].properties?.id;
            if (hoveredId !== null) {
              map.setFeatureState({ source: "brazil-states", id: hoveredId }, { hover: true });
            }

            // Tooltip
            const props = e.features[0].properties!;
            const sigla = props.sigla;
            const qtd = porEstado[sigla]?.length ?? 0;
            const valor = valorPorEstado[sigla] ?? 0;
            const tooltip = document.getElementById("map-tooltip");
            if (tooltip) {
              tooltip.textContent = `${sigla} · ${qtd} licitações${valor > 0 ? ` · ${formatarValor(valor)}` : ""}`;
              tooltip.style.display = "block";
              tooltip.style.left = e.point.x + 12 + "px";
              tooltip.style.top = e.point.y - 12 + "px";
            }
          }
        });

        map.on("mouseleave", "states-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredId !== null) {
            map.setFeatureState({ source: "brazil-states", id: hoveredId }, { hover: false });
            hoveredId = null;
          }
          const tooltip = document.getElementById("map-tooltip");
          if (tooltip) tooltip.style.display = "none";
        });

        // Click
        map.on("click", "states-fill", (e) => {
          if (e.features && e.features.length > 0) {
            const sigla = e.features[0].properties!.sigla;
            setEstadoSelecionado((prev) => (prev === sigla ? null : sigla));
          }
        });

        setGeoLoaded(true);
      })
      .catch(console.error);
  }, [mapLoaded, geoLoaded, porEstado, maxLicitacoes, valorPorEstado]);

  // Selected state highlight
  const updateSelectedState = useCallback((sigla: string | null) => {
    if (!mapRef.current || !geoLoaded) return;
    const map = mapRef.current;
    try {
      const features = map.querySourceFeatures("brazil-states");
      for (const f of features) {
        const fId = f.id ?? f.properties?.id;
        if (fId != null) {
          map.setFeatureState(
            { source: "brazil-states", id: fId },
            { selected: f.properties?.sigla === sigla }
          );
        }
      }
    } catch { /* ignore */ }
  }, [geoLoaded]);

  useEffect(() => {
    updateSelectedState(estadoSelecionado);
  }, [estadoSelecionado, updateSelectedState]);

  const licEstado = estadoSelecionado ? (porEstado[estadoSelecionado] || []) : [];
  const indEstado = estadoSelecionado ? indicadoresPorEstado[estadoSelecionado] : null;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <MapPin size={28} className="text-primary" />
            Mapa do Brasil
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visualize licitações e indicadores de saneamento por estado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">MapLibre GL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Map Container */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="relative">
            <div ref={mapContainer} className="w-full h-[500px] lg:h-[600px]" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Loader2 className="animate-spin mr-2" size={20} />
                <span className="text-muted-foreground">Carregando mapa...</span>
              </div>
            )}

            {/* Floating tooltip */}
            <div
              id="map-tooltip"
              className="absolute hidden pointer-events-none bg-[#0f172a] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-10"
              style={{ display: "none" }}
            />

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md text-xs">
              <p className="font-semibold mb-1.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                Regiões
              </p>
              <div className="space-y-1">
                {Object.entries(regiaoColors).map(([regiao, cor]) => (
                  <div key={regiao} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: cor }} />
                    <span>{regiao}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          {estadoSelecionado && indEstado ? (
            <>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    {estadoSelecionado}
                  </CardTitle>
                  <span
                    className="inline-block text-[0.65rem] font-semibold px-2 py-0.5 rounded-full w-fit text-white"
                    style={{ backgroundColor: regiaoColors[ufToRegiao[estadoSelecionado]] || "#94a3b8" }}
                  >
                    {ufToRegiao[estadoSelecionado]}
                  </span>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileSearch size={16} className="text-primary" />
                    Licitações em {estadoSelecionado}
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {licEstado.length} resultado(s)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {licEstado.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma licitação encontrada.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
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
                              <Building2 size={10} />
                              <span className="truncate">{lic.orgao}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs font-bold text-primary">{lic.valor_estimado_fmt}</span>
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
            <Card className="bg-muted/30 border-0">
              <CardContent className="p-8 text-center">
                <Info size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">Selecione um estado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em qualquer estado no mapa para ver indicadores e licitações.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm">
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
                  <span className="text-muted-foreground">Volume total</span>
                  <span className="font-bold text-primary">
                    {formatarValor(licitacoes.reduce((a, l) => a + (l.valor_estimado || 0), 0))}
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
