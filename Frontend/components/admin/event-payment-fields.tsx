"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ChampPersonnalise, TypeChampPersonnalise } from "@/types/user";

export interface PaymentFieldsValue {
  estPayant: boolean;
  montant: string;
  devise: string;
  champs: ChampPersonnalise[];
}

const TYPE_LABELS: Record<TypeChampPersonnalise, string> = {
  texte: "Texte court",
  textarea: "Zone de texte",
  email: "Email",
  telephone: "Téléphone",
  nombre: "Nombre",
  select: "Liste déroulante",
  checkbox: "Case à cocher",
  date: "Date",
  fichier: "Fichier (téléversement)",
};

const genId = () =>
  `champ_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export function EventPaymentFields({
  value,
  onChange,
}: {
  value: PaymentFieldsValue;
  onChange: (v: PaymentFieldsValue) => void;
}) {
  const patch = (partial: Partial<PaymentFieldsValue>) =>
    onChange({ ...value, ...partial });

  const updateChamp = (id: string, partial: Partial<ChampPersonnalise>) =>
    patch({
      champs: value.champs.map((c) =>
        c.id === id ? { ...c, ...partial } : c,
      ),
    });

  const addChamp = () =>
    patch({
      champs: [
        ...value.champs,
        { id: genId(), type: "texte", label: "", requis: false },
      ],
    });

  const removeChamp = (id: string) =>
    patch({ champs: value.champs.filter((c) => c.id !== id) });

  return (
    <div className="space-y-6">
      {/* Paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="estPayant">Événement payant</Label>
              <p className="text-sm text-muted-foreground">
                Si activé, l'inscription nécessite un paiement (suivi manuel).
              </p>
            </div>
            <Switch
              id="estPayant"
              checked={value.estPayant}
              onCheckedChange={(checked) => patch({ estPayant: checked })}
            />
          </div>

          {value.estPayant && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="montant">Montant</Label>
                <Input
                  id="montant"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex. 10"
                  value={value.montant}
                  onChange={(e) => patch({ montant: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Devise</Label>
                <Select
                  value={value.devise}
                  onValueChange={(v) => patch({ devise: v })}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Champs personnalisés */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Champs d'inscription personnalisés</CardTitle>
              <p className="text-sm text-muted-foreground">
                En plus des champs de base (nom, email, téléphone, sexe).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addChamp}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un champ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.champs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun champ personnalisé.
            </p>
          ) : (
            value.champs.map((champ) => (
              <div
                key={champ.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-xs">Champ</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeChamp(champ.id)}
                    aria-label="Supprimer le champ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Libellé (affiché à l'utilisateur)</Label>
                    <Input
                      placeholder="Ex. Entrez votre paroisse"
                      value={champ.label}
                      onChange={(e) =>
                        updateChamp(champ.id, { label: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={champ.type}
                      onValueChange={(v) =>
                        updateChamp(champ.id, {
                          type: v as TypeChampPersonnalise,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(TYPE_LABELS) as TypeChampPersonnalise[]
                        ).map((t) => (
                          <SelectItem key={t} value={t}>
                            {TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {champ.type === "select" && (
                  <div className="space-y-2">
                    <Label>Options (séparées par une virgule)</Label>
                    <Input
                      placeholder="Option 1, Option 2, Option 3"
                      value={(champ.options || []).join(", ")}
                      onChange={(e) =>
                        updateChamp(champ.id, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`requis-${champ.id}`}
                    checked={!!champ.requis}
                    onCheckedChange={(checked) =>
                      updateChamp(champ.id, { requis: checked === true })
                    }
                  />
                  <Label htmlFor={`requis-${champ.id}`} className="text-sm">
                    Champ obligatoire
                  </Label>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
