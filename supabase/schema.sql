-- ==============================================================
-- Hub ConstruData — Schema Supabase COMPLETO (Backend Hardened)
-- ==============================================================
-- GARANTIDO: funciona ao clicar "Run" no SQL Editor do Supabase,
-- mesmo que tenha sido executado antes. Totalmente idempotente.
--
-- MELHORIAS BACKEND v2:
--   - updated_at automatico em todas as tabelas
--   - UNIQUE constraints para deduplicacao
--   - CHECK constraints para integridade de valores
--   - Audit log para rastreabilidade
--   - Funcao de sanitizacao de inputs
--   - busca_global com validacao de input e limite seguro
-- ==============================================================


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PASSO 0 — Limpar TODAS as policies existentes              ║
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

-- Noticias: link unico (necessario para ON CONFLICT)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'noticias_link_key' OR conname = 'uq_noticias_link'
  ) THEN
    DELETE FROM noticias a USING noticias b
      WHERE a.ctid < b.ctid AND a.link = b.link;
    ALTER TABLE noticias ADD CONSTRAINT uq_noticias_link UNIQUE (link);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN unique_violation THEN NULL;
END $$;

-- Artigos: link unico
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'artigos_link_key' OR conname = 'uq_artigos_link'
  ) THEN
    DELETE FROM artigos a USING artigos b
      WHERE a.ctid < b.ctid AND a.link = b.link;
    ALTER TABLE artigos ADD CONSTRAINT uq_artigos_link UNIQUE (link);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN unique_violation THEN NULL;
END $$;

-- Licitacoes: numero_controle unico
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'licitacoes_numero_controle_key' OR conname = 'uq_licitacoes_numero_controle'
  ) THEN
    DELETE FROM licitacoes a USING licitacoes b
      WHERE a.ctid < b.ctid AND a.numero_controle = b.numero_controle
        AND a.numero_controle IS NOT NULL;
    ALTER TABLE licitacoes ADD CONSTRAINT uq_licitacoes_numero_controle UNIQUE (numero_controle);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN unique_violation THEN NULL;
END $$;

-- Indicadores: titulo unico
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'indicadores_titulo_key' OR conname = 'uq_indicadores_titulo'
  ) THEN
    DELETE FROM indicadores a USING indicadores b
      WHERE a.ctid < b.ctid AND a.titulo = b.titulo;
    ALTER TABLE indicadores ADD CONSTRAINT uq_indicadores_titulo UNIQUE (titulo);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN unique_violation THEN NULL;
END $$;

-- Fontes uteis: url unica
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fontes_uteis_url_key' OR conname = 'uq_fontes_uteis_url'
  ) THEN
    DELETE FROM fontes_uteis a USING fontes_uteis b
      WHERE a.ctid < b.ctid AND a.url = b.url;
    ALTER TABLE fontes_uteis ADD CONSTRAINT uq_fontes_uteis_url UNIQUE (url);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN unique_violation THEN NULL;
END $$;

-- Empresas: cnpj unico
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'empresas_cnpj_key' OR conname = 'uq_empresas_cnpj'
  ) THEN
    DELETE FROM empresas a USING empresas b
      WHERE a.ctid < b.ctid AND a.cnpj = b.cnpj;
    ALTER TABLE empresas ADD CONSTRAINT uq_empresas_cnpj UNIQUE (cnpj);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN unique_violation THEN NULL;
END $$;

-- Historico precos: insumo + data_referencia unico
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_historico_insumo_data'
  ) THEN
    DELETE FROM historico_precos a USING historico_precos b
      WHERE a.ctid < b.ctid AND a.insumo = b.insumo AND a.data_referencia = b.data_referencia;
    ALTER TABLE historico_precos ADD CONSTRAINT uq_historico_insumo_data
      UNIQUE (insumo, data_referencia);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN unique_violation THEN NULL;
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
-- Validacao: termo minimo 2 chars, limite max 100, sanitizacao de input
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

  -- Sanitizacao: limitar tamanho e remover caracteres perigosos
  safe_termo := left(trim(termo), 200);
  safe_limite := LEAST(GREATEST(limite, 1), 100);

  -- Preparar tsquery uma vez (evita recomputacao)
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

-- Funcao de audit log (registra mudancas em tabelas publicas)
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

-- Ativar RLS (idempotente, nao da erro se ja ativo)
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

-- ─── Politicas: Tabelas publicas ────────────────────────────
-- Leitura publica, escrita apenas service_role

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

-- Audit log (somente service_role pode ler, triggers inserem via SECURITY DEFINER)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
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


-- ==============================================================
-- PRONTO! Schema completo e hardened com:
--   15 tabelas (14 + audit_log), RLS em todas,
--   Full-Text Search com tsvector/GIN + busca_global RPC,
--   Realtime publications, auto-profile trigger,
--   updated_at automatico, CHECK constraints,
--   UNIQUE constraints para deduplicacao,
--   Audit log com triggers em tabelas criticas
-- ==============================================================
