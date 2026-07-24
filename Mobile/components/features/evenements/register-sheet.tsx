import { useState } from "react";
import { View, ScrollView, Switch, Pressable, useColorScheme } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";
import { registerToEvent } from "@/services/api/evenements";
import type {
  ChampPersonnalise,
  ChampFichier,
  Evenement,
} from "@/services/api/evenements/types";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

interface Props {
  visible: boolean;
  onClose: () => void;
  event: Evenement;
}

export function RegisterSheet({ visible, onClose, event }: Props) {
  const user = useSession((s) => s.user);
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const champs = Array.isArray(event.champsPersonnalises)
    ? event.champsPersonnalises
    : [];

  const [base, setBase] = useState({
    nomComplet: user?.nomComplet ?? "",
    email: user?.email ?? "",
    telephone: "",
    sexe: "homme" as "homme" | "femme",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, ChampFichier>>({});

  const setAnswer = (id: string, v: string) =>
    setAnswers((prev) => ({ ...prev, [id]: v }));

  const pickFile = async (champId: string) => {
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    setFiles((prev) => ({
      ...prev,
      [champId]: {
        champId,
        uri: a.uri,
        name: a.name ?? "fichier",
        mimeType: a.mimeType ?? "application/octet-stream",
      },
    }));
  };

  const validate = (): string | null => {
    if (!base.nomComplet.trim() || !base.email.trim() || !base.telephone.trim()) {
      return fr.auth.required;
    }
    for (const c of champs) {
      if (!c.requis) continue;
      if (c.type === "fichier" ? !files[c.id] : !answers[c.id]) {
        return `« ${c.label} » : ${fr.evenements.requiredField}`;
      }
    }
    return null;
  };

  const mutation = useMutation({
    mutationFn: () => {
      const reponses: Record<string, string> = {};
      for (const c of champs) {
        if (c.type !== "fichier" && answers[c.id] !== undefined) {
          reponses[c.id] = answers[c.id];
        }
      }
      return registerToEvent(event.slug, base, reponses, Object.values(files));
    },
    onSuccess: () => {
      toast.success(
        event.estPayant
          ? fr.evenements.registerSuccessPaid
          : fr.evenements.registerSuccessFree,
      );
      queryClient.invalidateQueries({ queryKey: ["evenement", event.slug] });
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const submit = () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    mutation.mutate();
  };

  const renderChamp = (c: ChampPersonnalise) => {
    const label = `${c.label}${c.requis ? " *" : ""}`;
    switch (c.type) {
      case "textarea":
        return (
          <Input
            key={c.id}
            label={label}
            multiline
            numberOfLines={3}
            value={answers[c.id] ?? ""}
            onChangeText={(v) => setAnswer(c.id, v)}
          />
        );
      case "select":
        return (
          <View key={c.id} className="gap-1.5">
            <Text variant="label">{label}</Text>
            <View className="flex-row flex-wrap gap-2">
              {(c.options ?? []).map((opt) => {
                const active = answers[c.id] === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setAnswer(c.id, opt)}
                    className={cn(
                      "rounded-full border px-3 py-1.5",
                      active ? "border-primary bg-primary/10" : "border-border",
                    )}
                  >
                    <Text className={cn("text-sm", active && "text-primary")}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      case "checkbox":
        return (
          <View key={c.id} className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-sm text-foreground">{label}</Text>
            <Switch
              value={answers[c.id] === "oui"}
              onValueChange={(v) => setAnswer(c.id, v ? "oui" : "non")}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        );
      case "fichier": {
        const f = files[c.id];
        return (
          <View key={c.id} className="gap-1.5">
            <Text variant="label">{label}</Text>
            <Button
              label={f ? f.name : fr.evenements.pickFile}
              variant="outline"
              onPress={() => pickFile(c.id)}
            />
          </View>
        );
      }
      default:
        return (
          <Input
            key={c.id}
            label={label}
            value={answers[c.id] ?? ""}
            onChangeText={(v) => setAnswer(c.id, v)}
            keyboardType={
              c.type === "email"
                ? "email-address"
                : c.type === "nombre"
                  ? "numeric"
                  : c.type === "tel"
                    ? "phone-pad"
                    : "default"
            }
            autoCapitalize={c.type === "email" ? "none" : "sentences"}
          />
        );
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={fr.evenements.registerTitle}>
      <ScrollView
        style={{ maxHeight: 460 }}
        contentContainerStyle={{ gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={fr.evenements.nomComplet}
          value={base.nomComplet}
          onChangeText={(v) => setBase((b) => ({ ...b, nomComplet: v }))}
          autoCapitalize="words"
        />
        <Input
          label={fr.evenements.email}
          value={base.email}
          onChangeText={(v) => setBase((b) => ({ ...b, email: v }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label={fr.evenements.telephone}
          value={base.telephone}
          onChangeText={(v) => setBase((b) => ({ ...b, telephone: v }))}
          keyboardType="phone-pad"
        />

        <View className="gap-1.5">
          <Text variant="label">{fr.evenements.sexe}</Text>
          <View className="flex-row gap-2">
            {(["homme", "femme"] as const).map((s) => {
              const active = base.sexe === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setBase((b) => ({ ...b, sexe: s }))}
                  className={cn(
                    "flex-1 items-center rounded-lg border py-2.5",
                    active ? "border-primary bg-primary/10" : "border-border",
                  )}
                >
                  <Text className={cn(active && "text-primary")}>
                    {s === "homme" ? fr.evenements.homme : fr.evenements.femme}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {champs.map(renderChamp)}

        <Button
          label={fr.evenements.register}
          loading={mutation.isPending}
          onPress={submit}
        />
      </ScrollView>
    </Sheet>
  );
}
