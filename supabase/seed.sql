-- ==============================================================
-- Hub ConstruData — Dados Iniciais (Seed)
-- ==============================================================
-- Execute APOS o schema.sql no Supabase SQL Editor.
-- Insere dados de exemplo para todas as tabelas publicas.
--
-- IMPORTANTE: Este seed usa ON CONFLICT DO NOTHING para ser
-- executado multiplas vezes sem duplicar dados.
-- ==============================================================


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  NOTICIAS                                                    ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO noticias (titulo, link, data_publicacao, fonte, imagem) VALUES
('Marco Legal do Saneamento completa 5 anos com avancos e desafios para universalizacao ate 2033',
 'https://saneamentobasico.com.br/marco-legal-saneamento-5-anos/',
 '2026-02-11T14:30:00Z', 'Saneamento Basico',
 'https://images.pexels.com/photos/10274179/pexels-photo-10274179.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'),

('BNDES aprova R$ 4,2 bilhoes para projetos de saneamento na regiao Nordeste',
 'https://saneamentobasico.com.br/bndes-saneamento-nordeste-2026/',
 '2026-02-10T10:15:00Z', 'Saneamento Basico',
 'https://images.pexels.com/photos/19517566/pexels-photo-19517566.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'),

('Nova tecnologia de membranas reduz custo de dessalinizacao em 40% no semiarido',
 'https://tratamentodeagua.com.br/membranas-dessalinizacao-semiarido/',
 '2026-02-09T16:45:00Z', 'Tratamento de Agua',
 'https://images.unsplash.com/photo-1581093458791-9d42e3c2fd44?w=600&h=300&fit=crop&auto=format'),

('SABESP conclui licitacao de R$ 2,8 bi para universalizacao do esgoto na Baixada Santista',
 'https://saneamentobasico.com.br/sabesp-licitacao-baixada-santista/',
 '2026-02-08T09:20:00Z', 'Saneamento Basico',
 'https://images.pexels.com/photos/10274179/pexels-photo-10274179.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'),

('CBIC preve crescimento de 3,5% na construcao civil em 2026 puxado por obras de infraestrutura',
 'https://cbic.org.br/crescimento-construcao-civil-2026/',
 '2026-02-06T08:30:00Z', 'CBIC',
 'https://images.pexels.com/photos/15641049/pexels-photo-15641049.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'),

('Governo Federal lanca programa de R$ 15 bilhoes para reducao de perdas na distribuicao de agua',
 'https://saneamentobasico.com.br/programa-reducao-perdas-agua/',
 '2026-02-05T13:45:00Z', 'Saneamento Basico',
 'https://images.unsplash.com/photo-1548407260-da850faa41e8?w=600&h=300&fit=crop&auto=format'),

('PPP de residuos solidos em Recife deve gerar investimentos de R$ 1,7 bilhao em 30 anos',
 'https://canalmeioambiente.com.br/ppp-residuos-recife/',
 '2026-02-03T10:00:00Z', 'Canal Meio Ambiente',
 'https://images.pexels.com/photos/1579356/pexels-photo-1579356.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'),

('Inteligencia artificial e usada para detectar vazamentos em redes de distribuicao em Sao Paulo',
 'https://tratamentodeagua.com.br/ia-deteccao-vazamentos-sp/',
 '2026-02-02T17:20:00Z', 'Tratamento de Agua',
 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop&auto=format'),

('Instituto Trata Brasil divulga ranking do saneamento nas 100 maiores cidades do pais',
 'https://tratabrasil.org.br/ranking-saneamento-2026/',
 '2026-02-01T09:00:00Z', 'Trata Brasil',
 'https://images.pexels.com/photos/19517566/pexels-photo-19517566.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'),

('Concessao de saneamento do Amapa recebe 4 propostas em leilao na B3',
 'https://saneamentobasico.com.br/concessao-amapa-leilao-b3/',
 '2026-01-19T09:30:00Z', 'Saneamento Basico',
 'https://images.pexels.com/photos/10634138/pexels-photo-10634138.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1')

ON CONFLICT (link) DO NOTHING;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  ARTIGOS                                                     ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO artigos (titulo, link, resumo, data_publicacao, fonte, autor, categorias, imagem) VALUES
('BIM 7D: como a modelagem da informacao esta revolucionando a gestao de ativos em saneamento',
 'https://aecweb.com.br/bim-7d-gestao-ativos-saneamento/',
 'Artigo tecnico analisa a adocao do BIM na dimensao 7D por concessionarias de saneamento, com estudo de caso da SABESP e resultados de reducao de 28% nos custos de manutencao preventiva de ETEs.',
 '2026-02-15T09:00:00Z', 'AECweb', 'Eng. Ricardo Mendes',
 ARRAY['BIM', 'Saneamento', 'Tecnologia'],
 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop&auto=format'),

('Analise comparativa SINAPI vs SICRO 2026: impactos nos orcamentos de infraestrutura hidrica',
 'https://cbic.org.br/sinapi-sicro-comparativo-2026/',
 'Estudo detalhado compara os indices SINAPI e SICRO atualizados para 2026, destacando divergencias de ate 18% em composicoes de servicos de drenagem.',
 '2026-02-14T10:30:00Z', 'CBIC', 'Dr. Ana Cristina Ferreira',
 ARRAY['Custos', 'Infraestrutura', 'Normas Tecnicas'],
 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop&auto=format'),

('Concreto de ultra-alto desempenho (UHPC) em infraestrutura de saneamento: casos brasileiros',
 'https://engenharia360.com/uhpc-infraestrutura-saneamento/',
 'Artigo tecnico apresenta tres projetos brasileiros que utilizam UHPC em reservatorios e tubulacoes de grande diametro, com ganhos de durabilidade de 3x.',
 '2026-02-10T15:00:00Z', 'Engenharia 360', 'Eng. Patricia Santos',
 ARRAY['Engenharia', 'Saneamento', 'Estruturas'],
 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=300&fit=crop&auto=format'),

('Estacoes de tratamento modulares: solucao para municipios de pequeno porte',
 'https://abes-dn.org.br/etas-modulares-municipios-pequenos/',
 'A ABES apresenta estudo sobre ETAs e ETEs modulares pre-fabricadas que podem atender municipios de ate 20 mil habitantes com investimento 60% menor.',
 '2026-02-06T16:30:00Z', 'ABES', 'Dr. Fernando Costa',
 ARRAY['Saneamento', 'Infraestrutura', 'Tecnologia'],
 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&h=300&fit=crop&auto=format'),

('Gemeos digitais em redes de distribuicao: a experiencia da COPASA em MG',
 'https://aecweb.com.br/gemeos-digitais-redes-distribuicao-copasa/',
 'A COPASA implementa gemeo digital de 1.200 km de rede em Belo Horizonte, com reducao de 35% nas perdas reais e tempo de resposta a vazamentos de 4h para 45 minutos.',
 '2026-02-03T14:30:00Z', 'AECweb', 'Eng. Thiago Moreira',
 ARRAY['Tecnologia', 'Saneamento', 'BIM'],
 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop&auto=format')

ON CONFLICT (link) DO NOTHING;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  LICITACOES                                                  ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO licitacoes (titulo, orgao, estado, categoria, data_abertura, valor_estimado, valor_estimado_fmt, link, modalidade, numero_controle) VALUES
('Implantacao de sistema de esgotamento sanitario no municipio de Petrolina',
 'Compesa - Companhia Pernambucana de Saneamento', 'PE', 'Saneamento',
 '2026-03-15', 85000000.00, 'R$ 85.000.000,00',
 'https://pncp.gov.br/licitacao/PE-2026-001', 'Concorrencia', 'PE-2026-001'),

('Obra de ampliacao da ETA Guarau - Sistema Cantareira',
 'SABESP - Cia de Saneamento Basico do Estado de Sao Paulo', 'SP', 'Saneamento',
 '2026-03-20', 120000000.00, 'R$ 120.000.000,00',
 'https://pncp.gov.br/licitacao/SP-2026-002', 'Concorrencia', 'SP-2026-002'),

('Construcao de ponte sobre o Rio Paraiba do Sul - trecho Campos-Sao Fidelis',
 'DNIT - Departamento Nacional de Infraestrutura de Transportes', 'RJ', 'Infraestrutura',
 '2026-04-01', 45000000.00, 'R$ 45.000.000,00',
 'https://pncp.gov.br/licitacao/RJ-2026-003', 'Concorrencia', 'RJ-2026-003'),

('Pavimentacao e drenagem urbana no bairro Cidade Nova - Manaus',
 'Prefeitura Municipal de Manaus', 'AM', 'Drenagem',
 '2026-03-10', 22000000.00, 'R$ 22.000.000,00',
 'https://pncp.gov.br/licitacao/AM-2026-004', 'Tomada de Precos', 'AM-2026-004'),

('Recuperacao estrutural da barragem do acude Castanhao',
 'DNOCS - Departamento Nacional de Obras Contra as Secas', 'CE', 'Recursos Hidricos',
 '2026-04-15', 38000000.00, 'R$ 38.000.000,00',
 'https://pncp.gov.br/licitacao/CE-2026-005', 'Concorrencia', 'CE-2026-005'),

('Implantacao de rede de distribuicao de agua tratada - zona rural de Juazeiro',
 'EMBASA - Empresa Baiana de Aguas e Saneamento', 'BA', 'Saneamento',
 '2026-03-25', 15000000.00, 'R$ 15.000.000,00',
 'https://pncp.gov.br/licitacao/BA-2026-006', 'Pregao Eletronico', 'BA-2026-006'),

('Duplicacao da BR-101 trecho Joinville-Florianopolis',
 'DNIT - Departamento Nacional de Infraestrutura de Transportes', 'SC', 'Infraestrutura',
 '2026-05-01', 320000000.00, 'R$ 320.000.000,00',
 'https://pncp.gov.br/licitacao/SC-2026-007', 'Concorrencia', 'SC-2026-007'),

('Construcao de ETE compacta para tratamento de esgoto industrial - Distrito de Suape',
 'SUAPE - Complexo Industrial Portuario', 'PE', 'Saneamento',
 '2026-03-18', 28000000.00, 'R$ 28.000.000,00',
 'https://pncp.gov.br/licitacao/PE-2026-008', 'Concorrencia', 'PE-2026-008'),

('Modernizacao do sistema de abastecimento de agua de Cuiaba',
 'Aguas de Cuiaba', 'MT', 'Saneamento',
 '2026-04-10', 55000000.00, 'R$ 55.000.000,00',
 'https://pncp.gov.br/licitacao/MT-2026-009', 'Concorrencia', 'MT-2026-009'),

('Obra de contencao de encostas e drenagem - morros de Salvador',
 'Codesal - Defesa Civil de Salvador', 'BA', 'Drenagem',
 '2026-03-28', 18000000.00, 'R$ 18.000.000,00',
 'https://pncp.gov.br/licitacao/BA-2026-010', 'Tomada de Precos', 'BA-2026-010')

ON CONFLICT (numero_controle) DO NOTHING;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  INDICADORES                                                 ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO indicadores (titulo, valor, descricao, icone, variacao, positivo, fonte_dados) VALUES
('Cobertura Agua Tratada', '84,2%', 'Percentual da populacao brasileira com acesso a agua tratada', 'Droplets', '+1,3%', true, 'SNIS 2025'),
('Coleta de Esgoto', '55,8%', 'Percentual da populacao com coleta de esgoto', 'Factory', '+2,1%', true, 'SNIS 2025'),
('Tratamento de Esgoto', '52,2%', 'Percentual do esgoto coletado que e tratado', 'Recycle', '+3,4%', true, 'SNIS 2025'),
('Investimento Saneamento', 'R$ 23,1 bi', 'Investimento total em saneamento em 2025', 'TrendingUp', '+18%', true, 'Abcon 2025'),
('Perdas na Distribuicao', '36,7%', 'Indice de perdas de agua na distribuicao', 'AlertTriangle', '-1,2%', true, 'SNIS 2025'),
('Licitacoes Ativas', '847', 'Numero de licitacoes abertas no setor de saneamento e infraestrutura', 'FileText', '+156', true, 'PNCP 2026'),
('INCC Acumulado', '5,83%', 'Indice Nacional de Custo da Construcao acumulado 12 meses', 'BarChart3', '+0,42%', false, 'FGV 2026'),
('Empregos Construcao', '2,87 mi', 'Postos de trabalho formais na construcao civil', 'Users', '+124 mil', true, 'CAGED 2025');


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FONTES UTEIS                                                ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO fontes_uteis (nome, descricao, url) VALUES
('PNCP - Portal Nacional de Contratacoes Publicas', 'Portal oficial do governo para licitacoes e contratos publicos', 'https://pncp.gov.br'),
('SNIS - Sistema Nacional de Informacoes sobre Saneamento', 'Base de dados oficial com indicadores de agua e esgoto de todos os municipios', 'http://www.snis.gov.br'),
('SINAPI - Sistema Nacional de Pesquisa de Custos', 'Referencia nacional de custos e indices para obras publicas', 'https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9270-sistema-nacional-de-pesquisa-de-custos-e-indices-da-construcao-civil.html'),
('ANA - Agencia Nacional de Aguas', 'Reguladora federal de recursos hidricos no Brasil', 'https://www.gov.br/ana'),
('Trata Brasil', 'Instituto com dados e estudos sobre saneamento basico no Brasil', 'https://tratabrasil.org.br'),
('CBIC - Camara Brasileira da Industria da Construcao', 'Entidade representativa do setor com dados e estudos', 'https://cbic.org.br'),
('ABES - Associacao Brasileira de Engenharia Sanitaria', 'Associacao tecnica de engenharia sanitaria e ambiental', 'https://abes-dn.org.br'),
('TCU - Tribunal de Contas da Uniao', 'Fiscalizacao de obras publicas federais e jurisprudencia', 'https://portal.tcu.gov.br');


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  EMPRESAS (Fase 4)                                           ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO empresas (cnpj, razao_social, nome_fantasia, segmentos, porte, estado_sede, cidade_sede, ano_fundacao, licitacoes_participadas, licitacoes_vencidas, taxa_vitoria, volume_total_contratos, volume_total_fmt, especialidades, telefone, email, site, status, nota_score) VALUES
('33.000.118/0001-79', 'Odebrecht Engenharia e Construcao S.A.', 'Novonor', ARRAY['Saneamento', 'Infraestrutura', 'Energia'], 'Grande', 'SP', 'Sao Paulo', 1944, 342, 187, 54.68, 8500000000.00, 'R$ 8,5 bi', ARRAY['ETAs', 'ETEs', 'Barragens', 'Rodovias'], '(11) 3049-3000', 'contato@novonor.com.br', 'https://www.novonor.com.br', 'Ativa', 85),
('17.161.106/0001-15', 'BRK Ambiental Participacoes S.A.', 'BRK Ambiental', ARRAY['Saneamento', 'Tratamento de Agua', 'Esgoto'], 'Grande', 'SP', 'Sao Paulo', 2017, 156, 98, 62.82, 4200000000.00, 'R$ 4,2 bi', ARRAY['Concessoes', 'PPPs', 'Operacao de ETAs', 'Redes de Distribuicao'], '(11) 3147-1500', 'contato@bfrk.com.br', 'https://www.brk.com.br', 'Ativa', 92),
('76.535.764/0001-43', 'Construtora Aterpa M. Martins Ltda', 'Aterpa', ARRAY['Infraestrutura', 'Terraplenagem', 'Pavimentacao'], 'Grande', 'MG', 'Belo Horizonte', 1978, 89, 41, 46.07, 1800000000.00, 'R$ 1,8 bi', ARRAY['Rodovias', 'Terraplenagem', 'Obras de Arte'], '(31) 3286-5000', 'contato@aterpa.com.br', 'https://www.aterpa.com.br', 'Ativa', 72),
('02.183.757/0001-54', 'Aegea Saneamento e Participacoes S.A.', 'Aegea', ARRAY['Saneamento', 'Distribuicao de Agua', 'Coleta de Esgoto'], 'Grande', 'SP', 'Sao Paulo', 2010, 78, 52, 66.67, 3100000000.00, 'R$ 3,1 bi', ARRAY['Concessoes Municipais', 'PPPs Saneamento', 'Gestao de Perdas'], '(11) 3500-9500', 'contato@aegea.com.br', 'https://www.aegea.com.br', 'Ativa', 88),
('43.776.517/0001-80', 'EcoUrbes Engenharia e Saneamento Ltda', 'EcoUrbes', ARRAY['Saneamento', 'Drenagem', 'Meio Ambiente'], 'Media', 'PR', 'Curitiba', 2005, 45, 18, 40.00, 280000000.00, 'R$ 280 mi', ARRAY['Drenagem Urbana', 'ETEs Compactas', 'Consultoria Ambiental'], '(41) 3342-7700', 'contato@ecourbes.com.br', 'https://www.ecourbes.com.br', 'Ativa', 65)

ON CONFLICT (cnpj) DO NOTHING;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  HISTORICO DE PRECOS SINAPI                                  ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO historico_precos (insumo, preco, unidade, referencia, data_referencia) VALUES
('Cimento Portland CP-II-32 (50kg)', 38.50, 'saco', 'SINAPI Jan/2026', '2026-01-01'),
('Tubo PVC 100mm esgoto (6m)', 42.80, 'barra', 'SINAPI Jan/2026', '2026-01-01'),
('Aco CA-50 12.5mm', 6.25, 'kg', 'SINAPI Jan/2026', '2026-01-01'),
('Areia media lavada', 95.00, 'm3', 'SINAPI Jan/2026', '2026-01-01'),
('Brita 1 (9,5 a 19mm)', 110.00, 'm3', 'SINAPI Jan/2026', '2026-01-01'),
('Tubo PEAD 200mm agua (12m)', 385.00, 'barra', 'SINAPI Jan/2026', '2026-01-01'),
('Concreto usinado fck 30 MPa', 485.00, 'm3', 'SINAPI Jan/2026', '2026-01-01'),
('Registro gaveta 50mm', 78.90, 'un', 'SINAPI Jan/2026', '2026-01-01'),
('Cimento Portland CP-II-32 (50kg)', 37.20, 'saco', 'SINAPI Out/2025', '2025-10-01'),
('Tubo PVC 100mm esgoto (6m)', 41.50, 'barra', 'SINAPI Out/2025', '2025-10-01'),
('Aco CA-50 12.5mm', 5.98, 'kg', 'SINAPI Out/2025', '2025-10-01'),
('Areia media lavada', 88.00, 'm3', 'SINAPI Out/2025', '2025-10-01'),
('Brita 1 (9,5 a 19mm)', 105.00, 'm3', 'SINAPI Out/2025', '2025-10-01'),
('Tubo PEAD 200mm agua (12m)', 370.00, 'barra', 'SINAPI Out/2025', '2025-10-01'),
('Concreto usinado fck 30 MPa', 465.00, 'm3', 'SINAPI Out/2025', '2025-10-01'),
('Registro gaveta 50mm', 75.50, 'un', 'SINAPI Out/2025', '2025-10-01');


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  UPDATES DO SISTEMA                                          ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO updates (type, type_label, titulo, descricao, versao) VALUES
('feature', 'Nova Funcionalidade', 'Hub de Noticias com 3 abas', 'Pagina de noticias completa com abas Noticias, Artigos e Panorama analitico.', '5.0'),
('feature', 'Nova Funcionalidade', 'Dossies de Empresas e Projetos', 'Perfis detalhados de empresas com historico de licitacoes e projetos em andamento.', '4.0'),
('improvement', 'Melhoria', 'Imagens nas noticias e artigos', 'Noticias e artigos agora exibem fotos do setor de saneamento e engenharia.', '5.1'),
('feature', 'Nova Funcionalidade', 'Analise de Concorrencia + Relatorios PDF', 'Comparativo entre empresas e geracao de relatorios PDF dos dossies.', '4.5'),
('fix', 'Correcao', 'Seguranca RLS atualizada', 'Politicas de Row Level Security revisadas para todas as tabelas.', '5.2');
