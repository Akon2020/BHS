import { googleCalendarUrl } from "@/lib/calendar-link";

describe("googleCalendarUrl", () => {
  it("construit un lien horaire (fin par défaut +1 h)", () => {
    const url = googleCalendarUrl({
      title: "Messe",
      date: "2026-03-15",
      heureDebut: "09:00",
    });
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("dates=20260315T090000%2F20260315T100000");
    expect(url).toContain("text=Messe");
  });

  it("gère un événement sur la journée entière", () => {
    const url = googleCalendarUrl({
      title: "Anniversaire",
      date: "2026-03-15",
      allDay: true,
    });
    expect(url).toContain("dates=20260315%2F20260316");
  });

  it("inclut lieu et description quand fournis", () => {
    const url = googleCalendarUrl({
      title: "RDV",
      date: "2026-03-15",
      heureDebut: "14:00",
      heureFin: "15:00",
      location: "Bukavu",
      description: "Entretien",
    });
    expect(url).toContain("location=Bukavu");
    expect(url).toContain("details=Entretien");
    expect(url).toContain("dates=20260315T140000%2F20260315T150000");
  });
});
