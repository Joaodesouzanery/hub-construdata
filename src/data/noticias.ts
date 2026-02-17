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
  imagem?: string;
}

const noticias: Noticia[] = [
  {
    titulo: "Marco Legal do Saneamento completa 5 anos com avanços e desafios para universalização até 2033",
    link: "https://saneamentobasico.com.br/marco-legal-saneamento-5-anos/",
    data_publicacao: "2026-02-11T14:30:00.000Z",
    fonte: "Saneamento Básico",
    imagem: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "BNDES aprova R$ 4,2 bilhões para projetos de saneamento na região Nordeste",
    link: "https://saneamentobasico.com.br/bndes-saneamento-nordeste-2026/",
    data_publicacao: "2026-02-10T10:15:00.000Z",
    fonte: "Saneamento Básico",
    imagem: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Nova tecnologia de membranas reduz custo de dessalinização em 40% no semiárido",
    link: "https://tratamentodeagua.com.br/membranas-dessalinizacao-semiarido/",
    data_publicacao: "2026-02-09T16:45:00.000Z",
    fonte: "Tratamento de Água",
    imagem: "https://images.unsplash.com/photo-1581093458791-9d42e3c2fd44?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "SABESP conclui licitação de R$ 2,8 bi para universalização do esgoto na Baixada Santista",
    link: "https://saneamentobasico.com.br/sabesp-licitacao-baixada-santista/",
    data_publicacao: "2026-02-08T09:20:00.000Z",
    fonte: "Saneamento Básico",
    imagem: "https://images.pexels.com/photos/10274179/pexels-photo-10274179.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "Estudo da ANA aponta que 35 milhões de brasileiros ainda não têm acesso à água tratada",
    link: "https://tratamentodeagua.com.br/ana-estudo-acesso-agua-2026/",
    data_publicacao: "2026-02-07T11:00:00.000Z",
    fonte: "Tratamento de Água",
    imagem: "https://images.unsplash.com/photo-1468421870903-4df1664ac249?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "CBIC prevê crescimento de 3,5% na construção civil em 2026 puxado por obras de infraestrutura",
    link: "https://cbic.org.br/crescimento-construcao-civil-2026/",
    data_publicacao: "2026-02-06T08:30:00.000Z",
    fonte: "CBIC",
    imagem: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Governo Federal lança programa de R$ 15 bilhões para redução de perdas na distribuição de água",
    link: "https://saneamentobasico.com.br/programa-reducao-perdas-agua/",
    data_publicacao: "2026-02-05T13:45:00.000Z",
    fonte: "Saneamento Básico",
    imagem: "https://images.unsplash.com/photo-1548407260-da850faa41e8?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "ABES promove congresso internacional sobre reúso de água e economia circular",
    link: "https://abes-dn.org.br/congresso-reuso-agua-2026/",
    data_publicacao: "2026-02-04T15:10:00.000Z",
    fonte: "ABES",
    imagem: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "PPP de resíduos sólidos em Recife deve gerar investimentos de R$ 1,7 bilhão em 30 anos",
    link: "https://canalmeioambiente.com.br/ppp-residuos-recife/",
    data_publicacao: "2026-02-03T10:00:00.000Z",
    fonte: "Canal Meio Ambiente",
    imagem: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Inteligência artificial é usada para detectar vazamentos em redes de distribuição em São Paulo",
    link: "https://tratamentodeagua.com.br/ia-deteccao-vazamentos-sp/",
    data_publicacao: "2026-02-02T17:20:00.000Z",
    fonte: "Tratamento de Água",
    imagem: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Instituto Trata Brasil divulga ranking do saneamento nas 100 maiores cidades do país",
    link: "https://trfratabrasil.org.br/ranking-saneamento-2026/",
    data_publicacao: "2026-02-01T09:00:00.000Z",
    fonte: "Trata Brasil",
    imagem: "https://images.pexels.com/photos/19517566/pexels-photo-19517566.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "SindusCon-SP aponta alta de 12% nos custos de materiais de construção no último trimestre",
    link: "https://sindusconsp.com.br/custos-materiais-q4-2025/",
    data_publicacao: "2026-01-30T14:20:00.000Z",
    fonte: "SindusCon-SP",
    imagem: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "CONFEA regulamenta uso de drones em inspeção de barragens e reservatórios",
    link: "https://www.confea.org.br/drones-inspecao-barragens/",
    data_publicacao: "2026-01-28T11:30:00.000Z",
    fonte: "CONFEA",
    imagem: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Desmatamento na Amazônia impacta ciclo hidrológico e abastecimento de água no Sudeste",
    link: "https://oeco.org.br/desmatamento-ciclo-hidrologico-sudeste/",
    data_publicacao: "2026-01-27T08:45:00.000Z",
    fonte: "O Eco",
    imagem: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Agência Brasil: Investimento privado em saneamento cresce 280% após marco regulatório",
    link: "https://agenciabrasil.ebc.com.br/economia/investimento-saneamento-2026/",
    data_publicacao: "2026-01-25T16:00:00.000Z",
    fonte: "Agência Brasil",
    imagem: "https://images.pexels.com/photos/681347/pexels-photo-681347.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "Nova norma ABNT para projetos de estações de tratamento de esgoto entra em vigor",
    link: "https://revistaadnormas.com.br/abnt-norma-ete-2026/",
    data_publicacao: "2026-01-23T10:15:00.000Z",
    fonte: "Revista AdNormas",
    imagem: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Crise hídrica no Sul: Rio Grande do Sul enfrenta menor nível de reservatórios em 10 anos",
    link: "https://tratamentodeagua.com.br/crise-hidrica-rs-2026/",
    data_publicacao: "2026-01-21T13:00:00.000Z",
    fonte: "Tratamento de Água",
    imagem: "https://images.unsplash.com/photo-1583265627959-fb7042f5133b?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Concessão de saneamento do Amapá recebe 4 propostas em leilão na B3",
    link: "https://saneamentobasico.com.br/concessao-amapa-leilao-b3/",
    data_publicacao: "2026-01-19T09:30:00.000Z",
    fonte: "Saneamento Básico",
    imagem: "https://images.pexels.com/photos/10634138/pexels-photo-10634138.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "CBIC e CNI lançam plataforma digital para monitorar obras de infraestrutura em tempo real",
    link: "https://cbic.org.br/plataforma-digital-monitoramento-obras/",
    data_publicacao: "2026-01-17T14:45:00.000Z",
    fonte: "CBIC",
    imagem: "https://images.pexels.com/photos/3862628/pexels-photo-3862628.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "Trata Brasil alerta: 16% das crianças internadas por diarreia vivem em áreas sem saneamento",
    link: "https://trfratabrasil.org.br/saude-criancas-saneamento/",
    data_publicacao: "2026-01-15T08:00:00.000Z",
    fonte: "Trata Brasil",
    imagem: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=300&fit=crop&auto=format",
  },
];

export default noticias;
