import { useState } from "react";
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
import { cn } from "@/lib/cn";
import { RescheduleSheet } from "@/components/features/agenda/reschedule-sheet";
import { getRendezVous, updateStatutRdv, deleteRdv } from "@/services/api/agenda";
import type { RdvStatut, RendezVous } from "@/services/api/agenda/types";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

type Filtre = RdvStatut | "tous";
const FILTRES: { key: Filtre; label: string }[] = [
  { key: "en_attente", label: fr.rdv.statutEnAttente },
  { key: "approuve", label: fr.rdv.statutApprouve },
  { key: "refuse", label: fr.rdv.statutRefuse },
  { key: "tous", label: fr.agendaAdmin.filterAll },
];

const STATUT: Record<RdvStatut, { label: string; tone: "warning" | "success" | "destructive" | "primary" }> = {
  en_attente: { label: fr.rdv.statutEnAttente, tone: "warning" },
  approuve: { label: fr.rdv.statutApprouve, tone: "success" },
  refuse: { label: fr.rdv.statutRefuse, tone: "destructive" },
  reprogramme: { label: fr.rdv.statutReprogramme, tone: "primary" },
};

export default function AgendaRequests() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const [filtre, setFiltre] = useState<Filtre>("en_attente");
  const [rescheduling, setRescheduling] = useState<RendezVous | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "rendez-vous", filtre],
    queryFn: () => getRendezVous(filtre === "tous" ? undefined : filtre),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "rendez-vous"] });

  const statut = useMutation({
    mutationFn: ({ id, s }: { id: number; s: RdvStatut }) =>
      updateStatutRdv(id, { statut: s }),
    onSuccess: (_d, v) => {
      toast.success(v.s === "approuve" ? fr.agendaAdmin.approved : fr.agendaAdmin.refused);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: deleteRdv,
    onSuccess: () => {
      toast.success(fr.common.deleted);
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
          title: fr.agendaAdmin.title,
          headerRight: () => (
            <View className="flex-row">
              <Pressable
                onPress={() => router.push("/(admin)/agenda/creneaux")}
                accessibilityLabel={fr.agendaAdmin.slots}
                className="px-2"
              >
                <Ionicons name="time-outline" size={22} color={colors.primary} />
              </Pressable>
              <Pressable
                onPress={() => router.push("/(admin)/agenda/parametre")}
                accessibilityLabel={fr.agendaAdmin.settings}
                className="px-2"
              >
                <Ionicons name="settings-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>
          ),
        }}
      />

      <View className="mx-5 mt-3 flex-row gap-1 rounded-lg bg-muted p-1">
        {FILTRES.map((f) => {
          const active = filtre === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFiltre(f.key)}
              className={cn("flex-1 items-center rounded-md px-2 py-1.5", active && "bg-card")}
            >
              <Text className={cn("text-xs", active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={130} />
          <Skeleton height={130} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.agendaAdmin.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState title={fr.agendaAdmin.empty} />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(r) => String(r.idRendezVous)}
          renderItem={({ item }) => (
            <View className="gap-2 rounded-xl border border-border bg-card p-4">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="min-w-0 flex-1 text-base font-semibold" numberOfLines={1}>
                  {item.nom}
                </Text>
                <Badge label={STATUT[item.statut].label} tone={STATUT[item.statut].tone} />
              </View>
              <Text variant="small">
                {formatDate(item.date)} · {item.heureDebut}
                {item.heureFin ? ` – ${item.heureFin}` : ""}
              </Text>
              <Text variant="small" numberOfLines={1}>
                {item.email} · {item.telephone}
              </Text>
              {item.motif ? <Text className="text-sm">{item.motif}</Text> : null}
              <View className="flex-row flex-wrap gap-2 pt-1">
                {item.statut !== "approuve" ? (
                  <Button
                    label={fr.agendaAdmin.approve}
                    size="md"
                    onPress={() => statut.mutate({ id: item.idRendezVous, s: "approuve" })}
                  />
                ) : null}
                {item.statut !== "refuse" ? (
                  <Button
                    label={fr.agendaAdmin.refuse}
                    variant="outline"
                    size="md"
                    onPress={() => statut.mutate({ id: item.idRendezVous, s: "refuse" })}
                  />
                ) : null}
                <Button
                  label={fr.agendaAdmin.reschedule}
                  variant="ghost"
                  size="md"
                  onPress={() => setRescheduling(item)}
                />
                <Button
                  label={fr.common.delete}
                  variant="ghost"
                  size="md"
                  onPress={() => confirmDelete(item.idRendezVous)}
                />
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}

      {rescheduling ? (
        <RescheduleSheet
          visible
          rdv={rescheduling}
          onClose={() => setRescheduling(null)}
        />
      ) : null}
    </Screen>
  );
}
