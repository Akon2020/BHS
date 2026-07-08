"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  List,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AddToCalendar } from "@/components/add-to-calendar";
import type { IcsItem } from "@/lib/ics";
import { getAllEventsAdmin } from "@/actions/event";
import { getRendezVous } from "@/actions/agenda";
import { getAnniversaires } from "@/actions/anniversaire";

type CalType = "evenement" | "rdv" | "anniversaire";

interface CalItem {
  key: string;
  type: CalType;
  date: string; // AAAA-MM-JJ (dans l'année affichée pour les anniversaires)
  title: string;
  heureDebut?: string;
  heureFin?: string;
  location?: string;
  description?: string;
  badge?: string;
  ics: IcsItem;
}

const TYPE_CONFIG: Record<
  CalType,
  { label: string; dot: string; chip: string }
> = {
  evenement: {
    label: "Événements",
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
  },
  rdv: {
    label: "Rendez-vous",
    dot: "bg-blue-500",
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  anniversaire: {
    label: "Anniversaires",
    dot: "bg-amber-500",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const pad = (n: number) => String(n).padStart(2, "0");
const toDateStr = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

export default function CalendrierPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [anniversaires, setAnniversaires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [view, setView] = useState<"mois" | "liste">("mois");
  const [filters, setFilters] = useState<Record<CalType, boolean>>({
    evenement: true,
    rdv: true,
    anniversaire: true,
  });
  const [selected, setSelected] = useState<CalItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ev, rv, an] = await Promise.all([
          getAllEventsAdmin({ limit: 500 }),
          getRendezVous(),
          getAnniversaires(),
        ]);
        setEvents(ev.events || []);
        setRdvs(rv.rendezVous || []);
        setAnniversaires(an.anniversaires || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error?.message,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Construit tous les items du mois affiché (tous types confondus).
  const items = useMemo<CalItem[]>(() => {
    const { year, month } = cursor;
    const list: CalItem[] = [];

    for (const e of events) {
      if (!e.dateEvenement) continue;
      const [y, m] = e.dateEvenement.split("-").map(Number);
      if (y !== year || m - 1 !== month) continue;
      list.push({
        key: `evt-${e.idEvenement}`,
        type: "evenement",
        date: e.dateEvenement,
        title: e.titre,
        heureDebut: e.heureDebut,
        heureFin: e.heureFin,
        location: e.lieu,
        description: e.description,
        badge: e.statut,
        ics: {
          uid: `evt-${e.idEvenement}@burningheart`,
          title: e.titre,
          description: e.description,
          location: e.lieu,
          date: e.dateEvenement,
          heureDebut: e.heureDebut,
          heureFin: e.heureFin,
        },
      });
    }

    for (const r of rdvs) {
      if (!r.date || r.statut === "refuse") continue;
      const [y, m] = r.date.split("-").map(Number);
      if (y !== year || m - 1 !== month) continue;
      list.push({
        key: `rdv-${r.idRendezVous}`,
        type: "rdv",
        date: r.date,
        title: `RDV — ${r.nom}`,
        heureDebut: r.heureDebut,
        heureFin: r.heureFin,
        description: r.motif,
        badge: r.statut,
        ics: {
          uid: `rdv-${r.idRendezVous}@burningheart`,
          title: `Rendez-vous — ${r.nom}`,
          description: r.motif,
          date: r.date,
          heureDebut: r.heureDebut,
          heureFin: r.heureFin,
        },
      });
    }

    for (const a of anniversaires) {
      if (a.actif === false || a.mois - 1 !== month) continue;
      const date = toDateStr(year, month, a.jour);
      list.push({
        key: `anniv-${a.idAnniversaire}`,
        type: "anniversaire",
        date,
        title: `Anniversaire — ${a.nom}`,
        description: a.note,
        ics: {
          uid: `anniv-${a.idAnniversaire}@burningheart`,
          title: `Anniversaire — ${a.nom}`,
          description: a.note || undefined,
          date,
          allDay: true,
          recurringYearly: true,
        },
      });
    }

    return list.filter((i) => filters[i.type]);
  }, [events, rdvs, anniversaires, cursor, filters]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalItem[]>();
    for (const it of items) {
      const arr = map.get(it.date) || [];
      arr.push(it);
      map.set(it.date, arr);
    }
    for (const arr of map.values()) {
      arr.sort((x, y) => (x.heureDebut || "").localeCompare(y.heureDebut || ""));
    }
    return map;
  }, [items]);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          (a.heureDebut || "").localeCompare(b.heureDebut || ""),
      ),
    [items],
  );

  // Grille de 6 semaines (lundi → dimanche) avec dates réelles.
  const grid = useMemo(() => {
    const { year, month } = cursor;
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lundi = 0
    const cells: { y: number; m: number; d: number; inMonth: boolean }[] = [];
    const start = new Date(year, month, 1 - startOffset);
    for (let i = 0; i < 42; i++) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      cells.push({
        y: dt.getFullYear(),
        m: dt.getMonth(),
        d: dt.getDate(),
        inMonth: dt.getMonth() === month,
      });
    }
    return cells;
  }, [cursor]);

  const todayStr = toDateStr(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  const changeMonth = (delta: number) => {
    setCursor((c) => {
      const dt = new Date(c.year, c.month + delta, 1);
      return { year: dt.getFullYear(), month: dt.getMonth() };
    });
  };

  const goToday = () => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
  };

  const toggleFilter = (t: CalType) =>
    setFilters((f) => ({ ...f, [t]: !f[t] }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Calendrier</h1>
          <p className="text-sm text-muted-foreground">
            Événements, rendez-vous et anniversaires réunis. Exportez chaque
            entrée vers votre agenda.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border p-1">
          <Button
            variant={view === "mois" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("mois")}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Mois
          </Button>
          <Button
            variant={view === "liste" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("liste")}
          >
            <List className="mr-2 h-4 w-4" />
            Liste
          </Button>
        </div>
      </div>

      {/* Barre de navigation + filtres */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} aria-label="Mois précédent">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[160px] text-center font-semibold">
            {MOIS[cursor.month]} {cursor.year}
          </span>
          <Button variant="outline" size="icon" onClick={() => changeMonth(1)} aria-label="Mois suivant">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            Aujourd&apos;hui
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_CONFIG) as CalType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleFilter(t)}
              aria-pressed={filters[t]}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                filters[t]
                  ? "bg-accent"
                  : "opacity-50 hover:opacity-100",
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", TYPE_CONFIG[t].dot)} />
              {TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : view === "mois" ? (
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
            {JOURS.map((j) => (
              <div key={j} className="py-2">
                {j}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((cell, idx) => {
              const dateStr = toDateStr(cell.y, cell.m, cell.d);
              const dayItems = itemsByDay.get(dateStr) || [];
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[92px] border-b border-r p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                    !cell.inMonth && "bg-muted/20 text-muted-foreground",
                  )}
                >
                  <div className="mb-1 flex justify-end">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                        isToday && "bg-primary font-bold text-primary-foreground",
                      )}
                    >
                      {cell.d}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((it) => (
                      <button
                        key={it.key}
                        type="button"
                        onClick={() => setSelected(it)}
                        className={cn(
                          "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium",
                          TYPE_CONFIG[it.type].chip,
                        )}
                      >
                        {it.heureDebut && !it.ics.allDay && (
                          <span className="tabular-nums opacity-80">
                            {it.heureDebut.slice(0, 5)}
                          </span>
                        )}
                        <span className="truncate">{it.title}</span>
                      </button>
                    ))}
                    {dayItems.length > 3 && (
                      <p className="px-1 text-[10px] text-muted-foreground">
                        +{dayItems.length - 3} de plus
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border">
          {sortedItems.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune entrée ce mois-ci.
            </p>
          ) : (
            <ul className="divide-y">
              {sortedItems.map((it) => (
                <li
                  key={it.key}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                        TYPE_CONFIG[it.type].dot,
                      )}
                    />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelected(it)}
                        className="text-left text-sm font-medium hover:text-primary"
                      >
                        {it.title}
                      </button>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(it.date).toLocaleDateString("fr-FR")}
                          {it.heureDebut && !it.ics.allDay
                            ? ` · ${it.heureDebut.slice(0, 5)}`
                            : it.ics.allDay
                              ? " · Journée"
                              : ""}
                        </span>
                        {it.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {it.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <AddToCalendar item={it.ics} className="shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Détail d'une entrée */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="pr-6">{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    TYPE_CONFIG[selected.type].chip,
                  )}
                >
                  {TYPE_CONFIG[selected.type].label.replace(/s$/, "")}
                </span>
                {selected.badge && (
                  <Badge variant="outline" className="capitalize">
                    {selected.badge.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {new Date(selected.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {selected.heureDebut && !selected.ics.allDay
                    ? ` · ${selected.heureDebut.slice(0, 5)}${
                        selected.heureFin
                          ? `–${selected.heureFin.slice(0, 5)}`
                          : ""
                      }`
                    : selected.ics.allDay
                      ? " · Journée entière"
                      : ""}
                </p>
                {selected.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selected.location}
                  </p>
                )}
              </div>
              {selected.description && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {selected.description}
                </p>
              )}
              <div className="flex justify-end">
                <AddToCalendar item={selected.ics} variant="default" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
