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
import {
  Users,
  FileText,
  Calendar,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AdminRecentUsers from "@/components/admin/recent-users";
import AdminRecentPosts from "@/components/admin/recent-posts";
import AdminChart from "@/components/admin/chart";
import { getDashboard } from "@/actions/dashboard";
import type { DashboardResponse } from "@/types/dashboard";

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    getDashboard()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch(() => {
        // ignore errors silently for now
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/blog/new">Nouvel article</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/newsletter/new">Nouvelle newsletter</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? data.users.nombre : "0"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span
                className={`flex items-center mr-1 ${data?.users.stat.startsWith("-") ? "text-red-500" : "text-green-500"}`}
              >
                {data?.users.stat.startsWith("-") ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                )}
                {data ? data.users.stat : "0%"}
              </span>
              depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? data.blogs.nombre : "0"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span
                className={`flex items-center mr-1 ${data?.blogs.stat.startsWith("-") ? "text-red-500" : "text-green-500"}`}
              >
                {data?.blogs.stat.startsWith("-") ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                )}
                {data ? data.blogs.stat : "0%"}
              </span>
              depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Événements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? data.evenements.nombre : "0"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span
                className={`flex items-center mr-1 ${data?.evenements.stat.startsWith("-") ? "text-red-500" : "text-green-500"}`}
              >
                {data?.evenements.stat.startsWith("-") ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                )}
                {data ? data.evenements.stat : "0%"}
              </span>
              depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Abonnés Newsletter
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? data.abonnes.nombre : "0"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span
                className={`flex items-center mr-1 ${data?.abonnes.stat.startsWith("-") ? "text-red-500" : "text-green-500"}`}
              >
                {data?.abonnes.stat.startsWith("-") ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                )}
                {data ? data.abonnes.stat : "0%"}
              </span>
              depuis le mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des visites</CardTitle>
          <CardDescription>
            Nombre de visites sur le site au cours des 30 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminChart />
        </CardContent>
      </Card>

      {/* Recent Activity Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Utilisateurs récents</TabsTrigger>
          <TabsTrigger value="posts">Articles récents</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouveaux utilisateurs</CardTitle>
              <CardDescription>
                Les 5 derniers utilisateurs inscrits sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRecentUsers users={data?.users.data} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Articles récents</CardTitle>
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
