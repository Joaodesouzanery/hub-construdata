import { useCallback } from "react";
import { useJsonData } from "./useJsonData";
import { fetchLicitacoes } from "@/services/dataService";
import licitacoesEmbutidas from "@/data/licitacoes";

export function useLicitacoes() {
  const fetcher = useCallback(() => fetchLicitacoes(), []);
  return useJsonData(fetcher, licitacoesEmbutidas);
}
