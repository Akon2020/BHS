import { useState } from "react";
import { View, Pressable, Alert, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EntreeSheet } from "@/components/features/calendrier/entree-sheet";
import {
  getEntreesCalendrier,
  deleteEntreeCalendrier,
  type EntreeCalendrier,
} from "@/services/api/calendrier";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export default function CalendrierAdmin() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EntreeCalendrier | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "calendrier"],
    queryFn: getEntreesCalendrier,
  });

  const remove = useMutation({
    mutationFn: deleteEntreeCalendrier,
    onSuccess: () => {
      toast.success(fr.common.deleted);
      queryClient.invalidateQueries({ queryKey: ["admin", "calendrier"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const confirmDelete = (item: EntreeCalendrier) =>
    Alert.alert(fr.common.delete, item.titre, [
      { text: fr.common.cancel, style: "cancel" },
      { text: fr.common.delete, style: "destructive", onPress: () => remove.mutate(item.idEntree) },
    ]);

  const list = data ?? [];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.calendrierAdmin.title,
          headerRight: () => (
            <Pressable
              onPress={() => setCreating(true)}
              accessibilityLabel={fr.calendrierAdmin.new}
              className="px-2"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
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
          description={fr.calendrierAdmin.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title={fr.calendrierAdmin.empty}
          action={<Button label={fr.calendrierAdmin.new} onPress={() => setCreating(true)} />}
        />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(e) => String(e.idEntree)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setEditing(item)}
              className="gap-1.5 rounded-xl border border-border bg-card p-4 active:opacity-90"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="min-w-0 flex-1 font-semibold" numberOfLines={1}>{item.titre}</Text>
                <Pressable
                  onPress={() => confirmDelete(item)}
                  accessibilityLabel={fr.common.delete}
                  hitSlop={8}
                  className="p-1"
                >
                  <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                </Pressable>
              </View>
              <View className="flex-row items-center gap-2">
                <Text variant="small">{formatDate(item.date)}</Text>
                {item.journeeEntiere ? (
                  <Badge label={fr.calendrierAdmin.allDay} tone="muted" />
                ) : item.heureDebut ? (
                  <Text variant="small">
                    · {item.heureDebut}
                    {item.heureFin ? ` – ${item.heureFin}` : ""}
                  </Text>
                ) : null}
              </View>
              {item.lieu ? <Text variant="small" numberOfLines={1}>📍 {item.lieu}</Text> : null}
            </Pressable>
          )}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}

      {creating ? <EntreeSheet visible onClose={() => setCreating(false)} /> : null}
      {editing ? (
        <EntreeSheet visible existing={editing} onClose={() => setEditing(null)} />
      ) : null}
    </Screen>
  );
}
