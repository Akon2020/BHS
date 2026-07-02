"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Check,
  X,
  CalendarClock,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  getParametreAgenda,
  updateParametreAgenda,
  getCreneaux,
  createCreneau,
  deleteCreneau,
  updateCreneau,
  getRendezVous,
  updateStatutRdv,
  deleteRdv,
} from "@/actions/agenda";
import type {
  CreneauRdv,
  ParametreAgenda,
  RdvStatut,
  RendezVous,
} from "@/types/user";

const STATUT: Record<RdvStatut, { label: string; variant: any }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  approuve: { label: "Approuvé", variant: "default" },
  refuse: { label: "Refusé", variant: "destructive" },
  reprogramme: { label: "Reprogrammé", variant: "outline" },
};

export default function AgendaAdminPage() {
  const [param, setParam] = useState<ParametreAgenda | null>(null);
  const [savingParam, setSavingParam] = useState(false);
  const [creneaux, setCreneaux] = useState<CreneauRdv[]>([]);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<string>("all");

  const [newCreneau, setNewCreneau] = useState({
    date: "",
    heureDebut: "",
    heureFin: "",
    capacite: "1",
  });
  const [addingCreneau, setAddingCreneau] = useState(false);
  const [creneauToDelete, setCreneauToDelete] = useState<CreneauRdv | null>(
    null,
  );

  const [reproFor, setReproFor] = useState<RendezVous | null>(null);
  const [repro, setRepro] = useState({
    date: "",
    heureDebut: "",
    heureFin: "",
    note: "",
  });
  const [rdvToDelete, setRdvToDelete] = useState<RendezVous | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [p, c, r] = await Promise.all([
        getParametreAgenda(),
        getCreneaux(),
        getRendezVous(filtre),
      ]);
      setParam(p);
      setCreneaux(c.creneaux);
      setRdvs(r.rendezVous);
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
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  const saveParam = async () => {
    if (!param) return;
    try {
      setSavingParam(true);
      const updated = await updateParametreAgenda({
        coordinateurNom: param.coordinateurNom,
        coordinateurFonction: param.coordinateurFonction,
        message: param.message,
      });
      setParam(updated);
      toast({ title: "Paramètres enregistrés" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    } finally {
      setSavingParam(false);
    }
  };

  const addCreneau = async () => {
    if (!newCreneau.date || !newCreneau.heureDebut || !newCreneau.heureFin) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Date, heure de début et de fin sont requises.",
      });
      return;
    }
    try {
      setAddingCreneau(true);
      const c = await createCreneau({
        date: newCreneau.date,
        heureDebut: newCreneau.heureDebut,
        heureFin: newCreneau.heureFin,
        capacite: Number(newCreneau.capacite) || 1,
      });
      setCreneaux((prev) => [...prev, { ...c, reste: c.capacite }]);
      setNewCreneau({ date: "", heureDebut: "", heureFin: "", capacite: "1" });
      toast({ title: "Créneau ajouté" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    } finally {
      setAddingCreneau(false);
    }
  };

  const toggleCreneau = async (c: CreneauRdv) => {
    try {
      const updated = await updateCreneau(c.idCreneau, { actif: !c.actif });
      setCreneaux((prev) =>
        prev.map((x) =>
          x.idCreneau === c.idCreneau ? { ...x, actif: updated.actif } : x,
        ),
      );
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    }
  };

  const removeCreneau = async () => {
    if (!creneauToDelete) return;
    try {
      await deleteCreneau(creneauToDelete.idCreneau);
      setCreneaux((prev) =>
        prev.filter((x) => x.idCreneau !== creneauToDelete.idCreneau),
      );
      toast({ title: "Créneau supprimé" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    }
  };

  const setStatut = async (rdv: RendezVous, statut: RdvStatut) => {
    try {
      const updated = await updateStatutRdv(rdv.idRendezVous, { statut });
      setRdvs((prev) =>
        prev.map((x) =>
          x.idRendezVous === rdv.idRendezVous ? { ...x, ...updated } : x,
        ),
      );
      toast({ title: "Rendez-vous mis à jour" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    }
  };

  const openRepro = (rdv: RendezVous) => {
    setReproFor(rdv);
    setRepro({
      date: rdv.date,
      heureDebut: rdv.heureDebut?.slice(0, 5) || "",
      heureFin: rdv.heureFin?.slice(0, 5) || "",
      note: rdv.note || "",
    });
  };

  const saveRepro = async () => {
    if (!reproFor) return;
    try {
      const updated = await updateStatutRdv(reproFor.idRendezVous, {
        statut: "reprogramme",
        date: repro.date,
        heureDebut: repro.heureDebut,
        heureFin: repro.heureFin || undefined,
        note: repro.note || undefined,
      });
      setRdvs((prev) =>
        prev.map((x) =>
          x.idRendezVous === reproFor.idRendezVous ? { ...x, ...updated } : x,
        ),
      );
      setReproFor(null);
      toast({ title: "Rendez-vous reprogrammé" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    }
  };

  const removeRdv = async () => {
    if (!rdvToDelete) return;
    try {
      await deleteRdv(rdvToDelete.idRendezVous);
      setRdvs((prev) =>
        prev.filter((x) => x.idRendezVous !== rdvToDelete.idRendezVous),
      );
      toast({ title: "Rendez-vous supprimé" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error?.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Agenda / Rendez-vous</h1>
        <p className="text-sm text-muted-foreground">
          Configurez le coordinateur, les créneaux, et gérez les demandes de RDV.
        </p>
      </div>

      {/* Coordinateur */}
      <Card>
        <CardHeader>
          <CardTitle>Coordinateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {param && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nom du coordinateur</Label>
                  <Input
                    value={param.coordinateurNom}
                    onChange={(e) =>
                      setParam({ ...param, coordinateurNom: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fonction</Label>
                  <Input
                    value={param.coordinateurFonction || ""}
                    onChange={(e) =>
                      setParam({
                        ...param,
                        coordinateurFonction: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message (page publique)</Label>
                <Textarea
                  rows={2}
                  value={param.message || ""}
                  onChange={(e) =>
                    setParam({ ...param, message: e.target.value })
                  }
                />
              </div>
              <Button onClick={saveParam} disabled={savingParam}>
                <Save className="mr-2 h-4 w-4" />
                {savingParam ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Créneaux */}
      <Card>
        <CardHeader>
          <CardTitle>Créneaux disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={newCreneau.date}
                onChange={(e) =>
                  setNewCreneau({ ...newCreneau, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Début</Label>
              <Input
                type="time"
                value={newCreneau.heureDebut}
                onChange={(e) =>
                  setNewCreneau({ ...newCreneau, heureDebut: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fin</Label>
              <Input
                type="time"
                value={newCreneau.heureFin}
                onChange={(e) =>
                  setNewCreneau({ ...newCreneau, heureFin: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Capacité</Label>
              <Input
                type="number"
                min="1"
                value={newCreneau.capacite}
                onChange={(e) =>
                  setNewCreneau({ ...newCreneau, capacite: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addCreneau}
                disabled={addingCreneau}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Restant</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : creneaux.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun créneau.
                    </TableCell>
                  </TableRow>
                ) : (
                  creneaux.map((c) => (
                    <TableRow key={c.idCreneau}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(c.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {c.heureDebut?.slice(0, 5)} – {c.heureFin?.slice(0, 5)}
                      </TableCell>
                      <TableCell>{c.capacite}</TableCell>
                      <TableCell>{c.reste ?? "—"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={c.actif}
                          onCheckedChange={() => toggleCreneau(c)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setCreneauToDelete(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rendez-vous */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Demandes de rendez-vous</CardTitle>
            <Select value={filtre} onValueChange={setFiltre}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="approuve">Approuvés</SelectItem>
                <SelectItem value="refuse">Refusés</SelectItem>
                <SelectItem value="reprogramme">Reprogrammés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Date / heure</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[190px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : rdvs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Aucune demande.
                    </TableCell>
                  </TableRow>
                ) : (
                  rdvs.map((r) => (
                    <TableRow key={r.idRendezVous}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium">{r.nom}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.email} · {r.telephone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString("fr-FR")}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {r.heureDebut?.slice(0, 5)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {r.motif || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUT[r.statut].variant}>
                          {STATUT[r.statut].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Approuver"
                            className="text-green-600"
                            onClick={() => setStatut(r, "approuve")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Refuser"
                            className="text-destructive"
                            onClick={() => setStatut(r, "refuse")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Reprogrammer"
                            onClick={() => openRepro(r)}
                          >
                            <CalendarClock className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Supprimer"
                            className="text-destructive"
                            onClick={() => setRdvToDelete(r)}
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
        </CardContent>
      </Card>

      {/* Modal reprogrammer */}
      <Dialog open={!!reproFor} onOpenChange={(o) => !o && setReproFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reprogrammer le rendez-vous</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nouvelle date</Label>
              <Input
                type="date"
                value={repro.date}
                onChange={(e) => setRepro({ ...repro, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Début</Label>
                <Input
                  type="time"
                  value={repro.heureDebut}
                  onChange={(e) =>
                    setRepro({ ...repro, heureDebut: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fin</Label>
                <Input
                  type="time"
                  value={repro.heureFin}
                  onChange={(e) =>
                    setRepro({ ...repro, heureFin: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note (optionnel)</Label>
              <Textarea
                rows={2}
                value={repro.note}
                onChange={(e) => setRepro({ ...repro, note: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReproFor(null)}>
              Annuler
            </Button>
            <Button onClick={saveRepro}>Reprogrammer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!creneauToDelete}
        onClose={() => setCreneauToDelete(null)}
        onConfirm={removeCreneau}
        title="Supprimer ce créneau ?"
        description="Les rendez-vous liés ne seront plus rattachés à ce créneau."
      />
      <DeleteConfirmationModal
        isOpen={!!rdvToDelete}
        onClose={() => setRdvToDelete(null)}
        onConfirm={removeRdv}
        title="Supprimer ce rendez-vous ?"
        description="Cette action est irréversible."
      />
    </div>
  );
}
