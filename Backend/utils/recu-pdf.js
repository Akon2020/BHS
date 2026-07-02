import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const PRIMARY = "#a42223";
const TEXT = "#111111";
const MUTED = "#666666";
const BORDER = "#e5e7eb";
const LIGHT = "#faf5f5";

// Génère un reçu de paiement PDF stylisé (avec QR de vérification).
export const generateRecuPDF = async ({ event, inscription }) => {
  const dir = path.join(process.cwd(), "uploads/recus");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `recu-${inscription.idInscription}-${event.slug}.pdf`;
  const filePath = path.join(dir, fileName);

  // Contenu de vérification encodé dans le QR (auto-porteur).
  const verifData = [
    "BHS-RECU",
    `REC-${inscription.idInscription}`,
    event.slug,
    inscription.email,
    `${inscription.montantPaye} ${event.devise}`,
    new Date().toISOString().slice(0, 10),
  ].join("|");

  const qrDataUrl = await QRCode.toDataURL(verifData, { margin: 1, width: 220 });
  const qrBuffer = Buffer.from(
    qrDataUrl.replace(/^data:image\/png;base64,/, ""),
    "base64",
  );

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // En-tête
      const logo = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logo)) doc.image(logo, 50, 45, { width: 46 });
      doc.fontSize(18).fillColor(PRIMARY).text("BURNING HEART", 108, 50);
      doc.fontSize(10).fillColor(MUTED).text("Pèlerins avec le Christ", 108, 72);

      doc
        .fontSize(11)
        .fillColor(MUTED)
        .text(`REC-${inscription.idInscription}`, 400, 52, {
          width: 145,
          align: "right",
        })
        .text(new Date().toLocaleDateString("fr-FR"), 400, 70, {
          width: 145,
          align: "right",
        });

      doc.fontSize(22).fillColor(TEXT).text("Reçu de paiement", 50, 120);

      // Bandeau statut
      const estPartiel = inscription.statutPaiement === "partiel";
      doc
        .roundedRect(50, 150, 495, 30, 6)
        .fillColor(estPartiel ? "#b45309" : "#15803d")
        .fill();
      doc
        .fontSize(12)
        .fillColor("#ffffff")
        .text(
          estPartiel ? "PAIEMENT PARTIEL" : "PAIEMENT CONFIRMÉ",
          60,
          159,
        );

      // Carte détails
      const boxTop = 200;
      doc.roundedRect(50, boxTop, 340, 210, 8).fillColor(LIGHT).fill();

      const rows = [
        ["Payeur", inscription.nomComplet],
        ["Email", inscription.email],
        ["Événement", event.titre],
        [
          "Date événement",
          new Date(event.dateEvenement).toLocaleDateString("fr-FR"),
        ],
        ["Lieu", event.lieu || "—"],
        [
          "Statut",
          estPartiel ? "Partiellement payé" : "Payé",
        ],
        ["Montant reçu", `${inscription.montantPaye} ${event.devise}`],
      ];

      let y = boxTop + 18;
      rows.forEach(([k, v]) => {
        doc.fontSize(10).fillColor(MUTED).text(k, 66, y);
        doc
          .fontSize(11)
          .fillColor(TEXT)
          .text(String(v), 66, y + 12, { width: 310 });
        y += 27;
      });

      // QR de vérification (à droite)
      doc.roundedRect(410, boxTop, 135, 165, 8).strokeColor(BORDER).stroke();
      doc.image(qrBuffer, 428, boxTop + 15, { width: 100 });
      doc
        .fontSize(8)
        .fillColor(MUTED)
        .text("Scannez pour vérifier", 410, boxTop + 128, {
          width: 135,
          align: "center",
        });
      doc
        .fontSize(7)
        .fillColor(MUTED)
        .text(`REC-${inscription.idInscription}`, 410, boxTop + 145, {
          width: 135,
          align: "center",
        });

      // Pied de page
      doc
        .moveTo(50, 440)
        .lineTo(545, 440)
        .strokeColor(BORDER)
        .stroke();
      doc
        .fontSize(9)
        .fillColor(MUTED)
        .text(
          "Merci pour votre confiance — Burning Heart IHS · Pèlerins avec le Christ",
          50,
          452,
        );

      doc.end();
      stream.on("finish", () =>
        resolve({ fileName, filePath, url: `/uploads/recus/${fileName}` }),
      );
      stream.on("error", reject);
    } catch (e) {
      reject(e);
    }
  });
};
