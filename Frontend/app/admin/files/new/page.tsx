"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  FileUp,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

import { getAllCategories } from "@/actions/categorie";
import { createFileResource } from "@/actions/file";
import type { Categorie } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatSize = (size = 0) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} Ko`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Go`;
};

export default function NewFileResourcePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [idCategorie, setIdCategorie] = useState("");
  const [nomReference, setNomReference] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("brouillon");
  const [modeAcces, setModeAcces] = useState("telechargement");
  const [datePublication, setDatePublication] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        setCategories(res.categories || []);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const totalSize = useMemo(
    () => files.reduce((acc, file) => acc + file.size, 0),
    [files],
  );

  const currentPreview = files[previewIndex];

  const onRefChange = (value: string) => {
    setNomReference(value);
    if (!slug) {
      setSlug(toSlug(value));
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
    setPreviewIndex(0);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const renderPreview = () => {
    if (!currentPreview) return null;

    const objectUrl = URL.createObjectURL(currentPreview);

    if (currentPreview.type.startsWith("image/")) {
      return (
        <img
          src={objectUrl}
          alt={currentPreview.name}
          className="h-full w-full object-contain"
        />
      );
    }

    if (currentPreview.type === "application/pdf") {
      return (
        <iframe title="Aperçu PDF" src={objectUrl} className="h-full w-full" />
      );
    }

    if (currentPreview.type.startsWith("video/")) {
      return (
        <video
          controls
          src={objectUrl}
          className="h-full w-full object-contain"
        />
      );
    }

    if (currentPreview.type.startsWith("audio/")) {
      return (
        <div className="flex h-full items-center justify-center p-4">
          <audio controls src={objectUrl} className="w-full" />
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <Eye className="mr-2 h-4 w-4" />
        Aperçu direct non disponible pour ce format.
      </div>
    );
  };

  const onSubmit = async () => {
    try {
      if (
        !nomReference.trim() ||
        !description.trim() ||
        !slug.trim() ||
        !idCategorie
      ) {
        toast({
          title: "Champs requis",
          description: "Nom, slug, catégorie et description sont obligatoires.",
          variant: "destructive",
        });
        return;
      }

      if (files.length === 0) {
        toast({
          title: "Fichiers requis",
          description: "Ajoutez au moins un fichier.",
          variant: "destructive",
        });
        return;
      }

      if (statut === "programme" && !datePublication) {
        toast({
          title: "Date requise",
          description:
            "Choisissez une date de publication pour le statut programmé.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("nomReference", nomReference.trim());
      formData.append("slug", toSlug(slug));
      formData.append("description", description.trim());
      formData.append("idCategorie", idCategorie);
      formData.append("statut", statut);
      formData.append("modeAcces", modeAcces);

      if (datePublication) {
        formData.append(
          "datePublication",
          new Date(datePublication).toISOString(),
        );
      }

      files.forEach((file) => formData.append("fichiers", file));

      await createFileResource(formData);

      toast({
        title: "Succès",
        description: "La ressource a été créée avec succès.",
      });

      router.push("/admin/files");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la ressource.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="relative p-0">
          <div className="bg-linear-to-r from-primary/95 via-primary/90 to-primary/70 p-6 text-primary-foreground md:p-7">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_60%)]" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    asChild
                    className="h-8 w-8 bg-white/20 text-white hover:bg-white/30"
                  >
                    <Link href="/admin/files">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <span className="inline-flex items-center rounded-md bg-white/20 px-2 py-1 text-xs">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Nouvelle ressource
                  </span>
                </div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Téléverser des fichiers
                </h1>
                <p className="text-sm text-white/90">
                  Ajoutez plusieurs fichiers, catégorisez-les et définissez le
                  mode d'accès côté public.
                </p>
              </div>

              <div className="rounded-lg bg-white/15 px-4 py-3 text-sm">
                <p className="text-white/80">Fichiers sélectionnés</p>
                <p className="text-xl font-bold">{files.length}</p>
                <p className="text-white/80">{formatSize(totalSize)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardContent className="grid gap-5 p-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nom de référence</Label>
              <Input
                value={nomReference}
                onChange={(e) => onRefChange(e.target.value)}
                placeholder="Ex: Dossier d'inscription 2026"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                placeholder="dossier-inscription-2026"
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={idCategorie} onValueChange={setIdCategorie}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
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
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={setStatut}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="publie">Publié</SelectItem>
                  <SelectItem value="programme">Programmé</SelectItem>
                  <SelectItem value="archive">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Mode d'accès côté client</Label>
              <Select value={modeAcces} onValueChange={setModeAcces}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telechargement">
                    Lecture et téléchargement
                  </SelectItem>
                  <SelectItem value="lecture">Lecture seule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statut === "programme" ? (
              <div className="space-y-2 md:col-span-2">
                <Label>Date de publication</Label>
                <Input
                  type="datetime-local"
                  value={datePublication}
                  onChange={(e) => setDatePublication(e.target.value)}
                />
              </div>
            ) : null}

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Décrivez le contenu et l'usage de cette ressource."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Fichier(s)</Label>
              <Input type="file" multiple onChange={onFileChange} />
              <p className="text-xs text-muted-foreground">
                Les types et tailles sont détectés automatiquement après upload.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm font-semibold">Aperçu & visionnage</p>

            {files.length ? (
              <>
                <div className="flex gap-2 overflow-auto pb-2">
                  {files.map((file, idx) => (
                    <Button
                      key={`${file.name}-${idx}`}
                      variant={previewIndex === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewIndex(idx)}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                </div>

                {currentPreview ? (
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-medium">
                        {currentPreview.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(previewIndex)}
                        className="h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentPreview.type || "type inconnu"} •{" "}
                      {formatSize(currentPreview.size)}
                    </p>
                  </div>
                ) : null}

                <div className="aspect-video overflow-hidden rounded-lg border bg-black/5">
                  {renderPreview()}
                </div>

                <div className="space-y-2 rounded-md border p-3 text-xs">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${file.size}-${idx}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="line-clamp-1">{file.name}</span>
                      <span className="text-muted-foreground">
                        {formatSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <UploadCloud className="mx-auto mb-2 h-6 w-6" />
                Sélectionnez un ou plusieurs fichiers pour voir l'aperçu.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/admin/files">Annuler</Link>
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="mr-2 h-4 w-4" />
          )}
          Enregistrer la ressource
        </Button>
      </div>
    </div>
  );
}
