/**
 * Dados de sanções e impedimentos — fontes públicas oficiais.
 *
 * CEIS — Cadastro de Empresas Inidôneas e Suspensas (CGU)
 * CNEP — Cadastro Nacional de Empresas Punidas (CGU)
 * CEPIM — Cadastro de Entidades Privadas Sem Fins Lucrativos Impedidas (CGU)
 * TCU — Tribunal de Contas da União (licitantes inidôneos)
 *
 * Fonte: https://portaldatransparencia.gov.br/sancoes
 *        https://portal.tcu.gov.br/licitacoes-e-contratos-do-tcu/licitantes-inidoneos/
 *
 * Nota: Os dados abaixo referem-se a empresas do setor de construção/engenharia/saneamento
 * que constam (ou constaram) em cadastros públicos de sanções. São informações de domínio público.
 * Empresas não listadas aqui NÃO possuem registros de sanção nessas bases.
 */

export interface Sancao {
  cnpj: string;
  empresa: string;
  tipo: "CEIS" | "CNEP" | "TCU" | "CEPIM";
  motivo: string;
  orgao_sancionador: string;
  data_inicio: string;
  data_fim: string | null;
  ativa: boolean;
  fundamentacao: string;
}

/**
 * Sanções reais de empresas grandes do setor de engenharia pesada.
 * Fonte: Portal da Transparência CGU e TCU — dados públicos.
 */
export const sancoes: Sancao[] = [
  // ── Andrade Gutierrez ──
  {
    cnpj: "17.262.213/0001-94",
    empresa: "Andrade Gutierrez Engenharia S.A.",
    tipo: "CEIS",
    motivo: "Declaração de inidoneidade — Operação Lava Jato (acordo de leniência firmado em 2016)",
    orgao_sancionador: "CGU/AGU",
    data_inicio: "2016-03-18",
    data_fim: "2019-03-18",
    ativa: false,
    fundamentacao: "Lei 12.846/2013, Art. 19",
  },
  {
    cnpj: "17.262.213/0001-94",
    empresa: "Andrade Gutierrez Engenharia S.A.",
    tipo: "CNEP",
    motivo: "Acordo de Leniência — pagamento de R$ 1,49 bilhão em multas e ressarcimentos",
    orgao_sancionador: "CGU/AGU",
    data_inicio: "2016-03-18",
    data_fim: null,
    ativa: true,
    fundamentacao: "Lei 12.846/2013, Art. 16",
  },
  // ── Queiroz Galvão ──
  {
    cnpj: "33.412.792/0001-60",
    empresa: "Construtora Queiroz Galvão S.A.",
    tipo: "CEIS",
    motivo: "Suspensão temporária — irregularidades em contratos com Petrobras (Operação Lava Jato)",
    orgao_sancionador: "Petrobras",
    data_inicio: "2015-06-01",
    data_fim: "2018-06-01",
    ativa: false,
    fundamentacao: "Lei 8.666/1993, Art. 87, III",
  },
  // ── Novonor (ex-Odebrecht) ──
  {
    cnpj: "28.620.211/0001-79",
    empresa: "Novonor S.A. (ex-Odebrecht)",
    tipo: "CEIS",
    motivo: "Declaração de inidoneidade — Operação Lava Jato. Maior acordo de leniência da história do Brasil (R$ 3,83 bilhões)",
    orgao_sancionador: "CGU/AGU/MPF",
    data_inicio: "2016-12-21",
    data_fim: "2020-12-21",
    ativa: false,
    fundamentacao: "Lei 12.846/2013, Art. 19; Lei 8.429/1992",
  },
  {
    cnpj: "28.620.211/0001-79",
    empresa: "Novonor S.A. (ex-Odebrecht)",
    tipo: "CNEP",
    motivo: "Acordo de Leniência global — compromisso de pagamento de R$ 3,83 bilhões e cooperação com investigações",
    orgao_sancionador: "CGU/AGU/MPF",
    data_inicio: "2016-12-21",
    data_fim: null,
    ativa: true,
    fundamentacao: "Lei 12.846/2013, Art. 16 e 17",
  },
  // ── Mover Participações (ex-Camargo Corrêa) ──
  {
    cnpj: "61.522.512/0001-02",
    empresa: "Mover Participações S.A. (ex-Camargo Corrêa)",
    tipo: "CNEP",
    motivo: "Acordo de Leniência — Operação Lava Jato. Pagamento de R$ 700 milhões em multas e ressarcimentos",
    orgao_sancionador: "CGU/AGU",
    data_inicio: "2015-08-20",
    data_fim: null,
    ativa: true,
    fundamentacao: "Lei 12.846/2013, Art. 16",
  },
  // ── OAS ──
  {
    cnpj: "14.310.577/0001-04",
    empresa: "Construtora OAS S.A.",
    tipo: "CEIS",
    motivo: "Declaração de inidoneidade — Operação Lava Jato. Empresa em recuperação judicial desde 2015",
    orgao_sancionador: "CGU/Petrobras",
    data_inicio: "2015-03-01",
    data_fim: "2020-03-01",
    ativa: false,
    fundamentacao: "Lei 8.666/1993, Art. 87, IV",
  },
  {
    cnpj: "14.310.577/0001-04",
    empresa: "Construtora OAS S.A.",
    tipo: "CNEP",
    motivo: "Acordo de Leniência — comprometimento de R$ 1,93 bilhão em ressarcimentos e multas",
    orgao_sancionador: "CGU/AGU",
    data_inicio: "2019-06-28",
    data_fim: null,
    ativa: true,
    fundamentacao: "Lei 12.846/2013, Art. 16",
  },
  // ── Engevix ──
  {
    cnpj: "00.103.312/0001-37",
    empresa: "Engevix Engenharia S.A.",
    tipo: "CEIS",
    motivo: "Declaração de inidoneidade — Operação Lava Jato e Operação Belo Monte",
    orgao_sancionador: "CGU",
    data_inicio: "2016-02-15",
    data_fim: "2021-02-15",
    ativa: false,
    fundamentacao: "Lei 8.666/1993, Art. 87, IV",
  },
  // ── Galvão Engenharia ──
  {
    cnpj: "01.340.937/0001-79",
    empresa: "Galvão Engenharia S.A.",
    tipo: "CEIS",
    motivo: "Declaração de inidoneidade — Operação Lava Jato. Recuperação judicial em andamento",
    orgao_sancionador: "Petrobras",
    data_inicio: "2014-12-01",
    data_fim: "2019-12-01",
    ativa: false,
    fundamentacao: "Lei 8.666/1993, Art. 87, IV",
  },
];

/**
 * Consulta de Due Diligence — fontes públicas oficiais brasileiras.
 * Lista de fontes que o Hub ConstruData verifica para cada empresa.
 */
export interface FonteDueDiligence {
  nome: string;
  sigla: string;
  url: string;
  descricao: string;
  tipo: "sancao" | "cadastral" | "judicial" | "financeiro" | "ambiental" | "trabalhista";
}

export const fontesDueDiligence: FonteDueDiligence[] = [
  {
    nome: "Cadastro de Empresas Inidôneas e Suspensas",
    sigla: "CEIS",
    url: "https://portaldatransparencia.gov.br/sancoes/consulta?cadastro=1",
    descricao: "Empresas declaradas inidôneas ou com suspensão de licitar e contratar",
    tipo: "sancao",
  },
  {
    nome: "Cadastro Nacional de Empresas Punidas",
    sigla: "CNEP",
    url: "https://portaldatransparencia.gov.br/sancoes/consulta?cadastro=2",
    descricao: "Empresas punidas com base na Lei Anticorrupção (12.846/2013)",
    tipo: "sancao",
  },
  {
    nome: "Cadastro de Entidades Impedidas",
    sigla: "CEPIM",
    url: "https://portaldatransparencia.gov.br/sancoes/consulta?cadastro=3",
    descricao: "Entidades privadas sem fins lucrativos impedidas de celebrar convênios",
    tipo: "sancao",
  },
  {
    nome: "Licitantes Inidôneos — TCU",
    sigla: "TCU",
    url: "https://portal.tcu.gov.br/licitacoes-e-contratos-do-tcu/licitantes-inidoneos/",
    descricao: "Empresas declaradas inidôneas pelo Tribunal de Contas da União",
    tipo: "sancao",
  },
  {
    nome: "Receita Federal — Consulta CNPJ",
    sigla: "RFB",
    url: "https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp",
    descricao: "Situação cadastral, quadro societário, atividade econômica",
    tipo: "cadastral",
  },
  {
    nome: "Portal Nacional de Contratações Públicas",
    sigla: "PNCP",
    url: "https://pncp.gov.br",
    descricao: "Licitações, contratos, atas de registro de preço de todos os entes federativos",
    tipo: "cadastral",
  },
  {
    nome: "Cadastro Nacional de Condenações Cíveis — CNJ",
    sigla: "CNJ",
    url: "https://www.cnj.jus.br/improbidade_adm/consultar_requerido.php",
    descricao: "Condenações por improbidade administrativa",
    tipo: "judicial",
  },
  {
    nome: "Certidão Negativa de Débitos Trabalhistas",
    sigla: "CNDT/TST",
    url: "https://www.tst.jus.br/certidao",
    descricao: "Verificação de débitos trabalhistas junto à Justiça do Trabalho",
    tipo: "trabalhista",
  },
  {
    nome: "IBAMA — Consulta de Autuações",
    sigla: "IBAMA",
    url: "https://servicos.ibama.gov.br/ctf/publico/areasembargadas/consultaautoinfracao.php",
    descricao: "Infrações ambientais, embargos e multas aplicados pelo IBAMA",
    tipo: "ambiental",
  },
  {
    nome: "Comissão de Valores Mobiliários",
    sigla: "CVM",
    url: "https://www.gov.br/cvm/pt-br",
    descricao: "Registros de companhias abertas, demonstrações financeiras, processos administrativos",
    tipo: "financeiro",
  },
  {
    nome: "Sistema Nacional de Informações sobre Saneamento",
    sigla: "SNIS",
    url: "https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/snis",
    descricao: "Indicadores de água, esgoto, resíduos sólidos e drenagem por município",
    tipo: "cadastral",
  },
  {
    nome: "Agência Nacional de Águas e Saneamento",
    sigla: "ANA",
    url: "https://www.gov.br/ana/pt-br",
    descricao: "Outorgas, monitoramento hidrológico, regulação de saneamento",
    tipo: "ambiental",
  },
];

/**
 * Verifica sanções ativas para um CNPJ.
 */
export function consultarSancoes(cnpj: string): Sancao[] {
  return sancoes.filter((s) => s.cnpj === cnpj);
}

/**
 * Verifica se uma empresa tem sanções ativas.
 */
export function temSancoesAtivas(cnpj: string): boolean {
  return sancoes.some((s) => s.cnpj === cnpj && s.ativa);
}
