const currentYear = new Date().getFullYear();

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const wrapper = (titre, innerRows) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 1rem;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.06); font-family: Arial, sans-serif;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <img src="https://burningheart.netlify.app/img/NavLogo.png" alt="Logo" style="max-width: 100%; width: auto; height: 5rem;">
            </td>
          </tr>
          <tr>
            <td align="center" style="color: #a42223; font-size: 22px; font-weight: bold; padding-bottom: 16px;">
              ${escapeHtml(titre)}
            </td>
          </tr>
          ${innerRows}
          <tr>
            <td align="center" style="color: #999999; font-size: 12px; padding-top: 20px;">
              &copy; ${currentYear} BurningHeart – Tous droits réservés
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

// Confirmation de demande de RDV (après réservation).
export const rdvConfirmationTemplate = (nom, date, heure, coordinateurNom) =>
  wrapper(
    "Demande de rendez-vous reçue",
    `
      <tr><td style="color:#333333;font-size:16px;padding-bottom:16px;">Bonjour ${escapeHtml(nom)},</td></tr>
      <tr><td style="color:#555555;font-size:15px;line-height:1.6;padding-bottom:16px;">Votre demande de rendez-vous avec <strong>${escapeHtml(coordinateurNom)}</strong> a bien été enregistrée pour le <strong>${escapeHtml(date)}</strong> à <strong>${escapeHtml(heure)}</strong>.</td></tr>
      <tr><td style="color:#555555;font-size:15px;padding-bottom:24px;">Elle est en <strong>attente de confirmation</strong>. Vous recevrez un email dès qu'elle sera approuvée, refusée ou reprogrammée.</td></tr>
      <tr><td style="color:#555555;font-size:15px;">Cordialement,<br>L'équipe BurningHeart</td></tr>
    `,
  );

const STATUT_LABEL = {
  approuve: "approuvé",
  refuse: "refusé",
  reprogramme: "reprogrammé",
  en_attente: "en attente",
};

// Notification de changement de statut du RDV.
export const rdvStatutTemplate = (
  nom,
  statut,
  date,
  heure,
  note,
  coordinateurNom,
) => {
  const label = STATUT_LABEL[statut] || statut;
  const intro =
    statut === "approuve"
      ? `Bonne nouvelle ! Votre rendez-vous avec ${coordinateurNom} est <strong>confirmé</strong>.`
      : statut === "refuse"
        ? `Nous sommes désolés : votre rendez-vous avec ${coordinateurNom} a été <strong>refusé</strong>.`
        : statut === "reprogramme"
          ? `Votre rendez-vous avec ${coordinateurNom} a été <strong>reprogrammé</strong>.`
          : `Le statut de votre rendez-vous est : <strong>${label}</strong>.`;

  return wrapper(
    `Rendez-vous ${label}`,
    `
      <tr><td style="color:#333333;font-size:16px;padding-bottom:16px;">Bonjour ${escapeHtml(nom)},</td></tr>
      <tr><td style="color:#555555;font-size:15px;line-height:1.6;padding-bottom:16px;">${intro}</td></tr>
      <tr><td style="color:#555555;font-size:15px;padding-bottom:8px;">Date : <strong>${escapeHtml(date)}</strong></td></tr>
      <tr><td style="color:#555555;font-size:15px;padding-bottom:16px;">Heure : <strong>${escapeHtml(heure)}</strong></td></tr>
      ${note ? `<tr><td style="color:#555555;font-size:15px;padding-bottom:16px;">Note : <em>${escapeHtml(note)}</em></td></tr>` : ""}
      <tr><td style="color:#555555;font-size:15px;">Cordialement,<br>L'équipe BurningHeart</td></tr>
    `,
  );
};
