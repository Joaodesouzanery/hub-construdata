/**
 * Hook para busca em tempo real no Portal Nacional de Contratações Públicas (PNCP).
 *
 * Usa a API real do PNCP (https://pncp.gov.br/api/consulta/v1).
 * Inclui cache local, debounce e fallback para dados embutidos.
 */

import { useState, useCallback, useRef } from "react";
import { buscarLicitacoesPNCP, type PNCPContratacao } from "@/services/apiGov";
import type { Licitacao } from "@/types/database";

interface UsePNCPResult {
  resultados: Licitacao[];
  buscando: boolean;
  erro: string | null;
  totalRegistros: number;
  paginaAtual: number;
  buscar: (termo: string, uf?: string, pagina?: number) => Promise<void>;
  limpar: () => void;
  fonte: "pncp" | "nenhuma";
}

/** Converte resultado do PNCP para o formato interno Licitacao */
function pncpParaLicitacao(item: PNCPContratacao, index: number): Licitacao {
  const valor = item.valorTotalEstimado || 0;
  let valorFmt: string;
  if (valor >= 1e9) valorFmt = `R$ ${(valor / 1e9).toFixed(1)}B`;
  else if (valor >= 1e6) valorFmt = `R$ ${(valor / 1e6).toFixed(1)}M`;
  else if (valor >= 1e3) valorFmt = `R$ ${(valor / 1e3).toFixed(0)}K`;
  else valorFmt = `R$ ${valor.toLocaleString("pt-BR")}`;

  // Mapear modalidade
  const modalidade = item.modalidadeNome || "Não informada";

  // Categorizar por palavras-chave no objeto
  const obj = (item.objetoCompra || "").toLowerCase();
  let categoria = "Engenharia";
  if (obj.match(/saneamento|esgoto|água|abastecimento|eta |ete |adut/)) categoria = "Saneamento";
  else if (obj.match(/construção|edificação|reforma|prédio/)) categoria = "Construção Civil";
  else if (obj.match(/infraestrutura|drenagem|paviment|rodov/)) categoria = "Infraestrutura";

  return {
    id: `pncp-${item.numeroControlePNCP || index}`,
    titulo: item.objetoCompra || "Sem descrição",
    orgao: item.orgaoEntidade?.razaoSocial || "Órgão não informado",
    estado: item.uf || "BR",
    categoria,
    data_abertura: (item.dataAbertura || item.dataPublicacaoPncp || "").slice(0, 10),
    valor_estimado: valor,
    valor_estimado_fmt: valorFmt,
    link: item.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${item.numeroControlePNCP}`,
    modalidade,
    numero_controle: item.numeroControlePNCP,
  };
}

export function usePNCP(): UsePNCPResult {
  const [resultados, setResultados] = useState<Licitacao[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [fonte, setFonte] = useState<"pncp" | "nenhuma">("nenhuma");
  const abortRef = useRef(0);

  const buscar = useCallback(async (termo: string, uf?: string, pagina = 1) => {
    if (!termo.trim()) return;

    const requestId = ++abortRef.current;
    setBuscando(true);
    setErro(null);

    try {
      const response = await buscarLicitacoesPNCP(termo, uf, pagina, 20);

      // Verificar se esta requisição ainda é a mais recente
      if (requestId !== abortRef.current) return;

      const licitacoes = response.data.map(pncpParaLicitacao);
      setResultados(licitacoes);
      setTotalRegistros(response.totalRegistros);
      setPaginaAtual(response.paginaAtual);
      setFonte(licitacoes.length > 0 ? "pncp" : "nenhuma");
    } catch (e) {
      if (requestId !== abortRef.current) return;
      setErro(e instanceof Error ? e.message : "Erro ao buscar no PNCP");
      setFonte("nenhuma");
    } finally {
      if (requestId === abortRef.current) {
        setBuscando(false);
      }
    }
  }, []);

  const limpar = useCallback(() => {
    abortRef.current++;
    setResultados([]);
    setTotalRegistros(0);
    setPaginaAtual(1);
    setErro(null);
    setFonte("nenhuma");
    setBuscando(false);
  }, []);

  return { resultados, buscando, erro, totalRegistros, paginaAtual, buscar, limpar, fonte };
}
