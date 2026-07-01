"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Eye,
  HandHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import { getDons, updateDonStatut, deleteDon } from "@/actions/don";
import type { Don } from "@/types/user";

const MOYEN_LABEL: Record<string, string> = {
  mobile: "Mobile Money",
  virement: "Virement",
  carte: "Carte",
};

export default function DonsPage() {
  const [dons, setDons] = useState<Don[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Don | null>(null);
  const [toDelete, setToDelete] = useState<Don | null>(null);

  const fetchDons = async () => {
    try {
      setLoading(true);
      const res = await getDons();
      setDons(res.dons);
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
    fetchDons();
  }, []);

  const totalConfirme = useMemo(
    () =>
      dons
        .filter((d) => d.statut === "confirme" && d.montant)
        .reduce((acc, d) => acc + Number(d.montant || 0), 0),
    [dons],
  );

  const toggleStatut = async (don: Don) => {
    const next = don.statut === "confirme" ? "annonce" : "confirme";
    try {
      const updated = await updateDonStatut(don.idDon, next);
      setDons((prev) =>
        prev.map((d) => (d.idDon === don.idDon ? updated : d)),
      );
      toast({
        title:
          next === "confirme" ? "Don marqué confirmé" : "Don remis en annonce",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Mise à jour impossible.",
      });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDon(toDelete.idDon);
      setDons((prev) => prev.filter((d) => d.idDon !== toDelete.idDon));
      toast({ title: "Don supprimé" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Suppression impossible.",
      });
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dons</h1>
          <p className="text-sm text-muted-foreground">
            Suivi des intentions de don déclarées sur le site.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDons}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Recharger
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total dons</CardTitle>
            <HandHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dons.filter((d) => d.statut === "confirme").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Montant confirmé (USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalConfirme.toLocaleString("fr-FR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Somme des dons confirmés avec montant
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donateur</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Moyen</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[140px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : dons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Aucun don déclaré pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              dons.map((d) => (
                <TableRow key={d.idDon}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium">{d.nom}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {d.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {d.montant ? `${d.montant} ${d.devise}` : "—"}
                  </TableCell>
                  <TableCell>{MOYEN_LABEL[d.moyen] || d.moyen}</TableCell>
                  <TableCell>
                    <Badge
                      variant={d.statut === "confirme" ? "default" : "secondary"}
                    >
                      {d.statut === "confirme" ? "Confirmé" : "Annoncé"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(d.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {d.message && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelected(d)}
                          aria-label="Voir le message"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatut(d)}
                        aria-label="Basculer le statut"
                        title={
                          d.statut === "confirme"
                            ? "Remettre en annoncé"
                            : "Marquer confirmé"
                        }
                      >
                        <CheckCircle2
                          className={
                            d.statut === "confirme"
                              ? "h-4 w-4 text-green-600"
                              : "h-4 w-4"
                          }
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(d)}
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

      <Dialog
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message de {selected?.nom}</DialogTitle>
            <DialogDescription>{selected?.email}</DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {selected?.message}
          </p>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer ce don ?"
        description="Cette action est irréversible."
      />
    </div>
  );
}
