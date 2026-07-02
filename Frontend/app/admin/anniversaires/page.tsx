"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Cake, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import {
  getAnniversaires,
  createAnniversaire,
  updateAnniversaire,
  deleteAnniversaire,
  declencherVerificationAnniversaires,
} from "@/actions/anniversaire";
import type { Anniversaire } from "@/types/user";

const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const emptyForm = {
  nom: "",
  jour: "1",
  mois: "1",
  annee: "",
  email: "",
  delaiRappelJours: "3",
};

export default function AnniversairesPage() {
  const [items, setItems] = useState<Anniversaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Anniversaire | null>(null);
  const [toDelete, setToDelete] = useState<Anniversaire | null>(null);
  const [checking, setChecking] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getAnniversaires();
      setItems(res.anniversaires);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const buildPayload = (f: typeof emptyForm) => ({
    nom: f.nom.trim(),
    jour: Number(f.jour),
    mois: Number(f.mois),
    annee: f.annee ? Number(f.annee) : undefined,
    email: f.email.trim() || undefined,
    delaiRappelJours: Number(f.delaiRappelJours) || 3,
  });

  const handleAdd = async () => {
    if (!form.nom.trim()) {
      toast({ variant: "destructive", title: "Nom requis" });
      return;
    }
    try {
      setSaving(true);
      const a = await createAnniversaire(buildPayload(form));
      setItems((prev) => [...prev, a]);
      setForm(emptyForm);
      toast({ title: "Anniversaire ajouté" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      const updated = await updateAnniversaire(editing.idAnniversaire, {
        nom: editing.nom,
        jour: editing.jour,
        mois: editing.mois,
        annee: editing.annee,
        email: editing.email,
        delaiRappelJours: editing.delaiRappelJours,
      });
      setItems((prev) =>
        prev.map((x) =>
          x.idAnniversaire === updated.idAnniversaire ? updated : x,
        ),
      );
      setEditing(null);
      toast({ title: "Anniversaire mis à jour" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleActif = async (a: Anniversaire) => {
    try {
      const updated = await updateAnniversaire(a.idAnniversaire, {
        actif: !a.actif,
      });
      setItems((prev) =>
        prev.map((x) =>
          x.idAnniversaire === a.idAnniversaire ? { ...x, actif: updated.actif } : x,
        ),
      );
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteAnniversaire(toDelete.idAnniversaire);
      setItems((prev) =>
        prev.filter((x) => x.idAnniversaire !== toDelete.idAnniversaire),
      );
      toast({ title: "Anniversaire supprimé" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    }
  };

  const runCheck = async () => {
    try {
      setChecking(true);
      const msg = await declencherVerificationAnniversaires();
      toast({ title: "Vérification lancée", description: msg });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Anniversaires</h1>
          <p className="text-sm text-muted-foreground">
            Alerte le jour J (abonnés) et rappel en amont (admins).
          </p>
        </div>
        <Button
          variant="outline"
          onClick={runCheck}
          disabled={checking}
          className="w-full sm:w-auto"
        >
          <Play className="mr-2 h-4 w-4" />
          {checking ? "Vérification..." : "Lancer la vérification"}
        </Button>
      </div>

      {/* Ajout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-primary" />
            Ajouter un anniversaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Nom</Label>
              <Input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Jour</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={form.jour}
                onChange={(e) => setForm({ ...form, jour: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mois</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                value={form.mois}
                onChange={(e) => setForm({ ...form, mois: e.target.value })}
              >
                {MOIS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Rappel (j)</Label>
              <Input
                type="number"
                min="0"
                value={form.delaiRappelJours}
                onChange={(e) =>
                  setForm({ ...form, delaiRappelJours: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} disabled={saving} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Email (optionnel)</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Année de naissance (optionnel)</Label>
              <Input
                type="number"
                value={form.annee}
                onChange={(e) => setForm({ ...form, annee: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Rappel</TableHead>
              <TableHead>Actif</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Aucun anniversaire.
                </TableCell>
              </TableRow>
            ) : (
              items.map((a) => (
                <TableRow key={a.idAnniversaire}>
                  <TableCell>
                    <p className="font-medium">{a.nom}</p>
                    {a.email && (
                      <p className="text-xs text-muted-foreground">{a.email}</p>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {String(a.jour).padStart(2, "0")} {MOIS[a.mois - 1]}
                    {a.annee ? ` ${a.annee}` : ""}
                  </TableCell>
                  <TableCell>J-{a.delaiRappelJours}</TableCell>
                  <TableCell>
                    <Switch
                      checked={a.actif}
                      onCheckedChange={() => toggleActif(a)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing({ ...a })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(a)}
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

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'anniversaire</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={editing.nom}
                  onChange={(e) =>
                    setEditing({ ...editing, nom: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Jour</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={editing.jour}
                    onChange={(e) =>
                      setEditing({ ...editing, jour: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mois</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                    value={editing.mois}
                    onChange={(e) =>
                      setEditing({ ...editing, mois: Number(e.target.value) })
                    }
                  >
                    {MOIS.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Rappel (j)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editing.delaiRappelJours}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        delaiRappelJours: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email (optionnel)</Label>
                <Input
                  type="email"
                  value={editing.email || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, email: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? "..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer cet anniversaire ?"
        description="Cette action est irréversible."
      />
    </div>
  );
}
