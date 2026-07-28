import { forwardRef } from "react";
import { View, TextInput, useColorScheme, type TextInputProps } from "react-native";
import { Text } from "./text";
import { cn } from "@/lib/cn";
import { getColors } from "@/theme/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

/** Champ de saisie avec libellé, aide et message d'erreur (compatible React Hook Form). */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, className, ...props },
  ref,
) {
  const scheme = useColorScheme();
  const placeholderColor = getColors(scheme).mutedForeground;

  return (
    <View className="gap-1.5">
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderColor}
        className={cn(
          "h-11 rounded-lg border bg-card px-3 text-base text-foreground font-sans",
          error ? "border-destructive" : "border-border",
          className,
        )}
        {...props}
      />
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : hint ? (
        <Text variant="small">{hint}</Text>
      ) : null}
    </View>
  );
});
