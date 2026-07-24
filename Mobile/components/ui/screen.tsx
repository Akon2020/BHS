import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/cn";

/**
 * Conteneur d'écran : fond `background` + respect des safe areas (haut).
 * Évite d'appliquer `className` directement à SafeAreaView (non interopéré par
 * NativeWind) — on gère l'inset via `useSafeAreaInsets`.
 */
export function Screen({ className, style, ...props }: ViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={cn("flex-1 bg-background", className)}
      style={[{ paddingTop: insets.top }, style]}
      {...props}
    />
  );
}
