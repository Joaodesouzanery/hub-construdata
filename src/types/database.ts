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

// ─── Empresas (Fase 4A — Dossiês) ───────────────────────
// Tabela: empresas
export type PorteEmpresa = "MEI" | "ME" | "EPP" | "Media" | "Grande";
export type StatusEmpresa = "Ativa" | "Inativa" | "Suspensa";

export interface Empresa {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  segmentos: string[];
  porte: PorteEmpresa;
  estado_sede: string;
  cidade_sede: string;
  ano_fundacao: number;
  licitacoes_participadas: number;
  licitacoes_vencidas: number;
  taxa_vitoria: number;              // percentual 0-100
  volume_total_contratos: number;    // valor em reais
  volume_total_fmt: string;
  especialidades: string[];
  telefone?: string;
  email?: string;
  site?: string;
  status: StatusEmpresa;
  nota_score: number;                // score de 0-100
  created_at?: string;
}

// ─── Projetos (Fase 4A — Dossiês) ───────────────────────
// Tabela: projetos
export type StatusProjeto =
  | "Em Andamento"
  | "Concluido"
  | "Atrasado"
  | "Planejado"
  | "Paralisado";

export interface MarcoProjeto {
  data: string;
  descricao: string;
  status: "concluido" | "em_andamento" | "pendente";
}

export interface ParticipanteProjeto {
  empresa_id: string;
  nome: string;
  cnpj: string;
  papel: string;                     // ex: "Executora", "Subcontratada", "Fiscalizadora"
}

export interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  empresa_responsavel_id: string;
  empresa_responsavel_nome: string;
  orgao_contratante: string;
  estado: string;
  cidade: string;
  categoria: string;
  valor_contrato: number;
  valor_contrato_fmt: string;
  data_inicio: string;
  data_previsao_termino: string;
  status: StatusProjeto;
  percentual_execucao: number;       // 0-100
  licitacao_origem_id?: string;
  participantes: ParticipanteProjeto[];
  marcos: MarcoProjeto[];
  created_at?: string;
}
