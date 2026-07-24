import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";
import { usePreferences, type ThemeMode } from "@/stores/preferences";
import { fr } from "@/i18n/fr";

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "system", label: fr.profil.themeSystem },
  { value: "light", label: fr.profil.themeLight },
  { value: "dark", label: fr.profil.themeDark },
];

/** Sélecteur segmenté du thème (système / clair / sombre). */
export function ThemeSelector() {
  const themeMode = usePreferences((s) => s.themeMode);
  const setThemeMode = usePreferences((s) => s.setThemeMode);

  return (
    <View className="flex-row gap-1 rounded-lg bg-muted p-1">
      {OPTIONS.map((opt) => {
        const active = themeMode === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => setThemeMode(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={cn(
              "flex-1 items-center rounded-md px-3 py-1.5",
              active && "bg-card",
            )}
          >
            <Text
              className={cn(
                "text-sm",
                active ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
