/**
 * Artigos embutidos — usados quando o fetch de artigos.json falha.
 * Atualizado automaticamente por coletor.js.
 *
 * Para atualizar com artigos reais:
 *   1. Execute `node coletor.js`
 *   2. Rode `npm run build`
 */

import type { Artigo } from "@/types/database";

const artigos: Artigo[] = [
  {
    titulo: "BIM 7D: como a modelagem da informacao esta revolucionando a gestao de ativos em saneamento",
    link: "https://aecweb.com.br/bim-7d-gestao-ativos-saneamento/",
    resumo:
      "Artigo tecnico analisa a adocao do BIM na dimensao 7D (facility management) por concessionarias de saneamento, com estudo de caso da SABESP e resultados de reducao de 28% nos custos de manutencao preventiva de ETEs.",
    data_publicacao: "2026-02-15T09:00:00.000Z",
    fonte: "AECweb",
    autor: "Eng. Ricardo Mendes",
    categorias: ["BIM", "Saneamento", "Tecnologia"],
    imagem: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Analise comparativa SINAPI vs SICRO 2026: impactos nos orcamentos de infraestrutura hidrica",
    link: "https://cbic.org.br/sinapi-sicro-comparativo-2026/",
    resumo:
      "Estudo detalhado compara os indices SINAPI e SICRO atualizados para 2026, destacando divergencias de ate 18% em composicoes de servicos de drenagem e redes de distribuicao de agua.",
    data_publicacao: "2026-02-14T10:30:00.000Z",
    fonte: "CBIC",
    autor: "Dr. Ana Cristina Ferreira",
    categorias: ["Custos", "Infraestrutura", "Normas Tecnicas"],
    imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "O papel das PPPs na universalizacao do saneamento: licoes da concessao do Amapa",
    link: "https://saneamentobasico.com.br/ppps-universalizacao-saneamento-amapa/",
    resumo:
      "Reportagem investigativa detalha os bastidores da concessao de saneamento do Amapa, os desafios regulatorios enfrentados e as perspectivas de investimento de R$ 3,2 bilhoes em 35 anos.",
    data_publicacao: "2026-02-13T14:15:00.000Z",
    fonte: "Saneamento Basico",
    autor: "Juliana Tavares",
    categorias: ["Saneamento", "Legislacao", "Governo"],
    imagem: "https://images.pexels.com/photos/1579356/pexels-photo-1579356.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "Machine Learning aplicado a previsao de demanda hidrica em regioes metropolitanas",
    link: "https://tratamentodeagua.com.br/ml-previsao-demanda-hidrica/",
    resumo:
      "Pesquisadores da USP apresentam modelo de ML que preve demanda de agua com 94% de acuracia em horizonte de 72h, usando dados de sensores IoT e variaveis climaticas para otimizar operacao de ETAs.",
    data_publicacao: "2026-02-12T08:45:00.000Z",
    fonte: "Tratamento de Agua",
    autor: "Prof. Carlos Eduardo Lima",
    categorias: ["Tecnologia", "Recursos Hidricos", "Saneamento"],
    imagem: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Nova NR-18 e seus impactos na gestao de seguranca em obras de grande porte",
    link: "https://sindusconsp.com.br/nr-18-impactos-seguranca-obras/",
    resumo:
      "Analise juridica e tecnica das alteracoes na NR-18, com foco nas novas exigencias para obras acima de R$ 50 milhoes, incluindo planos de emergencia obrigatorios e tecnologias de monitoramento.",
    data_publicacao: "2026-02-11T11:20:00.000Z",
    fonte: "SindusCon-SP",
    autor: "Adv. Marcos Ribeiro",
    categorias: ["Regulamentacao", "Construcao Civil", "Normas Tecnicas"],
    imagem: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Concreto de ultra-alto desempenho (UHPC) em infraestrutura de saneamento: casos brasileiros",
    link: "https://engenharia360.com/uhpc-infraestrutura-saneamento/",
    resumo:
      "Artigo tecnico apresenta tres projetos brasileiros que utilizam UHPC em reservatorios e tubulacoes de grande diametro, com ganhos de durabilidade de 3x e reducao de 40% na espessura de paredes.",
    data_publicacao: "2026-02-10T15:00:00.000Z",
    fonte: "Engenharia 360",
    autor: "Eng. Patricia Santos",
    categorias: ["Engenharia", "Saneamento", "Estruturas"],
    imagem: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Marco Legal do Saneamento: balanco de 5 anos e os proximos desafios para 2033",
    link: "https://tratabrasil.org.br/marco-legal-5-anos-balanco/",
    resumo:
      "O Instituto Trata Brasil publica relatorio completo sobre os avancos e gargalos da Lei 14.026/2020, com dados de 2.700 municipios e projecoes para o cumprimento das metas de universalizacao.",
    data_publicacao: "2026-02-09T09:30:00.000Z",
    fonte: "Trata Brasil",
    autor: "Edison Carlos",
    categorias: ["Saneamento", "Legislacao", "Indicadores"],
    imagem: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Drones e LiDAR na inspecao de barragens: regulamentacao CONFEA e boas praticas",
    link: "https://confea.org.br/drones-lidar-inspecao-barragens/",
    resumo:
      "O CONFEA publica guia tecnico com diretrizes para uso de drones equipados com LiDAR na inspecao de barragens, incluindo requisitos de ART, frequencia de voos e integracao com PNSB.",
    data_publicacao: "2026-02-08T13:00:00.000Z",
    fonte: "CONFEA",
    autor: "Eng. Roberto Alves",
    categorias: ["Engenharia", "Tecnologia", "Regulamentacao"],
    imagem: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Economia circular na construcao: como reaproveitar 85% dos residuos de demolicao",
    link: "https://canalmeioambiente.com.br/economia-circular-construcao-residuos/",
    resumo:
      "Reportagem mostra iniciativas de 5 construtoras brasileiras que alcancaram indices de reaproveitamento acima de 85%, com detalhamento de processos de triagem, beneficiamento e reinsercao no ciclo produtivo.",
    data_publicacao: "2026-02-07T10:45:00.000Z",
    fonte: "Canal Meio Ambiente",
    autor: "Marina Oliveira",
    categorias: ["Sustentabilidade", "Construcao Civil", "Meio Ambiente"],
    imagem: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Estacoes de tratamento modulares: solucao para municipios de pequeno porte",
    link: "https://abes-dn.org.br/etas-modulares-municipios-pequenos/",
    resumo:
      "A ABES apresenta estudo sobre ETAs e ETEs modulares pre-fabricadas que podem atender municipios de ate 20 mil habitantes com investimento 60% menor que estacoes convencionais.",
    data_publicacao: "2026-02-06T16:30:00.000Z",
    fonte: "ABES",
    autor: "Dr. Fernando Costa",
    categorias: ["Saneamento", "Infraestrutura", "Tecnologia"],
    imagem: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Impacto das mudancas climaticas no dimensionamento de redes de drenagem urbana",
    link: "https://oeco.org.br/mudancas-climaticas-drenagem-urbana/",
    resumo:
      "Especialistas alertam que os parametros de dimensionamento de redes de drenagem utilizados no Brasil estao defasados em relacao as mudancas nos regimes pluviometricos, propondo revisao da NBR 10844.",
    data_publicacao: "2026-02-05T08:15:00.000Z",
    fonte: "O Eco",
    autor: "Prof. Lucia Andrade",
    categorias: ["Meio Ambiente", "Infraestrutura", "Normas Tecnicas"],
    imagem: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Licitacoes de saneamento em 2026: tendencias, valores e oportunidades por regiao",
    link: "https://cbic.org.br/licitacoes-saneamento-2026-tendencias/",
    resumo:
      "Levantamento exclusivo mapeia R$ 47 bilhoes em licitacoes de saneamento previstas para 2026, com concentracao no Nordeste (38%) e destaque para projetos de reuso de agua no Sudeste.",
    data_publicacao: "2026-02-04T12:00:00.000Z",
    fonte: "CBIC",
    autor: "Equipe CBIC",
    categorias: ["Licitacoes", "Saneamento", "Indicadores"],
    imagem: "https://images.pexels.com/photos/10274179/pexels-photo-10274179.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "Gemeos digitais em redes de distribuicao: a experiencia da COPASA em MG",
    link: "https://aecweb.com.br/gemeos-digitais-redes-distribuicao-copasa/",
    resumo:
      "A COPASA implementa gemeo digital de 1.200 km de rede em Belo Horizonte, com reducao de 35% nas perdas reais e tempo de resposta a vazamentos de 4h para 45 minutos.",
    data_publicacao: "2026-02-03T14:30:00.000Z",
    fonte: "AECweb",
    autor: "Eng. Thiago Moreira",
    categorias: ["Tecnologia", "Saneamento", "BIM"],
    imagem: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Guia completo: como elaborar propostas vencedoras em licitacoes de obras publicas",
    link: "https://buildin.com.br/guia-propostas-vencedoras-licitacoes/",
    resumo:
      "Tutorial pratico com checklist de 42 itens para montagem de propostas tecnicas e comerciais em licitacoes de obras publicas, incluindo estrategias de precificacao e apresentacao de atestados.",
    data_publicacao: "2026-02-02T09:00:00.000Z",
    fonte: "Buildin",
    autor: "Adv. Camila Rocha",
    categorias: ["Licitacoes", "Gestao de Obras", "Construcao Civil"],
    imagem: "https://images.pexels.com/photos/4160237/pexels-photo-4160237.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "Reuso de agua na industria da construcao: normas, custos e retorno sobre investimento",
    link: "https://tratamentodeagua.com.br/reuso-agua-construcao-roi/",
    resumo:
      "Estudo economico demonstra que sistemas de reuso de agua em canteiros de obras acima de 5.000m2 tem payback medio de 14 meses, com economia anual de R$ 180 mil em consumo de agua potavel.",
    data_publicacao: "2026-02-01T11:15:00.000Z",
    fonte: "Tratamento de Agua",
    autor: "Eng. Renata Dias",
    categorias: ["Sustentabilidade", "Construcao Civil", "Recursos Hidricos"],
    imagem: "https://images.unsplash.com/photo-1548407260-da850faa41e8?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Inteligencia artificial na fiscalizacao de obras: o sistema da CGU para obras federais",
    link: "https://agenciabrasil.ebc.com.br/ia-fiscalizacao-obras-cgu/",
    resumo:
      "A CGU apresenta sistema baseado em IA que cruza dados de medicoes, imagens de satelite e notas fiscais para detectar irregularidades em obras financiadas com recursos federais.",
    data_publicacao: "2026-01-30T15:45:00.000Z",
    fonte: "Agencia Brasil",
    autor: "Redacao Agencia Brasil",
    categorias: ["Tecnologia", "Governo", "Gestao de Obras"],
    imagem: "https://images.pexels.com/photos/15641049/pexels-photo-15641049.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
  },
  {
    titulo: "CREA-SP atualiza tabela de honorarios para projetos de engenharia em 2026",
    link: "https://creasp.org.br/tabela-honorarios-2026/",
    resumo:
      "O CREA-SP publica nova tabela referencial de honorarios com reajuste medio de 7,2%, incluindo novas categorias para projetos BIM, consultoria ESG e laudos de eficiencia energetica.",
    data_publicacao: "2026-01-28T10:00:00.000Z",
    fonte: "CREA-SP",
    autor: "CREA-SP",
    categorias: ["Engenharia", "Regulamentacao", "Custos"],
    imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop&auto=format",
  },
  {
    titulo: "Cidades esponja: como Curitiba e Recife estao adotando infraestrutura verde contra enchentes",
    link: "https://revistaadnormas.com.br/cidades-esponja-curitiba-recife/",
    resumo:
      "Artigo detalha projetos de infraestrutura verde em Curitiba (jardins de chuva) e Recife (parques alagaveis) como estrategia de drenagem sustentavel, com investimento total de R$ 890 milhoes.",
    data_publicacao: "2026-01-26T13:30:00.000Z",
    fonte: "Revista AdNormas",
    autor: "Arq. Daniela Fonseca",
    categorias: ["Infraestrutura", "Sustentabilidade", "Meio Ambiente"],
    imagem: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=300&fit=crop&auto=format",
  },
];

export default artigos;
