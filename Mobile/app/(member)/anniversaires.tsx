import { View, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getAnniversairesAVenir } from "@/services/api/anniversaires";
import { getColors } from "@/theme/colors";
import { fr } from "@/i18n/fr";

const MOIS_COURTS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

const dansLabel = (n: number) =>
  n === 0 ? fr.anniversaires.today : n === 1 ? fr.anniversaires.tomorrow : `J-${n}`;

export default function Anniversaires() {
  const colors = getColors(useColorScheme());
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["anniversaires", "a-venir"],
    queryFn: getAnniversairesAVenir,
  });

  const list = data ?? [];

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.anniversaires.title }} />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={56} />
          <Skeleton height={56} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.anniversaires.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState title={fr.anniversaires.empty} />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(a, i) => `${a.nom}-${i}`}
          ListHeaderComponent={
            <Text variant="muted" className="pb-3">
              {fr.anniversaires.subtitle}
            </Text>
          }
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="gift-outline" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium" numberOfLines={1}>
                  {item.nom}
                </Text>
                <Text variant="small">
                  {String(item.jour).padStart(2, "0")} {MOIS_COURTS[item.mois - 1]}
                </Text>
              </View>
              <Badge label={dansLabel(item.dansJours)} tone="primary" />
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
