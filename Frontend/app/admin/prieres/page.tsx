"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  CalendarCheck,
  Flame,
  Globe,
  Loader2,
  Lock,
  Mail,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import {
  createIntentionEquipe,
  deleteDemandePriere,
  getDemandesPriere,
  updateDemandePriere,
} from "@/actions/priere";
import { formatDateCourte, formatDateLongue } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { DemandePriere, DemandePriereStatut } from "@/types/user";

type Filtre = DemandePriereStatut | "aujourdhui" | "toutes";

const FILTRES: { valeur: Filtre; label: string }[] = [
  { valeur: "nouvelle", label: "Nouvelles" },
  { valeur: "aujourdhui", label: "Aujourd'hui" },
  { valeur: "validee", label: "Planifiées" },
  { valeur: "archivee", label: "Archivées" },
  { valeur: "toutes", label: "Toutes" },
];

const STATUT_LABEL: Record<DemandePriereStatut, string> = {
  nouvelle: "Nouvelle",
  validee: "Planifiée",
  archivee: "Archivée",
};

// Date du jour à Bukavu, alignée sur le backend.
const aujourdhuiLocal = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lubumbashi" }).format(
    new Date(),
  );

export default function PrieresAdminPage() {
  const [demandes, setDemandes] = useState<DemandePriere[]>([]);
  const [parStatut, setParStatut] = useState<Record<DemandePriereStatut, number>>(
    { nouvelle: 0, validee: 0, archivee: 0 },
  );
  const [aujourdhui, setAujourdhui] = useState(aujourdhuiLocal());
  const [filtre, setFiltre] = useState<Filtre>("nouvelle");
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);

  // Planification
  const [aPlanifier, setAPlanifier] = useState<DemandePriere | null>(null);
  const [planif, setPlanif] = useState({
    datePriere: "",
    intentionPublique: "",
    prenom: "",
  });
  const [saving, setSaving] = useState(false);

  // Intention de l'équipe
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [ajout, setAjout] = useState({ intention: "", datePriere: "" });

  const [aSupprimer, setASupprimer] = useState<DemandePriere | null>(null);

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDemandesPriere({
        statut:
          filtre === "aujourdhui" || filtre === "toutes" ? undefined : filtre,
        date: filtre === "aujourdhui" ? aujourdhuiLocal() : undefined,
        q: recherche.trim() || undefined,
      });
      setDemandes(res.demandes);
      setParStatut(res.parStatut);
      setAujourdhui(res.aujourdhui);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Chargement impossible.",
      });
    } finally {
      setLoading(false);
    }
  }, [filtre, recherche]);

  useEffect(() => {
    const t = setTimeout(charger, recherche ? 300 : 0);
    return () => clearTimeout(t);
  }, [charger, recherche]);

  const ouvrirPlanif = (d: DemandePriere) => {
    setAPlanifier(d);
    setPlanif({
      datePriere: d.datePriere || aujourdhui,
      intentionPublique: d.intentionPublique || "",
      prenom: d.prenom || "",
    });
  };

  const enregistrerPlanif = async () => {
    if (!aPlanifier) return;
    if (!planif.datePriere) {
      toast({
        variant: "destructive",
        title: "Date requise",
        description: "Choisissez le jour où cette intention sera portée.",
      });
      return;
    }
    try {
      setSaving(true);
      await updateDemandePriere(aPlanifier.idDemandePriere, {
        statut: "validee",
        datePriere: planif.datePriere,
        intentionPublique: planif.intentionPublique.trim() || null,
        prenom: planif.prenom.trim() || null,
      });
      toast({
        title: "Intention planifiée",
        description: formatDateLongue(planif.datePriere),
      });
      setAPlanifier(null);
      charger();
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

  const changerStatut = async (d: DemandePriere, statut: DemandePriereStatut) => {
    try {
      await updateDemandePriere(d.idDemandePriere, { statut });
      toast({
        title: statut === "archivee" ? "Demande archivée" : "Demande restaurée",
      });
      charger();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Mise à jour impossible.",
      });
    }
  };

  const enregistrerAjout = async () => {
    if (ajout.intention.trim().length < 5) {
      toast({
        variant: "destructive",
        title: "Intention trop courte",
        description: "Au moins 5 caractères.",
      });
      return;
    }
    try {
      setSaving(true);
      await createIntentionEquipe({
        intention: ajout.intention.trim(),
        datePriere: ajout.datePriere || undefined,
      });
      toast({ title: "Intention ajoutée à la Table de prière" });
      setAjoutOuvert(false);
      setAjout({ intention: "", datePriere: "" });
      charger();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Ajout impossible.",
      });
    } finally {
      setSaving(false);
    }
  };

  const supprimer = async () => {
    if (!aSupprimer) return;
    try {
      await deleteDemandePriere(aSupprimer.idDemandePriere);
      toast({ title: "Demande supprimée" });
      charger();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Suppression impossible.",
      });
    }
  };

  const compteur = (f: Filtre) =>
    f === "nouvelle" || f === "validee" || f === "archivee"
      ? parStatut[f]
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Flame className="h-7 w-7 text-primary" aria-hidden />
            Table de prière
          </h1>
          <p className="text-sm text-muted-foreground">
            Validez les demandes reçues et choisissez le jour où elles seront
            portées.
          </p>
        </div>
        <Button
          onClick={() => {
            setAjout({ intention: "", datePriere: aujourdhui });
            setAjoutOuvert(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Intention de l&apos;équipe
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filtrer les demandes"
          className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
        >
          {FILTRES.map(({ valeur, label }) => {
            const n = compteur(valeur);
            const actif = filtre === valeur;
            return (
              <button
                key={valeur}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => setFiltre(valeur)}
                className={cn(
                  "flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  actif
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                {n !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      valeur === "nouvelle" && n > 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/15",
                    )}
                  >
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="relative lg:w-72">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Rechercher une demande"
            placeholder="Prénom, email, intention…"
            className="pl-9"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : demandes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            {filtre === "nouvelle"
              ? "Aucune nouvelle demande. Tout est à jour."
              : filtre === "aujourdhui"
                ? "Aucune intention planifiée pour aujourd'hui."
                : "Aucune demande dans cette catégorie."}
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {demandes.map((d) => (
            <li key={d.idDemandePriere}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {d.source === "equipe"
                          ? "Intention de l'équipe"
                          : d.prenom || "Anonyme"}
                      </p>
                      {d.email && (
                        <a
                          href={`mailto:${d.email}`}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Mail className="h-3 w-3" aria-hidden />
                          {d.email}
                        </a>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Reçue le {formatDateCourte(d.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant={
                          d.statut === "nouvelle"
                            ? "default"
                            : d.statut === "validee"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {STATUT_LABEL[d.statut]}
                      </Badge>
                      {d.source === "visiteur" &&
                        (d.partagePublic ? (
                          <Badge variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" aria-hidden />
                            Partage accepté
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" aria-hidden />
                            Confidentielle
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {d.intention}
                  </p>
                  {d.intentionPublique && (
                    <div className="rounded-lg bg-muted/60 p-3 text-sm">
                      <p className="text-xs font-medium text-muted-foreground">
                        Version affichée sur le site
                      </p>
                      <p className="mt-1">{d.intentionPublique}</p>
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarCheck className="h-4 w-4" aria-hidden />
                      {d.datePriere ? (
                        <span
                          className={cn(
                            "capitalize",
                            d.datePriere === aujourdhui &&
                              "font-medium text-primary",
                          )}
                        >
                          {d.datePriere === aujourdhui
                            ? "Aujourd'hui"
                            : formatDateLongue(d.datePriere)}
                        </span>
                      ) : (
                        "Non planifiée"
                      )}
                    </p>
                    <div className="flex gap-1">
                      {d.statut !== "archivee" && (
                        <Button size="sm" onClick={() => ouvrirPlanif(d)}>
                          {d.datePriere ? "Replanifier" : "Planifier"}
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={
                          d.statut === "archivee" ? "Restaurer" : "Archiver"
                        }
                        title={
                          d.statut === "archivee" ? "Restaurer" : "Archiver"
                        }
                        onClick={() =>
                          changerStatut(
                            d,
                            d.statut === "archivee"
                              ? d.datePriere
                                ? "validee"
                                : "nouvelle"
                              : "archivee",
                          )
                        }
                      >
                        {d.statut === "archivee" ? (
                          <ArchiveRestore className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label="Supprimer"
                        title="Supprimer"
                        onClick={() => setASupprimer(d)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Planification */}
      <Dialog
        open={!!aPlanifier}
        onOpenChange={(o) => !o && setAPlanifier(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Planifier l&apos;intention</DialogTitle>
            <DialogDescription>
              {aPlanifier?.partagePublic || aPlanifier?.source === "equipe"
                ? "Elle sera affichée sur la Table de prière le jour choisi."
                : "Demande confidentielle : seule la mention « intention confidentielle » apparaîtra sur le site."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/60 p-3 text-sm whitespace-pre-line">
              {aPlanifier?.intention}
            </div>
            <div className="space-y-2">
              <Label htmlFor="planif-date">
                Jour de prière <span className="text-destructive">*</span>
              </Label>
              <Input
                id="planif-date"
                type="date"
                value={planif.datePriere}
                onChange={(e) =>
                  setPlanif((p) => ({ ...p, datePriere: e.target.value }))
                }
              />
            </div>
            {(aPlanifier?.partagePublic || aPlanifier?.source === "equipe") && (
              <>
                {aPlanifier?.source === "visiteur" && (
                  <div className="space-y-2">
                    <Label htmlFor="planif-prenom">Prénom affiché</Label>
                    <Input
                      id="planif-prenom"
                      placeholder="Anonyme"
                      maxLength={100}
                      value={planif.prenom}
                      onChange={(e) =>
                        setPlanif((p) => ({ ...p, prenom: e.target.value }))
                      }
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="planif-texte">
                    Texte affiché (reformulation facultative)
                  </Label>
                  <Textarea
                    id="planif-texte"
                    rows={4}
                    maxLength={2000}
                    placeholder="Laissez vide pour afficher l'intention telle quelle."
                    value={planif.intentionPublique}
                    onChange={(e) =>
                      setPlanif((p) => ({
                        ...p,
                        intentionPublique: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAPlanifier(null)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={enregistrerPlanif} disabled={saving}>
              {saving ? "Enregistrement..." : "Planifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Intention de l'équipe */}
      <Dialog open={ajoutOuvert} onOpenChange={setAjoutOuvert}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Intention de l&apos;équipe</DialogTitle>
            <DialogDescription>
              Ex. « Pour les malades de notre communauté ». Elle sera affichée
              le jour choisi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ajout-intention">
                Intention <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="ajout-intention"
                rows={4}
                maxLength={2000}
                value={ajout.intention}
                onChange={(e) =>
                  setAjout((a) => ({ ...a, intention: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ajout-date">Jour de prière</Label>
              <Input
                id="ajout-date"
                type="date"
                value={ajout.datePriere}
                onChange={(e) =>
                  setAjout((a) => ({ ...a, datePriere: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAjoutOuvert(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={enregistrerAjout} disabled={saving}>
              {saving ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={supprimer}
        title="Supprimer cette demande ?"
        description="Cette action est irréversible."
      />
    </div>
  );
}
