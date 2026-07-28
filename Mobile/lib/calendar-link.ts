/**
 * Génère un lien « Ajouter à Google Agenda » (ouvert dans le navigateur).
 * Portage de la logique web `Frontend/lib/ics.ts`. Un ajout natif via
 * expo-calendar reste une amélioration ultérieure.
 */
export interface CalendarItem {
  title: string;
  description?: string;
  location?: string;
  date: string; // AAAA-MM-JJ
  heureDebut?: string; // HH:MM(:SS)
  heureFin?: string;
  allDay?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
const stampDate = (date: string) => date.replace(/-/g, "");
const stampTime = (t?: string) => {
  if (!t) return "000000";
  const [h = "0", m = "0", s = "0"] = t.split(":");
  return `${pad(Number(h))}${pad(Number(m))}${pad(Number(s))}`;
};
const addDay = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}`;
};
const addHour = (t?: string) => {
  const parts = (t ?? "").split(":").map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const dt = new Date(Date.UTC(2000, 0, 1, h + 1, m));
  return `${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00`;
};

export const googleCalendarUrl = (item: CalendarItem): string => {
  const params = new URLSearchParams({ action: "TEMPLATE", text: item.title });

  if (item.allDay) {
    params.set("dates", `${stampDate(item.date)}/${addDay(item.date)}`);
  } else {
    const start = `${stampDate(item.date)}T${stampTime(item.heureDebut)}`;
    const end = `${stampDate(item.date)}T${
      item.heureFin ? stampTime(item.heureFin) : addHour(item.heureDebut)
    }`;
    params.set("dates", `${start}/${end}`);
  }
  if (item.description) params.set("details", item.description);
  if (item.location) params.set("location", item.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
