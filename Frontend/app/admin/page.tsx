"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Calendar, Mail, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AdminRecentUsers from "@/components/admin/recent-users"
import AdminRecentPosts from "@/components/admin/recent-posts"
import AdminChart from "@/components/admin/chart"

export default function AdminDashboard() {
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
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12%
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
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                8%
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                24%
              </span>
              depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abonnés Newsletter</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-red-500 flex items-center mr-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                3%
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
          <CardDescription>Nombre de visites sur le site au cours des 30 derniers jours</CardDescription>
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
              <CardDescription>Les 5 derniers utilisateurs inscrits sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRecentUsers />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Articles récents</CardTitle>
              <CardDescription>Les 5 derniers articles publiés sur le blog</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRecentPosts />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
