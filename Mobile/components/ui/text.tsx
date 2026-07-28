import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/lib/cn";

type Variant = "body" | "muted" | "label" | "small";

interface AppTextProps extends TextProps {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  body: "text-base text-foreground font-sans",
  muted: "text-sm text-muted-foreground font-sans",
  label: "text-sm text-foreground font-medium",
  small: "text-xs text-muted-foreground font-sans",
};

/** Texte de corps, aligné sur la typographie du web (Inter). */
export function Text({ variant = "body", className, ...props }: AppTextProps) {
  return <RNText className={cn(VARIANTS[variant], className)} {...props} />;
}

interface HeadingProps extends TextProps {
  level?: 1 | 2 | 3;
}

const HEADINGS: Record<1 | 2 | 3, string> = {
  1: "text-3xl text-foreground font-serif-bold",
  2: "text-2xl text-foreground font-serif",
  3: "text-lg text-foreground font-semibold",
};

/** Titre en serif (Crimson Pro), même hiérarchie que le web. */
export function Heading({ level = 1, className, ...props }: HeadingProps) {
  return <RNText className={cn(HEADINGS[level], className)} {...props} />;
}
