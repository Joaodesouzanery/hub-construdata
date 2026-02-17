import { useCallback } from "react";
import { useJsonData } from "./useJsonData";
import { fetchEmpresas } from "@/services/dataService";
import { empresas as empresasEmbutidas } from "@/data/empresas";

export function useEmpresas() {
  const fetcher = useCallback(() => fetchEmpresas(), []);
  return useJsonData(fetcher, empresasEmbutidas);
}
