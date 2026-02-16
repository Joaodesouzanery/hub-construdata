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

-- Políticas de escrita (SOMENTE service_role — protege contra inserção via anon key)
CREATE POLICY "Service can insert noticias" ON noticias FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert artigos" ON artigos FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert licitacoes" ON licitacoes FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert indicadores" ON indicadores FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert updates" ON updates FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert fontes" ON fontes_uteis FOR INSERT TO service_role WITH CHECK (true);

-- ==============================================================
-- FASE 2 — Autenticação, Perfis e Alertas
-- ==============================================================

-- ─── Perfis de Usuário ────────────────────────────────────
-- Estende auth.users do Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  empresa TEXT,
  cargo TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles (email);

-- ─── Filtros Salvos ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS filtros_salvos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('licitacoes', 'noticias', 'alertas')),
  filtros JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_filtros_user ON filtros_salvos (user_id);

-- ─── Configuração de Alertas ──────────────────────────────
CREATE TABLE IF NOT EXISTS alertas_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_ativo BOOLEAN DEFAULT false,
  palavras_chave TEXT[] DEFAULT '{}',
  estados TEXT[] DEFAULT '{}',
  categorias TEXT[] DEFAULT '{}',
  valor_minimo NUMERIC(15,2) DEFAULT 0,
  limiar_sinapi NUMERIC(5,2) DEFAULT 5.0,
  frequencia TEXT DEFAULT 'diario' CHECK (frequencia IN ('tempo_real', 'diario', 'semanal')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Histórico de Preços SINAPI ───────────────────────────
CREATE TABLE IF NOT EXISTS historico_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo TEXT NOT NULL,
  preco NUMERIC(15,2) NOT NULL,
  unidade TEXT NOT NULL,
  referencia TEXT NOT NULL, -- ex: "Fev/2026 - SP"
  data_referencia DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_historico_insumo ON historico_precos (insumo, data_referencia DESC);

-- ─── RLS Fase 2 ──────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE filtros_salvos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_precos ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário lê/edita apenas o próprio
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Filtros: usuário lê/edita apenas os próprios
CREATE POLICY "Users can view own filters" ON filtros_salvos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own filters" ON filtros_salvos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own filters" ON filtros_salvos FOR DELETE USING (auth.uid() = user_id);

-- Alertas config: usuário lê/edita apenas o próprio
CREATE POLICY "Users can view own alert config" ON alertas_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own alert config" ON alertas_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alert config" ON alertas_config FOR UPDATE USING (auth.uid() = user_id);

-- Histórico de preços: público para leitura
CREATE POLICY "Historico precos viewable by everyone" ON historico_precos FOR SELECT USING (true);
CREATE POLICY "Service can insert historico" ON historico_precos FOR INSERT TO service_role WITH CHECK (true);
