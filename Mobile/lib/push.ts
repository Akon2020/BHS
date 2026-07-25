import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export type PushResult = "granted" | "denied" | "unsupported";

/**
 * Demande la permission de notifications et enregistre le device token.
 * L'enregistrement côté serveur est mocké tant que le module backend §5.1
 * (POST /api/dispositifs/enregistrer) n'existe pas.
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

  try {
    // Token Expo (nécessite un projectId EAS / build de dev) — best-effort.
    await Notifications.getExpoPushTokenAsync();
  } catch {
    /* Expo Go / projectId absent : ignoré à ce stade (amorce). */
  }
  return "granted";
}
