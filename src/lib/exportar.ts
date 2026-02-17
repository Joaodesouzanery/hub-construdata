/**
 * Utilitários de exportação — PDF e XLSX
 *
 * Usa jsPDF + jspdf-autotable para PDF e SheetJS (xlsx) para Excel.
 */

import type { Licitacao, Empresa, Projeto } from "@/types/database";

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

// ── Dossiê de Empresa — PDF ──

export async function exportarDossieEmpresaPDF(
  empresa: Empresa,
  projetosEmpresa: Projeto[]
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Hub ConstruData — Dossie de Empresa", 14, 12);
  doc.setFontSize(13);
  doc.text(empresa.nome_fantasia, 14, 22);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")}`,
    210 - 14, 22, { align: "right" }
  );
  doc.text(empresa.razao_social, 14, 28);

  doc.setTextColor(0);
  let y = 40;

  // Dados gerais
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dados Gerais", 14, y);
  y += 7;
  doc.setFontSize(9);

  const dadosGerais = [
    ["CNPJ", empresa.cnpj],
    ["Razao Social", empresa.razao_social],
    ["Nome Fantasia", empresa.nome_fantasia],
    ["Sede", `${empresa.cidade_sede}/${empresa.estado_sede}`],
    ["Porte", empresa.porte],
    ["Fundacao", String(empresa.ano_fundacao)],
    ["Status", empresa.status],
    ["Segmentos", empresa.segmentos.join(", ")],
    ["Especialidades", empresa.especialidades.join("; ")],
    ["Telefone", empresa.telefone || "N/I"],
    ["Email", empresa.email || "N/I"],
  ];

  dadosGerais.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, 140);
    doc.text(lines, 55, y);
    y += lines.length * 4.5 + 1;
  });

  // Performance
  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Performance em Licitacoes", 14, y);
  y += 7;
  doc.setFontSize(9);

  const perf = [
    ["Score de Confiabilidade", `${empresa.nota_score}/100`],
    ["Licitacoes Participadas", String(empresa.licitacoes_participadas)],
    ["Licitacoes Vencidas", String(empresa.licitacoes_vencidas)],
    ["Taxa de Vitoria", `${empresa.taxa_vitoria}%`],
    ["Volume Total de Contratos", empresa.volume_total_fmt],
  ];

  perf.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 6;
  });

  // Projetos
  if (projetosEmpresa.length > 0) {
    doc.addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Projetos Vinculados (${projetosEmpresa.length})`, 14, 14);

    const headers = [["Projeto", "Local", "Categoria", "Status", "Execucao", "Valor"]];
    const rows = projetosEmpresa.map((p) => [
      p.titulo.slice(0, 50) + (p.titulo.length > 50 ? "..." : ""),
      `${p.cidade}/${p.estado}`,
      p.categoria,
      p.status,
      `${p.percentual_execucao}%`,
      p.valor_contrato_fmt,
    ]);

    autoTable(doc, {
      startY: 24,
      head: headers,
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 22 },
        4: { cellWidth: 18, halign: "center" as const },
        5: { cellWidth: 28, halign: "right" as const },
      },
      margin: { left: 10, right: 10 },
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Hub ConstruData — Dossie ${empresa.nome_fantasia} — Pagina ${i}/${totalPages}`,
      210 / 2, 290, { align: "center" }
    );
  }

  doc.save(`dossie-${empresa.nome_fantasia.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

// ── Dossiê de Projeto — PDF ──

export async function exportarDossieProjetoPDF(
  projeto: Projeto,
  empresaResp?: Empresa | null
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  function fmtData(d: string) {
    if (!d) return "--";
    const [a, m, dia] = d.split("-");
    return `${dia}/${m}/${a}`;
  }

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Hub ConstruData — Dossie de Projeto", 14, 12);
  doc.setFontSize(10);
  const tituloLines = doc.splitTextToSize(projeto.titulo, 180);
  doc.text(tituloLines, 14, 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
    210 - 14, 28, { align: "right" }
  );

  doc.setTextColor(0);
  let y = 40;

  // Dados do contrato
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dados do Contrato", 14, y);
  y += 7;
  doc.setFontSize(9);

  const dados = [
    ["Orgao Contratante", projeto.orgao_contratante],
    ["Local", `${projeto.cidade}/${projeto.estado}`],
    ["Categoria", projeto.categoria],
    ["Valor do Contrato", projeto.valor_contrato_fmt],
    ["Status", projeto.status],
    ["Execucao", `${projeto.percentual_execucao}%`],
    ["Data Inicio", fmtData(projeto.data_inicio)],
    ["Previsao Termino", fmtData(projeto.data_previsao_termino)],
    ["Empresa Responsavel", projeto.empresa_responsavel_nome],
  ];

  dados.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, 130);
    doc.text(lines, 65, y);
    y += lines.length * 4.5 + 1;
  });

  // Descrição
  y += 4;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Descricao", 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(projeto.descricao, 182);
  doc.text(descLines, 14, y);
  y += descLines.length * 4.5 + 5;

  // Participantes
  if (projeto.participantes.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Participantes", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Empresa", "CNPJ", "Papel"]],
      body: projeto.participantes.map((p) => [p.nome, p.cnpj, p.papel]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Timeline de marcos
  if (projeto.marcos.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Timeline de Marcos", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Data", "Marco", "Status"]],
      body: projeto.marcos.map((m) => [
        fmtData(m.data),
        m.descricao,
        m.status === "concluido" ? "Concluido" : m.status === "em_andamento" ? "Em Andamento" : "Pendente",
      ]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 25 }, 2: { cellWidth: 25 } },
      margin: { left: 14, right: 14 },
    });
  }

  // Empresa responsável
  if (empresaResp) {
    doc.addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Empresa Responsavel — Resumo", 14, 12);

    doc.setTextColor(0);
    y = 26;
    doc.setFontSize(9);

    const empDados = [
      ["Nome Fantasia", empresaResp.nome_fantasia],
      ["CNPJ", empresaResp.cnpj],
      ["Sede", `${empresaResp.cidade_sede}/${empresaResp.estado_sede}`],
      ["Score", `${empresaResp.nota_score}/100`],
      ["Taxa de Vitoria", `${empresaResp.taxa_vitoria}%`],
      ["Volume Total", empresaResp.volume_total_fmt],
      ["Segmentos", empresaResp.segmentos.join(", ")],
    ];

    empDados.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 60, y);
      y += 6;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Hub ConstruData — Dossie Projeto — Pagina ${i}/${totalPages}`,
      210 / 2, 290, { align: "center" }
    );
  }

  doc.save(`dossie-projeto-${projeto.id}.pdf`);
}

// ── Relatório de Portfolio (todas empresas + projetos) — PDF ──

export async function exportarPortfolioPDF(
  listaEmpresas: Empresa[],
  listaProjetos: Projeto[]
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
  doc.text("Hub ConstruData — Relatorio de Portfolio", 14, 12);
  doc.setFontSize(10);
  doc.text(`${listaEmpresas.length} empresas | ${listaProjetos.length} projetos`, 14, 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
    297 - 14, 20, { align: "right" }
  );

  // Tabela de empresas
  autoTable(doc, {
    startY: 32,
    head: [["Empresa", "CNPJ", "Sede", "Porte", "Score", "Partic.", "Vit.", "Taxa", "Volume"]],
    body: listaEmpresas.map((e) => [
      e.nome_fantasia,
      e.cnpj,
      `${e.cidade_sede}/${e.estado_sede}`,
      e.porte,
      String(e.nota_score),
      String(e.licitacoes_participadas),
      String(e.licitacoes_vencidas),
      `${e.taxa_vitoria}%`,
      e.volume_total_fmt,
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 7, fontStyle: "bold" },
    bodyStyles: { fontSize: 7, cellPadding: 1.5 },
    margin: { left: 8, right: 8 },
  });

  // Página de projetos
  doc.addPage();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Projetos (${listaProjetos.length})`, 14, 14);

  autoTable(doc, {
    startY: 24,
    head: [["Projeto", "Empresa", "Local", "Categoria", "Status", "Exec.", "Valor"]],
    body: listaProjetos.map((p) => [
      p.titulo.slice(0, 55) + (p.titulo.length > 55 ? "..." : ""),
      p.empresa_responsavel_nome,
      `${p.cidade}/${p.estado}`,
      p.categoria,
      p.status,
      `${p.percentual_execucao}%`,
      p.valor_contrato_fmt,
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 7, fontStyle: "bold" },
    bodyStyles: { fontSize: 7, cellPadding: 1.5 },
    margin: { left: 8, right: 8 },
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Hub ConstruData — Portfolio — Pagina ${i}/${totalPages}`, 297 / 2, 204, { align: "center" });
  }

  doc.save("portfolio-construdata.pdf");
}
