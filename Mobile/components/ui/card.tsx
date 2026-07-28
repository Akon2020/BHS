import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/cn";

/** Conteneur de contenu — surface `card`, bordure douce, rayon cohérent avec le web. */
export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        className,
      )}
      {...props}
    />
  );
}
