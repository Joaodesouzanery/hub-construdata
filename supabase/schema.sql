-- ==============================================================
-- Hub ConstruData — Schema Supabase (Completo)
-- ==============================================================
-- Execute este SQL no Supabase SQL Editor para criar TODAS as tabelas.
--
-- Passo a passo:
--   1. Crie um projeto em https://supabase.com/dashboard
--   2. Va em SQL Editor > New Query > cole este arquivo inteiro > Run
--   3. Va em Settings > API > copie a "Project URL" e a "anon public" key
--   4. Crie um arquivo .env na raiz do projeto (veja .env.example)
--   5. Rode `npm run dev` — os servicos conectam automaticamente
--
-- SEGURANCA:
--   - Todas as tabelas tem RLS (Row Level Security) ativado
--   - Tabelas publicas: qualquer um pode LER, somente service_role pode ESCREVER
--   - Tabelas de usuario: cada usuario so acessa seus proprios dados
--   - NUNCA exponha a service_role key no frontend
-- ==============================================================

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FASE 1 — Dados Publicos (Noticias, Licitacoes, etc.)      ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── Noticias ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  data_publicacao TIMESTAMPTZ NOT NULL,
  fonte TEXT NOT NULL,
  imagem TEXT,                              -- URL da imagem (og:image)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_noticias_data ON noticias (data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_fonte ON noticias (fonte);

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

CREATE INDEX IF NOT EXISTS idx_artigos_data ON artigos (data_publicacao DESC);

-- ─── Licitacoes ─────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_licitacoes_estado ON licitacoes (estado);
CREATE INDEX IF NOT EXISTS idx_licitacoes_categoria ON licitacoes (categoria);
CREATE INDEX IF NOT EXISTS idx_licitacoes_data ON licitacoes (data_abertura DESC);
CREATE INDEX IF NOT EXISTS idx_licitacoes_valor ON licitacoes (valor_estimado DESC);

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

-- ─── Atualizacoes do Sistema ────────────────────────────────
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('feature', 'improvement', 'fix', 'announcement')),
  type_label TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  versao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Fontes uteis ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fontes_uteis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FASE 2 — Autenticacao, Perfis e Alertas                   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── Perfis de Usuario ──────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);

-- ─── Filtros Salvos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS filtros_salvos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('licitacoes', 'noticias', 'alertas')),
  filtros JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_filtros_user ON filtros_salvos (user_id);

-- ─── Configuracao de Alertas ────────────────────────────────
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

-- ─── Historico de Precos SINAPI ─────────────────────────────
CREATE TABLE IF NOT EXISTS historico_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo TEXT NOT NULL,
  preco NUMERIC(15,2) NOT NULL,
  unidade TEXT NOT NULL,
  referencia TEXT NOT NULL,
  data_referencia DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_historico_insumo ON historico_precos (insumo, data_referencia DESC);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FASE 4 — Dossies de Empresas e Projetos                   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── Empresas ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT NOT NULL,
  segmentos TEXT[] DEFAULT '{}',
  porte TEXT NOT NULL CHECK (porte IN ('MEI', 'ME', 'EPP', 'Media', 'Grande')),
  estado_sede CHAR(2) NOT NULL,
  cidade_sede TEXT NOT NULL,
  ano_fundacao INTEGER,
  licitacoes_participadas INTEGER DEFAULT 0,
  licitacoes_vencidas INTEGER DEFAULT 0,
  taxa_vitoria NUMERIC(5,2) DEFAULT 0,
  volume_total_contratos NUMERIC(15,2) DEFAULT 0,
  volume_total_fmt TEXT,
  especialidades TEXT[] DEFAULT '{}',
  telefone TEXT,
  email TEXT,
  site TEXT,
  status TEXT DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Inativa', 'Suspensa')),
  nota_score INTEGER DEFAULT 0 CHECK (nota_score >= 0 AND nota_score <= 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas (cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_estado ON empresas (estado_sede);
CREATE INDEX IF NOT EXISTS idx_empresas_porte ON empresas (porte);
CREATE INDEX IF NOT EXISTS idx_empresas_score ON empresas (nota_score DESC);

-- ─── Projetos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  empresa_responsavel_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  empresa_responsavel_nome TEXT NOT NULL,
  orgao_contratante TEXT NOT NULL,
  estado CHAR(2) NOT NULL,
  cidade TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor_contrato NUMERIC(15,2) DEFAULT 0,
  valor_contrato_fmt TEXT,
  data_inicio DATE NOT NULL,
  data_previsao_termino DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Em Andamento', 'Concluido', 'Atrasado', 'Planejado', 'Paralisado')),
  percentual_execucao INTEGER DEFAULT 0 CHECK (percentual_execucao >= 0 AND percentual_execucao <= 100),
  licitacao_origem_id UUID REFERENCES licitacoes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projetos_empresa ON projetos (empresa_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos (status);
CREATE INDEX IF NOT EXISTS idx_projetos_estado ON projetos (estado);

-- ─── Participantes de Projeto ───────────────────────────────
CREATE TABLE IF NOT EXISTS participantes_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  cnpj TEXT,
  papel TEXT NOT NULL                       -- 'Executora', 'Subcontratada', 'Fiscalizadora', etc.
);

CREATE INDEX IF NOT EXISTS idx_participantes_projeto ON participantes_projeto (projeto_id);

-- ─── Marcos de Projeto ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS marcos_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('concluido', 'em_andamento', 'pendente'))
);

CREATE INDEX IF NOT EXISTS idx_marcos_projeto ON marcos_projeto (projeto_id, data);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  RLS — Row Level Security (TODAS as tabelas)                ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Ativar RLS em todas as tabelas
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE artigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fontes_uteis ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE filtros_salvos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_precos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcos_projeto ENABLE ROW LEVEL SECURITY;

-- ─── Politicas: Tabelas publicas (leitura publica, escrita service_role) ───

-- Noticias
CREATE POLICY "Noticias are viewable by everyone" ON noticias FOR SELECT USING (true);
CREATE POLICY "Service can insert noticias" ON noticias FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can update noticias" ON noticias FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service can delete noticias" ON noticias FOR DELETE TO service_role USING (true);

-- Artigos
CREATE POLICY "Artigos are viewable by everyone" ON artigos FOR SELECT USING (true);
CREATE POLICY "Service can insert artigos" ON artigos FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can update artigos" ON artigos FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service can delete artigos" ON artigos FOR DELETE TO service_role USING (true);

-- Licitacoes
CREATE POLICY "Licitacoes are viewable by everyone" ON licitacoes FOR SELECT USING (true);
CREATE POLICY "Service can insert licitacoes" ON licitacoes FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can update licitacoes" ON licitacoes FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service can delete licitacoes" ON licitacoes FOR DELETE TO service_role USING (true);

-- Indicadores
CREATE POLICY "Indicadores are viewable by everyone" ON indicadores FOR SELECT USING (true);
CREATE POLICY "Service can insert indicadores" ON indicadores FOR INSERT TO service_role WITH CHECK (true);

-- Updates
CREATE POLICY "Updates are viewable by everyone" ON updates FOR SELECT USING (true);
CREATE POLICY "Service can insert updates" ON updates FOR INSERT TO service_role WITH CHECK (true);

-- Fontes uteis
CREATE POLICY "Fontes are viewable by everyone" ON fontes_uteis FOR SELECT USING (true);
CREATE POLICY "Service can insert fontes" ON fontes_uteis FOR INSERT TO service_role WITH CHECK (true);

-- Empresas
CREATE POLICY "Empresas are viewable by everyone" ON empresas FOR SELECT USING (true);
CREATE POLICY "Service can insert empresas" ON empresas FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can update empresas" ON empresas FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service can delete empresas" ON empresas FOR DELETE TO service_role USING (true);

-- Projetos
CREATE POLICY "Projetos are viewable by everyone" ON projetos FOR SELECT USING (true);
CREATE POLICY "Service can insert projetos" ON projetos FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can update projetos" ON projetos FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service can delete projetos" ON projetos FOR DELETE TO service_role USING (true);

-- Participantes
CREATE POLICY "Participantes are viewable by everyone" ON participantes_projeto FOR SELECT USING (true);
CREATE POLICY "Service can insert participantes" ON participantes_projeto FOR INSERT TO service_role WITH CHECK (true);

-- Marcos
CREATE POLICY "Marcos are viewable by everyone" ON marcos_projeto FOR SELECT USING (true);
CREATE POLICY "Service can insert marcos" ON marcos_projeto FOR INSERT TO service_role WITH CHECK (true);

-- Historico precos
CREATE POLICY "Historico precos viewable by everyone" ON historico_precos FOR SELECT USING (true);
CREATE POLICY "Service can insert historico" ON historico_precos FOR INSERT TO service_role WITH CHECK (true);

-- ─── Politicas: Tabelas de usuario (privadas) ──────────────

-- Profiles: usuario le/edita apenas o proprio
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Filtros: usuario le/edita apenas os proprios
CREATE POLICY "Users can view own filters" ON filtros_salvos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own filters" ON filtros_salvos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own filters" ON filtros_salvos FOR DELETE USING (auth.uid() = user_id);

-- Alertas config: usuario le/edita apenas o proprio
CREATE POLICY "Users can view own alert config" ON alertas_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own alert config" ON alertas_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alert config" ON alertas_config FOR UPDATE USING (auth.uid() = user_id);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FUNCOES AUXILIARES                                         ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Funcao para criar profile automaticamente apos registro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: cria profile automaticamente quando usuario se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
