"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  FileArchive,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { getAllCategories } from "@/actions/categorie";
import {
  deleteFileResource,
  getAdminFileDownloadUrl,
  getAllFiles,
} from "@/actions/file";
import type { Categorie, FichierRessource } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

const formatSize = (size = 0) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} Ko`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Go`;
};

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FichierRessource[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("all");
  const [selectedCategorie, setSelectedCategorie] = useState("all");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<FichierRessource | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await getAllFiles({
        search: search || undefined,
        statut: statut !== "all" ? statut : undefined,
        idCategorie:
          selectedCategorie !== "all" ? Number(selectedCategorie) : undefined,
      });
      setFiles(res.fichiers || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les fichiers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [statut, selectedCategorie]);

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return files.filter((item) => {
      if (!q) return true;
      return (
        item.nomReference.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [files, search]);

  const stats = useMemo(
    () => ({
      total: files.length,
      publies: files.filter((f) => f.statut === "publie").length,
      programmes: files.filter((f) => f.statut === "programme").length,
      archives: files.filter((f) => f.statut === "archive").length,
      totalItems: files.reduce((acc, f) => acc + (f.nombreFichiers || 0), 0),
    }),
    [files],
  );

  const getBadge = (s: string) => {
    if (s === "publie") return <Badge>Publié</Badge>;
    if (s === "programme") return <Badge variant="secondary">Programmé</Badge>;
    if (s === "archive") return <Badge variant="outline">Archivé</Badge>;
    return <Badge variant="outline">Brouillon</Badge>;
  };

  const openDelete = (item: FichierRessource) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deleteFileResource(selected.idFichier);
      toast({
        title: "Ressource supprimée",
        description: "Les fichiers ont été supprimés avec succès.",
      });
      setDeleteOpen(false);
      setSelected(null);
      await fetchFiles();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Suppression impossible.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Gestion des fichiers</h1>
        <Button asChild>
          <Link href="/admin/files/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle ressource
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total ressources</p>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Publiées</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats.publies}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Programmées</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {stats.programmes}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Archivées</p>
          <p className="mt-2 text-3xl font-bold text-slate-600">
            {stats.archives}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Fichiers totaux</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {stats.totalItems}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, slug ou description..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="publie">Publié</SelectItem>
            <SelectItem value="programme">Programmé</SelectItem>
            <SelectItem value="archive">Archivé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.idCategorie} value={String(cat.idCategorie)}>
                {cat.nomCategorie}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchFiles}>
          Rafraîchir
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Ressource</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Fichiers</TableHead>
              <TableHead>Taille</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Aucune ressource trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.idFichier} className="hover:bg-muted/30">
                  <TableCell>
                    <p className="font-medium">{item.nomReference}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.categorie?.nomCategorie || "Sans catégorie"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getBadge(item.statut)}</TableCell>
                  <TableCell>{item.nombreFichiers}</TableCell>
                  <TableCell>
                    {formatSize(Number(item.tailleTotale || 0))}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/files/view/${item.idFichier}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/files/edit/${item.idFichier}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      {item.fichiers?.[0]?.chemin ? (
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={getAdminFileDownloadUrl(item.idFichier, 0)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : null}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => openDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette ressource</DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement la ressource et tous ses
              fichiers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              <FileArchive className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
