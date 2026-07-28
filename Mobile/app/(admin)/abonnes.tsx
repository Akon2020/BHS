import { View } from "react-native";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getAbonnes, type AbonneStatut } from "@/services/api/abonnes";
import { formatDate } from "@/utils/format";
import { fr } from "@/i18n/fr";

const STATUT: Record<AbonneStatut, { label: string; tone: "success" | "muted" | "warning" }> = {
  actif: { label: fr.abonnes.actif, tone: "success" },
  inactif: { label: fr.abonnes.inactif, tone: "warning" },
  desabonne: { label: fr.abonnes.desabonne, tone: "muted" },
};

export default function AbonnesList() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "abonnes"],
    queryFn: getAbonnes,
  });

  const items = data ?? [];

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.abonnes.title }} />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={64} />
          <Skeleton height={64} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.abonnes.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : items.length === 0 ? (
        <EmptyState title={fr.abonnes.empty} />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(a) => String(a.idAbonne)}
          ListHeaderComponent={
            <Text variant="small" className="mb-3">
              {fr.abonnes.total} : {items.length}
            </Text>
          }
          renderItem={({ item }) => (
            <View className="gap-1 rounded-xl border border-border bg-card p-4">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="min-w-0 flex-1 text-base font-semibold" numberOfLines={1}>
                  {item.nomComplet}
                </Text>
                <Badge label={STATUT[item.statut].label} tone={STATUT[item.statut].tone} />
              </View>
              <Text className="text-sm" numberOfLines={1}>
                {item.email}
              </Text>
              <Text variant="small">{formatDate(item.dateAbonnement)}</Text>
            </View>
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
