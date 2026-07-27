import { View, ScrollView, Switch, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getPreferences, updatePreference } from "@/services/api/notifications";
import type { NotifCategorie } from "@/services/api/notifications/types";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const LABELS: Record<NotifCategorie, string> = {
  evenement: fr.notifications.catEvenement,
  rendezvous: fr.notifications.catRendezvous,
  anniversaire: fr.notifications.catAnniversaire,
  newsletter: fr.notifications.catNewsletter,
  correspondance: fr.notifications.catCorrespondance,
  echo_priere: fr.notifications.catEchoPriere,
  pensee_du_jour: fr.notifications.catPenseeDuJour,
  meditation: fr.notifications.catMeditation,
  systeme: fr.notifications.catSysteme,
};

export default function NotificationsPreferences() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: getPreferences,
  });

  const toggle = useMutation({
    mutationFn: ({ categorie, active }: { categorie: NotifCategorie; active: boolean }) =>
      updatePreference(categorie, active),
    onMutate: async ({ categorie, active }) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "preferences"] });
      const prev = queryClient.getQueryData(["notifications", "preferences"]);
      queryClient.setQueryData(
        ["notifications", "preferences"],
        (old: { categorie: NotifCategorie; active: boolean }[] | undefined) =>
          (old ?? []).map((p) => (p.categorie === categorie ? { ...p, active } : p)),
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications", "preferences"], ctx.prev);
      toast.error(getApiErrorMessage(e));
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] }),
  });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.notifications.preferences }} />
      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
        </View>
      ) : isError || !data ? (
        <EmptyState
          title={fr.common.error}
          description={fr.notifications.preferencesError}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View className="gap-1">
            <Text variant="muted">{fr.notifications.preferencesSubtitle}</Text>
          </View>
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            {data.map((p, i) => (
              <View
                key={p.categorie}
                className={`flex-row items-center justify-between gap-3 p-4 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <Text className="min-w-0 flex-1">{LABELS[p.categorie]}</Text>
                <Switch
                  value={p.active}
                  onValueChange={(v) => toggle.mutate({ categorie: p.categorie, active: v })}
                  trackColor={{ true: colors.primary }}
                  accessibilityLabel={LABELS[p.categorie]}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
