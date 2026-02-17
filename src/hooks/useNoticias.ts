import { useCallback } from "react";
import { useJsonData } from "./useJsonData";
import { fetchNoticias } from "@/services/dataService";
import noticiasEmbutidas from "@/data/noticias";

export function useNoticias() {
  const fetcher = useCallback(() => fetchNoticias(), []);
  return useJsonData(fetcher, noticiasEmbutidas);
}
