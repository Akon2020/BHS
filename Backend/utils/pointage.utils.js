// Fuseau de référence : Africa/Lubumbashi (UTC+2).
const TZ_OFFSET_MINUTES = 2 * 60;

const nowInTz = (anchorISO) => {
  const base = anchorISO ? new Date(anchorISO) : new Date();
  return new Date(base.getTime() + TZ_OFFSET_MINUTES * 60 * 1000);
};

const pad = (n) => String(n).padStart(2, "0");

const toISODate = (d) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/**
 * Date + heure courantes dans le fuseau de référence (UTC+2).
 * @returns {{ date: string, heure: string }} date `YYYY-MM-DD`, heure `HH:MM:SS`
 */
export const nowTzDateTime = (anchorISO) => {
  const d = nowInTz(anchorISO);
  return {
    date: toISODate(d),
    heure: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`,
  };
};

/**
 * Calcule les bornes de date (YYYY-MM-DD) pour une période.
 * @param {"hebdo"|"mensuel"|"annuel"} periode
 * @param {string} [anchorISO] date d'ancrage (défaut : maintenant en UTC+2)
 */
export const getPeriodeRange = (periode = "mensuel", anchorISO) => {
  const ref = nowInTz(anchorISO);
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  const d = ref.getUTCDate();

  if (periode === "hebdo") {
    const day = ref.getUTCDay(); // 0 = dimanche … 6 = samedi
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(Date.UTC(y, m, d - diffToMonday));
    const sunday = new Date(Date.UTC(y, m, d - diffToMonday + 6));
    return { start: toISODate(monday), end: toISODate(sunday), periode };
  }

  if (periode === "annuel") {
    return { start: `${y}-01-01`, end: `${y}-12-31`, periode };
  }

  // mensuel (défaut)
  const first = new Date(Date.UTC(y, m, 1));
  const last = new Date(Date.UTC(y, m + 1, 0));
  return { start: toISODate(first), end: toISODate(last), periode };
};

export const formatDuree = (minutes) => {
  if (!minutes || minutes <= 0) return "0h00";
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${h}h${pad(min)}`;
};

const PERIODE_LABELS = {
  hebdo: "Hebdomadaire",
  mensuel: "Mensuel",
  annuel: "Annuel",
};

export const formatPeriodeLabel = ({ start, end, periode }) =>
  `${PERIODE_LABELS[periode] || "Période"} (${start} → ${end})`;
