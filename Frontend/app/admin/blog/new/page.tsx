"use client"

import type React from "react"

import { useState } from "react"
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

// Catégories pour le filtre
const categories = ["Spiritualité", "Étude Biblique", "Communauté", "Témoignages", "Louange", "Famille"]

export default function NewBlogPostPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [postData, setPostData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    featuredImage: null,
  })

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
          <h1 className="text-3xl font-bold">Nouvel Article</h1>
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
                  <BlogEditor onChange={handleEditorChange} />
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
                  <Select onValueChange={(value) => handleSelectChange("category", value)}>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Image à la une</h3>

              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Glissez-déposez une image ou cliquez pour parcourir
                </p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Parcourir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
