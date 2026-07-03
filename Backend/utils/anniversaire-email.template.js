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

// Alerte du jour J — envoyée à tous les abonnés newsletter.
export const birthdayAlertTemplate = (nom) =>
  wrapper(
    "Joyeux anniversaire ! 🎂",
    `
      <tr><td style="color:#555555;font-size:16px;line-height:1.6;padding-bottom:16px;">Aujourd'hui, la communauté Burning Heart célèbre l'anniversaire de <strong>${escapeHtml(nom)}</strong>.</td></tr>
      <tr><td style="color:#555555;font-size:15px;padding-bottom:24px;">Joignez-vous à nous pour lui souhaiter une belle journée et de nombreuses bénédictions. 🙏</td></tr>
      <tr><td style="color:#555555;font-size:15px;">Avec toute notre affection,<br>L'équipe BurningHeart</td></tr>
    `,
  );

// Rappel en amont — envoyé aux admins / équipe interne.
export const birthdayReminderTemplate = (nom, dateStr, joursRestants) =>
  wrapper(
    "Rappel d'anniversaire à venir",
    `
      <tr><td style="color:#555555;font-size:16px;line-height:1.6;padding-bottom:16px;">L'anniversaire de <strong>${escapeHtml(nom)}</strong> approche : <strong>${escapeHtml(dateStr)}</strong> (dans ${joursRestants} jour${joursRestants > 1 ? "s" : ""}).</td></tr>
      <tr><td style="color:#555555;font-size:15px;padding-bottom:24px;">Pensez à préparer un message ou une attention. 🎁</td></tr>
      <tr><td style="color:#555555;font-size:15px;">L'équipe BurningHeart</td></tr>
    `,
  );
