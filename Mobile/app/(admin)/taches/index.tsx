import { useMemo, useState } from "react";
import { View, Pressable, useColorScheme } from "react-native";
import { Stack, router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import {
  getTaches,
  updateTache,
  type StatutTache,
  type PrioriteTache,
  type Tache,
} from "@/services/api/taches";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const COLONNES: { key: StatutTache; label: string }[] = [
  { key: "a_faire", label: fr.taches.aFaire },
  { key: "en_cours", label: fr.taches.enCours },
  { key: "fait", label: fr.taches.fait },
];
const ORDRE: StatutTache[] = ["a_faire", "en_cours", "fait"];

const PRIORITE: Record<PrioriteTache, { label: string; tone: "muted" | "primary" | "destructive" }> = {
  basse: { label: fr.taches.prioriteBasse, tone: "muted" },
  normale: { label: fr.taches.prioriteNormale, tone: "primary" },
  haute: { label: fr.taches.prioriteHaute, tone: "destructive" },
};

export default function TachesBoard() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const [colonne, setColonne] = useState<StatutTache>("a_faire");

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "taches"],
    queryFn: getTaches,
  });

  const move = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: StatutTache }) =>
      updateTache(id, { statut }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "taches"] }),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const counts = useMemo(() => {
    const c: Record<StatutTache, number> = { a_faire: 0, en_cours: 0, fait: 0 };
    (data?.taches ?? []).forEach((t) => (c[t.statut] += 1));
    return c;
  }, [data]);

  const list = (data?.taches ?? []).filter((t) => t.statut === colonne);

  const changeStatut = (t: Tache, dir: 1 | -1) => {
    const idx = ORDRE.indexOf(t.statut);
    const next = ORDRE[idx + dir];
    if (next) move.mutate({ id: t.idTache, statut: next });
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.taches.title,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(admin)/taches/nouveau")}
              accessibilityLabel={fr.taches.new}
              className="px-2"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View className="mx-5 mt-3 flex-row gap-1 rounded-lg bg-muted p-1">
        {COLONNES.map((col) => {
          const active = colonne === col.key;
          return (
            <Pressable
              key={col.key}
              onPress={() => setColonne(col.key)}
              className={cn("flex-1 flex-row items-center justify-center gap-1.5 rounded-md px-2 py-1.5", active && "bg-card")}
            >
              <Text className={cn("text-xs", active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {col.label}
              </Text>
              <View className="rounded-full bg-primary/10 px-1.5">
                <Text className="text-[11px] font-semibold tabular-nums text-primary">{counts[col.key]}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={96} />
          <Skeleton height={96} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.taches.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState title={fr.taches.emptyColumn} />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(t) => String(t.idTache)}
          renderItem={({ item }) => {
            const idx = ORDRE.indexOf(item.statut);
            return (
              <Pressable
                onPress={() => router.push(`/(admin)/taches/${item.idTache}`)}
                className="gap-2 rounded-xl border border-border bg-card p-4 active:opacity-90"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <Text className="min-w-0 flex-1 font-semibold" numberOfLines={2}>{item.titre}</Text>
                  <Badge label={PRIORITE[item.priorite].label} tone={PRIORITE[item.priorite].tone} />
                </View>
                <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                  {item.echeance ? (
                    <Text variant="small">📅 {formatDate(item.echeance)}</Text>
                  ) : null}
                  {item.assignesDetails && item.assignesDetails.length > 0 ? (
                    <Text variant="small" numberOfLines={1}>
                      👥 {item.assignesDetails.map((a) => a.nomComplet).join(", ")}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-row justify-end gap-2 pt-1">
                  {idx > 0 ? (
                    <Button label={fr.taches.movePrev} variant="outline" size="md" onPress={() => changeStatut(item, -1)} />
                  ) : null}
                  {idx < ORDRE.length - 1 ? (
                    <Button label={fr.taches.moveNext} size="md" onPress={() => changeStatut(item, 1)} />
                  ) : null}
                </View>
              </Pressable>
            );
          }}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </Screen>
  );
}
