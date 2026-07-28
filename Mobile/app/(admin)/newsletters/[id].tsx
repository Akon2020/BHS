import { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorScreen } from "@/components/ui/error-screen";
import {
  getNewsletter,
  getNewsletterProgress,
  sendNewsletter,
  deleteNewsletter,
  type NewsletterStatut,
} from "@/services/api/newsletters";
import { getApiErrorMessage } from "@/services/api/client";
import { stripHtml } from "@/utils/html";
import { formatDate } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const STATUT: Record<
  NewsletterStatut,
  { label: string; tone: "warning" | "success" | "primary" }
> = {
  brouillon: { label: fr.newsletters.draft, tone: "warning" },
  envoye: { label: fr.newsletters.sent, tone: "success" },
  programme: { label: fr.newsletters.scheduled, tone: "primary" },
};

export default function NewsletterDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const newsletterId = Number(id);
  const queryClient = useQueryClient();
  const [justSent, setJustSent] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "newsletters", newsletterId],
    queryFn: () => getNewsletter(newsletterId),
    enabled: Number.isFinite(newsletterId),
  });

  const showProgress = justSent || data?.statut === "envoye";
  const progress = useQuery({
    queryKey: ["admin", "newsletters", newsletterId, "progress"],
    queryFn: () => getNewsletterProgress(newsletterId),
    enabled: showProgress && Number.isFinite(newsletterId),
    refetchInterval: (query) =>
      query.state.data?.statut === "en_cours" ? 2000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: () => sendNewsletter(newsletterId),
    onSuccess: (res) => {
      setJustSent(true);
      toast.success(res.message || fr.newsletters.sendStarted);
      queryClient.invalidateQueries({ queryKey: ["admin", "newsletters"] });
      progress.refetch();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNewsletter(newsletterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "newsletters"] });
      toast.success(fr.common.deleted);
      router.back();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const confirmSend = () => {
    Alert.alert(fr.newsletters.send, fr.newsletters.confirmSend, [
      { text: fr.common.cancel, style: "cancel" },
      { text: fr.newsletters.send, onPress: () => sendMutation.mutate() },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(fr.common.delete, fr.common.confirmDelete, [
      { text: fr.common.cancel, style: "cancel" },
      {
        text: fr.common.delete,
        style: "destructive",
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.newsletters.title }} />
      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={40} />
          <Skeleton height={120} />
        </View>
      ) : isError || !data ? (
        <ErrorScreen message={fr.newsletters.error} onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-2">
              <Heading level={2} className="min-w-0 flex-1">
                {data.titreInterne}
              </Heading>
              <Badge label={STATUT[data.statut].label} tone={STATUT[data.statut].tone} />
            </View>
            <Text variant="muted">{data.objetMail}</Text>
            <Text variant="small">
              {data.dateEnvoi
                ? `${fr.newsletters.sent} — ${formatDate(data.dateEnvoi)}`
                : formatDate(data.createdAt)}
            </Text>
          </View>

          <View className="rounded-xl border border-border bg-card p-4">
            <Text className="text-[15px] leading-6">{stripHtml(data.contenu)}</Text>
          </View>

          {showProgress && progress.data ? (
            <View className="gap-3 rounded-xl border border-border bg-card p-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold">
                  {progress.data.statut === "en_cours"
                    ? fr.newsletters.sending
                    : fr.newsletters.done}
                </Text>
                <Text className="font-semibold tabular-nums">
                  {progress.data.pourcentage}%
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-muted">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress.data.pourcentage}%` }}
                />
              </View>
              <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                <Text variant="small">
                  {progress.data.envoye} {fr.newsletters.sentCount}
                </Text>
                {progress.data.echec > 0 ? (
                  <Text variant="small" className="text-destructive">
                    {progress.data.echec} {fr.newsletters.failedCount}
                  </Text>
                ) : null}
                {progress.data.attente > 0 ? (
                  <Text variant="small">
                    {progress.data.attente} {fr.newsletters.pendingCount}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {data.statut !== "envoye" && !justSent ? (
            <Button
              label={fr.newsletters.send}
              loading={sendMutation.isPending}
              onPress={confirmSend}
            />
          ) : null}

          <Button
            label={fr.common.delete}
            variant="destructive"
            loading={deleteMutation.isPending}
            onPress={confirmDelete}
          />
        </ScrollView>
      )}
    </Screen>
  );
}
