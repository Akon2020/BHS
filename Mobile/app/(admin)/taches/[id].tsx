import { useState } from "react";
import { View, ScrollView, Pressable, Alert, useColorScheme } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorScreen } from "@/components/ui/error-screen";
import { cn } from "@/lib/cn";
import {
  getTache,
  updateTache,
  deleteTache,
  addTacheCommentaire,
  deleteTacheCommentaire,
  type StatutTache,
} from "@/services/api/taches";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const STATUTS: { value: StatutTache; label: string }[] = [
  { value: "a_faire", label: fr.taches.aFaire },
  { value: "en_cours", label: fr.taches.enCours },
  { value: "fait", label: fr.taches.fait },
];

export default function TacheDetail() {
  const colors = getColors(useColorScheme());
  const { id } = useLocalSearchParams<{ id: string }>();
  const tacheId = Number(id);
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "taches", tacheId],
    queryFn: () => getTache(tacheId),
    enabled: Number.isFinite(tacheId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "taches", tacheId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "taches"] });
  };

  const setStatut = useMutation({
    mutationFn: (statut: StatutTache) => updateTache(tacheId, { statut }),
    onSuccess: () => {
      toast.success(fr.taches.updated);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => deleteTache(tacheId),
    onSuccess: () => {
      toast.success(fr.taches.deleted);
      queryClient.invalidateQueries({ queryKey: ["admin", "taches"] });
      router.back();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const addComment = useMutation({
    mutationFn: () => addTacheCommentaire(tacheId, comment.trim()),
    onSuccess: () => {
      setComment("");
      toast.success(fr.taches.commentAdded);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const removeComment = useMutation({
    mutationFn: (commentaireId: number) => deleteTacheCommentaire(tacheId, commentaireId),
    onSuccess: invalidate,
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const confirmDelete = () =>
    Alert.alert(fr.common.delete, data?.titre ?? "", [
      { text: fr.common.cancel, style: "cancel" },
      { text: fr.common.delete, style: "destructive", onPress: () => remove.mutate() },
    ]);

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.taches.title }} />
      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={40} />
          <Skeleton height={120} />
        </View>
      ) : isError || !data ? (
        <ErrorScreen message={fr.taches.error} onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
          <Heading level={2}>{data.titre}</Heading>
          {data.description ? <Text className="text-[15px] leading-6">{data.description}</Text> : null}

          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
            {data.echeance ? <Text variant="small">📅 {fr.taches.dueOn} : {formatDate(data.echeance)}</Text> : null}
            {data.createur ? <Text variant="small">{fr.taches.createdBy} {data.createur.nomComplet}</Text> : null}
          </View>

          {data.assignesDetails && data.assignesDetails.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {data.assignesDetails.map((a) => (
                <Badge key={a.idUtilisateur} label={a.nomComplet} tone="muted" />
              ))}
            </View>
          ) : null}

          <View className="gap-2">
            <Text variant="label">{fr.taches.statut}</Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUTS.map((s) => {
                const active = data.statut === s.value;
                return (
                  <Pressable
                    key={s.value}
                    disabled={active || setStatut.isPending}
                    onPress={() => setStatut.mutate(s.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    className={cn("rounded-full border px-3 py-1.5", active ? "border-primary bg-primary/10" : "border-border")}
                  >
                    <Text className={cn("text-sm", active && "font-medium text-primary")}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-3">
            <Text variant="label">{fr.taches.comments}</Text>
            {(data.commentaires ?? []).length === 0 ? (
              <Text variant="small">{fr.taches.noComments}</Text>
            ) : (
              (data.commentaires ?? []).map((c) => (
                <View key={c.idCommentaireTache} className="gap-1 rounded-xl border border-border bg-card p-3">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text className="text-sm font-semibold" numberOfLines={1}>
                      {c.auteur?.nomComplet ?? ""}
                    </Text>
                    <Pressable
                      onPress={() => removeComment.mutate(c.idCommentaireTache)}
                      accessibilityLabel={fr.common.delete}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                  <Text className="text-sm">{c.contenu}</Text>
                  <Text variant="small">{formatDate(c.createdAt)}</Text>
                </View>
              ))
            )}
            <Input
              value={comment}
              onChangeText={setComment}
              placeholder={fr.taches.commentPlaceholder}
              multiline
            />
            <Button
              label={fr.taches.addComment}
              loading={addComment.isPending}
              disabled={!comment.trim()}
              onPress={() => addComment.mutate()}
            />
          </View>

          <Button label={fr.common.delete} variant="destructive" loading={remove.isPending} onPress={confirmDelete} />
        </ScrollView>
      )}
    </Screen>
  );
}
