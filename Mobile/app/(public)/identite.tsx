import { useState } from "react";
import {
  View,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { Stack, router } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChipSelect } from "@/components/ui/chip-select";
import {
  submitIdentite,
  PIECE_TYPES,
  SEXES,
  ETATS_CIVILS,
  type IdentiteForm,
} from "@/services/api/identite";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const initial = (nom = "", email = ""): IdentiteForm => ({
  pieceType: PIECE_TYPES[0],
  pieceNumero: "",
  nom,
  postnom: "",
  prenom: "",
  naissance: "",
  sexe: SEXES[0],
  etatCivil: ETATS_CIVILS[0],
  adresse: "",
  tel: "",
  email,
  paroisse: "",
  urgenceNom: "",
  urgenceLien: "",
  urgenceTelPrincipal: "",
  urgenceTelSecondaire: "",
  urgenceEmail: "",
  allergiesHas: false,
  allergiesDetails: "",
  traitementHas: false,
  traitementDetails: "",
  maladieHas: false,
  maladieDetails: "",
  regimeHas: false,
  regimeDetails: "",
  autres: "",
});

export default function Identite() {
  const user = useSession((s) => s.user);
  const colors = getColors(useColorScheme());
  const [form, setForm] = useState<IdentiteForm>(
    initial(user?.nomComplet ?? "", user?.email ?? ""),
  );
  const [saving, setSaving] = useState(false);

  const up = <K extends keyof IdentiteForm>(k: K, v: IdentiteForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): string | null => {
    const required: (keyof IdentiteForm)[] = [
      "pieceNumero",
      "nom",
      "prenom",
      "naissance",
      "adresse",
      "tel",
      "email",
      "paroisse",
      "urgenceNom",
      "urgenceLien",
      "urgenceTelPrincipal",
      "urgenceEmail",
    ];
    for (const k of required) {
      if (!String(form[k]).trim()) return fr.auth.required;
    }
    const med: [boolean, string][] = [
      [form.allergiesHas, form.allergiesDetails],
      [form.traitementHas, form.traitementDetails],
      [form.maladieHas, form.maladieDetails],
      [form.regimeHas, form.regimeDetails],
    ];
    for (const [has, details] of med) {
      if (has && !details.trim()) return fr.identite.requiredDetails;
    }
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    try {
      setSaving(true);
      await submitIdentite(form);
      toast.success(fr.identite.success);
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.identite.title }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
          <Text variant="muted">{fr.identite.subtitle}</Text>

          <Section title={fr.identite.sectionPiece}>
            <ChipSelect
              label={fr.identite.pieceType}
              options={PIECE_TYPES}
              value={form.pieceType}
              onChange={(v) => up("pieceType", v)}
            />
            <Input
              label={fr.identite.pieceNumero}
              value={form.pieceNumero}
              onChangeText={(v) => up("pieceNumero", v)}
            />
          </Section>

          <Section title={fr.identite.sectionCivil}>
            <Input label={fr.identite.nom} value={form.nom} onChangeText={(v) => up("nom", v)} autoCapitalize="words" />
            <Input label={fr.identite.postnom} value={form.postnom} onChangeText={(v) => up("postnom", v)} autoCapitalize="words" />
            <Input label={fr.identite.prenom} value={form.prenom} onChangeText={(v) => up("prenom", v)} autoCapitalize="words" />
            <Input label={fr.identite.naissance} value={form.naissance} onChangeText={(v) => up("naissance", v)} placeholder="AAAA-MM-JJ" />
            <ChipSelect label={fr.identite.sexe} options={SEXES} value={form.sexe} onChange={(v) => up("sexe", v)} />
            <ChipSelect label={fr.identite.etatCivil} options={ETATS_CIVILS} value={form.etatCivil} onChange={(v) => up("etatCivil", v)} />
          </Section>

          <Section title={fr.identite.sectionCoordonnees}>
            <Input label={fr.identite.adresse} value={form.adresse} onChangeText={(v) => up("adresse", v)} />
            <Input label={fr.identite.tel} value={form.tel} onChangeText={(v) => up("tel", v)} keyboardType="phone-pad" />
            <Input label={fr.identite.email} value={form.email} onChangeText={(v) => up("email", v)} keyboardType="email-address" autoCapitalize="none" />
            <Input label={fr.identite.paroisse} value={form.paroisse} onChangeText={(v) => up("paroisse", v)} />
          </Section>

          <Section title={fr.identite.sectionUrgence}>
            <Input label={fr.identite.urgenceNom} value={form.urgenceNom} onChangeText={(v) => up("urgenceNom", v)} autoCapitalize="words" />
            <Input label={fr.identite.urgenceLien} value={form.urgenceLien} onChangeText={(v) => up("urgenceLien", v)} />
            <Input label={fr.identite.urgenceTelPrincipal} value={form.urgenceTelPrincipal} onChangeText={(v) => up("urgenceTelPrincipal", v)} keyboardType="phone-pad" />
            <Input label={fr.identite.urgenceTelSecondaire} value={form.urgenceTelSecondaire} onChangeText={(v) => up("urgenceTelSecondaire", v)} keyboardType="phone-pad" />
            <Input label={fr.identite.urgenceEmail} value={form.urgenceEmail} onChangeText={(v) => up("urgenceEmail", v)} keyboardType="email-address" autoCapitalize="none" />
          </Section>

          <Section title={fr.identite.sectionSante}>
            <MedicalRow label={fr.identite.allergies} color={colors.primary} muted={colors.muted} card={colors.card} has={form.allergiesHas} onHas={(v) => up("allergiesHas", v)} details={form.allergiesDetails} onDetails={(v) => up("allergiesDetails", v)} />
            <MedicalRow label={fr.identite.traitement} color={colors.primary} muted={colors.muted} card={colors.card} has={form.traitementHas} onHas={(v) => up("traitementHas", v)} details={form.traitementDetails} onDetails={(v) => up("traitementDetails", v)} />
            <MedicalRow label={fr.identite.maladie} color={colors.primary} muted={colors.muted} card={colors.card} has={form.maladieHas} onHas={(v) => up("maladieHas", v)} details={form.maladieDetails} onDetails={(v) => up("maladieDetails", v)} />
            <MedicalRow label={fr.identite.regime} color={colors.primary} muted={colors.muted} card={colors.card} has={form.regimeHas} onHas={(v) => up("regimeHas", v)} details={form.regimeDetails} onDetails={(v) => up("regimeDetails", v)} />
            <Input label={fr.identite.autres} value={form.autres} onChangeText={(v) => up("autres", v)} multiline numberOfLines={3} />
          </Section>

          <Button label={fr.identite.submit} loading={saving} onPress={onSubmit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-4">
      <Heading level={3}>{title}</Heading>
      {children}
    </View>
  );
}

function MedicalRow({
  label,
  has,
  onHas,
  details,
  onDetails,
  color,
  muted,
  card,
}: {
  label: string;
  has: boolean;
  onHas: (v: boolean) => void;
  details: string;
  onDetails: (v: string) => void;
  color: string;
  muted: string;
  card: string;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-foreground">{label}</Text>
        <Switch
          value={has}
          onValueChange={onHas}
          trackColor={{ false: muted, true: color }}
          thumbColor={card}
        />
      </View>
      {has ? (
        <Input value={details} onChangeText={onDetails} placeholder={fr.identite.details} />
      ) : null}
    </View>
  );
}
