/**
 * Camada de serviço para busca de dados.
 *
 * Estratégia:
 *   1. Se VITE_SUPABASE_URL estiver definido → busca do Supabase REST API
 *   2. Senão → busca do JSON estático (public/*.json)
 *
 * Funcionalidades:
 *   - Queries REST com timeout e validação
 *   - Busca global full-text (RPC busca_global)
 *   - Realtime subscriptions via Supabase channels
 */

import type { Noticia, Artigo, Licitacao } from "@/types/database";

// ── Supabase config ───────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const useSupabase = !!(SUPABASE_URL && SUPABASE_KEY);

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
const TABELAS_VALIDAS = new Set([
  "noticias", "artigos", "licitacoes", "indicadores",
  "updates", "fontes_uteis", "empresas", "projetos",
  "historico_precos", "participantes_projeto", "marcos_projeto",
]);

function supabaseHeaders() {
  return {
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY!}`,
    "Content-Type": "application/json",
  };
}

async function supabaseQuery<T>(
  table: string,
  orderBy: string,
  limit: number
): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase not configured");
  if (!TABELAS_VALIDAS.has(table)) throw new Error("Tabela inválida");

  const safeOrderBy = orderBy.replace(/[^a-zA-Z0-9_]/g, "");
  const safeLimit = Math.min(Math.max(1, limit), 500);

  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=${safeOrderBy}.desc&limit=${safeLimit}`;
  const res = await fetchComTimeout(url, { headers: supabaseHeaders() });
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

// ─── Indicadores ─────────────────────────────────────────

export async function fetchIndicadores(): Promise<unknown[]> {
  if (useSupabase) {
    return supabaseQuery("indicadores", "created_at", 20);
  }
  return [];
}

// ─── Empresas ────────────────────────────────────────────

export async function fetchEmpresas(): Promise<unknown[]> {
  if (useSupabase) {
    return supabaseQuery("empresas", "nota_score", 100);
  }
  return [];
}

// ─── Histórico de Preços ─────────────────────────────────

export async function fetchHistoricoPrecos(): Promise<unknown[]> {
  if (useSupabase) {
    return supabaseQuery("historico_precos", "data_referencia", 200);
  }
  return [];
}

// ─── Busca Global Full-Text ──────────────────────────────

export interface ResultadoBusca {
  tipo: "noticia" | "artigo" | "licitacao" | "empresa";
  id: string;
  titulo: string;
  subtitulo: string;
  data_pub: string;
  relevancia: number;
}

export async function buscaGlobal(termo: string): Promise<ResultadoBusca[]> {
  if (!useSupabase || !SUPABASE_URL || !SUPABASE_KEY) return [];
  if (!termo || termo.trim().length < 2) return [];

  const safeTermo = termo.replace(/[^\w\sáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/g, "").slice(0, 100);

  const url = `${SUPABASE_URL}/rest/v1/rpc/busca_global`;
  const res = await fetchComTimeout(url, {
    method: "POST",
    headers: supabaseHeaders(),
    body: JSON.stringify({ termo: safeTermo, limite: 20 }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ─── Realtime Subscriptions ──────────────────────────────

type RealtimeCallback = (payload: { new: Record<string, unknown> }) => void;

let realtimeWs: WebSocket | null = null;
const realtimeCallbacks = new Map<string, Set<RealtimeCallback>>();

export function subscribeRealtime(table: string, callback: RealtimeCallback): () => void {
  if (!useSupabase || !SUPABASE_URL || !SUPABASE_KEY) return () => {};
  if (!TABELAS_VALIDAS.has(table)) return () => {};

  if (!realtimeCallbacks.has(table)) {
    realtimeCallbacks.set(table, new Set());
  }
  realtimeCallbacks.get(table)!.add(callback);

  // Initialize WebSocket if not connected
  if (!realtimeWs || realtimeWs.readyState === WebSocket.CLOSED) {
    const wsUrl = SUPABASE_URL.replace("https://", "wss://").replace("http://", "ws://");
    try {
      realtimeWs = new WebSocket(`${wsUrl}/realtime/v1/websocket?apikey=${SUPABASE_KEY}&vsn=1.0.0`);

      realtimeWs.onopen = () => {
        // Join channels for all subscribed tables
        for (const t of realtimeCallbacks.keys()) {
          const joinMsg = JSON.stringify({
            topic: `realtime:public:${t}`,
            event: "phx_join",
            payload: { config: { broadcast: { self: true } } },
            ref: String(Date.now()),
          });
          realtimeWs?.send(joinMsg);
        }
      };

      realtimeWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === "INSERT" || msg.event === "UPDATE") {
            const tableName = msg.topic?.replace("realtime:public:", "");
            const callbacks = realtimeCallbacks.get(tableName);
            if (callbacks) {
              for (const cb of callbacks) {
                cb({ new: msg.payload?.record || {} });
              }
            }
          }
        } catch { /* ignore parse errors */ }
      };

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        if (realtimeWs?.readyState === WebSocket.OPEN) {
          realtimeWs.send(JSON.stringify({
            topic: "phoenix",
            event: "heartbeat",
            payload: {},
            ref: String(Date.now()),
          }));
        }
      }, 30000);

      realtimeWs.onclose = () => clearInterval(heartbeat);
    } catch { /* ignore WebSocket errors in offline mode */ }
  }

  // Return unsubscribe function
  return () => {
    const callbacks = realtimeCallbacks.get(table);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) realtimeCallbacks.delete(table);
    }
  };
}
