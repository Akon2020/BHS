import { View, Pressable, Alert, useColorScheme } from "react-native";
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
import {
  getAllFichiers,
  deleteFichierResource,
  type Fichier,
  type FichierStatut,
} from "@/services/api/fichiers";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const STATUT: Record<FichierStatut, { label: string; tone: "warning" | "success" | "primary" | "muted" }> = {
  brouillon: { label: fr.fichiersAdmin.statutBrouillon, tone: "warning" },
  publie: { label: fr.fichiersAdmin.statutPublie, tone: "success" },
  programme: { label: fr.fichiersAdmin.statutProgramme, tone: "primary" },
  archive: { label: fr.fichiersAdmin.statutArchive, tone: "muted" },
};

export default function FichiersAdmin() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "fichiers"],
    queryFn: () => getAllFichiers(),
  });

  const remove = useMutation({
    mutationFn: deleteFichierResource,
    onSuccess: () => {
      toast.success(fr.fichiersAdmin.deleted);
      queryClient.invalidateQueries({ queryKey: ["admin", "fichiers"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const confirmDelete = (item: Fichier) =>
    Alert.alert(fr.common.delete, item.nomReference, [
      { text: fr.common.cancel, style: "cancel" },
      { text: fr.common.delete, style: "destructive", onPress: () => remove.mutate(item.idFichier) },
    ]);

  const list = data ?? [];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.fichiersAdmin.title,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(admin)/fichiers/nouveau")}
              accessibilityLabel={fr.fichiersAdmin.new}
              className="px-2"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={80} />
          <Skeleton height={80} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.fichiersAdmin.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title={fr.fichiersAdmin.empty}
          action={<Button label={fr.fichiersAdmin.new} onPress={() => router.push("/(admin)/fichiers/nouveau")} />}
        />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(f) => String(f.idFichier)}
          renderItem={({ item }) => (
            <View className="gap-1.5 rounded-xl border border-border bg-card p-4">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="min-w-0 flex-1 font-semibold" numberOfLines={1}>{item.nomReference}</Text>
                {item.statut ? (
                  <Badge label={STATUT[item.statut].label} tone={STATUT[item.statut].tone} />
                ) : null}
              </View>
              <Text variant="small" numberOfLines={2}>{item.description}</Text>
              <View className="flex-row items-center justify-between">
                <Text variant="small">
                  {item.nombreFichiers} {fr.fichiersAdmin.filesCount}
                  {item.categorie ? ` · ${item.categorie.nomCategorie}` : ""}
                </Text>
                <Pressable
                  onPress={() => confirmDelete(item)}
                  accessibilityLabel={fr.common.delete}
                  hitSlop={8}
                  className="p-1"
                >
                  <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                </Pressable>
              </View>
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
