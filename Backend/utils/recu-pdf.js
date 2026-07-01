import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const PRIMARY = "#a42223";
const TEXT = "#111111";
const MUTED = "#666666";
const BORDER = "#e5e7eb";

// Génère un reçu de paiement PDF et résout quand le fichier est écrit.
export const generateRecuPDF = ({ event, inscription }) =>
  new Promise((resolve, reject) => {
    try {
      const dir = path.join(process.cwd(), "uploads/recus");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const fileName = `recu-${inscription.idInscription}-${event.slug}.pdf`;
      const filePath = path.join(dir, fileName);

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const logo = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logo)) doc.image(logo, 50, 45, { width: 48 });
      doc.fontSize(18).fillColor(PRIMARY).text("BURNING HEART", 110, 50);
      doc
        .fontSize(10)
        .fillColor(MUTED)
        .text("Pèlerins avec le Christ", 110, 72);

      doc.fontSize(20).fillColor(TEXT).text("Reçu de paiement", 50, 120);
      doc
        .moveTo(50, 150)
        .lineTo(545, 150)
        .lineWidth(1)
        .strokeColor(BORDER)
        .stroke();

      const rows = [
        ["Reçu N°", `REC-${inscription.idInscription}`],
        ["Date", new Date().toLocaleDateString("fr-FR")],
        ["Payeur", inscription.nomComplet],
        ["Email", inscription.email],
        ["Événement", event.titre],
        [
          "Date événement",
          new Date(event.dateEvenement).toLocaleDateString("fr-FR"),
        ],
        [
          "Statut",
          inscription.statutPaiement === "partiel"
            ? "Partiellement payé"
            : "Payé",
        ],
        ["Montant reçu", `${inscription.montantPaye} ${event.devise}`],
      ];

      let y = 175;
      rows.forEach(([k, v]) => {
        doc.fontSize(11).fillColor(MUTED).text(k, 50, y);
        doc.fontSize(11).fillColor(TEXT).text(String(v), 220, y);
        y += 24;
      });

      doc
        .moveTo(50, y + 10)
        .lineTo(545, y + 10)
        .strokeColor(BORDER)
        .stroke();
      doc
        .fontSize(9)
        .fillColor(MUTED)
        .text("Merci pour votre confiance — Burning Heart IHS", 50, y + 25);

      doc.end();
      stream.on("finish", () =>
        resolve({ fileName, filePath, url: `/uploads/recus/${fileName}` }),
      );
      stream.on("error", reject);
    } catch (e) {
      reject(e);
    }
  });
