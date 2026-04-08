import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateIdentityPDF = async ({ ficheIdentite }) => {
  const dir = path.join(process.cwd(), "uploads/identites");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const nomComplet =
    `${ficheIdentite.nom} ${ficheIdentite.postnom} ${ficheIdentite.prenom}`.trim();
  const fileName = `identite-${nomComplet.replace(/\s+/g, "-")}-${ficheIdentite.idFicheIdentite}.pdf`;
  const filePath = path.join(dir, fileName);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  const PRIMARY = "#a42223";
  const TEXT = "#111111";
  const MUTED = "#666666";
  const BORDER = "#e5e7eb";
  const BG_LIGHT = "#f9fafb";

  // Header
  doc.image("public/logo.png", 40, 30, { width: 60 });
  doc.fontSize(18).fillColor(PRIMARY).text("BURNING HEART", 110, 35);
  doc.fontSize(11).fillColor(MUTED).text("Pèlerins avec le Christ", 110, 58);

  // Titre
  doc
    .fontSize(16)
    .fillColor(TEXT)
    .text("FICHE D'IDENTITÉ", 40, 90)
    .fontSize(10)
    .fillColor(MUTED)
    .text(
      `Soumise le ${new Date(ficheIdentite.dateSoumission).toLocaleDateString("fr-FR")}`,
      40,
      110,
    );

  let yPosition = 140;

  // Section 1: Informations Personnelles
  doc
    .fontSize(12)
    .fillColor(PRIMARY)
    .text("📋 INFORMATIONS PERSONNELLES", 40, yPosition);
  yPosition += 25;

  const personalInfo = [
    ["Nom Complet", nomComplet],
    ["Type de Pièce", ficheIdentite.pieceType],
    ["Numéro de Pièce", ficheIdentite.pieceNumero],
    [
      "Date de Naissance",
      new Date(ficheIdentite.naissance).toLocaleDateString("fr-FR"),
    ],
    ["Sexe", ficheIdentite.sexe],
    ["État Civil", ficheIdentite.etatCivil],
    ["Adresse", ficheIdentite.adresse],
    ["Paroisse", ficheIdentite.paroisse],
  ];

  personalInfo.forEach(([label, value]) => {
    doc
      .fontSize(10)
      .fillColor(MUTED)
      .text(label + ":", 40, yPosition);
    doc
      .fontSize(10)
      .fillColor(TEXT)
      .text(value || "N/A", 200, yPosition);
    yPosition += 18;
  });

  // Section 2: Contacts
  doc
    .fontSize(12)
    .fillColor(PRIMARY)
    .text("📞 INFORMATIONS DE CONTACT", 40, yPosition);
  yPosition += 25;

  const contactInfo = [
    ["Téléphone", ficheIdentite.tel],
    ["Email", ficheIdentite.email],
  ];

  contactInfo.forEach(([label, value]) => {
    doc
      .fontSize(10)
      .fillColor(MUTED)
      .text(label + ":", 40, yPosition);
    doc
      .fontSize(10)
      .fillColor(TEXT)
      .text(value || "N/A", 200, yPosition);
    yPosition += 18;
  });

  // Section 3: Contact d'Urgence
  doc
    .fontSize(12)
    .fillColor(PRIMARY)
    .text("🆘 CONTACT D'URGENCE", 40, yPosition);
  yPosition += 25;

  const emergencyInfo = [
    ["Nom", ficheIdentite.urgenceNom],
    ["Lien avec le Demandeur", ficheIdentite.urgenceLien],
    ["Téléphone Principal", ficheIdentite.urgenceTelPrincipal],
    ["Téléphone Secondaire", ficheIdentite.urgenceTelSecondaire || "N/A"],
    ["Email", ficheIdentite.urgenceEmail],
  ];

  emergencyInfo.forEach(([label, value]) => {
    doc
      .fontSize(10)
      .fillColor(MUTED)
      .text(label + ":", 40, yPosition);
    doc
      .fontSize(10)
      .fillColor(TEXT)
      .text(value || "N/A", 200, yPosition);
    yPosition += 18;
  });

  // Section 4: Informations Médicales
  yPosition += 10;
  doc
    .fontSize(12)
    .fillColor(PRIMARY)
    .text("⚕️ INFORMATIONS MÉDICALES", 40, yPosition);
  yPosition += 25;

  const medicalSections = [
    {
      label: "Allergies",
      has: ficheIdentite.allergiesHas,
      details: ficheIdentite.allergiesDetails,
    },
    {
      label: "Traitement",
      has: ficheIdentite.traitementHas,
      details: ficheIdentite.traitementDetails,
    },
    {
      label: "Maladie",
      has: ficheIdentite.maladieHas,
      details: ficheIdentite.maladieDetails,
    },
    {
      label: "Régime Alimentaire",
      has: ficheIdentite.regimeHas,
      details: ficheIdentite.regimeDetails,
    },
  ];

  medicalSections.forEach(({ label, has, details }) => {
    doc
      .fontSize(10)
      .fillColor(MUTED)
      .text(label + ":", 40, yPosition);

    if (has) {
      doc.fontSize(10).fillColor(PRIMARY).text("✓ OUI", 200, yPosition);
      yPosition += 15;

      if (details) {
        doc
          .fontSize(9)
          .fillColor(TEXT)
          .text(details, 60, yPosition, { width: 450 });
        yPosition += Math.ceil(details.length / 80) * 12 + 5;
      }
    } else {
      doc.fontSize(10).fillColor(MUTED).text("✗ NON", 200, yPosition);
      yPosition += 15;
    }
  });

  // Autres informations
  if (ficheIdentite.autres) {
    doc
      .fontSize(10)
      .fillColor(MUTED)
      .text("Autres Informations:", 40, yPosition);
    yPosition += 15;
    doc
      .fontSize(9)
      .fillColor(TEXT)
      .text(ficheIdentite.autres, 60, yPosition, { width: 450 });
    yPosition += Math.ceil(ficheIdentite.autres.length / 80) * 12 + 10;
  }

  // Footer
  doc
    .fontSize(9)
    .fillColor(MUTED)
    .text(
      "© BurningHeart IHS – Tous droits réservés",
      40,
      doc.page.height - 40,
      {
        align: "center",
      },
    );

  doc.end();

  return {
    fileName,
    filePath,
    url: `/uploads/identites/${fileName}`,
  };
};
