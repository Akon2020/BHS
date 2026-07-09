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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AdminRecentUsers from "@/components/admin/recent-users";
import AdminRecentPosts from "@/components/admin/recent-posts";
import AdminChart from "@/components/admin/chart";
import DashboardOverview, {
  DashboardQuickStats,
} from "@/components/admin/dashboard-overview";
import { getDashboard } from "@/actions/dashboard";
import type { DashboardResponse } from "@/types/dashboard";

/** Badge d'évolution mensuelle (hausse/baisse). */
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

/** Carte KPI cliquable (métrique principale + tendance). */
function KpiCard({
  label,
  value,
  stat,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  stat: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link href={href} className="group focus-visible:outline-none">
      <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <TrendBadge stat={stat} />
          </div>
          <p className="mt-4 text-3xl font-bold tabular-nums">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            depuis le mois dernier
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboard() {
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

  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const kpis = data
    ? [
        {
          label: "Utilisateurs",
          value: data.users.nombre,
          stat: data.users.stat,
          icon: Users,
          href: "/admin/users",
        },
        {
          label: "Articles",
          value: data.blogs.nombre,
          stat: data.blogs.stat,
          icon: FileText,
          href: "/admin/blog",
        },
        {
          label: "Événements",
          value: data.evenements.nombre,
          stat: data.evenements.stat,
          icon: Calendar,
          href: "/admin/events",
        },
        {
          label: "Abonnés Newsletter",
          value: data.abonnes.nombre,
          stat: data.abonnes.stat,
          icon: Mail,
          href: "/admin/abonnes",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {dateLabel}
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

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                </CardContent>
              </Card>
            ))
          : kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Bento : graphique (principal) + aperçu rapide (rail) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Analyse des visites</CardTitle>
            <CardDescription>30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminChart />
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

      {/* Panneaux agrégés : RDV, anniversaires, tâches, dons, finances */}
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
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
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
