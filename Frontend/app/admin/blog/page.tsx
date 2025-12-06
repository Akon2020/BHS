"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated } from "@/lib/auth"
import { getAllPosts, deletePost } from "@/lib/blog-data"

export default function AdminBlogPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [posts, setPosts] = useState(getAllPosts())

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/connexion")
    }
  }, [router])

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article?")) {
      deletePost(id)
      setPosts(getAllPosts())
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col py-12">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-3xl font-bold">Gestion des articles</h1>
            <p className="mt-1 text-sm text-muted-foreground">Créez, modifiez et supprimez vos articles de blog</p>
          </div>
          <Link href="/admin/blog/nouveau">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel article
            </Button>
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="border-none shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {post.category}
                  </div>
                  <h3 className="mt-2 font-semibold">{post.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {post.author} • {post.date}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/blog/${post.id}`}>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Pencil className="h-4 w-4" />
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
