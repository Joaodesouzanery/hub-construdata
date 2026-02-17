/**
 * Camada de serviço para busca de dados — Backend Hardened.
 *
 * Estratégia:
 *   1. Se VITE_SUPABASE_URL estiver definido → busca do Supabase REST API
 *   2. Senão → busca do JSON estático (public/*.json)
 *
 * Padrões de produção:
 *   - Cache em memória com TTL configurável
 *   - Request deduplication (mesma URL retorna mesma Promise)
 *   - Retry com exponential backoff
 *   - Typed error classes para tratamento granular
 *   - WebSocket auto-reconnect com backoff
 *   - Circuit breaker para proteção contra falhas em cascata
 *   - Observabilidade via logger estruturado
 */

import type { Noticia, Artigo, Licitacao, Empresa, Indicador } from "@/types/database";
import { logger } from "@/services/logger";

// ══════════════════════════════════════════════════════════════
// Configuração
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const useSupabase = !!(SUPABASE_URL && SUPABASE_KEY);

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 60_000; // 1 minuto
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1_000;

// ══════════════════════════════════════════════════════════════
// Typed Errors
// ══════════════════════════════════════════════════════════════

export class DataServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "DataServiceError";
  }
}

class NetworkError extends DataServiceError {
  constructor(message: string, statusCode?: number) {
    super(message, "NETWORK_ERROR", statusCode, true);
    this.name = "NetworkError";
  }
}

class ValidationError extends DataServiceError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", undefined, false);
    this.name = "ValidationError";
  }
}

class TimeoutError extends DataServiceError {
  constructor(url: string) {
    super(`Request timeout: ${url}`, "TIMEOUT", undefined, true);
    this.name = "TimeoutError";
  }
}

// ══════════════════════════════════════════════════════════════
// Cache com TTL
// ══════════════════════════════════════════════════════════════

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function cacheSet<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/** Limpa o cache inteiro (útil após mutations) */
export function cacheClear(): void {
  cache.clear();
}

// ══════════════════════════════════════════════════════════════
// Request Deduplication
// ══════════════════════════════════════════════════════════════

const inflightRequests = new Map<string, Promise<unknown>>();

// ══════════════════════════════════════════════════════════════
// Circuit Breaker
// ══════════════════════════════════════════════════════════════

const circuitBreaker = {
  failures: 0,
  lastFailure: 0,
  threshold: 5,
  resetTimeMs: 30_000,

  recordSuccess() {
    this.failures = 0;
  },

  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
  },

  isOpen(): boolean {
    if (this.failures < this.threshold) return false;
    if (Date.now() - this.lastFailure > this.resetTimeMs) {
      this.failures = 0;
      return false;
    }
    return true;
  },
};

// ══════════════════════════════════════════════════════════════
// Fetch com Timeout, Retry e Deduplication
// ══════════════════════════════════════════════════════════════

async function fetchComTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
      throw new ValidationError("Resposta excede limite de tamanho");
    }
    return res;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TimeoutError(url);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchComTimeout(url, options);
      if (res.ok) {
        circuitBreaker.recordSuccess();
        return res;
      }
      // 4xx não é retryable (exceto 429)
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        throw new NetworkError(`HTTP ${res.status}`, res.status);
      }
      lastError = new NetworkError(`HTTP ${res.status}`, res.status);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (err instanceof DataServiceError && !err.retryable) throw err;
    }

    if (attempt < retries) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      logger.warn("dataService", `Retry ${attempt + 1}/${retries} em ${delay}ms`, { url });
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  circuitBreaker.recordFailure();
  throw lastError || new NetworkError("Falha na requisição após retries");
}

// ══════════════════════════════════════════════════════════════
// Supabase Helpers
// ══════════════════════════════════════════════════════════════

const TABELAS_VALIDAS = new Set([
  "noticias", "artigos", "licitacoes", "indicadores",
  "updates", "fontes_uteis", "empresas", "projetos",
  "historico_precos", "participantes_projeto", "marcos_projeto",
]);

function supabaseHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY!}`,
    "Content-Type": "application/json",
  };
}

async function supabaseQuery<T>(
  table: string,
  orderBy: string,
  limit: number,
): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new DataServiceError("Supabase not configured", "CONFIG_ERROR");
  if (!TABELAS_VALIDAS.has(table)) throw new ValidationError(`Tabela inválida: ${table}`);

  if (circuitBreaker.isOpen()) {
    logger.warn("dataService", "Circuit breaker aberto, retornando cache ou vazio", { table });
    const cached = cacheGet<T[]>(`supabase:${table}`);
    return cached || [];
  }

  const cacheKey = `supabase:${table}:${orderBy}:${limit}`;

  // Cache hit
  const cached = cacheGet<T[]>(cacheKey);
  if (cached) {
    logger.debug("dataService", `Cache hit: ${table}`, { count: cached.length });
    return cached;
  }

  // Request deduplication
  const inflight = inflightRequests.get(cacheKey);
  if (inflight) {
    logger.debug("dataService", `Dedup: reusing inflight request for ${table}`);
    return inflight as Promise<T[]>;
  }

  const safeOrderBy = orderBy.replace(/[^a-zA-Z0-9_]/g, "");
  const safeLimit = Math.min(Math.max(1, limit), 500);

  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=${safeOrderBy}.desc&limit=${safeLimit}`;
  const startTime = performance.now();

  const promise = fetchWithRetry(url, { headers: supabaseHeaders() })
    .then(async (res) => {
      const data = await res.json() as T[];
      const duration = Math.round(performance.now() - startTime);
      logger.info("dataService", `Fetched ${table}`, { count: data.length, durationMs: duration });
      cacheSet(cacheKey, data);
      return data;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  inflightRequests.set(cacheKey, promise);
  return promise;
}

function validarArray<T>(data: unknown, camposObrigatorios: string[]): T[] {
  if (!Array.isArray(data)) {
    throw new ValidationError("Resposta inválida: esperado array");
  }
  return data.filter((item) =>
    item != null &&
    typeof item === "object" &&
    camposObrigatorios.every((campo) => campo in item),
  ) as T[];
}

// ══════════════════════════════════════════════════════════════
// Fetch Functions (public API)
// ══════════════════════════════════════════════════════════════

export async function fetchNoticias(): Promise<Noticia[]> {
  if (useSupabase) {
    return supabaseQuery<Noticia>("noticias", "data_publicacao", 50);
  }
  const res = await fetchWithRetry("./noticias.json");
  const data = await res.json();
  return validarArray<Noticia>(data, ["titulo", "link", "data_publicacao", "fonte"]);
}

export async function fetchArtigos(): Promise<Artigo[]> {
  if (useSupabase) {
    return supabaseQuery<Artigo>("artigos", "data_publicacao", 30);
  }
  const res = await fetchWithRetry("./artigos.json");
  const data = await res.json();
  return validarArray<Artigo>(data, ["titulo", "link", "resumo", "fonte"]);
}

export async function fetchLicitacoes(): Promise<Licitacao[]> {
  if (useSupabase) {
    return supabaseQuery<Licitacao>("licitacoes", "data_abertura", 200);
  }
  const res = await fetchWithRetry("./licitacoes.json");
  const data = await res.json();
  return validarArray<Licitacao>(data, ["titulo", "orgao", "link", "modalidade"]);
}

export async function fetchIndicadores(): Promise<Indicador[]> {
  if (useSupabase) return supabaseQuery<Indicador>("indicadores", "created_at", 20);
  return [];
}

export async function fetchEmpresas(): Promise<Empresa[]> {
  if (useSupabase) return supabaseQuery<Empresa>("empresas", "nota_score", 100);
  return [];
}

export async function fetchHistoricoPrecos(): Promise<unknown[]> {
  if (useSupabase) return supabaseQuery("historico_precos", "data_referencia", 200);
  return [];
}

// ══════════════════════════════════════════════════════════════
// Busca Global Full-Text
// ══════════════════════════════════════════════════════════════

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

  const safeTermo = termo
    .replace(/[^\w\sáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/g, "")
    .slice(0, 200);

  const cacheKey = `search:${safeTermo}`;
  const cached = cacheGet<ResultadoBusca[]>(cacheKey);
  if (cached) return cached;

  const startTime = performance.now();

  try {
    const url = `${SUPABASE_URL}/rest/v1/rpc/busca_global`;
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({ termo: safeTermo, limite: 20 }),
    });

    const data = await res.json();
    const results = Array.isArray(data) ? data : [];
    const duration = Math.round(performance.now() - startTime);
    logger.info("dataService", `Busca global: "${safeTermo}"`, { results: results.length, durationMs: duration });
    cacheSet(cacheKey, results, 30_000); // 30s cache para busca
    return results;
  } catch (err) {
    logger.error("dataService", "Falha na busca global", { termo: safeTermo, error: String(err) });
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// Realtime Subscriptions (auto-reconnect)
// ══════════════════════════════════════════════════════════════

type RealtimeCallback = (payload: { new: Record<string, unknown> }) => void;

let realtimeWs: WebSocket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const MAX_RECONNECT_ATTEMPTS = 10;
const realtimeCallbacks = new Map<string, Set<RealtimeCallback>>();

function connectRealtime(): void {
  if (!useSupabase || !SUPABASE_URL || !SUPABASE_KEY) return;
  if (realtimeWs && realtimeWs.readyState === WebSocket.OPEN) return;
  if (realtimeCallbacks.size === 0) return;

  const wsUrl = SUPABASE_URL.replace("https://", "wss://").replace("http://", "ws://");

  try {
    realtimeWs = new WebSocket(`${wsUrl}/realtime/v1/websocket?apikey=${SUPABASE_KEY}&vsn=1.0.0`);

    realtimeWs.onopen = () => {
      reconnectAttempts = 0;
      logger.info("realtime", "WebSocket connected");

      for (const t of realtimeCallbacks.keys()) {
        realtimeWs?.send(JSON.stringify({
          topic: `realtime:public:${t}`,
          event: "phx_join",
          payload: { config: { broadcast: { self: true } } },
          ref: String(Date.now()),
        }));
      }

      // Heartbeat
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (realtimeWs?.readyState === WebSocket.OPEN) {
          realtimeWs.send(JSON.stringify({
            topic: "phoenix",
            event: "heartbeat",
            payload: {},
            ref: String(Date.now()),
          }));
        }
      }, 30_000);
    };

    realtimeWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "INSERT" || msg.event === "UPDATE") {
          const tableName = msg.topic?.replace("realtime:public:", "");
          const callbacks = realtimeCallbacks.get(tableName);
          if (callbacks) {
            // Invalidar cache da tabela quando receber update
            for (const key of cache.keys()) {
              if (key.startsWith(`supabase:${tableName}`)) cache.delete(key);
            }
            for (const cb of callbacks) {
              try {
                cb({ new: msg.payload?.record || {} });
              } catch (cbErr) {
                logger.error("realtime", "Callback error", { table: tableName, error: String(cbErr) });
              }
            }
          }
        }
      } catch { /* ignore parse errors */ }
    };

    realtimeWs.onclose = (event) => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = null;
      logger.warn("realtime", `WebSocket closed (code: ${event.code})`, { reason: event.reason });
      scheduleReconnect();
    };

    realtimeWs.onerror = () => {
      logger.error("realtime", "WebSocket error");
    };
  } catch {
    scheduleReconnect();
  }
}

function scheduleReconnect(): void {
  if (realtimeCallbacks.size === 0) return;
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error("realtime", `Gave up reconnecting after ${MAX_RECONNECT_ATTEMPTS} attempts`);
    return;
  }

  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30_000);
  reconnectAttempts++;
  logger.info("realtime", `Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);

  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connectRealtime, delay);
}

export function subscribeRealtime(table: string, callback: RealtimeCallback): () => void {
  if (!useSupabase || !SUPABASE_URL || !SUPABASE_KEY) return () => {};
  if (!TABELAS_VALIDAS.has(table)) return () => {};

  if (!realtimeCallbacks.has(table)) {
    realtimeCallbacks.set(table, new Set());
  }
  realtimeCallbacks.get(table)!.add(callback);

  connectRealtime();

  return () => {
    const callbacks = realtimeCallbacks.get(table);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) realtimeCallbacks.delete(table);
    }
    // Fechar WebSocket se não houver mais subscriptions
    if (realtimeCallbacks.size === 0 && realtimeWs) {
      realtimeWs.close();
      realtimeWs = null;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    }
  };
}
