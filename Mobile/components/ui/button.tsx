import { Pressable, ActivityIndicator, type PressableProps } from "react-native";
import { Text } from "./text";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "destructive";
type Size = "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const CONTAINER: Record<Variant, string> = {
  primary: "bg-primary active:opacity-90",
  outline: "border border-border bg-transparent active:bg-accent",
  ghost: "bg-transparent active:bg-accent",
  destructive: "bg-destructive active:opacity-90",
};

const LABEL: Record<Variant, string> = {
  primary: "text-primary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-destructive-foreground",
};

const SIZE: Record<Size, string> = {
  md: "h-11 px-4",
  lg: "h-13 px-6",
};

const SPINNER: Record<Variant, string> = {
  primary: "#fcfcfc",
  outline: "#900d30",
  ghost: "#900d30",
  destructive: "#fcfcfc",
};

/** Bouton principal. Cible tactile ≥ 44 px, état de chargement géré. */
export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-lg",
        SIZE[size],
        CONTAINER[variant],
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={SPINNER[variant]} />}
      <Text className={cn("font-semibold", LABEL[variant])}>{label}</Text>
    </Pressable>
  );
}
