import { View, ScrollView, Pressable, useColorScheme } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getPublicFileBySlug,
  fileDownloadUrl,
} from "@/services/api/fichiers";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { formatTaille } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export default function FichierDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = getColors(useColorScheme());

  const { data: fichier, isLoading, isError, refetch } = useQuery({
    queryKey: ["fichier", slug],
    queryFn: () => getPublicFileBySlug(slug),
    enabled: !!slug,
  });

  const open = async (index: number) => {
    try {
      await WebBrowser.openBrowserAsync(fileDownloadUrl(slug, index));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.fichiers.title }} />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={24} width="70%" />
          <Skeleton height={80} />
          <Skeleton height={56} />
        </View>
      ) : isError || !fichier ? (
        <EmptyState
          title={fr.common.error}
          description={fr.fichiers.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Heading level={1}>{fichier.nomReference}</Heading>
          {fichier.description ? (
            <Text className="leading-6 text-foreground">{fichier.description}</Text>
          ) : null}

          <View className="gap-3">
            {fichier.fichiers.map((f, i) => (
              <Pressable
                key={i}
                onPress={() => open(i)}
                className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 active:opacity-90"
              >
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                <View className="flex-1">
                  <Text className="text-sm font-medium" numberOfLines={1}>
                    {f.nomOriginal ?? `${fr.fichiers.title} ${i + 1}`}
                  </Text>
                  {f.taille ? <Text variant="small">{formatTaille(f.taille)}</Text> : null}
                </View>
                <Ionicons
                  name={
                    fichier.modeAcces === "lecture"
                      ? "open-outline"
                      : "download-outline"
                  }
                  size={20}
                  color={colors.primary}
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
