import { useState } from "react";
import { View, ScrollView, TextInput, Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecherche } from "@/services/api/recherche";
import { useDebounce } from "@/hooks/use-debounce";
import { getColors } from "@/theme/colors";
import { formatDate } from "@/utils/format";
import { fr } from "@/i18n/fr";

export default function Recherche() {
  const colors = getColors(useColorScheme());
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim());
  const active = debounced.length >= 2;

  const { data, isLoading } = useQuery({
    queryKey: ["recherche", debounced],
    queryFn: () => getRecherche(debounced),
    enabled: active,
  });

  return (
    <Screen>
      <View className="gap-3 px-5 pb-3 pt-2">
        <Heading level={1}>{fr.recherche.title}</Heading>
        <View className="flex-row items-center gap-2 rounded-lg border border-border bg-card px-3">
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={fr.recherche.placeholder}
            placeholderTextColor={colors.mutedForeground}
            className="h-11 flex-1 text-base text-foreground font-sans"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} accessibilityLabel="Effacer">
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {!active ? (
          <Text variant="muted" className="text-center">
            {fr.recherche.prompt}
          </Text>
        ) : isLoading ? (
          <View className="gap-3">
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
          </View>
        ) : !data || data.total === 0 ? (
          <Text variant="muted" className="text-center">
            {fr.recherche.empty}
          </Text>
        ) : (
          <>
            <Group title={fr.recherche.articles} count={data.blogs.length}>
              {data.blogs.map((b) => (
                <ResultRow
                  key={`b-${b.idBlog}`}
                  icon="book-outline"
                  title={b.titre}
                  subtitle={b.extrait ?? undefined}
                  onPress={() => router.push(`/(public)/spiritualite/${b.slug}`)}
                />
              ))}
            </Group>

            <Group title={fr.recherche.events} count={data.evenements.length}>
              {data.evenements.map((e) => (
                <ResultRow
                  key={`e-${e.idEvenement}`}
                  icon="calendar-outline"
                  title={e.titre}
                  subtitle={
                    [formatDate(e.dateEvenement?.slice(0, 10)), e.lieu]
                      .filter(Boolean)
                      .join(" · ") || undefined
                  }
                  onPress={() => router.push(`/(public)/evenements/${e.slug}`)}
                />
              ))}
            </Group>

            <Group title={fr.recherche.resources} count={data.fichiers.length}>
              {data.fichiers.map((f) => (
                <ResultRow
                  key={`f-${f.idFichier}`}
                  icon="document-outline"
                  title={f.nomReference}
                  subtitle={f.description ?? undefined}
                />
              ))}
            </Group>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Group({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <View className="gap-2">
      <Text variant="label" className="uppercase text-muted-foreground">
        {title}
      </Text>
      <View className="overflow-hidden rounded-xl border border-border bg-card">
        {children}
      </View>
    </View>
  );
}

function ResultRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const colors = getColors(useColorScheme());
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-accent"
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View className="flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="small" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}
