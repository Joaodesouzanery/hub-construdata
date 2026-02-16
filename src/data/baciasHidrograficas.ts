/**
 * Bacias Hidrográficas do Brasil — 12 regiões hidrográficas (ANA)
 * Polígonos simplificados para visualização no mapa.
 * Fonte: Agência Nacional de Águas e Saneamento Básico (ANA)
 */

export interface BaciaHidrografica {
  id: string;
  nome: string;
  area_km2: number;
  estados: string[];
  cor: string;
  vazao_media_m3s: number;
  populacao_milhoes: number;
  percentual_territorio: number;
  /** Simplified centroid [lng, lat] for label placement */
  centroid: [number, number];
  /** Simplified polygon coordinates for GeoJSON rendering */
  coordinates: [number, number][];
}

export const baciasHidrograficas: BaciaHidrografica[] = [
  {
    id: "amazonica",
    nome: "Amazônica",
    area_km2: 3869953,
    estados: ["AM", "PA", "MT", "RO", "AC", "RR", "AP"],
    cor: "#065f46",
    vazao_media_m3s: 131947,
    populacao_milhoes: 10.5,
    percentual_territorio: 45.4,
    centroid: [-60, -4],
    coordinates: [
      [-74, 2], [-69, 5], [-60, 5], [-52, 4], [-49, 0],
      [-49, -3], [-51, -6], [-54, -8], [-57, -10], [-60, -13],
      [-63, -14], [-67, -12], [-70, -10], [-73, -5], [-74, 2],
    ],
  },
  {
    id: "tocantins-araguaia",
    nome: "Tocantins-Araguaia",
    area_km2: 921921,
    estados: ["TO", "GO", "PA", "MA", "MT", "DF"],
    cor: "#0d9488",
    vazao_media_m3s: 13624,
    populacao_milhoes: 8.6,
    percentual_territorio: 10.8,
    centroid: [-49, -10],
    coordinates: [
      [-49, -1], [-47, -2], [-46, -5], [-46, -8], [-47, -12],
      [-48, -15], [-50, -16], [-52, -14], [-52, -10], [-51, -6],
      [-49, -1],
    ],
  },
  {
    id: "sao-francisco",
    nome: "São Francisco",
    area_km2: 638576,
    estados: ["MG", "BA", "PE", "AL", "SE", "GO", "DF"],
    cor: "#0284c7",
    vazao_media_m3s: 2846,
    populacao_milhoes: 14.3,
    percentual_territorio: 7.5,
    centroid: [-42, -12],
    coordinates: [
      [-37, -10], [-38, -8], [-40, -8], [-42, -10], [-44, -13],
      [-45, -16], [-44, -19], [-43, -20], [-41, -18], [-40, -15],
      [-38, -12], [-37, -10],
    ],
  },
  {
    id: "parnaiba",
    nome: "Parnaíba",
    area_km2: 333056,
    estados: ["PI", "MA", "CE"],
    cor: "#7c3aed",
    vazao_media_m3s: 763,
    populacao_milhoes: 4.2,
    percentual_territorio: 3.9,
    centroid: [-43, -6],
    coordinates: [
      [-41, -3], [-42, -2], [-44, -3], [-45, -5], [-45, -8],
      [-44, -10], [-42, -9], [-41, -7], [-41, -3],
    ],
  },
  {
    id: "atlantico-nordeste-oriental",
    nome: "Atlântico Nordeste Oriental",
    area_km2: 286802,
    estados: ["CE", "RN", "PB", "PE", "AL"],
    cor: "#ea580c",
    vazao_media_m3s: 779,
    populacao_milhoes: 24.1,
    percentual_territorio: 3.4,
    centroid: [-36.5, -7],
    coordinates: [
      [-35, -3], [-37, -3], [-39, -4], [-40, -6], [-39, -9],
      [-37, -10], [-35, -9], [-34, -7], [-35, -3],
    ],
  },
  {
    id: "atlantico-nordeste-ocidental",
    nome: "Atlântico Nordeste Ocidental",
    area_km2: 274301,
    estados: ["MA", "PA"],
    cor: "#c2410c",
    vazao_media_m3s: 2514,
    populacao_milhoes: 6.3,
    percentual_territorio: 3.2,
    centroid: [-44, -3],
    coordinates: [
      [-44, -1], [-46, -1], [-47, -2], [-47, -5], [-45, -6],
      [-43, -5], [-42, -3], [-43, -1], [-44, -1],
    ],
  },
  {
    id: "atlantico-leste",
    nome: "Atlântico Leste",
    area_km2: 388160,
    estados: ["BA", "MG", "SE", "ES"],
    cor: "#2563eb",
    vazao_media_m3s: 1400,
    populacao_milhoes: 15.1,
    percentual_territorio: 4.6,
    centroid: [-40, -14],
    coordinates: [
      [-38, -10], [-39, -11], [-41, -13], [-42, -16], [-41, -18],
      [-40, -17], [-38, -14], [-37, -12], [-38, -10],
    ],
  },
  {
    id: "atlantico-sudeste",
    nome: "Atlântico Sudeste",
    area_km2: 229972,
    estados: ["MG", "ES", "RJ", "SP", "PR"],
    cor: "#4f46e5",
    vazao_media_m3s: 3170,
    populacao_milhoes: 29.3,
    percentual_territorio: 2.7,
    centroid: [-42, -21],
    coordinates: [
      [-40, -18], [-41, -19], [-43, -20], [-44, -22], [-44, -24],
      [-43, -25], [-41, -23], [-39, -20], [-40, -18],
    ],
  },
  {
    id: "parana",
    nome: "Paraná",
    area_km2: 879873,
    estados: ["SP", "PR", "MG", "GO", "MS", "SC", "DF"],
    cor: "#dc2626",
    vazao_media_m3s: 11453,
    populacao_milhoes: 61.3,
    percentual_territorio: 10.3,
    centroid: [-51, -22],
    coordinates: [
      [-47, -15], [-49, -16], [-51, -18], [-54, -20], [-55, -23],
      [-54, -26], [-52, -27], [-49, -25], [-47, -23],
      [-46, -20], [-47, -15],
    ],
  },
  {
    id: "paraguai",
    nome: "Paraguai",
    area_km2: 363446,
    estados: ["MT", "MS"],
    cor: "#d97706",
    vazao_media_m3s: 2368,
    populacao_milhoes: 2.4,
    percentual_territorio: 4.3,
    centroid: [-57, -18],
    coordinates: [
      [-55, -13], [-57, -14], [-59, -16], [-58, -20], [-57, -23],
      [-56, -24], [-55, -22], [-54, -18], [-55, -13],
    ],
  },
  {
    id: "uruguai",
    nome: "Uruguai",
    area_km2: 174533,
    estados: ["RS", "SC"],
    cor: "#9333ea",
    vazao_media_m3s: 4121,
    populacao_milhoes: 3.8,
    percentual_territorio: 2.0,
    centroid: [-52, -28],
    coordinates: [
      [-50, -26], [-51, -27], [-53, -27], [-55, -28], [-55, -30],
      [-54, -31], [-52, -30], [-50, -28], [-50, -26],
    ],
  },
  {
    id: "atlantico-sul",
    nome: "Atlântico Sul",
    area_km2: 187522,
    estados: ["PR", "SC", "RS"],
    cor: "#be185d",
    vazao_media_m3s: 710,
    populacao_milhoes: 13.3,
    percentual_territorio: 2.2,
    centroid: [-49, -28],
    coordinates: [
      [-48, -25], [-49, -26], [-50, -27], [-50, -29], [-51, -31],
      [-50, -33], [-48, -32], [-47, -29], [-48, -25],
    ],
  },
];

/** Convert bacias to GeoJSON FeatureCollection */
export function baciasToGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: baciasHidrograficas.map((b) => ({
      type: "Feature" as const,
      properties: {
        id: b.id,
        nome: b.nome,
        area_km2: b.area_km2,
        estados: b.estados.join(", "),
        cor: b.cor,
        vazao_media_m3s: b.vazao_media_m3s,
        populacao_milhoes: b.populacao_milhoes,
        percentual_territorio: b.percentual_territorio,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [b.coordinates],
      },
    })),
  };
}

/** Convert bacia centroids to GeoJSON points for labels */
export function baciasLabelsGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: baciasHidrograficas.map((b) => ({
      type: "Feature" as const,
      properties: { nome: b.nome, id: b.id },
      geometry: {
        type: "Point" as const,
        coordinates: b.centroid,
      },
    })),
  };
}
