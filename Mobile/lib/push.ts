import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { router } from "expo-router";

import {
  enregistrerDispositif,
  desenregistrerDispositif,
  type Plateforme,
} from "@/services/api/dispositifs";

export type PushResult = "granted" | "denied" | "unsupported";

// Affiche les notifications reçues au premier plan (bannière + son).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let lastToken: string | null = null;

const getProjectId = (): string | undefined =>
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.easConfig?.projectId ??
  undefined;

/**
 * Demande la permission de notifications, récupère le token Expo et enregistre
 * le dispositif côté serveur (`POST /api/dispositifs/enregistrer`).
 */
export async function registerForPush(): Promise<PushResult> {
  if (!Device.isDevice) return "unsupported";

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return "denied";

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Général",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  try {
    const projectId = getProjectId();
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    lastToken = token;
    await enregistrerDispositif(token, Platform.OS as Plateforme);
  } catch (err) {
    if (__DEV__) console.warn("registerForPush:", (err as Error).message);
    // Token indisponible (Expo Go / projectId absent) : permission accordée quand même.
  }
  return "granted";
}

/**
 * Réenregistre le token au démarrage **sans** demander la permission
 * (uniquement si elle est déjà accordée). Silencieux et best-effort.
 */
export async function refreshPushToken(): Promise<void> {
  if (!Device.isDevice) return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;
  try {
    const projectId = getProjectId();
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    lastToken = token;
    await enregistrerDispositif(token, Platform.OS as Plateforme);
  } catch (err) {
    if (__DEV__) console.warn("refreshPushToken:", (err as Error).message);
  }
}

/** Désenregistre le dispositif courant (déconnexion). */
export async function unregisterPush(): Promise<void> {
  try {
    if (lastToken) await desenregistrerDispositif(lastToken);
  } catch {
    /* best-effort */
  }
}

/** Traduit les données d'une notification en route (deep linking). */
export function routeFromData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { type?: string; id?: number | string; slug?: string };
  switch (d.type) {
    case "rendezvous":
      return "/(public)/rendez-vous";
    case "anniversaire":
      return "/(member)/anniversaires";
    case "tache":
      return d.id ? `/(admin)/taches/${d.id}` : "/(admin)/taches";
    case "evenement":
      return d.slug ? `/(public)/evenements/${d.slug}` : "/(public)/evenements";
    case "blog":
      return d.slug ? `/(public)/spiritualite/${d.slug}` : "/(public)/spiritualite";
    case "correspondance":
      return "/(member)/notifications";
    case "newsletter":
      return "/(admin)/newsletters";
    default:
      return null;
  }
}

/**
 * Écoute les interactions avec les notifications (tap) et navigue vers l'écran
 * concerné, y compris au démarrage à froid (notification ayant lancé l'app).
 */
export function useNotificationNavigation() {
  const handled = useRef(false);

  useEffect(() => {
    const go = (data: unknown) => {
      const path = routeFromData(data);
      if (path) router.push(path as never);
    };

    Notifications.getLastNotificationResponseAsync().then((res) => {
      if (res && !handled.current) {
        handled.current = true;
        go(res.notification.request.content.data);
      }
    });

    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      go(res.notification.request.content.data);
    });
    return () => sub.remove();
  }, []);
}
