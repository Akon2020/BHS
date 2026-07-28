import { View, ScrollView, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Comments } from "@/components/features/spiritualite/comments";
import { getBlogBySlug } from "@/services/api/blog";
import { formatDate, mediaUrl } from "@/utils/format";
import { stripHtml, isEmptyHtml } from "@/utils/html";
import { getColors } from "@/theme/colors";
import { fr } from "@/i18n/fr";

export default function ArticleDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = getColors(useColorScheme());

  const { data: blog, isLoading, isError, refetch } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => getBlogBySlug(slug),
    enabled: !!slug,
  });

  const image = mediaUrl(blog?.imageUne);
  const meditationImageOnly = !!blog && isEmptyHtml(blog.contenu) && !!image;
  const body = blog ? stripHtml(blog.contenu) : "";

  return (
    <Screen>
      <Stack.Screen
        options={{ headerShown: true, title: fr.spiritualite.title }}
      />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={200} />
          <Skeleton height={24} width="70%" />
          <Skeleton height={100} />
        </View>
      ) : isError || !blog ? (
        <EmptyState
          title={fr.common.error}
          description={fr.spiritualite.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {meditationImageOnly ? (
            <View className="gap-4 p-5">
              <Heading level={1}>{blog.titre}</Heading>
              <Image
                source={{ uri: image }}
                style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 12 }}
                contentFit="contain"
                transition={200}
              />
            </View>
          ) : (
            <>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: "100%", height: 220 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : null}
              <View className="gap-4 p-5">
                <Heading level={1}>{blog.titre}</Heading>
                <View className="flex-row items-center gap-3">
                  <Text variant="small">
                    {formatDate(blog.createdAt?.slice(0, 10))}
                  </Text>
                  {blog.auteur ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="person-outline" size={13} color={colors.mutedForeground} />
                      <Text variant="small">{blog.auteur.nomComplet}</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="leading-7 text-foreground">{body}</Text>
              </View>
            </>
          )}

          <View className="border-t border-border p-5">
            <Comments idBlog={blog.idBlog} commentaires={blog.commentaires ?? []} />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
