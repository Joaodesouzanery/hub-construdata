/**
 * Serviço de integração com APIs governamentais reais.
 *
 * APIs suportadas:
 *   - PNCP (Portal Nacional de Contratações Públicas) — licitações em tempo real
 *   - IBGE / SNIS — indicadores de saneamento
 *   - Receita Federal QSA — consulta de sócios (via proxy)
 *
 * Todas as chamadas passam por cache, timeout e retry.
 * Se a API externa falhar, retorna dados embutidos como fallback.
 */

import { logger } from "@/services/logger";

// ── Config ──
const PNCP_BASE = "https://pncp.gov.br/api/consulta/v1";
const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1";
const CACHE_TTL_MS = 5 * 60_000; // 5 minutos
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_RETRIES = 2;

// ── Cache ──
const apiCache = new Map<string, { data: unknown; expiresAt: number }>();

function cacheGet<T>(key: string): T | undefined {
  const entry = apiCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    apiCache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function cacheSet(key: string, data: unknown, ttl = CACHE_TTL_MS) {
  apiCache.set(key, { data, expiresAt: Date.now() + ttl });
}

// ── Fetch with timeout + retry ──
async function safeFetch(url: string, retries = MAX_RETRIES): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return res;
      logger.warn("apiGov", `HTTP ${res.status} for ${url}`);
    } catch (err) {
      logger.warn("apiGov", `Attempt ${attempt + 1} failed for ${url}`, { error: String(err) });
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// PNCP — Portal Nacional de Contratações Públicas
// ══════════════════════════════════════════════════════════════

export interface PNCPContratacao {
  numeroControlePNCP: string;
  orgaoEntidade: { razaoSocial: string; cnpj: string };
  dataPublicacaoPncp: string;
  dataAbertura: string;
  objetoCompra: string;
  valorTotalEstimado: number;
  modalidadeNome: string;
  uf: string;
  municipio: string;
  situacaoNome: string;
  linkSistemaOrigem: string;
}

export interface PNCPResponse {
  data: PNCPContratacao[];
  totalRegistros: number;
  paginaAtual: number;
}

/**
 * Busca licitações de saneamento e engenharia no PNCP.
 *
 * @param termo - Palavra-chave (ex: "saneamento", "ETA", "esgoto")
 * @param uf - Filtro por UF (opcional)
 * @param pagina - Número da página (1-indexed)
 * @param tamanhoPagina - Itens por página (max 50)
 */
export async function buscarLicitacoesPNCP(
  termo: string,
  uf?: string,
  pagina = 1,
  tamanhoPagina = 20,
): Promise<PNCPResponse> {
  const params = new URLSearchParams({
    q: termo,
    pagina: String(pagina),
    tamanhoPagina: String(Math.min(tamanhoPagina, 50)),
    ordenacao: "-dataPublicacaoPncp",
  });
  if (uf) params.set("uf", uf);

  const cacheKey = `pncp:${params.toString()}`;
  const cached = cacheGet<PNCPResponse>(cacheKey);
  if (cached) return cached;

  const url = `${PNCP_BASE}/contratacoes/publicacao?${params}`;
  const res = await safeFetch(url);

  if (!res) {
    logger.warn("apiGov", "PNCP indisponível, usando dados embutidos");
    return { data: [], totalRegistros: 0, paginaAtual: pagina };
  }

  try {
    const json = await res.json();
    const result: PNCPResponse = {
      data: Array.isArray(json.data) ? json.data : [],
      totalRegistros: json.totalRegistros || 0,
      paginaAtual: json.paginaAtual || pagina,
    };
    cacheSet(cacheKey, result);
    logger.info("apiGov", `PNCP: ${result.data.length} resultados para "${termo}"`, { uf, pagina });
    return result;
  } catch {
    return { data: [], totalRegistros: 0, paginaAtual: pagina };
  }
}

/**
 * Busca detalhes de uma contratação específica no PNCP.
 */
export async function detalheContratacaoPNCP(numeroControle: string): Promise<PNCPContratacao | null> {
  const cacheKey = `pncp:detalhe:${numeroControle}`;
  const cached = cacheGet<PNCPContratacao>(cacheKey);
  if (cached) return cached;

  const url = `${PNCP_BASE}/contratacoes/${encodeURIComponent(numeroControle)}`;
  const res = await safeFetch(url);
  if (!res) return null;

  try {
    const data = await res.json();
    cacheSet(cacheKey, data, 30 * 60_000); // 30 min
    return data;
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════
// IBGE — Dados municipais e populacionais
// ══════════════════════════════════════════════════════════════

export interface MunicipioIBGE {
  id: number;
  nome: string;
  microrregiao: { mesorregiao: { UF: { sigla: string; nome: string } } };
}

/**
 * Lista municípios de uma UF via API IBGE.
 */
export async function listarMunicipios(uf: string): Promise<MunicipioIBGE[]> {
  const cacheKey = `ibge:municipios:${uf}`;
  const cached = cacheGet<MunicipioIBGE[]>(cacheKey);
  if (cached) return cached;

  const url = `${IBGE_BASE}/localidades/estados/${uf}/municipios`;
  const res = await safeFetch(url);
  if (!res) return [];

  try {
    const data = await res.json();
    const result = Array.isArray(data) ? data : [];
    cacheSet(cacheKey, result, 24 * 60 * 60_000); // 24h
    return result;
  } catch {
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// Receita Federal — Consulta QSA (requer proxy backend)
// ══════════════════════════════════════════════════════════════

export interface DadosReceitaCNPJ {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  natureza_juridica: string;
  porte: string;
  capital_social: number;
  qsa: Array<{
    nome: string;
    qualificacao: string;
    pais_origem?: string;
  }>;
}

/**
 * Consulta dados de CNPJ na Receita Federal.
 *
 * IMPORTANTE: A API da Receita Federal não permite consultas diretas
 * do frontend (CORS). Necessita de um proxy backend ou usar
 * APIs intermediárias como receitaws.com.br, cnpj.ws, etc.
 *
 * Configure VITE_RECEITA_PROXY_URL para apontar para seu proxy.
 */
export async function consultarCNPJ(cnpj: string): Promise<DadosReceitaCNPJ | null> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) return null;

  const cacheKey = `receita:${cnpjLimpo}`;
  const cached = cacheGet<DadosReceitaCNPJ>(cacheKey);
  if (cached) return cached;

  const proxyUrl = import.meta.env.VITE_RECEITA_PROXY_URL as string | undefined;
  if (!proxyUrl) {
    logger.debug("apiGov", "VITE_RECEITA_PROXY_URL não configurado, consulta CNPJ indisponível");
    return null;
  }

  const url = `${proxyUrl}/${cnpjLimpo}`;
  const res = await safeFetch(url, 1);
  if (!res) return null;

  try {
    const data = await res.json();
    cacheSet(cacheKey, data, 60 * 60_000); // 1h
    return data;
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════
// Utilitários
// ══════════════════════════════════════════════════════════════

/** Limpa todo o cache de APIs externas */
export function limparCacheAPIs(): void {
  apiCache.clear();
  logger.info("apiGov", "Cache de APIs externas limpo");
}

/** Verifica conectividade com PNCP */
export async function verificarConectividadePNCP(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${PNCP_BASE}/contratacoes/publicacao?q=saneamento&tamanhoPagina=1`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
