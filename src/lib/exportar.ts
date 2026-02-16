/**
 * Utilitários de exportação — PDF e XLSX
 *
 * Usa jsPDF + jspdf-autotable para PDF e SheetJS (xlsx) para Excel.
 */

import type { Licitacao } from "@/types/database";

// ── PDF Export ──

export async function exportarLicitacoesPDF(
  licitacoes: Licitacao[],
  titulo = "Relatório de Licitações — Hub ConstruData"
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Hub ConstruData", 14, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(titulo, 14, 20);
  doc.setFontSize(8);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    297 - 14,
    20,
    { align: "right" }
  );

  // Table
  const headers = [["Título", "Órgão", "UF", "Categoria", "Valor", "Data", "Modalidade"]];
  const rows = licitacoes.map((l) => [
    l.titulo.slice(0, 60) + (l.titulo.length > 60 ? "..." : ""),
    l.orgao.slice(0, 35) + (l.orgao.length > 35 ? "..." : ""),
    l.estado,
    l.categoria,
    l.valor_estimado_fmt || "N/I",
    l.data_abertura
      ? new Date(l.data_abertura + "T00:00:00").toLocaleDateString("pt-BR")
      : "",
    l.modalidade,
  ]);

  autoTable(doc, {
    startY: 32,
    head: headers,
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 55 },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 30 },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 22, halign: "center" },
      6: { cellWidth: 30 },
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data: { pageNumber: number }) => {
      // Footer
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Hub ConstruData — Página ${data.pageNumber}`,
        297 / 2,
        210 - 6,
        { align: "center" }
      );
    },
  });

  // Summary page
  doc.addPage();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo do Relatório", 14, 14);

  doc.setTextColor(0);
  doc.setFontSize(10);
  let y = 30;

  const totalValor = licitacoes.reduce((s, l) => s + (l.valor_estimado || 0), 0);
  const stats = [
    ["Total de licitações", String(licitacoes.length)],
    ["Volume total estimado", `R$ ${(totalValor / 1e6).toFixed(1)}M`],
    ["Valor médio", licitacoes.length > 0 ? `R$ ${((totalValor / licitacoes.length) / 1e6).toFixed(2)}M` : "N/A"],
    ["Estados distintos", String(new Set(licitacoes.map((l) => l.estado)).size)],
    ["Categorias distintas", String(new Set(licitacoes.map((l) => l.categoria)).size)],
  ];

  stats.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, 90, y);
    y += 8;
  });

  doc.save("licitacoes-construdata.pdf");
}

export async function exportarRelatorioPDF(
  dados: { titulo: string; secoes: { subtitulo: string; conteudo: string }[] }
) {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Hub ConstruData", 14, 12);
  doc.setFontSize(11);
  doc.text(dados.titulo, 14, 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
    210 - 14,
    20,
    { align: "right" }
  );

  doc.setTextColor(0);
  let y = 36;

  dados.secoes.forEach((secao) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(secao.subtitulo, 14, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(secao.conteudo, 182);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 8;
  });

  doc.save("relatorio-construdata.pdf");
}

// ── XLSX Export ──

export async function exportarLicitacoesXLSX(
  licitacoes: Licitacao[],
  nomeArquivo = "licitacoes-construdata"
) {
  const XLSX = await import("xlsx");

  const dados = licitacoes.map((l) => ({
    "Título": l.titulo,
    "Órgão": l.orgao,
    "UF": l.estado,
    "Categoria": l.categoria,
    "Valor Estimado": l.valor_estimado || 0,
    "Valor Formatado": l.valor_estimado_fmt || "N/I",
    "Data Abertura": l.data_abertura || "",
    "Modalidade": l.modalidade,
    "Link": l.link,
    "Nº Controle": l.numero_controle || "",
  }));

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Licitações");

  // Summary sheet
  const totalValor = licitacoes.reduce((s, l) => s + (l.valor_estimado || 0), 0);
  const resumo = [
    { Métrica: "Total de licitações", Valor: licitacoes.length },
    { Métrica: "Volume total (R$)", Valor: totalValor },
    { Métrica: "Valor médio (R$)", Valor: licitacoes.length > 0 ? Math.round(totalValor / licitacoes.length) : 0 },
    { Métrica: "Estados distintos", Valor: new Set(licitacoes.map((l) => l.estado)).size },
    { Métrica: "Data do relatório", Valor: new Date().toLocaleDateString("pt-BR") },
  ];

  const wsResumo = XLSX.utils.json_to_sheet(resumo);
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}

export async function exportarComparativoXLSX(
  dados: { insumo: string; sinapi: number; sicro: number; diferenca: number }[],
  nomeArquivo = "comparativo-sinapi-sicro"
) {
  const XLSX = await import("xlsx");

  const planilha = dados.map((d) => ({
    "Insumo": d.insumo,
    "SINAPI (R$)": d.sinapi,
    "SICRO (R$)": d.sicro,
    "Diferença (%)": d.diferenca,
    "Recomendação": d.sinapi < d.sicro ? "Usar SINAPI" : "Usar SICRO",
  }));

  const ws = XLSX.utils.json_to_sheet(planilha);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Comparativo");

  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}
