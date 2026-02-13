/**
 * Hook genérico para carregar dados de um serviço com fallback para dados embutidos.
 *
 * Padrão: tenta fetch → se falhar, usa dados embutidos do build.
 * Quando migrar para Supabase, basta trocar a função fetcher no dataService.ts.
 */

import { useEffect, useState } from "react";

interface UseJsonDataResult<T> {
  dados: T[];
  carregando: boolean;
  fonteDados: "api" | "embutido";
  erro: string | null;
}

export function useJsonData<T>(
  fetcher: () => Promise<T[]>,
  dadosEmbutidos: T[],
): UseJsonDataResult<T> {
  const [dados, setDados] = useState<T[]>(dadosEmbutidos);
  const [carregando, setCarregando] = useState(true);
  const [fonteDados, setFonteDados] = useState<"api" | "embutido">("embutido");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetcher()
      .then((resultado) => {
        if (cancelado) return;
        if (resultado.length > 0) {
          setDados(resultado);
          setFonteDados("api");
        }
      })
      .catch((e: Error) => {
        if (cancelado) return;
        setErro(e.message);
        // Mantém dados embutidos como fallback
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => { cancelado = true; };
  }, [fetcher]);

  return { dados, carregando, fonteDados, erro };
}
