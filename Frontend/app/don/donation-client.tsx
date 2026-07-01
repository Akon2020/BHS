"use client";

import { useState } from "react";
import {
  Building2,
  Smartphone,
  CreditCard,
  Copy,
  Check,
  Loader2,
  HandHeart,
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
import { toast } from "@/components/ui/use-toast";
import { createDon } from "@/actions/don";
import type { DonMoyen } from "@/types/user";

const MOBILE_MONEY = "+243 849 005 240";

// Coordonnées bancaires — à compléter avec les vraies informations.
const BANK_DETAILS = [
  { label: "Bénéficiaire", value: "Burning Heart" },
  { label: "Banque", value: "À compléter" },
  { label: "Numéro de compte", value: "À compléter" },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ title: "Copié", description: value });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ variant: "destructive", title: "Copie impossible" });
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={copy}
      aria-label="Copier"
      className="h-8 w-8 shrink-0"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

export function DonationClient() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    montant: "",
    devise: "USD",
    moyen: "mobile" as DonMoyen,
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.email.trim()) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Votre nom et votre email sont requis.",
      });
      return;
    }
    try {
      setLoading(true);
      await createDon({
        nom: form.nom.trim(),
        email: form.email.trim(),
        montant: form.montant ? Number(form.montant) : undefined,
        devise: form.devise,
        moyen: form.moyen,
        message: form.message.trim() || undefined,
      });
      toast({
        title: "Merci !",
        description:
          "Votre intention de don a bien été enregistrée. Un email de confirmation vous a été envoyé.",
      });
      setForm({
        nom: "",
        email: "",
        montant: "",
        devise: "USD",
        moyen: "mobile",
        message: "",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Enregistrement impossible.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Moyens de don */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Virement bancaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Coordonnées bancaires pour votre virement :
            </p>
            <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
              {BANK_DETAILS.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-muted-foreground">{d.label} :</span>
                  <span className="flex items-center gap-1 text-right font-medium">
                    {d.value}
                    {d.value !== "À compléter" && <CopyButton value={d.value} />}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Mobile Money
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Envoyez votre don au numéro Mobile Money :
            </p>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-4">
              <p className="text-center text-lg font-semibold">
                {MOBILE_MONEY}
              </p>
              <CopyButton value={MOBILE_MONEY} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Carte bancaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Le paiement par carte en ligne sera bientôt disponible. En
              attendant, déclarez votre don ci-dessous : nous vous
              recontacterons pour le finaliser.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'intention */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-primary" />
            Je déclare un don
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nom">
                  Nom complet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nom: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (optionnel)</Label>
                <Input
                  id="montant"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.montant}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, montant: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Devise</Label>
                <Select
                  value={form.devise}
                  onValueChange={(v) => setForm((f) => ({ ...f, devise: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CDF">CDF</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Moyen</Label>
                <Select
                  value={form.moyen}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, moyen: v as DonMoyen }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                    <SelectItem value="virement">Virement bancaire</SelectItem>
                    <SelectItem value="carte">Carte bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                rows={3}
                placeholder="Une intention, une dédicace…"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Déclarer mon don"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
