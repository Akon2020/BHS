import { View, Image } from "react-native";
import { Text } from "./text";
import { cn } from "@/lib/cn";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

const initials = (name?: string) =>
  (name || "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

/** Avatar : photo si disponible, sinon initiales sur fond primaire. */
export function Avatar({ uri, name, size = 40, className }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className={cn("bg-muted", className)}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn("items-center justify-center bg-primary/15", className)}
    >
      <Text
        className="font-semibold text-primary"
        style={{ fontSize: size * 0.4 }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}
