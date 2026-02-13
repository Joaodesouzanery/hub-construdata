import { useCallback } from "react";
import { useJsonData } from "./useJsonData";
import { fetchArtigos } from "@/services/dataService";
import artigosEmbutidos from "@/data/artigos";

export function useArtigos() {
  const fetcher = useCallback(() => fetchArtigos(), []);
  return useJsonData(fetcher, artigosEmbutidos);
}
