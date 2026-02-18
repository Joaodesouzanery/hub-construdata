/**
 * ============================================================================
 * AVISO LGPD (Lei Geral de Protecao de Dados - Lei 13.709/2018)
 * ============================================================================
 *
 * Os dados contidos neste arquivo sao provenientes exclusivamente de fontes
 * publicas e de acesso aberto, em conformidade com o Art. 7o, inciso III
 * (tratamento pela administracao publica) e Art. 26 da LGPD:
 *
 * - Ministerio das Cidades (MCidades) / Sistema de Habitacao (SISHAB)
 * - Caixa Economica Federal (CEF) - Programa Minha Casa Minha Vida (MCMV)
 * - IBGE - Pesquisa Nacional por Amostra de Domicilios (PNAD Continua)
 * - Fundacao Joao Pinheiro - Estudo do Deficit Habitacional no Brasil
 * - Conselho Administrador do Fundo de Garantia (CAF/FGTS)
 *
 * Nenhum dado pessoal, sensivel ou sigiloso e utilizado. Todos os valores
 * representam agregacoes estaduais de politicas publicas habitacionais.
 * Os numeros sao estimativas baseadas em fontes publicas oficiais e podem
 * conter arredondamentos para fins de apresentacao.
 *
 * Ultima atualizacao referencial: dados consolidados ate 2024.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface HabitacaoEstado {
  /** Sigla da unidade federativa (ex: "SP", "RJ") */
  uf: string;
  /** Nome completo do estado */
  estado: string;
  /** Deficit habitacional estimado (domicilios) - base FJP/PNAD */
  deficit_habitacional: number;
  /** Deficit habitacional como percentual do total de domicilios do estado */
  deficit_percentual: number;
  /** Total de unidades contratadas no MCMV (acumulado historico) */
  unidades_mcmv_contratadas: number;
  /** Total de unidades efetivamente entregues no MCMV */
  unidades_mcmv_entregues: number;
  /** Investimento total acumulado em R$ (MCMV + FAR + FGTS habitacional) */
  investimento_total: number;
  /** Investimento formatado em texto legivel */
  investimento_fmt: string;
  /** Percentual da populacao residente em area urbana */
  populacao_urbana_percentual: number;
  /** Taxa de urbanizacao - razao domicilios urbanos / total */
  taxa_urbanizacao: number;
}

export interface EmpreendimentoMCMV {
  /** Identificador unico do empreendimento */
  id: string;
  /** Nome do empreendimento */
  nome: string;
  /** UF onde esta localizado */
  uf: string;
  /** Municipio */
  municipio: string;
  /** Faixa de renda do MCMV */
  faixa: "Faixa 1" | "Faixa 2" | "Faixa 3";
  /** Quantidade de unidades habitacionais */
  unidades: number;
  /** Valor total do empreendimento em R$ */
  valor_total: number;
  /** Valor total formatado */
  valor_fmt: string;
  /** Status atual da obra */
  status: "Em Obras" | "Entregue" | "Contratado";
  /** Nome da construtora responsavel */
  construtora: string;
  /** Data de contratacao (ISO string YYYY-MM-DD) */
  data_contratacao: string;
}

// ---------------------------------------------------------------------------
// Dados por Estado - Deficit Habitacional e MCMV
// ---------------------------------------------------------------------------

export const habitacaoEstados: HabitacaoEstado[] = [
  {
    uf: "AC",
    estado: "Acre",
    deficit_habitacional: 38_200,
    deficit_percentual: 14.8,
    unidades_mcmv_contratadas: 12_600,
    unidades_mcmv_entregues: 8_400,
    investimento_total: 820_000_000,
    investimento_fmt: "R$ 820 milhoes",
    populacao_urbana_percentual: 73.5,
    taxa_urbanizacao: 72.8,
  },
  {
    uf: "AL",
    estado: "Alagoas",
    deficit_habitacional: 155_000,
    deficit_percentual: 14.1,
    unidades_mcmv_contratadas: 68_500,
    unidades_mcmv_entregues: 52_300,
    investimento_total: 3_800_000_000,
    investimento_fmt: "R$ 3,8 bilhoes",
    populacao_urbana_percentual: 73.6,
    taxa_urbanizacao: 73.2,
  },
  {
    uf: "AM",
    estado: "Amazonas",
    deficit_habitacional: 198_000,
    deficit_percentual: 17.2,
    unidades_mcmv_contratadas: 61_200,
    unidades_mcmv_entregues: 43_600,
    investimento_total: 4_500_000_000,
    investimento_fmt: "R$ 4,5 bilhoes",
    populacao_urbana_percentual: 79.1,
    taxa_urbanizacao: 78.5,
  },
  {
    uf: "AP",
    estado: "Amapa",
    deficit_habitacional: 42_500,
    deficit_percentual: 18.6,
    unidades_mcmv_contratadas: 11_800,
    unidades_mcmv_entregues: 7_800,
    investimento_total: 880_000_000,
    investimento_fmt: "R$ 880 milhoes",
    populacao_urbana_percentual: 89.8,
    taxa_urbanizacao: 89.2,
  },
  {
    uf: "BA",
    estado: "Bahia",
    deficit_habitacional: 621_000,
    deficit_percentual: 12.4,
    unidades_mcmv_contratadas: 234_800,
    unidades_mcmv_entregues: 178_500,
    investimento_total: 16_200_000_000,
    investimento_fmt: "R$ 16,2 bilhoes",
    populacao_urbana_percentual: 72.1,
    taxa_urbanizacao: 71.6,
  },
  {
    uf: "CE",
    estado: "Ceara",
    deficit_habitacional: 358_000,
    deficit_percentual: 12.8,
    unidades_mcmv_contratadas: 162_400,
    unidades_mcmv_entregues: 126_400,
    investimento_total: 10_800_000_000,
    investimento_fmt: "R$ 10,8 bilhoes",
    populacao_urbana_percentual: 75.1,
    taxa_urbanizacao: 74.5,
  },
  {
    uf: "DF",
    estado: "Distrito Federal",
    deficit_habitacional: 128_000,
    deficit_percentual: 13.2,
    unidades_mcmv_contratadas: 42_500,
    unidades_mcmv_entregues: 31_200,
    investimento_total: 5_200_000_000,
    investimento_fmt: "R$ 5,2 bilhoes",
    populacao_urbana_percentual: 96.6,
    taxa_urbanizacao: 96.6,
  },
  {
    uf: "ES",
    estado: "Espirito Santo",
    deficit_habitacional: 132_000,
    deficit_percentual: 10.1,
    unidades_mcmv_contratadas: 62_400,
    unidades_mcmv_entregues: 48_700,
    investimento_total: 4_600_000_000,
    investimento_fmt: "R$ 4,6 bilhoes",
    populacao_urbana_percentual: 83.4,
    taxa_urbanizacao: 83.1,
  },
  {
    uf: "GO",
    estado: "Goias",
    deficit_habitacional: 245_000,
    deficit_percentual: 11.3,
    unidades_mcmv_contratadas: 128_400,
    unidades_mcmv_entregues: 98_300,
    investimento_total: 8_900_000_000,
    investimento_fmt: "R$ 8,9 bilhoes",
    populacao_urbana_percentual: 90.3,
    taxa_urbanizacao: 89.8,
  },
  {
    uf: "MA",
    estado: "Maranhao",
    deficit_habitacional: 412_000,
    deficit_percentual: 19.2,
    unidades_mcmv_contratadas: 145_800,
    unidades_mcmv_entregues: 108_600,
    investimento_total: 9_800_000_000,
    investimento_fmt: "R$ 9,8 bilhoes",
    populacao_urbana_percentual: 63.1,
    taxa_urbanizacao: 62.5,
  },
  {
    uf: "MG",
    estado: "Minas Gerais",
    deficit_habitacional: 682_000,
    deficit_percentual: 9.4,
    unidades_mcmv_contratadas: 318_200,
    unidades_mcmv_entregues: 248_500,
    investimento_total: 24_600_000_000,
    investimento_fmt: "R$ 24,6 bilhoes",
    populacao_urbana_percentual: 85.3,
    taxa_urbanizacao: 84.9,
  },
  {
    uf: "MS",
    estado: "Mato Grosso do Sul",
    deficit_habitacional: 89_000,
    deficit_percentual: 9.8,
    unidades_mcmv_contratadas: 54_600,
    unidades_mcmv_entregues: 42_100,
    investimento_total: 3_700_000_000,
    investimento_fmt: "R$ 3,7 bilhoes",
    populacao_urbana_percentual: 85.6,
    taxa_urbanizacao: 85.1,
  },
  {
    uf: "MT",
    estado: "Mato Grosso",
    deficit_habitacional: 112_000,
    deficit_percentual: 10.2,
    unidades_mcmv_contratadas: 68_200,
    unidades_mcmv_entregues: 51_800,
    investimento_total: 4_900_000_000,
    investimento_fmt: "R$ 4,9 bilhoes",
    populacao_urbana_percentual: 81.8,
    taxa_urbanizacao: 81.3,
  },
  {
    uf: "PA",
    estado: "Para",
    deficit_habitacional: 425_000,
    deficit_percentual: 17.8,
    unidades_mcmv_contratadas: 114_600,
    unidades_mcmv_entregues: 82_400,
    investimento_total: 8_600_000_000,
    investimento_fmt: "R$ 8,6 bilhoes",
    populacao_urbana_percentual: 68.5,
    taxa_urbanizacao: 67.9,
  },
  {
    uf: "PB",
    estado: "Paraiba",
    deficit_habitacional: 162_000,
    deficit_percentual: 12.6,
    unidades_mcmv_contratadas: 74_200,
    unidades_mcmv_entregues: 56_800,
    investimento_total: 4_800_000_000,
    investimento_fmt: "R$ 4,8 bilhoes",
    populacao_urbana_percentual: 75.4,
    taxa_urbanizacao: 74.9,
  },
  {
    uf: "PE",
    estado: "Pernambuco",
    deficit_habitacional: 398_000,
    deficit_percentual: 12.9,
    unidades_mcmv_contratadas: 184_200,
    unidades_mcmv_entregues: 142_600,
    investimento_total: 13_400_000_000,
    investimento_fmt: "R$ 13,4 bilhoes",
    populacao_urbana_percentual: 80.2,
    taxa_urbanizacao: 79.7,
  },
  {
    uf: "PI",
    estado: "Piaui",
    deficit_habitacional: 148_000,
    deficit_percentual: 14.6,
    unidades_mcmv_contratadas: 63_400,
    unidades_mcmv_entregues: 48_200,
    investimento_total: 4_100_000_000,
    investimento_fmt: "R$ 4,1 bilhoes",
    populacao_urbana_percentual: 65.8,
    taxa_urbanizacao: 65.2,
  },
  {
    uf: "PR",
    estado: "Parana",
    deficit_habitacional: 318_000,
    deficit_percentual: 8.4,
    unidades_mcmv_contratadas: 196_800,
    unidades_mcmv_entregues: 152_400,
    investimento_total: 15_800_000_000,
    investimento_fmt: "R$ 15,8 bilhoes",
    populacao_urbana_percentual: 85.3,
    taxa_urbanizacao: 84.9,
  },
  {
    uf: "RJ",
    estado: "Rio de Janeiro",
    deficit_habitacional: 752_000,
    deficit_percentual: 12.1,
    unidades_mcmv_contratadas: 258_400,
    unidades_mcmv_entregues: 198_300,
    investimento_total: 26_800_000_000,
    investimento_fmt: "R$ 26,8 bilhoes",
    populacao_urbana_percentual: 96.7,
    taxa_urbanizacao: 96.4,
  },
  {
    uf: "RN",
    estado: "Rio Grande do Norte",
    deficit_habitacional: 138_000,
    deficit_percentual: 12.2,
    unidades_mcmv_contratadas: 65_800,
    unidades_mcmv_entregues: 51_200,
    investimento_total: 4_200_000_000,
    investimento_fmt: "R$ 4,2 bilhoes",
    populacao_urbana_percentual: 77.8,
    taxa_urbanizacao: 77.2,
  },
  {
    uf: "RO",
    estado: "Rondonia",
    deficit_habitacional: 68_000,
    deficit_percentual: 11.4,
    unidades_mcmv_contratadas: 32_800,
    unidades_mcmv_entregues: 24_500,
    investimento_total: 2_300_000_000,
    investimento_fmt: "R$ 2,3 bilhoes",
    populacao_urbana_percentual: 73.6,
    taxa_urbanizacao: 73.1,
  },
  {
    uf: "RR",
    estado: "Roraima",
    deficit_habitacional: 28_500,
    deficit_percentual: 16.8,
    unidades_mcmv_contratadas: 9_400,
    unidades_mcmv_entregues: 6_200,
    investimento_total: 680_000_000,
    investimento_fmt: "R$ 680 milhoes",
    populacao_urbana_percentual: 76.6,
    taxa_urbanizacao: 76.1,
  },
  {
    uf: "RS",
    estado: "Rio Grande do Sul",
    deficit_habitacional: 298_000,
    deficit_percentual: 7.6,
    unidades_mcmv_contratadas: 212_400,
    unidades_mcmv_entregues: 162_800,
    investimento_total: 16_400_000_000,
    investimento_fmt: "R$ 16,4 bilhoes",
    populacao_urbana_percentual: 85.1,
    taxa_urbanizacao: 84.7,
  },
  {
    uf: "SC",
    estado: "Santa Catarina",
    deficit_habitacional: 165_000,
    deficit_percentual: 6.8,
    unidades_mcmv_contratadas: 112_600,
    unidades_mcmv_entregues: 86_400,
    investimento_total: 9_400_000_000,
    investimento_fmt: "R$ 9,4 bilhoes",
    populacao_urbana_percentual: 84.0,
    taxa_urbanizacao: 83.6,
  },
  {
    uf: "SE",
    estado: "Sergipe",
    deficit_habitacional: 98_000,
    deficit_percentual: 12.8,
    unidades_mcmv_contratadas: 49_200,
    unidades_mcmv_entregues: 38_500,
    investimento_total: 3_100_000_000,
    investimento_fmt: "R$ 3,1 bilhoes",
    populacao_urbana_percentual: 73.5,
    taxa_urbanizacao: 73.0,
  },
  {
    uf: "SP",
    estado: "Sao Paulo",
    deficit_habitacional: 1_220_000,
    deficit_percentual: 8.2,
    unidades_mcmv_contratadas: 682_400,
    unidades_mcmv_entregues: 528_600,
    investimento_total: 62_400_000_000,
    investimento_fmt: "R$ 62,4 bilhoes",
    populacao_urbana_percentual: 95.9,
    taxa_urbanizacao: 95.7,
  },
  {
    uf: "TO",
    estado: "Tocantins",
    deficit_habitacional: 62_000,
    deficit_percentual: 12.4,
    unidades_mcmv_contratadas: 30_200,
    unidades_mcmv_entregues: 22_800,
    investimento_total: 2_000_000_000,
    investimento_fmt: "R$ 2,0 bilhoes",
    populacao_urbana_percentual: 79.0,
    taxa_urbanizacao: 78.5,
  },
];

// ---------------------------------------------------------------------------
// Empreendimentos MCMV representativos
// ---------------------------------------------------------------------------

export const empreendimentosMCMV: EmpreendimentoMCMV[] = [
  {
    id: "MCMV-SP-001",
    nome: "Residencial Parque das Flores",
    uf: "SP",
    municipio: "Sao Paulo",
    faixa: "Faixa 1",
    unidades: 1_200,
    valor_total: 192_000_000,
    valor_fmt: "R$ 192 milhoes",
    status: "Entregue",
    construtora: "MRV Engenharia",
    data_contratacao: "2021-03-15",
  },
  {
    id: "MCMV-SP-002",
    nome: "Residencial Vista Alegre",
    uf: "SP",
    municipio: "Campinas",
    faixa: "Faixa 2",
    unidades: 640,
    valor_total: 134_400_000,
    valor_fmt: "R$ 134,4 milhoes",
    status: "Entregue",
    construtora: "Tenda Construtora",
    data_contratacao: "2020-08-22",
  },
  {
    id: "MCMV-RJ-001",
    nome: "Condominio Baia de Guanabara",
    uf: "RJ",
    municipio: "Rio de Janeiro",
    faixa: "Faixa 1",
    unidades: 980,
    valor_total: 176_400_000,
    valor_fmt: "R$ 176,4 milhoes",
    status: "Em Obras",
    construtora: "Direcional Engenharia",
    data_contratacao: "2023-05-10",
  },
  {
    id: "MCMV-RJ-002",
    nome: "Residencial Nova Iguacu Life",
    uf: "RJ",
    municipio: "Nova Iguacu",
    faixa: "Faixa 2",
    unidades: 512,
    valor_total: 89_600_000,
    valor_fmt: "R$ 89,6 milhoes",
    status: "Entregue",
    construtora: "Cury Construtora",
    data_contratacao: "2020-11-05",
  },
  {
    id: "MCMV-MG-001",
    nome: "Residencial Serra Verde",
    uf: "MG",
    municipio: "Belo Horizonte",
    faixa: "Faixa 1",
    unidades: 1_500,
    valor_total: 210_000_000,
    valor_fmt: "R$ 210 milhoes",
    status: "Em Obras",
    construtora: "MRV Engenharia",
    data_contratacao: "2023-02-18",
  },
  {
    id: "MCMV-MG-002",
    nome: "Parque das Aguas Residencial",
    uf: "MG",
    municipio: "Uberlandia",
    faixa: "Faixa 3",
    unidades: 380,
    valor_total: 72_200_000,
    valor_fmt: "R$ 72,2 milhoes",
    status: "Entregue",
    construtora: "Construtora Patriani",
    data_contratacao: "2019-07-12",
  },
  {
    id: "MCMV-BA-001",
    nome: "Residencial Cidade Jardim",
    uf: "BA",
    municipio: "Salvador",
    faixa: "Faixa 1",
    unidades: 2_400,
    valor_total: 312_000_000,
    valor_fmt: "R$ 312 milhoes",
    status: "Em Obras",
    construtora: "Direcional Engenharia",
    data_contratacao: "2023-08-20",
  },
  {
    id: "MCMV-BA-002",
    nome: "Moradas do Reconcavo",
    uf: "BA",
    municipio: "Feira de Santana",
    faixa: "Faixa 2",
    unidades: 720,
    valor_total: 100_800_000,
    valor_fmt: "R$ 100,8 milhoes",
    status: "Entregue",
    construtora: "Tenda Construtora",
    data_contratacao: "2021-01-14",
  },
  {
    id: "MCMV-PE-001",
    nome: "Residencial Capibaribe",
    uf: "PE",
    municipio: "Recife",
    faixa: "Faixa 1",
    unidades: 1_100,
    valor_total: 154_000_000,
    valor_fmt: "R$ 154 milhoes",
    status: "Contratado",
    construtora: "MRV Engenharia",
    data_contratacao: "2024-03-05",
  },
  {
    id: "MCMV-CE-001",
    nome: "Residencial Sol Nascente",
    uf: "CE",
    municipio: "Fortaleza",
    faixa: "Faixa 1",
    unidades: 1_800,
    valor_total: 234_000_000,
    valor_fmt: "R$ 234 milhoes",
    status: "Em Obras",
    construtora: "Direcional Engenharia",
    data_contratacao: "2022-11-28",
  },
  {
    id: "MCMV-CE-002",
    nome: "Village Maracanau",
    uf: "CE",
    municipio: "Maracanau",
    faixa: "Faixa 2",
    unidades: 480,
    valor_total: 62_400_000,
    valor_fmt: "R$ 62,4 milhoes",
    status: "Entregue",
    construtora: "Pacaembu Construtora",
    data_contratacao: "2020-06-17",
  },
  {
    id: "MCMV-PA-001",
    nome: "Residencial Marajo Park",
    uf: "PA",
    municipio: "Belem",
    faixa: "Faixa 1",
    unidades: 1_600,
    valor_total: 208_000_000,
    valor_fmt: "R$ 208 milhoes",
    status: "Em Obras",
    construtora: "Tenda Construtora",
    data_contratacao: "2023-04-22",
  },
  {
    id: "MCMV-MA-001",
    nome: "Residencial Lago dos Palmares",
    uf: "MA",
    municipio: "Sao Luis",
    faixa: "Faixa 1",
    unidades: 2_000,
    valor_total: 240_000_000,
    valor_fmt: "R$ 240 milhoes",
    status: "Contratado",
    construtora: "Direcional Engenharia",
    data_contratacao: "2024-01-10",
  },
  {
    id: "MCMV-PR-001",
    nome: "Residencial Araucaria",
    uf: "PR",
    municipio: "Curitiba",
    faixa: "Faixa 2",
    unidades: 840,
    valor_total: 151_200_000,
    valor_fmt: "R$ 151,2 milhoes",
    status: "Entregue",
    construtora: "MRV Engenharia",
    data_contratacao: "2020-09-30",
  },
  {
    id: "MCMV-PR-002",
    nome: "Morada Iguacu",
    uf: "PR",
    municipio: "Londrina",
    faixa: "Faixa 3",
    unidades: 320,
    valor_total: 54_400_000,
    valor_fmt: "R$ 54,4 milhoes",
    status: "Entregue",
    construtora: "Construtora Plaenge",
    data_contratacao: "2019-12-04",
  },
  {
    id: "MCMV-RS-001",
    nome: "Residencial Guaiba",
    uf: "RS",
    municipio: "Porto Alegre",
    faixa: "Faixa 1",
    unidades: 1_040,
    valor_total: 166_400_000,
    valor_fmt: "R$ 166,4 milhoes",
    status: "Em Obras",
    construtora: "Cury Construtora",
    data_contratacao: "2023-06-14",
  },
  {
    id: "MCMV-GO-001",
    nome: "Residencial Cerrado Vivo",
    uf: "GO",
    municipio: "Goiania",
    faixa: "Faixa 1",
    unidades: 1_360,
    valor_total: 190_400_000,
    valor_fmt: "R$ 190,4 milhoes",
    status: "Em Obras",
    construtora: "MRV Engenharia",
    data_contratacao: "2022-10-08",
  },
  {
    id: "MCMV-AM-001",
    nome: "Residencial Manaus Park",
    uf: "AM",
    municipio: "Manaus",
    faixa: "Faixa 1",
    unidades: 1_440,
    valor_total: 187_200_000,
    valor_fmt: "R$ 187,2 milhoes",
    status: "Contratado",
    construtora: "Direcional Engenharia",
    data_contratacao: "2024-02-20",
  },
  {
    id: "MCMV-SC-001",
    nome: "Residencial Ilha Bela",
    uf: "SC",
    municipio: "Florianopolis",
    faixa: "Faixa 2",
    unidades: 560,
    valor_total: 112_000_000,
    valor_fmt: "R$ 112 milhoes",
    status: "Entregue",
    construtora: "Cury Construtora",
    data_contratacao: "2021-05-20",
  },
  {
    id: "MCMV-SC-002",
    nome: "Parque Joinville Residencial",
    uf: "SC",
    municipio: "Joinville",
    faixa: "Faixa 3",
    unidades: 420,
    valor_total: 79_800_000,
    valor_fmt: "R$ 79,8 milhoes",
    status: "Entregue",
    construtora: "Tenda Construtora",
    data_contratacao: "2020-02-11",
  },
  {
    id: "MCMV-DF-001",
    nome: "Residencial Lago Sul Popular",
    uf: "DF",
    municipio: "Brasilia",
    faixa: "Faixa 1",
    unidades: 760,
    valor_total: 152_000_000,
    valor_fmt: "R$ 152 milhoes",
    status: "Em Obras",
    construtora: "Direcional Engenharia",
    data_contratacao: "2023-09-12",
  },
  {
    id: "MCMV-PI-001",
    nome: "Residencial Delta do Parnaiba",
    uf: "PI",
    municipio: "Teresina",
    faixa: "Faixa 1",
    unidades: 900,
    valor_total: 99_000_000,
    valor_fmt: "R$ 99 milhoes",
    status: "Contratado",
    construtora: "Pacaembu Construtora",
    data_contratacao: "2024-04-18",
  },
  {
    id: "MCMV-ES-001",
    nome: "Residencial Mestre Alvaro",
    uf: "ES",
    municipio: "Serra",
    faixa: "Faixa 2",
    unidades: 620,
    valor_total: 99_200_000,
    valor_fmt: "R$ 99,2 milhoes",
    status: "Em Obras",
    construtora: "MRV Engenharia",
    data_contratacao: "2022-07-25",
  },
  {
    id: "MCMV-MT-001",
    nome: "Residencial Pantanal",
    uf: "MT",
    municipio: "Cuiaba",
    faixa: "Faixa 1",
    unidades: 880,
    valor_total: 114_400_000,
    valor_fmt: "R$ 114,4 milhoes",
    status: "Em Obras",
    construtora: "Tenda Construtora",
    data_contratacao: "2023-01-30",
  },
  {
    id: "MCMV-RN-001",
    nome: "Residencial Dunas do Potengi",
    uf: "RN",
    municipio: "Natal",
    faixa: "Faixa 1",
    unidades: 1_080,
    valor_total: 140_400_000,
    valor_fmt: "R$ 140,4 milhoes",
    status: "Entregue",
    construtora: "Direcional Engenharia",
    data_contratacao: "2021-08-09",
  },
];

// ---------------------------------------------------------------------------
// Manter compatibilidade com interface anterior (re-export legado)
// ---------------------------------------------------------------------------

export interface DadosHabitacao {
  estado: string;
  deficit_habitacional: number;
  unidades_mcmv_entregues: number;
  unidades_mcmv_em_obras: number;
  investimento_mcmv: number;
  investimento_mcmv_fmt: string;
  preco_medio_m2: number;
}

/** @deprecated Use habitacaoEstados com a interface HabitacaoEstado */
export const dadosHabitacaoPorEstado: DadosHabitacao[] = habitacaoEstados.map(
  (h) => ({
    estado: h.uf,
    deficit_habitacional: h.deficit_habitacional,
    unidades_mcmv_entregues: h.unidades_mcmv_entregues,
    unidades_mcmv_em_obras:
      h.unidades_mcmv_contratadas - h.unidades_mcmv_entregues,
    investimento_mcmv: h.investimento_total,
    investimento_mcmv_fmt: h.investimento_fmt,
    preco_medio_m2: 0,
  }),
);
