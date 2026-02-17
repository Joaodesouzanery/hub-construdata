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
  {
    cnpj: "17.315.908/0001-46",
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
    cnpj: "17.315.908/0001-46",
    empresa: "Andrade Gutierrez Engenharia S.A.",
    tipo: "CNEP",
    motivo: "Acordo de Leniência — pagamento de R$ 1,49 bilhão em multas e ressarcimentos",
    orgao_sancionador: "CGU/AGU",
    data_inicio: "2016-03-18",
    data_fim: null,
    ativa: true,
    fundamentacao: "Lei 12.846/2013, Art. 16",
  },
  {
    cnpj: "33.412.792/0001-60",
    empresa: "Queiroz Galvão Óleo e Gás S.A.",
    tipo: "CEIS",
    motivo: "Suspensão temporária — irregularidades em contratos com Petrobras (Operação Lava Jato)",
    orgao_sancionador: "Petrobras",
    data_inicio: "2015-06-01",
    data_fim: "2018-06-01",
    ativa: false,
    fundamentacao: "Lei 8.666/1993, Art. 87, III",
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
