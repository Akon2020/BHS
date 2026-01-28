"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBlog } from "@/actions/blog";
import { getAllCategories } from "@/actions/categorie";
import { Categorie } from "@/types/user";
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
import { ArrowLeft, Save, ImageIcon, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import BlogEditor from "@/components/admin/blog-editor";
import Image from "next/image";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(
    null,
  );
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const [postData, setPostData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const res = await getAllCategories();
        setCategories(res.categories);
      } catch (error: any) {
        console.error("Erreur lors du chargement des catégories:", error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger les catégories",
          variant: "destructive",
        });
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setPostData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleEditorChange = useCallback((content: string) => {
    setPostData((prev) => ({ ...prev, content }));
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      // Validation de la taille (5MB max)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 5MB",
          variant: "destructive",
        });
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Format non supporté",
          description: "Formats acceptés: JPG, PNG, WebP, GIF",
          variant: "destructive",
        });
        return;
      }

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    },
    [imagePreview],
  );

  const handleRemoveImage = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imagePreview]);

  const handleCategorieChange = useCallback((value: string) => {
    setSelectedCategorie(value === "" ? null : Number(value));
  }, []);

  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!postData.title.trim()) {
      errors.push("Le titre est obligatoire");
    }

    if (!postData.content.trim()) {
      errors.push("Le contenu est obligatoire");
    }

    if (!selectedCategorie) {
      errors.push("La catégorie est obligatoire");
    }

    if (postData.title.length > 200) {
      errors.push("Le titre ne doit pas dépasser 200 caractères");
    }

    if (postData.excerpt.length > 500) {
      errors.push("L'extrait ne doit pas dépasser 500 caractères");
    }

    return errors;
  }, [postData.title, postData.content, postData.excerpt, selectedCategorie]);

  const handleSubmit = useCallback(
    async (status: "brouillon" | "publie") => {
      const errors = validateForm();

      if (errors.length > 0) {
        toast({
          title: "Erreur de validation",
          description: errors.join(". "),
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      setIsSubmitting(true);

      try {
        const formData = new FormData();
        formData.append("titre", postData.title.trim());
        formData.append("extrait", postData.excerpt.trim());
        formData.append("contenu", postData.content);
        formData.append("tags", postData.tags.trim());
        formData.append("statut", status === "publie" ? "publie" : "brouillon");
        formData.append("idCategorie", selectedCategorie!.toString());

        if (imageFile) {
          formData.append("imageUne", imageFile);
        }

        const result = await createBlog(formData);

        toast({
          title:
            status === "publie" ? "Article publié" : "Brouillon enregistré",
          description:
            status === "publie"
              ? "Votre article a été publié avec succès."
              : "Votre brouillon a été enregistré.",
        });

        // Rediriger vers la liste des articles après un délai
        setTimeout(() => {
          router.push("/admin/blog");
          router.refresh();
        }, 1500);
      } catch (error: any) {
        console.error("Erreur lors de la création de l'article:", error);

        let errorMessage = "Une erreur est survenue lors de l'enregistrement";
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    },
    [postData, selectedCategorie, imageFile, validateForm, router],
  );

  const handleTriggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Empêcher la navigation si des modifications non sauvegardées
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (postData.title || postData.content || imageFile) {
        e.preventDefault();
        e.returnValue =
          "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [postData.title, postData.content, imageFile]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nouvel Article
            </h1>
            <p className="text-sm text-muted-foreground">
              Créez et publiez un nouvel article sur votre blog
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("brouillon")}
            disabled={isLoading || isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting && status === "brouillon" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer comme brouillon"
            )}
          </Button>
          <Button
            onClick={() => handleSubmit("publie")}
            disabled={isLoading || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting && status === "publie" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Publier
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Titre et extrait */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">
                  Titre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Entrez le titre de l'article"
                  value={postData.title}
                  onChange={handleChange}
                  maxLength={200}
                  className="text-lg"
                  disabled={isLoading}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {postData.title.length}/200 caractères
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-base">
                  Extrait
                </Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Un court extrait qui résume votre article (visible dans les listes)"
                  rows={3}
                  value={postData.excerpt}
                  onChange={handleChange}
                  maxLength={500}
                  disabled={isLoading}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {postData.excerpt.length}/500 caractères
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Éditeur / Aperçu */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="editor">
                <TabsList className="mb-4">
                  <TabsTrigger value="editor" disabled={isLoading}>
                    Éditeur
                  </TabsTrigger>
                  <TabsTrigger value="preview" disabled={isLoading}>
                    Aperçu
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-0">
                  <BlogEditor
                    initialContent={postData.content}
                    onChange={handleEditorChange}
                    disabled={isLoading}
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <div className="prose prose-lg max-w-none dark:prose-invert min-h-[400px] border rounded-md p-4">
                    {postData.content ? (
                      <div
                        className="whitespace-pre-line"
                        style={{
                          whiteSpace: "pre-line",
                          wordBreak: "break-word",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: postData.content
                            .replace(/\n/g, "<br>")
                            .replace(/\\n/g, "<br>")
                            .replace(/<\/p><p>/g, "</p>\n<p>"),
                        }}
                      />
                    ) : (
                      <div className="h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          Écrivez quelque chose dans l'éditeur pour voir
                          l'aperçu ici
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Catégorie */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-base">
                  Catégorie <span className="text-destructive">*</span>
                </Label>
                {isCategoriesLoading ? (
                  <div className="flex items-center justify-center h-10 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Chargement des catégories...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={selectedCategorie ? String(selectedCategorie) : ""}
                    onValueChange={handleCategorieChange}
                    disabled={isLoading || categories.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          categories.length === 0
                            ? "Aucune catégorie disponible"
                            : "Choisir une catégorie"
                        }
                      />
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
                {categories.length === 0 && !isCategoriesLoading && (
                  <p className="text-sm text-destructive">
                    Aucune catégorie disponible. Veuillez en créer une d'abord.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-base">
                  Mots-clés
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="prière, foi, espérance, évangile"
                  value={postData.tags}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Séparez les mots-clés par des virgules
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Image à la une */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Image à la une</h3>

              {/* Aperçu de l'image */}
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={imagePreview}
                      alt="Aperçu de l'image à la une"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Supprimer l'image</span>
                    </Button>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium truncate">{imageFile?.name}</p>
                    <p className="text-muted-foreground">
                      {(imageFile?.size ? imageFile.size / 1024 : 0).toFixed(1)}{" "}
                      KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTriggerFileInput}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Changer l'image
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label
                    htmlFor="image-upload"
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
                      transition-colors flex flex-col items-center justify-center
                      hover:border-primary hover:bg-primary/5
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      ou glissez-déposez
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Parcourir
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground text-center">
                    Formats: JPG, PNG, WebP, GIF • Max: 5MB
                  </p>
                </div>
              )}

              {/* Input file caché */}
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          {/* Informations */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-medium">Informations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Les champs marqués d'un * sont obligatoires</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>
                    Enregistrez en brouillon pour travailler plus tard
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>L'image à la une est recommandée mais optionnelle</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
