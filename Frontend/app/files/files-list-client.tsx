"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Eye, FileText, Search } from "lucide-react";

import { getAllCategories } from "@/actions/categorie";
import { getPublicFileDownloadUrl, getPublicFiles } from "@/actions/file";
import type { Categorie, FichierRessource } from "@/types/user";
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
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const formatSize = (size = 0) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} Ko`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Go`;
};

export default function FilesPublicPage() {
  const [files, setFiles] = useState<FichierRessource[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filesRes, catRes] = await Promise.all([
        getPublicFiles({
          search: search || undefined,
          idCategorie:
            selectedCategorie !== "all" ? Number(selectedCategorie) : undefined,
        }),
        getAllCategories(),
      ]);

      setFiles(filesRes.fichiers || []);
      setCategories(catRes.categories || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategorie]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return files.filter((item) => {
      if (!q) return true;
      return (
        item.nomReference.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      );
    });
  }, [files, search]);

  return (
    <div className="flex flex-col">
      <Header />
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8 rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur">
            <h1 className="text-3xl font-bold tracking-tight">
              Ressources téléchargeables
            </h1>
            <p className="mt-2 text-muted-foreground">
              Accédez aux documents et médias publiés par catégorie, puis
              consultez en lecture ou téléchargez selon l'accès autorisé.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_260px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Rechercher un fichier..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select
                value={selectedCategorie}
                onValueChange={setSelectedCategorie}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
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

              <Button variant="outline" onClick={fetchData}>
                Rafraîchir
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
              Aucune ressource disponible.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <Card
                  key={item.idFichier}
                  className="overflow-hidden border-border/70 shadow-sm"
                >
                  <CardHeader className="space-y-3 border-b bg-muted/20">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">
                        {item.categorie?.nomCategorie || "Sans catégorie"}
                      </Badge>
                      <Badge>
                        {item.modeAcces === "telechargement"
                          ? "Téléchargeable"
                          : "Lecture seule"}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-xl">
                      {item.nomReference}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 p-5">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="rounded-md border p-2">
                        <p>Fichiers</p>
                        <p className="text-base font-semibold text-foreground">
                          {item.nombreFichiers}
                        </p>
                      </div>
                      <div className="rounded-md border p-2">
                        <p>Taille</p>
                        <p className="text-base font-semibold text-foreground">
                          {formatSize(Number(item.tailleTotale || 0))}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/files/${item.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ouvrir
                        </Link>
                      </Button>

                      {item.modeAcces === "telechargement" &&
                      item.fichiers?.length ? (
                        <Button asChild variant="outline" className="flex-1">
                          <a
                            href={getPublicFileDownloadUrl(item.slug, 0)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </a>
                        </Button>
                      ) : (
                        <Button disabled variant="outline" className="flex-1">
                          <FileText className="mr-2 h-4 w-4" />
                          Lecture
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
