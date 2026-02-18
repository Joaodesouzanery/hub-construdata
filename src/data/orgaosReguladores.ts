/**
 * Órgãos reguladores e fiscalizadores do setor de engenharia,
 * infraestrutura e saneamento no Brasil.
 *
 * Dados públicos de domínio oficial.
 */

export interface OrgaoRegulador {
  id: string;
  nome: string;
  sigla: string;
  tipo: "Federal" | "Estadual" | "Municipal" | "Autarquia" | "Agência Reguladora";
  setor: string[];
  uf: string | null; // null = atuação nacional
  site: string;
  descricao: string;
  competencias: string[];
}

export const orgaosReguladores: OrgaoRegulador[] = [
  // ─── FEDERAIS ───
  {
    id: "ana",
    nome: "Agência Nacional de Águas e Saneamento Básico",
    sigla: "ANA",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Recursos Hídricos"],
    uf: null,
    site: "https://www.gov.br/ana",
    descricao: "Reguladora federal de recursos hídricos e saneamento básico, responsável pelas normas de referência do setor.",
    competencias: [
      "Regulação de recursos hídricos",
      "Normas de referência para saneamento",
      "Outorga de direitos de uso da água",
      "Fiscalização de segurança de barragens",
      "Monitoramento hidrológico nacional",
    ],
  },
  {
    id: "aneel",
    nome: "Agência Nacional de Energia Elétrica",
    sigla: "ANEEL",
    tipo: "Agência Reguladora",
    setor: ["Energia"],
    uf: null,
    site: "https://www.gov.br/aneel",
    descricao: "Reguladora do setor elétrico brasileiro, responsável por leilões, tarifas e fiscalização de concessionárias.",
    competencias: [
      "Regulação do setor elétrico",
      "Leilões de energia",
      "Fiscalização de concessionárias",
      "Definição de tarifas",
      "Autorização de empreendimentos de geração",
    ],
  },
  {
    id: "antt",
    nome: "Agência Nacional de Transportes Terrestres",
    sigla: "ANTT",
    tipo: "Agência Reguladora",
    setor: ["Infraestrutura Rodoviária", "Ferrovias"],
    uf: null,
    site: "https://www.gov.br/antt",
    descricao: "Reguladora de transportes terrestres, responsável por concessões rodoviárias e ferroviárias.",
    competencias: [
      "Concessões rodoviárias federais",
      "Concessões ferroviárias",
      "Fiscalização de rodovias e ferrovias",
      "Regulação de transporte rodoviário de cargas",
      "Autorização de operadores ferroviários",
    ],
  },
  {
    id: "antaq",
    nome: "Agência Nacional de Transportes Aquaviários",
    sigla: "ANTAQ",
    tipo: "Agência Reguladora",
    setor: ["Infraestrutura Portuária"],
    uf: null,
    site: "https://www.gov.br/antaq",
    descricao: "Reguladora do setor portuário e de navegação.",
    competencias: [
      "Regulação portuária",
      "Arrendamentos portuários",
      "Fiscalização de portos",
      "Autorizações de terminais de uso privado",
    ],
  },
  {
    id: "dnit",
    nome: "Departamento Nacional de Infraestrutura de Transportes",
    sigla: "DNIT",
    tipo: "Autarquia",
    setor: ["Infraestrutura Rodoviária", "Ferrovias", "Infraestrutura Portuária"],
    uf: null,
    site: "https://www.gov.br/dnit",
    descricao: "Autarquia responsável pela implantação, manutenção e operação de infraestrutura de transportes.",
    competencias: [
      "Construção e manutenção de rodovias federais",
      "Obras de infraestrutura ferroviária",
      "Obras em hidrovias e portos",
      "Licitações de obras rodoviárias",
    ],
  },
  {
    id: "tcu",
    nome: "Tribunal de Contas da União",
    sigla: "TCU",
    tipo: "Federal",
    setor: ["Saneamento", "Infraestrutura Rodoviária", "Energia", "Ferrovias"],
    uf: null,
    site: "https://portal.tcu.gov.br",
    descricao: "Órgão de controle externo que fiscaliza obras públicas federais e grandes contratos de infraestrutura.",
    competencias: [
      "Fiscalização de obras públicas federais",
      "Auditoria de contratos de concessão",
      "Declaração de inidoneidade de empresas",
      "Fiscotrac — sistema de monitoramento de obras",
      "Análise de editais de licitação",
    ],
  },
  {
    id: "cgu",
    nome: "Controladoria-Geral da União",
    sigla: "CGU",
    tipo: "Federal",
    setor: ["Saneamento", "Infraestrutura Rodoviária", "Energia"],
    uf: null,
    site: "https://www.gov.br/cgu",
    descricao: "Órgão de controle interno responsável pelos cadastros CEIS, CNEP e CEPIM.",
    competencias: [
      "CEIS — Cadastro de Empresas Inidôneas e Suspensas",
      "CNEP — Cadastro Nacional de Empresas Punidas",
      "CEPIM — Entidades Privadas Impedidas",
      "Portal da Transparência",
      "Auditorias e investigações de corrupção",
    ],
  },
  {
    id: "ibama",
    nome: "Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis",
    sigla: "IBAMA",
    tipo: "Autarquia",
    setor: ["Saneamento", "Energia", "Infraestrutura Rodoviária", "Ferrovias"],
    uf: null,
    site: "https://www.gov.br/ibama",
    descricao: "Responsável pelo licenciamento ambiental federal de grandes obras de infraestrutura.",
    competencias: [
      "Licenciamento ambiental federal",
      "Fiscalização ambiental",
      "Avaliação de impacto ambiental (EIA/RIMA)",
      "Autorização de supressão de vegetação",
    ],
  },
  {
    id: "confea",
    nome: "Conselho Federal de Engenharia e Agronomia",
    sigla: "CONFEA",
    tipo: "Autarquia",
    setor: ["Engenharia Civil", "Saneamento", "Energia", "Infraestrutura Rodoviária"],
    uf: null,
    site: "https://www.confea.org.br",
    descricao: "Órgão de fiscalização profissional da engenharia, responsável por ARTs e habilitação profissional.",
    competencias: [
      "Registro profissional de engenheiros",
      "Fiscalização do exercício profissional",
      "Anotação de Responsabilidade Técnica (ART)",
      "Regulamentação de atividades profissionais",
    ],
  },
  {
    id: "mdr",
    nome: "Ministério das Cidades",
    sigla: "MCid",
    tipo: "Federal",
    setor: ["Saneamento", "Habitação", "Mobilidade Urbana"],
    uf: null,
    site: "https://www.gov.br/cidades",
    descricao: "Ministério responsável pelas políticas de saneamento, habitação e mobilidade urbana.",
    competencias: [
      "Política Nacional de Saneamento",
      "Programa Minha Casa Minha Vida",
      "PAC — Programa de Aceleração do Crescimento",
      "Novo Marco do Saneamento (Lei 14.026/2020)",
      "SNIS — Sistema Nacional de Informações sobre Saneamento",
    ],
  },
  {
    id: "pncp",
    nome: "Portal Nacional de Contratações Públicas",
    sigla: "PNCP",
    tipo: "Federal",
    setor: ["Saneamento", "Infraestrutura Rodoviária", "Energia", "Habitação"],
    uf: null,
    site: "https://www.pncp.gov.br",
    descricao: "Portal centralizado de licitações e contratos públicos de todos os entes federativos.",
    competencias: [
      "Publicação obrigatória de editais (Lei 14.133/2021)",
      "Centralização de licitações federais, estaduais e municipais",
      "Transparência de contratos públicos",
      "API pública de dados de licitações",
    ],
  },
  // ─── ESTADUAIS ───
  {
    id: "arsesp",
    nome: "Agência Reguladora de Serviços Públicos do Estado de São Paulo",
    sigla: "ARSESP",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Energia"],
    uf: "SP",
    site: "https://www.arsesp.sp.gov.br",
    descricao: "Reguladora estadual de saneamento e energia em São Paulo, fiscaliza Sabesp e concessionárias.",
    competencias: [
      "Regulação da Sabesp e concessionárias",
      "Fiscalização de indicadores de qualidade",
      "Aprovação de tarifas",
      "Auditoria de investimentos",
    ],
  },
  {
    id: "arsae-mg",
    nome: "Agência Reguladora de Serviços de Abastecimento de Água e Esgotamento Sanitário de MG",
    sigla: "ARSAE-MG",
    tipo: "Agência Reguladora",
    setor: ["Saneamento"],
    uf: "MG",
    site: "https://www.arsae.mg.gov.br",
    descricao: "Reguladora de saneamento de Minas Gerais, fiscaliza Copasa e COPANOR.",
    competencias: [
      "Regulação da Copasa",
      "Revisões tarifárias",
      "Fiscalização de metas de universalização",
    ],
  },
  {
    id: "agepar",
    nome: "Agência Reguladora do Paraná",
    sigla: "AGEPAR",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Infraestrutura Rodoviária"],
    uf: "PR",
    site: "https://www.agepar.pr.gov.br",
    descricao: "Reguladora de saneamento e rodovias no Paraná.",
    competencias: [
      "Regulação da Sanepar",
      "Fiscalização de concessões rodoviárias",
      "Revisões tarifárias",
    ],
  },
  {
    id: "arce",
    nome: "Agência Reguladora do Estado do Ceará",
    sigla: "ARCE",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Energia"],
    uf: "CE",
    site: "https://www.arce.ce.gov.br",
    descricao: "Reguladora multissetorial do Ceará, fiscaliza Cagece e setor energético.",
    competencias: [
      "Regulação da Cagece",
      "Fiscalização de concessionárias de energia",
      "Regulação de gás canalizado",
    ],
  },
  {
    id: "agerba",
    nome: "Agência Estadual de Regulação de Serviços Públicos de Energia, Transportes e Comunicações da Bahia",
    sigla: "AGERBA",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Infraestrutura Rodoviária"],
    uf: "BA",
    site: "https://www.agerba.ba.gov.br",
    descricao: "Reguladora multissetorial da Bahia, fiscaliza Embasa e concessões rodoviárias.",
    competencias: [
      "Regulação da Embasa",
      "Concessões rodoviárias estaduais",
      "Fiscalização do ferry-boat e transportes",
    ],
  },
  {
    id: "arpe",
    nome: "Agência de Regulação de Pernambuco",
    sigla: "ARPE",
    tipo: "Agência Reguladora",
    setor: ["Saneamento"],
    uf: "PE",
    site: "https://www.arpe.pe.gov.br",
    descricao: "Reguladora de saneamento de Pernambuco, fiscaliza Compesa.",
    competencias: [
      "Regulação da Compesa",
      "Revisões tarifárias",
      "Fiscalização de qualidade da água",
    ],
  },
  {
    id: "adasa",
    nome: "Agência Reguladora de Águas, Energia e Saneamento do DF",
    sigla: "ADASA",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Recursos Hídricos"],
    uf: "DF",
    site: "https://www.adasa.df.gov.br",
    descricao: "Reguladora de saneamento e recursos hídricos do Distrito Federal, fiscaliza CAESB.",
    competencias: [
      "Regulação da CAESB",
      "Gestão de recursos hídricos do DF",
      "Outorga de uso de água",
    ],
  },
  {
    id: "agenersa",
    nome: "Agência Reguladora de Energia e Saneamento Básico do RJ",
    sigla: "AGENERSA",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Energia"],
    uf: "RJ",
    site: "https://www.agenersa.rj.gov.br",
    descricao: "Reguladora de saneamento e gás canalizado do Rio de Janeiro, fiscaliza CEDAE e Iguá.",
    competencias: [
      "Regulação da CEDAE e concessões",
      "Fiscalização de gás canalizado",
      "Controle de metas de universalização",
    ],
  },
  {
    id: "agergs",
    nome: "Agência Estadual de Regulação dos Serviços Públicos Delegados do RS",
    sigla: "AGERGS",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Infraestrutura Rodoviária"],
    uf: "RS",
    site: "https://www.agergs.rs.gov.br",
    descricao: "Reguladora multissetorial do Rio Grande do Sul, fiscaliza Corsan e rodovias.",
    competencias: [
      "Regulação da Corsan/Aegea",
      "Concessões rodoviárias estaduais",
      "Fiscalização de qualidade de serviços",
    ],
  },
  {
    id: "arsam",
    nome: "Agência Reguladora dos Serviços Públicos Concedidos do Amazonas",
    sigla: "ARSAM",
    tipo: "Agência Reguladora",
    setor: ["Saneamento", "Energia"],
    uf: "AM",
    site: "https://www.arsam.am.gov.br",
    descricao: "Reguladora de saneamento e energia do Amazonas.",
    competencias: [
      "Regulação de Águas de Manaus",
      "Fiscalização de serviços de energia",
      "Controle tarifário",
    ],
  },
  {
    id: "arsal",
    nome: "Agência Reguladora de Serviços Públicos do Estado de Alagoas",
    sigla: "ARSAL",
    tipo: "Agência Reguladora",
    setor: ["Saneamento"],
    uf: "AL",
    site: "https://www.arsal.al.gov.br",
    descricao: "Reguladora de saneamento de Alagoas, fiscaliza BRK Ambiental (PPP Maceió).",
    competencias: [
      "Regulação da PPP de saneamento de Maceió",
      "Fiscalização de indicadores SNIS",
      "Controle de qualidade da água",
    ],
  },
  {
    id: "agrespi",
    nome: "Agência de Regulação dos Serviços Públicos do Piauí",
    sigla: "AGRESPI",
    tipo: "Agência Reguladora",
    setor: ["Saneamento"],
    uf: "PI",
    site: "https://www.agrespi.pi.gov.br",
    descricao: "Reguladora de saneamento do Piauí, fiscaliza Agespisa.",
    competencias: [
      "Regulação da Agespisa",
      "Revisões tarifárias",
      "Fiscalização de metas",
    ],
  },
];

/** Mapeamento rápido por UF para consultas no mapa */
export const orgaosPorUF = orgaosReguladores.reduce<Record<string, OrgaoRegulador[]>>(
  (acc, o) => {
    const key = o.uf ?? "Federal";
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  },
  {},
);

/** Mapeamento por setor */
export const orgaosPorSetor = orgaosReguladores.reduce<Record<string, OrgaoRegulador[]>>(
  (acc, o) => {
    o.setor.forEach((s) => {
      if (!acc[s]) acc[s] = [];
      acc[s].push(o);
    });
    return acc;
  },
  {},
);
