import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";

interface PreferencesState {
  themeMode: ThemeMode;
  onboardingDone: boolean;
  biometricEnabled: boolean;
  /** Hydratation du store persistant terminée (évite le flash au démarrage). */
  hydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setOnboardingDone: (done: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setHydrated: () => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      themeMode: "system",
      onboardingDone: false,
      biometricEnabled: false,
      hydrated: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setOnboardingDone: (onboardingDone) => set({ onboardingDone }),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "bhs_preferences",
      storage: createJSONStorage(() => AsyncStorage),
      // On ne persiste que les vraies préférences (pas le flag d'hydratation).
      partialize: (s) => ({
        themeMode: s.themeMode,
        onboardingDone: s.onboardingDone,
        biometricEnabled: s.biometricEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
