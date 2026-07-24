import * as Sentry from "@sentry/react-native";

/**
 * Initialise Sentry uniquement si un DSN est fourni (EXPO_PUBLIC_SENTRY_DSN).
 * Sans DSN : no-op (aucune télémétrie, pas d'erreur en dev/local).
 * Ne jamais logger de mot de passe/token (cf. CLAUDE.md §6).
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: __DEV__ ? 0 : 0.2,
    enabled: !__DEV__,
  });
}

/** HOC de navigation Sentry (passthrough si non initialisé). */
export const withSentry = Sentry.wrap;
