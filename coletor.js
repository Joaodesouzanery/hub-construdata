/**
 * coletor.js - Coletor de Notícias de Saneamento
 * ================================================
 * Busca notícias de múltiplos feeds RSS de saneamento,
 * consolida, remove duplicatas e salva as 10 mais recentes
 * em public/noticias.json para consumo pelo frontend.
 *
 * Uso: node coletor.js
 */

import https from "https";
import http from "http";
import { parseString } from "xml2js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname não existe em ES modules, então recriamos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// 1. CONFIGURAÇÃO DAS FONTES DE NOTÍCIAS (Feeds RSS)
// ============================================================
const FONTES = [
  // --- Saneamento & Água ---
  { url: "https://saneamentobasico.com.br/feed/", nome: "Saneamento Básico" },
  { url: "https://tratamentodeagua.com.br/feed/", nome: "Tratamento de Água" },
  { url: "https://abes-dn.org.br/feed/", nome: "ABES" },
  { url: "https://trfratabrasil.org.br/feed/", nome: "Trata Brasil" },
  // --- Construção & Infraestrutura ---
  { url: "https://cbic.org.br/feed/", nome: "CBIC" },
  { url: "https://sindusconsp.com.br/feed/", nome: "SindusCon-SP" },
  // --- Meio Ambiente & Regulação ---
  { url: "https://canalmeioambiente.com.br/feed/", nome: "Canal Meio Ambiente" },
  { url: "https://oeco.org.br/feed/", nome: "O Eco" },
  // --- Engenharia & Normas ---
  { url: "https://www.confea.org.br/feed/", nome: "CONFEA" },
  { url: "https://revistaadnormas.com.br/feed/", nome: "Revista AdNormas" },
  // --- Governo & Dados ---
  { url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", nome: "Agência Brasil" },
];

// Caminhos de saída
const CAMINHO_JSON = path.join(__dirname, "public", "noticias.json");
const CAMINHO_TS = path.join(__dirname, "src", "data", "noticias.ts");

// ============================================================
// 2. FUNÇÃO PARA BUSCAR UMA URL (retorna o conteúdo como texto)
// ============================================================
function buscarURL(url) {
  return new Promise((resolve, reject) => {
    const cliente = url.startsWith("https") ? https : http;

    cliente
      .get(url, { headers: { "User-Agent": "HubConstrudata/1.0" } }, (res) => {
        // Seguir redirects (301, 302)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return buscarURL(res.headers.location).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Status HTTP ${res.statusCode}`));
        }

        let dados = "";
        res.on("data", (chunk) => (dados += chunk));
        res.on("end", () => resolve(dados));
      })
      .on("error", reject);
  });
}

// ============================================================
// 3. FUNÇÃO PARA ANALISAR O XML DO FEED RSS
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
// 4. BUSCAR E EXTRAIR NOTÍCIAS DE UMA FONTE
// ============================================================
async function buscarFonte(fonte) {
  try {
    console.log(`Buscando: ${fonte.nome}...`);

    // Faz a requisição HTTP ao feed
    const xmlTexto = await buscarURL(fonte.url);

    // Analisa o XML
    const feed = await analisarFeed(xmlTexto);

    // Extrai os itens do feed RSS (estrutura: rss > channel > item)
    const itens = feed?.rss?.channel?.[0]?.item || [];

    // Mapeia cada <item> para nosso formato
    const noticias = itens
      .map((item) => ({
        titulo: (item.title?.[0] || "").toString().slice(0, 300),
        link: item.link?.[0] || "",
        data_publicacao: item.pubDate?.[0] || "",
        fonte: fonte.nome,
      }))
      .filter((n) => {
        // Valida título e link. Só aceita URLs http/https (previne XSS)
        if (!n.titulo || !n.link) return false;
        try {
          const url = new URL(n.link);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      });

    console.log(`[OK] ${fonte.nome}: ${noticias.length} notícias coletadas`);
    return noticias;
  } catch (erro) {
    // Se o site estiver fora do ar, apenas avisa e continua
    console.log(`[ERRO] Não foi possível acessar '${fonte.nome}'`);
    console.log(`       Motivo: ${erro.message}`);
    return []; // Retorna lista vazia sem quebrar o script
  }
}

// ============================================================
// 5. REMOVER DUPLICATAS (pelo link)
// ============================================================
function removerDuplicatas(noticias) {
  const linksVistos = new Set();
  const unicas = [];

  for (const noticia of noticias) {
    if (!linksVistos.has(noticia.link)) {
      linksVistos.add(noticia.link);
      unicas.push(noticia);
    }
  }

  const removidas = noticias.length - unicas.length;
  if (removidas > 0) {
    console.log(`[INFO] ${removidas} duplicata(s) removida(s)`);
  }

  return unicas;
}

// ============================================================
// 6. ORDENAR POR DATA (mais recente primeiro)
// ============================================================
function ordenarPorData(noticias) {
  return noticias.sort((a, b) => {
    const dataA = new Date(a.data_publicacao);
    const dataB = new Date(b.data_publicacao);
    return dataB - dataA; // Mais recente primeiro
  });
}

// ============================================================
// 7. SALVAR EM JSON + TS EMBUTIDO
// ============================================================
function salvarJSON(noticias, caminho) {
  const diretorio = path.dirname(caminho);
  if (!fs.existsSync(diretorio)) {
    fs.mkdirSync(diretorio, { recursive: true });
  }
  fs.writeFileSync(caminho, JSON.stringify(noticias, null, 2), "utf-8");
  console.log(`[OK] ${noticias.length} notícias salvas em: ${caminho}`);
}

function salvarTS(noticias, caminho) {
  const diretorio = path.dirname(caminho);
  if (!fs.existsSync(diretorio)) {
    fs.mkdirSync(diretorio, { recursive: true });
  }

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
  console.log(`[OK] TS embutido atualizado: ${caminho}`);
}

// ============================================================
// 8. FLUXO PRINCIPAL
// ============================================================
async function main() {
  console.log("==================================================");
  console.log("  Hub Construdata - Coletor de Notícias");
  console.log("==================================================\n");

  // Passo 1: Buscar notícias de todas as fontes (em paralelo)
  const resultados = await Promise.all(FONTES.map(buscarFonte));

  // Passo 2: Consolidar tudo em uma lista única
  const todasNoticias = resultados.flat();
  console.log(`\n[INFO] Total coletado: ${todasNoticias.length} notícias`);

  if (todasNoticias.length === 0) {
    console.log("[AVISO] Nenhuma notícia foi coletada. Verifique sua conexão.");
    return;
  }

  // Passo 3: Remover duplicatas
  const unicas = removerDuplicatas(todasNoticias);

  // Passo 4: Ordenar por data
  const ordenadas = ordenarPorData(unicas);

  // Passo 5: Selecionar as 20 mais recentes
  const top = ordenadas.slice(0, 20);

  // Passo 6: Salvar no JSON (para dev server) e TS (para build estático)
  salvarJSON(top, CAMINHO_JSON);
  salvarTS(top, CAMINHO_TS);

  console.log("\nConcluído com sucesso!");
  console.log("Agora rode 'npm run build' para gerar a versão estática.");
}

// Executa
main();
