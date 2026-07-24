import { View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./text";
import { useOnline } from "@/hooks/use-online";
import { fr } from "@/i18n/fr";

/** Bandeau discret affiché uniquement hors-ligne. */
export function OfflineBanner() {
  const online = useOnline();
  const insets = useSafeAreaInsets();

  if (online) return null;

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      pointerEvents="none"
      style={{ bottom: insets.bottom + 8 }}
      className="absolute inset-x-4 z-40"
    >
      <View className="items-center rounded-lg bg-foreground px-4 py-2">
        <Text className="text-sm text-background">{fr.common.offline}</Text>
      </View>
    </Animated.View>
  );
}
