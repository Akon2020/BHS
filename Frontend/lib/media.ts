const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

/** URL absolue d'un fichier servi par l'API (`uploads/...`). */
export const mediaUrl = (chemin?: string | null): string | undefined => {
  if (!chemin) return undefined;
  if (chemin.startsWith("http")) return chemin;
  if (!API_BASE_URL) return undefined;
  return `${API_BASE_URL}/${chemin.replace(/^\/+/, "")}`;
};

/** Date courte FR : « 2 nov. 2026 ». */
export const formatDateCourte = (date?: string | null): string =>
  date
    ? new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

/** Date longue FR à partir d'un `YYYY-MM-DD` (sans décalage de fuseau). */
export const formatDateLongue = (dateIso?: string | null): string => {
  if (!dateIso) return "";
  const [y, m, d] = dateIso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
