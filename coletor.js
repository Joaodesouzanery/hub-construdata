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
  {
    url: "https://saneamentobasico.com.br/feed/",
    nome: "Saneamento Básico",
  },
  {
    url: "https://tratamentodeagua.com.br/feed/",
    nome: "Tratamento de Água",
  },
];

// Caminho de saída do JSON (pasta public/ do projeto)
const CAMINHO_SAIDA = path.join(__dirname, "public", "noticias.json");

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
        titulo: item.title?.[0] || "",
        link: item.link?.[0] || "",
        data_publicacao: item.pubDate?.[0] || "",
        fonte: fonte.nome,
      }))
      .filter((n) => n.titulo && n.link); // Só inclui se tiver título e link

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
// 7. SALVAR EM JSON
// ============================================================
function salvarJSON(noticias, caminho) {
  // Garante que o diretório existe
  const diretorio = path.dirname(caminho);
  if (!fs.existsSync(diretorio)) {
    fs.mkdirSync(diretorio, { recursive: true });
  }

  // Salva com formatação legível (indent de 2 espaços)
  fs.writeFileSync(caminho, JSON.stringify(noticias, null, 2), "utf-8");
  console.log(`[OK] ${noticias.length} notícias salvas em: ${caminho}`);
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

  // Passo 5: Selecionar as 10 mais recentes
  const top10 = ordenadas.slice(0, 10);

  // Passo 6: Salvar no JSON
  salvarJSON(top10, CAMINHO_SAIDA);

  console.log("\nConcluído com sucesso!");
}

// Executa
main();
