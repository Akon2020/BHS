/**
 * Convertit le HTML de l'éditeur web en texte lisible (préserve les sauts de
 * paragraphe). Rendu HTML riche (styles, listes, images inline) = amélioration
 * ultérieure via une lib de rendu dédiée.
 */
export const stripHtml = (html?: string | null): string => {
  if (!html) return "";
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|h[1-6]|li)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/** Vrai si le HTML ne contient aucun texte visible (ex. méditation sans texte). */
export const isEmptyHtml = (html?: string | null): boolean =>
  stripHtml(html).length === 0;
