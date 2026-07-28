import { View, Pressable, useColorScheme } from "react-native";
import { Stack, router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getNewsletters, type NewsletterStatut } from "@/services/api/newsletters";
import { formatDate } from "@/utils/format";
import { getColors } from "@/theme/colors";
import { fr } from "@/i18n/fr";

const STATUT: Record<
  NewsletterStatut,
  { label: string; tone: "warning" | "success" | "primary" }
> = {
  brouillon: { label: fr.newsletters.draft, tone: "warning" },
  envoye: { label: fr.newsletters.sent, tone: "success" },
  programme: { label: fr.newsletters.scheduled, tone: "primary" },
};

export default function NewslettersList() {
  const colors = getColors(useColorScheme());
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "newsletters"],
    queryFn: getNewsletters,
  });

  const items = data ?? [];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.newsletters.title,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(admin)/newsletters/nouveau")}
              accessibilityLabel={fr.newsletters.compose}
              className="px-2"
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={72} />
          <Skeleton height={72} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.newsletters.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={fr.newsletters.empty}
          action={<Button label={fr.newsletters.compose} onPress={() => router.push("/(admin)/newsletters/nouveau")} />}
        />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(n) => String(n.idNewsletter)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(admin)/newsletters/${item.idNewsletter}`)}
              className="gap-1.5 rounded-xl border border-border bg-card p-4 active:opacity-90"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="min-w-0 flex-1 text-base font-semibold" numberOfLines={1}>
                  {item.titreInterne}
                </Text>
                <Badge label={STATUT[item.statut].label} tone={STATUT[item.statut].tone} />
              </View>
              <Text className="text-sm" numberOfLines={1}>
                {item.objetMail}
              </Text>
              <Text variant="small">
                {item.dateEnvoi
                  ? `${fr.newsletters.sent} — ${formatDate(item.dateEnvoi)}`
                  : formatDate(item.createdAt)}
              </Text>
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
