/**
 * Utilitaires pour le HTML produit par l'éditeur riche (descriptions
 * d'événements, articles…). Côté navigateur uniquement (DOMParser).
 */

const BALISES_INTERDITES = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "form",
  "input",
  "button",
  "textarea",
  "select",
];

const URL_DANGEREUSE = /^\s*(javascript|vbscript|data):/i;

/**
 * Assainit un fragment HTML : retire les balises actives, les gestionnaires
 * `on*` et les URL `javascript:`/`data:`. Les liens externes s'ouvrent dans
 * un nouvel onglet.
 */
export const sanitizeHtml = (html?: string | null): string => {
  if (!html) return "";
  if (typeof window === "undefined") return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body
    .querySelectorAll(BALISES_INTERDITES.join(","))
    .forEach((el) => el.remove());

  doc.body.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const nom = attr.name.toLowerCase();
      if (nom.startsWith("on") || nom === "style") {
        el.removeAttribute(attr.name);
      } else if (
        (nom === "href" || nom === "src" || nom === "xlink:href") &&
        URL_DANGEREUSE.test(attr.value)
      ) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.tagName === "A" && el.getAttribute("href")?.startsWith("http")) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });

  return doc.body.innerHTML;
};

/** Convertit du HTML en texte brut lisible (export .ics, agendas externes). */
export const htmlToText = (html?: string | null): string => {
  if (!html) return "";
  const avecSauts = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ");

  let texte: string;
  if (typeof window !== "undefined") {
    texte =
      new DOMParser().parseFromString(avecSauts, "text/html").body
        .textContent || "";
  } else {
    texte = avecSauts
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  return texte.replace(/\n{3,}/g, "\n\n").trim();
};
