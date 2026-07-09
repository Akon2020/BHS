"use client";

import Link from "next/link";
import {
  CalendarClock,
  Cake,
  ListTodo,
  Timer,
  HandHeart,
  Ticket,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardResponse } from "@/types/dashboard";

const MOIS_COURTS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MOIS_COURTS[m - 1]} ${y}`;
};

const formatMontants = (parDevise: Record<string, number>) => {
  const entries = Object.entries(parDevise || {});
  if (entries.length === 0) return "0";
  return entries
    .map(([dev, montant]) => `${montant.toLocaleString("fr-FR")} ${dev}`)
    .join(" · ");
};

const rdvBadge = (statut: string) =>
  statut === "approuve"
    ? "bg-primary/10 text-primary"
    : "bg-amber-500/10 text-amber-600 dark:text-amber-400";

const prioriteBadge = (p: string) =>
  p === "haute"
    ? "bg-destructive/10 text-destructive"
    : p === "basse"
      ? "bg-muted text-muted-foreground"
      : "bg-primary/10 text-primary";

/* --------------------------- Aperçu rapide (rail) --------------------------- */

/** Carte compacte : métriques secondaires en un coup d'œil (rail du bento). */
export function DashboardQuickStats({
  data,
}: {
  data: DashboardResponse | null;
}) {
  if (!data) return null;

  const rows: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    href: string;
  }[] = [
    {
      label: "RDV en attente",
      value: data.rendezVous?.enAttente ?? 0,
      icon: CalendarClock,
      href: "/admin/agenda",
    },
    {
      label: "Tâches actives",
      value: (data.taches?.aFaire ?? 0) + (data.taches?.enCours ?? 0),
      icon: ListTodo,
      href: "/admin/taches",
    },
    {
      label: "Heures pointées (mois)",
      value: `${data.pointage?.heuresMois ?? 0} h`,
      icon: Timer,
      href: "/admin/pointage",
    },
    {
      label: "Inscrits événements",
      value: data.finances?.nbInscrits ?? 0,
      icon: Ticket,
      href: "/admin/events",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Aperçu rapide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.map((r) => (
          <Link
            key={r.label}
            href={r.href}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <r.icon className="h-4 w-4" />
              </span>
              <span className="text-sm text-muted-foreground">{r.label}</span>
            </span>
            <span className="text-lg font-bold tabular-nums">{r.value}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

/* -------------------------------- Panneaux -------------------------------- */

/** Panneau générique avec titre, lien « voir tout » et contenu / état vide. */
function Panel({
  title,
  icon: Icon,
  href,
  isEmpty,
  emptyLabel,
  children,
}: {
  title: string;
  icon: LucideIcon;
  href: string;
  isEmpty: boolean;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <Link
          href={href}
          className="flex items-center text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Voir tout
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        {isEmpty ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview({
  data,
}: {
  data: DashboardResponse | null;
}) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Panneaux temps-réel : RDV, anniversaires, tâches */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Prochains rendez-vous"
          icon={CalendarClock}
          href="/admin/agenda"
          isEmpty={(data.rendezVous?.data?.length ?? 0) === 0}
          emptyLabel="Aucun rendez-vous à venir."
        >
          <ul className="space-y-3">
            {data.rendezVous.data.map((r) => (
              <li
                key={r.idRendezVous}
                className="flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(r.date)} · {r.heureDebut?.slice(0, 5)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    rdvBadge(r.statut),
                  )}
                >
                  {r.statut === "approuve" ? "Approuvé" : "En attente"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Anniversaires à venir"
          icon={Cake}
          href="/admin/anniversaires"
          isEmpty={(data.anniversaires?.data?.length ?? 0) === 0}
          emptyLabel="Aucun anniversaire configuré."
        >
          <ul className="space-y-3">
            {data.anniversaires.data.map((a) => (
              <li
                key={a.idAnniversaire}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    {String(a.jour).padStart(2, "0")} {MOIS_COURTS[a.mois - 1]}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {a.dansJours === 0
                    ? "Aujourd'hui"
                    : a.dansJours === 1
                      ? "Demain"
                      : `J-${a.dansJours}`}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Tâches à échéance"
          icon={ListTodo}
          href="/admin/taches"
          isEmpty={(data.taches?.data?.length ?? 0) === 0}
          emptyLabel="Aucune tâche planifiée."
        >
          <ul className="space-y-3">
            {data.taches.data.map((t) => (
              <li
                key={t.idTache}
                className="flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(t.echeance)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    prioriteBadge(t.priorite),
                  )}
                >
                  {t.priorite === "haute"
                    ? "Haute"
                    : t.priorite === "basse"
                      ? "Basse"
                      : "Normale"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Finances : dons + événements */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Dons récents"
          icon={HandHeart}
          href="/admin/dons"
          isEmpty={(data.dons?.data?.length ?? 0) === 0}
          emptyLabel="Aucun don enregistré."
        >
          <div className="mb-3 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Total confirmé : </span>
            <span className="font-semibold">
              {formatMontants(data.dons.totalParDevise)}
            </span>
          </div>
          <ul className="space-y-3">
            {data.dons.data.map((d) => (
              <li
                key={d.idDon}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.statut === "confirme" ? "Confirmé" : "Annoncé"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {d.montant
                    ? `${Number(d.montant).toLocaleString("fr-FR")} ${d.devise}`
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Finances événements"
          icon={Ticket}
          href="/admin/events"
          isEmpty={data.finances?.nbInscrits === 0}
          emptyLabel="Aucune inscription enregistrée."
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Inscriptions</span>
              <span className="font-semibold tabular-nums">
                {data.finances.nbInscrits}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Encaissé</span>
              <span className="font-semibold tabular-nums">
                {formatMontants(data.finances.encaisseParDevise)}
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
