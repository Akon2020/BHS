import { useState } from "react";
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  getTaches,
  createTache,
  type StatutTache,
  type PrioriteTache,
  type RecurrenceTache,
} from "@/services/api/taches";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={cn("rounded-full border px-3 py-1.5", active ? "border-primary bg-primary/10" : "border-border")}
    >
      <Text className={cn("text-sm", active && "font-medium text-primary")}>{label}</Text>
    </Pressable>
  );
}

const STATUTS: { value: StatutTache; label: string }[] = [
  { value: "a_faire", label: fr.taches.aFaire },
  { value: "en_cours", label: fr.taches.enCours },
  { value: "fait", label: fr.taches.fait },
];
const PRIORITES: { value: PrioriteTache; label: string }[] = [
  { value: "basse", label: fr.taches.prioriteBasse },
  { value: "normale", label: fr.taches.prioriteNormale },
  { value: "haute", label: fr.taches.prioriteHaute },
];
const RECURRENCES: { value: RecurrenceTache; label: string }[] = [
  { value: "aucune", label: fr.taches.recAucune },
  { value: "quotidien", label: fr.taches.recQuotidien },
  { value: "hebdo", label: fr.taches.recHebdo },
  { value: "mensuel", label: fr.taches.recMensuel },
];

export default function NouvelleTache() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "taches"], queryFn: getTaches });
  const assignables = data?.assignables ?? [];

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState<StatutTache>("a_faire");
  const [priorite, setPriorite] = useState<PrioriteTache>("normale");
  const [recurrence, setRecurrence] = useState<RecurrenceTache>("aucune");
  const [echeance, setEcheance] = useState("");
  const [assignes, setAssignes] = useState<number[]>([]);

  const toggleAssigne = (id: number) =>
    setAssignes((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const create = useMutation({
    mutationFn: () =>
      createTache({
        titre: titre.trim(),
        description: description.trim() || undefined,
        statut,
        priorite,
        recurrence,
        echeance: echeance.trim() || null,
        assignes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "taches"] });
      toast.success(fr.taches.created);
      router.back();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.taches.new }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
          <Input label={fr.taches.titre} value={titre} onChangeText={setTitre} />
          <Input label={fr.taches.description} value={description} onChangeText={setDescription} multiline numberOfLines={4} />
          <Input label={fr.taches.echeance} value={echeance} onChangeText={setEcheance} placeholder="2026-02-01" autoCapitalize="none" />

          <View className="gap-1.5">
            <Text variant="label">{fr.taches.statut}</Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUTS.map((s) => (
                <Chip key={s.value} label={s.label} active={statut === s.value} onPress={() => setStatut(s.value)} />
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Text variant="label">{fr.taches.priorite}</Text>
            <View className="flex-row flex-wrap gap-2">
              {PRIORITES.map((p) => (
                <Chip key={p.value} label={p.label} active={priorite === p.value} onPress={() => setPriorite(p.value)} />
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Text variant="label">{fr.taches.recurrence}</Text>
            <View className="flex-row flex-wrap gap-2">
              {RECURRENCES.map((r) => (
                <Chip key={r.value} label={r.label} active={recurrence === r.value} onPress={() => setRecurrence(r.value)} />
              ))}
            </View>
          </View>

          {assignables.length > 0 ? (
            <View className="gap-1.5">
              <Text variant="label">{fr.taches.assignes}</Text>
              <View className="flex-row flex-wrap gap-2">
                {assignables.map((a) => (
                  <Chip
                    key={a.idUtilisateur}
                    label={a.nomComplet}
                    active={assignes.includes(a.idUtilisateur)}
                    onPress={() => toggleAssigne(a.idUtilisateur)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <Button
            label={fr.taches.create}
            loading={create.isPending}
            disabled={!titre.trim()}
            onPress={() => create.mutate()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
