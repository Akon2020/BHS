import { View, ScrollView, Pressable, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getMesNotifications,
  marquerLue,
  marquerToutesLues,
  NOTIFICATIONS_MOCKED,
} from "@/services/api/notifications";
import type { NotifCategorie } from "@/services/api/notifications/types";
import { registerForPush } from "@/lib/push";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const CAT_LABEL: Record<NotifCategorie, string> = {
  evenement: "Événement",
  rendezvous: "Rendez-vous",
  anniversaire: "Anniversaire",
  newsletter: "Newsletter",
  correspondance: "Message",
  echo_priere: "Écho de prière",
  pensee_du_jour: "Pensée du jour",
  meditation: "Méditation",
  systeme: "Système",
};

export default function NotificationsScreen() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMesNotifications,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const readOne = useMutation({
    mutationFn: marquerLue,
    onSuccess: invalidate,
  });
  const readAll = useMutation({
    mutationFn: marquerToutesLues,
    onSuccess: invalidate,
  });

  const enable = async () => {
    const res = await registerForPush();
    if (res === "granted") toast.success(fr.notifications.enabled);
    else if (res === "denied") toast.error(fr.notifications.denied);
    else toast.info(fr.notifications.demoNote);
  };

  const notifications = data ?? [];
  const hasUnread = notifications.some((n) => !n.lu);

  return (
    <Screen>
      <Stack.Screen
        options={{ headerShown: true, title: fr.notifications.title }}
      />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {NOTIFICATIONS_MOCKED ? (
          <View className="rounded-lg bg-muted/60 p-3">
            <Text variant="small">{fr.notifications.demoNote}</Text>
          </View>
        ) : null}

        <View className="flex-row gap-2">
          <Button
            label={fr.notifications.enable}
            variant="outline"
            size="md"
            onPress={enable}
          />
          {hasUnread ? (
            <Button
              label={fr.notifications.markAllRead}
              variant="ghost"
              size="md"
              loading={readAll.isPending}
              onPress={() => readAll.mutate()}
            />
          ) : null}
        </View>

        {isLoading ? (
          <View className="gap-3">
            <Skeleton height={72} />
            <Skeleton height={72} />
          </View>
        ) : notifications.length === 0 ? (
          <EmptyState title={fr.notifications.empty} />
        ) : (
          <View className="gap-3">
            {notifications.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => !n.lu && readOne.mutate(n.id)}
                className="flex-row gap-3 rounded-xl border border-border bg-card p-4"
              >
                <View className="pt-1">
                  <View
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: n.lu ? "transparent" : colors.primary,
                    }}
                  />
                </View>
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text className="flex-1 text-sm font-semibold" numberOfLines={1}>
                      {n.titre}
                    </Text>
                    <Badge label={CAT_LABEL[n.categorie]} tone="muted" />
                  </View>
                  <Text variant="small">{n.corps}</Text>
                  <Text variant="small">
                    {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
