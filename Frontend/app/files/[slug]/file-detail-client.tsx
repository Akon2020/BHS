"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, Search } from "lucide-react";

import { getPublicFileBySlug, getPublicFileDownloadUrl } from "@/actions/file";
import type { FichierRessource } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatSize = (size = 0) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} Ko`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Go`;
};

const toPublicDirectFileUrl = (chemin: string) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}/${chemin}`;
};

export default function FilePublicDetailPage({ slug }: { slug: string }) {
  const router = useRouter();

  const [resource, setResource] = useState<FichierRessource | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchResource = async () => {
    try {
      setLoading(true);
      const res = await getPublicFileBySlug(slug);
      setResource(res.fichier);
    } catch {
      router.push("/files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchResource();
  }, [slug]);

  const filteredFiles = useMemo(() => {
    if (!resource?.fichiers) return [];
    const q = search.toLowerCase().trim();
    return resource.fichiers.filter((item) => {
      if (!q) return true;
      return (
        item.nomOriginal.toLowerCase().includes(q) ||
        (item.typeMime || "").toLowerCase().includes(q)
      );
    });
  }, [resource, search]);

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/30 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/files">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{resource.nomReference}</h1>
          <Badge className="ml-2">
            {resource.modeAcces === "telechargement"
              ? "Téléchargeable"
              : "Lecture seule"}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détails de la ressource</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{resource.description}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-md border p-3 text-sm">
                <p className="text-muted-foreground">Catégorie</p>
                <p className="font-semibold">
                  {resource.categorie?.nomCategorie || "Sans catégorie"}
                </p>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <p className="text-muted-foreground">Nombre de fichiers</p>
                <p className="font-semibold">{resource.nombreFichiers}</p>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <p className="text-muted-foreground">Taille totale</p>
                <p className="font-semibold">
                  {formatSize(Number(resource.tailleTotale || 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-3">
            <CardTitle>Fichiers ({filteredFiles.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Filtrer les fichiers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Nom original</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead className="text-right">Action</TableHead>
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
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={toPublicDirectFileUrl(file.chemin)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Lire
                            </a>
                          </Button>

                          {resource.modeAcces === "telechargement" ? (
                            <Button size="sm" asChild>
                              <a
                                href={getPublicFileDownloadUrl(
                                  resource.slug,
                                  index,
                                )}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger
                              </a>
                            </Button>
                          ) : (
                            <Button size="sm" disabled>
                              Lecture seule
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Aucun fichier trouvé.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
