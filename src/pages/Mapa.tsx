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
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Activity,
  Gauge,
  Wrench,
  Radio,
  Flame,
} from "lucide-react";
import { useLicitacoes } from "@/hooks/useLicitacoes";
import { baciasToGeoJSON, baciasLabelsGeoJSON, baciasHidrograficas } from "@/data/baciasHidrograficas";
import { estacoesTratamento } from "@/data/etasEtes";
import { alertasMeteorologicos, alertaCores } from "@/data/alertas";
import { estacoesANA, statusCores } from "@/data/estacoesANA";
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

// ── Estado centroids (used by project markers and heatmap) ──
const estadoCentroids: Record<string, [number, number]> = {
  AC: [-70.5, -9.0], AL: [-36.6, -9.6], AM: [-64.0, -3.4], AP: [-51.1, 1.0],
  BA: [-41.7, -12.6], CE: [-39.3, -5.1], DF: [-47.9, -15.8], ES: [-40.3, -19.2],
  GO: [-49.6, -15.9], MA: [-45.3, -5.4], MG: [-44.4, -18.5], MS: [-54.8, -20.8],
  MT: [-55.9, -12.7], PA: [-52.3, -3.8], PB: [-36.6, -7.1], PE: [-37.3, -8.3],
  PI: [-42.8, -7.7], PR: [-51.5, -24.6], RJ: [-43.2, -22.6], RN: [-36.5, -5.8],
  RO: [-63.6, -10.9], RR: [-61.4, 2.1], RS: [-53.2, -29.8], SC: [-49.4, -27.2],
  SE: [-37.1, -10.6], SP: [-48.5, -22.3], TO: [-48.4, -10.2],
};

// ── Layer visibility state type ──
interface LayerVisibility {
  estados: boolean;
  bacias: boolean;
  etasEtes: boolean;
  projetos: boolean;
  alertas: boolean;
  estacoesANA: boolean;
  heatmap: boolean;
}

// ── Collapsible panel sections ──
interface PanelSections {
  indicadores: boolean;
  licitacoes: boolean;
  bacias: boolean;
  alertas: boolean;
  estacoes: boolean;
}

const Mapa = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const { dados: licitacoes } = useLicitacoes();
  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geoLoaded, setGeoLoaded] = useState(false);
  const [layerControlOpen, setLayerControlOpen] = useState(true);

  const [layers, setLayers] = useState<LayerVisibility>({
    estados: true,
    bacias: false,
    etasEtes: true,
    projetos: true,
    alertas: true,
    estacoesANA: false,
    heatmap: false,
  });

  const [panels, setPanels] = useState<PanelSections>({
    indicadores: true,
    licitacoes: true,
    bacias: false,
    alertas: true,
    estacoes: false,
  });

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

  // ── Alertas por estado ──
  const alertasPorEstado = useMemo(() => {
    const map: Record<string, typeof alertasMeteorologicos> = {};
    for (const a of alertasMeteorologicos) {
      if (!map[a.estado]) map[a.estado] = [];
      map[a.estado].push(a);
    }
    return map;
  }, []);

  // ── Estações por estado ──
  const estacoesPorEstado = useMemo(() => {
    const map: Record<string, typeof estacoesANA> = {};
    for (const e of estacoesANA) {
      if (!map[e.estado]) map[e.estado] = [];
      map[e.estado].push(e);
    }
    return map;
  }, []);

  // ── ETAs/ETEs por estado ──
  const etasPorEstado = useMemo(() => {
    const map: Record<string, typeof estacoesTratamento> = {};
    for (const e of estacoesTratamento) {
      if (!map[e.estado]) map[e.estado] = [];
      map[e.estado].push(e);
    }
    return map;
  }, []);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  // Add markers for ETAs/ETEs
  const addETAMarkers = useCallback((map: maplibregl.Map) => {
    estacoesTratamento.forEach((e) => {
      const color = e.tipo === "ETA" ? "#3b82f6" : "#10b981";
      const statusColor = e.status === "operacional" ? color : e.status === "em_obras" ? "#f59e0b" : "#94a3b8";

      const el = document.createElement("div");
      el.style.cssText = `width:20px;height:20px;border-radius:50%;background:${statusColor};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;color:white;`;
      el.textContent = e.tipo === "ETA" ? "A" : "E";
      el.title = `${e.nome} (${e.tipo})`;

      const popup = new maplibregl.Popup({ offset: 12, maxWidth: "280px" }).setHTML(`
        <div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.4;">
          <div style="font-weight:700;color:${statusColor};margin-bottom:4px;">${e.tipo} — ${e.nome}</div>
          <div><strong>Operadora:</strong> ${e.operadora}</div>
          <div><strong>Município:</strong> ${e.municipio}/${e.estado}</div>
          <div><strong>Capacidade:</strong> ${e.capacidade_ls.toLocaleString("pt-BR")} L/s</div>
          <div><strong>Pop. atendida:</strong> ${(e.populacao_atendida / 1e6).toFixed(1)}M</div>
          <div style="margin-top:4px;padding:2px 6px;border-radius:4px;background:${statusColor}22;color:${statusColor};font-weight:600;display:inline-block;">
            ${e.status === "operacional" ? "Operacional" : e.status === "em_obras" ? "Em obras" : "Planejada"}
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([e.lng, e.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, []);

  // Add markers for alerts
  const addAlertMarkers = useCallback((map: maplibregl.Map) => {
    alertasMeteorologicos.forEach((a) => {
      const color = alertaCores[a.nivel];

      const el = document.createElement("div");
      el.style.cssText = `width:24px;height:24px;border-radius:4px;background:${color};border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,.4);cursor:pointer;display:flex;align-items:center;justify-content:center;animation:pulse 2s infinite;`;
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      el.title = a.titulo;

      const popup = new maplibregl.Popup({ offset: 14, maxWidth: "320px" }).setHTML(`
        <div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.4;">
          <div style="font-weight:700;color:${color};margin-bottom:4px;font-size:13px;">${a.titulo}</div>
          <div style="margin-bottom:6px;color:#475569;">${a.descricao}</div>
          <div style="display:flex;gap:8px;margin-bottom:6px;">
            <span style="padding:2px 6px;border-radius:4px;background:${color}22;color:${color};font-weight:600;font-size:10px;text-transform:uppercase;">${a.nivel}</span>
            <span style="padding:2px 6px;border-radius:4px;background:#f1f5f9;color:#475569;font-weight:500;font-size:10px;">${a.fonte}</span>
          </div>
          <div><strong>Local:</strong> ${a.municipio}/${a.estado}</div>
          <div style="margin-top:6px;padding:6px;border-radius:6px;background:#fef3c7;border:1px solid #fbbf24;font-size:11px;">
            <strong>Impacto em obras:</strong> ${a.impacto_obras}
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([a.lng, a.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, []);

  // Add markers for ANA stations
  const addANAMarkers = useCallback((map: maplibregl.Map) => {
    estacoesANA.forEach((e) => {
      const color = statusCores[e.status];
      const isFluvio = e.tipo === "fluviometrica";

      const el = document.createElement("div");
      el.style.cssText = `width:18px;height:18px;border-radius:${isFluvio ? "50%" : "3px"};background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer;`;
      el.title = `${e.nome} (${e.tipo})`;

      const valorPrincipal = isFluvio
        ? `Nível: ${e.nivel_atual_m?.toFixed(2) ?? "N/D"}m | Vazão: ${e.vazao_atual_m3s?.toLocaleString("pt-BR") ?? "N/D"} m³/s`
        : `Chuva 24h: ${e.chuva_acum_24h_mm ?? "N/D"} mm`;

      const popup = new maplibregl.Popup({ offset: 10, maxWidth: "280px" }).setHTML(`
        <div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.4;">
          <div style="font-weight:700;color:${color};margin-bottom:4px;">${e.nome}</div>
          <div><strong>Código ANA:</strong> ${e.codigo}</div>
          <div><strong>Rio:</strong> ${e.rio}</div>
          <div><strong>Bacia:</strong> ${e.bacia}</div>
          <div style="margin-top:4px;font-weight:600;">${valorPrincipal}</div>
          <div style="margin-top:4px;padding:2px 6px;border-radius:4px;background:${color}22;color:${color};font-weight:600;display:inline-block;text-transform:capitalize;">
            ${e.status}
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([e.lng, e.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, []);

  // Add project markers (from licitações with geolocation)
  const addProjectMarkers = useCallback((map: maplibregl.Map) => {
    Object.entries(porEstado).forEach(([uf, lics]) => {
      const centroid = estadoCentroids[uf];
      if (!centroid || lics.length === 0) return;

      const el = document.createElement("div");
      const count = lics.length;
      const size = Math.max(22, Math.min(40, 22 + count * 3));
      el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:rgba(59,130,246,0.85);border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:${size > 30 ? 12 : 10}px;font-weight:bold;color:white;`;
      el.textContent = String(count);
      el.title = `${count} licitações em ${uf}`;

      const totalValor = lics.reduce((s, l) => s + (l.valor_estimado || 0), 0);
      const popup = new maplibregl.Popup({ offset: 12, maxWidth: "260px" }).setHTML(`
        <div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.4;">
          <div style="font-weight:700;color:#3b82f6;margin-bottom:4px;">${uf} — ${count} Projetos/Licitações</div>
          <div><strong>Volume total:</strong> ${formatarValor(totalValor)}</div>
          <div style="margin-top:6px;max-height:120px;overflow-y:auto;">
            ${lics.slice(0, 5).map((l) => `<div style="padding:3px 0;border-bottom:1px solid #f1f5f9;font-size:11px;">${l.titulo.slice(0, 50)}...</div>`).join("")}
            ${count > 5 ? `<div style="color:#94a3b8;font-size:10px;margin-top:4px;">+${count - 5} mais...</div>` : ""}
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(centroid)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [porEstado]);

  // ── Update markers when layers change ──
  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;
    clearMarkers();
    if (layers.etasEtes) addETAMarkers(mapRef.current);
    if (layers.alertas) addAlertMarkers(mapRef.current);
    if (layers.estacoesANA) addANAMarkers(mapRef.current);
    if (layers.projetos) addProjectMarkers(mapRef.current);
  }, [layers, clearMarkers, addETAMarkers, addAlertMarkers, addANAMarkers, addProjectMarkers]);

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
      maxZoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    map.on("load", () => {
      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, [clearMarkers]);

  // Load GeoJSON and add base layers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || geoLoaded) return;
    const map = mapRef.current;

    // Add bacias source
    map.addSource("bacias", { type: "geojson", data: baciasToGeoJSON() });
    map.addSource("bacias-labels", { type: "geojson", data: baciasLabelsGeoJSON() });

    // Bacias fill layer
    map.addLayer({
      id: "bacias-fill",
      type: "fill",
      source: "bacias",
      paint: {
        "fill-color": ["get", "cor"],
        "fill-opacity": 0.15,
      },
      layout: { visibility: "none" },
    });

    // Bacias border layer
    map.addLayer({
      id: "bacias-border",
      type: "line",
      source: "bacias",
      paint: {
        "line-color": ["get", "cor"],
        "line-width": 2,
        "line-dasharray": [4, 2],
        "line-opacity": 0.6,
      },
      layout: { visibility: "none" },
    });

    // Bacias labels
    map.addLayer({
      id: "bacias-labels",
      type: "symbol",
      source: "bacias-labels",
      layout: {
        "text-field": ["get", "nome"],
        "text-size": 10,
        "text-allow-overlap": false,
        visibility: "none",
      },
      paint: {
        "text-color": "#065f46",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.5,
      },
    });

    // Fetch Brazil states GeoJSON
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    fetch(GEOJSON_URL, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const contentLength = r.headers.get("content-length");
        if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
          throw new Error("GeoJSON too large");
        }
        return r.json();
      })
      .then((geojson: GeoJSON.FeatureCollection) => {
        if (!geojson || geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
          throw new Error("Invalid GeoJSON");
        }

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

        // ── Heatmap de investimento ──
        const heatmapPoints: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: Object.entries(porEstado).flatMap(([uf, lics]) => {
            const centroid = estadoCentroids[uf];
            if (!centroid) return [];
            return lics.map((lic) => ({
              type: "Feature" as const,
              properties: {
                valor: lic.valor_estimado || 500000,
              },
              geometry: {
                type: "Point" as const,
                coordinates: [
                  centroid[0] + (Math.random() - 0.5) * 3,
                  centroid[1] + (Math.random() - 0.5) * 3,
                ],
              },
            }));
          }),
        };

        map.addSource("investimento-heat", { type: "geojson", data: heatmapPoints });

        map.addLayer({
          id: "investimento-heatmap",
          type: "heatmap",
          source: "investimento-heat",
          layout: { visibility: "none" },
          paint: {
            "heatmap-weight": [
              "interpolate", ["linear"], ["get", "valor"],
              0, 0,
              50000000, 1,
            ],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 3, 0.8, 9, 2],
            "heatmap-color": [
              "interpolate", ["linear"], ["heatmap-density"],
              0, "rgba(0,0,0,0)",
              0.1, "rgba(59,130,246,0.2)",
              0.3, "rgba(16,185,129,0.4)",
              0.5, "rgba(245,158,11,0.5)",
              0.7, "rgba(239,68,68,0.6)",
              1, "rgba(139,92,246,0.8)",
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 3, 30, 9, 50],
            "heatmap-opacity": 0.7,
          },
        });

        // States fill
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

        // States borders
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

        // States labels
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

            const props = e.features[0].properties!;
            const sigla = props.sigla;
            const qtd = porEstado[sigla]?.length ?? 0;
            const valor = valorPorEstado[sigla] ?? 0;
            const alertas = alertasPorEstado[sigla]?.length ?? 0;
            const tooltip = document.getElementById("map-tooltip");
            if (tooltip) {
              let text = `${sigla} · ${qtd} licitações`;
              if (valor > 0) text += ` · ${formatarValor(valor)}`;
              if (alertas > 0) text += ` · ${alertas} alerta(s)`;
              tooltip.textContent = text;
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

        // Bacias hover
        map.on("mousemove", "bacias-fill", (e) => {
          if (e.features && e.features.length > 0) {
            const props = e.features[0].properties!;
            const tooltip = document.getElementById("map-tooltip");
            if (tooltip) {
              tooltip.textContent = `${props.nome} · ${props.vazao_media_m3s?.toLocaleString("pt-BR")} m³/s · ${props.populacao_milhoes}M hab`;
              tooltip.style.display = "block";
              tooltip.style.left = e.point.x + 12 + "px";
              tooltip.style.top = e.point.y - 12 + "px";
            }
          }
        });

        map.on("mouseleave", "bacias-fill", () => {
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
      .catch((err) => {
        if (err.name !== "AbortError") console.error("GeoJSON load error:", err);
      })
      .finally(() => clearTimeout(timer));
  }, [mapLoaded, geoLoaded, porEstado, maxLicitacoes, valorPorEstado, alertasPorEstado]);

  // Update markers when layers change — markers load independently of GeoJSON
  useEffect(() => {
    if (mapLoaded) updateMarkers();
  }, [mapLoaded, updateMarkers, layers]);

  // Toggle map layer visibility
  useEffect(() => {
    if (!mapRef.current || !geoLoaded) return;
    const map = mapRef.current;

    const setVis = (id: string, visible: boolean) => {
      try {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
        }
      } catch { /* layer may not exist yet */ }
    };

    setVis("states-fill", layers.estados);
    setVis("states-border", layers.estados);
    setVis("states-labels", layers.estados);
    setVis("bacias-fill", layers.bacias);
    setVis("bacias-border", layers.bacias);
    setVis("bacias-labels", layers.bacias);
    setVis("investimento-heatmap", layers.heatmap);
  }, [layers, geoLoaded]);

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
  const alertasEstado = estadoSelecionado ? (alertasPorEstado[estadoSelecionado] || []) : [];
  const estacoesEstado = estadoSelecionado ? (estacoesPorEstado[estadoSelecionado] || []) : [];
  const etasEstado = estadoSelecionado ? (etasPorEstado[estadoSelecionado] || []) : [];

  // Toggle layer helper
  const toggleLayer = (key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle panel helper
  const togglePanel = (key: keyof PanelSections) => {
    setPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Pulse animation for alerts */}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <MapPin size={28} className="text-primary" />
            Mapa Avançado do Brasil
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bacias hidrográficas, ETAs/ETEs, alertas INMET/CEMADEN e estações ANA
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity size={14} />
          <span>{alertasMeteorologicos.length} alertas ativos</span>
          <span className="mx-1">·</span>
          <Radio size={14} />
          <span>{estacoesANA.length} estações ANA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
        {/* Map Container */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="relative">
            <div ref={mapContainer} className="w-full h-[500px] lg:h-[650px]" />
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

            {/* ── Layer Control Panel ── */}
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50 overflow-hidden" style={{ minWidth: 200 }}>
                <button
                  onClick={() => setLayerControlOpen(!layerControlOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers size={14} />
                    Camadas
                  </span>
                  {layerControlOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {layerControlOpen && (
                  <div className="px-3 pb-3 space-y-1.5 border-t border-border/30 pt-2">
                    {([
                      { key: "estados" as const, label: "Estados", icon: MapPin, color: "#3b82f6" },
                      { key: "bacias" as const, label: "Bacias Hidrográficas", icon: Waves, color: "#065f46" },
                      { key: "etasEtes" as const, label: "ETAs / ETEs", icon: Droplets, color: "#10b981" },
                      { key: "projetos" as const, label: "Projetos / Obras", icon: Wrench, color: "#6366f1" },
                      { key: "alertas" as const, label: "Alertas INMET/CEMADEN", icon: AlertTriangle, color: "#ef4444" },
                      { key: "heatmap" as const, label: "Mapa de Calor", icon: Flame, color: "#d946ef" },
                      { key: "estacoesANA" as const, label: "Estações ANA", icon: Gauge, color: "#0284c7" },
                    ]).map(({ key, label, icon: Icon, color }) => (
                      <button
                        key={key}
                        onClick={() => toggleLayer(key)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left"
                      >
                        <span
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: layers[key] ? color : "#d1d5db" }}
                        />
                        <Icon size={13} style={{ color: layers[key] ? color : "#9ca3af" }} />
                        <span className={`text-xs flex-1 ${layers[key] ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                        {layers[key] ? (
                          <Eye size={12} className="text-muted-foreground" />
                        ) : (
                          <EyeOff size={12} className="text-muted-foreground/40" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Legend ── */}
            <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-md text-xs max-w-[200px]">
              {layers.estados && (
                <>
                  <p className="font-semibold mb-1.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                    Regiões
                  </p>
                  <div className="space-y-1 mb-2">
                    {Object.entries(regiaoColors).map(([regiao, cor]) => (
                      <div key={regiao} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: cor }} />
                        <span>{regiao}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {layers.alertas && (
                <>
                  <p className="font-semibold mb-1.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                    Alertas
                  </p>
                  <div className="space-y-1 mb-2">
                    {(["amarelo", "laranja", "vermelho"] as const).map((nivel) => (
                      <div key={nivel} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: alertaCores[nivel] }} />
                        <span className="capitalize">{nivel}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {layers.heatmap && (
                <>
                  <p className="font-semibold mb-1.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                    Calor de Investimento
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[0.6rem]">Baixo</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: "linear-gradient(to right, rgba(59,130,246,0.3), rgba(16,185,129,0.5), rgba(245,158,11,0.6), rgba(239,68,68,0.7), rgba(139,92,246,0.9))" }} />
                    <span className="text-[0.6rem]">Alto</span>
                  </div>
                </>
              )}
              {layers.estacoesANA && (
                <>
                  <p className="font-semibold mb-1.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                    Estações ANA
                  </p>
                  <div className="space-y-1">
                    {(["normal", "atencao", "alerta", "critico"] as const).map((status) => (
                      <div key={status} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: statusCores[status] }} />
                        <span className="capitalize">{status === "atencao" ? "atenção" : status === "critico" ? "crítico" : status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* ── Side Panel — Cascade UI ── */}
        <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
          {estadoSelecionado && indEstado ? (
            <>
              {/* Estado header */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    {estadoSelecionado}
                    <span
                      className="ml-2 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: regiaoColors[ufToRegiao[estadoSelecionado]] || "#94a3b8" }}
                    >
                      {ufToRegiao[estadoSelecionado]}
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* ── Indicadores (collapsible) ── */}
              <Card className="border-0 shadow-sm">
                <button
                  onClick={() => togglePanel("indicadores")}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Droplets size={16} className="text-blue-500" />
                    Indicadores de Saneamento
                  </span>
                  {panels.indicadores ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {panels.indicadores && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Droplets size={16} className="text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Cobertura de Água</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-extrabold">{indEstado.agua}%</p>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${indEstado.agua}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Waves size={16} className="text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Coleta de Esgoto</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-extrabold">{indEstado.esgoto}%</p>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${indEstado.esgoto}%` }} />
                            </div>
                          </div>
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

                    {/* ETAs/ETEs do estado */}
                    {etasEstado.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                          Estações de Tratamento
                        </p>
                        <div className="space-y-2">
                          {etasEstado.map((e) => (
                            <div key={e.id} className="flex items-center gap-2 text-xs">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: e.tipo === "ETA" ? "#3b82f6" : "#10b981" }}
                              />
                              <span className="font-medium">{e.tipo}</span>
                              <span className="text-muted-foreground truncate flex-1">{e.nome}</span>
                              <span className="text-muted-foreground">{(e.capacidade_ls / 1000).toFixed(0)}k L/s</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* ── Alertas do estado (collapsible) ── */}
              {alertasEstado.length > 0 && (
                <Card className="border-0 shadow-sm border-l-4" style={{ borderLeftColor: alertaCores[alertasEstado[0].nivel] }}>
                  <button
                    onClick={() => togglePanel("alertas")}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      Alertas ({alertasEstado.length})
                    </span>
                    {panels.alertas ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {panels.alertas && (
                    <CardContent className="pt-0 space-y-3">
                      {alertasEstado.map((a) => (
                        <div key={a.id} className="p-3 rounded-lg border" style={{ borderColor: alertaCores[a.nivel] + "40", backgroundColor: alertaCores[a.nivel] + "08" }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded uppercase text-white"
                              style={{ backgroundColor: alertaCores[a.nivel] }}
                            >
                              {a.nivel}
                            </span>
                            <span className="text-[0.6rem] font-medium text-muted-foreground">{a.fonte}</span>
                          </div>
                          <p className="text-xs font-semibold mb-1">{a.titulo}</p>
                          <p className="text-[0.65rem] text-muted-foreground mb-2">{a.descricao}</p>
                          <div className="text-[0.6rem] p-2 rounded bg-amber-50 border border-amber-200">
                            <strong>Impacto:</strong> {a.impacto_obras}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              )}

              {/* ── Estações ANA do estado (collapsible) ── */}
              {estacoesEstado.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <button
                    onClick={() => togglePanel("estacoes")}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Gauge size={16} className="text-sky-600" />
                      Estações ANA ({estacoesEstado.length})
                    </span>
                    {panels.estacoes ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {panels.estacoes && (
                    <CardContent className="pt-0 space-y-2">
                      {estacoesEstado.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg border border-border/50 text-xs">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: statusCores[e.status] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{e.nome}</p>
                            <p className="text-[0.6rem] text-muted-foreground">
                              {e.tipo === "fluviometrica"
                                ? `${e.rio} · ${e.nivel_atual_m?.toFixed(1) ?? "N/D"}m · ${e.vazao_atual_m3s?.toLocaleString("pt-BR") ?? "N/D"} m³/s`
                                : `Chuva 24h: ${e.chuva_acum_24h_mm ?? "N/D"} mm`
                              }
                            </p>
                          </div>
                          <span
                            className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded capitalize"
                            style={{ backgroundColor: statusCores[e.status] + "20", color: statusCores[e.status] }}
                          >
                            {e.status === "atencao" ? "atenção" : e.status === "critico" ? "crítico" : e.status}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              )}

              {/* ── Licitações (collapsible) ── */}
              <Card className="border-0 shadow-sm">
                <button
                  onClick={() => togglePanel("licitacoes")}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileSearch size={16} className="text-primary" />
                    Licitações em {estadoSelecionado}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({licEstado.length})
                    </span>
                  </span>
                  {panels.licitacoes ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {panels.licitacoes && (
                  <CardContent className="pt-0">
                    {licEstado.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma licitação encontrada.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
                )}
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-muted/30 border-0">
                <CardContent className="p-8 text-center">
                  <Info size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">Selecione um estado</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique em qualquer estado no mapa para ver indicadores, alertas e licitações.
                  </p>
                </CardContent>
              </Card>

              {/* ── Quick Stats ── */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    Alertas Ativos
                  </h4>
                  <div className="space-y-2">
                    {alertasMeteorologicos
                      .filter((a) => a.nivel === "vermelho")
                      .slice(0, 3)
                      .map((a) => (
                        <div key={a.id} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          <span className="truncate">{a.titulo}</span>
                        </div>
                      ))}
                    {alertasMeteorologicos
                      .filter((a) => a.nivel === "laranja")
                      .slice(0, 3)
                      .map((a) => (
                        <div key={a.id} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                          <span className="truncate">{a.titulo}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Estações Críticas */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Gauge size={13} />
                    Estações em Estado Crítico
                  </h4>
                  <div className="space-y-2">
                    {estacoesANA
                      .filter((e) => e.status === "critico" || e.status === "alerta")
                      .map((e) => (
                        <div key={e.id} className="flex items-center gap-2 text-xs">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: statusCores[e.status] }}
                          />
                          <span className="truncate flex-1">{e.nome}</span>
                          <span className="text-muted-foreground capitalize text-[0.6rem]">
                            {e.status === "critico" ? "crítico" : e.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Resumo Nacional ── */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Resumo Nacional
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-500/5 text-center">
                  <p className="text-lg font-extrabold text-blue-600">{licitacoes.length}</p>
                  <p className="text-[0.6rem] text-muted-foreground">Licitações</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 text-center">
                  <p className="text-lg font-extrabold text-emerald-600">{estacoesTratamento.length}</p>
                  <p className="text-[0.6rem] text-muted-foreground">ETAs/ETEs</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/5 text-center">
                  <p className="text-lg font-extrabold text-red-600">{alertasMeteorologicos.length}</p>
                  <p className="text-[0.6rem] text-muted-foreground">Alertas</p>
                </div>
                <div className="p-3 rounded-lg bg-sky-500/5 text-center">
                  <p className="text-lg font-extrabold text-sky-600">{estacoesANA.length}</p>
                  <p className="text-[0.6rem] text-muted-foreground">Estações ANA</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Volume total</span>
                  <span className="font-bold text-primary">
                    {formatarValor(licitacoes.reduce((a, l) => a + (l.valor_estimado || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Bacias hidrográficas</span>
                  <span className="font-bold">{baciasHidrograficas.length}</span>
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
