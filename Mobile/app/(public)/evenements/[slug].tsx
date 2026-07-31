import { useState } from "react";
import { View, ScrollView, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RegisterSheet } from "@/components/features/evenements/register-sheet";
import { getEvenementBySlug } from "@/services/api/evenements";
import { getColors } from "@/theme/colors";
import { formatDate, formatHeure, formatMontant, mediaUrl } from "@/utils/format";
import { fr } from "@/i18n/fr";

export default function EvenementDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = getColors(useColorScheme());
  const [register, setRegister] = useState(false);

  const { data: event, isLoading, isError, refetch } = useQuery({
    queryKey: ["evenement", slug],
    queryFn: () => getEvenementBySlug(slug),
    enabled: !!slug,
  });

  const image = mediaUrl(event?.imageEvenement);
  const complet =
    !!event &&
    event.nombrePlaces > 0 &&
    event.nombreInscrits >= event.nombrePlaces;
  const restantes = event ? Math.max(event.nombrePlaces - event.nombreInscrits, 0) : 0;
  const inscriptionsCloses =
    !!event?.dateLimiteInscription &&
    new Date(event.dateLimiteInscription).getTime() < Date.now();

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.evenements.title }} />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={200} />
          <Skeleton height={28} width="70%" />
          <Skeleton height={80} />
        </View>
      ) : isError || !event ? (
        <EmptyState
          title={fr.common.error}
          description={fr.evenements.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: 220 }}
                contentFit="cover"
                transition={200}
              />
            ) : null}

            <View className="gap-4 p-5">
              <View className="flex-row items-center gap-2">
                <Badge
                  label={event.estPayant ? fr.evenements.paid : fr.evenements.free}
                  tone={event.estPayant ? "warning" : "success"}
                />
                {event.estPayant ? (
                  <Text variant="label" className="text-primary">
                    {formatMontant(event.montant, event.devise)}
                  </Text>
                ) : null}
              </View>

              <Heading level={1}>{event.titre}</Heading>

              <View className="gap-2 rounded-xl border border-border bg-card p-4">
                <Row icon="calendar-outline" color={colors.mutedForeground}>
                  {formatDate(event.dateEvenement)}
                </Row>
                <Row icon="time-outline" color={colors.mutedForeground}>
                  {formatHeure(event.heureDebut)}
                  {event.heureFin ? ` – ${formatHeure(event.heureFin)}` : ""}
                </Row>
                {event.lieu ? (
                  <Row icon="location-outline" color={colors.mutedForeground}>
                    {event.lieu}
                  </Row>
                ) : null}
                {event.nombrePlaces > 0 ? (
                  <Row icon="people-outline" color={colors.mutedForeground}>
                    {complet
                      ? fr.evenements.full
                      : `${restantes} ${fr.evenements.places}`}
                  </Row>
                ) : null}
                {event.dateLimiteInscription ? (
                  <Row icon="hourglass-outline" color={colors.mutedForeground}>
                    {inscriptionsCloses
                      ? fr.evenements.deadlinePassed
                      : `${fr.evenements.deadlineUntil} ${formatDate(event.dateLimiteInscription)}`}
                  </Row>
                ) : null}
              </View>

              <Text className="leading-6 text-foreground">{event.description}</Text>
            </View>
          </ScrollView>

          {event.statut === "publie" && !complet && !inscriptionsCloses ? (
            <View className="border-t border-border bg-card p-4">
              <Button
                label={fr.evenements.register}
                size="lg"
                onPress={() => setRegister(true)}
              />
            </View>
          ) : inscriptionsCloses && !complet ? (
            <View className="border-t border-border bg-card p-4">
              <Text variant="muted" className="text-center">
                {fr.evenements.deadlinePassed}
              </Text>
            </View>
          ) : null}

          <RegisterSheet
            visible={register}
            onClose={() => setRegister(false)}
            event={event}
          />
        </>
      )}
    </Screen>
  );
}

function Row({
  icon,
  color,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={18} color={color} />
      <Text className="flex-1 text-sm text-foreground">{children}</Text>
    </View>
  );
}
