"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import {
  getTemoignages,
  createTemoignage,
  updateTemoignage,
  deleteTemoignage,
} from "@/actions/temoignage";
import type { Temoignage } from "@/types/user";

const photoUrl = (photo?: string | null) =>
  photo ? `${process.env.NEXT_PUBLIC_API_URL}/${photo}` : undefined;

const emptyForm = {
  auteur: "",
  fonction: "",
  contenu: "",
  statut: "brouillon",
  ordre: "0",
};

export default function TemoignagesPage() {
  const [items, setItems] = useState<Temoignage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Temoignage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Temoignage | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getTemoignages();
      setItems(res.temoignages);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Chargement impossible.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPhoto(null);
    setOpen(true);
  };

  const openEdit = (t: Temoignage) => {
    setEditing(t);
    setForm({
      auteur: t.auteur,
      fonction: t.fonction || "",
      contenu: t.contenu,
      statut: t.statut,
      ordre: String(t.ordre ?? 0),
    });
    setPhoto(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.auteur.trim() || !form.contenu.trim()) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "L'auteur et le contenu sont requis.",
      });
      return;
    }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("auteur", form.auteur.trim());
      fd.append("fonction", form.fonction.trim());
      fd.append("contenu", form.contenu.trim());
      fd.append("statut", form.statut);
      fd.append("ordre", form.ordre || "0");
      if (photo) fd.append("image", photo);

      if (editing) {
        await updateTemoignage(editing.idTemoignage, fd);
        toast({ title: "Témoignage mis à jour" });
      } else {
        await createTemoignage(fd);
        toast({ title: "Témoignage créé" });
      }
      setOpen(false);
      fetchItems();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Enregistrement impossible.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTemoignage(toDelete.idTemoignage);
      toast({ title: "Témoignage supprimé" });
      fetchItems();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Suppression impossible.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Témoignages</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les témoignages affichés sur la page d'accueil.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau témoignage
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Auteur</TableHead>
              <TableHead>Témoignage</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  Aucun témoignage. Cliquez sur « Nouveau témoignage ».
                </TableCell>
              </TableRow>
            ) : (
              items.map((t) => (
                <TableRow key={t.idTemoignage}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="shrink-0">
                        <AvatarImage
                          src={photoUrl(t.photo)}
                          alt={t.auteur}
                          className="object-cover"
                        />
                        <AvatarFallback>{t.auteur.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium">{t.auteur}</p>
                        {t.fonction && (
                          <p className="truncate text-xs text-muted-foreground">
                            {t.fonction}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {t.contenu}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={t.statut === "publie" ? "default" : "secondary"}
                    >
                      {t.statut === "publie" ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell>{t.ordre}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(t)}
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(t)}
                        aria-label="Supprimer"
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

      {/* Dialog création / édition */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5 text-primary" />
              {editing ? "Modifier le témoignage" : "Nouveau témoignage"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="auteur">
                  Auteur <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="auteur"
                  value={form.auteur}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, auteur: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fonction">Fonction / ancienneté</Label>
                <Input
                  id="fonction"
                  placeholder="Ex. Membre depuis 2018"
                  value={form.fonction}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fonction: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contenu">
                Témoignage <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="contenu"
                rows={5}
                value={form.contenu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contenu: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={form.statut}
                  onValueChange={(v) => setForm((f) => ({ ...f, statut: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ordre">Ordre d'affichage</Label>
                <Input
                  id="ordre"
                  type="number"
                  value={form.ordre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ordre: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo (optionnel)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
              {editing?.photo && !photo && (
                <p className="text-xs text-muted-foreground">
                  Une photo est déjà associée. Sélectionnez-en une nouvelle pour
                  la remplacer.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : editing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer ce témoignage ?"
        description="Cette action est irréversible."
      />
    </div>
  );
}
