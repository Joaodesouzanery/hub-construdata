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
  // ── Existing 20 notícias (preserved) ─────────────────────────────────
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

  // ── New 20 notícias (energia, rodovias, ferrovias, habitação, resíduos, mobilidade, etc.) ──
  {
    titulo: "Casa dos Ventos inaugura maior complexo eólico da América Latina no Rio Grande do Norte",
    link: "https://www.aneel.gov.br/casa-dos-ventos-complexo-eolico-rn/",
    data_publicacao: "2026-02-17T10:00:00.000Z",
    fonte: "ANEEL",
    imagem: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "ANEEL aprova leilão de transmissão para Linhão Tucuruí-Boa Vista com investimento de R$ 1,6 bi",
    link: "https://www.aneel.gov.br/leilao-transmissao-linhao-tucurui-boa-vista/",
    data_publicacao: "2026-02-16T09:30:00.000Z",
    fonte: "ANEEL",
    imagem: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "DNIT conclui duplicação da BR-101 no trecho entre Pernambuco e Alagoas após 8 anos de obras",
    link: "https://www.gov.br/dnit/br-101-duplicacao-pe-al/",
    data_publicacao: "2026-02-15T14:00:00.000Z",
    fonte: "DNIT",
    imagem: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "CCR assume concessão da BR-163 no Mato Grosso com R$ 2,1 bilhões em investimentos previstos",
    link: "https://cnt.org.br/ccr-concessao-br-163-mt/",
    data_publicacao: "2026-02-14T11:15:00.000Z",
    fonte: "CNT",
    imagem: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "VALEC retoma obras da Ferrovia Norte-Sul no trecho entre Tocantins e Goiás",
    link: "https://www.gov.br/infraestrutura/valec-ferrovia-norte-sul-to-go/",
    data_publicacao: "2026-02-13T08:45:00.000Z",
    fonte: "Ministério dos Transportes",
    imagem: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "MRV Engenharia lança programa de 12 mil unidades habitacionais populares em Minas Gerais",
    link: "https://www.secovi.com.br/mrv-habitacao-popular-mg/",
    data_publicacao: "2026-02-12T16:20:00.000Z",
    fonte: "SECOVI",
    imagem: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "São Paulo inaugura maior usina de reciclagem da América Latina com capacidade para 1.200 t/dia",
    link: "https://abrelpe.org.br/sp-usina-reciclagem-america-latina/",
    data_publicacao: "2026-02-11T10:30:00.000Z",
    fonte: "ABRELPE",
    imagem: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "BRT Goiânia atinge 70% de execução com investimento acumulado de R$ 480 milhões",
    link: "https://www.secovi.com.br/brt-goiania-execucao-480-milhoes/",
    data_publicacao: "2026-02-10T13:40:00.000Z",
    fonte: "SECOVI",
    imagem: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Águas de Manaus amplia rede de esgoto na zona leste beneficiando 150 mil moradores",
    link: "https://saneamentobasico.com.br/aguas-manaus-rede-esgoto-zona-leste/",
    data_publicacao: "2026-02-09T09:00:00.000Z",
    fonte: "Saneamento Básico",
    imagem: "https://images.unsplash.com/photo-1597573337211-e1080012b84b?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "ANA publica novas metas regionais para universalização do saneamento até 2033",
    link: "https://www.gov.br/ana/metas-regionais-universalizacao-saneamento-2033/",
    data_publicacao: "2026-02-08T15:00:00.000Z",
    fonte: "ANA",
    imagem: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Drones e inteligência artificial revolucionam inspeção de barragens em Minas Gerais e Goiás",
    link: "https://www.confea.org.br/drones-ia-inspecao-barragens-mg-go/",
    data_publicacao: "2026-02-07T17:10:00.000Z",
    fonte: "CONFEA",
    imagem: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Enchentes no RS aceleram investimentos de R$ 3,2 bilhões em infraestrutura de drenagem urbana",
    link: "https://cnt.org.br/enchentes-rs-investimentos-drenagem-urbana/",
    data_publicacao: "2026-02-06T12:00:00.000Z",
    fonte: "CNT",
    imagem: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "ONS projeta recorde de geração solar no Nordeste com 22 GW de capacidade instalada até julho",
    link: "https://www.ons.org.br/projecao-geracao-solar-nordeste-2026/",
    data_publicacao: "2026-02-05T08:30:00.000Z",
    fonte: "ONS",
    imagem: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "CREA-PA fiscaliza obras do BRT Belém e exige adequação ao cronograma da COP 30",
    link: "https://www.crea-pa.org.br/fiscalizacao-brt-belem-cop30/",
    data_publicacao: "2026-02-04T10:45:00.000Z",
    fonte: "CREA-PA",
    imagem: "https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "DNIT investe R$ 890 milhões na pavimentação da BR-319 entre Manaus e Porto Velho",
    link: "https://www.gov.br/dnit/br-319-pavimentacao-manaus-porto-velho/",
    data_publicacao: "2026-02-03T14:20:00.000Z",
    fonte: "DNIT",
    imagem: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Programa Minha Casa Minha Vida entrega 8 mil unidades na Região Metropolitana de Salvador",
    link: "https://www.secovi.com.br/mcmv-entregas-salvador-2026/",
    data_publicacao: "2026-02-02T09:15:00.000Z",
    fonte: "SECOVI",
    imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "ABRELPE alerta: Brasil ainda destina 40% dos resíduos sólidos a lixões e aterros inadequados",
    link: "https://abrelpe.org.br/panorama-residuos-solidos-2026/",
    data_publicacao: "2026-01-31T11:30:00.000Z",
    fonte: "ABRELPE",
    imagem: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Ferrovia Transnordestina avança no Ceará com conclusão do trecho Missão Velha–Salgueiro",
    link: "https://cnt.org.br/transnordestina-trecho-ce-conclusao/",
    data_publicacao: "2026-01-29T15:30:00.000Z",
    fonte: "CNT",
    imagem: "https://images.unsplash.com/photo-1527684651079-3ca11fb042c9?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Metrô de Fortaleza inicia obras da Linha Leste com previsão de R$ 3,5 bilhões em investimentos",
    link: "https://www.gov.br/cidades/metro-fortaleza-linha-leste/",
    data_publicacao: "2026-01-26T10:00:00.000Z",
    fonte: "Ministério das Cidades",
    imagem: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "ANEEL registra expansão de 18% na geração distribuída com destaque para pequenas centrais no Centro-Oeste",
    link: "https://www.aneel.gov.br/geracao-distribuida-expansao-centro-oeste/",
    data_publicacao: "2026-01-22T13:45:00.000Z",
    fonte: "ANEEL",
    imagem: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600&h=300&fit=crop&auto=format",
  },
];

export default noticias;
