"use client";

import type React from "react";
import { useState } from "react";
import { createBlog } from "@/actions/blog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, ImageIcon, Upload } from "lucide-react";
import Link from "next/link";
import BlogEditor from "@/components/admin/blog-editor";

export default function NewBlogPostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [postData, setPostData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
  });


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setPostData((prev) => ({ ...prev, content }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };


  const handleSubmit = async (status: "brouillon" | "publie") => {
    if (!postData.title || !postData.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createBlog({
        titre: postData.title,
        extrait: postData.excerpt,
        contenu: postData.content,
        tags: postData.tags,
        statut: status === "publie" ? "publie" : "brouillon",
        imageUne: imageFile ?? undefined,
        idCategorie: 1,
      });

      toast({
        title:
          status === "publie"
            ? "Article publié"
            : "Brouillon enregistré",
        description:
          status === "publie"
            ? "Votre article a été publié avec succès."
            : "Votre brouillon a été enregistré.",
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <Button
            variant="outline"
            onClick={() => handleSubmit("brouillon")}
            disabled={isLoading}
          >
            Enregistrer comme brouillon
          </Button>
          <Button
            onClick={() => handleSubmit("publie")}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Publier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
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
                <Label htmlFor="excerpt">Extrait</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Court extrait de l'article"
                  rows={3}
                  value={postData.excerpt}
                  onChange={handleChange}
                />
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
                      <div
                        dangerouslySetInnerHTML={{
                          __html: postData.content,
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        L'aperçu apparaîtra ici...
                      </p>
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
            <CardContent className="p-6 space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="prière, foi, espérance"
                value={postData.tags}
                onChange={handleChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Image à la une</h3>

              <label className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer block">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Cliquez pour sélectionner une image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button variant="outline" size="sm" type="button">
                  <Upload className="h-4 w-4 mr-2" />
                  Parcourir
                </Button>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
