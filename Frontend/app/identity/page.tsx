"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { createIdentity } from "@/actions/identity";
import { IdentityFormPayload } from "@/types/user";
import { FileText, Loader2, Save } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

const initialFormData: IdentityFormPayload = {
  identite: {
    piece: {
      type: "carte d'électeur",
      numero: "",
    },
    nom: "",
    postnom: "",
    prenom: "",
    naissance: "",
    sexe: "Masculin",
    etatCivil: "Célibataire",
    adresse: "",
    tel: "",
    email: "",
    paroisse: "",
  },
  urgence: {
    nom: "",
    lien: "",
    tel: {
      principal: "",
      secondaire: "",
    },
    email: "",
  },
  medical: {
    allergies: { has: false, details: "" },
    traitement: { has: false, details: "" },
    maladie: { has: false, details: "" },
    regime: { has: false, details: "" },
    autres: "",
  },
};

export default function IdentityPage() {
  const [formData, setFormData] =
    useState<IdentityFormPayload>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullNamePreview = useMemo(() => {
    return [
      formData.identite.nom,
      formData.identite.postnom,
      formData.identite.prenom,
    ]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" ");
  }, [
    formData.identite.nom,
    formData.identite.postnom,
    formData.identite.prenom,
  ]);

  const onIdentiteChange =
    (field: keyof IdentityFormPayload["identite"]) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        identite: {
          ...prev.identite,
          [field]: value,
        },
      }));
    };

  const onUrgenceChange =
    (field: keyof IdentityFormPayload["urgence"]) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        urgence: {
          ...prev.urgence,
          [field]: value,
        },
      }));
    };

  const onUrgenceTelChange =
    (field: keyof IdentityFormPayload["urgence"]["tel"]) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        urgence: {
          ...prev.urgence,
          tel: {
            ...prev.urgence.tel,
            [field]: value,
          },
        },
      }));
    };

  const onMedicalToggleChange =
    (field: "allergies" | "traitement" | "maladie" | "regime") =>
    (checked: boolean) => {
      setFormData((prev) => ({
        ...prev,
        medical: {
          ...prev.medical,
          [field]: {
            ...prev.medical[field],
            has: checked,
            details: checked ? prev.medical[field].details : "",
          },
        },
      }));
    };

  const onMedicalDetailsChange =
    (field: "allergies" | "traitement" | "maladie" | "regime") =>
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        medical: {
          ...prev.medical,
          [field]: {
            ...prev.medical[field],
            details: value,
          },
        },
      }));
    };

  const validateMedicalDetails = () => {
    const checks: Array<{
      enabled: boolean;
      details: string;
      label: string;
    }> = [
      {
        enabled: formData.medical.allergies.has,
        details: formData.medical.allergies.details,
        label: "allergies",
      },
      {
        enabled: formData.medical.traitement.has,
        details: formData.medical.traitement.details,
        label: "traitement",
      },
      {
        enabled: formData.medical.maladie.has,
        details: formData.medical.maladie.details,
        label: "maladie",
      },
      {
        enabled: formData.medical.regime.has,
        details: formData.medical.regime.details,
        label: "régime",
      },
    ];

    const invalid = checks.find(
      (item) => item.enabled && item.details.trim().length === 0,
    );

    if (!invalid) return true;

    toast({
      title: "Précision requise",
      description: `Veuillez renseigner les détails pour ${invalid.label}.`,
      variant: "destructive",
    });

    return false;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateMedicalDetails()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: IdentityFormPayload = {
        ...formData,
        identite: {
          ...formData.identite,
          nom: formData.identite.nom.trim(),
          postnom: formData.identite.postnom.trim(),
          prenom: formData.identite.prenom.trim(),
          adresse: formData.identite.adresse.trim(),
          tel: formData.identite.tel.trim(),
          email: formData.identite.email.trim(),
          paroisse: formData.identite.paroisse.trim(),
          piece: {
            ...formData.identite.piece,
            numero: formData.identite.piece.numero.trim(),
          },
        },
        urgence: {
          ...formData.urgence,
          nom: formData.urgence.nom.trim(),
          lien: formData.urgence.lien.trim(),
          email: formData.urgence.email.trim(),
          tel: {
            principal: formData.urgence.tel.principal.trim(),
            secondaire: formData.urgence.tel.secondaire?.trim() || "",
          },
        },
        medical: {
          ...formData.medical,
          autres: formData.medical.autres.trim(),
        },
      };

      const response = await createIdentity(payload);

      toast({
        title: "Soumission réussie",
        description:
          response.emailStatus ||
          "Votre fiche d'identité a été enregistrée avec succès.",
      });

      setFormData(initialFormData);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.message ||
          "Une erreur est survenue pendant la soumission de votre identité.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <section className="bg-linear-to-b from-muted/30 to-background py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Soumission d'identité
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Complétez votre fiche d'identité pour finaliser votre dossier. Les
              champs marqués d'une étoile sont obligatoires.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Identité
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de pièce *</label>
                  <Select
                    value={formData.identite.piece.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        identite: {
                          ...prev.identite,
                          piece: {
                            ...prev.identite.piece,
                            type: value as IdentityFormPayload["identite"]["piece"]["type"],
                          },
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carte d'électeur">
                        Carte d'électeur
                      </SelectItem>
                      <SelectItem value="carte d'étudiant">
                        Carte d'étudiant
                      </SelectItem>
                      <SelectItem value="carte d'élève">
                        Carte d'élève
                      </SelectItem>
                      <SelectItem value="passeport">Passeport</SelectItem>
                      <SelectItem value="carte de baptême">
                        Carte de baptême
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Numéro de pièce *
                  </label>
                  <Input
                    required
                    value={formData.identite.piece.numero}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        identite: {
                          ...prev.identite,
                          piece: {
                            ...prev.identite.piece,
                            numero: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Numéro de la pièce"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom *</label>
                  <Input
                    required
                    value={formData.identite.nom}
                    onChange={onIdentiteChange("nom")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Postnom *</label>
                  <Input
                    required
                    value={formData.identite.postnom}
                    onChange={onIdentiteChange("postnom")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prénom *</label>
                  <Input
                    required
                    value={formData.identite.prenom}
                    onChange={onIdentiteChange("prenom")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Date de naissance *
                  </label>
                  <Input
                    required
                    type="date"
                    value={formData.identite.naissance}
                    onChange={onIdentiteChange("naissance")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sexe *</label>
                  <Select
                    value={formData.identite.sexe}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        identite: {
                          ...prev.identite,
                          sexe: value as IdentityFormPayload["identite"]["sexe"],
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculin">Masculin</SelectItem>
                      <SelectItem value="Feminin">Feminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">État civil *</label>
                  <Select
                    value={formData.identite.etatCivil}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        identite: {
                          ...prev.identite,
                          etatCivil:
                            value as IdentityFormPayload["identite"]["etatCivil"],
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Célibataire">Célibataire</SelectItem>
                      <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                      <SelectItem value="Veuf(ve)">Veuf(ve)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Adresse *</label>
                  <Textarea
                    required
                    rows={3}
                    value={formData.identite.adresse}
                    onChange={onIdentiteChange("adresse")}
                    placeholder="Votre adresse complète"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone *</label>
                  <Input
                    required
                    value={formData.identite.tel}
                    onChange={onIdentiteChange("tel")}
                    placeholder="Ex: +243..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    required
                    type="email"
                    value={formData.identite.email}
                    onChange={onIdentiteChange("email")}
                    placeholder="votre.email@domaine.com"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Paroisse *</label>
                  <Input
                    required
                    value={formData.identite.paroisse}
                    onChange={onIdentiteChange("paroisse")}
                    placeholder="Nom de votre paroisse"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Contact d'urgence</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom complet *</label>
                  <Input
                    required
                    value={formData.urgence.nom}
                    onChange={onUrgenceChange("nom")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Lien avec vous *
                  </label>
                  <Input
                    required
                    value={formData.urgence.lien}
                    onChange={onUrgenceChange("lien")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Téléphone principal *
                  </label>
                  <Input
                    required
                    value={formData.urgence.tel.principal}
                    onChange={onUrgenceTelChange("principal")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Téléphone secondaire
                  </label>
                  <Input
                    value={formData.urgence.tel.secondaire || ""}
                    onChange={onUrgenceTelChange("secondaire")}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">
                    Email du contact d'urgence *
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.urgence.email}
                    onChange={onUrgenceChange("email")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Informations médicales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {(
                  [
                    ["allergies", "Allergies"],
                    ["traitement", "Traitement en cours"],
                    ["maladie", "Maladie connue"],
                    ["regime", "Régime alimentaire particulier"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium">{label}</p>
                      <Switch
                        checked={formData.medical[field].has}
                        onCheckedChange={onMedicalToggleChange(field)}
                      />
                    </div>

                    {formData.medical[field].has && (
                      <div className="mt-3 space-y-2">
                        <label className="text-sm text-muted-foreground">
                          Détails *
                        </label>
                        <Textarea
                          rows={3}
                          value={formData.medical[field].details}
                          onChange={onMedicalDetailsChange(field)}
                          placeholder={`Précisez les informations sur ${label.toLowerCase()}`}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Autres informations
                  </label>
                  <Textarea
                    rows={3}
                    value={formData.medical.autres}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        medical: {
                          ...prev.medical,
                          autres: e.target.value,
                        },
                      }))
                    }
                    placeholder="Informations complémentaires si nécessaire"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-primary/5 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Aperçu du dossier
                  </p>
                  <p className="text-lg font-semibold">
                    {fullNamePreview || "Nom non renseigné"}
                  </p>
                </div>

                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Soumission...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Soumettre l'identité
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
