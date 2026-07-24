import { API_BASE_URL } from "@/services/api/client";

const MOIS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/** "AAAA-MM-JJ" → "12 mars 2026". */
export const formatDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MOIS[m - 1]} ${y}`;
};

/** "HH:MM:SS" → "HH:MM". */
export const formatHeure = (time?: string | null): string =>
  time ? time.slice(0, 5) : "";

/** Montant + devise, ou chaîne vide si non payant. */
export const formatMontant = (
  montant?: string | number | null,
  devise = "USD",
): string => {
  const n = Number(montant);
  if (!n) return "";
  return `${n.toLocaleString("fr-FR")} ${devise}`;
};

/** Résout une URL média (chemin relatif servi depuis /uploads → URL absolue). */
export const mediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^\/+/, "");
  return `${API_BASE_URL}/${clean}`;
};
