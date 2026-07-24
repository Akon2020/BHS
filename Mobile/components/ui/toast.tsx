import { useEffect } from "react";
import { View, Pressable } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./text";
import { cn } from "@/lib/cn";
import { useToastStore, type ToastItem } from "@/stores/toast";

const TONE: Record<ToastItem["type"], string> = {
  success: "border-chart-2 bg-card",
  error: "border-destructive bg-card",
  info: "border-border bg-card",
};

const DOT: Record<ToastItem["type"], string> = {
  success: "bg-chart-2",
  error: "bg-destructive",
  info: "bg-primary",
};

function ToastRow({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const id = setTimeout(() => dismiss(item.id), 3500);
    return () => clearTimeout(id);
  }, [item.id, dismiss]);

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
      <Pressable
        onPress={() => dismiss(item.id)}
        accessibilityRole="alert"
        className={cn(
          "flex-row items-center gap-3 rounded-lg border px-4 py-3 shadow",
          TONE[item.type],
        )}
      >
        <View className={cn("h-2.5 w-2.5 rounded-full", DOT[item.type])} />
        <Text className="flex-1 text-sm text-foreground">{item.message}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Hôte de toasts (rendu une fois à la racine). */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ top: insets.top + 8 }}
      className="absolute inset-x-4 z-50 gap-2"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} item={t} />
      ))}
    </View>
  );
}
