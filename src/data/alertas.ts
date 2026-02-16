/**
 * Alertas INMET e CEMADEN — alertas meteorológicos e de desastres naturais
 * Dados simulados baseados em padrões reais de alertas no Brasil.
 * Fontes: INMET (Instituto Nacional de Meteorologia), CEMADEN (Centro Nacional
 *         de Monitoramento e Alertas de Desastres Naturais)
 */

export type NivelAlerta = "amarelo" | "laranja" | "vermelho";
export type TipoAlerta = "chuva_intensa" | "inundacao" | "seca" | "vendaval" | "granizo" | "deslizamento" | "onda_calor";
export type FonteAlerta = "INMET" | "CEMADEN";

export interface AlertaMeteorologico {
  id: string;
  tipo: TipoAlerta;
  tipo_label: string;
  nivel: NivelAlerta;
  fonte: FonteAlerta;
  titulo: string;
  descricao: string;
  estado: string;
  municipio: string;
  lat: number;
  lng: number;
  data_emissao: string;
  data_expiracao: string;
  impacto_obras: string;
}

const alertaCores: Record<NivelAlerta, string> = {
  amarelo: "#eab308",
  laranja: "#f97316",
  vermelho: "#ef4444",
};

export { alertaCores };

export const alertasMeteorologicos: AlertaMeteorologico[] = [
  {
    id: "alerta-001",
    tipo: "chuva_intensa",
    tipo_label: "Chuva Intensa",
    nivel: "vermelho",
    fonte: "INMET",
    titulo: "Grande Perigo — Chuva Intensa em SP",
    descricao: "Previsão de chuva > 100mm/h. Risco de alagamentos, transbordamento de rios e deslizamentos.",
    estado: "SP",
    municipio: "São Paulo",
    lat: -23.5505,
    lng: -46.6333,
    data_emissao: "2026-02-16T06:00:00Z",
    data_expiracao: "2026-02-17T06:00:00Z",
    impacto_obras: "Paralisação total de obras a céu aberto. Risco de erosão em fundações.",
  },
  {
    id: "alerta-002",
    tipo: "inundacao",
    tipo_label: "Inundação",
    nivel: "vermelho",
    fonte: "CEMADEN",
    titulo: "Alerta Máximo — Inundação no Vale do Itajaí",
    descricao: "Nível do rio Itajaí-Açu em cota de emergência. Histórico de enchentes severas na região.",
    estado: "SC",
    municipio: "Blumenau",
    lat: -26.9194,
    lng: -49.0661,
    data_emissao: "2026-02-16T03:00:00Z",
    data_expiracao: "2026-02-18T03:00:00Z",
    impacto_obras: "Evacuação de canteiros em áreas ribeirinhas. Revisão de cronogramas de 2-4 semanas.",
  },
  {
    id: "alerta-003",
    tipo: "deslizamento",
    tipo_label: "Deslizamento",
    nivel: "laranja",
    fonte: "CEMADEN",
    titulo: "Perigo — Risco de Deslizamento na Serra Fluminense",
    descricao: "Solo saturado na região serrana. Monitoramento de encostas em Petrópolis e Teresópolis.",
    estado: "RJ",
    municipio: "Petrópolis",
    lat: -22.5049,
    lng: -43.1785,
    data_emissao: "2026-02-16T08:00:00Z",
    data_expiracao: "2026-02-17T20:00:00Z",
    impacto_obras: "Suspensão de obras em encostas e taludes. Reforço de contenções provisórias.",
  },
  {
    id: "alerta-004",
    tipo: "vendaval",
    tipo_label: "Vendaval",
    nivel: "laranja",
    fonte: "INMET",
    titulo: "Perigo — Vendaval no Sul do Brasil",
    descricao: "Ventos de 80-100 km/h previstos para o RS e SC. Possibilidade de granizo isolado.",
    estado: "RS",
    municipio: "Porto Alegre",
    lat: -30.0346,
    lng: -51.2177,
    data_emissao: "2026-02-16T12:00:00Z",
    data_expiracao: "2026-02-17T00:00:00Z",
    impacto_obras: "Recolher equipamentos e estruturas temporárias. Risco para guindaste e andaimes.",
  },
  {
    id: "alerta-005",
    tipo: "seca",
    tipo_label: "Seca Severa",
    nivel: "laranja",
    fonte: "INMET",
    titulo: "Perigo — Seca Prolongada no Nordeste",
    descricao: "Sem chuvas significativas há 45 dias. Açudes abaixo de 30% da capacidade.",
    estado: "CE",
    municipio: "Fortaleza",
    lat: -3.7172,
    lng: -38.5433,
    data_emissao: "2026-02-15T00:00:00Z",
    data_expiracao: "2026-02-28T00:00:00Z",
    impacto_obras: "Escassez hídrica para concretagem e compactação. Busca de fontes alternativas.",
  },
  {
    id: "alerta-006",
    tipo: "chuva_intensa",
    tipo_label: "Chuva Intensa",
    nivel: "amarelo",
    fonte: "INMET",
    titulo: "Alerta — Chuva Moderada em MG",
    descricao: "Previsão de chuva entre 20-50mm/h para a região metropolitana de BH.",
    estado: "MG",
    municipio: "Belo Horizonte",
    lat: -19.9167,
    lng: -43.9345,
    data_emissao: "2026-02-16T14:00:00Z",
    data_expiracao: "2026-02-17T02:00:00Z",
    impacto_obras: "Monitoramento contínuo. Proteger áreas escavadas e estoques de materiais.",
  },
  {
    id: "alerta-007",
    tipo: "inundacao",
    tipo_label: "Inundação",
    nivel: "laranja",
    fonte: "CEMADEN",
    titulo: "Perigo — Cheia do Rio Negro em Manaus",
    descricao: "Rio Negro acima de 28m. Previsão de cheia histórica nas próximas semanas.",
    estado: "AM",
    municipio: "Manaus",
    lat: -3.1190,
    lng: -60.0217,
    data_emissao: "2026-02-15T06:00:00Z",
    data_expiracao: "2026-02-22T06:00:00Z",
    impacto_obras: "Obras portuárias e ribeirinhas paralisadas. Logística de materiais comprometida.",
  },
  {
    id: "alerta-008",
    tipo: "onda_calor",
    tipo_label: "Onda de Calor",
    nivel: "amarelo",
    fonte: "INMET",
    titulo: "Alerta — Onda de Calor no Centro-Oeste",
    descricao: "Temperaturas acima de 40°C por 5+ dias consecutivos em Goiás e Mato Grosso.",
    estado: "GO",
    municipio: "Goiânia",
    lat: -16.6869,
    lng: -49.2648,
    data_emissao: "2026-02-16T00:00:00Z",
    data_expiracao: "2026-02-21T00:00:00Z",
    impacto_obras: "Reduzir jornada ao ar livre (NR-21). Hidratar equipes. Concreto requer cura úmida reforçada.",
  },
  {
    id: "alerta-009",
    tipo: "chuva_intensa",
    tipo_label: "Chuva Intensa",
    nivel: "amarelo",
    fonte: "INMET",
    titulo: "Alerta — Chuvas na Região Metropolitana de Recife",
    descricao: "Previsão de chuvas de 30-50mm/h. Possibilidade de alagamentos pontuais.",
    estado: "PE",
    municipio: "Recife",
    lat: -8.0476,
    lng: -34.8770,
    data_emissao: "2026-02-16T10:00:00Z",
    data_expiracao: "2026-02-17T10:00:00Z",
    impacto_obras: "Atenção a obras em áreas de morros. Proteger instalações elétricas expostas.",
  },
  {
    id: "alerta-010",
    tipo: "granizo",
    tipo_label: "Granizo",
    nivel: "laranja",
    fonte: "INMET",
    titulo: "Perigo — Possibilidade de Granizo no PR",
    descricao: "Instabilidade atmosférica severa. Possibilidade de pedras de granizo de até 3cm.",
    estado: "PR",
    municipio: "Londrina",
    lat: -23.3045,
    lng: -51.1696,
    data_emissao: "2026-02-16T15:00:00Z",
    data_expiracao: "2026-02-17T03:00:00Z",
    impacto_obras: "Proteger vidros e acabamentos. Cobrir equipamentos sensíveis. Risco para telhas.",
  },
  {
    id: "alerta-011",
    tipo: "deslizamento",
    tipo_label: "Deslizamento",
    nivel: "vermelho",
    fonte: "CEMADEN",
    titulo: "Grande Perigo — Deslizamento em Salvador",
    descricao: "Chuvas acumuladas > 200mm em 72h. Solo extremamente saturado em encostas urbanas.",
    estado: "BA",
    municipio: "Salvador",
    lat: -12.9714,
    lng: -38.5124,
    data_emissao: "2026-02-16T04:00:00Z",
    data_expiracao: "2026-02-18T04:00:00Z",
    impacto_obras: "Evacuação obrigatória de canteiros em encostas. Suspensão total de terraplenagem.",
  },
  {
    id: "alerta-012",
    tipo: "inundacao",
    tipo_label: "Inundação",
    nivel: "amarelo",
    fonte: "CEMADEN",
    titulo: "Alerta — Elevação do Rio Doce",
    descricao: "Nível do rio subindo 1.5m acima da média. Monitorar áreas de várzea.",
    estado: "ES",
    municipio: "Linhares",
    lat: -19.3911,
    lng: -40.0722,
    data_emissao: "2026-02-16T09:00:00Z",
    data_expiracao: "2026-02-18T09:00:00Z",
    impacto_obras: "Reposicionar canteiros longe de planícies de inundação. Monitorar fundações.",
  },
];

/** Convert alerts to GeoJSON FeatureCollection */
export function alertasToGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: alertasMeteorologicos.map((a) => ({
      type: "Feature" as const,
      properties: {
        id: a.id,
        tipo: a.tipo,
        tipo_label: a.tipo_label,
        nivel: a.nivel,
        fonte: a.fonte,
        titulo: a.titulo,
        descricao: a.descricao,
        estado: a.estado,
        municipio: a.municipio,
        data_emissao: a.data_emissao,
        data_expiracao: a.data_expiracao,
        impacto_obras: a.impacto_obras,
        cor: alertaCores[a.nivel],
      },
      geometry: {
        type: "Point" as const,
        coordinates: [a.lng, a.lat],
      },
    })),
  };
}
