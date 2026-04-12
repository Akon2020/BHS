"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";

import { createFileResource } from "@/actions/file";
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

  const [nomReference, setNomReference] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("brouillon");
  const [datePublication, setDatePublication] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSize = useMemo(
    () => files.reduce((acc, file) => acc + file.size, 0),
    [files],
  );

  const onRefChange = (value: string) => {
    setNomReference(value);
    if (!slug) {
      setSlug(toSlug(value));
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
  };

  const onSubmit = async () => {
    try {
      if (!nomReference.trim() || !description.trim() || !slug.trim()) {
        toast({
          title: "Champs requis",
          description: "Nom, slug et description sont obligatoires.",
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
      formData.append("statut", statut);
      if (datePublication) {
        formData.append(
          "datePublication",
          new Date(datePublication).toISOString(),
        );
      }

      files.forEach((file) => {
        formData.append("fichiers", file);
      });

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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/files">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle ressource fichier</h1>
          <p className="text-sm text-muted-foreground">
            Uploadez un ou plusieurs fichiers et publiez-les sur la partie
            client.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-5 p-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Nom de référence</Label>
            <Input
              value={nomReference}
              onChange={(e) => onRefChange(e.target.value)}
              placeholder="Ex: Dossier d'inscription 2026"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              placeholder="dossier-inscription-2026"
            />
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
              {files.length} fichier(s) sélectionné(s) • {formatSize(totalSize)}
            </p>
          </div>

          {files.length ? (
            <div className="rounded-md border p-3 md:col-span-2">
              <p className="mb-2 text-sm font-medium">Aperçu des fichiers</p>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="line-clamp-1">{file.name}</span>
                    <span className="text-muted-foreground">
                      {file.type || "type inconnu"} • {formatSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
