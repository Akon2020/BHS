import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getTemoignagesPublic } from "@/services/api/temoignages";
import { useSession } from "@/stores/session";
import { fr } from "@/i18n/fr";

export default function PublicHome() {
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  const {
    data: temoignages,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["temoignages", "public"],
    queryFn: getTemoignagesPublic,
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 24, paddingHorizontal: 20, paddingVertical: 24 }}>
        {/* En-tête de marque + accès compte */}
        <View className="gap-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 gap-1">
              <Badge label={fr.app.tagline} tone="primary" />
              <Heading level={1}>{fr.app.name}</Heading>
            </View>
            {status === "authenticated" ? (
              <Button
                label={fr.profil.title}
                variant="outline"
                size="md"
                onPress={() => router.push("/(member)/profil")}
              />
            ) : (
              <Button
                label={fr.auth.signIn}
                size="md"
                onPress={() => router.push("/(auth)/login")}
              />
            )}
          </View>
          <Text variant="muted">
            {status === "authenticated" && user
              ? `${fr.home.welcome}, ${user.nomComplet.split(" ")[0]} 🙏`
              : `${fr.home.welcome} 🙏`}
          </Text>
        </View>

        {/* Section témoignages (appel API réel) */}
        <View className="gap-3">
          <Heading level={2}>{fr.home.testimonialsTitle}</Heading>

          {isLoading ? (
            <View className="gap-3">
              <Skeleton height={96} />
              <Skeleton height={96} />
            </View>
          ) : isError ? (
            <EmptyState
              title={fr.common.error}
              description="Impossible de charger les témoignages."
              action={
                <Button
                  label={fr.common.retry}
                  variant="outline"
                  onPress={() => refetch()}
                />
              }
            />
          ) : !temoignages || temoignages.length === 0 ? (
            <EmptyState title={fr.home.testimonialsEmpty} />
          ) : (
            <View className="gap-3">
              {temoignages.map((t) => (
                <Card key={t.idTemoignage} className="gap-2">
                  <Text className="italic">“{t.contenu}”</Text>
                  <View className="flex-row items-center justify-between">
                    <Text variant="label">{t.auteur}</Text>
                    {t.fonction ? <Text variant="small">{t.fonction}</Text> : null}
                  </View>
                </Card>
              ))}
            </View>
          )}

          {!isLoading && (
            <Button
              label={fr.common.retry}
              variant="ghost"
              loading={isRefetching}
              onPress={() => refetch()}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
