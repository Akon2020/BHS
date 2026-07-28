/**
 * Palette portée depuis Frontend/app/globals.css (thème crimson).
 * Valeurs OKLCH du web converties en hex sRGB (React Native ne rend pas oklch).
 * Source de vérité des classes NativeWind : global.css. Ce fichier expose les
 * mêmes valeurs pour les usages hors NativeWind (React Navigation, StatusBar,
 * couleurs d'icônes, graphiques).
 */

export interface Palette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export const lightColors: Palette = {
  background: "#fcfcfc",
  foreground: "#0e0e13",
  card: "#ffffff",
  cardForeground: "#0e0e13",
  popover: "#ffffff",
  popoverForeground: "#0e0e13",
  primary: "#900d30",
  primaryForeground: "#fcfcfc",
  secondary: "#f1f1f4",
  secondaryForeground: "#17161d",
  muted: "#f1f1f4",
  mutedForeground: "#686871",
  accent: "#f1f1f4",
  accentForeground: "#17161d",
  destructive: "#e7000b",
  destructiveForeground: "#fcfcfc",
  border: "#e4e4e7",
  input: "#e4e4e7",
  ring: "#900d30",
  chart1: "#900d30",
  chart2: "#009689",
  chart3: "#104e64",
  chart4: "#ffb900",
  chart5: "#fe9a00",
};

export const darkColors: Palette = {
  background: "#050509",
  foreground: "#f8f8fa",
  card: "#0b0b0f",
  cardForeground: "#f8f8fa",
  popover: "#0b0b0f",
  popoverForeground: "#f8f8fa",
  primary: "#ce3e57",
  primaryForeground: "#f8f8fa",
  secondary: "#15151b",
  secondaryForeground: "#f8f8fa",
  muted: "#15151b",
  mutedForeground: "#9797a0",
  accent: "#15151b",
  accentForeground: "#f8f8fa",
  destructive: "#d40c1a",
  destructiveForeground: "#f8f8fa",
  border: "#1f1f25",
  input: "#1f1f25",
  ring: "#ce3e57",
  chart1: "#ce3e57",
  chart2: "#00bc7d",
  chart3: "#fe9a00",
  chart4: "#ad46ff",
  chart5: "#ff2056",
};

export const getColors = (scheme: "light" | "dark" | null | undefined): Palette =>
  scheme === "dark" ? darkColors : lightColors;
