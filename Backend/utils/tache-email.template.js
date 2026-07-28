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

// Rappel de tâche — envoyé aux personnes assignées (et au créateur).
export const taskReminderTemplate = ({ titre, description, echeanceStr, joursRestants }) => {
  const echeanceLigne =
    joursRestants > 0
      ? `L'échéance approche : <strong>${escapeHtml(echeanceStr)}</strong> (dans ${joursRestants} jour${joursRestants > 1 ? "s" : ""}).`
      : `La tâche est <strong>à échéance aujourd'hui</strong> (${escapeHtml(echeanceStr)}).`;

  return wrapper(
    "Rappel de tâche",
    `
      <tr><td style="color:#333333;font-size:18px;font-weight:bold;padding-bottom:8px;">${escapeHtml(titre)}</td></tr>
      <tr><td style="color:#555555;font-size:16px;line-height:1.6;padding-bottom:16px;">${echeanceLigne}</td></tr>
      ${
        description
          ? `<tr><td style="color:#555555;font-size:15px;line-height:1.6;padding-bottom:24px;border-left:3px solid #a42223;padding-left:12px;">${escapeHtml(description)}</td></tr>`
          : ""
      }
      <tr><td style="color:#555555;font-size:15px;">Pensez à faire le nécessaire. 🙏<br>L'équipe BurningHeart</td></tr>
    `,
  );
};
