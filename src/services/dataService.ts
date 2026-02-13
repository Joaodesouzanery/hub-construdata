/**
 * Camada de serviço para busca de dados.
 *
 * MIGRAÇÃO PARA SUPABASE:
 * Troque cada função abaixo de fetch("./arquivo.json") para:
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 *
 *   export async function fetchNoticias() {
 *     const { data, error } = await supabase
 *       .from("noticias")
 *       .select("*")
 *       .order("data_publicacao", { ascending: false })
 *       .limit(20);
 *     if (error) throw error;
 *     return data;
 *   }
 *
 * Os hooks e componentes continuam funcionando sem alteração.
 */

import type { Noticia, Artigo, Licitacao } from "@/types/database";

// ─── Notícias ────────────────────────────────────────────

export async function fetchNoticias(): Promise<Noticia[]> {
  const res = await fetch("./noticias.json");
  if (!res.ok) throw new Error("Falha ao carregar notícias");
  return res.json();
}

// ─── Artigos / Blog ──────────────────────────────────────

export async function fetchArtigos(): Promise<Artigo[]> {
  const res = await fetch("./artigos.json");
  if (!res.ok) throw new Error("Falha ao carregar artigos");
  return res.json();
}

// ─── Licitações ──────────────────────────────────────────

export async function fetchLicitacoes(): Promise<Licitacao[]> {
  const res = await fetch("./licitacoes.json");
  if (!res.ok) throw new Error("Falha ao carregar licitações");
  return res.json();
}
