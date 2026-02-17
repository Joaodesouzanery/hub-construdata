/**
 * Hook React para buscar dados do Supabase com fallback para dados embutidos.
 *
 * Uso:
 *   const { noticias, licitacoes, empresas, loading } = useData();
 *
 * Estratégia:
 *   1. Retorna dados embutidos imediatamente (sem loading)
 *   2. Em background, tenta buscar do Supabase via dataService
 *   3. Se Supabase retornar dados, substitui os embutidos
 *   4. Se falhar, mantém os dados embutidos (graceful degradation)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { Noticia, Artigo, Licitacao, Empresa, Indicador } from "@/types/database";
import {
  fetchNoticias,
  fetchArtigos,
  fetchLicitacoes,
  fetchEmpresas,
  fetchIndicadores,
  useSupabase,
  subscribeRealtime,
} from "@/services/dataService";

// Dados embutidos como fallback
import noticiasEmbutidas from "@/data/noticias";
import artigosEmbutidos from "@/data/artigos";
import { dadosEmbutidosLicitacoes } from "@/data/licitacoes";
import { empresas as empresasEmbutidas } from "@/data/empresas";

interface DataState {
  noticias: Noticia[];
  artigos: Artigo[];
  licitacoes: Licitacao[];
  empresas: Empresa[];
  indicadores: Indicador[];
  loading: boolean;
  error: string | null;
  isLive: boolean; // true se dados vêm do Supabase
}

export function useData() {
  const [state, setState] = useState<DataState>({
    noticias: noticiasEmbutidas,
    artigos: artigosEmbutidos,
    licitacoes: dadosEmbutidosLicitacoes,
    empresas: empresasEmbutidas,
    indicadores: [],
    loading: useSupabase,
    error: null,
    isLive: false,
  });

  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!useSupabase) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const [noticias, artigos, licitacoes, empresas, indicadores] =
        await Promise.all([
          fetchNoticias().catch(() => null),
          fetchArtigos().catch(() => null),
          fetchLicitacoes().catch(() => null),
          fetchEmpresas().catch(() => null),
          fetchIndicadores().catch(() => null),
        ]);

      if (!mounted.current) return;

      setState((s) => ({
        ...s,
        noticias: (noticias && noticias.length > 0 ? noticias : s.noticias) as Noticia[],
        artigos: (artigos && artigos.length > 0 ? artigos : s.artigos) as Artigo[],
        licitacoes: (licitacoes && licitacoes.length > 0 ? licitacoes : s.licitacoes) as Licitacao[],
        empresas: (empresas && empresas.length > 0 ? empresas : s.empresas) as Empresa[],
        indicadores: (indicadores || []) as Indicador[],
        loading: false,
        isLive: !!(noticias && noticias.length > 0),
      }));
    } catch (err) {
      if (!mounted.current) return;
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Erro ao carregar dados",
      }));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();

    // Realtime subscriptions
    const unsubs = [
      subscribeRealtime("noticias", () => refresh()),
      subscribeRealtime("licitacoes", () => refresh()),
      subscribeRealtime("artigos", () => refresh()),
    ];

    return () => {
      mounted.current = false;
      unsubs.forEach((fn) => fn());
    };
  }, [refresh]);

  return { ...state, refresh };
}

/**
 * Hook para buscar apenas uma tabela específica (otimizado).
 */
export function useNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>(noticiasEmbutidas);
  const [loading, setLoading] = useState(useSupabase);

  useEffect(() => {
    let active = true;
    if (useSupabase) {
      fetchNoticias()
        .then((data) => {
          if (active && data.length > 0) setNoticias(data);
        })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
    }
    const unsub = subscribeRealtime("noticias", () => {
      fetchNoticias().then((d) => { if (active && d.length > 0) setNoticias(d); }).catch(() => {});
    });
    return () => { active = false; unsub(); };
  }, []);

  return { noticias, loading };
}

export function useLicitacoes() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(dadosEmbutidosLicitacoes);
  const [loading, setLoading] = useState(useSupabase);

  useEffect(() => {
    let active = true;
    if (useSupabase) {
      fetchLicitacoes()
        .then((data) => { if (active && data.length > 0) setLicitacoes(data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
    }
    const unsub = subscribeRealtime("licitacoes", () => {
      fetchLicitacoes().then((d) => { if (active && d.length > 0) setLicitacoes(d); }).catch(() => {});
    });
    return () => { active = false; unsub(); };
  }, []);

  return { licitacoes, loading };
}

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasEmbutidas);
  const [loading, setLoading] = useState(useSupabase);

  useEffect(() => {
    let active = true;
    if (useSupabase) {
      fetchEmpresas()
        .then((data) => { if (active && data.length > 0) setEmpresas(data as Empresa[]); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, []);

  return { empresas, loading };
}
