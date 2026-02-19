"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Sexe } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { registerToEvent } from "@/actions/event";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slug: string;
  onSuccess?: () => void;
}

export function RegisterEventModal({
  open,
  onOpenChange,
  slug,
  onSuccess,
}: Props) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    nomComplet: string;
    email: string;
    telephone: string;
    sexe: Sexe;
  }>({
    nomComplet: "",
    email: "",
    telephone: "",
    sexe: "homme",
  });

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
    try {
      setLoading(true);

      const res = await registerToEvent(slug, {
        nomComplet: form.nomComplet,
        email: form.email,
        telephone: form.telephone,
        sexe: form.sexe,
      });

      toast({
        title: "Inscription réussie 🎉",
        description:
          "Vous êtes bien inscrit à l'événement et votre billet est prêt au téléchargement.",
      });

      console.log("Response registration: ", res);

      if (res.pdfUrl) {
        window.open(res.pdfUrl, "_blank");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inscription à l’événement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {authLoading ? (
            <p className="text-sm text-muted-foreground">
              Chargement de votre profil...
            </p>
          ) : isAuthenticated ? (
            <p className="text-sm text-muted-foreground">
              Vous êtes connecté. Vos informations ont été pré-remplies.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vous pouvez vous inscrire sans créer de compte.
            </p>
          )}

          <div className="space-y-1">
            <Label>Nom complet</Label>
            <Input
              value={form.nomComplet}
              onChange={(e) => setForm({ ...form, nomComplet: e.target.value })}
              placeholder="Nom complet"
            />
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@exemple.com"
              disabled={isAuthenticated}
            />
          </div>

          <div className="space-y-1">
            <Label>Téléphone</Label>
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

          <Button
            className="w-full mt-4"
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
