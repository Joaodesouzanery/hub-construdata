/**
 * coletor.js - Coletor de Dados do Hub ConstruData
 * ==================================================
 * Coleta de 3 fontes reais:
 *   1. NOTÍCIAS  — feeds RSS de engenharia, construção e infraestrutura
 *   2. ARTIGOS   — mesmos RSS, mas com excerpt/categorias
 *   3. LICITAÇÕES — API pública do PNCP (Portal Nacional de Contratações Públicas)
 *
 * Saída:
 *   public/noticias.json   + src/data/noticias.ts
 *   public/artigos.json    + src/data/artigos.ts
 *   public/licitacoes.json + src/data/licitacoes.ts
 *
 * Uso: node coletor.js
 *
 * MIGRAÇÃO SUPABASE:
 *   Quando migrar, troque a saída de "salvar em JSON" para
 *   "inserir na tabela Supabase" via supabase-js ou Edge Function.
 */

import https from "https";
import http from "http";
import { parseString } from "xml2js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// 1. CONFIGURAÇÃO DAS FONTES RSS
// ============================================================
const FONTES_RSS = [
  // --- Engenharia (foco principal) ---
  { url: "https://www.confea.org.br/feed/", nome: "CONFEA", categorias: ["Engenharia", "Regulamentação"] },
  { url: "https://www.crea-sp.org.br/feed/", nome: "CREA-SP", categorias: ["Engenharia", "Regulamentação"] },
  { url: "https://revistaadnormas.com.br/feed/", nome: "Revista AdNormas", categorias: ["Engenharia", "Normas Técnicas"] },
  { url: "https://www.aecweb.com.br/rss/noticias/", nome: "AECweb", categorias: ["Engenharia", "Construção Civil"] },
  { url: "https://engenharia360.com/feed/", nome: "Engenharia 360", categorias: ["Engenharia", "Tecnologia"] },
  { url: "https://www.engenhariacivil.com/feed", nome: "Portal Eng. Civil", categorias: ["Engenharia Civil", "Estruturas"] },
  // --- Construção Civil & Infraestrutura ---
  { url: "https://cbic.org.br/feed/", nome: "CBIC", categorias: ["Construção Civil", "Infraestrutura"] },
  { url: "https://sindusconsp.com.br/feed/", nome: "SindusCon-SP", categorias: ["Construção Civil", "Custos"] },
  { url: "https://www.buildin.com.br/feed/", nome: "Buildin", categorias: ["Engenharia", "BIM"] },
  { url: "https://www.sienge.com.br/blog/feed/", nome: "Sienge", categorias: ["Engenharia", "Gestão de Obras"] },
  // --- Saneamento & Recursos Hídricos ---
  { url: "https://saneamentobasico.com.br/feed/", nome: "Saneamento Básico", categorias: ["Saneamento", "Engenharia"] },
  { url: "https://tratamentodeagua.com.br/feed/", nome: "Tratamento de Água", categorias: ["Saneamento", "Eng. Ambiental"] },
  { url: "https://abes-dn.org.br/feed/", nome: "ABES", categorias: ["Saneamento", "Normas Técnicas"] },
  { url: "https://trfratabrasil.org.br/feed/", nome: "Trata Brasil", categorias: ["Saneamento", "Indicadores"] },
  // --- Meio Ambiente & Sustentabilidade ---
  { url: "https://canalmeioambiente.com.br/feed/", nome: "Canal Meio Ambiente", categorias: ["Eng. Ambiental", "Sustentabilidade"] },
  { url: "https://oeco.org.br/feed/", nome: "O Eco", categorias: ["Eng. Ambiental", "Recursos Hídricos"] },
  // --- Governo & Dados ---
  { url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", nome: "Agência Brasil", categorias: ["Governo", "Infraestrutura"] },
];

// ============================================================
// 2. CONFIGURAÇÃO DO PNCP (Licitações)
// ============================================================
const PNCP_BASE = "https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao";

// Palavras-chave para filtrar licitações relevantes a engenharia
const PNCP_PALAVRAS_CHAVE = [
  // Engenharia geral
  "engenharia", "projeto", "laudo", "consultoria técnica", "ART",
  "topografia", "geotecnia", "sondagem", "fundação", "fundações",
  "estrutura", "estrutural", "concreto", "armado", "protendido",
  "cálculo estrutural", "BIM", "modelagem",
  // Construção civil
  "construção", "obra", "edificação", "reforma", "ampliação",
  "habitação", "habitacional", "alvenaria", "acabamento",
  // Infraestrutura
  "infraestrutura", "pavimentação", "drenagem", "terraplanagem",
  "ponte", "viaduto", "rodovia", "estrada", "ferrovia",
  // Saneamento & Hídrico
  "saneamento", "esgoto", "água", "hidrico", "hídrico",
  "barragem", "reservatório", "adutora",
  "tratamento", "ETA", "ETE",
  // Elétrica & Instalações
  "elétrica", "subestação", "rede elétrica", "instalações",
  // Ambiental
  "residuos", "resíduos", "aterro", "ambiental", "EIA", "RIMA",
];

// Mapa de modalidade PNCP → texto legível
const MODALIDADES_PNCP = {
  1: "Leilão Eletrônico",
  2: "Diálogo Competitivo",
  3: "Concurso",
  4: "Concorrência Eletrônica",
  5: "Concorrência Presencial",
  6: "Pregão Eletrônico",
  7: "Pregão Presencial",
  8: "Dispensa de Licitação",
  9: "Inexigibilidade",
  10: "Manifestação de Interesse",
  11: "Pré-qualificação",
  12: "Credenciamento",
  13: "Leilão Presencial",
};

// Categorização automática por palavras-chave no título
function categorizarLicitacao(titulo) {
  const t = titulo.toLowerCase();
  if (t.includes("projeto") || t.includes("consultoria") || t.includes("laudo") || t.includes("topografi") || t.includes("BIM")) return "Engenharia";
  if (t.includes("estrutur") || t.includes("fundaç") || t.includes("geotecni") || t.includes("sondagem") || t.includes("concreto")) return "Eng. Estrutural";
  if (t.includes("elétr") || t.includes("subestação") || t.includes("instalações")) return "Eng. Elétrica";
  if (t.includes("saneamento") || t.includes("esgoto") || t.includes("água") || t.includes("eta") || t.includes("ete")) return "Saneamento";
  if (t.includes("paviment") || t.includes("drenag") || t.includes("infraestrutura") || t.includes("ponte") || t.includes("rodovia") || t.includes("ferrovia")) return "Infraestrutura";
  if (t.includes("construção") || t.includes("edificação") || t.includes("habitac") || t.includes("obra") || t.includes("reforma")) return "Construção Civil";
  if (t.includes("barragem") || t.includes("reservatório") || t.includes("adut") || t.includes("hídric") || t.includes("hidric")) return "Recursos Hídricos";
  if (t.includes("resíduo") || t.includes("aterro") || t.includes("ambiental") || t.includes("meio ambiente")) return "Eng. Ambiental";
  return "Engenharia";
}

// Caminhos de saída
const CAMINHO_NOTICIAS_JSON = path.join(__dirname, "public", "noticias.json");
const CAMINHO_NOTICIAS_TS = path.join(__dirname, "src", "data", "noticias.ts");
const CAMINHO_ARTIGOS_JSON = path.join(__dirname, "public", "artigos.json");
const CAMINHO_ARTIGOS_TS = path.join(__dirname, "src", "data", "artigos.ts");
const CAMINHO_LICITACOES_JSON = path.join(__dirname, "public", "licitacoes.json");
const CAMINHO_LICITACOES_TS = path.join(__dirname, "src", "data", "licitacoes.ts");

// ============================================================
// 3. FUNÇÕES HTTP
// ============================================================
function buscarURL(url, tentativas = 3) {
  return new Promise((resolve, reject) => {
    const cliente = url.startsWith("https") ? https : http;

    cliente
      .get(url, { headers: { "User-Agent": "HubConstrudata/1.0" }, timeout: 15000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return buscarURL(res.headers.location, tentativas).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Status HTTP ${res.statusCode}`));
        }
        let dados = "";
        res.on("data", (chunk) => (dados += chunk));
        res.on("end", () => resolve(dados));
      })
      .on("timeout", () => reject(new Error("Timeout")))
      .on("error", (err) => {
        if (tentativas > 1) {
          setTimeout(() => buscarURL(url, tentativas - 1).then(resolve).catch(reject), 2000);
        } else {
          reject(err);
        }
      });
  });
}

function buscarJSON(url) {
  return buscarURL(url).then((texto) => JSON.parse(texto));
}

// ============================================================
// 4. RSS — ANALISAR XML
// ============================================================
function analisarFeed(xmlTexto) {
  return new Promise((resolve, reject) => {
    parseString(xmlTexto, { trim: true }, (erro, resultado) => {
      if (erro) return reject(erro);
      resolve(resultado);
    });
  });
}

// ============================================================
// 5. RSS — BUSCAR ITENS DE UMA FONTE (notícias + artigos)
// ============================================================
async function buscarFonteRSS(fonte) {
  try {
    console.log(`  RSS: ${fonte.nome}...`);
    const xmlTexto = await buscarURL(fonte.url);
    const feed = await analisarFeed(xmlTexto);
    const itens = feed?.rss?.channel?.[0]?.item || [];

    const resultados = itens
      .map((item) => {
        // Extrair texto limpo da description (remover HTML tags)
        let descricaoRaw = item.description?.[0] || item["content:encoded"]?.[0] || "";
        if (typeof descricaoRaw === "object") descricaoRaw = descricaoRaw._ || "";
        const descricao = descricaoRaw
          .replace(/<[^>]*>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 500);

        // Extrair categorias do RSS
        const catRss = (item.category || []).map((c) =>
          typeof c === "string" ? c : c._ || c.toString()
        ).slice(0, 4);

        // Extrair imagem (media:content, enclosure)
        let imagem = "";
        if (item["media:content"]?.[0]?.$?.url) {
          imagem = item["media:content"][0].$.url;
        } else if (item.enclosure?.[0]?.$?.url) {
          imagem = item.enclosure[0].$.url;
        }

        return {
          titulo: (item.title?.[0] || "").toString().slice(0, 300),
          link: item.link?.[0] || "",
          data_publicacao: item.pubDate?.[0] || "",
          fonte: fonte.nome,
          descricao,
          categorias: catRss.length > 0 ? catRss : fonte.categorias,
          imagem,
        };
      })
      .filter((n) => {
        if (!n.titulo || !n.link) return false;
        try {
          const url = new URL(n.link);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      });

    console.log(`  [OK] ${fonte.nome}: ${resultados.length} itens`);
    return resultados;
  } catch (erro) {
    console.log(`  [ERRO] ${fonte.nome}: ${erro.message}`);
    return [];
  }
}

// ============================================================
// 6. PNCP — BUSCAR LICITAÇÕES REAIS
// ============================================================
async function buscarLicitacoesPNCP() {
  console.log("\n  PNCP: Buscando licitações...");

  try {
    // Buscar últimos 30 dias
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - 30);

    const dataInicial = inicio.toISOString().split("T")[0] + "T00:00:00";
    const dataFinal = hoje.toISOString().split("T")[0] + "T23:59:59";

    const url = `${PNCP_BASE}?dataInicial=${encodeURIComponent(dataInicial)}&dataFinal=${encodeURIComponent(dataFinal)}&pagina=1&tamanhoPagina=100`;

    const dados = await buscarJSON(url);

    // A API retorna array direto ou { data: [...] }
    const itens = Array.isArray(dados) ? dados : (dados.data || []);

    // Filtrar por palavras-chave relevantes ao setor
    const relevantes = itens.filter((item) => {
      const texto = (item.objetoCompra || "").toLowerCase();
      return PNCP_PALAVRAS_CHAVE.some((kw) => texto.includes(kw));
    });

    const licitacoes = relevantes.map((item) => {
      const orgao = item.orgaoEntidade || {};
      const titulo = (item.objetoCompra || "").slice(0, 500);
      const valor = item.valorTotalEstimado || 0;
      const modalidadeId = item.modalidadeId || item.codigoModalidadeContratacao;

      // Construir link para o PNCP
      const cnpj = orgao.cnpj || "";
      const ano = item.anoCompra || "";
      const seq = item.sequencialCompra || "";
      const link = cnpj && ano && seq
        ? `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${seq}`
        : "https://pncp.gov.br";

      return {
        titulo,
        orgao: orgao.razaoSocial || "Órgão não informado",
        estado: orgao.uf || item.uf || "BR",
        categoria: categorizarLicitacao(titulo),
        data_abertura: (item.dataPublicacaoPncp || item.dataAberturaProposta || "").split("T")[0],
        valor_estimado: valor,
        valor_estimado_fmt: valor > 0
          ? `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "Valor não informado",
        link,
        modalidade: MODALIDADES_PNCP[modalidadeId] || `Modalidade ${modalidadeId}`,
        numero_controle: item.numeroControlePNCP || "",
      };
    });

    console.log(`  [OK] PNCP: ${licitacoes.length} licitações relevantes de ${itens.length} total`);
    return licitacoes;
  } catch (erro) {
    console.log(`  [ERRO] PNCP: ${erro.message}`);
    return [];
  }
}

// ============================================================
// 7. UTILIDADES
// ============================================================
function removerDuplicatas(lista, chave = "link") {
  const vistos = new Set();
  const unicas = [];
  for (const item of lista) {
    const k = item[chave];
    if (k && !vistos.has(k)) {
      vistos.add(k);
      unicas.push(item);
    }
  }
  const removidas = lista.length - unicas.length;
  if (removidas > 0) console.log(`  [INFO] ${removidas} duplicata(s) removida(s)`);
  return unicas;
}

function ordenarPorData(lista, campo = "data_publicacao") {
  return lista.sort((a, b) => new Date(b[campo]) - new Date(a[campo]));
}

// ============================================================
// 8. SALVAR EM JSON
// ============================================================
function salvarJSON(dados, caminho) {
  const diretorio = path.dirname(caminho);
  if (!fs.existsSync(diretorio)) fs.mkdirSync(diretorio, { recursive: true });
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), "utf-8");
  console.log(`  [OK] ${dados.length} itens -> ${path.basename(caminho)}`);
}

// ============================================================
// 9. SALVAR EM TS (embutido para build estático)
// ============================================================
function salvarNoticiasTS(noticias, caminho) {
  const diretorio = path.dirname(caminho);
  if (!fs.existsSync(diretorio)) fs.mkdirSync(diretorio, { recursive: true });

  const itens = noticias.map((n) => {
    const titulo = n.titulo.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const link = n.link.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `  {\n    titulo: "${titulo}",\n    link: "${link}",\n    data_publicacao: "${n.data_publicacao}",\n    fonte: "${n.fonte}",\n  }`;
  });

  const conteudo = `/**
 * Arquivo gerado automaticamente por coletor.js em ${new Date().toISOString()}
 * Para atualizar: node coletor.js
 */

export interface Noticia {
  titulo: string;
  link: string;
  data_publicacao: string;
  fonte: string;
}

const noticias: Noticia[] = [
${itens.join(",\n")}
];

export default noticias;
`;

  fs.writeFileSync(caminho, conteudo, "utf-8");
  console.log(`  [OK] TS embutido -> ${path.basename(caminho)}`);
}

function salvarArtigosTS(artigos, caminho) {
  const diretorio = path.dirname(caminho);
  if (!fs.existsSync(diretorio)) fs.mkdirSync(diretorio, { recursive: true });

  const itens = artigos.map((a) => {
    const titulo = a.titulo.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const link = a.link.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const resumo = a.resumo.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const cats = JSON.stringify(a.categorias);
    return `  {\n    titulo: "${titulo}",\n    link: "${link}",\n    resumo: "${resumo}",\n    data_publicacao: "${a.data_publicacao}",\n    fonte: "${a.fonte}",\n    autor: "${a.fonte}",\n    categorias: ${cats},\n    imagem: "${a.imagem || ""}",\n  }`;
  });

  const conteudo = `/**
 * Arquivo gerado automaticamente por coletor.js em ${new Date().toISOString()}
 * Para atualizar: node coletor.js
 */

import type { Artigo } from "@/types/database";

const artigos: Artigo[] = [
${itens.join(",\n")}
];

export default artigos;
`;

  fs.writeFileSync(caminho, conteudo, "utf-8");
  console.log(`  [OK] TS embutido -> ${path.basename(caminho)}`);
}

function salvarLicitacoesTS(licitacoes, caminho) {
  const diretorio = path.dirname(caminho);
  if (!fs.existsSync(diretorio)) fs.mkdirSync(diretorio, { recursive: true });

  const itens = licitacoes.map((l) => {
    const titulo = l.titulo.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const orgao = l.orgao.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const link = l.link.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const modalidade = l.modalidade.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const vfmt = l.valor_estimado_fmt.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `  {\n    titulo: "${titulo}",\n    orgao: "${orgao}",\n    estado: "${l.estado}",\n    categoria: "${l.categoria}",\n    data_abertura: "${l.data_abertura}",\n    valor_estimado: ${l.valor_estimado},\n    valor_estimado_fmt: "${vfmt}",\n    link: "${link}",\n    modalidade: "${modalidade}",\n    numero_controle: "${l.numero_controle || ""}",\n  }`;
  });

  const conteudo = `/**
 * Arquivo gerado automaticamente por coletor.js em ${new Date().toISOString()}
 * Para atualizar: node coletor.js
 */

import type { Licitacao } from "@/types/database";

const licitacoes: Licitacao[] = [
${itens.join(",\n")}
];

export default licitacoes;
`;

  fs.writeFileSync(caminho, conteudo, "utf-8");
  console.log(`  [OK] TS embutido -> ${path.basename(caminho)}`);
}

// ============================================================
// 10. FLUXO PRINCIPAL
// ============================================================
async function main() {
  console.log("==================================================");
  console.log("  Hub ConstruData - Coletor de Dados");
  console.log("==================================================\n");

  // ─── FASE 1: RSS (Notícias + Artigos) ───
  console.log("FASE 1: Coletando RSS (noticias e artigos)...\n");

  const resultadosRSS = await Promise.all(FONTES_RSS.map(buscarFonteRSS));
  const todosItensRSS = resultadosRSS.flat();
  console.log(`\n  [INFO] Total coletado via RSS: ${todosItensRSS.length} itens`);

  if (todosItensRSS.length > 0) {
    // --- Notícias (formato simples: titulo, link, data, fonte) ---
    const noticias = removerDuplicatas(todosItensRSS.map((item) => ({
      titulo: item.titulo,
      link: item.link,
      data_publicacao: item.data_publicacao,
      fonte: item.fonte,
    })));
    const noticiasOrdenadas = ordenarPorData(noticias).slice(0, 20);

    console.log("\n  Salvando noticias...");
    salvarJSON(noticiasOrdenadas, CAMINHO_NOTICIAS_JSON);
    salvarNoticiasTS(noticiasOrdenadas, CAMINHO_NOTICIAS_TS);

    // --- Artigos (com descrição, categorias, imagem) ---
    // Filtrar apenas itens que têm descrição significativa (> 50 chars)
    const artigosComDescricao = todosItensRSS.filter((item) => item.descricao && item.descricao.length > 50);
    const artigosUnicos = removerDuplicatas(artigosComDescricao);
    const artigosOrdenados = ordenarPorData(artigosUnicos).slice(0, 15);

    // Formatar para o tipo Artigo
    const artigosFormatados = artigosOrdenados.map((item) => ({
      titulo: item.titulo,
      link: item.link,
      resumo: item.descricao.slice(0, 300),
      data_publicacao: item.data_publicacao,
      fonte: item.fonte,
      autor: item.fonte,
      categorias: item.categorias,
      imagem: item.imagem || "",
    }));

    console.log("\n  Salvando artigos...");
    salvarJSON(artigosFormatados, CAMINHO_ARTIGOS_JSON);
    salvarArtigosTS(artigosFormatados, CAMINHO_ARTIGOS_TS);
  } else {
    console.log("  [AVISO] Nenhum item coletado via RSS.");
  }

  // ─── FASE 2: PNCP (Licitações) ───
  console.log("\nFASE 2: Coletando licitacoes do PNCP...\n");

  const licitacoes = await buscarLicitacoesPNCP();

  if (licitacoes.length > 0) {
    const licitacoesUnicas = removerDuplicatas(licitacoes, "numero_controle");
    const licitacoesOrdenadas = ordenarPorData(licitacoesUnicas, "data_abertura").slice(0, 20);

    console.log("\n  Salvando licitacoes...");
    salvarJSON(licitacoesOrdenadas, CAMINHO_LICITACOES_JSON);
    salvarLicitacoesTS(licitacoesOrdenadas, CAMINHO_LICITACOES_TS);
  } else {
    console.log("  [AVISO] Nenhuma licitacao coletada do PNCP.");
    // Salvar array vazio para que o fetch não falhe
    salvarJSON([], CAMINHO_LICITACOES_JSON);
  }

  // ─── RESUMO ───
  console.log("\n==================================================");
  console.log("  Coleta concluida!");
  console.log("  Agora rode 'npm run build' para gerar o bundle.");
  console.log("==================================================");
}

main();
