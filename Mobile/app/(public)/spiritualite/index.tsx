import { useState } from "react";
import { View, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ArticleCard } from "@/components/features/spiritualite/article-card";
import { cn } from "@/lib/cn";
import {
  getCategories,
  SECTION_SLUGS,
  type SectionKey,
} from "@/services/api/categories";
import { getBlogsByCategorie } from "@/services/api/blog";
import { fr } from "@/i18n/fr";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "echos", label: fr.spiritualite.echos },
  { key: "pensee", label: fr.spiritualite.pensee },
  { key: "meditation", label: fr.spiritualite.meditation },
];

export default function SpiritualiteIndex() {
  const [active, setActive] = useState<SectionKey>("echos");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const idCategorie = categories?.find(
    (c) => c.slug === SECTION_SLUGS[active],
  )?.idCategorie;

  const {
    data: articles,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["blogs", "categorie", idCategorie],
    queryFn: () => getBlogsByCategorie(idCategorie as number),
    enabled: !!idCategorie,
  });

  const list = articles ?? [];

  return (
    <Screen>
      <View className="gap-3 px-5 pb-3 pt-2">
        <Heading level={1}>{fr.spiritualite.title}</Heading>
        <View className="flex-row gap-1 rounded-lg bg-muted p-1">
          {SECTIONS.map((s) => {
            const isActive = active === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setActive(s.key)}
                className={cn(
                  "flex-1 items-center rounded-md px-2 py-1.5",
                  isActive && "bg-card",
                )}
              >
                <Text
                  className={cn(
                    "text-xs",
                    isActive ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading || (!idCategorie && !categories) ? (
        <View className="gap-3 px-5">
          <Skeleton height={100} />
          <Skeleton height={100} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.spiritualite.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState title={fr.spiritualite.empty} />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(a) => String(a.idBlog)}
          renderItem={({ item }) => <ArticleCard article={item} />}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </Screen>
  );
}
