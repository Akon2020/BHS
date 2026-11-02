"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDemandePriere } from "@/actions/priere";

const INTENTION_MAX = 2000;

const formVide = {
  prenom: "",
  email: "",
  intention: "",
  partagePublic: false,
  siteWeb: "",
};

export function PriereForm() {
  const [form, setForm] = useState(formVide);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    if (form.intention.trim().length < 5) {
      setErreur("Merci de décrire votre intention (au moins 5 caractères).");
      return;
    }

    try {
      setEnvoi(true);
      const message = await createDemandePriere({
        prenom: form.prenom.trim() || undefined,
        email: form.email.trim() || undefined,
        intention: form.intention.trim(),
        partagePublic: form.partagePublic,
        siteWeb: form.siteWeb || undefined,
      });
      setSucces(message);
      setForm(formVide);
    } catch (error: any) {
      setErreur(error?.message || "L'envoi a échoué. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

  if (succes) {
    return (
      <div
        role="status"
        className="flex flex-col items-center rounded-2xl border bg-card px-6 py-12 text-center shadow-sm"
      >
        <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden />
        <h3 className="mt-4 font-serif text-2xl font-bold">
          Intention bien reçue
        </h3>
        <p className="mt-2 max-w-md text-muted-foreground">{succes}</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setSucces(null)}
        >
          Confier une autre intention
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priere-prenom">Prénom</Label>
          <Input
            id="priere-prenom"
            autoComplete="given-name"
            maxLength={100}
            placeholder="Facultatif"
            value={form.prenom}
            onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priere-email">Email</Label>
          <Input
            id="priere-email"
            type="email"
            autoComplete="email"
            maxLength={150}
            placeholder="Facultatif"
            aria-describedby="priere-email-aide"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <p id="priere-email-aide" className="text-xs text-muted-foreground">
            Jamais affiché. Seule l&apos;équipe peut le voir.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priere-intention">
          Votre intention <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="priere-intention"
          rows={6}
          required
          maxLength={INTENTION_MAX}
          placeholder="Pour qui, ou pour quoi, souhaitez-vous que nous priions ?"
          aria-invalid={!!erreur}
          aria-describedby="priere-intention-compteur"
          value={form.intention}
          onChange={(e) =>
            setForm((f) => ({ ...f, intention: e.target.value }))
          }
        />
        <p
          id="priere-intention-compteur"
          className="text-right text-xs tabular-nums text-muted-foreground"
        >
          {form.intention.length} / {INTENTION_MAX}
        </p>
      </div>

      {/* Champ piège anti-robot, invisible pour les visiteurs. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="priere-site">Site web</label>
        <input
          id="priere-site"
          tabIndex={-1}
          autoComplete="off"
          value={form.siteWeb}
          onChange={(e) => setForm((f) => ({ ...f, siteWeb: e.target.value }))}
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
        <Checkbox
          id="priere-partage"
          className="mt-0.5"
          checked={form.partagePublic}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, partagePublic: v === true }))
          }
        />
        <div className="space-y-1">
          <Label htmlFor="priere-partage" className="leading-snug">
            J&apos;accepte que mon intention soit partagée sur la Table de
            prière
          </Label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Seuls votre prénom et votre intention (éventuellement reformulée
            avec discrétion) seront affichés. Sans votre accord, elle reste
            confidentielle et n&apos;est connue que de l&apos;équipe de prière.
          </p>
        </div>
      </div>

      {erreur && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {erreur}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full gap-2"
        disabled={envoi}
      >
        {envoi ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
        {envoi ? "Envoi en cours..." : "Confier mon intention"}
      </Button>
    </form>
  );
}
