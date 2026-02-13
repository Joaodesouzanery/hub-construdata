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
  const res = await fetch("./noticias.json");
  if (!res.ok) throw new Error("Falha ao carregar notícias");
  const data = await res.json();
  return validarArray<Noticia>(data, ["titulo", "link", "data_publicacao", "fonte"]);
}

// ─── Artigos / Blog ──────────────────────────────────────

export async function fetchArtigos(): Promise<Artigo[]> {
  const res = await fetch("./artigos.json");
  if (!res.ok) throw new Error("Falha ao carregar artigos");
  const data = await res.json();
  return validarArray<Artigo>(data, ["titulo", "link", "resumo", "fonte"]);
}

// ─── Licitações ──────────────────────────────────────────

export async function fetchLicitacoes(): Promise<Licitacao[]> {
  const res = await fetch("./licitacoes.json");
  if (!res.ok) throw new Error("Falha ao carregar licitações");
  const data = await res.json();
  return validarArray<Licitacao>(data, ["titulo", "orgao", "link", "modalidade"]);
}
