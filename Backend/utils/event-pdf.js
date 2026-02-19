import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export const generateEventTicketPDF = async ({ event, inscription }) => {
  const dir = path.join(process.cwd(), "uploads/tickets");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `ticket-${inscription.nomComplet}-${event.slug}-${inscription.idInscription}.pdf`;
  const filePath = path.join(dir, fileName);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  const PRIMARY = "#a42223";
  const TEXT = "#111111";
  const MUTED = "#666666";
  const BORDER = "#e5e7eb";

  const qrData = await QRCode.toDataURL(
    `https://burningheartihs.org/events/${event.slug}`,
  );
  const qrBase64 = qrData.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrBase64, "base64");

  doc.roundedRect(40, 80, 515, 230, 12).lineWidth(1).stroke(BORDER);

  doc.image("public/logo.png", 60, 95, { width: 60 });

  doc.fontSize(18).fillColor(PRIMARY).text("BURNING HEART", 130, 95);

  doc.fontSize(12).fillColor(MUTED).text("Pèlerins avec le Christ", 130, 120);

  doc.fontSize(16).fillColor(TEXT).text(event.titre, 60, 150, { width: 300 });

  doc
    .fontSize(11)
    .fillColor(MUTED)
    .text(`Date : ${event.dateEvenement}`, 60, 180)
    .text(`Heure : ${event.heureDebut} - ${event.heureFin}`, 60, 200)
    .text(`Lieu : ${event.lieu}`, 60, 220);

  doc
    .fontSize(11)
    .fillColor(TEXT)
    .text("INSCRIT À :", 60, 255)
    .fontSize(12)
    .text(inscription.nomComplet, 60, 275)
    .fillColor(MUTED)
    .fontSize(10)
    .text(inscription.email, 60, 292);

  doc.roundedRect(410, 115, 110, 110, 8).stroke(BORDER);

  doc.image(qrBuffer, 420, 125, { width: 90 });

  doc
    .fontSize(9)
    .fillColor(MUTED)
    .text("Scanne pour voir l'événement", 395, 235, {
      width: 150,
      align: "center",
    });

  doc
    .fontSize(9)
    .fillColor(MUTED)
    .text("Présente ce billet (PDF ou imprimé) à l’entrée.", 40, 330, {
      align: "center",
    })
    .text("© BurningHeart IHS – Tous droits réservés", 40, 350, {
      align: "center",
    });

  doc.end();

  return {
    fileName,
    filePath,
    url: `/uploads/tickets/${fileName}`,
  };
};
