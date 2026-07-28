"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FileText,
  Calendar,
  Mail,
  Timer,
  HandHeart,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  CalendarRange,
  Tags,
  UserCheck,
  Trophy,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import AdminRecentUsers from "@/components/admin/recent-users";
import AdminRecentPosts from "@/components/admin/recent-posts";
import DashboardOverview from "@/components/admin/dashboard-overview";
import { KpiSparkline } from "@/components/admin/charts/kpi-sparkline";
import { GrowthBar } from "@/components/admin/charts/growth-bar";
import { HoursLine } from "@/components/admin/charts/hours-line";
import { CategoryBar } from "@/components/admin/charts/category-bar";
import { DonutChart } from "@/components/admin/charts/donut-chart";
import { useChartPalette } from "@/components/admin/charts/chart-core";
import { getDashboard } from "@/actions/dashboard";
import type { DashboardResponse } from "@/types/dashboard";

const formatMontants = (parDevise: Record<string, number>) => {
  const entries = Object.entries(parDevise || {});
  if (entries.length === 0) return "0";
  return entries
    .map(([dev, montant]) => `${montant.toLocaleString("fr-FR")} ${dev}`)
    .join(" · ");
};

function TrendBadge({ stat }: { stat?: string }) {
  const value = stat ?? "0%";
  const down = value.startsWith("-");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
        down
          ? "bg-destructive/10 text-destructive"
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      )}
    >
      {down ? (
        <ArrowDownRight className="h-3 w-3" />
      ) : (
        <ArrowUpRight className="h-3 w-3" />
      )}
      {value}
    </span>
  );
}

function KpiCard({
  label,
  value,
  stat,
  icon: Icon,
  href,
  series,
  color,
  hint,
}: {
  label: string;
  value: string | number;
  stat?: string;
  icon: LucideIcon;
  href: string;
  series?: number[];
  color?: string;
  hint?: string;
}) {
  return (
    <Link href={href} className="group focus-visible:outline-none">
      <Card className="h-full overflow-hidden transition-all group-hover:border-primary/40 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            {stat && <TrendBadge stat={stat} />}
          </div>
          <p className="mt-4 truncate text-2xl font-bold tabular-nums xl:text-3xl">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {series && color ? (
            <div className="mt-3">
              <KpiSparkline data={series} color={color} />
            </div>
          ) : (
            hint && (
              <p className="mt-3 text-xs text-muted-foreground/70">{hint}</p>
            )
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

/** Ligne statistique compacte (label + valeur). */
function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const palette = useChartPalette();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  // Horloge live (null tant que non monté → évite tout écart d'hydratation).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;
    getDashboard()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch(() => {
        /* silencieux : états vides gérés côté panneaux */
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const prenom = user?.nomComplet?.split(" ")[0] || "";
  const heure = now?.getHours() ?? 0;
  const salutation = !now
    ? "Bonjour"
    : heure < 12
      ? "Bonjour"
      : heure < 18
        ? "Bon après-midi"
        : "Bonsoir";
  const dateLabel = (now ?? new Date()).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const heureLabel = now ? now.toLocaleTimeString("fr-FR") : "--:--:--";

  const kpis = data
    ? [
        {
          label: "Utilisateurs",
          value: data.users.nombre,
          stat: data.users.stat,
          icon: Users,
          href: "/admin/users",
          series: data.serie.utilisateurs,
          color: palette.chart1,
        },
        {
          label: "Abonnés Newsletter",
          value: data.abonnes.nombre,
          stat: data.abonnes.stat,
          icon: Mail,
          href: "/admin/abonnes",
          series: data.serie.abonnes,
          color: palette.chart2,
        },
        {
          label: "Événements",
          value: data.evenements.nombre,
          stat: data.evenements.stat,
          icon: Calendar,
          href: "/admin/events",
          series: data.serie.evenements,
          color: palette.chart4,
        },
        {
          label: "Articles",
          value: data.blogs.nombre,
          stat: data.blogs.stat,
          icon: FileText,
          href: "/admin/blog",
          series: data.serie.articles,
          color: palette.chart3,
        },
        {
          label: "Heures pointées (mois)",
          value: `${data.pointage.heuresMois} h`,
          stat: data.pointage.stat,
          icon: Timer,
          href: "/admin/pointage",
          series: data.serie.heures,
          color: palette.chart5,
        },
        {
          label: "Dons confirmés",
          value: formatMontants(data.dons.totalParDevise),
          icon: HandHeart,
          href: "/admin/dons",
          hint: `${data.dons.anneeCount} cette année`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            {salutation}
            {prenom ? `, ${prenom}` : ""}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{dateLabel}</span>
            <span className="text-muted-foreground/40">·</span>
            <span
              className="inline-flex items-center gap-1 tabular-nums"
              aria-live="off"
            >
              <Clock className="h-3.5 w-3.5" />
              {heureLabel}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/admin/blog/new">Nouvel article</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/newsletter/new">Nouvelle newsletter</Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="mt-4 h-8 w-16" />
                  <Skeleton className="mt-2 h-4 w-24" />
                  <Skeleton className="mt-3 h-12 w-full" />
                </CardContent>
              </Card>
            ))
          : kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Panneaux opérationnels : RDV, anniversaires, tâches (compacts) */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-9 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DashboardOverview data={data} />
      )}

      {/* Analyse : croissance + événements */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Croissance sur 6 mois
            </CardTitle>
            <CardDescription>
              Nouveaux utilisateurs et abonnés par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <GrowthBar
                labels={data!.serie.mois}
                utilisateurs={data!.serie.utilisateurs}
                abonnes={data!.serie.abonnes}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4 text-primary" />
              Événements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <DonutChart
                  segments={[
                    {
                      label: "À venir",
                      value: data!.evenements.aVenir,
                      color: palette.chart1,
                    },
                    {
                      label: "Passés",
                      value: data!.evenements.passes,
                      color: palette.chart3,
                    },
                  ]}
                  centerValue={data!.evenements.nombre}
                  centerLabel="au total"
                />
                <div className="space-y-2">
                  <StatLine
                    label="Taux de remplissage"
                    value={`${data!.evenements.tauxRemplissage} %`}
                  />
                  <StatLine
                    label="Inscriptions"
                    value={data!.finances.nbInscrits}
                  />
                  <StatLine
                    label="Encaissé"
                    value={formatMontants(data!.finances.encaisseParDevise)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pointage : tendance + top contributeurs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4 text-primary" />
              Heures pointées — 6 mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <HoursLine labels={data!.serie.mois} data={data!.serie.heures} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" />
              Top contributeurs
            </CardTitle>
            <CardDescription>Heures pointées ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data!.pointage.topContributeurs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun pointage ce mois.
              </p>
            ) : (
              <ol className="space-y-3">
                {data!.pointage.topContributeurs.map((c, i) => (
                  <li
                    key={c.nom}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          i === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="truncate text-sm font-medium">
                        {c.nom}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {c.heures} h
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Répartitions : articles par catégorie + abonnés */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tags className="h-4 w-4 text-primary" />
              Articles par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <CategoryBar items={data!.blogs.parCategorie} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-4 w-4 text-primary" />
              Abonnés newsletter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <DonutChart
                segments={[
                  {
                    label: "Actifs",
                    value: data!.abonnes.parStatut.actif,
                    color: palette.chart2,
                  },
                  {
                    label: "Inactifs",
                    value: data!.abonnes.parStatut.inactif,
                    color: palette.chart4,
                  },
                  {
                    label: "Désabonnés",
                    value: data!.abonnes.parStatut.desabonne,
                    color: palette.mutedFg,
                  },
                ]}
                centerValue={data!.abonnes.nombre}
                centerLabel="abonnés"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2 sm:inline-grid sm:w-auto">
          <TabsTrigger value="users">Utilisateurs récents</TabsTrigger>
          <TabsTrigger value="posts">Articles récents</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nouveaux utilisateurs</CardTitle>
              <CardDescription>
                Les 5 derniers inscrits sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRecentUsers users={data?.users.data} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="posts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Articles récents</CardTitle>
              <CardDescription>
                Les 5 derniers articles publiés sur le blog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRecentPosts posts={data?.blogs.data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
