import { View, Pressable, useColorScheme } from "react-native";
import { Stack, router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicFiles } from "@/services/api/fichiers";
import { getColors } from "@/theme/colors";
import { fr } from "@/i18n/fr";

export default function FichiersList() {
  const colors = getColors(useColorScheme());
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["fichiers", "public"],
    queryFn: getPublicFiles,
  });

  const files = data ?? [];

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.fichiers.title }} />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={72} />
          <Skeleton height={72} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.fichiers.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : files.length === 0 ? (
        <EmptyState title={fr.fichiers.empty} />
      ) : (
        <FlashList
          data={files}
          keyExtractor={(f) => String(f.idFichier)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(public)/fichiers/${item.slug}`)}
              className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 active:opacity-90"
            >
              <View className="h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Ionicons name="folder-outline" size={22} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" numberOfLines={1}>
                  {item.nomReference}
                </Text>
                <Text variant="small">
                  {item.nombreFichiers} {fr.fichiers.files}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
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
