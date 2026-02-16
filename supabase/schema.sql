-- ==============================================================
-- Hub ConstruData — Schema Supabase
-- ==============================================================
-- Execute este SQL no Supabase SQL Editor para criar as tabelas.
--
-- Depois de criar as tabelas:
--   1. Copie a URL e ANON_KEY do Supabase
--   2. Crie .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
--   3. Os serviços em src/services/dataService.ts vão conectar automaticamente
-- ==============================================================

-- ─── Notícias ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  data_publicacao TIMESTAMPTZ NOT NULL,
  fonte TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_noticias_data ON noticias (data_publicacao DESC);
CREATE INDEX idx_noticias_fonte ON noticias (fonte);

-- ─── Artigos / Blog ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artigos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  resumo TEXT,
  data_publicacao TIMESTAMPTZ NOT NULL,
  fonte TEXT NOT NULL,
  autor TEXT,
  categorias TEXT[] DEFAULT '{}',
  imagem TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_artigos_data ON artigos (data_publicacao DESC);

-- ─── Licitações ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS licitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  orgao TEXT NOT NULL,
  estado CHAR(2) NOT NULL,
  categoria TEXT NOT NULL,
  data_abertura DATE NOT NULL,
  valor_estimado NUMERIC(15,2) DEFAULT 0,
  valor_estimado_fmt TEXT,
  link TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  numero_controle TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_licitacoes_estado ON licitacoes (estado);
CREATE INDEX idx_licitacoes_categoria ON licitacoes (categoria);
CREATE INDEX idx_licitacoes_data ON licitacoes (data_abertura DESC);
CREATE INDEX idx_licitacoes_valor ON licitacoes (valor_estimado DESC);

-- ─── Indicadores ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS indicadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  variacao TEXT,
  positivo BOOLEAN DEFAULT true,
  fonte_dados TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Atualizações do Sistema ────────────────────────────────
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('feature', 'improvement', 'fix', 'announcement')),
  type_label TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  versao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Fontes úteis ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fontes_uteis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── RLS (Row Level Security) ───────────────────────────────
-- Tabelas públicas para leitura (anon pode ler, service_role pode escrever)

ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE artigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fontes_uteis ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Noticias are viewable by everyone" ON noticias FOR SELECT USING (true);
CREATE POLICY "Artigos are viewable by everyone" ON artigos FOR SELECT USING (true);
CREATE POLICY "Licitacoes are viewable by everyone" ON licitacoes FOR SELECT USING (true);
CREATE POLICY "Indicadores are viewable by everyone" ON indicadores FOR SELECT USING (true);
CREATE POLICY "Updates are viewable by everyone" ON updates FOR SELECT USING (true);
CREATE POLICY "Fontes are viewable by everyone" ON fontes_uteis FOR SELECT USING (true);

-- Políticas de escrita (service_role via coletor ou Edge Function)
CREATE POLICY "Service can insert noticias" ON noticias FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert artigos" ON artigos FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert licitacoes" ON licitacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert indicadores" ON indicadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert updates" ON updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert fontes" ON fontes_uteis FOR INSERT WITH CHECK (true);
