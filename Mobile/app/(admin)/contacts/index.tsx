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
import { getContacts, type ContactStatut } from "@/services/api/correspondance";
import { getColors } from "@/theme/colors";
import { fr } from "@/i18n/fr";

const STATUT: Record<ContactStatut, { label: string; tone: "warning" | "primary" | "success" | "muted" }> = {
  nouveau: { label: fr.correspondance.statutNouveau, tone: "warning" },
  lu: { label: fr.correspondance.statutLu, tone: "primary" },
  traite: { label: fr.correspondance.statutTraite, tone: "success" },
  archive: { label: fr.correspondance.statutArchive, tone: "muted" },
};

export default function ContactsInbox() {
  const colors = getColors(useColorScheme());
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "contacts"],
    queryFn: getContacts,
  });

  const contacts = data ?? [];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.correspondance.title,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(admin)/contacts/nouveau")}
              accessibilityLabel={fr.correspondance.compose}
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
          description={fr.correspondance.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : contacts.length === 0 ? (
        <EmptyState title={fr.correspondance.empty} />
      ) : (
        <FlashList
          data={contacts}
          keyExtractor={(c) => String(c.idContact)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(admin)/contacts/${item.idContact}`)}
              className="gap-1.5 rounded-xl border border-border bg-card p-4 active:opacity-90"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="min-w-0 flex-1 text-base font-semibold" numberOfLines={1}>
                  {item.nomComplet}
                </Text>
                <Badge label={STATUT[item.statut].label} tone={STATUT[item.statut].tone} />
              </View>
              <Text className="text-sm" numberOfLines={1}>
                {item.sujet}
              </Text>
              <Text variant="small" numberOfLines={1}>
                {item.message}
              </Text>
              {item.repondu ? (
                <Text variant="small" className="text-chart-2">
                  ✓ {fr.correspondance.replied}
                </Text>
              ) : null}
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
