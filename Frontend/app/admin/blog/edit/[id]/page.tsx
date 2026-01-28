"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getSingleBlog, updateBlog } from "@/actions/blog";
import { getAllCategories } from "@/actions/categorie";
import { Blog, Categorie } from "@/types/user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  ArrowLeft,
  Save,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import dynamic from "next/dynamic";

const BlogEditor = dynamic(() => import("@/components/admin/blog-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center border rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();

  const blogId = useMemo(() => {
    if (!params?.id) return null;
    const id = Number(params.id);
    return Number.isNaN(id) ? null : id;
  }, [params?.id]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<string>("");

  const [originalBlog, setOriginalBlog] = useState<Blog | null>(null);

  const [postData, setPostData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);


  const convertHtmlToText = useCallback((html: string) => {
    if (!html) return "";
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    
    const paragraphs = tempDiv.querySelectorAll("p");
    let text = "";
    
    paragraphs.forEach((p, index) => {
      text += p.textContent || "";
      if (index < paragraphs.length - 1) {
        text += "\n\n";
      }
    });
    
    text = text
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();
    
    return text || html;
  }, []);

  const convertTextToHtml = useCallback((text: string) => {
    if (!text) return "<p></p>";
    
    return text
      .split(/\n\s*\n/)
      .filter(p => p.trim())
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }, []);


  useEffect(() => {
    if (!blogId) {
      toast({
        title: "Erreur",
        description: "ID de blog invalide",
        variant: "destructive",
      });
      router.push("/admin/blog");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setCategoriesLoading(true);

        const [blogRes, catRes] = await Promise.allSettled([
          getSingleBlog(blogId),
          getAllCategories(),
        ]);

        if (blogRes.status === "rejected") {
          throw new Error("Impossible de charger l'article");
        }

        const blog = blogRes.value.blog;
        setOriginalBlog(blog);
        setCurrentImageUrl(blog.imageUne || null);
        setSelectedCategorie(String(blog.idCategorie || ""));

        setPostData({
          title: blog.titre || "",
          excerpt: blog.extrait || "",
          content: convertHtmlToText(blog.contenu || ""),
          tags: blog.tags || "",
        });

        if (catRes.status === "fulfilled") {
          setCategories(catRes.value.categories || []);
        }
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue",
          variant: "destructive",
        });
        router.push("/admin/blog");
      } finally {
        setIsLoading(false);
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, [blogId, convertHtmlToText, router]);


  useEffect(() => {
    if (!originalBlog) return;

    const htmlContent = convertTextToHtml(postData.content);
    
    const hasChanged = 
      postData.title !== originalBlog.titre ||
      postData.excerpt !== (originalBlog.extrait || "") ||
      htmlContent !== originalBlog.contenu ||
      postData.tags !== (originalBlog.tags || "") ||
      selectedCategorie !== String(originalBlog.idCategorie) ||
      imageFile !== null;

    setHasUnsavedChanges(hasChanged);
  }, [postData, selectedCategorie, imageFile, originalBlog, convertTextToHtml]);


  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setPostData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditorChange = useCallback((content: string) => {
    setPostData((prev) => ({ ...prev, content }));
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "Image trop volumineuse (max 5MB)",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Nettoyage
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = async (statut: "brouillon" | "publie") => {
    // Validation
    const errors: string[] = [];
    
    if (!postData.title.trim()) errors.push("Le titre est obligatoire");
    if (!postData.content.trim()) errors.push("Le contenu est obligatoire");
    if (!selectedCategorie) errors.push("La catégorie est obligatoire");

    if (errors.length > 0) {
      toast({
        title: "Erreur de validation",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateBlog(blogId!, {
        titre: postData.title.trim(),
        extrait: postData.excerpt.trim(),
        contenu: convertTextToHtml(postData.content),
        tags: postData.tags.trim(),
        statut,
        idCategorie: Number(selectedCategorie),
        imageUne: imageFile ?? undefined,
      });

      toast({
        title: "Succès",
        description: `Article ${statut === "publie" ? "publié" : "sauvegardé en brouillon"}`,
        variant: "default",
      });

      router.push("/admin/blog");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges && !confirm("Vous avez des modifications non sauvegardées. Quitter sans sauvegarder ?")) {
      return;
    }
    router.push("/admin/blog");
  }, [hasUnsavedChanges, router]);


  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement de l'article...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Modifier l'article
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {originalBlog?.titre}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasUnsavedChanges && (
            <Alert className="md:hidden border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Modifications non sauvegardées
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isSubmitting || !hasUnsavedChanges}
              onClick={() => handleSubmit("brouillon")}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Brouillon"
              )}
            </Button>
            <Button
              disabled={isSubmitting || !hasUnsavedChanges}
              onClick={() => handleSubmit("publie")}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Mettre à jour
            </Button>
          </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <Alert className="hidden md:flex items-center gap-2 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription>
            Vous avez des modifications non sauvegardées
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Titre *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={postData.title}
                  onChange={handleChange}
                  placeholder="Titre de l'article"
                  className="text-lg"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {postData.title.length}/200 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-base font-medium">
                  Extrait
                </Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={postData.excerpt}
                  onChange={handleChange}
                  placeholder="Brève description de l'article"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {postData.excerpt.length}/300 caractères
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor">Éditeur</TabsTrigger>
                  <TabsTrigger value="preview">Aperçu</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Contenu *
                    </Label>
                    <BlogEditor
                      key={blogId} // Key unique basée sur l'ID
                      initialContent={postData.content}
                      onChange={handleEditorChange}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Aperçu du contenu
                    </Label>
                    <div className="min-h-[400px] border rounded-lg p-6">
                      {postData.content ? (
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: convertTextToHtml(postData.content),
                          }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-10">
                          Aucun contenu à prévisualiser
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="categorie" className="text-base font-medium">
                  Catégorie *
                </Label>
                {categoriesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des catégories...
                  </div>
                ) : (
                  <Select
                    value={selectedCategorie}
                    onValueChange={setSelectedCategorie}
                    disabled={categories.length === 0}
                  >
                    <SelectTrigger id="categorie">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.idCategorie}
                          value={String(cat.idCategorie)}
                        >
                          {cat.nomCategorie}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {categories.length === 0 && !categoriesLoading && (
                  <p className="text-sm text-destructive">
                    Aucune catégorie disponible
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-base font-medium">
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={postData.tags}
                  onChange={handleChange}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-muted-foreground">
                  Séparez les tags par des virgules
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Image à la une
                </Label>
                
                <div className="space-y-4">
                  {/* Image actuelle */}
                  {currentImageUrl && !imagePreview && (
                    <div className="relative rounded-lg overflow-hidden border">
                      <Image
                        src={currentImageUrl}
                        alt="Image actuelle de l'article"
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Image actuelle
                      </div>
                    </div>
                  )}

                  {/* Nouvelle image */}
                  {imagePreview && (
                    <div className="relative rounded-lg overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Nouvelle image de l'article"
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        Nouvelle image
                      </div>
                    </div>
                  )}

                  {/* Pas d'image */}
                  {!currentImageUrl && !imagePreview && (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Aucune image sélectionnée
                      </p>
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {currentImageUrl ? "Changer l'image" : "Ajouter une image"}
                      </Button>
                      
                      {(currentImageUrl || imagePreview) && (
                        <Button
                          variant="outline"
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Formats supportés: JPG, PNG, WebP. Taille max: 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statut */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium">Statut de l'article</h3>
              <div className="flex items-center gap-2 text-sm">
                {originalBlog?.statut === "publie" ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Publié</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-600">Brouillon</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                ID: {blogId}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}