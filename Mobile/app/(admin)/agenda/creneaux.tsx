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
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getCreneaux, createCreneau, deleteCreneau } from "@/services/api/agenda";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export default function AgendaCreneaux() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [date, setDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [capacite, setCapacite] = useState("1");

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "creneaux"],
    queryFn: getCreneaux,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "creneaux"] });

  const create = useMutation({
    mutationFn: () =>
      createCreneau({
        date,
        heureDebut,
        heureFin,
        capacite: Number(capacite) || 1,
      }),
    onSuccess: () => {
      toast.success(fr.agendaAdmin.slotCreated);
      setCreating(false);
      setDate("");
      setHeureDebut("");
      setHeureFin("");
      setCapacite("1");
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: deleteCreneau,
    onSuccess: () => {
      toast.success(fr.agendaAdmin.slotDeleted);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const confirmDelete = (id: number) =>
    Alert.alert(fr.common.delete, fr.common.confirmDelete, [
      { text: fr.common.cancel, style: "cancel" },
      { text: fr.common.delete, style: "destructive", onPress: () => remove.mutate(id) },
    ]);

  const list = data ?? [];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.agendaAdmin.slots,
          headerRight: () => (
            <Pressable
              onPress={() => setCreating(true)}
              accessibilityLabel={fr.agendaAdmin.newSlot}
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
          description={fr.agendaAdmin.slotsError}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title={fr.agendaAdmin.slotsEmpty}
          action={<Button label={fr.agendaAdmin.newSlot} onPress={() => setCreating(true)} />}
        />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(c) => String(c.idCreneau)}
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
              <View className="min-w-0 flex-1 gap-1">
                <Text className="font-semibold">{formatDate(item.date)}</Text>
                <Text variant="small">
                  {item.heureDebut} – {item.heureFin}
                </Text>
              </View>
              <Badge
                label={`${item.reste ?? item.capacite} ${fr.agendaAdmin.remaining}`}
                tone={(item.reste ?? item.capacite) > 0 ? "success" : "muted"}
              />
              <Pressable
                onPress={() => confirmDelete(item.idCreneau)}
                accessibilityLabel={fr.common.delete}
                className="p-1"
              >
                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              </Pressable>
            </View>
          )}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}

      <Sheet visible={creating} onClose={() => setCreating(false)} title={fr.agendaAdmin.newSlot}>
        <View className="gap-4">
          <Input label={fr.agendaAdmin.date} value={date} onChangeText={setDate} placeholder="2026-01-15" autoCapitalize="none" />
          <Input label={fr.agendaAdmin.heureDebut} value={heureDebut} onChangeText={setHeureDebut} placeholder="09:00" />
          <Input label={fr.agendaAdmin.heureFin} value={heureFin} onChangeText={setHeureFin} placeholder="09:30" />
          <Input label={fr.agendaAdmin.capacite} value={capacite} onChangeText={setCapacite} keyboardType="number-pad" />
          <Button
            label={fr.agendaAdmin.newSlot}
            loading={create.isPending}
            disabled={!date || !heureDebut || !heureFin}
            onPress={() => create.mutate()}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
