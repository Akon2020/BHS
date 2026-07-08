/**
 * Génération de fichiers .ics (iCalendar) et de liens Google Agenda.
 * Utilisé par le calendrier admin et les pages publiques (événements, RDV).
 */

export interface IcsItem {
  /** Identifiant unique et stable de l'événement. */
  uid: string;
  title: string;
  description?: string;
  location?: string;
  /** Date au format AAAA-MM-JJ. */
  date: string;
  /** Heure de début HH:MM(:SS) — ignorée si `allDay`. */
  heureDebut?: string;
  /** Heure de fin HH:MM(:SS) — optionnelle. */
  heureFin?: string;
  /** Événement sur la journée entière (anniversaires). */
  allDay?: boolean;
  /** Récurrence annuelle (anniversaires). */
  recurringYearly?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Échappe les caractères spéciaux iCalendar.
const escapeIcs = (value = "") =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

// "AAAA-MM-JJ" → "AAAAMMJJ".
const toDateStamp = (date: string) => date.replace(/-/g, "");

// Ajoute des jours à une date "AAAA-MM-JJ".
const addDays = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(
    dt.getUTCDate(),
  )}`;
};

// Normalise "HH:MM" ou "HH:MM:SS" → "HHMMSS".
const toTimeStamp = (time?: string) => {
  if (!time) return "000000";
  const [h = "0", m = "0", s = "0"] = time.split(":");
  return `${pad(Number(h))}${pad(Number(m))}${pad(Number(s))}`;
};

// Ajoute une heure à "HH:MM(:SS)" (défaut de fin = début + 1 h).
const addOneHour = (time?: string) => {
  if (!time) return "010000";
  const parts = time.split(":").map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const dt = new Date(Date.UTC(2000, 0, 1, h + 1, m));
  return `${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00`;
};

/** Construit le contenu texte d'un fichier .ics pour un item. */
export const buildIcs = (item: IcsItem): string => {
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(
    now.getUTCDate(),
  )}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(
    now.getUTCSeconds(),
  )}Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Burning Heart//Calendrier//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${item.uid}`,
    `DTSTAMP:${dtstamp}`,
  ];

  if (item.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${toDateStamp(item.date)}`);
    lines.push(`DTEND;VALUE=DATE:${toDateStamp(addDays(item.date, 1))}`);
  } else {
    const start = `${toDateStamp(item.date)}T${toTimeStamp(item.heureDebut)}`;
    const endTime = item.heureFin
      ? toTimeStamp(item.heureFin)
      : addOneHour(item.heureDebut);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${toDateStamp(item.date)}T${endTime}`);
  }

  if (item.recurringYearly) lines.push("RRULE:FREQ=YEARLY");
  lines.push(`SUMMARY:${escapeIcs(item.title)}`);
  if (item.description) lines.push(`DESCRIPTION:${escapeIcs(item.description)}`);
  if (item.location) lines.push(`LOCATION:${escapeIcs(item.location)}`);

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
};

/** Déclenche le téléchargement d'un fichier .ics pour l'item donné. */
export const downloadIcs = (item: IcsItem, filename?: string) => {
  const blob = new Blob([buildIcs(item)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ||
    `${item.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "evenement"}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/** Construit un lien « Ajouter à Google Agenda ». */
export const googleCalendarUrl = (item: IcsItem): string => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.title,
  });

  if (item.allDay) {
    params.set(
      "dates",
      `${toDateStamp(item.date)}/${toDateStamp(addDays(item.date, 1))}`,
    );
    if (item.recurringYearly) params.set("recur", "RRULE:FREQ=YEARLY");
  } else {
    const start = `${toDateStamp(item.date)}T${toTimeStamp(item.heureDebut)}`;
    const endTime = item.heureFin
      ? toTimeStamp(item.heureFin)
      : addOneHour(item.heureDebut);
    params.set("dates", `${start}/${toDateStamp(item.date)}T${endTime}`);
  }

  if (item.description) params.set("details", item.description);
  if (item.location) params.set("location", item.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
