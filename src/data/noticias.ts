/**
 * Notícias embutidas — usadas quando o fetch não está disponível
 * (ex: abrindo dist/index.html como arquivo local).
 *
 * Para atualizar com notícias reais:
 *   1. Execute `node coletor.js` (precisa de internet)
 *   2. O coletor salva em public/noticias.json E atualiza este arquivo
 *   3. Rode `npm run build` para gerar o bundle atualizado
 */

export interface Noticia {
  titulo: string;
  link: string;
  data_publicacao: string;
  fonte: string;
}

const noticias: Noticia[] = [
  {
    titulo: "Marco Legal do Saneamento completa 5 anos com avanços e desafios para universalização até 2033",
    link: "https://saneamentobasico.com.br/marco-legal-saneamento-5-anos/",
    data_publicacao: "2026-02-11T14:30:00.000Z",
    fonte: "Saneamento Básico",
  },
  {
    titulo: "BNDES aprova R$ 4,2 bilhões para projetos de saneamento na região Nordeste",
    link: "https://saneamentobasico.com.br/bndes-saneamento-nordeste-2026/",
    data_publicacao: "2026-02-10T10:15:00.000Z",
    fonte: "Saneamento Básico",
  },
  {
    titulo: "Nova tecnologia de membranas reduz custo de dessalinização em 40% no semiárido",
    link: "https://tratamentodeagua.com.br/membranas-dessalinizacao-semiarido/",
    data_publicacao: "2026-02-09T16:45:00.000Z",
    fonte: "Tratamento de Água",
  },
  {
    titulo: "SABESP conclui licitação de R$ 2,8 bi para universalização do esgoto na Baixada Santista",
    link: "https://saneamentobasico.com.br/sabesp-licitacao-baixada-santista/",
    data_publicacao: "2026-02-08T09:20:00.000Z",
    fonte: "Saneamento Básico",
  },
  {
    titulo: "Estudo da ANA aponta que 35 milhões de brasileiros ainda não têm acesso à água tratada",
    link: "https://tratamentodeagua.com.br/ana-estudo-acesso-agua-2026/",
    data_publicacao: "2026-02-07T11:00:00.000Z",
    fonte: "Tratamento de Água",
  },
  {
    titulo: "CBIC prevê crescimento de 3,5% na construção civil em 2026 puxado por obras de infraestrutura",
    link: "https://cbic.org.br/crescimento-construcao-civil-2026/",
    data_publicacao: "2026-02-06T08:30:00.000Z",
    fonte: "CBIC",
  },
  {
    titulo: "Governo Federal lança programa de R$ 15 bilhões para redução de perdas na distribuição de água",
    link: "https://saneamentobasico.com.br/programa-reducao-perdas-agua/",
    data_publicacao: "2026-02-05T13:45:00.000Z",
    fonte: "Saneamento Básico",
  },
  {
    titulo: "ABES promove congresso internacional sobre reúso de água e economia circular",
    link: "https://abes-dn.org.br/congresso-reuso-agua-2026/",
    data_publicacao: "2026-02-04T15:10:00.000Z",
    fonte: "ABES",
  },
  {
    titulo: "PPP de resíduos sólidos em Recife deve gerar investimentos de R$ 1,7 bilhão em 30 anos",
    link: "https://canalmeioambiente.com.br/ppp-residuos-recife/",
    data_publicacao: "2026-02-03T10:00:00.000Z",
    fonte: "Canal Meio Ambiente",
  },
  {
    titulo: "Inteligência artificial é usada para detectar vazamentos em redes de distribuição em São Paulo",
    link: "https://tratamentodeagua.com.br/ia-deteccao-vazamentos-sp/",
    data_publicacao: "2026-02-02T17:20:00.000Z",
    fonte: "Tratamento de Água",
  },
];

export default noticias;
