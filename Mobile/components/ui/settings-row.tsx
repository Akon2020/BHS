import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./text";
import { cn } from "@/lib/cn";

interface SettingsRowProps {
  label: string;
  description?: string;
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

/** Ligne de réglage : libellé (+ description) à gauche, contenu à droite. */
export function SettingsRow({
  label,
  description,
  right,
  onPress,
  destructive,
  disabled,
}: SettingsRowProps) {
  const content = (
    <View className="min-h-11 flex-row items-center justify-between gap-3 px-4 py-3">
      <View className="flex-1 gap-0.5">
        <Text
          className={cn(
            "text-base",
            destructive ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </Text>
        {description ? <Text variant="small">{description}</Text> : null}
      </View>
      {right ? <View className="shrink-0">{right}</View> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn("active:bg-accent", disabled && "opacity-50")}
    >
      {content}
    </Pressable>
  );
}

/** Groupe de lignes de réglage encadré (carte). */
export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-2">
      {title ? (
        <Text variant="label" className="px-1 uppercase text-muted-foreground">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-xl border border-border bg-card">
        {children}
      </View>
    </View>
  );
}
