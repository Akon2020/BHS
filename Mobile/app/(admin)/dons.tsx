import { View } from "react-native";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getDons, updateDonStatut, type Don } from "@/services/api/dons";
import { getApiErrorMessage } from "@/services/api/client";
import { formatMontant } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export default function DonsAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "dons"],
    queryFn: getDons,
  });

  const mutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: Don["statut"] }) =>
      updateDonStatut(id, statut),
    onSuccess: () => {
      toast.success(fr.dons.statusUpdated);
      queryClient.invalidateQueries({ queryKey: ["admin", "dons"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const dons = data ?? [];
  const totals: Record<string, number> = {};
  for (const d of dons) {
    if (d.statut !== "confirme") continue;
    const m = Number(d.montant) || 0;
    if (m) totals[d.devise] = (totals[d.devise] || 0) + m;
  }
  const totalLabel =
    Object.entries(totals)
      .map(([dev, m]) => `${m.toLocaleString("fr-FR")} ${dev}`)
      .join(" · ") || "0";

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.dons.title }} />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={90} />
          <Skeleton height={90} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.dons.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : dons.length === 0 ? (
        <EmptyState title={fr.dons.empty} />
      ) : (
        <FlashList
          data={dons}
          keyExtractor={(d) => String(d.idDon)}
          ListHeaderComponent={
            <View className="mb-3 rounded-xl bg-muted/60 px-4 py-3">
              <Text variant="small">{fr.dons.totalConfirmed}</Text>
              <Text className="text-lg font-bold text-primary">{totalLabel}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const confirmed = item.statut === "confirme";
            return (
              <View className="gap-3 rounded-xl border border-border bg-card p-4">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-semibold" numberOfLines={1}>
                      {item.nom}
                    </Text>
                    <Text variant="small" numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                  <Badge
                    label={confirmed ? fr.dons.confirmed : fr.dons.announced}
                    tone={confirmed ? "success" : "warning"}
                  />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-bold tabular-nums">
                    {formatMontant(item.montant, item.devise) || "—"}
                  </Text>
                  <Text variant="small">
                    {fr.dons.via} {item.moyen}
                  </Text>
                </View>
                {item.message ? (
                  <Text variant="small" numberOfLines={2}>
                    “{item.message}”
                  </Text>
                ) : null}
                <Button
                  label={confirmed ? fr.dons.markAnnounced : fr.dons.markConfirmed}
                  variant={confirmed ? "outline" : "primary"}
                  size="md"
                  loading={mutation.isPending && mutation.variables?.id === item.idDon}
                  onPress={() =>
                    mutation.mutate({
                      id: item.idDon,
                      statut: confirmed ? "annonce" : "confirme",
                    })
                  }
                />
              </View>
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
