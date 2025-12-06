"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Users, Calendar, FileText, LogOut } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated, logout, getCurrentUser } from "@/lib/auth"
import { getAllPosts } from "@/lib/blog-data"

export default function AdminDashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const user = getCurrentUser()
  const posts = getAllPosts()

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/connexion")
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!mounted || !user) {
    return null
  }

  const stats = [
    { name: "Articles publiés", value: posts.length, icon: FileText, href: "/admin/blog" },
    { name: "Événements", value: "6", icon: Calendar, href: "/evenements" },
    { name: "Services", value: "6", icon: BookOpen, href: "/services" },
    { name: "Membres", value: "248", icon: Users, href: "#" },
  ]

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col py-12">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold">Tableau de bord</h1>
            <p className="mt-1 text-sm text-muted-foreground">Bienvenue, {user.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="border-none shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="font-serif text-2xl font-bold">Actions rapides</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/blog">
              <Card className="border-none shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gérer les articles</h3>
                    <p className="text-sm text-muted-foreground">Créer et modifier</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/evenements">
              <Card className="border-none shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Événements</h3>
                    <p className="text-sm text-muted-foreground">Voir et gérer</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/services">
              <Card className="border-none shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Services</h3>
                    <p className="text-sm text-muted-foreground">Gérer les activités</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Articles récents</h2>
            <Link href="/admin/blog">
              <Button variant="outline" size="sm">
                Voir tous
              </Button>
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {posts.slice(0, 5).map((post) => (
              <Card key={post.id} className="border-none shadow-sm">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {post.author} • {post.date}
                    </p>
                  </div>
                  <Link href={`/admin/blog/${post.id}`}>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
