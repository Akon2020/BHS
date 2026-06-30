"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Link2,
  Search,
} from "lucide-react";

import { getSingleFile } from "@/actions/file";
import type { FichierRessource } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

const formatSize = (size = 0) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} Ko`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Go`;
};

const toPublicFileUrl = (chemin: string) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}/${chemin}`;
};

export default function ViewFileResourcePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [resource, setResource] = useState<FichierRessource | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchResource = async () => {
    try {
      setLoading(true);
      const res = await getSingleFile(id);
      setResource(res.fichier);
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

  const filteredFiles = useMemo(() => {
    if (!resource?.fichiers) return [];
    const q = search.toLowerCase().trim();

    return resource.fichiers.filter((file) => {
      const matchesSearch =
        file.nomOriginal.toLowerCase().includes(q) ||
        (file.typeMime || "").toLowerCase().includes(q);

      const matchesType =
        typeFilter === "all"
          ? true
          : (file.typeMime || "").startsWith(typeFilter);

      return matchesSearch && matchesType;
    });
  }, [resource, search, typeFilter]);

  if (loading) {
    return <div className="py-12 text-center">Chargement...</div>;
  }

  if (!resource) return null;

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/files/${resource.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/admin/files">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">
              {resource.nomReference}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              Slug: {resource.slug}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/files/edit/${resource.idFichier}`}>
              Modifier
            </Link>
          </Button>
          <Badge>{resource.statut}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Nombre de fichiers</p>
            <p className="text-3xl font-bold">{resource.nombreFichiers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Taille totale</p>
            <p className="text-3xl font-bold">
              {formatSize(Number(resource.tailleTotale || 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Date de création</p>
            <p className="text-sm font-semibold">
              {new Date(resource.createdAt).toLocaleString("fr-FR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Publication</p>
            <p className="text-sm font-semibold">
              {resource.datePublication
                ? new Date(resource.datePublication).toLocaleString("fr-FR")
                : "Non définie"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{resource.description}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Badge variant="secondary" className="w-fit">
              <Link2 className="mr-1 h-3 w-3" />
              Lien public client
            </Badge>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              {publicUrl}
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Fichiers téléchargeables ({filteredFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Rechercher un fichier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="text">Texte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Nom fichier</TableHead>
                  <TableHead>Type MIME</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Chemin</TableHead>
                  <TableHead className="text-right">Télécharger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file, index) => (
                  <TableRow key={`${file.nomStocke}-${index}`}>
                    <TableCell className="font-medium">
                      {file.nomOriginal}
                    </TableCell>
                    <TableCell>{file.typeMime || "inconnu"}</TableCell>
                    <TableCell>{formatSize(file.taille)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {file.chemin}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button size="sm" asChild>
                          <a
                            href={toPublicFileUrl(file.chemin)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Aucun fichier ne correspond aux filtres.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
