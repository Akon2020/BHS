"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { createPost } from "@/lib/blog-data"

const categories = ["Spiritualité", "Étude Biblique", "Communauté", "Témoignages", "Louange", "Famille"]

export default function NewBlogPostPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const user = getCurrentUser()

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: categories[0],
  })

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/connexion")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      createPost({
        ...formData,
        author: user.name,
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        readTime: `${Math.ceil(formData.content.split(" ").length / 200)} min`,
      })
      alert("Article créé avec succès!")
      router.push("/admin/blog")
    }
  }

  if (!mounted || !user) {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col py-12">
      <div className="mx-auto w-full max-w-4xl px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold">Nouvel article</h1>
            <p className="mt-1 text-sm text-muted-foreground">Créez un nouvel article de blog</p>
          </div>
        </div>

        <Card className="mt-8 border-none shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium">
                  Titre de l'article
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ex: La puissance de la prière"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium">
                  Catégorie
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium">
                  Résumé
                </label>
                <textarea
                  id="excerpt"
                  rows={3}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Un court résumé de votre article..."
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium">
                  Contenu
                </label>
                <textarea
                  id="content"
                  rows={12}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Écrivez votre article ici..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer l'article
                </Button>
                <Link href="/admin/blog">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
