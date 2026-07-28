import { View } from "react-native";
import { Text } from "./text";
import { cn } from "@/lib/cn";

type Tone = "primary" | "muted" | "destructive" | "success" | "warning";

const TONE: Record<Tone, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  muted: { bg: "bg-muted", text: "text-muted-foreground" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive" },
  success: { bg: "bg-chart-2/15", text: "text-chart-2" },
  warning: { bg: "bg-chart-4/15", text: "text-chart-4" },
};

interface BadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

/** Pastille de statut. La couleur n'est jamais la seule porteuse d'info (texte présent). */
export function Badge({ label, tone = "muted", className }: BadgeProps) {
  const t = TONE[tone];
  return (
    <View className={cn("self-start rounded-full px-2 py-0.5", t.bg, className)}>
      <Text className={cn("text-xs font-medium", t.text)}>{label}</Text>
    </View>
  );
}
