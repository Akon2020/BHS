import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const PRIMARY = "#a42223";
const TEXT = "#111111";
const MUTED = "#666666";
const BORDER = "#e5e7eb";
const LIGHT = "#f7f7f7";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

const drawHeader = (doc, { titre, periodeLabel, generatedAt }) => {
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, 40, 40, { width: 48 });
  }
  doc.fontSize(18).fillColor(PRIMARY).text("BURNING HEART", 100, 44);
  doc.fontSize(10).fillColor(MUTED).text("Pèlerins avec le Christ", 100, 66);

  doc.fontSize(15).fillColor(TEXT).text(titre, 40, 100);
  doc
    .fontSize(10)
    .fillColor(MUTED)
    .text(periodeLabel, 40, 122)
    .text(`Généré le ${generatedAt}`, 40, 136);

  doc
    .moveTo(40, 156)
    .lineTo(555, 156)
    .lineWidth(1)
    .strokeColor(BORDER)
    .stroke();

  return 170;
};

const drawSummary = (doc, y, cards) => {
  const width = 515 / cards.length;
  cards.forEach((card, i) => {
    const x = 40 + i * width;
    doc.roundedRect(x + 4, y, width - 8, 56, 6).fillColor(LIGHT).fill();
    doc
      .fontSize(9)
      .fillColor(MUTED)
      .text(card.label, x + 14, y + 10, { width: width - 24 });
    doc
      .fontSize(16)
      .fillColor(PRIMARY)
      .text(String(card.value), x + 14, y + 26, { width: width - 24 });
  });
  return y + 80;
};

const drawTable = (doc, startY, columns, rows) => {
  let y = startY;
  const left = 40;
  const totalWidth = 515;

  const drawRow = (cells, { header = false, zebra = false } = {}) => {
    const rowHeight = 22;
    if (zebra) {
      doc.rect(left, y, totalWidth, rowHeight).fillColor(LIGHT).fill();
    }
    if (header) {
      doc.rect(left, y, totalWidth, rowHeight).fillColor(PRIMARY).fill();
    }
    let x = left;
    columns.forEach((col, i) => {
      doc
        .fontSize(9)
        .fillColor(header ? "#ffffff" : TEXT)
        .text(String(cells[i] ?? ""), x + 6, y + 7, {
          width: col.width - 12,
          ellipsis: true,
          lineBreak: false,
        });
      x += col.width;
    });
    y += rowHeight;
  };

  drawRow(
    columns.map((c) => c.label),
    { header: true },
  );

  rows.forEach((row, idx) => {
    if (y > 770) {
      doc.addPage();
      y = 50;
      drawRow(
        columns.map((c) => c.label),
        { header: true },
      );
    }
    drawRow(
      columns.map((c) => row[c.key]),
      { zebra: idx % 2 === 1 },
    );
  });

  doc
    .moveTo(left, y)
    .lineTo(left + totalWidth, y)
    .lineWidth(1)
    .strokeColor(BORDER)
    .stroke();

  return y + 10;
};

/**
 * Génère le PDF de pointage et le pipe dans `stream` (ex. la réponse HTTP).
 */
export const generatePointagePdf = (stream, data) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(stream);

  let y = drawHeader(doc, {
    titre:
      data.scope === "individuel"
        ? `Pointage — ${data.profil?.nomComplet || ""}`
        : "Pointage — Récapitulatif global",
    periodeLabel: data.periodeLabel,
    generatedAt: data.generatedAt,
  });

  if (data.scope === "individuel") {
    if (data.profil?.fonction) {
      doc.fontSize(10).fillColor(MUTED).text(data.profil.fonction, 40, y);
      y += 18;
    }
    y = drawSummary(doc, y, [
      { label: "Présences", value: data.summary.presences },
      { label: "Temps cumulé", value: data.summary.tempsCumule },
    ]);

    y = drawTable(
      doc,
      y,
      [
        { key: "date", label: "Date", width: 90 },
        { key: "heureDebut", label: "Début", width: 70 },
        { key: "heureFin", label: "Fin", width: 70 },
        { key: "duree", label: "Durée", width: 75 },
        { key: "note", label: "Note", width: 210 },
      ],
      data.sessions,
    );
  } else {
    y = drawSummary(doc, y, [
      { label: "Profils actifs", value: data.summary.profilsActifs },
      { label: "Présences", value: data.summary.presences },
      { label: "Temps cumulé", value: data.summary.tempsCumule },
    ]);

    y = drawTable(
      doc,
      y,
      [
        { key: "nomComplet", label: "Profil", width: 180 },
        { key: "fonction", label: "Fonction", width: 150 },
        { key: "presences", label: "Présences", width: 85 },
        { key: "temps", label: "Temps cumulé", width: 100 },
      ],
      data.recap,
    );
  }

  doc.end();
  return doc;
};
