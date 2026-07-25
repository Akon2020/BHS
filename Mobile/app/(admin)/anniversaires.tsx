import { useState } from "react";
import { View, Pressable, Alert, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AnniversaireSheet } from "@/components/features/anniversaires/anniversaire-sheet";
import {
  getAnniversaires,
  deleteAnniversaire,
  type Anniversaire,
} from "@/services/api/anniversaires";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const MOIS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

export default function AnniversairesAdmin() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Anniversaire | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "anniversaires"],
    queryFn: getAnniversaires,
  });

  const remove = useMutation({
    mutationFn: deleteAnniversaire,
    onSuccess: () => {
      toast.success(fr.common.deleted);
      queryClient.invalidateQueries({ queryKey: ["admin", "anniversaires"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const confirmDelete = (item: Anniversaire) =>
    Alert.alert(fr.common.delete, item.nom, [
      { text: fr.common.cancel, style: "cancel" },
      { text: fr.common.delete, style: "destructive", onPress: () => remove.mutate(item.idAnniversaire) },
    ]);

  const list = data ?? [];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.anniversairesAdmin.title,
          headerRight: () => (
            <Pressable
              onPress={() => setCreating(true)}
              accessibilityLabel={fr.anniversairesAdmin.new}
              className="px-2"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={64} />
          <Skeleton height={64} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.anniversairesAdmin.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title={fr.anniversairesAdmin.empty}
          action={<Button label={fr.anniversairesAdmin.new} onPress={() => setCreating(true)} />}
        />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(a) => String(a.idAnniversaire)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setEditing(item)}
              className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 active:opacity-90"
            >
              <View className="h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Text className="text-sm font-bold tabular-nums text-primary">{item.jour}</Text>
              </View>
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="font-semibold" numberOfLines={1}>{item.nom}</Text>
                <Text variant="small">
                  {item.jour} {MOIS[item.mois - 1] ?? ""}
                  {item.annee ? ` ${item.annee}` : ""}
                </Text>
              </View>
              <Pressable
                onPress={() => confirmDelete(item)}
                accessibilityLabel={fr.common.delete}
                hitSlop={8}
                className="p-1"
              >
                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              </Pressable>
            </Pressable>
          )}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}

      {creating ? (
        <AnniversaireSheet visible onClose={() => setCreating(false)} />
      ) : null}
      {editing ? (
        <AnniversaireSheet visible existing={editing} onClose={() => setEditing(null)} />
      ) : null}
    </Screen>
  );
}
