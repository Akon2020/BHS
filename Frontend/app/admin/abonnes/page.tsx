"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";

import {
  addAbonne,
  deleteAbonne,
  getAllAbonnes,
  updateAbonne,
  type Abonne,
} from "@/actions/abonne";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

type AbonneStatutFilter = "all" | "actif" | "inactif" | "desabonne";

const emptyForm = { nomComplet: "", email: "" };

export default function AdminAbonnesPage() {
  const [abonnes, setAbonnes] = useState<Abonne[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<AbonneStatutFilter>("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [selectedAbonne, setSelectedAbonne] = useState<Abonne | null>(null);

  const fetchAbonnes = async () => {
    try {
      setIsLoading(true);
      const res = await getAllAbonnes();
      setAbonnes(res.abonnes || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les abonnés.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbonnes();
  }, []);

  const filteredAbonnes = useMemo(() => {
    const q = search.toLowerCase().trim();

    return abonnes.filter((abonne) => {
      const matchSearch =
        abonne.nomComplet.toLowerCase().includes(q) ||
        abonne.email.toLowerCase().includes(q);

      const matchStatut =
        statutFilter === "all" ? true : abonne.statut === statutFilter;

      return matchSearch && matchStatut;
    });
  }, [abonnes, search, statutFilter]);

  const stats = useMemo(
    () => ({
      total: abonnes.length,
      actifs: abonnes.filter((a) => a.statut === "actif").length,
      inactifs: abonnes.filter((a) => a.statut === "inactif").length,
      desabonnes: abonnes.filter((a) => a.statut === "desabonne").length,
    }),
    [abonnes],
  );

  const openEditModal = (abonne: Abonne) => {
    setSelectedAbonne(abonne);
    setEditForm({ nomComplet: abonne.nomComplet, email: abonne.email });
    setEditOpen(true);
  };

  const openDeleteModal = (abonne: Abonne) => {
    setSelectedAbonne(abonne);
    setDeleteOpen(true);
  };

  const handleAdd = async () => {
    try {
      if (!addForm.nomComplet.trim() || !addForm.email.trim()) {
        toast({
          title: "Champs requis",
          description: "Veuillez renseigner le nom complet et l'email.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmittingAdd(true);
      await addAbonne({
        nomComplet: addForm.nomComplet.trim(),
        email: addForm.email.trim(),
      });

      toast({
        title: "Abonné ajouté",
        description: "Le nouvel abonné a bien été enregistré.",
      });

      setAddOpen(false);
      setAddForm(emptyForm);
      await fetchAbonnes();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter cet abonné.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedAbonne) return;

      if (!editForm.nomComplet.trim() || !editForm.email.trim()) {
        toast({
          title: "Champs requis",
          description: "Veuillez renseigner le nom complet et l'email.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmittingEdit(true);
      await updateAbonne(selectedAbonne.idAbonne, {
        nomComplet: editForm.nomComplet.trim(),
        email: editForm.email.trim(),
      });

      toast({
        title: "Abonné modifié",
        description: "Les informations ont bien été mises à jour.",
      });

      setEditOpen(false);
      setSelectedAbonne(null);
      await fetchAbonnes();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier cet abonné.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedAbonne) return;

      setIsDeleting(true);
      await deleteAbonne(selectedAbonne.idAbonne);

      toast({
        title: "Abonné supprimé",
        description: "L'abonné a été supprimé avec succès.",
      });

      setDeleteOpen(false);
      setSelectedAbonne(null);
      await fetchAbonnes();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer cet abonné.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (statut: Abonne["statut"]) => {
    if (statut === "actif") return <Badge variant="default">Actif</Badge>;
    if (statut === "inactif") return <Badge variant="outline">Inactif</Badge>;
    return <Badge variant="secondary">Désabonné</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Gestion des abonnés newsletter</h1>

        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un abonné
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Total
          </p>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4 text-green-600" />
            Actifs
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats.actifs}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-amber-600" />
            Inactifs
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {stats.inactifs}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserX className="h-4 w-4 text-slate-600" />
            Désabonnés
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-600">
            {stats.desabonnes}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="pl-9"
          />
        </div>

        <Select
          value={statutFilter}
          onValueChange={(value: AbonneStatutFilter) => setStatutFilter(value)}
        >
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actifs</SelectItem>
            <SelectItem value="inactif">Inactifs</SelectItem>
            <SelectItem value="desabonne">Désabonnés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAbonnes.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Aucun abonné trouvé.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nom complet</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'abonnement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAbonnes.map((abonne) => (
                <TableRow key={abonne.idAbonne} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    {abonne.nomComplet}
                  </TableCell>
                  <TableCell>{abonne.email}</TableCell>
                  <TableCell>{getStatusBadge(abonne.statut)}</TableCell>
                  <TableCell>
                    {abonne.dateAbonnement
                      ? new Date(abonne.dateAbonnement).toLocaleString("fr-FR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" asChild>
                        <Link href={`/admin/abonnes/view/${abonne.idAbonne}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => openEditModal(abonne)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => openDeleteModal(abonne)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un abonné</DialogTitle>
            <DialogDescription>
              Renseignez les informations du nouvel abonné à la newsletter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Nom complet"
              value={addForm.nomComplet}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, nomComplet: e.target.value }))
              }
            />
            <Input
              type="email"
              placeholder="Adresse email"
              value={addForm.email}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={isSubmittingAdd}
            >
              Annuler
            </Button>
            <Button onClick={handleAdd} disabled={isSubmittingAdd}>
              {isSubmittingAdd ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un abonné</DialogTitle>
            <DialogDescription>
              Mettez à jour le nom et/ou l'adresse email de l'abonné.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Nom complet"
              value={editForm.nomComplet}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, nomComplet: e.target.value }))
              }
            />
            <Input
              type="email"
              placeholder="Adresse email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isSubmittingEdit}
            >
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={isSubmittingEdit}>
              {isSubmittingEdit ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'abonné</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer {selectedAbonne?.nomComplet} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
