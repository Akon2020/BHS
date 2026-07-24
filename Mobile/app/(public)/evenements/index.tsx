import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EventCard } from "@/components/features/evenements/event-card";
import { getEvenements } from "@/services/api/evenements";
import { fr } from "@/i18n/fr";

export default function EvenementsList() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["evenements", "public"],
    queryFn: () => getEvenements({ limit: 50 }),
  });

  const events = data?.events ?? [];

  return (
    <Screen>
      <View className="px-5 pb-3 pt-2">
        <Heading level={1}>{fr.evenements.title}</Heading>
      </View>

      {isLoading ? (
        <View className="gap-3 px-5">
          <Skeleton height={210} />
          <Skeleton height={210} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.evenements.error}
          action={
            <Button
              label={fr.common.retry}
              variant="outline"
              onPress={() => refetch()}
            />
          }
        />
      ) : events.length === 0 ? (
        <EmptyState title={fr.evenements.empty} />
      ) : (
        <FlashList
          data={events}
          keyExtractor={(e) => String(e.idEvenement)}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </Screen>
  );
}
