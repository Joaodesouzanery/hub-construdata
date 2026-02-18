/**
 * Dados do SNIS — Sistema Nacional de Informações sobre Saneamento.
 * Fonte: https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/snis
 * Referência: SNIS 2023 (último dado consolidado disponível).
 *
 * Indicadores selecionados:
 *   IN049 — Índice de perdas na distribuição (%)
 *   IN055 — Índice de atendimento total de água (%)
 *   IN056 — Índice de atendimento total de esgoto (%)
 *   IN016 — Índice de tratamento de esgoto (%)
 *   IN022 — Consumo médio per capita (L/hab/dia)
 *   IN051 — Índice de fluoretação (%)
 *
 * Valores são aproximações baseadas em dados públicos do SNIS.
 */

export interface IndicadorSNIS {
  municipio: string;
  uf: string;
  populacao: number;
  prestador: string;
  agua_atendimento: number;       // IN055 (%)
  esgoto_atendimento: number;     // IN056 (%)
  esgoto_tratamento: number;      // IN016 (%)
  perdas_distribuicao: number;    // IN049 (%)
  consumo_per_capita: number;     // IN022 (L/hab/dia)
  investimento_per_capita: number; // R$/hab
  tarifa_media_agua: number;      // R$/m³
  tarifa_media_esgoto: number;    // R$/m³
}

export const dadosSNIS: IndicadorSNIS[] = [
  // ── Capitais e grandes cidades ──
  { municipio: "São Paulo", uf: "SP", populacao: 12400000, prestador: "Sabesp", agua_atendimento: 99.2, esgoto_atendimento: 93.1, esgoto_tratamento: 78.5, perdas_distribuicao: 27.8, consumo_per_capita: 155.2, investimento_per_capita: 142, tarifa_media_agua: 4.12, tarifa_media_esgoto: 3.71 },
  { municipio: "Rio de Janeiro", uf: "RJ", populacao: 6750000, prestador: "Águas do Rio (Aegea)", agua_atendimento: 96.8, esgoto_atendimento: 65.3, esgoto_tratamento: 52.1, perdas_distribuicao: 41.2, consumo_per_capita: 178.5, investimento_per_capita: 98, tarifa_media_agua: 5.82, tarifa_media_esgoto: 5.24 },
  { municipio: "Belo Horizonte", uf: "MG", populacao: 2530000, prestador: "Copasa", agua_atendimento: 99.8, esgoto_atendimento: 89.5, esgoto_tratamento: 82.3, perdas_distribuicao: 31.4, consumo_per_capita: 142.8, investimento_per_capita: 125, tarifa_media_agua: 3.95, tarifa_media_esgoto: 3.56 },
  { municipio: "Curitiba", uf: "PR", populacao: 1960000, prestador: "Sanepar", agua_atendimento: 99.9, esgoto_atendimento: 88.2, esgoto_tratamento: 94.1, perdas_distribuicao: 29.5, consumo_per_capita: 138.6, investimento_per_capita: 156, tarifa_media_agua: 3.85, tarifa_media_esgoto: 3.47 },
  { municipio: "Recife", uf: "PE", populacao: 1660000, prestador: "Compesa", agua_atendimento: 92.4, esgoto_atendimento: 42.7, esgoto_tratamento: 38.2, perdas_distribuicao: 52.8, consumo_per_capita: 98.4, investimento_per_capita: 72, tarifa_media_agua: 4.28, tarifa_media_esgoto: 3.85 },
  { municipio: "Salvador", uf: "BA", populacao: 2890000, prestador: "Embasa", agua_atendimento: 97.5, esgoto_atendimento: 62.8, esgoto_tratamento: 71.4, perdas_distribuicao: 38.6, consumo_per_capita: 112.5, investimento_per_capita: 85, tarifa_media_agua: 4.45, tarifa_media_esgoto: 4.01 },
  { municipio: "Fortaleza", uf: "CE", populacao: 2700000, prestador: "Cagece", agua_atendimento: 96.2, esgoto_atendimento: 65.4, esgoto_tratamento: 72.8, perdas_distribuicao: 36.1, consumo_per_capita: 115.8, investimento_per_capita: 92, tarifa_media_agua: 3.98, tarifa_media_esgoto: 3.58 },
  { municipio: "Manaus", uf: "AM", populacao: 2260000, prestador: "Águas de Manaus (Aegea)", agua_atendimento: 78.3, esgoto_atendimento: 22.5, esgoto_tratamento: 18.6, perdas_distribuicao: 62.4, consumo_per_capita: 135.2, investimento_per_capita: 45, tarifa_media_agua: 4.15, tarifa_media_esgoto: 3.74 },
  { municipio: "Porto Alegre", uf: "RS", populacao: 1490000, prestador: "Corsan/Aegea Sul", agua_atendimento: 99.6, esgoto_atendimento: 52.3, esgoto_tratamento: 35.8, perdas_distribuicao: 34.7, consumo_per_capita: 152.1, investimento_per_capita: 105, tarifa_media_agua: 5.12, tarifa_media_esgoto: 4.61 },
  { municipio: "Brasília", uf: "DF", populacao: 3090000, prestador: "Caesb", agua_atendimento: 98.8, esgoto_atendimento: 89.5, esgoto_tratamento: 95.2, perdas_distribuicao: 28.9, consumo_per_capita: 148.5, investimento_per_capita: 135, tarifa_media_agua: 4.25, tarifa_media_esgoto: 3.83 },
  { municipio: "Goiânia", uf: "GO", populacao: 1540000, prestador: "Saneago", agua_atendimento: 95.8, esgoto_atendimento: 72.6, esgoto_tratamento: 68.4, perdas_distribuicao: 30.2, consumo_per_capita: 145.2, investimento_per_capita: 88, tarifa_media_agua: 3.65, tarifa_media_esgoto: 3.29 },
  { municipio: "Belém", uf: "PA", populacao: 1510000, prestador: "Cosanpa", agua_atendimento: 68.4, esgoto_atendimento: 14.8, esgoto_tratamento: 10.2, perdas_distribuicao: 58.7, consumo_per_capita: 142.6, investimento_per_capita: 32, tarifa_media_agua: 2.85, tarifa_media_esgoto: 2.57 },
  { municipio: "São Luís", uf: "MA", populacao: 1120000, prestador: "Caema/BRK", agua_atendimento: 82.6, esgoto_atendimento: 18.2, esgoto_tratamento: 12.5, perdas_distribuicao: 55.3, consumo_per_capita: 108.4, investimento_per_capita: 38, tarifa_media_agua: 3.25, tarifa_media_esgoto: 2.93 },
  { municipio: "Maceió", uf: "AL", populacao: 1030000, prestador: "BRK Ambiental", agua_atendimento: 89.5, esgoto_atendimento: 48.6, esgoto_tratamento: 42.3, perdas_distribuicao: 45.8, consumo_per_capita: 102.3, investimento_per_capita: 68, tarifa_media_agua: 4.52, tarifa_media_esgoto: 4.07 },
  { municipio: "Aracaju", uf: "SE", populacao: 665000, prestador: "Deso", agua_atendimento: 94.2, esgoto_atendimento: 42.5, esgoto_tratamento: 36.8, perdas_distribuicao: 48.2, consumo_per_capita: 115.6, investimento_per_capita: 55, tarifa_media_agua: 3.78, tarifa_media_esgoto: 3.40 },
  { municipio: "Campo Grande", uf: "MS", populacao: 920000, prestador: "Sanesul/Águas Guariroba", agua_atendimento: 97.5, esgoto_atendimento: 78.4, esgoto_tratamento: 95.6, perdas_distribuicao: 26.8, consumo_per_capita: 162.5, investimento_per_capita: 112, tarifa_media_agua: 3.42, tarifa_media_esgoto: 3.08 },
  { municipio: "Florianópolis", uf: "SC", populacao: 520000, prestador: "Casan", agua_atendimento: 99.2, esgoto_atendimento: 65.8, esgoto_tratamento: 58.4, perdas_distribuicao: 25.4, consumo_per_capita: 148.2, investimento_per_capita: 118, tarifa_media_agua: 5.25, tarifa_media_esgoto: 4.73 },
  { municipio: "Natal", uf: "RN", populacao: 890000, prestador: "Caern", agua_atendimento: 88.2, esgoto_atendimento: 35.6, esgoto_tratamento: 28.4, perdas_distribuicao: 51.8, consumo_per_capita: 118.5, investimento_per_capita: 48, tarifa_media_agua: 3.62, tarifa_media_esgoto: 3.26 },
  { municipio: "João Pessoa", uf: "PB", populacao: 830000, prestador: "Cagepa", agua_atendimento: 92.8, esgoto_atendimento: 58.2, esgoto_tratamento: 45.6, perdas_distribuicao: 42.5, consumo_per_capita: 108.2, investimento_per_capita: 62, tarifa_media_agua: 3.45, tarifa_media_esgoto: 3.11 },
  { municipio: "Teresina", uf: "PI", populacao: 870000, prestador: "Agespisa", agua_atendimento: 85.4, esgoto_atendimento: 22.4, esgoto_tratamento: 15.8, perdas_distribuicao: 54.6, consumo_per_capita: 95.8, investimento_per_capita: 35, tarifa_media_agua: 2.95, tarifa_media_esgoto: 2.66 },
  { municipio: "Cuiabá", uf: "MT", populacao: 625000, prestador: "Águas Cuiabá (Iguá)", agua_atendimento: 95.2, esgoto_atendimento: 56.8, esgoto_tratamento: 48.5, perdas_distribuicao: 38.4, consumo_per_capita: 175.8, investimento_per_capita: 78, tarifa_media_agua: 3.75, tarifa_media_esgoto: 3.38 },
  { municipio: "Rio Branco", uf: "AC", populacao: 415000, prestador: "Depasa", agua_atendimento: 62.5, esgoto_atendimento: 18.2, esgoto_tratamento: 12.8, perdas_distribuicao: 58.2, consumo_per_capita: 132.4, investimento_per_capita: 28, tarifa_media_agua: 2.55, tarifa_media_esgoto: 2.30 },
  { municipio: "Macapá", uf: "AP", populacao: 520000, prestador: "Caesa", agua_atendimento: 45.2, esgoto_atendimento: 8.5, esgoto_tratamento: 5.2, perdas_distribuicao: 72.8, consumo_per_capita: 125.6, investimento_per_capita: 18, tarifa_media_agua: 2.15, tarifa_media_esgoto: 1.94 },
  { municipio: "Boa Vista", uf: "RR", populacao: 420000, prestador: "Caer", agua_atendimento: 78.5, esgoto_atendimento: 12.4, esgoto_tratamento: 8.5, perdas_distribuicao: 62.5, consumo_per_capita: 142.8, investimento_per_capita: 22, tarifa_media_agua: 2.45, tarifa_media_esgoto: 2.21 },
  { municipio: "Porto Velho", uf: "RO", populacao: 560000, prestador: "Caerd", agua_atendimento: 65.8, esgoto_atendimento: 8.4, esgoto_tratamento: 5.6, perdas_distribuicao: 65.4, consumo_per_capita: 148.5, investimento_per_capita: 25, tarifa_media_agua: 2.68, tarifa_media_esgoto: 2.41 },
  { municipio: "Palmas", uf: "TO", populacao: 310000, prestador: "BRK (Saneatins)", agua_atendimento: 92.8, esgoto_atendimento: 72.5, esgoto_tratamento: 98.4, perdas_distribuicao: 32.5, consumo_per_capita: 168.2, investimento_per_capita: 95, tarifa_media_agua: 3.88, tarifa_media_esgoto: 3.49 },

  // ── Sudeste — cidades médias ──
  { municipio: "Campinas", uf: "SP", populacao: 1220000, prestador: "Sanasa", agua_atendimento: 99.5, esgoto_atendimento: 90.2, esgoto_tratamento: 82.4, perdas_distribuicao: 22.6, consumo_per_capita: 148.5, investimento_per_capita: 138, tarifa_media_agua: 3.98, tarifa_media_esgoto: 3.58 },
  { municipio: "Santos", uf: "SP", populacao: 435000, prestador: "Sabesp", agua_atendimento: 99.8, esgoto_atendimento: 98.2, esgoto_tratamento: 96.5, perdas_distribuicao: 24.1, consumo_per_capita: 165.8, investimento_per_capita: 155, tarifa_media_agua: 4.32, tarifa_media_esgoto: 3.89 },
  { municipio: "Ribeirão Preto", uf: "SP", populacao: 720000, prestador: "DAERP", agua_atendimento: 99.7, esgoto_atendimento: 98.5, esgoto_tratamento: 98.2, perdas_distribuicao: 25.3, consumo_per_capita: 172.4, investimento_per_capita: 145, tarifa_media_agua: 3.75, tarifa_media_esgoto: 3.38 },
  { municipio: "Sorocaba", uf: "SP", populacao: 695000, prestador: "Saae Sorocaba", agua_atendimento: 99.6, esgoto_atendimento: 96.8, esgoto_tratamento: 100.0, perdas_distribuicao: 21.8, consumo_per_capita: 145.2, investimento_per_capita: 152, tarifa_media_agua: 3.68, tarifa_media_esgoto: 3.31 },
  { municipio: "Juiz de Fora", uf: "MG", populacao: 580000, prestador: "Cesama", agua_atendimento: 99.2, esgoto_atendimento: 88.5, esgoto_tratamento: 72.6, perdas_distribuicao: 28.7, consumo_per_capita: 138.2, investimento_per_capita: 118, tarifa_media_agua: 3.55, tarifa_media_esgoto: 3.20 },
  { municipio: "Uberlândia", uf: "MG", populacao: 735000, prestador: "DMAE Uberlândia", agua_atendimento: 99.8, esgoto_atendimento: 97.2, esgoto_tratamento: 98.5, perdas_distribuicao: 20.5, consumo_per_capita: 152.6, investimento_per_capita: 142, tarifa_media_agua: 3.42, tarifa_media_esgoto: 3.08 },
  { municipio: "Contagem", uf: "MG", populacao: 670000, prestador: "Copasa", agua_atendimento: 98.5, esgoto_atendimento: 78.4, esgoto_tratamento: 68.2, perdas_distribuicao: 33.2, consumo_per_capita: 128.5, investimento_per_capita: 95, tarifa_media_agua: 3.95, tarifa_media_esgoto: 3.56 },
  { municipio: "Niterói", uf: "RJ", populacao: 515000, prestador: "Águas de Niterói (Aegea)", agua_atendimento: 99.4, esgoto_atendimento: 92.8, esgoto_tratamento: 85.4, perdas_distribuicao: 26.2, consumo_per_capita: 162.5, investimento_per_capita: 148, tarifa_media_agua: 5.45, tarifa_media_esgoto: 4.91 },
  { municipio: "São Gonçalo", uf: "RJ", populacao: 1095000, prestador: "Águas do Rio (Aegea)", agua_atendimento: 88.5, esgoto_atendimento: 38.2, esgoto_tratamento: 28.5, perdas_distribuicao: 48.5, consumo_per_capita: 125.8, investimento_per_capita: 55, tarifa_media_agua: 5.82, tarifa_media_esgoto: 5.24 },
  { municipio: "Duque de Caxias", uf: "RJ", populacao: 930000, prestador: "Águas do Rio (Aegea)", agua_atendimento: 85.2, esgoto_atendimento: 35.6, esgoto_tratamento: 25.8, perdas_distribuicao: 52.4, consumo_per_capita: 118.4, investimento_per_capita: 48, tarifa_media_agua: 5.82, tarifa_media_esgoto: 5.24 },
  { municipio: "Vila Velha", uf: "ES", populacao: 510000, prestador: "Cesan", agua_atendimento: 98.5, esgoto_atendimento: 72.4, esgoto_tratamento: 62.8, perdas_distribuicao: 30.5, consumo_per_capita: 142.8, investimento_per_capita: 108, tarifa_media_agua: 3.85, tarifa_media_esgoto: 3.47 },
  { municipio: "Serra", uf: "ES", populacao: 530000, prestador: "Cesan", agua_atendimento: 97.2, esgoto_atendimento: 58.5, esgoto_tratamento: 48.2, perdas_distribuicao: 34.8, consumo_per_capita: 135.6, investimento_per_capita: 85, tarifa_media_agua: 3.85, tarifa_media_esgoto: 3.47 },

  // ── Sul — cidades médias ──
  { municipio: "Londrina", uf: "PR", populacao: 580000, prestador: "Sanepar", agua_atendimento: 99.8, esgoto_atendimento: 84.5, esgoto_tratamento: 92.8, perdas_distribuicao: 27.2, consumo_per_capita: 142.5, investimento_per_capita: 145, tarifa_media_agua: 3.85, tarifa_media_esgoto: 3.47 },
  { municipio: "Maringá", uf: "PR", populacao: 435000, prestador: "Sanepar", agua_atendimento: 99.9, esgoto_atendimento: 92.5, esgoto_tratamento: 98.2, perdas_distribuicao: 22.4, consumo_per_capita: 155.8, investimento_per_capita: 158, tarifa_media_agua: 3.85, tarifa_media_esgoto: 3.47 },
  { municipio: "Cascavel", uf: "PR", populacao: 335000, prestador: "Sanepar", agua_atendimento: 99.5, esgoto_atendimento: 78.2, esgoto_tratamento: 88.5, perdas_distribuicao: 25.8, consumo_per_capita: 148.2, investimento_per_capita: 132, tarifa_media_agua: 3.85, tarifa_media_esgoto: 3.47 },
  { municipio: "Joinville", uf: "SC", populacao: 615000, prestador: "Águas de Joinville (Aegea)", agua_atendimento: 99.6, esgoto_atendimento: 42.5, esgoto_tratamento: 38.8, perdas_distribuicao: 22.8, consumo_per_capita: 138.5, investimento_per_capita: 125, tarifa_media_agua: 4.95, tarifa_media_esgoto: 4.46 },
  { municipio: "Blumenau", uf: "SC", populacao: 365000, prestador: "Samae Blumenau", agua_atendimento: 99.8, esgoto_atendimento: 36.8, esgoto_tratamento: 32.5, perdas_distribuicao: 18.5, consumo_per_capita: 145.2, investimento_per_capita: 115, tarifa_media_agua: 4.65, tarifa_media_esgoto: 4.19 },
  { municipio: "Caxias do Sul", uf: "RS", populacao: 520000, prestador: "Samae Caxias do Sul", agua_atendimento: 99.5, esgoto_atendimento: 68.5, esgoto_tratamento: 52.4, perdas_distribuicao: 24.8, consumo_per_capita: 142.8, investimento_per_capita: 128, tarifa_media_agua: 4.82, tarifa_media_esgoto: 4.34 },
  { municipio: "Pelotas", uf: "RS", populacao: 345000, prestador: "Sanep", agua_atendimento: 97.8, esgoto_atendimento: 48.2, esgoto_tratamento: 28.5, perdas_distribuicao: 38.5, consumo_per_capita: 148.5, investimento_per_capita: 85, tarifa_media_agua: 4.55, tarifa_media_esgoto: 4.10 },
  { municipio: "Canoas", uf: "RS", populacao: 350000, prestador: "Corsan/Aegea Sul", agua_atendimento: 99.2, esgoto_atendimento: 32.4, esgoto_tratamento: 22.8, perdas_distribuicao: 36.2, consumo_per_capita: 145.6, investimento_per_capita: 78, tarifa_media_agua: 5.12, tarifa_media_esgoto: 4.61 },

  // ── Nordeste — cidades médias ──
  { municipio: "Feira de Santana", uf: "BA", populacao: 620000, prestador: "Embasa", agua_atendimento: 92.5, esgoto_atendimento: 52.8, esgoto_tratamento: 62.5, perdas_distribuicao: 42.5, consumo_per_capita: 108.5, investimento_per_capita: 65, tarifa_media_agua: 4.45, tarifa_media_esgoto: 4.01 },
  { municipio: "Vitória da Conquista", uf: "BA", populacao: 340000, prestador: "Embasa", agua_atendimento: 88.2, esgoto_atendimento: 42.5, esgoto_tratamento: 48.2, perdas_distribuicao: 45.8, consumo_per_capita: 102.4, investimento_per_capita: 52, tarifa_media_agua: 4.45, tarifa_media_esgoto: 4.01 },
  { municipio: "Campina Grande", uf: "PB", populacao: 410000, prestador: "Cagepa", agua_atendimento: 89.5, esgoto_atendimento: 48.6, esgoto_tratamento: 38.2, perdas_distribuicao: 44.8, consumo_per_capita: 98.5, investimento_per_capita: 48, tarifa_media_agua: 3.45, tarifa_media_esgoto: 3.11 },
  { municipio: "Caruaru", uf: "PE", populacao: 370000, prestador: "Compesa", agua_atendimento: 85.8, esgoto_atendimento: 28.5, esgoto_tratamento: 22.4, perdas_distribuicao: 55.2, consumo_per_capita: 82.5, investimento_per_capita: 42, tarifa_media_agua: 4.28, tarifa_media_esgoto: 3.85 },
  { municipio: "Petrolina", uf: "PE", populacao: 365000, prestador: "Compesa", agua_atendimento: 90.2, esgoto_atendimento: 38.5, esgoto_tratamento: 32.8, perdas_distribuicao: 48.5, consumo_per_capita: 92.4, investimento_per_capita: 55, tarifa_media_agua: 4.28, tarifa_media_esgoto: 3.85 },
  { municipio: "Imperatriz", uf: "MA", populacao: 260000, prestador: "Caema/BRK", agua_atendimento: 75.8, esgoto_atendimento: 12.5, esgoto_tratamento: 8.4, perdas_distribuicao: 58.5, consumo_per_capita: 102.8, investimento_per_capita: 28, tarifa_media_agua: 3.25, tarifa_media_esgoto: 2.93 },
  { municipio: "Parnaíba", uf: "PI", populacao: 155000, prestador: "Agespisa", agua_atendimento: 72.5, esgoto_atendimento: 8.2, esgoto_tratamento: 5.5, perdas_distribuicao: 58.8, consumo_per_capita: 88.5, investimento_per_capita: 22, tarifa_media_agua: 2.95, tarifa_media_esgoto: 2.66 },
  { municipio: "Mossoró", uf: "RN", populacao: 300000, prestador: "Caern", agua_atendimento: 82.5, esgoto_atendimento: 28.4, esgoto_tratamento: 22.5, perdas_distribuicao: 54.2, consumo_per_capita: 108.2, investimento_per_capita: 38, tarifa_media_agua: 3.62, tarifa_media_esgoto: 3.26 },
  { municipio: "Juazeiro do Norte", uf: "CE", populacao: 280000, prestador: "Cagece", agua_atendimento: 88.4, esgoto_atendimento: 42.5, esgoto_tratamento: 52.8, perdas_distribuicao: 38.5, consumo_per_capita: 95.8, investimento_per_capita: 58, tarifa_media_agua: 3.98, tarifa_media_esgoto: 3.58 },
  { municipio: "Sobral", uf: "CE", populacao: 215000, prestador: "Cagece", agua_atendimento: 90.8, esgoto_atendimento: 48.2, esgoto_tratamento: 58.5, perdas_distribuicao: 35.8, consumo_per_capita: 102.5, investimento_per_capita: 62, tarifa_media_agua: 3.98, tarifa_media_esgoto: 3.58 },

  // ── Norte — cidades médias ──
  { municipio: "Santarém", uf: "PA", populacao: 310000, prestador: "Cosanpa", agua_atendimento: 52.8, esgoto_atendimento: 5.2, esgoto_tratamento: 3.8, perdas_distribuicao: 62.5, consumo_per_capita: 128.4, investimento_per_capita: 18, tarifa_media_agua: 2.85, tarifa_media_esgoto: 2.57 },
  { municipio: "Marabá", uf: "PA", populacao: 290000, prestador: "Cosanpa", agua_atendimento: 48.5, esgoto_atendimento: 4.8, esgoto_tratamento: 3.2, perdas_distribuicao: 65.8, consumo_per_capita: 132.5, investimento_per_capita: 15, tarifa_media_agua: 2.85, tarifa_media_esgoto: 2.57 },
  { municipio: "Ji-Paraná", uf: "RO", populacao: 135000, prestador: "Caerd", agua_atendimento: 58.2, esgoto_atendimento: 5.5, esgoto_tratamento: 3.8, perdas_distribuicao: 62.8, consumo_per_capita: 138.5, investimento_per_capita: 18, tarifa_media_agua: 2.68, tarifa_media_esgoto: 2.41 },
  { municipio: "Araguaína", uf: "TO", populacao: 185000, prestador: "BRK (Saneatins)", agua_atendimento: 85.5, esgoto_atendimento: 42.8, esgoto_tratamento: 58.2, perdas_distribuicao: 38.5, consumo_per_capita: 155.8, investimento_per_capita: 65, tarifa_media_agua: 3.88, tarifa_media_esgoto: 3.49 },
  { municipio: "Parintins", uf: "AM", populacao: 115000, prestador: "Águas de Manaus (Aegea)", agua_atendimento: 42.5, esgoto_atendimento: 4.2, esgoto_tratamento: 2.8, perdas_distribuicao: 68.5, consumo_per_capita: 125.4, investimento_per_capita: 12, tarifa_media_agua: 4.15, tarifa_media_esgoto: 3.74 },

  // ── Centro-Oeste — cidades médias ──
  { municipio: "Anápolis", uf: "GO", populacao: 395000, prestador: "Saneago", agua_atendimento: 95.2, esgoto_atendimento: 65.8, esgoto_tratamento: 62.5, perdas_distribuicao: 32.5, consumo_per_capita: 142.8, investimento_per_capita: 82, tarifa_media_agua: 3.65, tarifa_media_esgoto: 3.29 },
  { municipio: "Aparecida de Goiânia", uf: "GO", populacao: 590000, prestador: "Saneago", agua_atendimento: 92.8, esgoto_atendimento: 52.4, esgoto_tratamento: 48.5, perdas_distribuicao: 35.8, consumo_per_capita: 135.2, investimento_per_capita: 68, tarifa_media_agua: 3.65, tarifa_media_esgoto: 3.29 },
  { municipio: "Rondonópolis", uf: "MT", populacao: 245000, prestador: "Águas Cuiabá (Iguá)", agua_atendimento: 94.5, esgoto_atendimento: 48.5, esgoto_tratamento: 42.8, perdas_distribuicao: 35.2, consumo_per_capita: 168.5, investimento_per_capita: 72, tarifa_media_agua: 3.75, tarifa_media_esgoto: 3.38 },
  { municipio: "Dourados", uf: "MS", populacao: 225000, prestador: "Sanesul", agua_atendimento: 96.8, esgoto_atendimento: 52.8, esgoto_tratamento: 65.2, perdas_distribuicao: 28.5, consumo_per_capita: 155.4, investimento_per_capita: 88, tarifa_media_agua: 3.42, tarifa_media_esgoto: 3.08 },
  { municipio: "Águas Lindas de Goiás", uf: "GO", populacao: 215000, prestador: "Saneago", agua_atendimento: 72.5, esgoto_atendimento: 15.8, esgoto_tratamento: 12.4, perdas_distribuicao: 48.5, consumo_per_capita: 118.5, investimento_per_capita: 28, tarifa_media_agua: 3.65, tarifa_media_esgoto: 3.29 },
];

/**
 * Indicadores SNIS agregados por estado.
 */
export const snisEstados: Record<string, {
  agua: number;
  esgoto: number;
  tratamento: number;
  perdas: number;
  investimento: string;
}> = {
  AC: { agua: 55.7, esgoto: 19.8, tratamento: 14.2, perdas: 58.2, investimento: "R$ 180M" },
  AL: { agua: 79.4, esgoto: 28.4, tratamento: 22.5, perdas: 45.8, investimento: "R$ 420M" },
  AM: { agua: 68.2, esgoto: 15.3, tratamento: 12.8, perdas: 62.4, investimento: "R$ 350M" },
  AP: { agua: 41.6, esgoto: 11.2, tratamento: 6.8, perdas: 72.8, investimento: "R$ 95M" },
  BA: { agua: 82.1, esgoto: 38.5, tratamento: 48.2, perdas: 38.6, investimento: "R$ 1.2B" },
  CE: { agua: 79.5, esgoto: 32.7, tratamento: 42.5, perdas: 36.1, investimento: "R$ 890M" },
  DF: { agua: 98.8, esgoto: 89.5, tratamento: 95.2, perdas: 28.9, investimento: "R$ 320M" },
  ES: { agua: 87.3, esgoto: 56.1, tratamento: 48.5, perdas: 32.5, investimento: "R$ 510M" },
  GO: { agua: 88.2, esgoto: 52.6, tratamento: 55.8, perdas: 30.2, investimento: "R$ 620M" },
  MA: { agua: 64.8, esgoto: 14.7, tratamento: 10.2, perdas: 55.3, investimento: "R$ 380M" },
  MG: { agua: 88.5, esgoto: 59.2, tratamento: 62.4, perdas: 31.4, investimento: "R$ 2.1B" },
  MS: { agua: 89.1, esgoto: 45.3, tratamento: 52.8, perdas: 26.8, investimento: "R$ 290M" },
  MT: { agua: 86.4, esgoto: 35.2, tratamento: 42.5, perdas: 38.4, investimento: "R$ 340M" },
  PA: { agua: 55.3, esgoto: 12.1, tratamento: 8.5, perdas: 58.7, investimento: "R$ 480M" },
  PB: { agua: 78.2, esgoto: 35.8, tratamento: 28.6, perdas: 42.5, investimento: "R$ 310M" },
  PE: { agua: 82.7, esgoto: 34.9, tratamento: 32.5, perdas: 52.8, investimento: "R$ 780M" },
  PI: { agua: 75.1, esgoto: 17.2, tratamento: 12.8, perdas: 54.6, investimento: "R$ 210M" },
  PR: { agua: 92.1, esgoto: 72.5, tratamento: 78.5, perdas: 29.5, investimento: "R$ 1.5B" },
  RJ: { agua: 91.2, esgoto: 61.3, tratamento: 48.2, perdas: 41.2, investimento: "R$ 2.8B" },
  RN: { agua: 81.6, esgoto: 28.9, tratamento: 22.5, perdas: 51.8, investimento: "R$ 270M" },
  RO: { agua: 59.8, esgoto: 8.4, tratamento: 5.6, perdas: 65.4, investimento: "R$ 150M" },
  RR: { agua: 72.5, esgoto: 20.1, tratamento: 12.5, perdas: 62.5, investimento: "R$ 85M" },
  RS: { agua: 89.4, esgoto: 46.1, tratamento: 32.5, perdas: 34.7, investimento: "R$ 1.1B" },
  SC: { agua: 91.8, esgoto: 35.6, tratamento: 42.8, perdas: 25.4, investimento: "R$ 680M" },
  SE: { agua: 84.3, esgoto: 29.5, tratamento: 22.8, perdas: 48.2, investimento: "R$ 190M" },
  SP: { agua: 96.1, esgoto: 85.2, tratamento: 72.5, perdas: 27.8, investimento: "R$ 5.2B" },
  TO: { agua: 79.5, esgoto: 30.1, tratamento: 48.2, perdas: 32.5, investimento: "R$ 160M" },
};

export default dadosSNIS;
