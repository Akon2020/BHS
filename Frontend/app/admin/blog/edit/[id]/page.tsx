"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, ImageIcon, Upload } from "lucide-react"
import Link from "next/link"
import BlogEditor from "@/components/admin/blog-editor"
import { useRouter } from "next/navigation"

// export async function generateStaticParams() {
//   return blogPosts.map((post) => ({
//     id: post.id.toString(),
//   }));
// }

// Exemple de données de blog (à remplacer par des données réelles)
const blogPosts = [
  {
    id: 1,
    title: "La puissance de la prière dans la vie quotidienne",
    excerpt: "Découvrez comment la prière peut transformer votre vie quotidienne et vous apporter paix et sérénité.",
    content: "<p>La prière est l'un des aspects les plus fondamentaux de la vie chrétienne...</p>",
    category: "Spiritualité",
    tags: "Prière, Vie spirituelle, Développement personnel",
    image: "/placeholder.svg?height=500&width=1000",
    status: "published",
  },
  {
    id: 2,
    title: "Comment étudier la Bible efficacement",
    excerpt:
      "Des méthodes pratiques pour tirer le meilleur de votre temps d'étude biblique et approfondir votre compréhension.",
    content: "<p>L'étude de la Bible est essentielle pour tout chrétien qui souhaite approfondir sa foi...</p>",
    category: "Étude Biblique",
    tags: "Bible, Étude, Compréhension",
    image: "/placeholder.svg?height=500&width=1000",
    status: "published",
  },
]

// Catégories pour le filtre
const categories = ["Spiritualité", "Étude Biblique", "Communauté", "Témoignages", "Louange", "Famille"]

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [postData, setPostData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    featuredImage: "/placeholder.jpg",
    status: "",
  })

  useEffect(() => {
    // Simuler un chargement de données
    const post = blogPosts.find((post) => post.id === Number.parseInt(params.id))
    if (post) {
      setPostData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        featuredImage: post.image || "/placeholder.jpg",
        status: post.status,
      })
    } else {
      toast({
        title: "Erreur",
        description: "Article non trouvé",
        variant: "destructive",
      })
      router.push("/admin/blog")
    }
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPostData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditorChange = (content: string) => {
    setPostData((prev) => ({ ...prev, content }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPostData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (status: "draft" | "published") => {
    if (!postData.title || !postData.content || !postData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: status === "published" ? "Article publié!" : "Brouillon enregistré!",
        description:
          status === "published"
            ? "Votre article a été publié avec succès."
            : "Votre brouillon a été enregistré avec succès.",
      })

      setIsLoading(false)
      router.push("/admin/blog")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Modifier l'article</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={isLoading}>
            Enregistrer comme brouillon
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Publier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Titre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Entrez le titre de l'article"
                    value={postData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">
                    Extrait <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    placeholder="Entrez un court extrait de l'article"
                    rows={3}
                    value={postData.excerpt}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="editor">
                <TabsList className="mb-4">
                  <TabsTrigger value="editor">Éditeur</TabsTrigger>
                  <TabsTrigger value="preview">Aperçu</TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <BlogEditor onChange={handleEditorChange} initialContent={postData.content} />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose prose-lg max-w-none dark:prose-invert min-h-[300px] border rounded-md p-4">
                    {postData.content ? (
                      <div dangerouslySetInnerHTML={{ __html: postData.content }} />
                    ) : (
                      <p className="text-muted-foreground">L'aperçu apparaîtra ici...</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Paramètres de l'article</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Catégorie <span className="text-red-500">*</span>
                  </Label>
                  <Select value={postData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="Séparés par des virgules (ex: prière, foi, espoir)"
                    value={postData.tags}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={postData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Image à la une</h3>

              <div className="border-2 border-dashed rounded-md p-6 text-center">
                {postData.featuredImage ? (
                  <div className="space-y-4">
                    <div className="relative h-40 w-full bg-secondary/20 rounded-md overflow-hidden">
                      <img
                        src={postData.featuredImage || "/placeholder.svg"}
                        alt="Featured"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Changer l'image
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Glissez-déposez une image ou cliquez pour parcourir
                    </p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Parcourir
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
