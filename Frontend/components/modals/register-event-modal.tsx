"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChampPersonnalise, Sexe } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { registerToEvent } from "@/actions/event";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slug: string;
  onSuccess?: () => void;
  champs?: ChampPersonnalise[];
  estPayant?: boolean;
  montant?: string | number | null;
  devise?: string;
}

export function RegisterEventModal({
  open,
  onOpenChange,
  slug,
  onSuccess,
  champs = [],
  estPayant = false,
  montant,
  devise = "USD",
}: Props) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    nomComplet: string;
    email: string;
    telephone: string;
    sexe: Sexe;
  }>({ nomComplet: "", email: "", telephone: "", sexe: "homme" });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      setForm({
        nomComplet: user.nomComplet || "",
        email: user.email || "",
        telephone: (user as any)?.telephone || "",
        sexe: ((user as any)?.sexe as Sexe) || "homme",
      });
    }
  }, [authLoading, isAuthenticated, user]);

  const handleSubmit = async () => {
    if (!form.nomComplet || !form.email || !form.telephone) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Nom, email et téléphone sont obligatoires.",
      });
      return;
    }

    // Validation des champs personnalisés obligatoires.
    for (const champ of champs) {
      if (!champ.requis) continue;
      if (champ.type === "fichier") {
        if (!files[champ.id]) {
          toast({
            variant: "destructive",
            title: "Champ requis",
            description: `« ${champ.label} » est obligatoire.`,
          });
          return;
        }
      } else if (!answers[champ.id]) {
        toast({
          variant: "destructive",
          title: "Champ requis",
          description: `« ${champ.label} » est obligatoire.`,
        });
        return;
      }
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("nomComplet", form.nomComplet);
      fd.append("email", form.email);
      fd.append("telephone", form.telephone);
      fd.append("sexe", form.sexe);

      const reponses: Record<string, string> = {};
      for (const champ of champs) {
        if (champ.type === "fichier") {
          const file = files[champ.id];
          if (file) fd.append(champ.id, file);
        } else if (answers[champ.id] !== undefined) {
          reponses[champ.id] = answers[champ.id];
        }
      }
      fd.append("reponsesPersonnalisees", JSON.stringify(reponses));

      const res = await registerToEvent(slug, fd);

      if (res.pdfUrl) {
        toast({
          title: "Inscription réussie 🎉",
          description: "Votre billet est prêt au téléchargement.",
        });
        window.open(res.pdfUrl, "_blank");
      } else {
        toast({
          title: "Inscription enregistrée",
          description:
            "Cet événement est payant. Un email vous invite à régler le montant dû ; votre billet suivra après paiement.",
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de finaliser l'inscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderChamp = (champ: ChampPersonnalise) => {
    const label = (
      <Label>
        {champ.label}
        {champ.requis && <span className="text-destructive"> *</span>}
      </Label>
    );
    const setVal = (v: string) =>
      setAnswers((prev) => ({ ...prev, [champ.id]: v }));

    switch (champ.type) {
      case "textarea":
        return (
          <div key={champ.id} className="space-y-1">
            {label}
            <Textarea
              rows={3}
              value={answers[champ.id] || ""}
              onChange={(e) => setVal(e.target.value)}
            />
          </div>
        );
      case "select":
        return (
          <div key={champ.id} className="space-y-1">
            {label}
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={answers[champ.id] || ""}
              onChange={(e) => setVal(e.target.value)}
            >
              <option value="">— Choisir —</option>
              {(champ.options || []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      case "checkbox":
        return (
          <div key={champ.id} className="flex items-center gap-2">
            <Checkbox
              id={champ.id}
              checked={answers[champ.id] === "oui"}
              onCheckedChange={(c) => setVal(c === true ? "oui" : "non")}
            />
            <Label htmlFor={champ.id} className="text-sm">
              {champ.label}
              {champ.requis && <span className="text-destructive"> *</span>}
            </Label>
          </div>
        );
      case "fichier":
        return (
          <div key={champ.id} className="space-y-1">
            {label}
            <Input
              type="file"
              onChange={(e) =>
                setFiles((prev) => ({
                  ...prev,
                  [champ.id]: e.target.files?.[0] || null,
                }))
              }
            />
          </div>
        );
      default:
        return (
          <div key={champ.id} className="space-y-1">
            {label}
            <Input
              type={
                champ.type === "email"
                  ? "email"
                  : champ.type === "nombre"
                    ? "number"
                    : champ.type === "date"
                      ? "date"
                      : champ.type === "telephone"
                        ? "tel"
                        : "text"
              }
              value={answers[champ.id] || ""}
              onChange={(e) => setVal(e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscription à l’événement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {estPayant && (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
              Événement <strong>payant</strong>
              {montant != null ? ` — ${montant} ${devise}` : ""}. Vous recevrez
              un email pour régler le montant ; votre billet suivra après
              paiement.
            </div>
          )}

          {isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              Vous êtes connecté. Vos informations ont été pré-remplies.
            </p>
          )}

          <div className="space-y-1">
            <Label>
              Nom complet <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.nomComplet}
              onChange={(e) => setForm({ ...form, nomComplet: e.target.value })}
              placeholder="Nom complet"
            />
          </div>

          <div className="space-y-1">
            <Label>
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@exemple.com"
              disabled={isAuthenticated}
            />
          </div>

          <div className="space-y-1">
            <Label>
              Téléphone <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              placeholder="+243..."
            />
          </div>

          <div className="space-y-1">
            <Label>Sexe</Label>
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={form.sexe}
              onChange={(e) =>
                setForm({ ...form, sexe: e.target.value as Sexe })
              }
            >
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>

          {champs.length > 0 && (
            <div className="space-y-4 border-t pt-4">{champs.map(renderChamp)}</div>
          )}

          <Button
            className="mt-4 w-full"
            onClick={handleSubmit}
            disabled={loading || authLoading}
          >
            {loading ? "Envoi..." : "Valider l’inscription"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
