import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const PRIMARY = "#a42223";
const TEXT = "#111111";
const MUTED = "#666666";
const BORDER = "#e5e7eb";
const LIGHT = "#faf5f5";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

const STATUT_LABEL = {
  non_paye: "Non payé",
  partiel: "Partiel",
  paye: "Payé",
  accepte_non_paye: "Accepté non payé",
};

const drawHeader = (doc, { event, generatedAt }) => {
  if (fs.existsSync(LOGO_PATH)) doc.image(LOGO_PATH, 40, 40, { width: 46 });
  doc.fontSize(18).fillColor(PRIMARY).text("BURNING HEART", 98, 46);
  doc.fontSize(10).fillColor(MUTED).text("Pèlerins avec le Christ", 98, 68);

  doc.fontSize(16).fillColor(TEXT).text("Rapport financier", 40, 100);
  doc.fontSize(12).fillColor(TEXT).text(event.titre, 40, 122, { width: 515 });

  doc
    .fontSize(9)
    .fillColor(MUTED)
    .text(
      `Événement du ${new Date(event.dateEvenement).toLocaleDateString(
        "fr-FR",
      )} · ${event.lieu || "—"}`,
      40,
      142,
    )
    .text(
      `Tarif : ${event.montant} ${event.devise} · Généré le ${generatedAt}`,
      40,
      156,
    );

  doc
    .moveTo(40, 176)
    .lineTo(555, 176)
    .lineWidth(1)
    .strokeColor(BORDER)
    .stroke();

  return 190;
};

const drawSummary = (doc, y, cards) => {
  const width = 515 / cards.length;
  cards.forEach((card, i) => {
    const x = 40 + i * width;
    doc.roundedRect(x + 4, y, width - 8, 58, 6).fillColor(LIGHT).fill();
    doc
      .fontSize(9)
      .fillColor(MUTED)
      .text(card.label, x + 14, y + 10, { width: width - 24 });
    doc
      .fontSize(15)
      .fillColor(PRIMARY)
      .text(String(card.value), x + 14, y + 28, { width: width - 24 });
  });
  return y + 82;
};

const drawTable = (doc, startY, columns, rows) => {
  let y = startY;
  const left = 40;
  const totalWidth = 515;
  const rowHeight = 22;

  const drawRow = (cells, { header = false, zebra = false } = {}) => {
    if (zebra) doc.rect(left, y, totalWidth, rowHeight).fillColor(LIGHT).fill();
    if (header) doc.rect(left, y, totalWidth, rowHeight).fillColor(PRIMARY).fill();
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
    .strokeColor(BORDER)
    .stroke();

  return y + 10;
};

/**
 * Génère le rapport financier d'un événement et le pipe dans `stream`.
 * data = { event, finances, inscriptions, generatedAt }
 */
export const generateEventFinancesPdf = (stream, data) => {
  const { event, finances, inscriptions, generatedAt } = data;
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(stream);

  let y = drawHeader(doc, { event, generatedAt });

  y = drawSummary(doc, y, [
    { label: "Attendu", value: `${finances.attendu} ${event.devise}` },
    { label: "Encaissé", value: `${finances.encaisse} ${event.devise}` },
    { label: "Reste", value: `${finances.reste} ${event.devise}` },
    { label: "Inscrits", value: finances.nbInscrits },
  ]);

  // Répartition par statut
  doc
    .fontSize(10)
    .fillColor(MUTED)
    .text(
      `Payé : ${finances.parStatut.paye}   ·   Partiel : ${finances.parStatut.partiel}   ·   Non payé : ${finances.parStatut.non_paye}   ·   Accepté non payé : ${finances.parStatut.accepte_non_paye}`,
      40,
      y,
    );
  y += 24;

  y = drawTable(
    doc,
    y,
    [
      { key: "nom", label: "Nom", width: 120 },
      { key: "email", label: "Email", width: 150 },
      { key: "telephone", label: "Téléphone", width: 80 },
      { key: "statut", label: "Statut", width: 95 },
      { key: "montant", label: "Montant", width: 70 },
    ],
    inscriptions.map((i) => ({
      nom: i.nomComplet,
      email: i.email,
      telephone: i.telephone || "—",
      statut: STATUT_LABEL[i.statutPaiement] || i.statutPaiement,
      montant: `${i.montantPaye || 0} ${event.devise}`,
    })),
  );

  doc
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      "Burning Heart IHS · Pèlerins avec le Christ — Rapport financier confidentiel",
      40,
      y + 6,
    );

  doc.end();
  return doc;
};
