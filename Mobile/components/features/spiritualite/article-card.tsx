import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text } from "@/components/ui/text";
import type { Blog } from "@/services/api/blog/types";
import { formatDate, mediaUrl } from "@/utils/format";

export function ArticleCard({ article }: { article: Blog }) {
  const image = mediaUrl(article.imageUne);

  return (
    <Pressable
      onPress={() => router.push(`/(public)/spiritualite/${article.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={article.titre}
      className="flex-row gap-3 overflow-hidden rounded-xl border border-border bg-card p-3 active:opacity-90"
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: 84, height: 84, borderRadius: 10 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="h-[84px] w-[84px] items-center justify-center rounded-[10px] bg-muted">
          <Ionicons name="book-outline" size={26} color="#9797a0" />
        </View>
      )}
      <View className="flex-1 justify-center gap-1">
        <Text className="text-base font-semibold" numberOfLines={2}>
          {article.titre}
        </Text>
        {article.extrait ? (
          <Text variant="small" numberOfLines={2}>
            {article.extrait}
          </Text>
        ) : null}
        <Text variant="small">{formatDate(article.createdAt?.slice(0, 10))}</Text>
      </View>
    </Pressable>
  );
}
