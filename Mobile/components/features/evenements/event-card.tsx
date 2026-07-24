import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import type { Evenement } from "@/services/api/evenements/types";
import { formatDate, formatHeure, mediaUrl } from "@/utils/format";
import { fr } from "@/i18n/fr";

export function EventCard({ event }: { event: Evenement }) {
  const image = mediaUrl(event.imageEvenement);
  const complet =
    event.nombrePlaces > 0 && event.nombreInscrits >= event.nombrePlaces;

  return (
    <Pressable
      onPress={() => router.push(`/(public)/evenements/${event.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={event.titre}
      className="overflow-hidden rounded-xl border border-border bg-card active:opacity-90"
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: "100%", height: 150 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="h-[150px] w-full items-center justify-center bg-muted">
          <Ionicons name="calendar-outline" size={36} color="#9797a0" />
        </View>
      )}
      <View className="gap-2 p-4">
        <View className="flex-row items-center gap-2">
          <Badge
            label={event.estPayant ? fr.evenements.paid : fr.evenements.free}
            tone={event.estPayant ? "warning" : "success"}
          />
          {complet ? <Badge label={fr.evenements.full} tone="destructive" /> : null}
        </View>
        <Text className="text-base font-semibold" numberOfLines={2}>
          {event.titre}
        </Text>
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={14} color="#9797a0" />
            <Text variant="small">
              {formatDate(event.dateEvenement)} · {formatHeure(event.heureDebut)}
            </Text>
          </View>
          {event.lieu ? (
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={14} color="#9797a0" />
              <Text variant="small" numberOfLines={1}>
                {event.lieu}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
