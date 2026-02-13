/**
 * Tipos compartilhados — mapeiam 1:1 com futuras tabelas no Supabase.
 *
 * Quando migrar para Supabase:
 *   1. Crie as tabelas com esses mesmos campos
 *   2. Troque os serviços em src/services/dataService.ts
 *      de fetch("./arquivo.json") para supabase.from("tabela").select("*")
 *   3. Pronto — hooks e componentes não precisam mudar
 */

// ─── Notícias ────────────────────────────────────────────
// Tabela: noticias
export interface Noticia {
  id?: string;                  // uuid (Supabase gera)
  titulo: string;
  link: string;
  data_publicacao: string;      // timestamptz ISO 8601
  fonte: string;
  created_at?: string;          // timestamptz (Supabase gera)
}

// ─── Artigos / Blog ──────────────────────────────────────
// Tabela: artigos
export interface Artigo {
  id?: string;
  titulo: string;
  link: string;
  resumo: string;               // excerpt / description do RSS
  data_publicacao: string;
  fonte: string;
  autor: string;
  categorias: string[];
  imagem?: string;              // URL da imagem (og:image ou placeholder)
  created_at?: string;
}

// ─── Licitações ──────────────────────────────────────────
// Tabela: licitacoes
export interface Licitacao {
  id?: string;
  titulo: string;
  orgao: string;
  estado: string;               // UF (2 letras)
  categoria: string;
  data_abertura: string;        // date YYYY-MM-DD
  valor_estimado: number;       // numeric (valor em reais)
  valor_estimado_fmt: string;   // texto formatado "R$ XX.XXX,XX"
  link: string;
  modalidade: string;
  numero_controle?: string;     // número PNCP
  created_at?: string;
}

// ─── Atualizações do Sistema ─────────────────────────────
// Tabela: updates
export type UpdateType = "feature" | "improvement" | "fix" | "announcement";

export interface UpdateItem {
  id?: string;
  type: UpdateType;
  type_label: string;
  titulo: string;
  descricao: string;
  versao: string;               // ex: "v2.5 - 12/02/2026"
  created_at?: string;
}

// ─── Indicadores ─────────────────────────────────────────
// Tabela: indicadores
export interface Indicador {
  id?: string;
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;                // nome do ícone Lucide (ex: "Droplets")
  variacao?: string;
  positivo?: boolean;
  fonte_dados: string;          // ex: "SNIS 2025"
  created_at?: string;
}

// ─── Fontes úteis ────────────────────────────────────────
// Tabela: fontes_uteis
export interface FonteUtil {
  id?: string;
  nome: string;
  descricao: string;
  url: string;
  created_at?: string;
}
