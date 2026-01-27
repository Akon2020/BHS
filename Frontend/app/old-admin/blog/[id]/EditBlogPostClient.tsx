"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { getPostById, updatePost } from "@/lib/blog-data"

const categories = [
  "Spiritualité",
  "Étude Biblique",
  "Communauté",
  "Témoignages",
  "Louange",
  "Famille",
]

export default function EditBlogPostClient({ id }: { id: string }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const post = getPostById(id)
  const user = getCurrentUser()

  const [formData, setFormData] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    category: post?.category || categories[0],
  })

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/connexion")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return

    updatePost(id, formData)
    alert("Article mis à jour avec succès!")
    router.push("/admin/blog")
  }

  if (!mounted || !post || !user) return null

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
            <h1 className="font-serif text-3xl font-bold">
              Modifier l'article
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Modifiez les détails de votre article
            </p>
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium">
                  Catégorie
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      excerpt: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
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
