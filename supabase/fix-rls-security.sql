-- ==============================================================
-- Hub ConstruData — Correção de Segurança RLS
-- ==============================================================
-- EXECUTE ESTE SQL se você já rodou o schema.sql anterior.
-- Ele corrige as políticas de INSERT para aceitar SOMENTE service_role,
-- impedindo que a anon key (exposta no frontend) insira dados.
-- ==============================================================

-- Remover políticas antigas (permissivas)
DROP POLICY IF EXISTS "Service can insert noticias" ON noticias;
DROP POLICY IF EXISTS "Service can insert artigos" ON artigos;
DROP POLICY IF EXISTS "Service can insert licitacoes" ON licitacoes;
DROP POLICY IF EXISTS "Service can insert indicadores" ON indicadores;
DROP POLICY IF EXISTS "Service can insert updates" ON updates;
DROP POLICY IF EXISTS "Service can insert fontes" ON fontes_uteis;

-- Recriar com restrição a service_role
CREATE POLICY "Service can insert noticias" ON noticias FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert artigos" ON artigos FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert licitacoes" ON licitacoes FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert indicadores" ON indicadores FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert updates" ON updates FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service can insert fontes" ON fontes_uteis FOR INSERT TO service_role WITH CHECK (true);
