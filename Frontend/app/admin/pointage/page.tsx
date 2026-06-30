"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Users,
  CalendarCheck,
  Clock,
  Download,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import { getAllUsers } from "@/actions/users";
import {
  getProfilsPointage,
  createProfilPointage,
  getPointages,
  createPointage,
  updatePointage,
  deletePointage,
  getPointageStats,
  getPointageExportUrl,
} from "@/actions/pointage";
import type {
  Pointage,
  PointagePeriode,
  PointageStatsResponse,
  ProfilPointage,
  User,
} from "@/types/user";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PERIODE_LABELS: Record<PointagePeriode, string> = {
  hebdo: "Cette semaine",
  mensuel: "Ce mois",
  annuel: "Cette année",
};

const today = () => new Date().toISOString().slice(0, 10);

export default function PointagePage() {
  const [periode, setPeriode] = useState<PointagePeriode>("mensuel");
  const [stats, setStats] = useState<PointageStatsResponse | null>(null);
  const [profils, setProfils] = useState<ProfilPointage[]>([]);
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire de saisie
  const [form, setForm] = useState({
    idProfil: "",
    date: today(),
    heureDebut: "",
    heureFin: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Ajout de profil
  const [addOpen, setAddOpen] = useState(false);
  const [profilMode, setProfilMode] = useState<"manuel" | "systeme">("manuel");
  const [manual, setManual] = useState({ nomComplet: "", fonction: "" });
  const [selectedUser, setSelectedUser] = useState("");
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [savingProfil, setSavingProfil] = useState(false);

  // Édition / suppression d'un pointage
  const [editing, setEditing] = useState<Pointage | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    heureDebut: "",
    heureFin: "",
    note: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [toDelete, setToDelete] = useState<Pointage | null>(null);

  const fetchStatsAndList = async (p: PointagePeriode) => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        getPointageStats(p),
        getPointages({ periode: p }),
      ]);
      setStats(statsRes);
      setPointages(listRes.pointages);
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

  const fetchProfils = async () => {
    try {
      const res = await getProfilsPointage();
      setProfils(res.profils);
    } catch {
      /* silencieux */
    }
  };

  useEffect(() => {
    fetchProfils();
  }, []);

  useEffect(() => {
    fetchStatsAndList(periode);
  }, [periode]);

  const openAddProfil = async () => {
    setAddOpen(true);
    if (systemUsers.length === 0) {
      try {
        const res = await getAllUsers();
        setSystemUsers(res.usersInfo || []);
      } catch {
        /* silencieux */
      }
    }
  };

  const handleAddProfil = async () => {
    try {
      setSavingProfil(true);
      let created: ProfilPointage;
      if (profilMode === "systeme") {
        if (!selectedUser) {
          toast({
            variant: "destructive",
            title: "Sélection requise",
            description: "Choisissez un utilisateur.",
          });
          return;
        }
        const user = systemUsers.find(
          (u) => String(u.idUtilisateur) === selectedUser,
        );
        created = await createProfilPointage({
          source: "systeme",
          idUtilisateur: Number(selectedUser),
          nomComplet: user?.nomComplet,
        });
      } else {
        if (!manual.nomComplet.trim()) {
          toast({
            variant: "destructive",
            title: "Nom requis",
            description: "Le nom du profil est requis.",
          });
          return;
        }
        created = await createProfilPointage({
          source: "manuel",
          nomComplet: manual.nomComplet.trim(),
          fonction: manual.fonction.trim() || undefined,
        });
      }
      await fetchProfils();
      setForm((f) => ({ ...f, idProfil: String(created.idProfil) }));
      setManual({ nomComplet: "", fonction: "" });
      setSelectedUser("");
      setAddOpen(false);
      toast({ title: "Profil ajouté" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Ajout impossible.",
      });
    } finally {
      setSavingProfil(false);
    }
  };

  const handleCreatePointage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idProfil || !form.date || !form.heureDebut) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Profil, date et heure de début sont requis.",
      });
      return;
    }
    try {
      setSubmitting(true);
      await createPointage({
        idProfil: Number(form.idProfil),
        date: form.date,
        heureDebut: form.heureDebut,
        heureFin: form.heureFin || undefined,
        note: form.note || undefined,
      });
      setForm((f) => ({
        ...f,
        heureDebut: "",
        heureFin: "",
        note: "",
      }));
      toast({ title: "Présence enregistrée" });
      fetchStatsAndList(periode);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Enregistrement impossible.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (p: Pointage) => {
    setEditing(p);
    setEditForm({
      date: p.date,
      heureDebut: p.heureDebut?.slice(0, 5) || "",
      heureFin: p.heureFin?.slice(0, 5) || "",
      note: p.note || "",
    });
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSavingEdit(true);
      await updatePointage(editing.idPointage, {
        date: editForm.date,
        heureDebut: editForm.heureDebut,
        heureFin: editForm.heureFin || undefined,
        note: editForm.note || undefined,
      });
      setEditing(null);
      toast({ title: "Pointage mis à jour" });
      fetchStatsAndList(periode);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Mise à jour impossible.",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePointage(toDelete.idPointage);
      toast({ title: "Pointage supprimé" });
      fetchStatsAndList(periode);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Suppression impossible.",
      });
    }
  };

  const exportPdf = (scope: "global" | "individuel", idProfil?: number) => {
    const url = getPointageExportUrl({ periode, scope, idProfil });
    window.open(url, "_blank");
  };

  const chartData = useMemo(
    () => ({
      labels: stats?.graph.map((g) => g.nomComplet) || [],
      datasets: [
        {
          label: "Heures",
          data: stats?.graph.map((g) => g.heures) || [],
          backgroundColor: "oklch(0.55 0.18 15)",
          borderRadius: 6,
        },
      ],
    }),
    [stats],
  );

  const profilName = (id: number) =>
    profils.find((p) => p.idProfil === id)?.nomComplet || "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Pointage</h1>
          <p className="text-sm text-muted-foreground">
            Numérisation du temps passé au bureau.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={periode}
            onValueChange={(v) => setPeriode(v as PointagePeriode)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hebdo">Hebdomadaire</SelectItem>
              <SelectItem value="mensuel">Mensuel</SelectItem>
              <SelectItem value="annuel">Annuel</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => exportPdf("global")}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export global
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Profils actifs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.stats.profilsActifs ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {PERIODE_LABELS[periode]}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Présences enregistrées
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.stats.presences ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {PERIODE_LABELS[periode]}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Temps de travail cumulé
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.stats.tempsCumuleLabel ?? "0h00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions complétées uniquement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique + Récap */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profils les plus actifs (heures)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (stats?.graph.length ?? 0) === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Aucune donnée sur la période.
              </div>
            ) : (
              <div className="h-64">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profil</TableHead>
                    <TableHead>Présences</TableHead>
                    <TableHead>Temps</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : (stats?.recap.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Aucune donnée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats?.recap.map((r) => (
                      <TableRow key={r.idProfil}>
                        <TableCell>
                          <div className="font-medium">{r.nomComplet}</div>
                          {r.fonction && (
                            <div className="text-xs text-muted-foreground">
                              {r.fonction}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{r.presences}</TableCell>
                        <TableCell>{r.tempsLabel}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Export individuel"
                            onClick={() =>
                              exportPdf("individuel", r.idProfil)
                            }
                          >
                            <FileDown className="h-4 w-4" />
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
      </div>

      {/* Saisie d'une présence */}
      <Card>
        <CardHeader>
          <CardTitle>Enregistrer une présence</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePointage} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Profil <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={form.idProfil}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, idProfil: v }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choisir un profil" />
                    </SelectTrigger>
                    <SelectContent>
                      {profils.map((p) => (
                        <SelectItem key={p.idProfil} value={String(p.idProfil)}>
                          {p.nomComplet}
                          {p.fonction ? ` — ${p.fonction}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={openAddProfil}
                    aria-label="Ajouter un profil"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heureDebut">
                  Heure de début <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="heureDebut"
                  type="time"
                  value={form.heureDebut}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, heureDebut: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heureFin">
                  Heure de fin{" "}
                  <span className="text-xs text-muted-foreground">
                    (optionnel — sinon pointage simple)
                  </span>
                </Label>
                <Input
                  id="heureFin"
                  type="time"
                  value={form.heureFin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, heureFin: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                rows={2}
                placeholder="Note (optionnel)"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer la présence"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Présences de la période */}
      <Card>
        <CardHeader>
          <CardTitle>Présences ({PERIODE_LABELS[periode].toLowerCase()})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Profil</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : pointages.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Aucune présence sur la période.
                    </TableCell>
                  </TableRow>
                ) : (
                  pointages.map((p) => (
                    <TableRow key={p.idPointage}>
                      <TableCell className="whitespace-nowrap">
                        {p.date}
                      </TableCell>
                      <TableCell>
                        {p.profil?.nomComplet || profilName(p.idProfil)}
                      </TableCell>
                      <TableCell>{p.heureDebut?.slice(0, 5)}</TableCell>
                      <TableCell>
                        {p.heureFin ? (
                          p.heureFin.slice(0, 5)
                        ) : (
                          <Badge variant="outline">Simple</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.dureeMinutes
                          ? `${Math.floor(p.dureeMinutes / 60)}h${String(
                              p.dureeMinutes % 60,
                            ).padStart(2, "0")}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(p)}
                            aria-label="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setToDelete(p)}
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
        </CardContent>
      </Card>

      {/* Dialog : ajouter un profil */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={profilMode === "manuel" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setProfilMode("manuel")}
              >
                Manuel
              </Button>
              <Button
                type="button"
                variant={profilMode === "systeme" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setProfilMode("systeme")}
              >
                Utilisateur du système
              </Button>
            </div>

            {profilMode === "manuel" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="m-nom">
                    Nom complet <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="m-nom"
                    value={manual.nomComplet}
                    onChange={(e) =>
                      setManual((m) => ({ ...m, nomComplet: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-fonction">Fonction</Label>
                  <Input
                    id="m-fonction"
                    placeholder="Ex. Bénévole, Stagiaire…"
                    value={manual.fonction}
                    onChange={(e) =>
                      setManual((m) => ({ ...m, fonction: e.target.value }))
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Utilisateur</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemUsers.map((u) => (
                      <SelectItem
                        key={u.idUtilisateur}
                        value={String(u.idUtilisateur)}
                      >
                        {u.nomComplet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={savingProfil}
            >
              Annuler
            </Button>
            <Button onClick={handleAddProfil} disabled={savingProfil}>
              {savingProfil ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog : éditer un pointage */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la présence</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="e-date">Date</Label>
              <Input
                id="e-date"
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="e-debut">Début</Label>
                <Input
                  id="e-debut"
                  type="time"
                  value={editForm.heureDebut}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, heureDebut: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-fin">Fin</Label>
                <Input
                  id="e-fin"
                  type="time"
                  value={editForm.heureFin}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, heureFin: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-note">Note</Label>
              <Textarea
                id="e-note"
                rows={2}
                value={editForm.note}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, note: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={savingEdit}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={savingEdit}>
              {savingEdit ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer cette présence ?"
        description="Cette action est irréversible."
      />
    </div>
  );
}
