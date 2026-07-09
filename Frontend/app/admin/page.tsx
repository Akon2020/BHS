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
  ArrowUpRight,
  ArrowDownRight,
  HandHeart,
  ListTodo,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import AdminRecentUsers from "@/components/admin/recent-users";
import AdminRecentPosts from "@/components/admin/recent-posts";
import DashboardOverview, {
  DashboardQuickStats,
} from "@/components/admin/dashboard-overview";
import { KpiSparkline } from "@/components/admin/charts/kpi-sparkline";
import { TasksDonut } from "@/components/admin/charts/tasks-donut";
import { GrowthBar } from "@/components/admin/charts/growth-bar";
import { DonsRadial } from "@/components/admin/charts/dons-radial";
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
}: {
  label: string;
  value: number;
  stat: string;
  icon: LucideIcon;
  href: string;
  series: number[];
  color: string;
}) {
  return (
    <Link href={href} className="group focus-visible:outline-none">
      <Card className="h-full overflow-hidden transition-all group-hover:border-primary/40 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <TrendBadge stat={stat} />
          </div>
          <p className="mt-4 text-3xl font-bold tabular-nums">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="mt-3">
            <KpiSparkline data={series} color={color} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const palette = useChartPalette();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      ]
    : [];

  const donsAnnee = data ? formatMontants(data.dons.anneeParDevise) : "0";
  const ratioMois =
    data && data.dons.anneeCount > 0
      ? data.dons.moisCount / data.dons.anneeCount
      : 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
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

      {/* Accueil + aperçu rapide */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent lg:col-span-2">
          <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Bienvenue{prenom ? `, ${prenom}` : ""} 👋
              </p>
              <h2 className="mt-1 font-serif text-xl font-bold sm:text-2xl">
                Voici l&apos;activité de Burning Heart
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Dons confirmés cette année
              </p>
              <p className="font-serif text-3xl font-bold text-primary sm:text-4xl">
                {loading ? "—" : donsAnnee}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading
                  ? ""
                  : `${data?.dons.anneeCount ?? 0} don${(data?.dons.anneeCount ?? 0) > 1 ? "s" : ""} confirmé${(data?.dons.anneeCount ?? 0) > 1 ? "s" : ""}`}
              </p>
            </div>
            <div>
              <Button asChild variant="default" className="gap-2">
                <Link href="/admin/dons">
                  <HandHeart className="h-4 w-4" />
                  Voir les dons
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <DashboardQuickStats data={data} />
        )}
      </div>

      {/* KPIs avec tendance + sparkline */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
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

      {/* Répartition des tâches + croissance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="h-4 w-4 text-primary" />
              Répartition des tâches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mx-auto h-44 w-44 rounded-full" />
            ) : (
              <TasksDonut
                aFaire={data!.taches.aFaire}
                enCours={data!.taches.enCours}
                fait={data!.taches.fait}
              />
            )}
          </CardContent>
        </Card>

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
      </div>

      {/* Dons : ce mois / cette année */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HandHeart className="h-4 w-4 text-primary" />
            Dons confirmés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <DonsRadial
                label="Ce mois"
                count={data!.dons.moisCount}
                montantLabel={formatMontants(data!.dons.moisParDevise)}
                ratio={ratioMois}
                colorKey="primary"
              />
              <DonsRadial
                label="Cette année"
                count={data!.dons.anneeCount}
                montantLabel={formatMontants(data!.dons.anneeParDevise)}
                ratio={1}
                colorKey="chart2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panneaux agrégés : RDV, anniversaires, tâches, finances */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DashboardOverview data={data} />
      )}

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
