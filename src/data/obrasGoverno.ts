/**
 * obrasGoverno.ts
 *
 * Dados de obras de infraestrutura do Governo Federal — PAC, Novo PAC,
 * Avança Brasil e BNDES.
 *
 * -----------------------------------------------------------------------
 * AVISO DE CONFORMIDADE — LGPD (Lei 13.709/2018)
 *
 * Todos os dados contidos neste arquivo são provenientes exclusivamente de
 * fontes públicas e oficiais, incluindo:
 *   - Painel PAC / Novo PAC (https://pac.gov.br)
 *   - Portal da Transparência do BNDES (https://www.bndes.gov.br/transparencia)
 *   - Agência Gov / Agência Brasil
 *   - Diário Oficial da União (DOU)
 *   - DNIT, ANTT, ANEEL, Ministério dos Transportes, Ministério das Cidades
 *   - Infra S.A. (https://www.infrasa.gov.br)
 *
 * Nenhum dado pessoal sensível é coletado, armazenado ou tratado.
 * As informações aqui reunidas referem-se a empreendimentos públicos de
 * interesse coletivo, divulgados em cumprimento ao princípio da publicidade
 * (art. 37, CF/88) e à Lei de Acesso à Informação (Lei 12.527/2011).
 * -----------------------------------------------------------------------
 */

export interface ObraGoverno {
  /** Identificador único da obra (ex.: "PAC-001") */
  id: string;

  /** Nome completo do empreendimento */
  nome: string;

  /** Programa governamental ao qual a obra está vinculada */
  programa: "PAC" | "Novo PAC" | "Avança Brasil" | "BNDES";

  /** Tipologia da obra */
  tipo:
    | "Saneamento"
    | "Rodovia"
    | "Ferrovia"
    | "Porto"
    | "Aeroporto"
    | "Energia"
    | "Habitação"
    | "Mobilidade Urbana";

  /** Unidade Federativa (sigla de 2 letras) */
  uf: string;

  /** Município de referência (sede ou principal localidade) */
  municipio: string;

  /** Valor do investimento em reais (R$) */
  valor_investimento: number;

  /** Valor do investimento formatado para exibição */
  valor_investimento_fmt: string;

  /** Percentual de execução física (0 a 100) */
  percentual_execucao: number;

  /** Situação atual da obra */
  status: "Em Andamento" | "Concluída" | "Paralisada" | "Não Iniciada";

  /** Data de início das obras (ISO 8601 — YYYY-MM-DD) */
  data_inicio: string;

  /** Previsão de conclusão (ISO 8601 — YYYY-MM-DD) */
  previsao_conclusao: string;

  /** Empresa ou consórcio responsável pela execução */
  responsavel: string;

  /** Descrição resumida do empreendimento */
  descricao: string;
}

export const obrasGoverno: ObraGoverno[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // FERROVIAS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-001",
    nome: "Ferrovia de Integração Oeste-Leste (FIOL) — Trecho 1: Ilhéus–Caetité",
    programa: "Novo PAC",
    tipo: "Ferrovia",
    uf: "BA",
    municipio: "Ilhéus",
    valor_investimento: 3_300_000_000,
    valor_investimento_fmt: "R$ 3,3 bilhões",
    percentual_execucao: 85.2,
    status: "Em Andamento",
    data_inicio: "2012-08-01",
    previsao_conclusao: "2027-12-31",
    responsavel: "Bamin Mineração S.A.",
    descricao:
      "Trecho de 537,2 km da FIOL (EF-334) entre Ilhéus e Caetité, na Bahia. " +
      "A concessão foi arrematada pela Bamin em 2021 com investimento estimado de R$ 3,3 bilhões " +
      "para conclusão das obras e operação ferroviária voltada ao escoamento de minério de ferro e grãos.",
  },
  {
    id: "PAC-002",
    nome: "Ferrovia de Integração Oeste-Leste (FIOL) — Trecho 2: Caetité–Barreiras",
    programa: "Novo PAC",
    tipo: "Ferrovia",
    uf: "BA",
    municipio: "Caetité",
    valor_investimento: 4_200_000_000,
    valor_investimento_fmt: "R$ 4,2 bilhões",
    percentual_execucao: 12.0,
    status: "Em Andamento",
    data_inicio: "2024-06-07",
    previsao_conclusao: "2030-12-31",
    responsavel: "Tec Engenharia / Infra S.A.",
    descricao:
      "Trecho de 485 km entre Caetité e Barreiras (BA). Em junho de 2024, a Infra S.A. " +
      "emitiu ordem de serviço de R$ 365 milhões para projetos executivos e conclusão de " +
      "subtrechos remanescentes, incluindo a superestrutura da ponte sobre o Rio São Francisco.",
  },
  {
    id: "PAC-003",
    nome: "Ferrovia Norte-Sul (FNS) — Trecho Porto Nacional/TO a Estrela d'Oeste/SP",
    programa: "PAC",
    tipo: "Ferrovia",
    uf: "GO",
    municipio: "Anápolis",
    valor_investimento: 7_800_000_000,
    valor_investimento_fmt: "R$ 7,8 bilhões",
    percentual_execucao: 100,
    status: "Concluída",
    data_inicio: "2010-03-15",
    previsao_conclusao: "2023-05-25",
    responsavel: "Rumo Logística / VLI",
    descricao:
      "Ferrovia de 1.537 km entre Porto Nacional (TO) e Estrela d'Oeste (SP), operada " +
      "pela Rumo (Malha Central) e VLI. Após 36 anos desde o início do projeto, os últimos " +
      "50 km foram concluídos em maio de 2023. Em 2024, movimentou 7,4 milhões de toneladas.",
  },
  {
    id: "PAC-004",
    nome: "Ferrogrão (EF-170) — Lucas do Rio Verde/MT a Miritituba/PA",
    programa: "Novo PAC",
    tipo: "Ferrovia",
    uf: "MT",
    municipio: "Lucas do Rio Verde",
    valor_investimento: 21_000_000_000,
    valor_investimento_fmt: "R$ 21 bilhões",
    percentual_execucao: 0,
    status: "Não Iniciada",
    data_inicio: "2026-01-01",
    previsao_conclusao: "2035-12-31",
    responsavel: "A definir (concessão)",
    descricao:
      "Projeto de ferrovia de aproximadamente 933 km entre a região produtora de grãos " +
      "no norte do Mato Grosso e o porto de Miritituba (PA), no Rio Tapajós. Aguarda " +
      "decisão do STF sobre licenciamento ambiental em terra indígena Kayapó.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // OBRAS HÍDRICAS / SANEAMENTO
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-005",
    nome: "Transposição do Rio São Francisco — Eixo Norte (PISF)",
    programa: "PAC",
    tipo: "Saneamento",
    uf: "PE",
    municipio: "Cabrobó",
    valor_investimento: 12_000_000_000,
    valor_investimento_fmt: "R$ 12 bilhões",
    percentual_execucao: 97.0,
    status: "Em Andamento",
    data_inicio: "2007-06-01",
    previsao_conclusao: "2026-12-31",
    responsavel: "Consórcio Estreito / Ministério da Integração",
    descricao:
      "Eixo Norte do Projeto de Integração do Rio São Francisco (PISF), com 260 km de " +
      "canais, 4 túneis e 9 estações de bombeamento. Beneficia 12 milhões de pessoas em " +
      "390 municípios de PE, PB, CE e RN. O custo total passou de R$ 4 bi para R$ 12 bi.",
  },
  {
    id: "PAC-006",
    nome: "Transposição do Rio São Francisco — Eixo Leste (PISF)",
    programa: "PAC",
    tipo: "Saneamento",
    uf: "PB",
    municipio: "Monteiro",
    valor_investimento: 5_200_000_000,
    valor_investimento_fmt: "R$ 5,2 bilhões",
    percentual_execucao: 100,
    status: "Concluída",
    data_inicio: "2007-06-01",
    previsao_conclusao: "2017-03-10",
    responsavel: "Consórcio Águas do São Francisco",
    descricao:
      "Eixo Leste do PISF com 217 km de extensão, em pré-operação desde março de 2017. " +
      "Inclui o Ramal do Agreste (R$ 1,6 bi), inaugurado em 2021, que leva água ao " +
      "semiárido de Pernambuco e Paraíba.",
  },
  {
    id: "PAC-007",
    nome: "Ramal do Apodi — Extensão do PISF",
    programa: "Novo PAC",
    tipo: "Saneamento",
    uf: "RN",
    municipio: "Apodi",
    valor_investimento: 1_450_000_000,
    valor_investimento_fmt: "R$ 1,45 bilhão",
    percentual_execucao: 74.8,
    status: "Em Andamento",
    data_inicio: "2021-04-15",
    previsao_conclusao: "2026-10-31",
    responsavel: "Ministério da Integração / DNOCS",
    descricao:
      "Ramal de 112 km que leva as águas do São Francisco ao estado do Rio Grande do Norte, " +
      "complementando o PISF. Investimento de R$ 1,45 bilhão, com previsão de entrega total " +
      "em outubro de 2026.",
  },
  {
    id: "PAC-008",
    nome: "PAC Saneamento — Universalização da Região Metropolitana de São Paulo",
    programa: "Novo PAC",
    tipo: "Saneamento",
    uf: "SP",
    municipio: "São Paulo",
    valor_investimento: 8_500_000_000,
    valor_investimento_fmt: "R$ 8,5 bilhões",
    percentual_execucao: 42.7,
    status: "Em Andamento",
    data_inicio: "2023-08-01",
    previsao_conclusao: "2033-12-31",
    responsavel: "Sabesp / Equatorial Saneamento",
    descricao:
      "Programa de universalização do esgotamento sanitário na RMSP, contemplando " +
      "interceptores, estações elevatórias e ETEs. Atende ao Marco Legal do Saneamento " +
      "(meta: 90% de coleta e tratamento de esgotos até 2033). Beneficia 22 milhões de pessoas.",
  },
  {
    id: "PAC-009",
    nome: "PAC Saneamento — Despoluição da Baía de Guanabara",
    programa: "Novo PAC",
    tipo: "Saneamento",
    uf: "RJ",
    municipio: "Rio de Janeiro",
    valor_investimento: 4_200_000_000,
    valor_investimento_fmt: "R$ 4,2 bilhões",
    percentual_execucao: 28.5,
    status: "Em Andamento",
    data_inicio: "2023-10-01",
    previsao_conclusao: "2033-12-31",
    responsavel: "Águas do Rio / Iguá Saneamento",
    descricao:
      "Conjunto de obras de esgotamento sanitário, troncos coletores e ETEs na bacia " +
      "da Baía de Guanabara, visando aumentar o índice de tratamento de esgotos de 30% " +
      "para 90% até 2033. Beneficia 9,5 milhões de habitantes na região metropolitana.",
  },
  {
    id: "PAC-010",
    nome: "PAC Saneamento — Esgotamento Sanitário de Manaus",
    programa: "Novo PAC",
    tipo: "Saneamento",
    uf: "AM",
    municipio: "Manaus",
    valor_investimento: 3_100_000_000,
    valor_investimento_fmt: "R$ 3,1 bilhões",
    percentual_execucao: 18.3,
    status: "Em Andamento",
    data_inicio: "2024-03-01",
    previsao_conclusao: "2033-12-31",
    responsavel: "Águas de Manaus (Aegea)",
    descricao:
      "Implantação de rede coletora, interceptores e ETEs em Manaus, onde apenas 22% " +
      "da população tem acesso ao esgotamento sanitário. O programa visa atender 2,2 milhões " +
      "de habitantes conforme metas do Marco Legal do Saneamento.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RODOVIAS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-011",
    nome: "Duplicação da BR-101/NE — Trecho Natal/RN a Palmares/PE",
    programa: "PAC",
    tipo: "Rodovia",
    uf: "RN",
    municipio: "Natal",
    valor_investimento: 1_500_000_000,
    valor_investimento_fmt: "R$ 1,5 bilhão",
    percentual_execucao: 100,
    status: "Concluída",
    data_inicio: "2006-03-01",
    previsao_conclusao: "2024-08-15",
    responsavel: "DNIT / Consórcios regionais",
    descricao:
      "Duplicação de 336 km da BR-101 no corredor Nordeste, entre Natal (RN) e Palmares (PE). " +
      "Investimento de R$ 1,5 bilhão incluindo obras de arte especiais, passarelas e " +
      "dispositivos de segurança viária. Beneficia 7 milhões de habitantes.",
  },
  {
    id: "PAC-012",
    nome: "Duplicação da BR-101/AL — Alagoas",
    programa: "Novo PAC",
    tipo: "Rodovia",
    uf: "AL",
    municipio: "Maceió",
    valor_investimento: 344_000_000,
    valor_investimento_fmt: "R$ 344 milhões",
    percentual_execucao: 58.0,
    status: "Em Andamento",
    data_inicio: "2022-01-15",
    previsao_conclusao: "2026-12-31",
    responsavel: "DNIT",
    descricao:
      "Duplicação da BR-101 em Alagoas, com execução dos lotes 2, 4, 5 e 6, totalizando " +
      "cerca de 90 km. No lote 6 (Teotônio Vilela–São Sebastião), 6 dos 14 km já foram " +
      "liberados ao tráfego. Investimento contemplado no Novo PAC.",
  },
  {
    id: "PAC-013",
    nome: "Duplicação da BR-101/SE — Sergipe",
    programa: "Novo PAC",
    tipo: "Rodovia",
    uf: "SE",
    municipio: "Aracaju",
    valor_investimento: 312_000_000,
    valor_investimento_fmt: "R$ 312 milhões",
    percentual_execucao: 72.0,
    status: "Em Andamento",
    data_inicio: "2018-06-01",
    previsao_conclusao: "2026-06-30",
    responsavel: "DNIT",
    descricao:
      "Duplicação dos trechos remanescentes da BR-101 em Sergipe, que conecta 17 municípios " +
      "em 206 km de extensão. Restam 25,5 km entre o km 51,8 e km 77,3 para conclusão " +
      "da duplicação integral no estado.",
  },
  {
    id: "PAC-014",
    nome: "Duplicação da BR-163/MT/PA — Sinop a Miritituba",
    programa: "PAC",
    tipo: "Rodovia",
    uf: "MT",
    municipio: "Sinop",
    valor_investimento: 4_800_000_000,
    valor_investimento_fmt: "R$ 4,8 bilhões",
    percentual_execucao: 72.8,
    status: "Em Andamento",
    data_inicio: "2013-04-01",
    previsao_conclusao: "2027-12-31",
    responsavel: "DNIT / Consórcio BR-163",
    descricao:
      "Duplicação e pavimentação da BR-163 no trecho entre Sinop (MT) e Miritituba (PA), " +
      "principal corredor de escoamento de grãos do Centro-Oeste rumo aos portos do Arco Norte. " +
      "A obra é fundamental para a competitividade do agronegócio brasileiro.",
  },
  {
    id: "PAC-015",
    nome: "Duplicação da BR-116/BA — Feira de Santana a Divisa BA/MG",
    programa: "Novo PAC",
    tipo: "Rodovia",
    uf: "BA",
    municipio: "Feira de Santana",
    valor_investimento: 2_900_000_000,
    valor_investimento_fmt: "R$ 2,9 bilhões",
    percentual_execucao: 55.4,
    status: "Em Andamento",
    data_inicio: "2016-09-01",
    previsao_conclusao: "2027-12-31",
    responsavel: "DNIT",
    descricao:
      "Duplicação da BR-116 no estado da Bahia, trecho de grande fluxo de cargas e " +
      "passageiros entre o Nordeste e o Sudeste. Inclui obras de arte correntes, " +
      "viadutos, passarelas e interseções em nível. Beneficia 5,5 milhões de habitantes.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ENERGIA
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-016",
    nome: "Usina Nuclear Angra 3",
    programa: "PAC",
    tipo: "Energia",
    uf: "RJ",
    municipio: "Angra dos Reis",
    valor_investimento: 23_000_000_000,
    valor_investimento_fmt: "R$ 23 bilhões",
    percentual_execucao: 66.0,
    status: "Paralisada",
    data_inicio: "2010-06-01",
    previsao_conclusao: "2028-12-31",
    responsavel: "Eletronuclear",
    descricao:
      "Terceira usina nuclear brasileira, com potência de 1.405 MW e capacidade de gerar " +
      "12 milhões de MWh/ano. Progresso físico global de 66%. A obra foi paralisada em 2015 " +
      "e parcialmente retomada em 2022. Investimento de R$ 23 bi para conclusão (est. BNDES). " +
      "A manutenção da obra parada custa R$ 1 bilhão/ano.",
  },
  {
    id: "PAC-017",
    nome: "Linha de Transmissão Tucuruí–Macapá–Manaus (Linhão de Tucuruí)",
    programa: "Novo PAC",
    tipo: "Energia",
    uf: "AM",
    municipio: "Manaus",
    valor_investimento: 5_800_000_000,
    valor_investimento_fmt: "R$ 5,8 bilhões",
    percentual_execucao: 62.5,
    status: "Em Andamento",
    data_inicio: "2019-06-01",
    previsao_conclusao: "2026-12-31",
    responsavel: "Transnorte Energia (Eletronorte / Alupar)",
    descricao:
      "Linha de transmissão de 1.800 km em 500 kV que interligará o sistema elétrico " +
      "do Amapá e Amazonas ao Sistema Interligado Nacional, encerrando a dependência de " +
      "usinas térmicas a diesel. Beneficia 4,5 milhões de pessoas na Amazônia.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MOBILIDADE URBANA
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-018",
    nome: "Expansão da Linha 2-Verde do Metrô de São Paulo (Vila Prudente–Penha)",
    programa: "BNDES",
    tipo: "Mobilidade Urbana",
    uf: "SP",
    municipio: "São Paulo",
    valor_investimento: 13_400_000_000,
    valor_investimento_fmt: "R$ 13,4 bilhões",
    percentual_execucao: 35.0,
    status: "Em Andamento",
    data_inicio: "2021-09-01",
    previsao_conclusao: "2028-12-31",
    responsavel: "Metrô-SP / BNDES",
    descricao:
      "Extensão de 8 estações entre Vila Prudente e Penha, com integração à Linha 3-Vermelha " +
      "e à Linha 11-Coral da CPTM. O BNDES aprovou financiamento de R$ 2,4 bi para a 1ª fase " +
      "(obras civis de R$ 7,8 bi). Demanda estimada de 320 mil passageiros/dia.",
  },
  {
    id: "PAC-019",
    nome: "BRT Transbrasil — Corredor Expresso Deodoro–Fundão",
    programa: "Novo PAC",
    tipo: "Mobilidade Urbana",
    uf: "RJ",
    municipio: "Rio de Janeiro",
    valor_investimento: 1_500_000_000,
    valor_investimento_fmt: "R$ 1,5 bilhão",
    percentual_execucao: 88.5,
    status: "Em Andamento",
    data_inicio: "2015-01-01",
    previsao_conclusao: "2026-06-30",
    responsavel: "Prefeitura do Rio de Janeiro / Consórcio TransBrasil",
    descricao:
      "Corredor BRT de 32 km ao longo da Av. Brasil, principal via expressa da cidade, " +
      "com 28 estações e terminais de integração. Capacidade para 900 mil passageiros/dia. " +
      "A obra sofreu atrasos desde 2015, mas retomou ritmo com aporte do Novo PAC.",
  },
  {
    id: "PAC-020",
    nome: "Metrô de Salvador e Lauro de Freitas — Linha 2",
    programa: "Novo PAC",
    tipo: "Mobilidade Urbana",
    uf: "BA",
    municipio: "Salvador",
    valor_investimento: 4_100_000_000,
    valor_investimento_fmt: "R$ 4,1 bilhões",
    percentual_execucao: 68.9,
    status: "Em Andamento",
    data_inicio: "2017-01-01",
    previsao_conclusao: "2026-12-31",
    responsavel: "CCR Metrô Bahia / Governo do Estado da Bahia",
    descricao:
      "Expansão do sistema metroviário de Salvador com a Linha 2, conectando o Acesso " +
      "Norte à região de Lauro de Freitas. Beneficia 3,8 milhões de habitantes " +
      "da região metropolitana.",
  },
  {
    id: "PAC-021",
    nome: "VLT de Cuiabá–Várzea Grande",
    programa: "PAC",
    tipo: "Mobilidade Urbana",
    uf: "MT",
    municipio: "Cuiabá",
    valor_investimento: 1_800_000_000,
    valor_investimento_fmt: "R$ 1,8 bilhão",
    percentual_execucao: 22.4,
    status: "Paralisada",
    data_inicio: "2012-10-01",
    previsao_conclusao: "2028-12-31",
    responsavel: "Governo do Estado de Mato Grosso",
    descricao:
      "Veículo Leve sobre Trilhos previsto para a Copa de 2014, com 22 km de extensão " +
      "ligando Cuiabá a Várzea Grande. A obra foi paralisada com apenas 22% de execução " +
      "e acumula R$ 1,8 bilhão em investimentos federais e estaduais.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PORTOS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-022",
    nome: "Modernização e Ampliação do Porto de Santos — STS10",
    programa: "Novo PAC",
    tipo: "Porto",
    uf: "SP",
    municipio: "Santos",
    valor_investimento: 6_200_000_000,
    valor_investimento_fmt: "R$ 6,2 bilhões",
    percentual_execucao: 3.0,
    status: "Não Iniciada",
    data_inicio: "2025-06-01",
    previsao_conclusao: "2030-12-31",
    responsavel: "SPA (Santos Port Authority) / A definir",
    descricao:
      "Projeto de novo terminal de contêineres (STS10) no maior porto da América Latina, " +
      "com capacidade adicional de 2,4 milhões de TEUs/ano. Inclui dragagem de aprofundamento, " +
      "retroárea, acessos rodoferroviários e berços de atracação.",
  },
  {
    id: "PAC-023",
    nome: "Ampliação do Porto de Itaqui — Terminal de Grãos",
    programa: "Novo PAC",
    tipo: "Porto",
    uf: "MA",
    municipio: "São Luís",
    valor_investimento: 1_200_000_000,
    valor_investimento_fmt: "R$ 1,2 bilhão",
    percentual_execucao: 45.6,
    status: "Em Andamento",
    data_inicio: "2022-07-01",
    previsao_conclusao: "2026-12-31",
    responsavel: "EMAP (Empresa Maranhense de Administração Portuária)",
    descricao:
      "Ampliação do terminal graneleiro do Porto de Itaqui, principal ponto de escoamento " +
      "de grãos do MATOPIBA (MA, TO, PI, BA). Inclui novo berço, silos e correia transportadora " +
      "de alta capacidade.",
  },
  {
    id: "PAC-024",
    nome: "Porto de Suape — Ampliação do Cais e Retroárea",
    programa: "Novo PAC",
    tipo: "Porto",
    uf: "PE",
    municipio: "Ipojuca",
    valor_investimento: 980_000_000,
    valor_investimento_fmt: "R$ 980 milhões",
    percentual_execucao: 58.2,
    status: "Em Andamento",
    data_inicio: "2021-10-01",
    previsao_conclusao: "2026-06-30",
    responsavel: "Complexo Industrial Portuário de Suape",
    descricao:
      "Ampliação dos berços de atracação, dragagem e construção de retroárea no Complexo " +
      "de Suape, hub portuário estratégico do Nordeste. O investimento visa aumentar a " +
      "capacidade de movimentação de contêineres e granéis líquidos.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AEROPORTOS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-025",
    nome: "Ampliação do Aeroporto de Congonhas — Novo Terminal de Passageiros",
    programa: "Novo PAC",
    tipo: "Aeroporto",
    uf: "SP",
    municipio: "São Paulo",
    valor_investimento: 2_400_000_000,
    valor_investimento_fmt: "R$ 2,4 bilhões",
    percentual_execucao: 35.8,
    status: "Em Andamento",
    data_inicio: "2023-04-01",
    previsao_conclusao: "2028-12-31",
    responsavel: "Aena Brasil",
    descricao:
      "Construção de novo terminal de passageiros no Aeroporto de Congonhas, o segundo mais " +
      "movimentado do país, com capacidade para 35 milhões de passageiros/ano. A Aena assumiu " +
      "a concessão e planeja entrega até 2028.",
  },
  {
    id: "PAC-026",
    nome: "Modernização do Aeroporto de Belém (Val-de-Cans) para a COP 30",
    programa: "Novo PAC",
    tipo: "Aeroporto",
    uf: "PA",
    municipio: "Belém",
    valor_investimento: 750_000_000,
    valor_investimento_fmt: "R$ 750 milhões",
    percentual_execucao: 62.1,
    status: "Em Andamento",
    data_inicio: "2022-08-01",
    previsao_conclusao: "2025-11-30",
    responsavel: "Aena Brasil",
    descricao:
      "Modernização e ampliação do terminal de passageiros, pátio de aeronaves e sistema " +
      "viário do aeroporto Val-de-Cans, em preparação para a COP 30 (Conferência do Clima " +
      "da ONU) prevista para novembro de 2025 em Belém.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HABITAÇÃO
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-027",
    nome: "Minha Casa Minha Vida — Complexo Habitacional Parque do Riacho (Faixa 1)",
    programa: "Novo PAC",
    tipo: "Habitação",
    uf: "DF",
    municipio: "Brasília",
    valor_investimento: 285_000_000,
    valor_investimento_fmt: "R$ 285 milhões",
    percentual_execucao: 67.0,
    status: "Em Andamento",
    data_inicio: "2023-06-01",
    previsao_conclusao: "2026-03-31",
    responsavel: "Caixa Econômica Federal / Construtora MRV",
    descricao:
      "Conjunto habitacional com 3.200 unidades destinadas à Faixa 1 do programa " +
      "Minha Casa Minha Vida, com renda familiar de até R$ 2.640/mês. Inclui " +
      "infraestrutura urbana, áreas de lazer, escola e posto de saúde.",
  },
  {
    id: "PAC-028",
    nome: "Minha Casa Minha Vida — Urbanização de Favelas na Região Metropolitana de Recife",
    programa: "Novo PAC",
    tipo: "Habitação",
    uf: "PE",
    municipio: "Recife",
    valor_investimento: 520_000_000,
    valor_investimento_fmt: "R$ 520 milhões",
    percentual_execucao: 31.5,
    status: "Em Andamento",
    data_inicio: "2024-01-15",
    previsao_conclusao: "2027-12-31",
    responsavel: "Ministério das Cidades / Prefeitura do Recife",
    descricao:
      "Programa de urbanização de comunidades da região metropolitana de Recife, incluindo " +
      "drenagem, pavimentação, contenção de encostas, reassentamento de famílias em área de " +
      "risco e construção de novas moradias. Beneficia 25 mil famílias.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // OBRAS ADICIONAIS (cobertura regional)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "PAC-029",
    nome: "PAC Saneamento — Abastecimento de Água do Semiárido (Cinturão das Águas do Ceará)",
    programa: "Novo PAC",
    tipo: "Saneamento",
    uf: "CE",
    municipio: "Fortaleza",
    valor_investimento: 2_800_000_000,
    valor_investimento_fmt: "R$ 2,8 bilhões",
    percentual_execucao: 38.1,
    status: "Em Andamento",
    data_inicio: "2023-11-15",
    previsao_conclusao: "2030-12-31",
    responsavel: "SRH-CE (Secretaria de Recursos Hídricos do Ceará) / Cagece",
    descricao:
      "Cinturão das Águas do Ceará (CAC): canal de 330 km que levará água do Eixo Norte " +
      "da transposição do São Francisco ao açude Castanhão e à Região Metropolitana de " +
      "Fortaleza. Beneficia 6,8 milhões de pessoas.",
  },
  {
    id: "PAC-030",
    nome: "Duplicação da BR-381 (Rodovia Fernão Dias) — Gov. Valadares a BH",
    programa: "Novo PAC",
    tipo: "Rodovia",
    uf: "MG",
    municipio: "Governador Valadares",
    valor_investimento: 3_200_000_000,
    valor_investimento_fmt: "R$ 3,2 bilhões",
    percentual_execucao: 35.2,
    status: "Paralisada",
    data_inicio: "2014-05-01",
    previsao_conclusao: "2028-12-31",
    responsavel: "DNIT",
    descricao:
      "Duplicação da BR-381 entre Governador Valadares e Belo Horizonte, trecho conhecido " +
      'como "Rodovia da Morte" devido ao alto índice de acidentes. A obra enfrentou ' +
      "embargos ambientais e rescisões contratuais, operando com 35% de execução.",
  },
  {
    id: "PAC-031",
    nome: "Ponte sobre o Rio Guaíba — Segunda Ponte (BR-290)",
    programa: "Novo PAC",
    tipo: "Rodovia",
    uf: "RS",
    municipio: "Porto Alegre",
    valor_investimento: 1_800_000_000,
    valor_investimento_fmt: "R$ 1,8 bilhão",
    percentual_execucao: 100,
    status: "Concluída",
    data_inicio: "2014-07-01",
    previsao_conclusao: "2024-12-13",
    responsavel: "DNIT / Consórcio Ponte do Guaíba",
    descricao:
      "Segunda travessia rodoviária sobre o Rio Guaíba, com 2,9 km de extensão (incluindo " +
      "acessos), 6 faixas de rolamento e ciclovia. A ponte é estaiada e se tornou novo " +
      "marco urbano de Porto Alegre. Inaugurada em dezembro de 2024.",
  },
  {
    id: "PAC-032",
    nome: "Ferrovia de Integração Centro-Oeste (FICO/EF-354) — Água Boa/MT a Mara Rosa/GO",
    programa: "Novo PAC",
    tipo: "Ferrovia",
    uf: "GO",
    municipio: "Mara Rosa",
    valor_investimento: 4_500_000_000,
    valor_investimento_fmt: "R$ 4,5 bilhões",
    percentual_execucao: 5.0,
    status: "Em Andamento",
    data_inicio: "2024-01-01",
    previsao_conclusao: "2032-12-31",
    responsavel: "Infra S.A. / Ministério dos Transportes",
    descricao:
      "Trecho de 383 km da FICO que conectará Água Boa (MT) a Mara Rosa (GO), integrando-se " +
      "à Ferrovia Norte-Sul. Faz parte do corredor bioceânico que ligará o Atlântico " +
      "(Porto de Ilhéus) ao Pacífico (Porto de Chancay, Peru).",
  },
  {
    id: "PAC-033",
    nome: "PAC Saneamento — Esgotamento Sanitário de Belém para a COP 30",
    programa: "Novo PAC",
    tipo: "Saneamento",
    uf: "PA",
    municipio: "Belém",
    valor_investimento: 1_600_000_000,
    valor_investimento_fmt: "R$ 1,6 bilhão",
    percentual_execucao: 22.0,
    status: "Em Andamento",
    data_inicio: "2024-02-01",
    previsao_conclusao: "2028-12-31",
    responsavel: "Equatorial Saneamento Pará",
    descricao:
      "Obras emergenciais e estruturantes de saneamento básico em Belém, incluindo redes " +
      "coletoras, estações elevatórias e ETE, visando melhorar o índice de coleta de " +
      "esgoto antes e após a COP 30 (nov/2025). Belém coleta apenas 12% do esgoto.",
  },
  {
    id: "PAC-034",
    nome: "Rodoanel Norte de São Paulo — Trecho Norte",
    programa: "BNDES",
    tipo: "Rodovia",
    uf: "SP",
    municipio: "Guarulhos",
    valor_investimento: 3_400_000_000,
    valor_investimento_fmt: "R$ 3,4 bilhões",
    percentual_execucao: 45.0,
    status: "Em Andamento",
    data_inicio: "2019-11-01",
    previsao_conclusao: "2027-12-31",
    responsavel: "DER-SP / BNDES",
    descricao:
      "Trecho Norte do Rodoanel Mário Covas, com 44 km ligando a Rodovia Presidente " +
      "Dutra (BR-116) à Rodovia Fernão Dias (BR-381) em Guarulhos. Complementará o " +
      "anel viário da Região Metropolitana de São Paulo. Financiado pelo BNDES.",
  },
  {
    id: "PAC-035",
    nome: "Metrô de Fortaleza — Linha Leste (Metrofor)",
    programa: "Novo PAC",
    tipo: "Mobilidade Urbana",
    uf: "CE",
    municipio: "Fortaleza",
    valor_investimento: 3_200_000_000,
    valor_investimento_fmt: "R$ 3,2 bilhões",
    percentual_execucao: 52.0,
    status: "Em Andamento",
    data_inicio: "2014-03-01",
    previsao_conclusao: "2027-12-31",
    responsavel: "Metrofor / Governo do Estado do Ceará",
    descricao:
      "Linha Leste do Metrô de Fortaleza, com 12,5 km de extensão e 12 estações, " +
      "ligando o centro da cidade ao bairro Edson Queiroz (Fórum Clóvis Beviláqua). " +
      "Atenderá 250 mil passageiros/dia na terceira maior capital do Nordeste.",
  },
];
