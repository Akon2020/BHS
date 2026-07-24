import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { colorScheme as nwColorScheme } from "nativewind";
import {
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
  type Theme,
} from "@react-navigation/native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  CrimsonPro_600SemiBold,
  CrimsonPro_700Bold,
} from "@expo-google-fonts/crimson-pro";

import type { ErrorBoundaryProps } from "expo-router";
import { queryClient, asyncStoragePersister } from "@/lib/query-client";
import { useSession } from "@/stores/session";
import { usePreferences } from "@/stores/preferences";
import { getColors } from "@/theme/colors";
import { initSentry, withSentry } from "@/lib/sentry";
import { ToastHost } from "@/components/ui/toast";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { ErrorScreen } from "@/components/ui/error-screen";

initSentry();

// Borne d'erreur globale (expo-router) : tout crash de rendu affiche cet écran.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <ErrorScreen message={error.message} onRetry={retry} />
    </SafeAreaProvider>
  );
}

void SplashScreen.preventAutoHideAsync();

function buildNavTheme(scheme: "light" | "dark" | null | undefined): Theme {
  const c = getColors(scheme);
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background,
      card: c.card,
      text: c.foreground,
      border: c.border,
      notification: c.primary,
    },
  };
}

function RootLayout() {
  const systemScheme = useColorScheme();
  const bootstrap = useSession((s) => s.bootstrap);
  const status = useSession((s) => s.status);
  const themeMode = usePreferences((s) => s.themeMode);
  const prefsHydrated = usePreferences((s) => s.hydrated);

  // Thème effectif : préférence utilisateur, sinon système.
  const scheme = themeMode === "system" ? systemScheme : themeMode;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    CrimsonPro_600SemiBold,
    CrimsonPro_700Bold,
  });

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Applique le mode de thème choisi aux classes NativeWind.
  useEffect(() => {
    nwColorScheme.set(themeMode);
  }, [themeMode]);

  const ready = fontsLoaded && status !== "loading" && prefsHydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <ThemeProvider value={buildNavTheme(scheme)}>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }} />
            <OfflineBanner />
            <ToastHost />
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default withSentry(RootLayout);
