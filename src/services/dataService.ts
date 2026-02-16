/**
 * Camada de serviço para busca de dados.
 *
 * Estratégia:
 *   1. Se VITE_SUPABASE_URL estiver definido → busca do Supabase REST API
 *   2. Senão → busca do JSON estático (public/*.json)
 *
 * Para ativar Supabase:
 *   1. Crie um projeto em supabase.com
 *   2. Execute supabase/schema.sql no SQL Editor
 *   3. Crie .env com:
 *        VITE_SUPABASE_URL=https://xxx.supabase.co
 *        VITE_SUPABASE_ANON_KEY=eyJhbGci...
 *   4. Rode npm run dev — os serviços conectam automaticamente
 *
 * Os hooks e componentes continuam funcionando sem alteração.
 */

import type { Noticia, Artigo, Licitacao } from "@/types/database";

// ── Supabase config ───────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const useSupabase = !!(SUPABASE_URL && SUPABASE_KEY);

/** Limite máximo de tamanho de resposta (5MB) */
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024;

/** Timeout padrão para requests (15s) */
const REQUEST_TIMEOUT_MS = 15_000;

/** Fetch com timeout usando AbortController */
async function fetchComTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    // Validar tamanho da resposta via Content-Length quando disponível
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
      throw new Error("Resposta excede limite de tamanho");
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/** Whitelist de nomes de tabela válidos para Supabase */
const TABELAS_VALIDAS = new Set(["noticias", "artigos", "licitacoes"]);

async function supabaseQuery<T>(
  table: string,
  orderBy: string,
  limit: number
): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase not configured");
  if (!TABELAS_VALIDAS.has(table)) throw new Error("Tabela inválida");

  // Sanitizar parâmetros de query (prevenir injection no REST API)
  const safeOrderBy = orderBy.replace(/[^a-zA-Z0-9_]/g, "");
  const safeLimit = Math.min(Math.max(1, limit), 500);

  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=${safeOrderBy}.desc&limit=${safeLimit}`;
  const res = await fetchComTimeout(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

/** Valida que resposta é um array e filtra itens com campos obrigatórios */
function validarArray<T>(data: unknown, camposObrigatorios: string[]): T[] {
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida: esperado array");
  }
  return data.filter((item) =>
    item != null &&
    typeof item === "object" &&
    camposObrigatorios.every((campo) => campo in item)
  ) as T[];
}

// ─── Notícias ────────────────────────────────────────────

export async function fetchNoticias(): Promise<Noticia[]> {
  if (useSupabase) {
    return supabaseQuery<Noticia>("noticias", "data_publicacao", 50);
  }
  const res = await fetchComTimeout("./noticias.json");
  if (!res.ok) throw new Error("Falha ao carregar notícias");
  const data = await res.json();
  return validarArray<Noticia>(data, ["titulo", "link", "data_publicacao", "fonte"]);
}

// ─── Artigos / Blog ──────────────────────────────────────

export async function fetchArtigos(): Promise<Artigo[]> {
  if (useSupabase) {
    return supabaseQuery<Artigo>("artigos", "data_publicacao", 30);
  }
  const res = await fetchComTimeout("./artigos.json");
  if (!res.ok) throw new Error("Falha ao carregar artigos");
  const data = await res.json();
  return validarArray<Artigo>(data, ["titulo", "link", "resumo", "fonte"]);
}

// ─── Licitações ──────────────────────────────────────────

export async function fetchLicitacoes(): Promise<Licitacao[]> {
  if (useSupabase) {
    return supabaseQuery<Licitacao>("licitacoes", "data_abertura", 200);
  }
  const res = await fetchComTimeout("./licitacoes.json");
  if (!res.ok) throw new Error("Falha ao carregar licitações");
  const data = await res.json();
  return validarArray<Licitacao>(data, ["titulo", "orgao", "link", "modalidade"]);
}
