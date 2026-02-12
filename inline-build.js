/**
 * inline-build.js
 * ================
 * Pós-processamento do build do Vite: embute o JS e CSS diretamente
 * dentro do dist/index.html, gerando um arquivo único e auto-contido
 * que funciona ao abrir com duplo-clique (file://).
 *
 * Uso: node inline-build.js  (executado automaticamente pelo npm run build)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, "dist");
const htmlPath = path.join(distDir, "index.html");

let html = fs.readFileSync(htmlPath, "utf-8");

// 1. Inline CSS: <link rel="stylesheet" ... href="./assets/xxx.css"> → <style>...</style>
html = html.replace(
  /<link\s+rel="stylesheet"\s+crossorigin\s+href="\.\/assets\/([^"]+\.css)">/g,
  (_match, filename) => {
    const cssPath = path.join(distDir, "assets", filename);
    const css = fs.readFileSync(cssPath, "utf-8");
    console.log(`[OK] CSS embutido: ${filename} (${(css.length / 1024).toFixed(1)} KB)`);
    return `<style>${css}</style>`;
  }
);

// 2. Inline JS: <script type="module" ... src="./assets/xxx.js"> → <script type="module">...</script>
//    Inline module scripts funcionam em file://, o problema é só com src externo.
html = html.replace(
  /<script\s+type="module"\s+crossorigin\s+src="\.\/assets\/([^"]+\.js)"><\/script>/g,
  (_match, filename) => {
    const jsPath = path.join(distDir, "assets", filename);
    const js = fs.readFileSync(jsPath, "utf-8");
    console.log(`[OK] JS embutido: ${filename} (${(js.length / 1024).toFixed(1)} KB)`);
    return `<script type="module">${js}</script>`;
  }
);

fs.writeFileSync(htmlPath, html, "utf-8");

const finalSize = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`\n[OK] dist/index.html gerado: ${finalSize} KB (arquivo único, auto-contido)`);
console.log("     Abra com duplo-clique no navegador.");
