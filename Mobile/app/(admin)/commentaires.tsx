import { useMemo, useState } from "react";
import { View, Pressable, Alert } from "react-native";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import {
  getAllCommentaires,
  modererCommentaire,
  deleteCommentaire,
  type CommentaireStatut,
} from "@/services/api/commentaires";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

type Filtre = "attente" | "approuve" | "rejete" | "tous";
const FILTRES: { key: Filtre; label: string }[] = [
  { key: "attente", label: fr.moderation.filterPending },
  { key: "approuve", label: fr.moderation.filterApproved },
  { key: "rejete", label: fr.moderation.filterRejected },
  { key: "tous", label: fr.moderation.filterAll },
];

const STATUT: Record<CommentaireStatut, { label: string; tone: "warning" | "success" | "destructive" | "muted" }> = {
  attente: { label: fr.moderation.pending, tone: "warning" },
  approuve: { label: fr.moderation.approved, tone: "success" },
  rejete: { label: fr.moderation.rejected, tone: "destructive" },
  spam: { label: fr.moderation.spam, tone: "muted" },
};

export default function CommentairesModeration() {
  const queryClient = useQueryClient();
  const [filtre, setFiltre] = useState<Filtre>("attente");

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "commentaires"],
    queryFn: getAllCommentaires,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "commentaires"] });

  const moderer = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: CommentaireStatut }) =>
      modererCommentaire(id, statut),
    onSuccess: () => {
      toast.success(fr.moderation.updated);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: deleteCommentaire,
    onSuccess: () => {
      toast.success(fr.moderation.deleted);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const confirmDelete = (id: number) =>
    Alert.alert(fr.moderation.deleteConfirm, undefined, [
      { text: fr.profil.cancel, style: "cancel" },
      {
        text: fr.moderation.delete,
        style: "destructive",
        onPress: () => remove.mutate(id),
      },
    ]);

  const list = useMemo(() => {
    const all = data ?? [];
    return filtre === "tous" ? all : all.filter((c) => c.statut === filtre);
  }, [data, filtre]);

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.moderation.title }} />

      <View className="flex-row gap-1 rounded-lg bg-muted p-1 mx-5 mt-3">
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
          <Skeleton height={110} />
          <Skeleton height={110} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.moderation.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState title={fr.moderation.empty} />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(c) => String(c.idCommentaire)}
          renderItem={({ item }) => (
            <View className="gap-2 rounded-xl border border-border bg-card p-4">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="min-w-0 flex-1 text-sm font-semibold" numberOfLines={1}>
                  {item.nomComplet}
                </Text>
                <Badge label={STATUT[item.statut].label} tone={STATUT[item.statut].tone} />
              </View>
              {item.blog?.titre ? (
                <Text variant="small" numberOfLines={1}>
                  ↳ {item.blog.titre}
                </Text>
              ) : null}
              <Text className="text-sm text-foreground">{item.contenu}</Text>
              <Text variant="small">{formatDate(item.dateCommentaire?.slice(0, 10))}</Text>
              <View className="flex-row flex-wrap gap-2 pt-1">
                {item.statut !== "approuve" ? (
                  <Button
                    label={fr.moderation.approve}
                    size="md"
                    onPress={() => moderer.mutate({ id: item.idCommentaire, statut: "approuve" })}
                  />
                ) : null}
                {item.statut !== "rejete" ? (
                  <Button
                    label={fr.moderation.reject}
                    variant="outline"
                    size="md"
                    onPress={() => moderer.mutate({ id: item.idCommentaire, statut: "rejete" })}
                  />
                ) : null}
                <Button
                  label={fr.moderation.delete}
                  variant="ghost"
                  size="md"
                  onPress={() => confirmDelete(item.idCommentaire)}
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
    </Screen>
  );
}
