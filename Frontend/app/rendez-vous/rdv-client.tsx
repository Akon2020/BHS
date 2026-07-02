"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Loader2, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  getParametreAgenda,
  getCreneauxDisponibles,
  reserverRdv,
  suiviRdv,
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

export default function RdvClient() {
  const [param, setParam] = useState<ParametreAgenda | null>(null);
  const [creneaux, setCreneaux] = useState<CreneauRdv[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    idCreneau: "",
    nom: "",
    email: "",
    telephone: "",
    motif: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [suiviEmail, setSuiviEmail] = useState("");
  const [suivi, setSuivi] = useState<RendezVous[] | null>(null);
  const [suiviLoading, setSuiviLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([
        getParametreAgenda(),
        getCreneauxDisponibles(),
      ]);
      setParam(p);
      setCreneaux(c.creneaux);
    } catch {
      /* silencieux */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idCreneau || !form.nom || !form.email || !form.telephone) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Choisissez un créneau et renseignez vos coordonnées.",
      });
      return;
    }
    try {
      setSubmitting(true);
      await reserverRdv({
        idCreneau: Number(form.idCreneau),
        nom: form.nom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        motif: form.motif.trim() || undefined,
      });
      toast({
        title: "Demande envoyée 🙏",
        description:
          "Votre demande de rendez-vous est en attente de confirmation. Un email vous a été envoyé.",
      });
      setForm({ idCreneau: "", nom: "", email: "", telephone: "", motif: "" });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Réservation impossible.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuivi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suiviEmail.trim()) return;
    try {
      setSuiviLoading(true);
      const res = await suiviRdv(suiviEmail.trim());
      setSuivi(res.rendezVous);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message,
      });
    } finally {
      setSuiviLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Prendre rendez-vous
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {param?.message ||
              `Réservez un créneau avec ${param?.coordinateurNom || "le coordinateur"}.`}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Réservation */}
          <Card>
            <CardHeader>
              <CardTitle>Réserver un créneau</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : creneaux.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucun créneau disponible pour le moment. Revenez plus tard.
                </p>
              ) : (
                <form onSubmit={handleReserve} className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Créneau <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.idCreneau}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, idCreneau: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un créneau" />
                      </SelectTrigger>
                      <SelectContent>
                        {creneaux.map((c) => (
                          <SelectItem
                            key={c.idCreneau}
                            value={String(c.idCreneau)}
                          >
                            {new Date(c.date).toLocaleDateString("fr-FR")} ·{" "}
                            {c.heureDebut?.slice(0, 5)}–{c.heureFin?.slice(0, 5)}
                            {typeof c.reste === "number"
                              ? ` (${c.reste} place${c.reste > 1 ? "s" : ""})`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <div className="space-y-2">
                      <Label htmlFor="tel">
                        Téléphone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="tel"
                        value={form.telephone}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, telephone: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motif">Motif (optionnel)</Label>
                    <Textarea
                      id="motif"
                      rows={3}
                      value={form.motif}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, motif: e.target.value }))
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? "Envoi..." : "Demander le rendez-vous"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Suivi */}
          <Card>
            <CardHeader>
              <CardTitle>Suivre ma demande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSuivi} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Votre email"
                  value={suiviEmail}
                  onChange={(e) => setSuiviEmail(e.target.value)}
                />
                <Button type="submit" variant="outline" disabled={suiviLoading}>
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {suiviLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : suivi === null ? (
                <p className="text-sm text-muted-foreground">
                  Entrez votre email pour voir vos rendez-vous.
                </p>
              ) : suivi.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune demande trouvée pour cet email.
                </p>
              ) : (
                <ul className="space-y-3">
                  {suivi.map((r) => (
                    <li
                      key={r.idRendezVous}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {new Date(r.date).toLocaleDateString("fr-FR")} ·{" "}
                          {r.heureDebut?.slice(0, 5)}
                        </p>
                        {r.motif && (
                          <p className="truncate text-xs text-muted-foreground">
                            {r.motif}
                          </p>
                        )}
                      </div>
                      <Badge variant={STATUT[r.statut].variant}>
                        {STATUT[r.statut].label}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
