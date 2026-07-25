import { View, Pressable } from "react-native";
import { Stack, router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getEvenementsAdmin } from "@/services/api/evenements";
import type { EvenementStatut } from "@/services/api/evenements/types";
import { formatDate } from "@/utils/format";
import { fr } from "@/i18n/fr";

const STATUT: Record<EvenementStatut, { label: string; tone: "muted" | "success" | "destructive" | "primary" }> = {
  brouillon: { label: fr.adminEvents.draft, tone: "muted" },
  publie: { label: fr.adminEvents.published, tone: "success" },
  annule: { label: fr.adminEvents.cancelled, tone: "destructive" },
  termine: { label: fr.adminEvents.finished, tone: "primary" },
};

export default function AdminEvenementsList() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "evenements"],
    queryFn: getEvenementsAdmin,
  });

  const events = data ?? [];

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.adminEvents.title }} />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={80} />
          <Skeleton height={80} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.adminEvents.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : events.length === 0 ? (
        <EmptyState title={fr.adminEvents.empty} />
      ) : (
        <FlashList
          data={events}
          keyExtractor={(e) => String(e.idEvenement)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(admin)/evenements/${item.idEvenement}`)}
              className="gap-2 rounded-xl border border-border bg-card p-4 active:opacity-90"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="min-w-0 flex-1 text-base font-semibold" numberOfLines={1}>
                  {item.titre}
                </Text>
                <Badge label={STATUT[item.statut].label} tone={STATUT[item.statut].tone} />
              </View>
              <View className="flex-row items-center gap-2">
                <Text variant="small">{formatDate(item.dateEvenement)}</Text>
                <Badge
                  label={item.estPayant ? fr.adminEvents.paid : fr.adminEvents.free}
                  tone={item.estPayant ? "warning" : "muted"}
                />
                <Text variant="small">
                  {item.nombreInscrits} {fr.adminEvents.inscrits.toLowerCase()}
                </Text>
              </View>
            </Pressable>
          )}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </Screen>
  );
}
