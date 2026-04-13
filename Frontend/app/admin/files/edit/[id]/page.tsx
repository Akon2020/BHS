"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { getAllCategories } from "@/actions/categorie";
import { getSingleFile, updateFileResource } from "@/actions/file";
import type { Categorie, FichierRessource } from "@/types/user";
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

export default function EditFileResourcePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [resource, setResource] = useState<FichierRessource | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [idCategorie, setIdCategorie] = useState("");
  const [nomReference, setNomReference] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("brouillon");
  const [modeAcces, setModeAcces] = useState("telechargement");
  const [datePublication, setDatePublication] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const res = await getSingleFile(id);
      const item = res.fichier;
      setResource(item);
      setIdCategorie(String(item.idCategorie || ""));
      setNomReference(item.nomReference || "");
      setSlug(item.slug || "");
      setDescription(item.description || "");
      setStatut(item.statut || "brouillon");
      setModeAcces(item.modeAcces || "telechargement");
      setDatePublication(
        item.datePublication
          ? new Date(item.datePublication).toISOString().slice(0, 16)
          : "",
      );
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger la ressource.",
        variant: "destructive",
      });
      router.push("/admin/files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(id)) fetchResource();
  }, [id]);

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

  const totalNewSize = useMemo(
    () => newFiles.reduce((acc, file) => acc + file.size, 0),
    [newFiles],
  );

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewFiles(Array.from(event.target.files || []));
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
      formData.append(
        "datePublication",
        datePublication ? new Date(datePublication).toISOString() : "",
      );

      newFiles.forEach((file) => formData.append("fichiers", file));

      await updateFileResource(id, formData);

      toast({
        title: "Succès",
        description:
          newFiles.length > 0
            ? "La ressource a été mise à jour et les fichiers remplacés."
            : "La ressource a été mise à jour avec succès.",
      });

      router.push(`/admin/files/view/${id}`);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible de mettre à jour la ressource.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center">Chargement...</div>;
  }

  if (!resource) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/files">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier la ressource fichier</h1>
          <p className="text-sm text-muted-foreground">
            Modifiez les informations et remplacez les fichiers si nécessaire.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-5 p-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Nom de référence</Label>
            <Input
              value={nomReference}
              onChange={(e) => setNomReference(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
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
            />
          </div>

          <div className="rounded-md border p-3 md:col-span-2">
            <p className="mb-2 text-sm font-medium">Fichiers actuels</p>
            <div className="space-y-2">
              {resource.fichiers?.map((file, index) => (
                <div
                  key={`${file.nomStocke}-${index}`}
                  className="flex justify-between text-sm"
                >
                  <span className="line-clamp-1">{file.nomOriginal}</span>
                  <span className="text-muted-foreground">
                    {file.typeMime || "type inconnu"} •{" "}
                    {formatSize(file.taille)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Remplacer par de nouveaux fichiers (optionnel)</Label>
            <Input type="file" multiple onChange={onFileChange} />
            <p className="text-xs text-muted-foreground">
              {newFiles.length
                ? `${newFiles.length} nouveau(x) fichier(s) • ${formatSize(totalNewSize)}`
                : "Laissez vide pour conserver les fichiers actuels."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href={`/admin/files/view/${id}`}>Annuler</Link>
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
