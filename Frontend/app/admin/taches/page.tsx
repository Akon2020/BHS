"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Bell,
  CalendarClock,
  MessageSquare,
  Repeat,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  getTaches,
  createTache,
  updateTache,
  deleteTache,
  getTache,
  addTacheCommentaire,
  deleteTacheCommentaire,
  declencherRappelsTaches,
} from "@/actions/tache";
import type {
  Tache,
  TacheAssigne,
  StatutTache,
  PrioriteTache,
  RecurrenceTache,
} from "@/types/user";

const COLONNES: { statut: StatutTache; label: string }[] = [
  { statut: "a_faire", label: "À faire" },
  { statut: "en_cours", label: "En cours" },
  { statut: "fait", label: "Fait" },
];

const PRIORITES: { value: PrioriteTache; label: string }[] = [
  { value: "basse", label: "Basse" },
  { value: "normale", label: "Normale" },
  { value: "haute", label: "Haute" },
];

const RECURRENCES: { value: RecurrenceTache; label: string }[] = [
  { value: "aucune", label: "Aucune" },
  { value: "quotidien", label: "Quotidienne" },
  { value: "hebdo", label: "Hebdomadaire" },
  { value: "mensuel", label: "Mensuelle" },
];

const prioriteBadge = (p: PrioriteTache) => {
  if (p === "haute")
    return { label: "Haute", className: "bg-destructive/10 text-destructive" };
  if (p === "basse")
    return { label: "Basse", className: "bg-muted text-muted-foreground" };
  return { label: "Normale", className: "bg-primary/10 text-primary" };
};

const initials = (nom: string) =>
  nom
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatEcheance = (iso?: string | null) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

const isEnRetard = (t: Tache) => {
  if (!t.echeance || t.statut === "fait") return false;
  const today = new Date().toISOString().slice(0, 10);
  return t.echeance < today;
};

type FormState = {
  titre: string;
  description: string;
  priorite: PrioriteTache;
  echeance: string;
  recurrence: RecurrenceTache;
  rappelJoursAvant: string;
  assignes: number[];
};

const emptyForm: FormState = {
  titre: "",
  description: "",
  priorite: "normale",
  echeance: "",
  recurrence: "aucune",
  rappelJoursAvant: "1",
  assignes: [],
};

export default function TachesPage() {
  const { user } = useAuth();
  const role = user?.role;
  const currentUserId = user?.idUtilisateur;
  const canManageReminders = role === "admin" || role === "editeur";

  const [taches, setTaches] = useState<Tache[]>([]);
  const [assignables, setAssignables] = useState<TacheAssigne[]>([]);
  const [loading, setLoading] = useState(true);
  const [mineOnly, setMineOnly] = useState(false);
  const [runningReminders, setRunningReminders] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);

  // Dialog création / édition
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Dialog détail (commentaires)
  const [detail, setDetail] = useState<Tache | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [toDelete, setToDelete] = useState<Tache | null>(null);

  const fetchTaches = async () => {
    try {
      setLoading(true);
      const res = await getTaches();
      setTaches(res.taches);
      setAssignables(res.assignables || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaches();
  }, []);

  const visibles = useMemo(() => {
    if (!mineOnly || !currentUserId) return taches;
    return taches.filter(
      (t) =>
        t.createdBy === currentUserId ||
        (t.assignes || []).includes(currentUserId),
    );
  }, [taches, mineOnly, currentUserId]);

  const parStatut = (statut: StatutTache) =>
    visibles.filter((t) => t.statut === statut);

  /* --------------------------- Création / édition --------------------------- */

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (t: Tache) => {
    setEditingId(t.idTache);
    setForm({
      titre: t.titre,
      description: t.description || "",
      priorite: t.priorite,
      echeance: t.echeance || "",
      recurrence: t.recurrence,
      rappelJoursAvant: String(t.rappelJoursAvant ?? 1),
      assignes: t.assignes || [],
    });
    setFormOpen(true);
  };

  const toggleAssigne = (id: number) => {
    setForm((f) => ({
      ...f,
      assignes: f.assignes.includes(id)
        ? f.assignes.filter((x) => x !== id)
        : [...f.assignes, id],
    }));
  };

  const handleSave = async () => {
    if (!form.titre.trim()) {
      toast({ variant: "destructive", title: "Le titre est requis" });
      return;
    }
    const payload = {
      titre: form.titre.trim(),
      description: form.description.trim() || undefined,
      priorite: form.priorite,
      echeance: form.echeance || null,
      recurrence: form.recurrence,
      rappelJoursAvant: Number(form.rappelJoursAvant) || 0,
      assignes: form.assignes,
    };
    try {
      setSaving(true);
      if (editingId) {
        await updateTache(editingId, payload);
        toast({ title: "Tâche mise à jour" });
      } else {
        await createTache(payload);
        toast({ title: "Tâche créée" });
      }
      setFormOpen(false);
      await fetchTaches();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTache(toDelete.idTache);
      setTaches((prev) => prev.filter((x) => x.idTache !== toDelete.idTache));
      toast({ title: "Tâche supprimée" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    }
  };

  /* ------------------------------ Drag & drop ------------------------------ */

  const handleDrop = async (statut: StatutTache) => {
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const tache = taches.find((t) => t.idTache === id);
    if (!tache || tache.statut === statut) return;

    // Mise à jour optimiste.
    const previous = taches;
    setTaches((prev) =>
      prev.map((t) => (t.idTache === id ? { ...t, statut } : t)),
    );

    // Une tâche récurrente clôturée engendre une nouvelle occurrence : on
    // recharge la liste pour la faire apparaître.
    const genereOccurrence =
      statut === "fait" && tache.recurrence !== "aucune" && !!tache.echeance;

    try {
      const updated = await updateTache(id, { statut });
      setTaches((prev) =>
        prev.map((t) =>
          t.idTache === id ? { ...t, statut: updated.statut } : t,
        ),
      );
      if (genereOccurrence) {
        await fetchTaches();
        toast({
          title: "Tâche clôturée",
          description: "Une nouvelle occurrence a été planifiée.",
        });
      }
    } catch (error: any) {
      setTaches(previous);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    }
  };

  /* ------------------------------ Détail / comm. ------------------------------ */

  const openDetail = async (t: Tache) => {
    setDetail(t);
    setNewComment("");
    try {
      setDetailLoading(true);
      const full = await getTache(t.idTache);
      setDetail(full);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!detail || !newComment.trim()) return;
    try {
      setPostingComment(true);
      const c = await addTacheCommentaire(detail.idTache, newComment.trim());
      setDetail((d) =>
        d ? { ...d, commentaires: [...(d.commentaires || []), c] } : d,
      );
      setNewComment("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentaireId: number) => {
    if (!detail) return;
    try {
      await deleteTacheCommentaire(detail.idTache, commentaireId);
      setDetail((d) =>
        d
          ? {
              ...d,
              commentaires: (d.commentaires || []).filter(
                (c) => c.idCommentaireTache !== commentaireId,
              ),
            }
          : d,
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    }
  };

  const runReminders = async () => {
    try {
      setRunningReminders(true);
      const msg = await declencherRappelsTaches();
      toast({ title: "Rappels lancés", description: msg });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    } finally {
      setRunningReminders(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Tâches</h1>
          <p className="text-sm text-muted-foreground">
            Organisez le travail de l&apos;équipe (À faire · En cours · Fait).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
            <Switch
              id="mine"
              checked={mineOnly}
              onCheckedChange={setMineOnly}
            />
            <Label htmlFor="mine" className="cursor-pointer text-sm">
              Mes tâches
            </Label>
          </div>
          {canManageReminders && (
            <Button
              variant="outline"
              onClick={runReminders}
              disabled={runningReminders}
            >
              <Bell className="mr-2 h-4 w-4" />
              {runningReminders ? "Envoi..." : "Lancer les rappels"}
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLONNES.map((col) => {
            const items = parStatut(col.statut);
            return (
              <div
                key={col.statut}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.statut)}
                className="flex flex-col rounded-lg border bg-muted/30"
              >
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h2 className="font-semibold">{col.label}</h2>
                  <Badge variant="secondary" className="rounded-full">
                    {items.length}
                  </Badge>
                </div>
                <div className="flex min-h-[120px] flex-1 flex-col gap-3 p-3">
                  {items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Aucune tâche
                    </p>
                  ) : (
                    items.map((t) => {
                      const badge = prioriteBadge(t.priorite);
                      const retard = isEnRetard(t);
                      return (
                        <article
                          key={t.idTache}
                          draggable
                          onDragStart={() => setDragId(t.idTache)}
                          onDragEnd={() => setDragId(null)}
                          onClick={() => openDetail(t)}
                          className={cn(
                            "group cursor-pointer rounded-md border bg-background p-3 shadow-sm transition-shadow hover:shadow-md",
                            dragId === t.idTache && "opacity-50",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium leading-snug">
                              {t.titre}
                            </h3>
                            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                aria-label="Modifier"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(t);
                                }}
                                className="rounded p-1 text-muted-foreground hover:bg-accent"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Supprimer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setToDelete(t);
                                }}
                                className="rounded p-1 text-destructive hover:bg-accent"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {t.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {t.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                                badge.className,
                              )}
                            >
                              {badge.label}
                            </span>
                            {t.recurrence !== "aucune" && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Repeat className="h-3 w-3" />
                                {
                                  RECURRENCES.find(
                                    (r) => r.value === t.recurrence,
                                  )?.label
                                }
                              </span>
                            )}
                            {t.echeance && (
                              <span
                                className={cn(
                                  "flex items-center gap-1 text-[11px]",
                                  retard
                                    ? "font-medium text-destructive"
                                    : "text-muted-foreground",
                                )}
                              >
                                <CalendarClock className="h-3 w-3" />
                                {formatEcheance(t.echeance)}
                              </span>
                            )}
                            {(t.commentaires?.length ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                                {t.commentaires!.length}
                              </span>
                            )}
                          </div>

                          {(t.assignesDetails?.length ?? 0) > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {t.assignesDetails!.map((a) => (
                                <span
                                  key={a.idUtilisateur}
                                  title={a.nomComplet}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary"
                                >
                                  {initials(a.nomComplet)}
                                </span>
                              ))}
                            </div>
                          )}
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog création / édition */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier la tâche" : "Nouvelle tâche"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="Ex : Préparer la retraite de mars"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priorité</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                  value={form.priorite}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priorite: e.target.value as PrioriteTache,
                    })
                  }
                >
                  {PRIORITES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Échéance</Label>
                <Input
                  type="date"
                  value={form.echeance}
                  onChange={(e) =>
                    setForm({ ...form, echeance: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Récurrence</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                  value={form.recurrence}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      recurrence: e.target.value as RecurrenceTache,
                    })
                  }
                >
                  {RECURRENCES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Rappel (jours avant)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.rappelJoursAvant}
                  onChange={(e) =>
                    setForm({ ...form, rappelJoursAvant: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigné(s)</Label>
              {assignables.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun membre disponible.
                </p>
              ) : (
                <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                  {assignables.map((u) => (
                    <label
                      key={u.idUtilisateur}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={form.assignes.includes(u.idUtilisateur)}
                        onCheckedChange={() => toggleAssigne(u.idUtilisateur)}
                      />
                      <span className="truncate">{u.nomComplet}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "..." : editingId ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog détail + commentaires */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-6">{detail?.titre}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              {detail.description && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {detail.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-medium",
                    prioriteBadge(detail.priorite).className,
                  )}
                >
                  {prioriteBadge(detail.priorite).label}
                </span>
                {detail.echeance && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatEcheance(detail.echeance)}
                  </span>
                )}
                {detail.recurrence !== "aucune" && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Repeat className="h-3.5 w-3.5" />
                    {
                      RECURRENCES.find((r) => r.value === detail.recurrence)
                        ?.label
                    }
                  </span>
                )}
              </div>

              {(detail.assignesDetails?.length ?? 0) > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Assigné(s) :
                  </span>
                  {detail.assignesDetails!.map((a) => (
                    <span
                      key={a.idUtilisateur}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {a.nomComplet}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t pt-3">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Commentaires
                </p>
                {detailLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (detail.commentaires?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun commentaire.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {detail.commentaires!.map((c) => (
                      <li key={c.idCommentaireTache} className="text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {c.auteur?.nomComplet || "Utilisateur"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                            {(c.idUtilisateur === currentUserId ||
                              role === "admin") && (
                              <button
                                type="button"
                                aria-label="Supprimer le commentaire"
                                onClick={() =>
                                  handleDeleteComment(c.idCommentaireTache)
                                }
                                className="text-destructive hover:opacity-70"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="whitespace-pre-line text-muted-foreground">
                          {c.contenu}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex items-end gap-2">
                  <Textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                  />
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={postingComment || !newComment.trim()}
                    aria-label="Envoyer"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer cette tâche ?"
        description="Cette action est irréversible."
      />
    </div>
  );
}
