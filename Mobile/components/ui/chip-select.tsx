import { View, Pressable } from "react-native";
import { Text } from "./text";
import { cn } from "@/lib/cn";

interface ChipSelectProps<T extends string> {
  label?: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}

/** Sélecteur à pastilles (énumérations courtes). */
export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChipSelectProps<T>) {
  return (
    <View className="gap-1.5">
      {label ? <Text variant="label">{label}</Text> : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={cn(
                "rounded-full border px-3 py-1.5",
                active ? "border-primary bg-primary/10" : "border-border",
              )}
            >
              <Text className={cn("text-sm", active && "font-medium text-primary")}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
