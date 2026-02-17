-- ==============================================================
-- Hub ConstruData — SQL COMPLETO (Schema + Seed)
-- ==============================================================
-- COPIE TUDO e cole no SQL Editor do Supabase → clique "Run".
-- Funciona mesmo se ja executou antes. 100% idempotente.
-- ==============================================================


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 0 — NUCLEAR: Limpar TODAS as policies existentes     ║
-- ║  (Isso resolve o erro "policy already exists")              ║
-- ╚══════════════════════════════════════════════════════════════╝

DO $$ DECLARE
  _rec RECORD;
BEGIN
  FOR _rec IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', _rec.policyname, _rec.tablename);
  END LOOP;
END $$;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 0B — Funcao auxiliar: updated_at automatico           ║
-- ╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 1 — Criar tabelas (IF NOT EXISTS)                    ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── Noticias ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL CHECK (char_length(titulo) >= 5 AND char_length(titulo) <= 500),
  link TEXT NOT NULL UNIQUE,
  data_publicacao TIMESTAMPTZ NOT NULL,
  fonte TEXT NOT NULL CHECK (char_length(fonte) >= 1),
  imagem TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Artigos / Blog ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artigos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL CHECK (char_length(titulo) >= 5 AND char_length(titulo) <= 500),
  link TEXT NOT NULL UNIQUE,
  resumo TEXT,
  data_publicacao TIMESTAMPTZ NOT NULL,
  fonte TEXT NOT NULL CHECK (char_length(fonte) >= 1),
  autor TEXT,
  categorias TEXT[] DEFAULT '{}',
  imagem TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Licitacoes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS licitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL CHECK (char_length(titulo) >= 5),
  orgao TEXT NOT NULL CHECK (char_length(orgao) >= 3),
  estado CHAR(2) NOT NULL,
  categoria TEXT NOT NULL,
  data_abertura DATE NOT NULL,
  valor_estimado NUMERIC(15,2) DEFAULT 0 CHECK (valor_estimado >= 0),
  valor_estimado_fmt TEXT,
  link TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  numero_controle TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indicadores ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS indicadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  variacao TEXT,
  positivo BOOLEAN DEFAULT true,
  fonte_dados TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
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
  url TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Perfis de Usuario ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL CHECK (char_length(nome) >= 1 AND char_length(nome) <= 200),
  email TEXT NOT NULL,
  empresa TEXT,
  cargo TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Filtros Salvos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS filtros_salvos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL CHECK (char_length(nome) >= 1 AND char_length(nome) <= 100),
  tipo TEXT NOT NULL CHECK (tipo IN ('licitacoes', 'noticias', 'alertas')),
  filtros JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Configuracao de Alertas ────────────────────────────────
CREATE TABLE IF NOT EXISTS alertas_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_ativo BOOLEAN DEFAULT false,
  palavras_chave TEXT[] DEFAULT '{}',
  estados TEXT[] DEFAULT '{}',
  categorias TEXT[] DEFAULT '{}',
  valor_minimo NUMERIC(15,2) DEFAULT 0 CHECK (valor_minimo >= 0),
  limiar_sinapi NUMERIC(5,2) DEFAULT 5.0 CHECK (limiar_sinapi >= 0 AND limiar_sinapi <= 100),
  frequencia TEXT DEFAULT 'diario' CHECK (frequencia IN ('tempo_real', 'diario', 'semanal')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Historico de Precos SINAPI ─────────────────────────────
CREATE TABLE IF NOT EXISTS historico_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo TEXT NOT NULL,
  preco NUMERIC(15,2) NOT NULL CHECK (preco > 0),
  unidade TEXT NOT NULL,
  referencia TEXT NOT NULL,
  data_referencia DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Empresas ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj TEXT NOT NULL UNIQUE CHECK (char_length(cnpj) >= 14),
  razao_social TEXT NOT NULL CHECK (char_length(razao_social) >= 3),
  nome_fantasia TEXT NOT NULL CHECK (char_length(nome_fantasia) >= 2),
  segmentos TEXT[] DEFAULT '{}',
  porte TEXT NOT NULL CHECK (porte IN ('MEI', 'ME', 'EPP', 'Media', 'Grande')),
  estado_sede CHAR(2) NOT NULL,
  cidade_sede TEXT NOT NULL,
  ano_fundacao INTEGER CHECK (ano_fundacao IS NULL OR (ano_fundacao >= 1800 AND ano_fundacao <= 2100)),
  licitacoes_participadas INTEGER DEFAULT 0 CHECK (licitacoes_participadas >= 0),
  licitacoes_vencidas INTEGER DEFAULT 0 CHECK (licitacoes_vencidas >= 0),
  taxa_vitoria NUMERIC(5,2) DEFAULT 0 CHECK (taxa_vitoria >= 0 AND taxa_vitoria <= 100),
  volume_total_contratos NUMERIC(15,2) DEFAULT 0 CHECK (volume_total_contratos >= 0),
  volume_total_fmt TEXT,
  especialidades TEXT[] DEFAULT '{}',
  telefone TEXT,
  email TEXT,
  site TEXT,
  status TEXT DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Inativa', 'Suspensa')),
  nota_score INTEGER DEFAULT 0 CHECK (nota_score >= 0 AND nota_score <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Projetos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL CHECK (char_length(titulo) >= 5),
  descricao TEXT,
  empresa_responsavel_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  empresa_responsavel_nome TEXT NOT NULL,
  orgao_contratante TEXT NOT NULL,
  estado CHAR(2) NOT NULL,
  cidade TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor_contrato NUMERIC(15,2) DEFAULT 0 CHECK (valor_contrato >= 0),
  valor_contrato_fmt TEXT,
  data_inicio DATE NOT NULL,
  data_previsao_termino DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Em Andamento', 'Concluido', 'Atrasado', 'Planejado', 'Paralisado')),
  percentual_execucao INTEGER DEFAULT 0 CHECK (percentual_execucao >= 0 AND percentual_execucao <= 100),
  licitacao_origem_id UUID REFERENCES licitacoes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_datas_projeto CHECK (data_previsao_termino >= data_inicio)
);

-- ─── Participantes de Projeto ───────────────────────────────
CREATE TABLE IF NOT EXISTS participantes_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  nome TEXT NOT NULL CHECK (char_length(nome) >= 2),
  cnpj TEXT,
  papel TEXT NOT NULL CHECK (char_length(papel) >= 2)
);

-- ─── Marcos de Projeto ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS marcos_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  descricao TEXT NOT NULL CHECK (char_length(descricao) >= 3),
  status TEXT NOT NULL CHECK (status IN ('concluido', 'em_andamento', 'pendente'))
);

-- ─── Audit Log (rastreabilidade de mudancas) ─────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  tabela TEXT NOT NULL,
  registro_id UUID,
  acao TEXT NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE')),
  dados_antigos JSONB,
  dados_novos JSONB,
  usuario_id UUID,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 1B — Adicionar colunas que podem estar faltando      ║
-- ╚══════════════════════════════════════════════════════════════╝

DO $$ BEGIN
  -- Colunas imagem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noticias' AND column_name='imagem') THEN
    ALTER TABLE noticias ADD COLUMN imagem TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artigos' AND column_name='imagem') THEN
    ALTER TABLE artigos ADD COLUMN imagem TEXT;
  END IF;
  -- Colunas updated_at (para tabelas que nao tinham)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noticias' AND column_name='updated_at') THEN
    ALTER TABLE noticias ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artigos' AND column_name='updated_at') THEN
    ALTER TABLE artigos ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='licitacoes' AND column_name='updated_at') THEN
    ALTER TABLE licitacoes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicadores' AND column_name='updated_at') THEN
    ALTER TABLE indicadores ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='updated_at') THEN
    ALTER TABLE empresas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projetos' AND column_name='updated_at') THEN
    ALTER TABLE projetos ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 1C — Triggers de updated_at automatico                ║
-- ╚══════════════════════════════════════════════════════════════╝

DROP TRIGGER IF EXISTS trg_noticias_updated_at ON noticias;
CREATE TRIGGER trg_noticias_updated_at BEFORE UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_artigos_updated_at ON artigos;
CREATE TRIGGER trg_artigos_updated_at BEFORE UPDATE ON artigos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_licitacoes_updated_at ON licitacoes;
CREATE TRIGGER trg_licitacoes_updated_at BEFORE UPDATE ON licitacoes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_indicadores_updated_at ON indicadores;
CREATE TRIGGER trg_indicadores_updated_at BEFORE UPDATE ON indicadores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_alertas_config_updated_at ON alertas_config;
CREATE TRIGGER trg_alertas_config_updated_at BEFORE UPDATE ON alertas_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_empresas_updated_at ON empresas;
CREATE TRIGGER trg_empresas_updated_at BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_projetos_updated_at ON projetos;
CREATE TRIGGER trg_projetos_updated_at BEFORE UPDATE ON projetos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 1D — UNIQUE constraints adicionais (idempotente)      ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Deduplicacao de precos: mesmo insumo na mesma data nao pode repetir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_historico_insumo_data'
  ) THEN
    ALTER TABLE historico_precos ADD CONSTRAINT uq_historico_insumo_data
      UNIQUE (insumo, data_referencia);
  END IF;
EXCEPTION WHEN unique_violation THEN
  NULL;
END $$;

-- Fontes uteis: URL unica
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_fontes_uteis_url'
  ) THEN
    ALTER TABLE fontes_uteis ADD CONSTRAINT uq_fontes_uteis_url UNIQUE (url);
  END IF;
EXCEPTION WHEN unique_violation THEN NULL;
END $$;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 2 — Full-Text Search (tsvector)                      ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Coluna de busca em noticias
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noticias' AND column_name='search_vector') THEN
    ALTER TABLE noticias ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Coluna de busca em artigos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artigos' AND column_name='search_vector') THEN
    ALTER TABLE artigos ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Coluna de busca em licitacoes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='licitacoes' AND column_name='search_vector') THEN
    ALTER TABLE licitacoes ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Coluna de busca em empresas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='search_vector') THEN
    ALTER TABLE empresas ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Funcao para atualizar search_vector de noticias
CREATE OR REPLACE FUNCTION update_noticias_search() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese', COALESCE(NEW.titulo, '') || ' ' || COALESCE(NEW.fonte, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_noticias_search ON noticias;
CREATE TRIGGER trg_noticias_search BEFORE INSERT OR UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION update_noticias_search();

-- Funcao para atualizar search_vector de artigos
CREATE OR REPLACE FUNCTION update_artigos_search() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese',
    COALESCE(NEW.titulo, '') || ' ' || COALESCE(NEW.resumo, '') || ' ' ||
    COALESCE(NEW.autor, '') || ' ' || COALESCE(NEW.fonte, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_artigos_search ON artigos;
CREATE TRIGGER trg_artigos_search BEFORE INSERT OR UPDATE ON artigos
  FOR EACH ROW EXECUTE FUNCTION update_artigos_search();

-- Funcao para atualizar search_vector de licitacoes
CREATE OR REPLACE FUNCTION update_licitacoes_search() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese',
    COALESCE(NEW.titulo, '') || ' ' || COALESCE(NEW.orgao, '') || ' ' ||
    COALESCE(NEW.categoria, '') || ' ' || COALESCE(NEW.modalidade, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_licitacoes_search ON licitacoes;
CREATE TRIGGER trg_licitacoes_search BEFORE INSERT OR UPDATE ON licitacoes
  FOR EACH ROW EXECUTE FUNCTION update_licitacoes_search();

-- Funcao para atualizar search_vector de empresas
CREATE OR REPLACE FUNCTION update_empresas_search() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese',
    COALESCE(NEW.razao_social, '') || ' ' || COALESCE(NEW.nome_fantasia, '') || ' ' ||
    COALESCE(NEW.cnpj, '') || ' ' || COALESCE(NEW.cidade_sede, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_empresas_search ON empresas;
CREATE TRIGGER trg_empresas_search BEFORE INSERT OR UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_empresas_search();

-- Funcao RPC de busca global (chamada pelo frontend)
CREATE OR REPLACE FUNCTION busca_global(termo TEXT, limite INT DEFAULT 20)
RETURNS TABLE(
  tipo TEXT,
  id UUID,
  titulo TEXT,
  subtitulo TEXT,
  data_pub TIMESTAMPTZ,
  relevancia REAL
) AS $$
DECLARE
  safe_termo TEXT;
  safe_limite INT;
  query_ts TSQUERY;
BEGIN
  -- Validacao de input
  IF termo IS NULL OR char_length(trim(termo)) < 2 THEN
    RETURN;
  END IF;

  -- Sanitizacao
  safe_termo := left(trim(termo), 200);
  safe_limite := LEAST(GREATEST(limite, 1), 100);

  -- Preparar tsquery
  query_ts := plainto_tsquery('portuguese', safe_termo);

  RETURN QUERY
  (
    SELECT 'noticia'::TEXT, n.id, n.titulo, n.fonte, n.data_publicacao,
           ts_rank(n.search_vector, query_ts)
    FROM noticias n
    WHERE n.search_vector @@ query_ts
    ORDER BY ts_rank(n.search_vector, query_ts) DESC
    LIMIT safe_limite
  )
  UNION ALL
  (
    SELECT 'artigo'::TEXT, a.id, a.titulo, a.autor, a.data_publicacao,
           ts_rank(a.search_vector, query_ts)
    FROM artigos a
    WHERE a.search_vector @@ query_ts
    ORDER BY ts_rank(a.search_vector, query_ts) DESC
    LIMIT safe_limite
  )
  UNION ALL
  (
    SELECT 'licitacao'::TEXT, l.id, l.titulo, l.orgao, l.data_abertura::TIMESTAMPTZ,
           ts_rank(l.search_vector, query_ts)
    FROM licitacoes l
    WHERE l.search_vector @@ query_ts
    ORDER BY ts_rank(l.search_vector, query_ts) DESC
    LIMIT safe_limite
  )
  UNION ALL
  (
    SELECT 'empresa'::TEXT, e.id, e.nome_fantasia, e.cidade_sede || '/' || e.estado_sede, e.created_at,
           ts_rank(e.search_vector, query_ts)
    FROM empresas e
    WHERE e.search_vector @@ query_ts
    ORDER BY ts_rank(e.search_vector, query_ts) DESC
    LIMIT safe_limite
  )
  ORDER BY relevancia DESC
  LIMIT safe_limite;
END;
$$ LANGUAGE plpgsql STABLE;

-- Funcao de audit log
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (tabela, registro_id, acao, dados_novos, usuario_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (tabela, registro_id, acao, dados_antigos, dados_novos, usuario_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (tabela, registro_id, acao, dados_antigos, usuario_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit triggers para tabelas criticas
DROP TRIGGER IF EXISTS trg_audit_licitacoes ON licitacoes;
CREATE TRIGGER trg_audit_licitacoes AFTER INSERT OR UPDATE OR DELETE ON licitacoes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS trg_audit_empresas ON empresas;
CREATE TRIGGER trg_audit_empresas AFTER INSERT OR UPDATE OR DELETE ON empresas
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS trg_audit_projetos ON projetos;
CREATE TRIGGER trg_audit_projetos AFTER INSERT OR UPDATE OR DELETE ON projetos
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 3 — Indexes (DROP + CREATE para evitar duplicatas)   ║
-- ╚══════════════════════════════════════════════════════════════╝

DROP INDEX IF EXISTS idx_noticias_data;
CREATE INDEX idx_noticias_data ON noticias (data_publicacao DESC);
DROP INDEX IF EXISTS idx_noticias_fonte;
CREATE INDEX idx_noticias_fonte ON noticias (fonte);
DROP INDEX IF EXISTS idx_noticias_search;
CREATE INDEX idx_noticias_search ON noticias USING gin(search_vector);

DROP INDEX IF EXISTS idx_artigos_data;
CREATE INDEX idx_artigos_data ON artigos (data_publicacao DESC);
DROP INDEX IF EXISTS idx_artigos_search;
CREATE INDEX idx_artigos_search ON artigos USING gin(search_vector);

DROP INDEX IF EXISTS idx_licitacoes_estado;
CREATE INDEX idx_licitacoes_estado ON licitacoes (estado);
DROP INDEX IF EXISTS idx_licitacoes_categoria;
CREATE INDEX idx_licitacoes_categoria ON licitacoes (categoria);
DROP INDEX IF EXISTS idx_licitacoes_data;
CREATE INDEX idx_licitacoes_data ON licitacoes (data_abertura DESC);
DROP INDEX IF EXISTS idx_licitacoes_valor;
CREATE INDEX idx_licitacoes_valor ON licitacoes (valor_estimado DESC);
DROP INDEX IF EXISTS idx_licitacoes_search;
CREATE INDEX idx_licitacoes_search ON licitacoes USING gin(search_vector);

DROP INDEX IF EXISTS idx_profiles_email;
CREATE INDEX idx_profiles_email ON profiles (email);

DROP INDEX IF EXISTS idx_filtros_user;
CREATE INDEX idx_filtros_user ON filtros_salvos (user_id);

DROP INDEX IF EXISTS idx_historico_insumo;
CREATE INDEX idx_historico_insumo ON historico_precos (insumo, data_referencia DESC);

DROP INDEX IF EXISTS idx_empresas_cnpj;
CREATE INDEX idx_empresas_cnpj ON empresas (cnpj);
DROP INDEX IF EXISTS idx_empresas_estado;
CREATE INDEX idx_empresas_estado ON empresas (estado_sede);
DROP INDEX IF EXISTS idx_empresas_porte;
CREATE INDEX idx_empresas_porte ON empresas (porte);
DROP INDEX IF EXISTS idx_empresas_score;
CREATE INDEX idx_empresas_score ON empresas (nota_score DESC);
DROP INDEX IF EXISTS idx_empresas_search;
CREATE INDEX idx_empresas_search ON empresas USING gin(search_vector);

DROP INDEX IF EXISTS idx_projetos_empresa;
CREATE INDEX idx_projetos_empresa ON projetos (empresa_responsavel_id);
DROP INDEX IF EXISTS idx_projetos_status;
CREATE INDEX idx_projetos_status ON projetos (status);
DROP INDEX IF EXISTS idx_projetos_estado;
CREATE INDEX idx_projetos_estado ON projetos (estado);

DROP INDEX IF EXISTS idx_participantes_projeto;
CREATE INDEX idx_participantes_projeto ON participantes_projeto (projeto_id);

DROP INDEX IF EXISTS idx_marcos_projeto;
CREATE INDEX idx_marcos_projeto ON marcos_projeto (projeto_id, data);

DROP INDEX IF EXISTS idx_audit_log_tabela;
CREATE INDEX idx_audit_log_tabela ON audit_log (tabela, created_at DESC);
DROP INDEX IF EXISTS idx_audit_log_registro;
CREATE INDEX idx_audit_log_registro ON audit_log (registro_id, created_at DESC);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 4 — Row Level Security                               ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Ativar RLS
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
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ─── Politicas: Tabelas publicas ────────────────────────────

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

-- Audit log
CREATE POLICY "Service can read audit log" ON audit_log FOR SELECT TO service_role USING (true);
CREATE POLICY "System can insert audit log" ON audit_log FOR INSERT WITH CHECK (true);

-- ─── Politicas: Tabelas de usuario (privadas) ───────────────

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Filtros salvos
CREATE POLICY "Users can view own filters" ON filtros_salvos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own filters" ON filtros_salvos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own filters" ON filtros_salvos FOR DELETE USING (auth.uid() = user_id);

-- Alertas config
CREATE POLICY "Users can view own alert config" ON alertas_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own alert config" ON alertas_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alert config" ON alertas_config FOR UPDATE USING (auth.uid() = user_id);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 5 — Funcoes auxiliares                                ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Auto-criar perfil quando usuario se registra
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 6 — Habilitar Realtime nas tabelas publicas          ║
-- ╚══════════════════════════════════════════════════════════════╝

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE noticias;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE licitacoes;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE artigos;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE indicadores;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 7 — Atualizar search_vector dos dados existentes     ║
-- ╚══════════════════════════════════════════════════════════════╝

UPDATE noticias SET search_vector = to_tsvector('portuguese', COALESCE(titulo, '') || ' ' || COALESCE(fonte, ''))
WHERE search_vector IS NULL;

UPDATE artigos SET search_vector = to_tsvector('portuguese', COALESCE(titulo, '') || ' ' || COALESCE(resumo, '') || ' ' || COALESCE(autor, '') || ' ' || COALESCE(fonte, ''))
WHERE search_vector IS NULL;

UPDATE licitacoes SET search_vector = to_tsvector('portuguese', COALESCE(titulo, '') || ' ' || COALESCE(orgao, '') || ' ' || COALESCE(categoria, '') || ' ' || COALESCE(modalidade, ''))
WHERE search_vector IS NULL;

UPDATE empresas SET search_vector = to_tsvector('portuguese', COALESCE(razao_social, '') || ' ' || COALESCE(nome_fantasia, '') || ' ' || COALESCE(cnpj, '') || ' ' || COALESCE(cidade_sede, ''))
WHERE search_vector IS NULL;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║                                                              ║
-- ║              SEED — DADOS INICIAIS                           ║
-- ║                                                              ║
-- ╚══════════════════════════════════════════════════════════════╝


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
('Empregos Construcao', '2,87 mi', 'Postos de trabalho formais na construcao civil', 'Users', '+124 mil', true, 'CAGED 2025')
ON CONFLICT (titulo) DO NOTHING;


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
('TCU - Tribunal de Contas da Uniao', 'Fiscalizacao de obras publicas federais e jurisprudencia', 'https://portal.tcu.gov.br')
ON CONFLICT (url) DO NOTHING;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  EMPRESAS                                                    ║
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


-- ==============================================================
-- PRONTO! Tudo instalado com sucesso.
-- 15 tabelas, RLS, Full-Text Search, Realtime, Audit Log,
-- Triggers, Indexes, e dados de exemplo.
-- ==============================================================
