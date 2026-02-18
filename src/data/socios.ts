/**
 * Dados de Sócios e Administradores (QSA) de empresas do setor de construção civil,
 * saneamento e infraestrutura no Brasil.
 *
 * CONFORMIDADE LGPD:
 * Todos os dados aqui contidos são de natureza pública, extraídos de:
 * - Receita Federal do Brasil — Quadro de Sócios e Administradores (QSA), disponível
 *   nos dados abertos de CNPJ (https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj)
 * - Comissão de Valores Mobiliários (CVM) — Formulários de Referência e Informes de
 *   Governança Corporativa de companhias abertas (https://www.gov.br/cvm)
 * - B3 S.A. — Informações de companhias listadas na bolsa de valores brasileira
 * - NYSE/SEC — Formulários 20-F de empresas brasileiras listadas nos EUA
 * - Diários Oficiais da União, dos Estados e dos Municípios
 *
 * Nomes de pessoas físicas aqui listados referem-se exclusivamente a dirigentes,
 * administradores e acionistas de companhias abertas ou de grande porte, cujas
 * informações são de divulgação obrigatória por força de lei (Lei 6.404/76,
 * Instrução CVM 480, Lei 12.527/2011 — Lei de Acesso à Informação).
 *
 * Este arquivo NÃO contém dados pessoais sensíveis (CPF completo, endereço residencial,
 * dados bancários, etc.).
 */

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Socio {
  empresa_id: string;
  empresa_nome: string;
  nome: string;
  tipo: "Pessoa Física" | "Pessoa Jurídica";
  qualificacao: string;
  data_entrada: string;
  participacao_percentual: number | null;
  representante_legal?: string;
}

export interface VinculoPessoal {
  pessoa: string;
  empresas: { empresa_id: string; cargo: string }[];
  tipo_vinculo: "diretor_multiplo" | "socio_comum" | "parentesco" | "ex_funcionario";
  risco: "alto" | "medio" | "baixo";
  descricao: string;
}

// ─── Sócios e Administradores ────────────────────────────────────────────────

export const socios: Socio[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  //  1. SABESP — Companhia de Saneamento Básico do Estado de São Paulo
  //     Listada na B3 (SBSP3) e NYSE (SBS). Dados de Formulário de Referência CVM.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "sabesp",
    empresa_nome: "Sabesp",
    nome: "Estado de São Paulo",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1973-09-01",
    participacao_percentual: 50.3,
  },
  {
    empresa_id: "sabesp",
    empresa_nome: "Sabesp",
    nome: "Equatorial Energia S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Referência (Investidor Estratégico)",
    data_entrada: "2024-07-22",
    participacao_percentual: 15.0,
  },
  {
    empresa_id: "sabesp",
    empresa_nome: "Sabesp",
    nome: "Carlos Augusto Leone Piani",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2024-07-22",
    participacao_percentual: null,
  },
  {
    empresa_id: "sabesp",
    empresa_nome: "Sabesp",
    nome: "Daniel Szlak",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Financeiro e de Relações com Investidores (CFO)",
    data_entrada: "2024-07-22",
    participacao_percentual: null,
  },
  {
    empresa_id: "sabesp",
    empresa_nome: "Sabesp",
    nome: "Catia Luana Bulhões",
    tipo: "Pessoa Física",
    qualificacao: "Diretora de Operações",
    data_entrada: "2024-07-22",
    participacao_percentual: null,
  },
  {
    empresa_id: "sabesp",
    empresa_nome: "Sabesp",
    nome: "André Salcedo",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração",
    data_entrada: "2024-07-22",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  2. AEGEA — Aegea Saneamento e Participações S.A.
  //     Fonte: CVM, dados abertos CNPJ, relatórios anuais.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "aegea",
    empresa_nome: "Aegea Saneamento",
    nome: "Equipav S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Grupo Equipav)",
    data_entrada: "2010-01-15",
    participacao_percentual: 36.0,
  },
  {
    empresa_id: "aegea",
    empresa_nome: "Aegea Saneamento",
    nome: "GIC Private Limited",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista (Fundo Soberano de Singapura)",
    data_entrada: "2019-06-01",
    participacao_percentual: 24.0,
  },
  {
    empresa_id: "aegea",
    empresa_nome: "Aegea Saneamento",
    nome: "Itaúsa S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista",
    data_entrada: "2021-09-01",
    participacao_percentual: 15.0,
  },
  {
    empresa_id: "aegea",
    empresa_nome: "Aegea Saneamento",
    nome: "Radamés Andrade Casseb",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2021-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "aegea",
    empresa_nome: "Aegea Saneamento",
    nome: "José Carlos Araripe Queiroz Albuquerque",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração",
    data_entrada: "2010-01-15",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  3. ANDRADE GUTIERREZ — Andrade Gutierrez Engenharia S.A.
  //     Fonte: Receita Federal QSA, CVM, relatórios públicos.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "andrade-gutierrez",
    empresa_nome: "Andrade Gutierrez",
    nome: "AG Participações S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Holding Familiar)",
    data_entrada: "1948-01-01",
    participacao_percentual: 100.0,
  },
  {
    empresa_id: "andrade-gutierrez",
    empresa_nome: "Andrade Gutierrez",
    nome: "Roberto Andrade Gutierrez",
    tipo: "Pessoa Física",
    qualificacao: "Sócio (Família Andrade Gutierrez)",
    data_entrada: "1980-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "andrade-gutierrez",
    empresa_nome: "Andrade Gutierrez",
    nome: "Sérgio Augusto Arap Andrade Gutierrez",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração",
    data_entrada: "2018-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "andrade-gutierrez",
    empresa_nome: "Andrade Gutierrez",
    nome: "Antonio Frederico Gomes de Souza",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente",
    data_entrada: "2019-03-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  4. QUEIROZ GALVÃO — Construtora Queiroz Galvão S.A.
  //     Fonte: Receita Federal QSA, JUCESP.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "queiroz-galvao",
    empresa_nome: "Queiroz Galvão",
    nome: "Queiroz Galvão Participações S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Holding Familiar)",
    data_entrada: "1953-01-01",
    participacao_percentual: 100.0,
  },
  {
    empresa_id: "queiroz-galvao",
    empresa_nome: "Queiroz Galvão",
    nome: "Antônio Augusto Queiroz Galvão",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração",
    data_entrada: "2002-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "queiroz-galvao",
    empresa_nome: "Queiroz Galvão",
    nome: "José Augusto Queiroz Galvão",
    tipo: "Pessoa Física",
    qualificacao: "Conselheiro (Família Queiroz Galvão)",
    data_entrada: "1990-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  5. NOVONOR (ex-Odebrecht)
  //     Fonte: CVM, Receita Federal, Formulário de Referência, acordos judiciais.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "novonor",
    empresa_nome: "Novonor",
    nome: "Kieppe Participações S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Holding Família Odebrecht)",
    data_entrada: "1944-01-01",
    participacao_percentual: 100.0,
  },
  {
    empresa_id: "novonor",
    empresa_nome: "Novonor",
    nome: "Marcelo Bahia Odebrecht",
    tipo: "Pessoa Física",
    qualificacao: "Ex-Presidente (afastado em 2015)",
    data_entrada: "2008-06-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "novonor",
    empresa_nome: "Novonor",
    nome: "Emílio Alves Odebrecht",
    tipo: "Pessoa Física",
    qualificacao: "Presidente Emérito do Conselho de Administração",
    data_entrada: "1970-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "novonor",
    empresa_nome: "Novonor",
    nome: "Maurício Medeiros de Albuquerque",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO pós-reestruturação)",
    data_entrada: "2020-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  6. OAS — Construtora OAS S.A.
  //     Fonte: Receita Federal QSA, autos de recuperação judicial.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "oas",
    empresa_nome: "OAS",
    nome: "OAS Investimentos S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1976-01-01",
    participacao_percentual: 100.0,
  },
  {
    empresa_id: "oas",
    empresa_nome: "OAS",
    nome: "César de Araújo Mata Pires",
    tipo: "Pessoa Física",
    qualificacao: "Fundador e Ex-Controlador",
    data_entrada: "1976-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "oas",
    empresa_nome: "OAS",
    nome: "José Aldemário Pinheiro Filho",
    tipo: "Pessoa Física",
    qualificacao: "Ex-Presidente (Léo Pinheiro)",
    data_entrada: "2000-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  7. MRV ENGENHARIA — MRV Engenharia e Participações S.A.
  //     Listada na B3 (MRVE3). Fonte: CVM Formulário de Referência.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "mrv-engenharia",
    empresa_nome: "MRV Engenharia",
    nome: "Rubens Menin Teixeira de Souza",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração e Fundador",
    data_entrada: "1979-01-01",
    participacao_percentual: 32.2,
  },
  {
    empresa_id: "mrv-engenharia",
    empresa_nome: "MRV Engenharia",
    nome: "Rafael Nazareth Menin Teixeira de Souza",
    tipo: "Pessoa Física",
    qualificacao: "Co-Presidente Executivo (Co-CEO)",
    data_entrada: "2020-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "mrv-engenharia",
    empresa_nome: "MRV Engenharia",
    nome: "Eduardo de Souza Fischer",
    tipo: "Pessoa Física",
    qualificacao: "Co-Presidente Executivo (Co-CEO)",
    data_entrada: "2020-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "mrv-engenharia",
    empresa_nome: "MRV Engenharia",
    nome: "Ricardo Paixão Pael",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Financeiro e de Relações com Investidores (CFO)",
    data_entrada: "2021-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  8. CCR S.A.
  //     Listada na B3 (CCRO3). Fonte: CVM Formulário de Referência.
  //     Histórico de controle por Andrade Gutierrez, Camargo Corrêa (hoje Mover) e Soares Penido.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "ccr",
    empresa_nome: "CCR",
    nome: "Mover Participações S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista (ex-Camargo Corrêa Investimentos)",
    data_entrada: "1999-04-01",
    participacao_percentual: 14.9,
  },
  {
    empresa_id: "ccr",
    empresa_nome: "CCR",
    nome: "Andrade Gutierrez Concessões S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista",
    data_entrada: "1999-04-01",
    participacao_percentual: 14.9,
  },
  {
    empresa_id: "ccr",
    empresa_nome: "CCR",
    nome: "Soares Penido Concessões S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista",
    data_entrada: "1999-04-01",
    participacao_percentual: 14.9,
  },
  {
    empresa_id: "ccr",
    empresa_nome: "CCR",
    nome: "Miguel Setas",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2022-07-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "ccr",
    empresa_nome: "CCR",
    nome: "Ana Maria Marcondes Penido Sant'Anna",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração",
    data_entrada: "2020-04-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  9. NEOENERGIA S.A.
  //     Listada na B3 (NEOE3). Controlada pela Iberdrola S.A. (Espanha).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "neoenergia",
    empresa_nome: "Neoenergia",
    nome: "Iberdrola Energia S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "2017-06-01",
    participacao_percentual: 53.5,
  },
  {
    empresa_id: "neoenergia",
    empresa_nome: "Neoenergia",
    nome: "Previ — Caixa de Previdência dos Funcionários do Banco do Brasil",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Relevante (Fundo de Pensão)",
    data_entrada: "1997-01-01",
    participacao_percentual: 8.0,
  },
  {
    empresa_id: "neoenergia",
    empresa_nome: "Neoenergia",
    nome: "Eduardo Capelastegui Saiz",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2019-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "neoenergia",
    empresa_nome: "Neoenergia",
    nome: "Leonardo Pimenta Azevedo",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Financeiro e de Relações com Investidores (CFO)",
    data_entrada: "2019-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  10. COPASA — Companhia de Saneamento de Minas Gerais
  //      Listada na B3 (CSMG3). Controlada pelo Estado de MG.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "copasa",
    empresa_nome: "Copasa",
    nome: "Estado de Minas Gerais",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1963-01-01",
    participacao_percentual: 50.04,
  },
  {
    empresa_id: "copasa",
    empresa_nome: "Copasa",
    nome: "Guilherme Augusto Coelho Dias",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente",
    data_entrada: "2023-02-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "copasa",
    empresa_nome: "Copasa",
    nome: "Gabriel Bueno Bahia",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Financeiro e de Relações com Investidores",
    data_entrada: "2023-02-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  11. SANEPAR — Companhia de Saneamento do Paraná
  //      Listada na B3 (SAPR11). Controlada pelo Estado do PR.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "sanepar",
    empresa_nome: "Sanepar",
    nome: "Estado do Paraná",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1963-01-01",
    participacao_percentual: 60.1,
  },
  {
    empresa_id: "sanepar",
    empresa_nome: "Sanepar",
    nome: "Dominvs S.A. (Grupo Sanepar)",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista (Bloco de Controle)",
    data_entrada: "2002-01-01",
    participacao_percentual: 20.0,
  },
  {
    empresa_id: "sanepar",
    empresa_nome: "Sanepar",
    nome: "Abel Demetrio",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente",
    data_entrada: "2023-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  12. BRK AMBIENTAL — BRK Ambiental Participações S.A.
  //      Controlada pela Brookfield Asset Management (Canadá).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "brk",
    empresa_nome: "BRK Ambiental",
    nome: "Brookfield Asset Management Inc.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "2017-09-01",
    participacao_percentual: 70.0,
  },
  {
    empresa_id: "brk",
    empresa_nome: "BRK Ambiental",
    nome: "Fundo de Investimento do FGTS — FI-FGTS",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Minoritário Relevante",
    data_entrada: "2017-09-01",
    participacao_percentual: 30.0,
  },
  {
    empresa_id: "brk",
    empresa_nome: "BRK Ambiental",
    nome: "Teresa Vernaglia",
    tipo: "Pessoa Física",
    qualificacao: "Diretora Presidente (CEO)",
    data_entrada: "2019-07-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  13. IGUÁ SANEAMENTO S.A.
  //      Controlada pela IG4 Capital (Paulo Mattos).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "igua",
    empresa_nome: "Iguá Saneamento",
    nome: "IG4 Capital Investimentos Ltda.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "2017-09-01",
    participacao_percentual: 55.0,
  },
  {
    empresa_id: "igua",
    empresa_nome: "Iguá Saneamento",
    nome: "Alberta Investment Management Corporation (AIMCo)",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista (Fundo de Pensão Canadense)",
    data_entrada: "2019-01-01",
    participacao_percentual: 30.0,
  },
  {
    empresa_id: "igua",
    empresa_nome: "Iguá Saneamento",
    nome: "Paulo Mattos",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração (Fundador IG4)",
    data_entrada: "2017-09-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "igua",
    empresa_nome: "Iguá Saneamento",
    nome: "Carlos Henrique Brandão Nascimento",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2021-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  14. CYRELA BRAZIL REALTY
  //      Listada na B3 (CYRE3). Fundador: Elie Horn.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "cyrela",
    empresa_nome: "Cyrela",
    nome: "Elie Horn",
    tipo: "Pessoa Física",
    qualificacao: "Fundador e Presidente do Conselho de Administração",
    data_entrada: "1962-01-01",
    participacao_percentual: 22.3,
  },
  {
    empresa_id: "cyrela",
    empresa_nome: "Cyrela",
    nome: "Efraim Horn",
    tipo: "Pessoa Física",
    qualificacao: "Co-Presidente Executivo (Co-CEO)",
    data_entrada: "2012-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "cyrela",
    empresa_nome: "Cyrela",
    nome: "Raphael Horn",
    tipo: "Pessoa Física",
    qualificacao: "Co-Presidente Executivo (Co-CEO)",
    data_entrada: "2012-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  15. MOVER PARTICIPAÇÕES (ex-Camargo Corrêa)
  //      Fonte: CVM, Receita Federal QSA.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "mover-participacoes",
    empresa_nome: "Mover Participações",
    nome: "Participações Morro Vermelho S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Holding Família Camargo Corrêa)",
    data_entrada: "1939-01-01",
    participacao_percentual: 100.0,
  },
  {
    empresa_id: "mover-participacoes",
    empresa_nome: "Mover Participações",
    nome: "Rosana Camargo de Arruda Botelho",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração",
    data_entrada: "2012-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "mover-participacoes",
    empresa_nome: "Mover Participações",
    nome: "Renata de Camargo Nascimento",
    tipo: "Pessoa Física",
    qualificacao: "Conselheira (Família Camargo)",
    data_entrada: "2012-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  16. ECORODOVIAS
  //      Listada na B3 (ECOR3). Controlada pelo Grupo Gianetti (ASTM/SIAS Italia).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "ecorodovias",
    empresa_nome: "Ecorodovias",
    nome: "ASTM S.p.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Grupo Gianetti — Itália)",
    data_entrada: "2020-12-01",
    participacao_percentual: 50.0,
  },
  {
    empresa_id: "ecorodovias",
    empresa_nome: "Ecorodovias",
    nome: "Marcello Guidotti",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2022-05-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  17. ARTERIS S.A.
  //      Controlada por Partícipes en Brasil (Abertis/Mundys — Itália/Espanha).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "arteris",
    empresa_nome: "Arteris",
    nome: "Partícipes en Brasil S.L.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Abertis/Mundys)",
    data_entrada: "2013-01-01",
    participacao_percentual: 99.98,
    representante_legal: "Alexia Bouchères",
  },
  {
    empresa_id: "arteris",
    empresa_nome: "Arteris",
    nome: "David Antonio Díaz Almazán",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2023-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  18. CPFL ENERGIA S.A.
  //      Listada na B3 (CPFE3). Controlada pela State Grid (China).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "cpfl-energia",
    empresa_nome: "CPFL Energia",
    nome: "State Grid Brazil Holding S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (State Grid Corporation of China)",
    data_entrada: "2017-01-01",
    participacao_percentual: 83.6,
  },
  {
    empresa_id: "cpfl-energia",
    empresa_nome: "CPFL Energia",
    nome: "Gustavo Estrella",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2018-04-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "cpfl-energia",
    empresa_nome: "CPFL Energia",
    nome: "Pan Yungui",
    tipo: "Pessoa Física",
    qualificacao: "Presidente do Conselho de Administração",
    data_entrada: "2020-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  19. DIRECIONAL ENGENHARIA S.A.
  //      Listada na B3 (DIRR3).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "direcional",
    empresa_nome: "Direcional Engenharia",
    nome: "Ricardo Ribeiro Valadares Gontijo",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO) e Acionista Controlador",
    data_entrada: "1981-01-01",
    participacao_percentual: 49.6,
  },
  {
    empresa_id: "direcional",
    empresa_nome: "Direcional Engenharia",
    nome: "Henrique Paim de Souza Gontijo",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Vice-Presidente de Novos Negócios",
    data_entrada: "2018-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  20. ORIZON VALORIZAÇÃO DE RESÍDUOS S.A.
  //      Listada na B3 (ORVR3).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "orizon",
    empresa_nome: "Orizon",
    nome: "Jall Investimentos e Participações S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "2010-01-01",
    participacao_percentual: 25.0,
  },
  {
    empresa_id: "orizon",
    empresa_nome: "Orizon",
    nome: "Milton Pilão Júnior",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2020-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  21. BARBOSA MELLO
  //      Fonte: Receita Federal QSA, Junta Comercial de MG.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "barbosa-mello",
    empresa_nome: "Barbosa Mello",
    nome: "BME Participações S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Holding Familiar)",
    data_entrada: "1953-01-01",
    participacao_percentual: 100.0,
  },
  {
    empresa_id: "barbosa-mello",
    empresa_nome: "Barbosa Mello",
    nome: "Rodrigo Barbosa Mello",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente",
    data_entrada: "2015-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  22. CEDAE — Companhia Estadual de Águas e Esgotos do RJ
  //      Controlada pelo Estado do RJ. Concessão parcial transferida à Aegea em 2021.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "cedae",
    empresa_nome: "CEDAE",
    nome: "Estado do Rio de Janeiro",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1975-01-01",
    participacao_percentual: 99.9,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  23. CAGECE — Companhia de Água e Esgoto do Ceará
  //      Controlada pelo Estado do Ceará.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "cagece",
    empresa_nome: "Cagece",
    nome: "Estado do Ceará",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1971-01-01",
    participacao_percentual: 83.0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  24. EMBASA — Empresa Baiana de Águas e Saneamento
  //      Controlada pelo Estado da Bahia.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "embasa",
    empresa_nome: "Embasa",
    nome: "Estado da Bahia",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1971-01-01",
    participacao_percentual: 99.9,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  25. OMEGA ENERGIA S.A.
  //      Listada na B3 (MEGA3).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "omega-energia",
    empresa_nome: "Omega Energia",
    nome: "Tarpon Gestora de Recursos S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista de Referência",
    data_entrada: "2008-01-01",
    participacao_percentual: 15.0,
  },
  {
    empresa_id: "omega-energia",
    empresa_nome: "Omega Energia",
    nome: "Antonio Augusto Torres de Bastos Filho",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Presidente (CEO)",
    data_entrada: "2018-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  26. CASA DOS VENTOS
  //      Capital fechado. Família Mário Araripe.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "casa-dos-ventos",
    empresa_nome: "Casa dos Ventos",
    nome: "Mário Araripe de Alencar Júnior",
    tipo: "Pessoa Física",
    qualificacao: "Fundador e Presidente",
    data_entrada: "2006-01-01",
    participacao_percentual: null,
  },
  {
    empresa_id: "casa-dos-ventos",
    empresa_nome: "Casa dos Ventos",
    nome: "Lucas de Queiroz Galvão Araripe",
    tipo: "Pessoa Física",
    qualificacao: "Diretor Executivo",
    data_entrada: "2015-01-01",
    participacao_percentual: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  27. CORSAN (privatizada — adquirida por Aegea em 2023)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "corsan",
    empresa_nome: "CORSAN",
    nome: "Aegea Saneamento e Participações S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (pós-privatização 2023)",
    data_entrada: "2023-06-01",
    participacao_percentual: 100.0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  28. GS INIMA BRASIL LTDA.
  //      Subsidiária da GS E&C Corp (Coreia do Sul).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "gs-inima",
    empresa_nome: "GS Inima Brasil",
    nome: "GS Inima Environment S.A.",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador (Grupo GS — Coreia do Sul)",
    data_entrada: "2009-01-01",
    participacao_percentual: 100.0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  29. SANEAGO — Saneamento de Goiás S.A.
  //      Controlada pelo Estado de Goiás.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "saneago",
    empresa_nome: "Saneago",
    nome: "Estado de Goiás",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1967-01-01",
    participacao_percentual: 99.0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  30. CAESB — Saneamento do Distrito Federal
  //      Controlada pelo Governo do DF.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    empresa_id: "caesb",
    empresa_nome: "CAESB",
    nome: "Governo do Distrito Federal",
    tipo: "Pessoa Jurídica",
    qualificacao: "Acionista Controlador",
    data_entrada: "1969-01-01",
    participacao_percentual: 99.0,
  },
];

// ─── Vínculos Pessoais (Relações Cruzadas) ──────────────────────────────────

export const vinculosPessoais: VinculoPessoal[] = [
  // ─── 1. Andrade Gutierrez como acionista da CCR ────────────────────────────
  {
    pessoa: "Andrade Gutierrez Concessões S.A.",
    empresas: [
      { empresa_id: "andrade-gutierrez", cargo: "Holding Controladora" },
      { empresa_id: "ccr", cargo: "Acionista (14,9%)" },
    ],
    tipo_vinculo: "socio_comum",
    risco: "alto",
    descricao:
      "A Andrade Gutierrez Engenharia, por meio de sua subsidiária AG Concessões, é acionista " +
      "relevante da CCR S.A. desde a fundação da concessionária em 1999. Esse vínculo societário " +
      "cruzado entre construtora e concessionária de rodovias é de domínio público e monitorado " +
      "pela CVM e pelo CADE. A AG foi implicada na Operação Lava Jato por irregularidades em " +
      "concessões rodoviárias.",
  },

  // ─── 2. Mover (ex-Camargo Corrêa) como acionista da CCR ───────────────────
  {
    pessoa: "Mover Participações S.A.",
    empresas: [
      { empresa_id: "mover-participacoes", cargo: "Holding" },
      { empresa_id: "ccr", cargo: "Acionista (14,9%)" },
    ],
    tipo_vinculo: "socio_comum",
    risco: "alto",
    descricao:
      "A Mover Participações (ex-Camargo Corrêa) detém participação na CCR desde a fundação " +
      "em 1999, configurando vínculo cruzado entre construtora de infraestrutura e concessionária " +
      "rodoviária. A Camargo Corrêa firmou acordo de leniência no âmbito da Lava Jato por " +
      "práticas de cartel em licitações de infraestrutura.",
  },

  // ─── 3. Família Menin: MRV e participações em mídia ────────────────────────
  {
    pessoa: "Rubens Menin Teixeira de Souza",
    empresas: [
      { empresa_id: "mrv-engenharia", cargo: "Presidente do Conselho / Fundador" },
    ],
    tipo_vinculo: "diretor_multiplo",
    risco: "medio",
    descricao:
      "Rubens Menin é fundador e presidente do conselho da MRV Engenharia (B3: MRVE3), " +
      "a maior construtora residencial da América Latina. Também é controlador do Banco Inter " +
      "(B3: INBR32) e da CNN Brasil, configurando influência significativa nos setores de " +
      "construção, financeiro e de mídia. Informação de domínio público (CVM e B3).",
  },

  // ─── 4. Aegea controlando CORSAN pós-privatização ─────────────────────────
  {
    pessoa: "Aegea Saneamento e Participações S.A.",
    empresas: [
      { empresa_id: "aegea", cargo: "Holding" },
      { empresa_id: "corsan", cargo: "Acionista Controlador (100% pós-privatização)" },
    ],
    tipo_vinculo: "socio_comum",
    risco: "medio",
    descricao:
      "A Aegea Saneamento adquiriu o controle da CORSAN (RS) no leilão de privatização " +
      "realizado pela B3 em junho de 2023 por R$ 4,15 bilhões. Isso faz da Aegea a maior " +
      "empresa privada de saneamento do Brasil, operando em mais de 500 municípios. Informação " +
      "pública do edital de privatização do Estado do RS.",
  },

  // ─── 5. Brookfield como acionista da BRK e investidora em infraestrutura ──
  {
    pessoa: "Brookfield Asset Management Inc.",
    empresas: [
      { empresa_id: "brk", cargo: "Acionista Controlador (70%)" },
    ],
    tipo_vinculo: "socio_comum",
    risco: "medio",
    descricao:
      "A Brookfield Asset Management (Canadá) é a controladora da BRK Ambiental desde 2017, " +
      "quando adquiriu o controle da então Odebrecht Ambiental. A Brookfield também possui " +
      "investimentos em outros segmentos de infraestrutura no Brasil (energia, rodovias, " +
      "imobiliário), gerando potenciais conflitos de interesse em licitações integradas.",
  },

  // ─── 6. Família Odebrecht e reestruturação Novonor ─────────────────────────
  {
    pessoa: "Família Odebrecht (Kieppe Participações S.A.)",
    empresas: [
      { empresa_id: "novonor", cargo: "Acionista Controlador Indireto (via Kieppe)" },
    ],
    tipo_vinculo: "parentesco",
    risco: "alto",
    descricao:
      "A família Odebrecht (Norberto, Emílio, Marcelo) controla a Novonor S.A. (ex-Odebrecht) " +
      "por meio da holding Kieppe Participações. Marcelo Odebrecht foi condenado e preso na " +
      "Operação Lava Jato. A empresa passou por recuperação judicial e reestruturação societária. " +
      "Todos os dados são de domínio público (CVM, STF, acordos de leniência).",
  },

  // ─── 7. Elie Horn e família — Cyrela ──────────────────────────────────────
  {
    pessoa: "Elie Horn",
    empresas: [
      { empresa_id: "cyrela", cargo: "Fundador, Presidente do Conselho, Acionista (22,3%)" },
    ],
    tipo_vinculo: "parentesco",
    risco: "baixo",
    descricao:
      "Elie Horn é o fundador da Cyrela Brazil Realty e mantém participação de 22,3% na " +
      "empresa. Seus filhos Efraim Horn e Raphael Horn atuam como co-CEOs da companhia, " +
      "configurando uma típica sucessão familiar em empresa listada. Dados públicos do " +
      "Formulário de Referência CVM.",
  },

  // ─── 8. IG4 Capital e Paulo Mattos — Iguá e investimentos em infraestrutura
  {
    pessoa: "Paulo Mattos",
    empresas: [
      { empresa_id: "igua", cargo: "Presidente do Conselho (via IG4 Capital)" },
    ],
    tipo_vinculo: "diretor_multiplo",
    risco: "baixo",
    descricao:
      "Paulo Mattos é fundador e gestor da IG4 Capital, que controla a Iguá Saneamento. " +
      "A IG4 Capital possui investimentos em outros setores de infraestrutura no Brasil e na " +
      "América Latina (portos, energia), o que pode gerar sinergias ou conflitos de interesse " +
      "em licitações de saneamento integrado.",
  },

  // ─── 9. Iberdrola como controladora da Neoenergia e player global ─────────
  {
    pessoa: "Iberdrola Energia S.A.",
    empresas: [
      { empresa_id: "neoenergia", cargo: "Acionista Controlador (53,5%)" },
    ],
    tipo_vinculo: "socio_comum",
    risco: "baixo",
    descricao:
      "A Iberdrola (Espanha), uma das maiores utilities do mundo, controla a Neoenergia desde " +
      "2017 com 53,5% do capital. A Iberdrola também atua globalmente em distribuição, " +
      "transmissão e geração de energia renovável. A Previ (fundo de pensão do Banco do Brasil) " +
      "detém participação minoritária relevante de ~8%.",
  },

  // ─── 10. Soares Penido: construção + concessões (CCR) ─────────────────────
  {
    pessoa: "Soares Penido Concessões S.A.",
    empresas: [
      { empresa_id: "ccr", cargo: "Acionista (14,9%)" },
    ],
    tipo_vinculo: "socio_comum",
    risco: "medio",
    descricao:
      "A Soares Penido é um dos três acionistas originais da CCR (ao lado de Andrade Gutierrez " +
      "e Camargo Corrêa/Mover), cada um com participação de 14,9%. A Ana Maria Marcondes Penido " +
      "Sant'Anna, da família Soares Penido, preside o Conselho de Administração da CCR. " +
      "Configuração típica de grupo construtor que migra para concessões, monitorado pelo CADE.",
  },

  // ─── 11. State Grid como controladora da CPFL e investidora em energia ────
  {
    pessoa: "State Grid Corporation of China",
    empresas: [
      { empresa_id: "cpfl-energia", cargo: "Acionista Controlador (83,6% via State Grid Brazil Holding)" },
    ],
    tipo_vinculo: "socio_comum",
    risco: "medio",
    descricao:
      "A State Grid Corporation of China, maior empresa de energia elétrica do mundo, controla " +
      "a CPFL Energia com 83,6% do capital desde 2017. A State Grid também detém participações " +
      "em empresas de transmissão de energia no Brasil, gerando concentração significativa no " +
      "setor elétrico brasileiro. Monitorado pela ANEEL e pelo CADE.",
  },

  // ─── 12. César Mata Pires — OAS e histórico Lava Jato ────────────────────
  {
    pessoa: "César de Araújo Mata Pires",
    empresas: [
      { empresa_id: "oas", cargo: "Fundador e Ex-Controlador" },
    ],
    tipo_vinculo: "parentesco",
    risco: "alto",
    descricao:
      "César Mata Pires foi o fundador e controlador da Construtora OAS, uma das maiores " +
      "empreiteiras do Brasil. A OAS entrou em recuperação judicial em 2015. César Mata Pires " +
      "foi investigado na Operação Lava Jato. José Aldemário Pinheiro Filho (Léo Pinheiro), " +
      "ex-presidente da OAS, foi condenado por corrupção e lavagem de dinheiro. Faleceu em 2020. " +
      "Dados de domínio público (processos judiciais, MPF).",
  },

  // ─── 13. Equatorial Energia como novo acionista referência da Sabesp ──────
  {
    pessoa: "Equatorial Energia S.A.",
    empresas: [
      { empresa_id: "sabesp", cargo: "Acionista Referência (15% — investidor estratégico privatização)" },
    ],
    tipo_vinculo: "socio_comum",
    risco: "medio",
    descricao:
      "A Equatorial Energia (B3: EQTL3), originalmente uma distribuidora de energia elétrica, " +
      "tornou-se acionista referência da Sabesp em julho de 2024, no processo de desestatização " +
      "conduzido pelo Governo do Estado de SP. A Equatorial também detém a Echoenergia (renováveis) " +
      "e a Equatorial Saneamento (Amapá), o que configura atuação cruzada nos setores de energia e saneamento.",
  },
];

// ─── Exports Default ─────────────────────────────────────────────────────────

export default { socios, vinculosPessoais };
