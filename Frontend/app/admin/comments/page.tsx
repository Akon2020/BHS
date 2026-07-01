"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Check,
  X,
  Trash2,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import { getCurrentUser } from "@/lib/auth";
import {
  getAllCommentaires,
  modererCommentaire,
  deleteCommentaire,
} from "@/actions/comment";
import type { Commentaire, CommentaireStatut } from "@/types/user";

const STATUT_LABEL: Record<CommentaireStatut, string> = {
  attente: "En attente",
  approuve: "Approuvé",
  refuse: "Refusé",
};

const statutVariant = (s: CommentaireStatut) =>
  s === "approuve" ? "default" : s === "refuse" ? "destructive" : "secondary";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function CommentsModerationPage() {
  const [items, setItems] = useState<Commentaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | CommentaireStatut>("attente");
  const [toDelete, setToDelete] = useState<Commentaire | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getAllCommentaires();
      setItems(res.commentaires);
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

  const filtered = useMemo(
    () =>
      filter === "all" ? items : items.filter((c) => c.statut === filter),
    [items, filter],
  );

  const counts = useMemo(
    () => ({
      attente: items.filter((c) => c.statut === "attente").length,
      approuve: items.filter((c) => c.statut === "approuve").length,
      refuse: items.filter((c) => c.statut === "refuse").length,
    }),
    [items],
  );

  const moderer = async (c: Commentaire, statut: CommentaireStatut) => {
    try {
      setBusyId(c.idCommentaire);
      const user = getCurrentUser();
      const res = await modererCommentaire(c.idCommentaire, {
        statut,
        modereBy: Number(user?.idUtilisateur) || 0,
      });
      setItems((prev) =>
        prev.map((it) =>
          it.idCommentaire === c.idCommentaire
            ? { ...it, statut: res.commentaire.statut }
            : it,
        ),
      );
      toast({ title: `Commentaire ${STATUT_LABEL[statut].toLowerCase()}` });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Modération impossible.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCommentaire(toDelete.idCommentaire);
      setItems((prev) =>
        prev.filter((c) => c.idCommentaire !== toDelete.idCommentaire),
      );
      toast({ title: "Commentaire supprimé" });
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
          <h1 className="text-2xl font-bold sm:text-3xl">Commentaires</h1>
          <p className="text-sm text-muted-foreground">
            Modérez les commentaires du blog ({counts.attente} en attente).
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attente">
                En attente ({counts.attente})
              </SelectItem>
              <SelectItem value="approuve">
                Approuvés ({counts.approuve})
              </SelectItem>
              <SelectItem value="refuse">Refusés ({counts.refuse})</SelectItem>
              <SelectItem value="all">Tous</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={fetchItems}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Recharger
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 opacity-20" />
            Aucun commentaire dans cette catégorie.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <Card key={c.idCommentaire}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback>{initials(c.nomComplet)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{c.nomComplet}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {c.email}
                      </span>
                      <Badge variant={statutVariant(c.statut)}>
                        {STATUT_LABEL[c.statut]}
                      </Badge>
                      {c.idCommentaireParent && (
                        <Badge variant="outline">Réponse</Badge>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {c.contenu}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Article #{c.idBlog} ·{" "}
                      {new Date(c.dateCommentaire).toLocaleDateString("fr-FR")}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.statut !== "approuve" && (
                        <Button
                          size="sm"
                          onClick={() => moderer(c, "approuve")}
                          disabled={busyId === c.idCommentaire}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approuver
                        </Button>
                      )}
                      {c.statut !== "refuse" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderer(c, "refuse")}
                          disabled={busyId === c.idCommentaire}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Refuser
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(c)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer ce commentaire ?"
        description="Cette action est irréversible."
      />
    </div>
  );
}
